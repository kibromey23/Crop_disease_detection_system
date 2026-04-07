"""
fix_test_set.py
Your current test/ folder only has 20 images in 1 class — that is wrong.
This script rebuilds it properly by taking 10% from each class in val/.
Run from inside ml/:  python fix_test_set.py
"""

import shutil
import random
from pathlib import Path

VAL_DIR  = Path("data/plantvillage/val")
TEST_DIR = Path("data/plantvillage/test")
SEED     = 42
SPLIT    = 0.10   # take 10% of each val class → test

random.seed(SEED)

# Remove the bad test folder first
if TEST_DIR.exists():
    shutil.rmtree(TEST_DIR)
    print("[✓] Removed old test/ folder")

total_moved = 0

for class_dir in sorted(VAL_DIR.iterdir()):
    if not class_dir.is_dir():
        continue

    images = (list(class_dir.glob("*.jpg")) +
              list(class_dir.glob("*.JPG")) +
              list(class_dir.glob("*.png")))

    random.shuffle(images)
    n_test = max(5, int(len(images) * SPLIT))  # at least 5 per class
    test_images = images[:n_test]

    dest = TEST_DIR / class_dir.name
    dest.mkdir(parents=True, exist_ok=True)

    for img in test_images:
        shutil.move(str(img), str(dest / img.name))

    total_moved += n_test
    print(f"  {class_dir.name[:50]:50s} → {n_test} images")

print(f"\n[✓] Done! {total_moved} images moved to test/")
print("\nFinal dataset split:")
for split in ["train", "val", "test"]:
    d = Path(f"data/plantvillage/{split}")
    if d.exists():
        classes = [c for c in d.iterdir() if c.is_dir()]
        count   = sum(
            len(list(c.glob("*.jpg")) + list(c.glob("*.JPG")) + list(c.glob("*.png")))
            for c in classes
        )
        print(f"  {split:6s}: {count:6,} images  |  {len(classes)} classes")

print("\nNow run:")
print("  python preprocessing.py")
print("  python model.py")
