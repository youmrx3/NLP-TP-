# NLP Practical Work — Darija: synthetic corpus + classification

**Group 2 · NLP, Dialects & Disinformation**
Members: Kadouria Youcef · Atia Nour · Islam Cherif El Khir

The whole project fits in **a single file**: `nlp_tp_darija.ipynb` (code commented line by line, results already displayed). No LLM, no API key and no internet access are needed to run it.

> ⚠️ **To do before the defence**: the 68 "gold" sentences (section 3 of the notebook, dictionary `SEEDS`) were drafted with the help of an LLM. Review them as native speakers: is the label right? is the sentence natural? Correct them directly in the notebook. The corpus `data/corpus_llm_*.csv` was also written by an LLM (Claude).

---

## Contents
1. [The subject in plain words](#1-the-subject-in-plain-words)
2. [Folder contents, file by file](#2-folder-contents-file-by-file)
3. [Step-by-step installation (Windows)](#3-step-by-step-installation-windows)
4. [Running the notebook](#4-running-the-notebook)
5. [The notebook section by section](#5-the-notebook-section-by-section)
6. [The data: file formats](#6-the-data-file-formats)
7. [The results: where to find them and how to read them](#7-the-results)
8. [Modifying the project](#8-modifying-the-project)
9. [The presentations](#9-the-presentations)
10. [Publishing on GitHub](#10-publishing-on-github)
11. [Frequent problems](#11-frequent-problems)
12. [Honest limits](#12-honest-limits)

---

## 1. The subject in plain words

| Word | Meaning |
|---|---|
| **Darija** | Algerian dialectal Arabic, written in Arabic script, in *arabizi* (Latin letters + digits: `3`=ع, `7`=ح, `9`=ق, `5`=خ) or mixed with French (*code-switching*). |
| **NLG** | *Natural Language Generation*: an LLM **writes** sentences in Darija, each with an intended label (positive / negative / neutral, or fake / real). |
| **NLU** | *Natural Language Understanding*: a classifier **recovers the label** of a sentence. |
| **Gold** | A small set of reference sentences (48 for sentiment, 20 for disinformation). |

**Question asked:** if we train a classifier on a corpus written by an LLM, does it understand real reference sentences?

**Method:** 4 experiments, always tested on the gold.

| Case | Training | Test |
|---|---|---|
| A | gold only | gold (cross-validation) |
| B | template corpus (repetitive) | gold |
| C | corpus written by the LLM | gold |
| D | gold + LLM corpus | gold (cross-validation) |

## 2. Folder contents, file by file

```
nlp tp/
├── nlp_tp_darija.ipynb               ← THE project
├── requirements.txt                  list of Python libraries to install
├── README.md                         this file
├── LICENSE                           MIT licence
├── .gitignore                        files Git ignores (.venv, caches…)
├── data/
│   ├── corpus_llm_sentiment.csv      90 sentences written by an LLM (30 per class)   [INPUT]
│   ├── corpus_llm_disinfo.csv        50 sentences (25 fake, 25 real)                  [INPUT]
│   └── predictions_*.csv             outputs: each sentence + its prediction          [OUTPUT]
├── results/
│   ├── metrics_*.json                accuracy, F1, confusion matrices                 [OUTPUT]
│   ├── utility_*.json                results of the 4 experiments A–D                 [OUTPUT]
│   └── confusion_*.png               images of the confusion matrices                 [OUTPUT]
└── presentation/
    ├── index.html                    15-minute presentation (animated)
    ├── equipe.html                   detailed guide for the team (42 slides)
    └── assets/deck.css, deck.js      slide engine (style and animations)
```
`[OUTPUT]` files are recreated at each run: they can be deleted safely. `[INPUT]` files must be kept.

## 3. Step-by-step installation (Windows)

### 3.1 Install Python
1. Go to **python.org → Downloads**, download Python 3.10 or newer.
2. Run the installer and **tick "Add python.exe to PATH"** (box at the bottom of the first window), then *Install Now*.
3. Open a terminal (Windows key, type `cmd`, Enter) and check:
   ```
   python --version
   ```
   It must print `Python 3.x.x`. If "python is not recognized": reinstall and tick the PATH box.

### 3.2 Go to the project folder
```
cd "C:\Users\YOU-BER\Desktop\nlp tp"
```
`cd` = *change directory*. The quotes are mandatory because the path contains a space.

### 3.3 Create a virtual environment (only once)
```
python -m venv .venv
```
Creates a hidden `.venv` folder containing an isolated copy of Python: libraries installed for this project do not affect the rest of the PC.

### 3.4 Activate it (redo in every new terminal)
```
.venv\Scripts\activate
```
The terminal shows `(.venv)` at the start of the line. In **PowerShell**, if an error mentions "scripts disabled", run once:
```
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
then try again (or use `cmd` instead).

### 3.5 Install the libraries
```
pip install -r requirements.txt
```
`pip` is Python's installer; `-r requirements.txt` tells it to read the list from the file. What each line installs:

| Package | Role in the project |
|---|---|
| `pandas` | Handle the tables of sentences (columns `text`, `label`…) |
| `scikit-learn` | TF-IDF, logistic regression, cross-validation, metrics |
| `matplotlib` | Draw the charts and confusion matrices |
| `notebook` | Open the `.ipynb` in the browser (Jupyter) |
| `ipykernel` | The engine that runs the cells (also needed in VS Code) |

Installation takes 1 to 3 minutes. Check: `pip list` must show these packages.

### 3.6 Linux / macOS (if needed)
```
cd path/to/nlp\ tp
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 4. Running the notebook

### Option A — Jupyter in the browser
```
jupyter notebook nlp_tp_darija.ipynb
```
The browser opens on the notebook. **Important:** the terminal must be in the project folder (the notebook looks for `data/` next to itself).

### Option B — VS Code
1. Install the **Jupyter** (and **Python**) extension in VS Code.
2. *File → Open Folder…* → choose `nlp tp`.
3. Open `nlp_tp_darija.ipynb`.
4. Top right: **Select Kernel → Python Environments → `.venv`**.

### Run
- **Everything at once:** menu *Run → Run All Cells* (Jupyter) or the *Run All* button (VS Code). Duration: a few seconds.
- **Cell by cell:** select a cell and press `Shift + Enter`. Always **in order**, top to bottom.
- **Start from scratch:** *Kernel → Restart & Run All*.
- Stop Jupyter: `Ctrl + C` in the terminal.

## 5. The notebook section by section

| § | Content | What it does |
|---|---|---|
| 1 | **Imports** | Loads `pandas`, `matplotlib`, `scikit-learn`, `json`, `random`, `re`, `pathlib`. Every line is commented. |
| 2 | **Configuration** | The only settings: `TASK` (`"sentiment"` or `"disinfo"`), `GEN_MODE` (`"file"` = provided LLM corpus, `"offline"` = templates), `N_PER_LABEL` (sentences per class in offline mode), `RANDOM_SEED = 42` (same seed = same results). Also defines the folders `data/` and `results/`. |
| 3 | **Gold** | Dictionary `SEEDS`: the reference sentences by task and class. `gold_dataframe(task)` turns them into a table (`text`, `label`, `source="gold"`). |
| 4 | **NLG** | `build_prompt` shows the prompt that made the LLM write the corpus (role, constraints, examples, JSON format). `generate_offline` builds a template corpus (point of comparison). `load_corpus_file` reads the provided CSV. Checks: **0 shared sentences** between corpus and gold (anti-leakage) and **script mix** (`script_type`). |
| 5 | **NLU** | `make_baseline()` = TF-IDF on character n-grams (2 to 5 letters, `char_wb`, `sublinear_tf=True`) + `LogisticRegression(max_iter=2000, C=5.0)`. `predict_baseline` trains it on the gold and predicts. |
| 6 | **Evaluation** | `evaluate` (accuracy, macro F1, per-class report, matrix), `show_confusion` (drawing), `cv_gold` (4-fold cross-validation on the gold, with an `extra=` option to add the LLM corpus to training without ever putting it in the test fold), `get_errors`. |
| 7 | **Pipeline** | `evaluate_classifier`: predicts on the corpus, evaluates on the corpus **and** on the gold, saves `predictions_*.csv` and `metrics_*.json`. |
| 8 | **Usefulness of the corpus** | The experiment A/B/C/D (see §1) with table and chart. Writes `results/utility_sentiment.json`. |
| 9 | **Disinformation** | Same pipeline and the same 4 experiments for fake / real. |
| 10 | **Your own sentence** | Change `my_text` and `my_task`: shows the predicted class and the probability of each class. |
| 11 | **Presentation update** | Rewrites the bars of `presentation/index.html` with the figures of `results/utility_*.json`. |
| 12 | **Glossary & limits** | Definitions and limits to quote in front of the jury. |

**Understanding the classifier in 4 lines:** (1) the sentence is cut into pieces of 2 to 5 letters ("mli7a" → `ml`, `li`, `i7`, `mli`…); (2) each piece is weighted by TF-IDF (a rare and typical piece counts more); (3) logistic regression adds up the learned weights and gives one probability per class; (4) the most probable class is the prediction. Character n-grams recognise spelling variants (`mli7a` / `mliha` / `مليحة`).

## 6. The data: file formats

`data/corpus_llm_*.csv` — 3 columns, UTF-8 encoding (with BOM, readable in Excel):

| Column | Content |
|---|---|
| `text` | The sentence in Darija |
| `label` | `positive` / `negative` / `neutral` (sentiment) or `fake` / `real` (disinformation) |
| `source` | Origin: `llm-claude` for the provided corpus |

To add sentences: open the CSV, add rows `text,label,llm-claude`, save as **UTF-8 CSV**, run again. Check that no sentence is also in the gold (the notebook checks it).

`data/predictions_*.csv`: same columns + `pred` (the prediction). The name follows the pattern `predictions_<task>_<corpus>_baseline.csv`.

## 7. The results

- **Accuracy** = share of correct answers. **Macro F1** = average of the F1 of each class (precision and recall combined).
- **Confusion matrix**: rows = actual class, columns = predicted class; the diagonal = correct answers.

Results obtained (accuracy on the gold):

| Case | Sentiment (48 sentences) | Disinformation (20 sentences) |
|---|---|---|
| A · gold only | 35.4% | 55% |
| B · templates → gold | 68.8% | 100% |
| C · LLM corpus → gold | 85.4% | 95% |
| D · gold + LLM corpus | 79.2% | 95% |

**Careful reading:** with 48 test sentences, the margin of error is about ±10 points; C and D cannot be distinguished. With 20 sentences, 1 sentence = 5 points. The large gap A → C (35% → 85%) is however reliable. In disinformation, 100% with templates is an **alarm signal**: the model learns the *style* of fake news ("عاجل", "partagez"), not the truth.

## 8. Modifying the project

| I want to… | I do… |
|---|---|
| Review / correct the gold | Section 3: edit the lists of `SEEDS`, then run again from section 4 (the leakage check must print 0), then 7, 8, 9 and 11. |
| Process disinformation | Section 2: `TASK = "disinfo"`, then run again from section 7. |
| See a template corpus | Section 2: `GEN_MODE = "offline"`, adjust `N_PER_LABEL`. |
| Test my sentence | Section 10: change `my_text`. |
| Change the classifier | Section 5, function `make_baseline` (e.g. `ngram_range=(1, 4)` or `C=1.0`). |
| Change the number of folds | Section 6, function `cv_gold`: `n_splits=4`. |

## 9. The presentations

Open `presentation/index.html` (double-click) in Chrome or Edge.

| Key | Action |
|---|---|
| `→` / `Space` / `Enter` | Next slide or next element |
| `←` | Back |
| `N` | Show the speaker notes / detailed explanations |
| `T` | Timer |
| `F` | Fullscreen |

- `index.html`: 14 slides, 14 minutes, to present to the jury. Replace `<your-account>` on the last slide with your GitHub link.
- `equipe.html`: internal guide, 42 slides, with a beginner introduction (Part 0), 4 interactive tools (n-grams, template generator, cross-validation, confusion matrix) and long explanations. **Read the notes (`N`) on every slide.**
- The result bars of `index.html` are updated by section 11 of the notebook.

## 10. Publishing on GitHub

```
git init
git add .
git commit -m "NLP practical work Darija"
git branch -M main
git remote add origin https://github.com/youmrx3/NLP-TP-.git
git push -u origin main
```
`.gitignore` already excludes `.venv`. Never publish an API key.

## 11. Frequent problems

| Symptom | Cause / solution |
|---|---|
| `python` is not recognized | Reinstall Python ticking "Add to PATH" |
| `(.venv)` does not appear | Redo `.venv\Scripts\activate` in the project folder |
| PowerShell refuses to activate | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `ModuleNotFoundError: pandas` (or another) | Activate `.venv` then `pip install -r requirements.txt`; in VS Code, choose the `.venv` kernel |
| `FileNotFoundError: ...corpus_llm_...csv` | The notebook must be in the project folder, next to `data/`; launch `jupyter notebook` from that folder |
| Arabic text broken in Excel | Import/save as **UTF-8** CSV |
| Numbers do not move in the presentation | Run sections 8 and 9, then 11, then refresh the page (`Ctrl+F5`) |
| Results differ from ours | Check `RANDOM_SEED = 42` and do not modify the gold or the corpus |
| The notebook seems "frozen" | *Kernel → Restart & Run All* |

## 12. Honest limits

- Small gold (48 / 20 sentences): margin of error of about ±10 points or more.
- Gold and corpus written with the help of an LLM, in the same spirit: an easier test than real Darija collected on social media.
- Synthetic labels = **intention** of the prompt, not verified by several human annotators.
- Disinformation: detection of the **style**, not of the truth of the facts.
- The classifier does not understand negation (e.g. "mchi mliha" classified positive).
- Next steps: review of the gold by native speakers, more test data, annotation by 2 people, comparison with a pre-trained model (XLM-R, DziriBERT) or a few-shot LLM.

Licence: MIT.
