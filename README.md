# Trader Behavior vs Market Sentiment
### Primetrade.ai — Data Science Intern Assignment

Analysis of how Bitcoin market sentiment (Fear & Greed Index) relates to
trader behavior and performance on the Hyperliquid DEX.
- **211,224 trades** · **32 traders** · **479 trading days** (May 2023 – May 2025)
- All 3 bonus tasks completed: predictive model, clustering, Streamlit dashboard

---

## Repository Structure

```
trader-sentiment-analysis/
│
├── notebook.ipynb                    ← Full analysis (37 cells, Phases 1–3 + Bonus)
├── dashboard.py                      ← Interactive Streamlit dashboard (6 pages)
├── README.md
├── summary.md                        ← One-page findings write-up
├── requirements.txt
│
├── data/
│   ├── raw/
│   │   ├── fear_greed_index.csv      ← Bitcoin Fear & Greed Index (2,644 rows)
│   │   └── historical_data.csv       ← Hyperliquid DEX trades (211,224 rows)
│   └── processed/
│       ├── fear_greed_clean.csv
│       ├── merged_trader_sentiment_v2.csv   ← Final merged dataset (2,340 rows)
│       ├── trader_daily_metrics_v2.csv
│       └── trader_profiles_final.csv        ← 32 trader profiles + archetypes
│
├── scripts/
│   ├── 01_data_preparation.py        ← Data loading, cleaning, metric creation
│   ├── 02_sentiment_analysis.py      ← Performance & behavior analysis + charts 1–5
│   ├── 03_enriched_analysis.py       ← Enriched analysis + strategy rules + charts 6–8
│   └── 04_bonus_model_clustering.py  ← RF model + K-Means clustering + charts 9–10
│
└── charts/
    ├── chart1_performance_by_sentiment.png
    ├── chart2_pnl_distribution.png
    ├── chart3_behavior_by_sentiment.png
    ├── chart4_segment_heatmap.png
    ├── chart5_winrate_vs_pnl.png
    ├── chart6_enriched_dashboard.png
    ├── chart7_segment_strategy.png
    ├── chart8_top5_timeline.png
    ├── chart9_random_forest.png       ← Bonus: Feature importance + ROC + CM
    └── chart10_clustering.png         ← Bonus: Elbow + Silhouette + PCA scatter
```

---

## Setup & How to Run

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/trader-sentiment-analysis.git
cd trader-sentiment-analysis
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the notebook
```bash
jupyter notebook notebook.ipynb
```
Run all cells top to bottom. Charts are saved to `charts/` automatically.

### 4. Launch the interactive dashboard
```bash
streamlit run dashboard.py
```
Opens at **http://localhost:8501** — all charts and models are live and dynamic.

---

## Datasets

| Dataset | Rows | Description |
|---|---|---|
| `fear_greed_index.csv` | 2,644 | Daily Bitcoin Fear & Greed score (0–100) + classification |
| `historical_data.csv` | 211,224 | Individual trade records from 32 Hyperliquid accounts |
| `merged_trader_sentiment_v2.csv` | 2,340 | Daily trader metrics joined with sentiment (final dataset) |

> **Data fix applied:** The raw `Timestamp` (ms) column produced only 7 unique dates.
> The human-readable `Timestamp IST` column was used instead, unlocking **480 trading days**.

---

## Part A — Data Preparation

- Loaded both datasets and documented shape, missing values, and duplicates
- Standardised account addresses, side (BUY/SELL), and PnL column names
- Computed daily metrics per trader: PnL, trade count, win rate, avg trade size,
  long/short ratio, long count, short count
- Sentiment simplified to 3 buckets: **Fear** (Extreme Fear + Fear),
  **Neutral**, **Greed** (Greed + Extreme Greed)
- Merged on date → **2,340 trader-day rows** across **479 matched days**
- Leverage column was all zeros in source data — documented as a limitation

---

## Part B — Analysis & Key Findings

### Finding 1 — Fear days generate higher PnL (+25%)

| Sentiment | Avg Daily PnL | Avg Win Rate | Avg Trades/Day | % Profitable |
|---|---|---|---|---|
| **Fear** | **$5,185** | 35.7% | 105 | 60% |
| Neutral | $3,439 | 35.5% | 92 | 62% |
| **Greed** | $4,144 | 36.3% | 77 | 64% |

Fear outperforms Greed by 25% in PnL despite nearly equal win rates.
The edge comes from higher trade volume and volatility capture, not
better trade selection.

### Finding 2 — Sentiment switches trader mode (scalping vs momentum)

- **Fear → Scalping mode:** 105 trades/day, smaller positions (avg 5,614 tokens),
  Long/Short ratio 7.9x
- **Greed → Momentum mode:** 77 trades/day, larger positions (avg 8,454 tokens),
  Long/Short ratio 5.4x

### Finding 3 — Consistent Winners are the most sentiment-sensitive

| Segment | Fear PnL | Greed PnL | Ratio |
|---|---|---|---|
| Consistent Winners | **$7,483** | $2,471 | **3.0×** |
| High Frequency | **$5,968** | $3,847 | **1.6×** |
| Inconsistent | $4,737 | $3,102 | 1.5× |

### Trader Segments Analyzed
- **Frequency:** High vs Low (median split by trade count)
- **Consistency:** Consistent Winners (win rate ≥ 45% AND positive total PnL) vs Inconsistent
- **Bias:** Long-Biased (L/S > 1.2) vs Short-Biased vs Balanced

---

## Part C — Strategy Rules

**Rule 1 — High Frequency traders on Fear/Extreme Fear days:**
Scale up trade frequency. Keep Long/Short ratio near 1.0 (avoid directional bets).
Capture bid-ask spread and micro-volatility.
> Evidence: HF traders earned **55% more per day** on Fear vs Greed days.

**Rule 2 — Consistent Winners on Greed/Extreme Greed days:**
Reduce trade count. Shift into fewer, larger, longer-hold long positions.
Let momentum run rather than scalping.
> Evidence: Consistent Winners on Greed earned **3× more** than on non-Fear days.

---

## Bonus (All 3 Completed)

### Bonus 1 — Predictive Models

| Model | Target | Validation | Result |
|---|---|---|---|
| Random Forest | Next-day profitability (binary) | 5-Fold CV ROC-AUC | **0.692 ±0.034** |
| Gradient Boosting | PnL volatility bucket (Low/Med/High) | 5-Fold CV Accuracy | **66.8% ±0.9%** |

**Top features:** `daily_pnl` (0.134) · `win_trades` (0.126) · `long_count` (0.119) · `win_rate` (0.114)

Sentiment encoding ranked last (0.015) — confirming that today's *behavior*
predicts tomorrow better than sentiment alone.

### Bonus 2 — K-Means Behavioral Clustering

Elbow + Silhouette analysis (K=2..8) → **Optimal K=2** (Silhouette = **0.414**)

| Archetype | Count | Avg Trades/Day | Avg Daily PnL | Avg Win Rate |
|---|---|---|---|---|
| **Aggressive Scalper** | 5 | 297 | $30,287 | 30.8% |
| **Steady Accumulator** | 27 | 79 | $2,838 | 36.0% |

PCA 2D visualization explains 58.8% of variance with clear cluster separation.

### Bonus 3 — Interactive Streamlit Dashboard

```bash
streamlit run dashboard.py
```

6-page dynamic dashboard (dark theme, real-time filters):

| Page | Content |
|---|---|
| 📊 Overview | KPI cards, sentiment cards, PnL timeline |
| 📈 Performance Analysis | Bar charts, box plots, full performance table |
| ⚡ Behavior Analysis | Trade frequency, size, L/S ratio by sentiment |
| 👥 Trader Segments | Segment heatmaps, archetype explorer |
| 🤖 Predictive Model | Live RF trained on current filter selection |
| 🔍 Individual Trader | Per-trader PnL timeline with sentiment shading |

---

## Tech Stack

`Python 3.10+` · `pandas` · `numpy` · `matplotlib` · `seaborn` · `scikit-learn` · `streamlit` · `Jupyter`

---

## Submitted by

**Name:** [YOUR NAME]
**Email:** [YOUR EMAIL]
