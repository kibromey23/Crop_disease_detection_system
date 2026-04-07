"""
evaluate.py — CropGuard AI
Mekelle Institute of Technology 2026

Evaluates the trained MobileNetV2 model and produces:
  • Accuracy, F1-score, per-class precision/recall
  • Confusion matrix (saved as PNG)
  • Classification report (saved as TXT)

Compatible with:
  • Keras 3 SavedModel format  (from Colab export)
  • .keras checkpoint files    (from local training)
  • Legacy TF SavedModel       (via TFSMLayer wrapper)
"""

import os
import glob
import numpy as np
import tensorflow as tf
import matplotlib
matplotlib.use("Agg")          # no display needed — saves files
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    f1_score,
)
from pathlib import Path

OUTPUT_DIR = Path("evaluation_outputs")
OUTPUT_DIR.mkdir(exist_ok=True)


# ── Load model — handles all formats ─────────────────────────────────────────
def load_best_model():
    """
    Tries multiple model locations and formats in priority order.
    Returns a callable model object regardless of format.
    """
    import json

    # Priority order
    candidates = [
        ("keras",      "saved_model/plant_disease_model"),
        ("keras",      "saved_model"),
        ("tfsm",       "saved_model/plant_disease_model"),
        ("tfsm",       "saved_model"),
    ] + [
        ("keras", p)
        for p in sorted(glob.glob("checkpoints/*.keras"),
                        key=os.path.getmtime, reverse=True)
    ]

    for fmt, path in candidates:
        if not os.path.exists(path):
            continue
        print(f"[evaluate] Trying {fmt} load: {path}")
        try:
            if fmt == "keras":
                model = tf.keras.models.load_model(path)
            else:  # tfsm — wraps legacy SavedModel for inference
                model = tf.keras.layers.TFSMLayer(
                    path, call_endpoint="serving_default"
                )
            print(f"[evaluate] ✓ Model loaded ({fmt}): {path}")
            return model, fmt
        except Exception as e:
            print(f"[evaluate]   ✗ {e}\n")

    print("\n[evaluate] ERROR — no model found.")
    print("Download from Google Drive → CropGuardAI/ → plant_disease_model/")
    print("Place in:  ml/saved_model/plant_disease_model/")
    raise SystemExit(1)


# ── Predict — works for both keras model and TFSMLayer ───────────────────────
def predict_generator(model, gen, fmt):
    """
    Returns predicted class indices for all images in the generator.
    Handles both standard Keras models and TFSMLayer (dict output).
    """
    all_probs = []
    gen.reset()
    steps = len(gen)
    for i, (batch_x, _) in enumerate(gen):
        out = model(batch_x, training=False)
        # TFSMLayer returns a dict; extract the output tensor
        if isinstance(out, dict):
            out = list(out.values())[0]
        all_probs.append(out.numpy())
        print(f"\r  Predicting batch {i+1}/{steps}", end="", flush=True)
        if i + 1 >= steps:
            break
    print()
    probs  = np.concatenate(all_probs, axis=0)
    y_pred = np.argmax(probs, axis=1)
    return y_pred


# ── Evaluation ────────────────────────────────────────────────────────────────
def evaluate_model(model, gen, fmt, label="validation"):
    y_true      = gen.classes[:gen.samples]  # use gen.samples — exact count, not len*batch_size
    class_names = list(gen.class_indices.keys())
    n_classes   = len(class_names)

    print(f"\n[evaluate] Running inference on {label} set "
          f"({gen.samples} images, {n_classes} classes)…")

    y_pred = predict_generator(model, gen, fmt)

    # Trim to same length (generator may produce slightly more)
    min_len = min(len(y_true), len(y_pred))
    y_true  = y_true[:min_len]
    y_pred  = y_pred[:min_len]

    acc = accuracy_score(y_true, y_pred)
    f1  = f1_score(y_true, y_pred, average="macro", zero_division=0)

    print(f"\n{'='*60}")
    print(f"  CropGuard AI — Evaluation Results ({label} set)")
    print(f"{'='*60}")
    print(f"  Accuracy     : {acc*100:.2f}%")
    print(f"  Macro F1     : {f1*100:.2f}%")
    print(f"  Images       : {min_len}")
    print(f"  Classes      : {n_classes}")
    print(f"{'='*60}\n")

    report = classification_report(
        y_true, y_pred,
        target_names=class_names,
        digits=4,
        zero_division=0,
    )
    print(report)

    # Save report to file
    report_path = OUTPUT_DIR / f"classification_report_{label}.txt"
    with open(report_path, "w") as f:
        f.write(f"CropGuard AI — Evaluation Report\n")
        f.write(f"Set: {label}  |  Accuracy: {acc*100:.2f}%  |  Macro F1: {f1*100:.2f}%\n")
        f.write("="*60 + "\n")
        f.write(report)
    print(f"[✓] Report saved → {report_path}")

    return y_true, y_pred, class_names


# ── Confusion matrix ──────────────────────────────────────────────────────────
def plot_confusion_matrix(y_true, y_pred, class_names, label="validation"):
    cm     = confusion_matrix(y_true, y_pred)
    cm_pct = cm.astype(float) / (cm.sum(axis=1, keepdims=True) + 1e-9)

    # Short class labels for readability
    short = [c.replace("___", "\n").replace("_", " ") for c in class_names]

    fig, axes = plt.subplots(1, 2, figsize=(20, 8))
    fig.suptitle(f"Confusion Matrix — CropGuard AI ({label} set)",
                 fontsize=14, y=1.01)

    for ax, data, title, fmt in [
        (axes[0], cm,     "Count",    "d"),
        (axes[1], cm_pct, "Normalised", ".2f"),
    ]:
        sns.heatmap(
            data, ax=ax,
            xticklabels=short, yticklabels=short,
            cmap="YlOrRd", fmt=fmt,
            annot=len(class_names) <= 20,   # only annotate if ≤20 classes
            linewidths=0.3, linecolor="white",
        )
        ax.set_title(title, fontsize=12)
        ax.set_xlabel("Predicted", fontsize=10)
        ax.set_ylabel("True",      fontsize=10)
        ax.tick_params(axis="both", labelsize=6)

    plt.tight_layout()
    path = OUTPUT_DIR / f"confusion_matrix_{label}.png"
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"[✓] Confusion matrix → {path}")


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    from preprocessing import build_generators, TRAIN_DIR, VAL_DIR, TEST_DIR

    # 1. Load model
    model, fmt = load_best_model()

    # 2. Build generators
    train_gen, val_gen, test_gen = build_generators(TRAIN_DIR, VAL_DIR, TEST_DIR)

    # 3. Choose evaluation set
    #    Use test set if it has all 38 classes, otherwise fall back to val set.
    n_test_classes = len(test_gen.class_indices)
    if n_test_classes < 38:
        print(f"\n[evaluate] ⚠ Test set only has {n_test_classes} class(es) "
              f"({test_gen.samples} images) — using validation set instead.")
        print("[evaluate]   (This is fine — validation set was never seen during training)\n")
        eval_gen   = val_gen
        eval_label = "validation"
    else:
        eval_gen   = test_gen
        eval_label = "test"

    # 4. Evaluate
    y_true, y_pred, class_names = evaluate_model(model, eval_gen, fmt, eval_label)

    # 5. Confusion matrix
    plot_confusion_matrix(y_true, y_pred, class_names, eval_label)

    print(f"\n[✓] All outputs saved in:  {OUTPUT_DIR}/")
    print("[✓] Evaluation complete.\n")
