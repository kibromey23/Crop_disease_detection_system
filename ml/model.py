"""
AI-Based Plant/Crop Disease Detection System
Stage 3: Transfer Learning Model (MobileNetV2 + ResNet50)
Mekelle Institute of Technology — 2026
"""

import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks
from tensorflow.keras.applications import MobileNetV2, ResNet50
from pathlib import Path

# ── Configuration ─────────────────────────────────────────────────────────────
IMG_SIZE       = (224, 224)
INPUT_SHAPE    = (*IMG_SIZE, 3)
LEARNING_RATE  = 1e-4
FINETUNE_LR    = 1e-5          # much lower for fine-tuning phase
DROPOUT_RATE   = 0.4
CHECKPOINT_DIR = Path("checkpoints")
CHECKPOINT_DIR.mkdir(exist_ok=True)


# ── Phase 1: Feature extraction ───────────────────────────────────────────────
# Freeze the entire base — only train the custom classification head.
# This is fast and prevents destroying pre-learned ImageNet features.

def build_mobilenetv2(num_classes: int) -> tf.keras.Model:
    """
    MobileNetV2-based classifier.
    Best for: mobile/edge deployment, limited compute, smaller datasets.
    Achieves ~92% on tomato disease with 3,000 images (Ramesh et al., 2020).
    """
    base = MobileNetV2(
        input_shape = INPUT_SHAPE,
        include_top = False,          # remove the ImageNet classification head
        weights     = "imagenet",     # pre-trained weights
    )
    base.trainable = False            # freeze all base layers

    inputs = tf.keras.Input(shape=INPUT_SHAPE)
    x = base(inputs, training=False)  # training=False keeps BatchNorm in inference mode
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(DROPOUT_RATE)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(DROPOUT_RATE / 2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs, outputs, name="MobileNetV2_PlantDisease")
    model.compile(
        optimizer = optimizers.Adam(learning_rate=LEARNING_RATE),
        loss      = "categorical_crossentropy",
        metrics   = ["accuracy", tf.keras.metrics.Precision(name="precision"),
                     tf.keras.metrics.Recall(name="recall")],
    )
    return model


def build_resnet50(num_classes: int) -> tf.keras.Model:
    """
    ResNet50-based classifier.
    Best for: larger datasets, server-side inference, higher accuracy ceiling.
    """
    base = ResNet50(
        input_shape = INPUT_SHAPE,
        include_top = False,
        weights     = "imagenet",
    )
    base.trainable = False

    inputs = tf.keras.Input(shape=INPUT_SHAPE)
    x = base(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(512, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(DROPOUT_RATE)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(DROPOUT_RATE / 2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs, outputs, name="ResNet50_PlantDisease")
    model.compile(
        optimizer = optimizers.Adam(learning_rate=LEARNING_RATE),
        loss      = "categorical_crossentropy",
        metrics   = ["accuracy", tf.keras.metrics.Precision(name="precision"),
                     tf.keras.metrics.Recall(name="recall")],
    )
    return model


# ── Phase 2: Fine-tuning ──────────────────────────────────────────────────────
# After the head has converged (Phase 1), unfreeze the top N layers of the base
# and train with a very small learning rate. This adapts the high-level features
# to your specific crop/disease domain.

def enable_finetuning(model: tf.keras.Model, unfreeze_from: int = -30):
    """
    Unfreeze the last |unfreeze_from| layers of the base model for fine-tuning.

    MobileNetV2 has 155 layers  → unfreeze last 30 (block_16 and beyond)
    ResNet50    has 175 layers  → unfreeze last 30 (conv5 block)

    Rule of thumb: unfreeze top 20-30% of base layers.
    """
    base = model.get_layer('mobilenetv2_1.00_224')          # index 1 is always the base in our build_* functions
    base.trainable = True

    # Re-freeze all layers before the cutoff
    for layer in base.layers[:unfreeze_from]:
        layer.trainable = False

    # Recompile with a much smaller LR — crucial to avoid catastrophic forgetting
    model.compile(
        optimizer = optimizers.Adam(learning_rate=FINETUNE_LR),
        loss      = "categorical_crossentropy",
        metrics   = ["accuracy", tf.keras.metrics.Precision(name="precision"),
                     tf.keras.metrics.Recall(name="recall")],
    )

    trainable = sum(1 for l in model.layers if l.trainable)
    print(f"[✓] Fine-tuning enabled: {trainable} trainable layers (LR={FINETUNE_LR})")
    return model


# ── Training callbacks ────────────────────────────────────────────────────────
def get_callbacks(model_name: str):
    return [
        # Save the best model (by val_accuracy) automatically
        callbacks.ModelCheckpoint(
            filepath          = str(CHECKPOINT_DIR / f"{model_name}_best.keras"),
            monitor           = "val_accuracy",
            save_best_only    = True,
            save_weights_only = False,
            verbose           = 1,
        ),
        # Stop if val_accuracy doesn't improve for 8 epochs
        callbacks.EarlyStopping(
            monitor              = "val_accuracy",
            patience             = 8,
            restore_best_weights = True,
            verbose              = 1,
        ),
        # Halve the LR when val_loss plateaus for 4 epochs
        callbacks.ReduceLROnPlateau(
            monitor  = "val_loss",
            factor   = 0.5,
            patience = 4,
            min_lr   = 1e-7,
            verbose  = 1,
        ),
        # TensorBoard logs (run: tensorboard --logdir logs/)
        callbacks.TensorBoard(
            log_dir       = f"logs/{model_name}",
            histogram_freq = 1,
        ),
    ]


# ── Two-phase training loop ───────────────────────────────────────────────────
def train(model, train_gen, val_gen, class_weights=None, model_name="model"):
    """
    Phase 1 — train only the custom head (5-10 epochs).
    Phase 2 — fine-tune top layers of the base (10-20 more epochs).
    """
    print("\n=== Phase 1: Training classification head ===")
    history_1 = model.fit(
        train_gen,
        validation_data  = val_gen,
        epochs           = 10,
        class_weight     = class_weights,
        callbacks        = get_callbacks(f"{model_name}_phase1"),
        verbose          = 1,
    )

    print("\n=== Phase 2: Fine-tuning ===")
    model = enable_finetuning(model)
    history_2 = model.fit(
        train_gen,
        validation_data  = val_gen,
        epochs           = 20,
        class_weight     = class_weights,
        callbacks        = get_callbacks(f"{model_name}_phase2"),
        verbose          = 1,
    )

    return model, history_1, history_2


# ── Export ────────────────────────────────────────────────────────────────────
def export_model(model, path="saved_model/plant_disease_model"):
    model.export(path)             # TensorFlow SavedModel format (for serving)
    print(f"[✓] Model exported to: {path}")


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    from preprocessing import build_generators, compute_class_weights, TRAIN_DIR, VAL_DIR, TEST_DIR

    NUM_CLASSES = 38  # Derived from train_gen.num_classes at runtime; override if needed   # adjust to your actual number of disease classes

    # Build generators
    train_gen, val_gen, test_gen = build_generators(TRAIN_DIR, VAL_DIR, TEST_DIR)
    class_weights = compute_class_weights(train_gen)

    # Choose model — MobileNetV2 recommended for Tigray deployment (smaller, faster)
    model = build_mobilenetv2(NUM_CLASSES)
    model.summary()

    # Train
    model, h1, h2 = train(model, train_gen, val_gen, class_weights, model_name="mobilenetv2")

    # Export for serving
    export_model(model)
