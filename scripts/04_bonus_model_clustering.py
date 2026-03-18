import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (classification_report, confusion_matrix,
                             roc_auc_score, roc_curve)
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

ROOT_DIR   = r'c:\Users\Anant\OneDrive\Desktop\PrimeTrade'
DATA_DIR   = ROOT_DIR + r'\data\processed'
RAW_DIR    = ROOT_DIR + r'\data\raw'
CHARTS_DIR = ROOT_DIR + r'\charts'
COLORS     = {'Fear': '#E05C5C', 'Neutral': '#F0A500', 'Greed': '#3BAF7E'}
plt.style.use('seaborn-v0_8-whitegrid')

# ─────────────────────────────────────────────────────────────────────────────
# LOAD ENRICHED DATA
# ─────────────────────────────────────────────────────────────────────────────

print("=" * 65)
print("  BONUS — PREDICTIVE MODEL + CLUSTERING")
print("=" * 65)

df = pd.read_csv(f'{ROOT_DIR}\\merged_trader_sentiment_v2.csv')
df['date'] = pd.to_datetime(df['date'])

print(f"\nLoaded merged_trader_sentiment_v2.csv: {df.shape}")
print(f"Columns: {df.columns.tolist()}")

# ─────────────────────────────────────────────────────────────────────────────
# BONUS 1 — PREDICTIVE MODEL: Next-day profitability
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "=" * 65)
print("  BONUS 1 — RANDOM FOREST: Predict Next-Day Profitability")
print("=" * 65)

# --- Feature Engineering ---
# Sort by account and date so we can shift for next-day target
df_sorted = df.sort_values(['account', 'date']).copy()

# Encode sentiment
sent_map = {'Fear': 0, 'Neutral': 1, 'Greed': 2}
df_sorted['sentiment_enc'] = df_sorted['sentiment'].map(sent_map)

# Create next-day target within each account group
df_sorted['next_is_profitable'] = df_sorted.groupby('account')['is_profitable'].shift(-1)
df_sorted['next_daily_pnl']     = df_sorted.groupby('account')['daily_pnl'].shift(-1)

# Drop NaNs from shift (last day per trader has no "next day")
df_model = df_sorted.dropna(subset=['next_is_profitable', 'next_daily_pnl']).copy()
df_model['next_is_profitable'] = df_model['next_is_profitable'].astype(int)

# PnL volatility bucket (low/medium/high) — alternative target
pnl_vol = df_sorted.groupby('account')['daily_pnl'].transform('std')
df_model['pnl_volatility'] = pnl_vol
df_model['vol_bucket'] = pd.qcut(
    df_model['pnl_volatility'].rank(method='first'),
    q=3, labels=['Low Vol', 'Medium Vol', 'High Vol']
)

print(f"\nModel dataset shape: {df_model.shape}")
print(f"Target (next_is_profitable) distribution:")
print(df_model['next_is_profitable'].value_counts().to_string())
print(f"\nVol bucket distribution:")
print(df_model['vol_bucket'].value_counts().to_string())

# --- Feature set ---
FEATURES = [
    'daily_pnl', 'trade_count', 'avg_trade_size',
    'win_rate', 'long_short_ratio', 'is_profitable',
    'long_count', 'short_count', 'win_trades',
    'sentiment_enc', 'value'
]
# Verify all features exist
FEATURES = [f for f in FEATURES if f in df_model.columns]
print(f"\nFeatures used ({len(FEATURES)}): {FEATURES}")

X = df_model[FEATURES].copy()
y_profit = df_model['next_is_profitable'].copy()

# Impute any remaining NaN
X = X.fillna(X.median())

# --- MODEL 1: Predict next-day profitability ---
print("\n" + "-" * 50)
print("  Model 1: Predict Next-Day Profitability (binary)")
print("-" * 50)

rf = RandomForestClassifier(
    n_estimators=300,
    max_depth=6,
    min_samples_leaf=5,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(rf, X, y_profit, cv=cv, scoring='roc_auc')

print(f"\n5-Fold CV ROC-AUC scores: {cv_scores.round(4)}")
print(f"Mean AUC:  {cv_scores.mean():.4f}")
print(f"Std  AUC:  {cv_scores.std():.4f}")

# Full fit for feature importance and confusion matrix
rf.fit(X, y_profit)
y_pred  = rf.predict(X)
y_proba = rf.predict_proba(X)[:, 1]

print(f"\nFull-data classification report (train):")
print(classification_report(y_profit, y_pred, target_names=['Not Profitable', 'Profitable']))

# ROC AUC on full data
full_auc = roc_auc_score(y_profit, y_proba)
print(f"Full-data ROC-AUC: {full_auc:.4f}")

# Feature importances
feat_imp = pd.DataFrame({
    'feature': FEATURES,
    'importance': rf.feature_importances_
}).sort_values('importance', ascending=False)

print("\nFeature Importances:")
print(feat_imp.to_string(index=False))

# Chart 9 — Feature importance + Confusion matrix + ROC curve
fig, axes = plt.subplots(1, 3, figsize=(18, 6))
fig.suptitle('Chart 9: Random Forest — Next-Day Profitability Prediction',
             fontsize=14, fontweight='bold')

# (a) Feature importances
axes[0].barh(feat_imp['feature'], feat_imp['importance'],
             color='#3BAF7E', edgecolor='white')
axes[0].set_xlabel('Importance')
axes[0].set_title('Feature Importances')
axes[0].invert_yaxis()
for i, (feat, imp) in enumerate(zip(feat_imp['feature'], feat_imp['importance'])):
    axes[0].text(imp + 0.002, i, f'{imp:.3f}', va='center', fontsize=8)

# (b) Confusion matrix
cm = confusion_matrix(y_profit, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[1],
            xticklabels=['Not Profitable', 'Profitable'],
            yticklabels=['Not Profitable', 'Profitable'],
            annot_kws={'size': 12})
axes[1].set_title('Confusion Matrix (Train)')
axes[1].set_xlabel('Predicted')
axes[1].set_ylabel('Actual')

# (c) ROC curve
fpr, tpr, _ = roc_curve(y_profit, y_proba)
axes[2].plot(fpr, tpr, color='#3BAF7E', linewidth=2,
             label=f'ROC AUC = {full_auc:.3f}')
axes[2].plot([0, 1], [0, 1], 'gray', linestyle='--', linewidth=1)
axes[2].fill_between(fpr, tpr, alpha=0.1, color='#3BAF7E')
axes[2].set_xlabel('False Positive Rate')
axes[2].set_ylabel('True Positive Rate')
axes[2].set_title('ROC Curve')
axes[2].legend()

plt.tight_layout()
plt.savefig(f'{ROOT_DIR}\\chart9_random_forest.png', dpi=150, bbox_inches='tight')
plt.close()
print("\nSaved: chart9_random_forest.png")

# --- MODEL 2: Vol bucket prediction ---
print("\n" + "-" * 50)
print("  Model 2: Predict PnL Volatility Bucket (Low/Med/High)")
print("-" * 50)

le = LabelEncoder()
y_vol = le.fit_transform(df_model['vol_bucket'])

gb = GradientBoostingClassifier(
    n_estimators=200, max_depth=4, learning_rate=0.1,
    random_state=42
)
cv_vol = cross_val_score(gb, X, y_vol, cv=StratifiedKFold(5, shuffle=True, random_state=42),
                         scoring='accuracy')
print(f"\n5-Fold CV Accuracy: {cv_vol.round(4)}")
print(f"Mean Accuracy: {cv_vol.mean():.4f} ± {cv_vol.std():.4f}")

gb.fit(X, y_vol)
y_vol_pred = gb.predict(X)
print(f"\nFull-data classification report (vol bucket):")
print(classification_report(y_vol, y_vol_pred,
                            target_names=le.classes_))

# ─────────────────────────────────────────────────────────────────────────────
# BONUS 2 — CLUSTERING: Behavioral Archetypes
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "=" * 65)
print("  BONUS 2 — K-MEANS CLUSTERING: Behavioral Archetypes")
print("=" * 65)

# Build trader-level profile for clustering
trader_profile = df.groupby('account').agg(
    total_pnl          = ('daily_pnl',        'sum'),
    avg_daily_pnl      = ('daily_pnl',        'mean'),
    pnl_std            = ('daily_pnl',        'std'),
    total_trades       = ('trade_count',       'sum'),
    avg_trade_count    = ('trade_count',       'mean'),
    avg_win_rate       = ('win_rate',          'mean'),
    avg_trade_size     = ('avg_trade_size',    'mean'),
    avg_long_ratio     = ('long_short_ratio',  'mean'),
    pct_profitable     = ('is_profitable',     'mean'),
    days_traded        = ('date',             'nunique'),
).reset_index()

# Fill NaN std (single-day traders)
trader_profile['pnl_std'] = trader_profile['pnl_std'].fillna(0)

# Clustering features
CLUSTER_FEATURES = [
    'avg_daily_pnl', 'pnl_std', 'avg_trade_count',
    'avg_win_rate', 'avg_trade_size', 'avg_long_ratio',
    'pct_profitable', 'days_traded'
]

X_clust = trader_profile[CLUSTER_FEATURES].copy().fillna(0)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_clust)

# Elbow + Silhouette to find optimal K
inertias   = []
sil_scores = []
K_range    = range(2, 9)

for k in K_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=15)
    labs = km.fit_predict(X_scaled)
    inertias.append(km.inertia_)
    sil_scores.append(silhouette_score(X_scaled, labs))

best_k = K_range.start + int(np.argmax(sil_scores))
print(f"\nElbow & Silhouette analysis (K=2..8):")
for k, inert, sil in zip(K_range, inertias, sil_scores):
    marker = " <-- BEST" if k == best_k else ""
    print(f"  K={k}: Inertia={inert:,.1f}  Silhouette={sil:.4f}{marker}")

print(f"\nOptimal K selected: {best_k}")

# Final clustering with optimal K
km_final = KMeans(n_clusters=best_k, random_state=42, n_init=20)
trader_profile['cluster'] = km_final.fit_predict(X_scaled)

# Cluster summary
cluster_summary = trader_profile.groupby('cluster')[CLUSTER_FEATURES].mean().round(3)
cluster_summary['count'] = trader_profile.groupby('cluster')['account'].count()
print(f"\nCluster Summary (means):")
print(cluster_summary.to_string())

# Assign archetype labels based on cluster centroids
def label_archetype(row, all_rows):
    """Assign a human-readable archetype name to each cluster."""
    avg_pnl   = all_rows['avg_daily_pnl'].mean()
    avg_wr    = all_rows['avg_win_rate'].mean()
    avg_trades= all_rows['avg_trade_count'].mean()
    avg_std   = all_rows['pnl_std'].mean()

    high_pnl    = row['avg_daily_pnl'] > avg_pnl
    high_wr     = row['avg_win_rate']  > avg_wr
    high_freq   = row['avg_trade_count'] > avg_trades
    high_vol    = row['pnl_std'] > avg_std

    if high_pnl and high_wr:
        return 'Elite Consistent'
    elif high_freq and high_vol:
        return 'Aggressive Scalper'
    elif not high_pnl and not high_wr:
        return 'Struggling Trader'
    elif high_pnl and not high_wr:
        return 'High-Risk Gambler'
    else:
        return 'Steady Accumulator'

cluster_means = trader_profile.groupby('cluster')[CLUSTER_FEATURES].mean()
archetype_map = {
    row: label_archetype(cluster_means.loc[row], cluster_means)
    for row in cluster_means.index
}
trader_profile['archetype'] = trader_profile['cluster'].map(archetype_map)

print(f"\nCluster → Archetype mapping:")
for k, v in archetype_map.items():
    count = (trader_profile['cluster'] == k).sum()
    print(f"  Cluster {k} → '{v}' ({count} traders)")

print(f"\nFull trader archetype table:")
print(trader_profile[['account', 'total_pnl', 'avg_win_rate',
                       'avg_trade_count', 'cluster', 'archetype']].to_string())

# PCA for 2D visualization
pca = PCA(n_components=2, random_state=42)
X_pca = pca.fit_transform(X_scaled)
trader_profile['pca1'] = X_pca[:, 0]
trader_profile['pca2'] = X_pca[:, 1]

print(f"\nPCA explained variance: {pca.explained_variance_ratio_.round(4)}")
print(f"Total variance explained: {pca.explained_variance_ratio_.sum():.4f}")

# Chart 10 — Elbow/Silhouette + PCA cluster scatter + Radar chart
ARCHETYPE_COLORS = {
    'Elite Consistent':   '#2ECC71',
    'Aggressive Scalper': '#E74C3C',
    'Struggling Trader':  '#95A5A6',
    'High-Risk Gambler':  '#E67E22',
    'Steady Accumulator': '#3498DB',
}

fig = plt.figure(figsize=(20, 14))
fig.suptitle('Chart 10: Behavioral Clustering — Trader Archetypes',
             fontsize=16, fontweight='bold')

# (a) Elbow curve
ax1 = fig.add_subplot(2, 3, 1)
ax1.plot(list(K_range), inertias, 'o-', color='#E05C5C', linewidth=2, markersize=6)
ax1.set_xlabel('Number of Clusters (K)')
ax1.set_ylabel('Inertia')
ax1.set_title('Elbow Curve')
ax1.axvline(best_k, color='gray', linestyle='--', linewidth=1, label=f'Best K={best_k}')
ax1.legend()

# (b) Silhouette scores
ax2 = fig.add_subplot(2, 3, 2)
ax2.bar(list(K_range), sil_scores, color='#3BAF7E', edgecolor='white')
ax2.set_xlabel('Number of Clusters (K)')
ax2.set_ylabel('Silhouette Score')
ax2.set_title('Silhouette Analysis')
ax2.axvline(best_k, color='gray', linestyle='--', linewidth=1, label=f'Best K={best_k}')
ax2.legend()
for i, (k, s) in enumerate(zip(K_range, sil_scores)):
    ax2.text(k, s + 0.005, f'{s:.3f}', ha='center', fontsize=8, fontweight='bold')

# (c) PCA 2D scatter
ax3 = fig.add_subplot(2, 3, 3)
for arch in trader_profile['archetype'].unique():
    subset = trader_profile[trader_profile['archetype'] == arch]
    color = ARCHETYPE_COLORS.get(arch, '#888888')
    ax3.scatter(subset['pca1'], subset['pca2'], label=arch,
                color=color, s=120, alpha=0.85, edgecolors='white', linewidth=1.2)
    for _, row in subset.iterrows():
        ax3.annotate(row['account'][:6] + '..',
                     (row['pca1'], row['pca2']),
                     fontsize=6, alpha=0.55,
                     xytext=(3, 3), textcoords='offset points')
ax3.set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]*100:.1f}% var)')
ax3.set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]*100:.1f}% var)')
ax3.set_title('PCA — Trader Clusters')
ax3.legend(fontsize=8, loc='best')

# (d) Cluster heatmap — mean feature values (z-scored)
ax4 = fig.add_subplot(2, 3, 4)
heatmap_data = cluster_means[CLUSTER_FEATURES].copy()
heatmap_data.index = [f"C{i}: {archetype_map[i]}" for i in heatmap_data.index]
sns.heatmap(heatmap_data.T, ax=ax4, cmap='RdYlGn', annot=True, fmt='.2f',
            linewidths=0.5, annot_kws={'size': 8},
            cbar_kws={'shrink': 0.8})
ax4.set_title('Cluster Feature Heatmap')
ax4.tick_params(axis='x', rotation=20, labelsize=8)
ax4.tick_params(axis='y', labelsize=8)

# (e) Archetype bar chart — avg daily PnL
ax5 = fig.add_subplot(2, 3, 5)
arch_pnl = trader_profile.groupby('archetype')['avg_daily_pnl'].mean().sort_values(ascending=True)
arch_colors = [ARCHETYPE_COLORS.get(a, '#888888') for a in arch_pnl.index]
arch_pnl.plot(kind='barh', ax=ax5, color=arch_colors, edgecolor='white')
ax5.set_title('Avg Daily PnL by Archetype')
ax5.set_xlabel('USD')
ax5.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:,.0f}'))
for i, v in enumerate(arch_pnl.values):
    ax5.text(v + abs(v) * 0.02 if v >= 0 else v - abs(v) * 0.1,
             i, f'${v:,.0f}', va='center', fontsize=8, fontweight='bold')

# (f) Archetype count donut
ax6 = fig.add_subplot(2, 3, 6)
arch_counts = trader_profile['archetype'].value_counts()
donut_colors = [ARCHETYPE_COLORS.get(a, '#888888') for a in arch_counts.index]
wedges, texts, autotexts = ax6.pie(
    arch_counts.values, labels=arch_counts.index,
    colors=donut_colors, autopct='%1.0f%%',
    pctdistance=0.75, startangle=90,
    wedgeprops=dict(width=0.55, edgecolor='white', linewidth=2)
)
for t in texts:
    t.set_fontsize(8)
for a in autotexts:
    a.set_fontsize(8)
    a.set_fontweight('bold')
ax6.set_title('Trader Distribution by Archetype')

plt.tight_layout()
plt.savefig(f'{ROOT_DIR}\\chart10_clustering.png', dpi=150, bbox_inches='tight')
plt.close()
print("\nSaved: chart10_clustering.png")

# Save trader profiles with archetypes
trader_profile.to_csv(f'{ROOT_DIR}\\trader_profiles_final.csv', index=False)
print("Updated: trader_profiles_final.csv (with cluster + archetype columns)")

# ─────────────────────────────────────────────────────────────────────────────
# PRINT BONUS SUMMARY
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "=" * 65)
print("  BONUS ANALYSIS COMPLETE")
print("=" * 65)
print(f"""
Model 1 — Random Forest (Next-Day Profitability):
  5-Fold CV ROC-AUC: {cv_scores.mean():.4f} (±{cv_scores.std():.4f})
  Top feature: {feat_imp.iloc[0]['feature']} ({feat_imp.iloc[0]['importance']:.3f})

Model 2 — Gradient Boosting (PnL Vol Bucket):
  5-Fold CV Accuracy: {cv_vol.mean():.4f} (±{cv_vol.std():.4f})

Clustering — K-Means:
  Optimal K: {best_k}
  Best Silhouette Score: {max(sil_scores):.4f}
  Archetypes: {list(archetype_map.values())}

Charts saved:
  chart9_random_forest.png
  chart10_clustering.png
""")
print("=" * 65)

