"""
AI-Based Plant/Crop Disease Detection System
Stage 2: Data Preprocessing Pipeline
Mekelle Institute of Technology — 2026
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from pathlib import Path

# ── Configuration ─────────────────────────────────────────────────────────────
IMG_SIZE    = (224, 224)   # MobileNetV2 / ResNet50 default input size
BATCH_SIZE  = 32
SEED        = 42

DATA_DIR    = Path("data/plantvillage")   # your dataset root
TRAIN_DIR   = DATA_DIR / "train"
VAL_DIR     = DATA_DIR / "val"
TEST_DIR    = DATA_DIR / "test"


# ── Augmentation for training set ─────────────────────────────────────────────
# Aggressive augmentation helps generalise to real-world farm photos.
train_datagen = ImageDataGenerator(
    rescale            = 1.0 / 255.0,   # normalise pixel values to [0, 1]
    rotation_range     = 40,            # random rotations up to 40°
    width_shift_range  = 0.2,
    height_shift_range = 0.2,
    shear_range        = 0.15,
    zoom_range         = 0.2,
    horizontal_flip    = True,
    vertical_flip      = False,         # leaves don't grow upside-down
    brightness_range   = [0.7, 1.3],    # simulate different lighting conditions
    fill_mode          = "nearest",
)

# Validation and test sets — only rescale, no augmentation
eval_datagen = ImageDataGenerator(rescale=1.0 / 255.0)


# ── Data loaders ──────────────────────────────────────────────────────────────
def build_generators(train_dir, val_dir, test_dir):
    train_gen = train_datagen.flow_from_directory(
        train_dir,
        target_size  = IMG_SIZE,
        batch_size   = BATCH_SIZE,
        class_mode   = "categorical",
        shuffle      = True,
        seed         = SEED,
    )

    val_gen = eval_datagen.flow_from_directory(
        val_dir,
        target_size  = IMG_SIZE,
        batch_size   = BATCH_SIZE,
        class_mode   = "categorical",
        shuffle      = False,
    )

    test_gen = eval_datagen.flow_from_directory(
        test_dir,
        target_size  = IMG_SIZE,
        batch_size   = BATCH_SIZE,
        class_mode   = "categorical",
        shuffle      = False,
    )

    return train_gen, val_gen, test_gen


# ── Dataset splitting (if you have one flat directory) ────────────────────────
def split_dataset(source_dir: Path, split=(0.70, 0.15, 0.15)):
    """
    Splits a flat dataset directory into train/val/test sub-folders.
    source_dir/
        class_a/  img1.jpg  img2.jpg ...
        class_b/  ...
    """
    import shutil, random

    assert abs(sum(split) - 1.0) < 1e-6, "Split ratios must sum to 1.0"

    for class_folder in source_dir.iterdir():
        if not class_folder.is_dir():
            continue

        images = list(class_folder.glob("*.jpg")) + list(class_folder.glob("*.png"))
        random.seed(SEED)
        random.shuffle(images)

        n     = len(images)
        n_tr  = int(n * split[0])
        n_va  = int(n * split[1])

        splits = {
            "train": images[:n_tr],
            "val":   images[n_tr : n_tr + n_va],
            "test":  images[n_tr + n_va :],
        }

        for subset, files in splits.items():
            dest = DATA_DIR / subset / class_folder.name
            dest.mkdir(parents=True, exist_ok=True)
            for f in files:
                shutil.copy(f, dest / f.name)

    print("[✓] Dataset split complete")


# ── Class-weight balancing (handles imbalanced disease classes) ───────────────
def compute_class_weights(train_gen):
    from sklearn.utils.class_weight import compute_class_weight

    labels = train_gen.classes
    classes = np.unique(labels)

    weights = compute_class_weight(
        class_weight="balanced",
        classes=classes,
        y=labels,
    )
    return dict(zip(classes, weights))


# ── Quick sanity check ────────────────────────────────────────────────────────
if __name__ == "__main__":
    # 1. Split if needed
    if not TRAIN_DIR.exists():
        split_dataset(DATA_DIR)

    # 2. Build generators
    train_gen, val_gen, test_gen = build_generators(TRAIN_DIR, VAL_DIR, TEST_DIR)

    print(f"Classes  : {list(train_gen.class_indices.keys())}")
    print(f"Train    : {train_gen.samples} images")
    print(f"Val      : {val_gen.samples} images")
    print(f"Test     : {test_gen.samples} images")

    # 3. Sample one batch to verify shapes
    imgs, labels = next(train_gen)
    print(f"Batch    : images {imgs.shape}, labels {labels.shape}")
    print(f"Pixel range: [{imgs.min():.2f}, {imgs.max():.2f}]")
