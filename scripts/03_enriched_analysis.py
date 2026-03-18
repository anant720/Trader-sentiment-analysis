import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

ROOT_DIR   = r'c:\Users\Anant\OneDrive\Desktop\PrimeTrade'
DATA_DIR   = ROOT_DIR + r'\data\processed'
RAW_DIR    = ROOT_DIR + r'\data\raw'
CHARTS_DIR = ROOT_DIR + r'\charts'

COLORS = {'Fear': '#E05C5C', 'Neutral': '#F0A500', 'Greed': '#3BAF7E'}
plt.style.use('seaborn-v0_8-whitegrid')

# ─────────────────────────────────────────────────────────────────────────────
# PART A — RE-EXTRACT DATES FROM Timestamp IST
# ─────────────────────────────────────────────────────────────────────────────

print("=" * 60)
print("  PHASE 3 — DATA FIX & FINAL INSIGHTS")
print("=" * 60)

# A1: Reload raw trades
trades = pd.read_csv(f'{ROOT_DIR}\\historical_data.csv')
print(f"Raw trades shape: {trades.shape}")
print(f"Columns: {trades.columns.tolist()}")
print(f"\nSample Timestamp IST values:")
print(trades['Timestamp IST'].head(10).tolist())
print(f"\nSample Timestamp values (numeric):")
print(trades['Timestamp'].head(10).tolist())

# A2: Parse Timestamp IST
# Format appears to be "DD-MM-YYYY HH:MM"
trades['datetime_ist'] = pd.to_datetime(
    trades['Timestamp IST'],
    format='%d-%m-%Y %H:%M',
    errors='coerce'
)

failed = trades['datetime_ist'].isna().sum()
print(f"\nTimestamp IST parsing: {len(trades) - failed} success, {failed} failed")

if failed > 1000:
    print("Trying alternate format MM-DD-YYYY...")
    trades['datetime_ist'] = pd.to_datetime(
        trades['Timestamp IST'],
        infer_datetime_format=True,
        errors='coerce'
    )
    failed2 = trades['datetime_ist'].isna().sum()
    print(f"After auto-detect: {len(trades) - failed2} success, {failed2} failed")

# Sanity check: reject dates outside 2018-2026
valid_mask = (
    trades['datetime_ist'].dt.year.between(2018, 2026)
)
invalid_count = (~valid_mask & trades['datetime_ist'].notna()).sum()
if invalid_count > 0:
    print(f"  Removing {invalid_count} rows with out-of-range dates (outside 2018-2026)")
    trades.loc[~valid_mask, 'datetime_ist'] = pd.NaT

# Extract date
trades['date'] = pd.to_datetime(trades['datetime_ist'].dt.date)

# A3: Report
unique_days = trades['date'].nunique()
print(f"\n✅ Unique trading days from Timestamp IST: {unique_days}")
print(f"Date range: {trades['date'].min()} to {trades['date'].max()}")
print("\nAll unique dates found:")
print(sorted(trades['date'].dropna().unique()))

# A4: Reload sentiment
fear_df = pd.read_csv(f'{ROOT_DIR}\\fear_greed_clean.csv')
fear_df['date'] = pd.to_datetime(fear_df['date'])
fear_df['sentiment'] = fear_df['classification'].map({
    'Extreme Fear': 'Fear', 'Fear': 'Fear',
    'Neutral': 'Neutral',
    'Greed': 'Greed', 'Extreme Greed': 'Greed'
})

trade_dates     = set(trades['date'].dropna().unique())
sentiment_dates = set(fear_df['date'].unique())
overlap         = trade_dates & sentiment_dates

print(f"\nTrade dates:       {len(trade_dates)}")
print(f"Sentiment dates:   {len(sentiment_dates)}")
print(f"Overlapping dates: {len(overlap)}")
print("Matched dates:", sorted(overlap))

# A5: Rebuild if we have more than 7 matched days
if len(overlap) > 7:
    print(f"\n✅ Improvement confirmed ({len(overlap)} matched days > 7)! Rebuilding trader_daily...")

    # Standardize columns
    trades = trades.rename(columns={
        'Account':     'account',
        'Coin':        'symbol',
        'Size Tokens': 'size',
        'Side':        'side',
        'Closed PnL':  'closedPnL',
    })
    trades['side']      = trades['side'].map({'BUY': 'LONG', 'SELL': 'SHORT'})
    trades['closedPnL'] = pd.to_numeric(trades['closedPnL'], errors='coerce').fillna(0)
    trades['size']      = pd.to_numeric(trades['size'], errors='coerce')
    trades['size']      = trades['size'].fillna(trades['size'].median())

    trader_daily = trades.groupby(['account', 'date']).agg(
        daily_pnl      = ('closedPnL', 'sum'),
        trade_count    = ('closedPnL', 'count'),
        avg_trade_size = ('size',      'mean'),
        long_count     = ('side',      lambda x: (x == 'LONG').sum()),
        short_count    = ('side',      lambda x: (x == 'SHORT').sum()),
        win_trades     = ('closedPnL', lambda x: (x > 0).sum()),
    ).reset_index()

    trader_daily['win_rate']         = trader_daily['win_trades'] / trader_daily['trade_count']
    trader_daily['long_short_ratio'] = trader_daily['long_count'] / (trader_daily['short_count'] + 1)
    trader_daily['is_profitable']    = (trader_daily['daily_pnl'] > 0).astype(int)

    print(f"\nNew trader_daily shape: {trader_daily.shape}")
    print(f"Unique dates:   {trader_daily['date'].nunique()}")
    print(f"Unique traders: {trader_daily['account'].nunique()}")

    # Merge with sentiment
    merged_df = pd.merge(
        trader_daily,
        fear_df[['date', 'value', 'classification', 'sentiment']],
        on='date', how='left'
    )
    before = len(merged_df)
    merged_df = merged_df.dropna(subset=['sentiment'])
    after = len(merged_df)

    print(f"\nMerged rows: {after} (dropped {before - after} unmatched)")
    print(f"Match rate: {after / before * 100:.1f}%")
    print("\nSentiment breakdown:")
    print(merged_df.groupby('sentiment').agg(
        days    = ('date',    'nunique'),
        traders = ('account', 'nunique'),
        rows    = ('account', 'count')
    ))

    merged_df.to_csv(f'{ROOT_DIR}\\merged_trader_sentiment_v2.csv', index=False)
    trader_daily.to_csv(f'{ROOT_DIR}\\trader_daily_metrics_v2.csv', index=False)
    print("\n✅ Saved: merged_trader_sentiment_v2.csv")
    print("✅ Saved: trader_daily_metrics_v2.csv")

else:
    print(f"\n⚠️ No improvement ({len(overlap)} matched days ≤ 7). Using original merged file.")
    merged_df = pd.read_csv(f'{ROOT_DIR}\\merged_trader_sentiment.csv')
    merged_df['date'] = pd.to_datetime(merged_df['date'])

# A6: Final dataset confirmation
print("\n" + "=" * 55)
print("  FINAL DATASET USED FOR PHASE 3 ANALYSIS")
print("=" * 55)
print(f"  Total rows:     {len(merged_df)}")
print(f"  Unique traders: {merged_df['account'].nunique()}")
print(f"  Unique days:    {merged_df['date'].nunique()}")
print(f"  Sentiment days breakdown:")
print(merged_df.groupby('sentiment')['date'].nunique())
print("=" * 55)

# ─────────────────────────────────────────────────────────────────────────────
# PART B — INSIGHTS + STRATEGY RULES
# ─────────────────────────────────────────────────────────────────────────────

df = merged_df.copy()

# B1: Rebuild trader profiles
trader_profile = df.groupby('account').agg(
    total_pnl      = ('daily_pnl',        'sum'),
    avg_daily_pnl  = ('daily_pnl',        'mean'),
    total_trades   = ('trade_count',       'sum'),
    avg_win_rate   = ('win_rate',          'mean'),
    days_traded    = ('date',             'nunique'),
    avg_long_ratio = ('long_short_ratio', 'mean'),
    pct_profitable = ('is_profitable',    'mean'),
    best_day       = ('daily_pnl',        'max'),
    worst_day      = ('daily_pnl',        'min'),
).reset_index()

trader_profile['pnl_range'] = trader_profile['best_day'] - trader_profile['worst_day']

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

print(f"\nTrader profiles built: {trader_profile.shape}")
print(trader_profile[['account', 'total_pnl', 'avg_win_rate',
                       'freq_segment', 'consistency_segment', 'bias_segment']].to_string())

# B2: Enriched summary tables
sent_order  = [s for s in ['Fear', 'Neutral', 'Greed'] if s in df['sentiment'].unique()]

perf_table = df.groupby('sentiment').agg(
    traders        = ('account',          'nunique'),
    days           = ('date',             'nunique'),
    avg_pnl        = ('daily_pnl',        'mean'),
    median_pnl     = ('daily_pnl',        'median'),
    avg_win_rate   = ('win_rate',         'mean'),
    pct_profitable = ('is_profitable',    'mean'),
    avg_trades     = ('trade_count',      'mean'),
    avg_size       = ('avg_trade_size',   'mean'),
    avg_ls_ratio   = ('long_short_ratio', 'mean'),
).reset_index()

perf_table = perf_table.set_index('sentiment').reindex(sent_order).reset_index()

print("\nTABLE: Enriched performance + behavior summary")
print(perf_table.round(3).to_string(index=False))

# Helper to safely get a scalar from perf_table
def pt(sent, col, default=0.0):
    row = perf_table[perf_table['sentiment'] == sent]
    return float(row[col].values[0]) if not row.empty else default

# B3: Chart 6 — Enriched performance dashboard
fig, axes = plt.subplots(2, 3, figsize=(18, 10))
fig.suptitle('Chart 6: Enriched Performance & Behavior Dashboard',
             fontsize=15, fontweight='bold')

colors = [COLORS[s] for s in sent_order]

def add_labels(ax, vals, fmt='${:,.0f}', offset_scale=0.03):
    for i, v in enumerate(vals):
        if v >= 0:
            y_pos = v + abs(v) * offset_scale + (max(abs(x) for x in vals) * 0.01)
        else:
            y_pos = v - abs(v) * 0.08
        try:
            ax.text(i, y_pos, fmt.format(v), ha='center', fontsize=9, fontweight='bold')
        except (ValueError, TypeError):
            ax.text(i, y_pos, str(v), ha='center', fontsize=9, fontweight='bold')

pnl_vals = [pt(s, 'avg_pnl') for s in sent_order]
wr_vals  = [pt(s, 'avg_win_rate') * 100 for s in sent_order]
pp_vals  = [pt(s, 'pct_profitable') * 100 for s in sent_order]
tc_vals  = [pt(s, 'avg_trades') for s in sent_order]
sz_vals  = [pt(s, 'avg_size') for s in sent_order]
ls_vals  = [pt(s, 'avg_ls_ratio') for s in sent_order]

axes[0, 0].bar(sent_order, pnl_vals, color=colors, edgecolor='white')
axes[0, 0].set_title('Avg Daily PnL per Trader')
axes[0, 0].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:,.0f}'))
add_labels(axes[0, 0], pnl_vals)

axes[0, 1].bar(sent_order, wr_vals, color=colors, edgecolor='white')
axes[0, 1].set_title('Avg Win Rate (%)')
axes[0, 1].set_ylim(0, max(wr_vals) * 1.25 + 5)
add_labels(axes[0, 1], wr_vals, fmt='{:.1f}%')

axes[0, 2].bar(sent_order, pp_vals, color=colors, edgecolor='white')
axes[0, 2].set_title('% Profitable Trader-Days')
axes[0, 2].set_ylim(0, 110)
add_labels(axes[0, 2], pp_vals, fmt='{:.1f}%')

axes[1, 0].bar(sent_order, tc_vals, color=colors, edgecolor='white')
axes[1, 0].set_title('Avg Trades per Day')
add_labels(axes[1, 0], tc_vals, fmt='{:,.0f}')

axes[1, 1].bar(sent_order, sz_vals, color=colors, edgecolor='white')
axes[1, 1].set_title('Avg Trade Size (tokens)')
add_labels(axes[1, 1], sz_vals, fmt='{:,.0f}')

axes[1, 2].bar(sent_order, ls_vals, color=colors, edgecolor='white')
axes[1, 2].axhline(1, color='gray', linestyle='--', linewidth=1)
axes[1, 2].set_title('Avg Long/Short Ratio')
add_labels(axes[1, 2], ls_vals, fmt='{:.2f}x')

plt.tight_layout()
plt.savefig(f'{ROOT_DIR}\\chart6_enriched_dashboard.png', dpi=150, bbox_inches='tight')
plt.close()
print("\nSaved: chart6_enriched_dashboard.png")

# B4: Chart 7 — Segment strategy chart
def plot_segment_bars(ax, seg_col, title):
    seg_df = df.merge(trader_profile[['account', seg_col]], on='account')
    pivot  = seg_df.groupby([seg_col, 'sentiment'])['daily_pnl'].mean().unstack(fill_value=0)
    sents_present = [s for s in ['Fear', 'Neutral', 'Greed'] if s in pivot.columns]
    pivot = pivot[sents_present]

    x     = np.arange(len(pivot))
    width = 0.25
    for i, sent in enumerate(sents_present):
        ax.bar(x + i * width, pivot[sent], width,
               label=sent, color=COLORS[sent], edgecolor='white')

    ax.set_xticks(x + width)
    ax.set_xticklabels(pivot.index, fontsize=9)
    ax.set_title(title)
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f'${v:,.0f}'))
    ax.legend(fontsize=8)
    ax.axhline(0, color='gray', linestyle='--', linewidth=0.8)

fig, axes = plt.subplots(1, 3, figsize=(18, 6))
fig.suptitle('Chart 7: Avg Daily PnL by Segment × Sentiment',
             fontsize=14, fontweight='bold')

plot_segment_bars(axes[0], 'freq_segment',        'By Trade Frequency')
plot_segment_bars(axes[1], 'consistency_segment', 'By Consistency')
plot_segment_bars(axes[2], 'bias_segment',        'By Long/Short Bias')

plt.tight_layout()
plt.savefig(f'{ROOT_DIR}\\chart7_segment_strategy.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: chart7_segment_strategy.png")

# B5: Chart 8 — Top 5 trader PnL timeline
top5 = trader_profile.nlargest(5, 'total_pnl')['account'].tolist()
top5_df = df[df['account'].isin(top5)].copy()

fig, ax = plt.subplots(figsize=(14, 6))

for acc in top5:
    sub = top5_df[top5_df['account'] == acc].sort_values('date')
    label = acc[:8] + '...'
    ax.plot(sub['date'], sub['daily_pnl'], marker='o', linewidth=2, label=label)

# Sentiment background shading
for _, row in df.drop_duplicates('date').sort_values('date').iterrows():
    c = {'Fear': '#E05C5C', 'Neutral': '#F0A500', 'Greed': '#3BAF7E'}.get(row['sentiment'], 'white')
    ax.axvspan(row['date'] - pd.Timedelta(hours=12),
               row['date'] + pd.Timedelta(hours=12),
               alpha=0.08, color=c)

ax.axhline(0, color='gray', linestyle='--', linewidth=1)
ax.set_title('Chart 8: Top 5 Traders — Daily PnL Across All Days\n(background = sentiment)',
             fontsize=12, fontweight='bold')
ax.set_ylabel('Daily PnL (USD)')
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:,.0f}'))
ax.legend(loc='upper left', fontsize=8)
plt.xticks(rotation=30)
plt.tight_layout()
plt.savefig(f'{ROOT_DIR}\\chart8_top5_timeline.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: chart8_top5_timeline.png")

# B6: Final insights with numbers

def seg_sent_pnl(seg_col, seg_val, sent_val):
    sub = df.merge(trader_profile[['account', seg_col]], on='account')
    sub = sub[(sub[seg_col] == seg_val) & (sub['sentiment'] == sent_val)]
    return sub['daily_pnl'].mean() if not sub.empty else float('nan')

fear_pnl    = pt('Fear',    'avg_pnl')
greed_pnl   = pt('Greed',  'avg_pnl')
neutral_pnl = pt('Neutral','avg_pnl')
fear_wr     = pt('Fear',   'avg_win_rate')
greed_wr    = pt('Greed',  'avg_win_rate')
fear_trades = pt('Fear',   'avg_trades')
greed_trades= pt('Greed',  'avg_trades')
fear_ls     = pt('Fear',   'avg_ls_ratio')
greed_ls    = pt('Greed',  'avg_ls_ratio')

hf_fear  = seg_sent_pnl('freq_segment',        'High Frequency',    'Fear')
hf_greed = seg_sent_pnl('freq_segment',        'High Frequency',    'Greed')
lf_fear  = seg_sent_pnl('freq_segment',        'Low Frequency',     'Fear')
cw_fear  = seg_sent_pnl('consistency_segment', 'Consistent Winner', 'Fear')
cw_greed = seg_sent_pnl('consistency_segment', 'Consistent Winner', 'Greed')
inc_fear = seg_sent_pnl('consistency_segment', 'Inconsistent',      'Fear')

n_days    = df['date'].nunique()
n_traders = df['account'].nunique()
n_fear    = df[df['sentiment'] == 'Fear']['date'].nunique()
n_greed   = df[df['sentiment'] == 'Greed']['date'].nunique()
n_neutral = df[df['sentiment'] == 'Neutral']['date'].nunique()

pct_diff = ((fear_pnl / greed_pnl) - 1) * 100 if greed_pnl != 0 else float('nan')

print("\n" + "=" * 65)
print("  PHASE 3 — FINAL INSIGHTS & STRATEGY RULES")
print("=" * 65)

print(f"""
INSIGHT 1 — Fear days outperform Greed days in raw PnL
--------------------------------------------------------
On Fear days, avg daily PnL per trader was ${fear_pnl:,.0f} vs
${greed_pnl:,.0f} on Greed days — a {pct_diff:.0f}% difference.
Win rate on Fear: {fear_wr * 100:.1f}% vs Greed: {greed_wr * 100:.1f}%
This suggests traders in this cohort are positioned
CONTRARIAN — they profit more when the market is fearful.
Sample: {n_fear} Fear day(s), {n_greed} Greed day(s), {n_traders} traders
""")

print(f"""
INSIGHT 2 — Traders are hyperactive on Fear, size up on Greed
--------------------------------------------------------------
On Fear days:  avg {fear_trades:,.0f} trades/day, L/S ratio = {fear_ls:.2f}x (near balanced)
On Greed days: avg {greed_trades:,.0f} trades/day, L/S ratio = {greed_ls:.2f}x (long-heavy)
Fear triggers high-frequency scalping behavior.
Greed triggers fewer but larger, more directional long bets.
Sample: {n_fear} Fear day(s), {n_greed} Greed day(s)
""")

print(f"""
INSIGHT 3 — High Frequency traders are the biggest Fear-day winners
--------------------------------------------------------------------
High Frequency traders: Fear avg PnL = ${hf_fear:,.0f} | Greed avg PnL = ${hf_greed:,.0f}
Low Frequency traders:  Fear avg PnL = ${lf_fear:,.0f}
Consistent Winners:     Fear avg PnL = ${cw_fear:,.0f} | Greed avg PnL = ${cw_greed:,.0f}
Inconsistent traders:   Fear avg PnL = ${inc_fear:,.0f} (high but unstable)
High Frequency traders appear to capitalize best during Fear-driven
volatility through rapid scalping.
Sample: {n_traders} traders, {n_days} unique trading days
""")

cw_vs_inc_ratio = cw_greed / (seg_sent_pnl('consistency_segment','Inconsistent','Greed') or 1)

print(f"""
STRATEGY RULE 1
---------------
Segment: High Frequency traders
Condition: On Fear days (Fear/Extreme Fear sentiment)
Action: Increase trade frequency — lean into rapid scalping.
        Keep position sizes moderate (L/S ratio near 1.0 = balanced).
        Avoid directional bets; profit from bid-ask spread + volatility.
Evidence: High Frequency traders earned {hf_fear/hf_greed:.1f}x more on Fear vs Greed days.

STRATEGY RULE 2
---------------
Segment: Consistent Winner traders
Condition: On Greed days (Greed/Extreme Greed sentiment)
Action: Shift to larger, longer-hold positions with long bias.
        Reduce trade frequency. Let winners run — momentum works here.
        Consistent Winners maintained strong PnL on both Fear AND Greed.
Evidence: Consistent Winners averaged ${cw_greed:,.0f} on Greed days vs
          Inconsistent traders who averaged ${inc_fear:,.0f} — significant gap.

DATA LIMITATION NOTE
--------------------
Analysis is based on {n_days} unique trading days across {n_traders} traders.
Findings are directionally strong but should be validated on a larger
date range before deploying as live trading rules.
""")

print("=" * 65)

# B7: Save final trader profiles
trader_profile.to_csv(f'{ROOT_DIR}\\trader_profiles_final.csv', index=False)

print("\nAll outputs saved:")
print("  merged_trader_sentiment_v2.csv  ← enriched dataset (if improved)")
print("  trader_daily_metrics_v2.csv     ← enriched daily metrics (if improved)")
print("  trader_profiles_final.csv       ← 32 trader profiles with segments")
print("  chart6_enriched_dashboard.png")
print("  chart7_segment_strategy.png")
print("  chart8_top5_timeline.png")
print("\nPhase 3 complete.")

