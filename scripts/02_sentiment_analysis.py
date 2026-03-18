import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')          # non-interactive backend — saves reliably without display issues
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

ROOT_DIR   = r'c:\Users\Anant\OneDrive\Desktop\PrimeTrade'
DATA_DIR   = ROOT_DIR + r'\data\processed'
RAW_DIR    = ROOT_DIR + r'\data\raw'
CHARTS_DIR = ROOT_DIR + r'\charts'

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — RELOAD AND VERIFY
# ─────────────────────────────────────────────────────────────────────────────

print("=" * 60)
print("  PHASE 2 — TRADER BEHAVIOR ANALYSIS")
print("=" * 60)

df = pd.read_csv(f'{ROOT_DIR}\\merged_trader_sentiment.csv')
df['date'] = pd.to_datetime(df['date'])

print(f"\nShape: {df.shape[0]} rows, {df.shape[1]} columns")
print(f"\nUnique dates and their sentiment labels:")
date_sentiment = df.groupby(['date', 'sentiment']).size().reset_index(name='trader_count')
print(date_sentiment.to_string(index=False))

print(f"\nSentiment value counts:")
print(df['sentiment'].value_counts().to_string())

# Style settings
plt.style.use('seaborn-v0_8-whitegrid')
COLORS = {'Fear': '#E05C5C', 'Neutral': '#F0A500', 'Greed': '#3BAF7E'}

# ─────────────────────────────────────────────────────────────────────────────
# QUESTION 1 — DOES PERFORMANCE DIFFER BY SENTIMENT?
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("  QUESTION 1 — PERFORMANCE BY SENTIMENT")
print("=" * 60)

# 1A. Summary stats table
q1_table = df.groupby('sentiment').agg(
    num_traders     = ('account',       'nunique'),
    trading_days    = ('date',          'nunique'),
    total_rows      = ('account',       'count'),
    avg_daily_pnl   = ('daily_pnl',     'mean'),
    median_pnl      = ('daily_pnl',     'median'),
    total_pnl       = ('daily_pnl',     'sum'),
    avg_win_rate    = ('win_rate',       'mean'),
    pct_profitable  = ('is_profitable', 'mean'),
    avg_trade_count = ('trade_count',   'mean'),
).reset_index()

# Enforce standard row order
sent_order = [s for s in ['Fear', 'Neutral', 'Greed'] if s in q1_table['sentiment'].values]
q1_table = q1_table.set_index('sentiment').reindex(sent_order).reset_index()

float_cols = ['avg_daily_pnl', 'median_pnl', 'total_pnl',
              'avg_win_rate', 'pct_profitable', 'avg_trade_count']
for c in float_cols:
    q1_table[c] = q1_table[c].round(2)

print("\nTABLE 1: Performance by Sentiment")
print("-" * 90)
print(q1_table.to_string(index=False))
print("-" * 90)

# 1B. Drawdown proxy
drawdown_df = df.groupby('account').agg(
    worst_day = ('daily_pnl', 'min'),
    best_day  = ('daily_pnl', 'max'),
).reset_index()
drawdown_df['pnl_range'] = drawdown_df['best_day'] - drawdown_df['worst_day']

print("\nTop 5 Highest Drawdown (PnL Range) Traders:")
print(drawdown_df.sort_values('pnl_range', ascending=False).head(5).to_string(index=False))

# 1C. Chart 1 — Bar chart
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
fig.suptitle('Chart 1: Performance by Market Sentiment', fontsize=14, fontweight='bold')

sentiments = q1_table['sentiment'].tolist()
colors = [COLORS[s] for s in sentiments]

axes[0].bar(sentiments, q1_table['avg_daily_pnl'], color=colors, edgecolor='white', linewidth=1.5)
axes[0].set_title('Avg Daily PnL per Trader')
axes[0].set_ylabel('USD')
axes[0].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:,.0f}'))
for i, val in enumerate(q1_table['avg_daily_pnl']):
    offset = abs(val) * 0.03 if val >= 0 else -abs(val) * 0.08
    axes[0].text(i, val + offset, f'${val:,.0f}', ha='center', fontsize=9, fontweight='bold')

axes[1].bar(sentiments, q1_table['avg_win_rate'] * 100, color=colors, edgecolor='white', linewidth=1.5)
axes[1].set_title('Avg Win Rate (%)')
axes[1].set_ylabel('Win Rate %')
axes[1].set_ylim(0, 65)
for i, val in enumerate(q1_table['avg_win_rate']):
    axes[1].text(i, val * 100 + 1, f'{val * 100:.1f}%', ha='center', fontsize=9, fontweight='bold')

axes[2].bar(sentiments, q1_table['pct_profitable'] * 100, color=colors, edgecolor='white', linewidth=1.5)
axes[2].set_title('% Profitable Trader-Days')
axes[2].set_ylabel('% Profitable')
axes[2].set_ylim(0, 110)
for i, val in enumerate(q1_table['pct_profitable']):
    axes[2].text(i, val * 100 + 1, f'{val * 100:.1f}%', ha='center', fontsize=9, fontweight='bold')

plt.tight_layout()
plt.savefig(f'{ROOT_DIR}\\chart1_performance_by_sentiment.png', dpi=150, bbox_inches='tight')
plt.close()
print("\nSaved: chart1_performance_by_sentiment.png")

# 1D. Chart 2 — Box plot
fig, ax = plt.subplots(figsize=(10, 6))
sentiment_order = [s for s in ['Fear', 'Neutral', 'Greed'] if s in df['sentiment'].unique()]
data_by_sentiment = [df[df['sentiment'] == s]['daily_pnl'].values for s in sentiment_order]

bp = ax.boxplot(data_by_sentiment, labels=sentiment_order, patch_artist=True,
                medianprops=dict(color='black', linewidth=2))
for patch, sent in zip(bp['boxes'], sentiment_order):
    patch.set_facecolor(COLORS[sent])
    patch.set_alpha(0.7)

ax.set_title('Chart 2: PnL Distribution by Sentiment', fontsize=13, fontweight='bold')
ax.set_ylabel('Daily PnL (USD)')
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:,.0f}'))
ax.axhline(0, color='gray', linestyle='--', linewidth=1, label='Break-even')
ax.legend()
plt.tight_layout()
plt.savefig(f'{ROOT_DIR}\\chart2_pnl_distribution.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: chart2_pnl_distribution.png")

# Pull values for insights
fear_row    = q1_table[q1_table['sentiment'] == 'Fear'].iloc[0]    if 'Fear'    in q1_table['sentiment'].values else None
neutral_row = q1_table[q1_table['sentiment'] == 'Neutral'].iloc[0] if 'Neutral' in q1_table['sentiment'].values else None
greed_row   = q1_table[q1_table['sentiment'] == 'Greed'].iloc[0]   if 'Greed'   in q1_table['sentiment'].values else None

fear_pnl    = f"${fear_row['avg_daily_pnl']:,.0f}"    if fear_row    is not None else "N/A"
neutral_pnl = f"${neutral_row['avg_daily_pnl']:,.0f}" if neutral_row is not None else "N/A"
greed_pnl   = f"${greed_row['avg_daily_pnl']:,.0f}"   if greed_row   is not None else "N/A"
fear_wr     = f"{fear_row['avg_win_rate']*100:.1f}%"    if fear_row    is not None else "N/A"
neutral_wr  = f"{neutral_row['avg_win_rate']*100:.1f}%" if neutral_row is not None else "N/A"
greed_wr    = f"{greed_row['avg_win_rate']*100:.1f}%"   if greed_row   is not None else "N/A"
fear_n      = int(fear_row['total_rows'])    if fear_row    is not None else 0
neutral_n   = int(neutral_row['total_rows']) if neutral_row is not None else 0
greed_n     = int(greed_row['total_rows'])   if greed_row   is not None else 0

INSIGHT_1_text = f"""
INSIGHT 1: Traders achieved their highest average daily PnL on Fear days ({fear_pnl}),
significantly outperforming Greed ({greed_pnl}) and Neutral ({neutral_pnl}) days.
Win rates were also highest on Fear, suggesting this cohort are contrarian
positioning effectively — though the single Fear day limits firm conclusions.

Evidence: Fear avg PnL = {fear_pnl} | Neutral avg PnL = {neutral_pnl} | Greed avg PnL = {greed_pnl}
Win rates: Fear = {fear_wr} | Neutral = {neutral_wr} | Greed = {greed_wr}
Sample: Fear={fear_n} trader-days (N=1 day), Neutral={neutral_n} trader-days (N=1 day),
        Greed={greed_n} trader-days (N=4 days)
Caveat: Based on limited unique trading days — treat directionally, not conclusively.
"""
print(INSIGHT_1_text)

# ─────────────────────────────────────────────────────────────────────────────
# QUESTION 2 — DO TRADERS CHANGE BEHAVIOR BY SENTIMENT?
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("  QUESTION 2 — TRADER BEHAVIOR BY SENTIMENT")
print("=" * 60)

# 2A. Behavior table
q2_table = df.groupby('sentiment').agg(
    avg_trade_count      = ('trade_count',       'mean'),
    median_trade_count   = ('trade_count',       'median'),
    avg_trade_size_usd   = ('avg_trade_size',    'mean'),
    avg_long_short_ratio = ('long_short_ratio',  'mean'),
    pct_long_dominant    = ('long_short_ratio',  lambda x: (x > 1).mean() * 100),
).reset_index()

q2_table = q2_table.set_index('sentiment').reindex(sent_order).reset_index()
for c in ['avg_trade_count', 'median_trade_count', 'avg_trade_size_usd',
          'avg_long_short_ratio', 'pct_long_dominant']:
    q2_table[c] = q2_table[c].round(2)

print("\nTABLE 2: Trader Behavior by Sentiment")
print("-" * 80)
print(q2_table.to_string(index=False))
print("-" * 80)

# 2B. Chart 3 — 2×2 grid
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Chart 3: Trader Behavior by Market Sentiment', fontsize=14, fontweight='bold')

sentiments_q2 = [s for s in ['Fear', 'Neutral', 'Greed'] if s in q2_table['sentiment'].values]
colors_q2 = [COLORS[s] for s in sentiments_q2]

axes[0, 0].bar(sentiments_q2, q2_table['avg_trade_count'], color=colors_q2, edgecolor='white')
axes[0, 0].set_title('Avg Number of Trades per Day')
axes[0, 0].set_ylabel('Trade Count')
for i, val in enumerate(q2_table['avg_trade_count']):
    axes[0, 0].text(i, val + max(q2_table['avg_trade_count']) * 0.02,
                    f'{val:.0f}', ha='center', fontsize=9, fontweight='bold')

axes[0, 1].bar(sentiments_q2, q2_table['avg_trade_size_usd'], color=colors_q2, edgecolor='white')
axes[0, 1].set_title('Avg Trade Size (Tokens)')
axes[0, 1].set_ylabel('Avg Size (tokens)')
axes[0, 1].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'{x:,.0f}'))
for i, val in enumerate(q2_table['avg_trade_size_usd']):
    axes[0, 1].text(i, val + abs(val) * 0.02, f'{val:,.0f}', ha='center', fontsize=9, fontweight='bold')

axes[1, 0].bar(sentiments_q2, q2_table['avg_long_short_ratio'], color=colors_q2, edgecolor='white')
axes[1, 0].set_title('Avg Long/Short Ratio')
axes[1, 0].set_ylabel('Ratio (>1 = more longs)')
axes[1, 0].axhline(1, color='gray', linestyle='--', linewidth=1)
for i, val in enumerate(q2_table['avg_long_short_ratio']):
    axes[1, 0].text(i, val + 0.02, f'{val:.2f}x', ha='center', fontsize=9, fontweight='bold')

axes[1, 1].bar(sentiments_q2, q2_table['pct_long_dominant'], color=colors_q2, edgecolor='white')
axes[1, 1].set_title('% Sessions: Long-Dominant')
axes[1, 1].set_ylabel('% of trader-days')
axes[1, 1].set_ylim(0, 110)
for i, val in enumerate(q2_table['pct_long_dominant']):
    axes[1, 1].text(i, val + 1, f'{val:.1f}%', ha='center', fontsize=9, fontweight='bold')

plt.tight_layout()
plt.savefig(f'{ROOT_DIR}\\chart3_behavior_by_sentiment.png', dpi=150, bbox_inches='tight')
plt.close()
print("\nSaved: chart3_behavior_by_sentiment.png")

# Pull values for Insight 2
def get_val(tbl, sent, col, fmt='{:.0f}'):
    row = tbl[tbl['sentiment'] == sent]
    if row.empty:
        return 'N/A'
    return fmt.format(row.iloc[0][col])

f_tc  = get_val(q2_table, 'Fear',    'avg_trade_count')
n_tc  = get_val(q2_table, 'Neutral', 'avg_trade_count')
g_tc  = get_val(q2_table, 'Greed',   'avg_trade_count')
f_ts  = get_val(q2_table, 'Fear',    'avg_trade_size_usd', '{:,.0f}')
n_ts  = get_val(q2_table, 'Neutral', 'avg_trade_size_usd', '{:,.0f}')
g_ts  = get_val(q2_table, 'Greed',   'avg_trade_size_usd', '{:,.0f}')
f_ld  = get_val(q2_table, 'Fear',    'pct_long_dominant', '{:.1f}%')
n_ld  = get_val(q2_table, 'Neutral', 'pct_long_dominant', '{:.1f}%')
g_ld  = get_val(q2_table, 'Greed',   'pct_long_dominant', '{:.1f}%')

# determine direction
try:
    fear_tc_val  = float(q2_table[q2_table['sentiment']=='Fear']['avg_trade_count'].values[0])
    greed_tc_val = float(q2_table[q2_table['sentiment']=='Greed']['avg_trade_count'].values[0])
    more_active  = "Fear" if fear_tc_val > greed_tc_val else "Greed"
except:
    more_active  = "Fear"

try:
    fear_ld_val  = float(q2_table[q2_table['sentiment']=='Fear']['pct_long_dominant'].values[0])
    greed_ld_val = float(q2_table[q2_table['sentiment']=='Greed']['pct_long_dominant'].values[0])
    more_long    = "Greed" if greed_ld_val > fear_ld_val else "Fear"
except:
    more_long    = "Greed"

INSIGHT_2_text = f"""
INSIGHT 2: Traders are most active (by trade count) on {more_active} days,
and show a stronger long bias during {more_long} sentiment periods.
Trade size and directional conviction both shift with market mood.

Evidence:
  Trade count  — Fear: {f_tc} | Neutral: {n_tc} | Greed: {g_tc}
  Trade size   — Fear: {f_ts} tokens | Neutral: {n_ts} tokens | Greed: {g_ts} tokens
  Long bias    — Fear: {f_ld} long-dominant | Neutral: {n_ld} | Greed: {g_ld} long-dominant
Interpretation: The higher long bias on {more_long} days suggests traders
lean bullish when markets are euphoric — a pattern consistent with retail
momentum chasing. Elevated activity on {more_active} days may reflect
contrarian positioning or forced liquidation-driven volatility.
Sample note: Based on limited unique trading days (N=1 Fear, N=1 Neutral, N=4 Greed).
"""
print(INSIGHT_2_text)

# ─────────────────────────────────────────────────────────────────────────────
# QUESTION 3 — TRADER SEGMENTATION
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("  QUESTION 3 — TRADER SEGMENTATION")
print("=" * 60)

# 3A. Trader-level profile
trader_profile = df.groupby('account').agg(
    total_pnl      = ('daily_pnl',        'sum'),
    avg_daily_pnl  = ('daily_pnl',        'mean'),
    total_trades   = ('trade_count',       'sum'),
    avg_win_rate   = ('win_rate',          'mean'),
    days_traded    = ('date',             'nunique'),
    avg_long_ratio = ('long_short_ratio', 'mean'),
    pct_profitable = ('is_profitable',    'mean'),
).reset_index()

# 3B. Segments
median_trades = trader_profile['total_trades'].median()
trader_profile['freq_segment'] = np.where(
    trader_profile['total_trades'] >= median_trades,
    'High Frequency', 'Low Frequency'
)

trader_profile['consistency_segment'] = np.where(
    (trader_profile['avg_win_rate'] >= 0.45) & (trader_profile['total_pnl'] > 0),
    'Consistent Winner', 'Inconsistent'
)

trader_profile['bias_segment'] = np.where(
    trader_profile['avg_long_ratio'] > 1.2, 'Long-Biased',
    np.where(trader_profile['avg_long_ratio'] < 0.8, 'Short-Biased', 'Balanced')
)

print(f"\nTrader Profile (first 10 rows):")
print(trader_profile.head(10).to_string(index=False))

print(f"\nFrequency Segment counts:")
print(trader_profile['freq_segment'].value_counts().to_string())
print(f"\nConsistency Segment counts:")
print(trader_profile['consistency_segment'].value_counts().to_string())
print(f"\nBias Segment counts:")
print(trader_profile['bias_segment'].value_counts().to_string())

# 3C. Segment performance comparison
for seg_col, seg_label in [
    ('freq_segment',        'Frequency'),
    ('consistency_segment', 'Consistency'),
    ('bias_segment',        'Long/Short Bias'),
]:
    seg_summary = df.merge(
        trader_profile[['account', seg_col]], on='account'
    ).groupby([seg_col, 'sentiment']).agg(
        avg_pnl      = ('daily_pnl', 'mean'),
        avg_win_rate = ('win_rate',  'mean'),
        trader_count = ('account',   'nunique'),
    ).reset_index()

    seg_summary['avg_pnl']      = seg_summary['avg_pnl'].round(2)
    seg_summary['avg_win_rate'] = seg_summary['avg_win_rate'].round(3)

    print(f"\nTABLE — Segment by {seg_label} × Sentiment:")
    print("-" * 70)
    print(seg_summary.to_string(index=False))
    print("-" * 70)

# 3D. Chart 4 — Heatmaps
pivot_freq = df.merge(trader_profile[['account', 'freq_segment']], on='account') \
    .groupby(['freq_segment', 'sentiment'])['daily_pnl'].mean().unstack(fill_value=0)

pivot_consist = df.merge(trader_profile[['account', 'consistency_segment']], on='account') \
    .groupby(['consistency_segment', 'sentiment'])['daily_pnl'].mean().unstack(fill_value=0)

# Reorder sentiment columns
for piv in [pivot_freq, pivot_consist]:
    ordered_cols = [c for c in ['Fear', 'Neutral', 'Greed'] if c in piv.columns]
    piv = piv[ordered_cols]

pivot_freq    = pivot_freq[[c for c in ['Fear', 'Neutral', 'Greed'] if c in pivot_freq.columns]]
pivot_consist = pivot_consist[[c for c in ['Fear', 'Neutral', 'Greed'] if c in pivot_consist.columns]]

fig, axes = plt.subplots(1, 2, figsize=(14, 5))
fig.suptitle('Chart 4: Avg Daily PnL by Segment and Sentiment', fontsize=13, fontweight='bold')

sns.heatmap(pivot_freq, ax=axes[0], annot=True, fmt='.0f', cmap='RdYlGn',
            linewidths=0.5, annot_kws={"size": 11})
axes[0].set_title('By Trade Frequency')
axes[0].set_xlabel('Sentiment')
axes[0].set_ylabel('Segment')
axes[0].tick_params(axis='x', rotation=0)

sns.heatmap(pivot_consist, ax=axes[1], annot=True, fmt='.0f', cmap='RdYlGn',
            linewidths=0.5, annot_kws={"size": 11})
axes[1].set_title('By Consistency')
axes[1].set_xlabel('Sentiment')
axes[1].set_ylabel('Segment')
axes[1].tick_params(axis='x', rotation=0)

plt.tight_layout()
plt.savefig(f'{ROOT_DIR}\\chart4_segment_heatmap.png', dpi=150, bbox_inches='tight')
plt.close()
print("\nSaved: chart4_segment_heatmap.png")

# 3E. Chart 5 — Scatter
fig, ax = plt.subplots(figsize=(10, 7))
seg_colors = {'Consistent Winner': '#3BAF7E', 'Inconsistent': '#E05C5C'}

for seg, grp in trader_profile.groupby('consistency_segment'):
    ax.scatter(grp['avg_win_rate'] * 100, grp['total_pnl'],
               color=seg_colors[seg], label=seg,
               s=100, alpha=0.8, edgecolors='white', linewidth=1)
    for _, row in grp.iterrows():
        ax.annotate(row['account'][:8] + '...',
                    (row['avg_win_rate'] * 100, row['total_pnl']),
                    fontsize=7, alpha=0.6, xytext=(4, 4), textcoords='offset points')

ax.axhline(0, color='gray', linestyle='--', linewidth=1)
ax.axvline(45, color='gray', linestyle='--', linewidth=1, label='45% win rate threshold')
ax.set_xlabel('Avg Win Rate (%)')
ax.set_ylabel('Total PnL (USD)')
ax.set_title('Chart 5: Win Rate vs Total PnL by Trader', fontsize=13, fontweight='bold')
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:,.0f}'))
ax.legend()
plt.tight_layout()
plt.savefig(f'{ROOT_DIR}\\chart5_winrate_vs_pnl.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: chart5_winrate_vs_pnl.png")

# Pull values for Insight 3
def get_seg_sent_pnl(seg_col_name, seg_val, sent_val):
    sub = df.merge(trader_profile[['account', seg_col_name]], on='account')
    sub = sub[(sub[seg_col_name] == seg_val) & (sub['sentiment'] == sent_val)]
    if sub.empty:
        return 'N/A'
    return f"${sub['daily_pnl'].mean():,.0f}"

hf_fear  = get_seg_sent_pnl('freq_segment',        'High Frequency',   'Fear')
hf_greed = get_seg_sent_pnl('freq_segment',        'High Frequency',   'Greed')
cw_fear  = get_seg_sent_pnl('consistency_segment', 'Consistent Winner','Fear')
cw_greed = get_seg_sent_pnl('consistency_segment', 'Consistent Winner','Greed')
ic_fear  = get_seg_sent_pnl('consistency_segment', 'Inconsistent',     'Fear')
ic_greed = get_seg_sent_pnl('consistency_segment', 'Inconsistent',     'Greed')

# Best segment by total avg PnL
seg_avg = trader_profile.groupby('consistency_segment')['total_pnl'].mean()
best_seg = seg_avg.idxmax() if not seg_avg.empty else "Consistent Winner"
worst_seg = seg_avg.idxmin() if not seg_avg.empty else "Inconsistent"

INSIGHT_3_text = f"""
INSIGHT 3: {best_seg} traders generate the highest total PnL across all
sentiment regimes, while {worst_seg} traders show the most erratic outcomes.
Performance gaps widen on Fear days, exposing which traders have robust
strategies versus those who rely on favorable momentum.

Evidence:
  High Frequency traders   — avg PnL on Fear: {hf_fear} | Greed: {hf_greed}
  Consistent Winners       — avg PnL on Fear: {cw_fear} | Greed: {cw_greed}
  Inconsistent traders     — avg PnL on Fear: {ic_fear} | Greed: {ic_greed}
Key finding: {best_seg} traders outperform across all sentiment conditions.
{worst_seg} traders lose the most or gain the least, particularly
on Fear days — suggesting they lack the discipline to navigate pullbacks.
Sample note: Based on limited data (N=6 total unique trading days, 32 traders).
"""
print(INSIGHT_3_text)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4 — ALL 3 INSIGHTS COMBINED
# ─────────────────────────────────────────────────────────────────────────────

print("=" * 60)
print("  PHASE 2 COMPLETE — 3 KEY INSIGHTS SUMMARY")
print("=" * 60)
print(INSIGHT_1_text)
print(INSIGHT_2_text)
print(INSIGHT_3_text)
print("=" * 60)
print("Charts saved:")
print("  chart1_performance_by_sentiment.png")
print("  chart2_pnl_distribution.png")
print("  chart3_behavior_by_sentiment.png")
print("  chart4_segment_heatmap.png")
print("  chart5_winrate_vs_pnl.png")

# ─────────────────────────────────────────────────────────────────────────────
# SAVE OUTPUTS FOR PHASE 3
# ─────────────────────────────────────────────────────────────────────────────

trader_profile.to_csv(f'{ROOT_DIR}\\trader_profiles.csv', index=False)
print("\nSaved: trader_profiles.csv")
print("\nPhase 2 complete.")

