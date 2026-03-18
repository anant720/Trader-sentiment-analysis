import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

ROOT_DIR   = r'c:\Users\Anant\OneDrive\Desktop\PrimeTrade'
DATA_DIR   = ROOT_DIR + r'\data\processed'
RAW_DIR    = ROOT_DIR + r'\data\raw'
CHARTS_DIR = ROOT_DIR + r'\charts'
FEAR_FILE   = f'{ROOT_DIR}\\fear_greed_index.csv'
TRADES_FILE = f'{ROOT_DIR}\\historical_data.csv'

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — LOAD AND DOCUMENT BOTH FILES
# ─────────────────────────────────────────────────────────────────────────────

def document_df(df, name):
    print(f"\n{'='*60}")
    print(f"  DATASET: {name}")
    print(f"{'='*60}")
    print(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"\nColumn names: {df.columns.tolist()}")
    print(f"\nData types:")
    print(df.dtypes.to_string())
    print(f"\nFirst 5 rows:")
    print(df.head(5).to_string())
    print(f"\nLast 3 rows:")
    print(df.tail(3).to_string())

    # Missing values
    print(f"\nMissing values:")
    missing = pd.DataFrame({
        'column_name': df.columns,
        'missing_count': df.isnull().sum().values,
        'missing_percent': (df.isnull().sum().values / len(df) * 100).round(2)
    })
    print(missing.to_string(index=False))
    for _, row in missing.iterrows():
        if row['missing_percent'] > 10:
            print(f"  ⚠️  HIGH MISSING: {row['column_name']} ({row['missing_percent']}%)")

    # Duplicate rows
    dup_count = df.duplicated().sum()
    print(f"\nDuplicate rows: {dup_count} duplicate rows found")
    if dup_count > 0:
        df = df.drop_duplicates()
        print(f"  Dropped {dup_count} duplicates. New shape: {df.shape[0]} rows, {df.shape[1]} columns")

    # Basic numeric stats
    print(f"\nNumeric column stats (describe):")
    print(df.describe().to_string())

    return df

print("\n" + "="*60)
print("  PHASE 1 — DATA LOADING, CLEANING & METRIC CREATION")
print("="*60)

print("\nLoading fear_greed_index.csv ...")
fear_df = pd.read_csv(FEAR_FILE)
fear_df = document_df(fear_df, "Fear & Greed Index")

print("\nLoading historical_data.csv (trades) ...")
trades_df = pd.read_csv(TRADES_FILE)
trades_df = document_df(trades_df, "Hyperliquid Trades (historical_data.csv)")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 — CLEAN THE SENTIMENT FILE
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "="*60)
print("  STEP 2 — CLEAN SENTIMENT FILE")
print("="*60)

# 2a. Convert date column
fear_df['date'] = pd.to_datetime(fear_df['date'])

# 2b. Date range
min_date = fear_df['date'].min().date()
max_date = fear_df['date'].max().date()
n_days   = (fear_df['date'].max() - fear_df['date'].min()).days + 1
print(f"\nSentiment data covers: {min_date} to {max_date} — {n_days} days total")

# 2c. Duplicate dates
dup_dates = fear_df.duplicated(subset=['date']).sum()
if dup_dates > 0:
    print(f"  Duplicate dates found: {dup_dates} — keeping last occurrence")
    fear_df = fear_df.sort_values('date').drop_duplicates(subset=['date'], keep='last')
    print(f"  Dropped {dup_dates} duplicate date rows. New shape: {fear_df.shape}")
else:
    print("  No duplicate dates found.")

# 2d. Sentiment buckets
fear_df['sentiment'] = fear_df['classification'].map({
    'Extreme Fear': 'Fear',
    'Fear':         'Fear',
    'Neutral':      'Neutral',
    'Greed':        'Greed',
    'Extreme Greed':'Greed'
})

# 2e. Value counts
print("\nOriginal classification value counts:")
print(fear_df['classification'].value_counts().to_string())
print("\nSimplified sentiment (3-bucket) value counts:")
print(fear_df['sentiment'].value_counts().to_string())

# 2f. Keep only needed columns
fear_df = fear_df[['date', 'value', 'classification', 'sentiment']]
print(f"\nFinal fear_df shape after column selection: {fear_df.shape}")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 — CLEAN THE TRADES FILE
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "="*60)
print("  STEP 3 — CLEAN TRADES FILE")
print("="*60)

# Print actual columns found
print(f"\nActual columns in trades file: {trades_df.columns.tolist()}")

# Map expected column names (case-insensitive fuzzy match)
col_lower = {c.lower().strip(): c for c in trades_df.columns}

# Helper to find column
def find_col(candidates, col_map):
    for c in candidates:
        if c.lower() in col_map:
            return col_map[c.lower()]
    # partial match
    for c in candidates:
        for k, v in col_map.items():
            if c.lower() in k or k in c.lower():
                return v
    return None

time_col     = find_col(['time', 'timestamp', 'date'], col_lower)
side_col     = find_col(['side', 'direction'], col_lower)
pnl_col      = find_col(['closedpnl', 'closed_pnl', 'pnl', 'realizedpnl', 'realizedPnl'], col_lower)
size_col     = find_col(['size', 'qty', 'quantity', 'amount'], col_lower)
leverage_col = find_col(['leverage', 'lev'], col_lower)
event_col    = find_col(['event', 'type', 'orderstatus'], col_lower)
account_col  = find_col(['account', 'trader', 'address', 'user', 'wallet'], col_lower)
symbol_col   = find_col(['symbol', 'coin', 'market', 'pair', 'asset'], col_lower)

print(f"\nColumn mapping detected:")
print(f"  time     → {time_col}")
print(f"  side     → {side_col}")
print(f"  closedPnL→ {pnl_col}")
print(f"  size     → {size_col}")
print(f"  leverage → {leverage_col}")
print(f"  event    → {event_col}")
print(f"  account  → {account_col}")
print(f"  symbol   → {symbol_col}")

# 3a. Detect and convert time column
if time_col:
    sample_val = trades_df[time_col].dropna().iloc[0]
    try:
        sample_num = float(sample_val)
        if sample_num > 1e12:
            print(f"\nTime column '{time_col}' detected as MILLISECONDS (value={sample_num:.0f})")
            trades_df['datetime'] = pd.to_datetime(trades_df[time_col], unit='ms', errors='coerce')
        else:
            print(f"\nTime column '{time_col}' detected as SECONDS (value={sample_num:.0f})")
            trades_df['datetime'] = pd.to_datetime(trades_df[time_col], unit='s', errors='coerce')
    except (ValueError, TypeError):
        # Maybe already a datetime string
        print(f"\nTime column '{time_col}' appears to be a string datetime — parsing directly")
        trades_df['datetime'] = pd.to_datetime(trades_df[time_col], errors='coerce')
    
    # Sanity check: dates should be between 2018 and 2026
    valid_mask = (trades_df['datetime'].dt.year >= 2018) & (trades_df['datetime'].dt.year <= 2026)
    if valid_mask.sum() < len(trades_df) * 0.5:
        print("  ⚠️ Less than 50% valid dates with current unit — trying alternate unit")
        try:
            sample_num = float(sample_val)
            if sample_num > 1e12:
                trades_df['datetime'] = pd.to_datetime(trades_df[time_col], unit='s', errors='coerce')
            else:
                trades_df['datetime'] = pd.to_datetime(trades_df[time_col], unit='ms', errors='coerce')
        except:
            pass
    
    trades_df['date'] = pd.to_datetime(trades_df['datetime'].dt.date)
    min_t = trades_df['date'].min().date()
    max_t = trades_df['date'].max().date()
    unique_days = trades_df['date'].nunique()
    print(f"Trades data covers: {min_t} to {max_t} — {unique_days} unique days")
else:
    print("\n⚠️ No time column found — skipping datetime conversion")
    trades_df['datetime'] = pd.NaT
    trades_df['date'] = pd.NaT

# 3b. Detect and standardize side column
if side_col:
    print(f"\nSide column unique values: {trades_df[side_col].unique().tolist()}")
    unique_sides = set(str(v).strip().upper() for v in trades_df[side_col].dropna().unique())
    if 'BUY' in unique_sides or 'SELL' in unique_sides:
        trades_df['side'] = trades_df[side_col].astype(str).str.strip().str.upper().map(
            {'BUY': 'LONG', 'SELL': 'SHORT'}
        )
        print("  Mapped BUY→LONG, SELL→SHORT")
    elif 'LONG' in unique_sides or 'SHORT' in unique_sides:
        trades_df['side'] = trades_df[side_col].astype(str).str.strip().str.upper()
        print("  Values already LONG/SHORT — kept as is")
    elif 'A' in unique_sides or 'B' in unique_sides:
        trades_df['side'] = trades_df[side_col].astype(str).str.strip().str.upper().map(
            {'A': 'LONG', 'B': 'SHORT', 'ASK': 'SHORT', 'BID': 'LONG'}
        )
        print("  Mapped A/B style to LONG/SHORT")
    else:
        print(f"  ⚠️ Unknown side values: {unique_sides} — mapping first unique to LONG, second to SHORT")
        side_list = list(unique_sides)
        mapping = {side_list[i]: ('LONG' if i == 0 else 'SHORT') for i in range(len(side_list))}
        print(f"  Applied mapping: {mapping}")
        trades_df['side'] = trades_df[side_col].astype(str).str.strip().str.upper().map(mapping)
    print(f"  Final side values: {trades_df['side'].unique().tolist()}")
else:
    print("\n⚠️ No side column found")
    trades_df['side'] = 'UNKNOWN'

# 3c. Clean numeric columns
print("\nCleaning numeric columns:")
for col_name, col_actual, fill_method in [
    ('closedPnL', pnl_col,      'zero'),
    ('size',      size_col,     'median'),
    ('leverage',  leverage_col, 'median'),
]:
    if col_actual is None:
        print(f"  {col_name}: column not found — creating with zeros")
        if col_name not in trades_df.columns:
            trades_df[col_name] = 0.0
        continue
    
    original_col = trades_df[col_actual].copy()
    trades_df[col_name] = pd.to_numeric(trades_df[col_actual], errors='coerce')
    coerced = trades_df[col_name].isna().sum()
    
    if fill_method == 'zero':
        trades_df[col_name] = trades_df[col_name].fillna(0)
    else:
        med_val = trades_df[col_name].median()
        trades_df[col_name] = trades_df[col_name].fillna(med_val)
    
    print(f"  {col_name} (from '{col_actual}'): {coerced} values coerced/filled (method={fill_method})")

# 3d. Filter to CLOSED trades using event column
if event_col:
    print(f"\nEvent column '{event_col}' unique values: {trades_df[event_col].unique().tolist()}")
    shape_before = trades_df.shape
    
    event_vals = set(str(v).strip().upper() for v in trades_df[event_col].dropna().unique())
    
    if 'TRADE' in event_vals:
        trades_df = trades_df[trades_df[event_col].astype(str).str.strip().str.upper() == 'TRADE']
        print(f"  Filter applied: event == 'TRADE'")
    elif 'FILL' in event_vals:
        trades_df = trades_df[trades_df[event_col].astype(str).str.strip().str.upper() == 'FILL']
        print(f"  Filter applied: event == 'FILL'")
    elif 'CLOSED' in event_vals or 'CLOSE' in event_vals:
        trades_df = trades_df[trades_df[event_col].astype(str).str.strip().str.upper().isin(['CLOSED', 'CLOSE'])]
        print(f"  Filter applied: event in ['CLOSED', 'CLOSE']")
    else:
        print(f"  Could not determine clear closed-trade filter from values: {event_vals}")
        print(f"  Keeping all rows (no filter applied)")
    
    print(f"  Shape before filter: {shape_before[0]} rows")
    print(f"  Shape after filter:  {trades_df.shape[0]} rows")
else:
    print("\n⚠️ No event column found — skipping event filter")

# 3e. Ensure account and symbol columns exist
if account_col and account_col != 'account':
    trades_df['account'] = trades_df[account_col]
elif account_col is None:
    trades_df['account'] = 'unknown'

if symbol_col and symbol_col != 'symbol':
    trades_df['symbol'] = trades_df[symbol_col]
elif symbol_col is None:
    trades_df['symbol'] = 'unknown'

print(f"\nFinal trades DataFrame info:")
print(f"  Shape: {trades_df.shape[0]} rows, {trades_df.shape[1]} columns")
if 'date' in trades_df.columns and trades_df['date'].notna().any():
    print(f"  Date range: {trades_df['date'].min().date()} to {trades_df['date'].max().date()}")
print(f"  Unique accounts: {trades_df['account'].nunique()}")
print(f"  Unique symbols:  {trades_df['symbol'].nunique()}")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4 — BUILD KEY METRICS
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "="*60)
print("  STEP 4 — BUILD KEY METRICS (trader_daily)")
print("="*60)

# Ensure required columns exist
for col in ['closedPnL', 'size', 'leverage', 'side']:
    if col not in trades_df.columns:
        print(f"  ⚠️ Creating missing column: {col}")
        trades_df[col] = 0 if col == 'closedPnL' else ('LONG' if col == 'side' else 1.0)

trader_daily = trades_df.groupby(['account', 'date']).agg(
    daily_pnl      = ('closedPnL', 'sum'),
    trade_count    = ('closedPnL', 'count'),
    avg_trade_size = ('size',      'mean'),
    avg_leverage   = ('leverage',  'mean'),
    long_count     = ('side',      lambda x: (x == 'LONG').sum()),
    short_count    = ('side',      lambda x: (x == 'SHORT').sum()),
    win_trades     = ('closedPnL', lambda x: (x > 0).sum()),
).reset_index()

# 4b. Derived columns
trader_daily['win_rate']         = trader_daily['win_trades'] / trader_daily['trade_count']
trader_daily['long_short_ratio'] = trader_daily['long_count'] / (trader_daily['short_count'] + 1)
trader_daily['is_profitable']    = (trader_daily['daily_pnl'] > 0).astype(int)

print(f"\ntrader_daily shape: {trader_daily.shape[0]} rows, {trader_daily.shape[1]} columns")
print(f"\nFirst 10 rows:")
print(trader_daily.head(10).to_string())
print(f"\ntrader_daily describe:")
print(trader_daily.describe().to_string())

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5 — MERGE SENTIMENT INTO TRADER DATA
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "="*60)
print("  STEP 5 — MERGE SENTIMENT INTO TRADER DATA")
print("="*60)

merged_df = pd.merge(
    trader_daily,
    fear_df[['date', 'value', 'classification', 'sentiment']],
    on='date',
    how='left'
)

total_rows = len(merged_df)
null_sentiment = merged_df['sentiment'].isna().sum()
matched = total_rows - null_sentiment
match_pct = (matched / total_rows * 100) if total_rows > 0 else 0

print(f"\nTotal rows in merged_df: {total_rows}")
print(f"Rows with NULL sentiment: {null_sentiment}")
print(f"{matched} out of {total_rows} trader-days matched with sentiment data ({match_pct:.1f}%)")

if match_pct < 80:
    print("⚠️ WARNING: Low match rate — check date formats")

# 5c. Drop rows where sentiment is NULL
merged_df = merged_df.dropna(subset=['sentiment'])
print(f"\nAfter dropping NULL sentiment rows, shape: {merged_df.shape}")

# 5d. Final breakdown
print("\nBreakdown by sentiment:")
breakdown = merged_df.groupby('sentiment').agg(
    days        = ('date',        'nunique'),
    traders     = ('account',     'nunique'),
    total_trades= ('trade_count', 'sum'),
    avg_pnl     = ('daily_pnl',   'mean')
).reset_index()
print(breakdown.to_string(index=False))

# ─────────────────────────────────────────────────────────────────────────────
# STEP 6 — SAVE OUTPUTS
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "="*60)
print("  STEP 6 — SAVING OUTPUTS")
print("="*60)

merged_df.to_csv(f'{ROOT_DIR}\\merged_trader_sentiment.csv',  index=False)
trader_daily.to_csv(f'{ROOT_DIR}\\trader_daily_metrics.csv', index=False)
fear_df.to_csv(f'{ROOT_DIR}\\fear_greed_clean.csv',          index=False)
print("  Saved: merged_trader_sentiment.csv")
print("  Saved: trader_daily_metrics.csv")
print("  Saved: fear_greed_clean.csv")

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1 SUMMARY
# ─────────────────────────────────────────────────────────────────────────────

# Metrics for summary
sentiment_rows   = len(fear_df)
sent_min         = fear_df['date'].min().date()
sent_max         = fear_df['date'].max().date()
trade_rows_raw   = len(pd.read_csv(TRADES_FILE))
trade_rows_clean = len(trades_df)
unique_traders   = trades_df['account'].nunique()
unique_days_t    = trades_df['date'].nunique() if 'date' in trades_df.columns else 0
merged_rows      = len(merged_df)
match_rate_final = (matched / total_rows * 100) if total_rows > 0 else 0

fear_days    = int(fear_df[fear_df['sentiment'] == 'Fear'].shape[0])
neutral_days = int(fear_df[fear_df['sentiment'] == 'Neutral'].shape[0])
greed_days   = int(fear_df[fear_df['sentiment'] == 'Greed'].shape[0])

print(f"""
╔══════════════════════════════════════════╗
║           PHASE 1 COMPLETE               ║
╠══════════════════════════════════════════╣
║ Sentiment rows:        {str(sentiment_rows).ljust(16)}  ║
║ Sentiment date range:  {str(sent_min)} to {str(sent_max)[:10]} ║
║ Trade rows (raw):      {str(trade_rows_raw).ljust(16)}  ║
║ Trade rows (clean):    {str(trade_rows_clean).ljust(16)}  ║
║ Unique traders:        {str(unique_traders).ljust(16)}  ║
║ Unique trading days:   {str(unique_days_t).ljust(16)}  ║
║ Merged rows:           {str(merged_rows).ljust(16)}  ║
║ Sentiment match rate:  {f'{match_rate_final:.1f}%'.ljust(16)}  ║
║ Fear days:             {str(fear_days).ljust(16)}  ║
║ Neutral days:          {str(neutral_days).ljust(16)}  ║
║ Greed days:            {str(greed_days).ljust(16)}  ║
╚══════════════════════════════════════════╝
""")

