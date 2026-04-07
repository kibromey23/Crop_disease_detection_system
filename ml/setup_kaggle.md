# How to get the PlantVillage dataset

## Fastest way — Kaggle (free, 5 minutes)

### Step 1 — Create a free Kaggle account
Go to https://www.kaggle.com and sign up (free).

### Step 2 — Get your API key
1. Click your profile picture → **Account**
2. Scroll to **API** section → click **Create New Token**
3. A file called `kaggle.json` downloads automatically

### Step 3 — Place the API key
**Linux / Mac:**
```bash
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/kaggle.json
chmod 600 ~/.kaggle/kaggle.json
```

**Windows:**
```
Move kaggle.json to:  C:\Users\YOUR_NAME\.kaggle\kaggle.json
```

### Step 4 — Run the downloader
```bash
cd ml
pip install kaggle
python download_dataset.py
# Choose option 1
```

That's it. The script downloads, extracts, and organises everything automatically.

---

## No account? Use TensorFlow Datasets instead

```bash
cd ml
pip install tensorflow-datasets
python download_dataset.py
# Choose option 2
```

Slower but requires no account.

---

## What you get

After download, your folder looks like:

```
ml/data/plantvillage/
  train/                      (43,456 images)
    Apple___Apple_scab/
    Apple___Black_rot/
    Corn___Northern_Leaf_Blight/
    Tomato___Early_blight/
    Wheat___Leaf_rust/
    ... 38 classes total ...
  val/                        (10,849 images)
    (same classes)
```

## After download — next step

```bash
python preprocessing.py   # verify the data loads correctly
python model.py           # start training
```
