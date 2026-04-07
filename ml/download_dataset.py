"""
AI-Based Plant/Crop Disease Detection System
Dataset Download Script — Auto-downloads PlantVillage from Kaggle
Mekelle Institute of Technology 2026

Run: python download_dataset.py
"""

import os
import sys
import zipfile
import shutil
from pathlib import Path

DATA_DIR = Path("data/plantvillage")

def check_kaggle():
    try:
        import kaggle
        return True
    except ImportError:
        return False

def download_via_kaggle():
    print("[1/3] Downloading PlantVillage dataset from Kaggle (~1.5 GB)...")
    os.system("kaggle datasets download -d vipoooool/new-plant-diseases-dataset --path data/")

    print("[2/3] Extracting...")
    zip_path = Path("data/new-plant-diseases-dataset.zip")
    if zip_path.exists():
        with zipfile.ZipFile(zip_path, 'r') as z:
            z.extractall("data/")
        zip_path.unlink()
        print("      Extracted successfully")
    else:
        print("      ERROR: zip not found. Check your Kaggle credentials.")
        sys.exit(1)

    print("[3/3] Organising into plantvillage/ folder...")
    # Kaggle dataset extracts to:
    #   data/New Plant Diseases Dataset(Augmented)/train/  and  /valid/
    src_train = Path("data/New Plant Diseases Dataset(Augmented)/train")
    src_valid = Path("data/New Plant Diseases Dataset(Augmented)/valid")

    if src_train.exists():
        shutil.move(str(src_train), str(DATA_DIR / "train"))
    if src_valid.exists():
        shutil.move(str(src_valid), str(DATA_DIR / "val"))

    # Clean up
    for leftover in Path("data").glob("New Plant*"):
        shutil.rmtree(leftover)

    print("\n[✓] Dataset ready at data/plantvillage/")
    print_summary()


def download_via_tfds():
    """Fallback: download via TensorFlow Datasets (no Kaggle account needed)"""
    print("[INFO] Downloading via TensorFlow Datasets (no Kaggle needed)...")
    try:
        import tensorflow_datasets as tfds
        import tensorflow as tf

        DATA_DIR.mkdir(parents=True, exist_ok=True)

        ds, info = tfds.load(
            'plant_village',
            split=['train'],
            with_info=True,
            as_supervised=True,
        )
        print(f"[✓] Loaded {info.splits['train'].num_examples} images")
        print(f"[✓] Classes: {info.features['label'].names}")

        # Save each image to the correct folder
        label_names = info.features['label'].names
        for split_name, dataset in [('train', ds[0])]:
            for i, (image, label) in enumerate(dataset):
                class_name = label_names[label.numpy()]
                out_dir = DATA_DIR / split_name / class_name
                out_dir.mkdir(parents=True, exist_ok=True)
                img_path = out_dir / f"{i:06d}.jpg"
                tf.keras.utils.save_img(str(img_path), image.numpy())
                if i % 500 == 0:
                    print(f"  Saved {i} images...")

        print("[✓] Done! Now run: python preprocessing.py")

    except Exception as e:
        print(f"[ERROR] {e}")
        print("Please use Option 1 (Kaggle) or Option 3 (manual download).")


def print_summary():
    if not DATA_DIR.exists():
        print("[!] Dataset folder not found yet.")
        return
    total = 0
    classes = []
    for split in ["train", "val", "test"]:
        split_dir = DATA_DIR / split
        if split_dir.exists():
            split_classes = [d.name for d in split_dir.iterdir() if d.is_dir()]
            count = sum(len(list(d.glob("*.jpg")) + list(d.glob("*.png")))
                        for d in split_dir.iterdir() if d.is_dir())
            print(f"  {split:6s}: {count:6d} images, {len(split_classes)} classes")
            total += count
            classes = split_classes
    print(f"  TOTAL : {total} images")
    print(f"\n  Sample classes: {classes[:5]}...")


if __name__ == "__main__":
    print("=" * 55)
    print("  CropGuard AI — Dataset Downloader")
    print("  Mekelle Institute of Technology 2026")
    print("=" * 55)

    print("""
Choose download method:
  1  Kaggle API  (fastest, best quality — needs free account)
  2  TensorFlow Datasets  (no account needed, slower)
  3  Manual  (show me the manual download links)
""")
    choice = input("Enter 1, 2, or 3: ").strip()

    if choice == "1":
        if not check_kaggle():
            print("[!] kaggle not installed. Run: pip install kaggle")
            print("[!] Then place kaggle.json at ~/.kaggle/kaggle.json")
            sys.exit(1)
        download_via_kaggle()

    elif choice == "2":
        try:
            import tensorflow_datasets
        except ImportError:
            print("[!] Run: pip install tensorflow-datasets")
            sys.exit(1)
        download_via_tfds()

    elif choice == "3":
        print("""
Manual download links:
─────────────────────────────────────────────────────
Option A — Kaggle (recommended, free account required):
  https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset
  → Download ZIP → extract into:  ml/data/plantvillage/

Option B — GitHub (smaller subset, no account needed):
  https://github.com/spMohanty/PlantVillage-Dataset
  → Clone the repo, copy the 'raw/color' folder into:
    ml/data/plantvillage/train/

Option C — Direct Google Drive (full dataset, ~1.5 GB):
  https://drive.google.com/file/d/1NCGKZ-MwL6xXPCF-9DKcQaEzKWGTk4_g

After downloading, your folder must look like:
  ml/data/plantvillage/
    train/
      Tomato___Early_blight/   img1.jpg  img2.jpg ...
      Wheat___Leaf_rust/       ...
      Maize___Healthy/         ...
      ...
    val/
      (same structure)
─────────────────────────────────────────────────────
Then run:  python preprocessing.py
""")
    else:
        print("Invalid choice.")
