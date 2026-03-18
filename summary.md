# Analysis Summary — Trader Performance vs Market Sentiment
**Primetrade.ai Data Science Intern Assignment**

---

## Objective

Analyze how Bitcoin market sentiment (Fear/Greed Index) relates to trader
behavior and performance on the Hyperliquid DEX. Derive actionable strategy
rules for different trader types.

---

## Methodology

**Datasets:**
- Bitcoin Fear & Greed Index: 2,644 daily readings (Feb 2018 – May 2025)
- Hyperliquid DEX trades: 211,224 rows from 32 trader accounts (May 2023 – May 2025)

**Data Preparation:**
Trades aggregated to daily level per trader. Computed: daily PnL, trade count,
win rate, avg trade size, long/short ratio, long count, short count.
Sentiment bucketed into 3 categories: **Fear** (Extreme Fear + Fear), **Neutral**,
**Greed** (Greed + Extreme Greed).

> **Key fix:** The raw numeric Timestamp column yielded only 7 unique dates
> due to millisecond truncation. The `Timestamp IST` column was used instead,
> unlocking **480 unique trading days**.

**Merge:** Both datasets joined on date → **2,340 trader-day observations**
across **479 matched days** (99.8% coverage). Leverage column was all zeros
in source — leverage-based segmentation not possible.

**Segmentation (3 dimensions):**
- Frequency: High Frequency (top 50% by trade count) vs Low Frequency
- Consistency: Consistent Winners (win rate ≥ 45% AND positive PnL) vs Inconsistent
- Bias: Long-Biased (L/S > 1.2) vs Short-Biased vs Balanced

---

## Key Insights

**Insight 1 — Fear days produce 25% higher PnL with equal win rates**

| Sentiment | Days | Avg Daily PnL | Win Rate | % Profitable |
|---|---|---|---|---|
| Fear | 105 | **$5,185** | 35.7% | 60% |
| Neutral | 67 | $3,439 | 35.5% | 62% |
| Greed | 307 | $4,144 | 36.3% | 64% |

Win rates are nearly identical across sentiments. The Fear edge comes from
higher trade volume and volatility capture, not better trade selection.

**Insight 2 — Sentiment switches trader mode (scalping vs momentum)**

Fear days trigger a scalping mode: 37% more trades (105 vs 77 avg/day),
smaller positions (5,614 vs 8,454 avg tokens), Long/Short ratio 7.9× vs 5.4×.
Greed days trigger momentum mode: fewer but larger, more directional long bets.

**Insight 3 — Consistent Winners are 3× more sentiment-sensitive than other segments**

| Segment | Fear PnL | Greed PnL | Fear Edge |
|---|---|---|---|
| Consistent Winners | **$7,483** | $2,471 | **3.0×** |
| High Frequency | **$5,968** | $3,847 | **1.6×** |
| Inconsistent | $4,737 | $3,102 | 1.5× |

---

## Strategy Recommendations

**Rule 1 — High Frequency traders on Fear days:**
Scale up trade frequency. Keep Long/Short ratio near 1.0 (balanced, not
directional). Profit from spread and micro-volatility.
*Evidence: HF traders earned 55% more per day on Fear vs Greed.*

**Rule 2 — Consistent Winners on Greed days:**
Reduce trade count. Shift into fewer, larger, longer-hold long positions.
Trust momentum over scalping.
*Evidence: Consistent Winners earned 3× more on Fear — protecting capital
and sizing up on Greed is the complementary half of the strategy.*

---

## Bonus Work

### Predictive Models

| Model | Target | CV Validation | Score |
|---|---|---|---|
| Random Forest | Next-day profitability | 5-Fold CV ROC-AUC | **0.692 ±0.034** |
| Gradient Boosting | PnL volatility bucket | 5-Fold CV Accuracy | **66.8% ±0.9%** |

Top features: `daily_pnl` (0.134) · `win_trades` (0.126) · `long_count` (0.119)
Sentiment encoded last (0.015) — today's behavior predicts tomorrow better than
sentiment alone.

### K-Means Clustering (Optimal K=2, Silhouette=0.414)

| Archetype | Count | Avg Trades/Day | Avg Daily PnL | Avg Win Rate |
|---|---|---|---|---|
| **Aggressive Scalper** | 5 | 297 | $30,287 | 30.8% |
| **Steady Accumulator** | 27 | 79 | $2,838 | 36.0% |

### Streamlit Dashboard
6-page interactive dashboard with real-time sentiment and date filters.
Run: `streamlit run dashboard.py`

---

## Limitations

- Leverage column was all zeros in source data — leverage segmentation not done
- 32 traders is a small cohort; findings should be validated on a larger population
- Fear days are underrepresented (105 days vs 307 Greed days) — results directionally
  robust but may shift with more Fear data
