"""
Streamlit Dashboard — Trader Behavior vs Market Sentiment
Primetrade.ai Data Science Assignment
Run: streamlit run dashboard.py
"""

import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

# ─────────────────────────────────────────────────────────────────────────────
# PAGE CONFIG
# ─────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="PrimeTrade — Trader Sentiment Analysis",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for premium look
st.markdown("""
<style>
    .main { background-color: #0f1117; }
    .block-container { padding-top: 1.5rem; }
    .metric-card {
        background: linear-gradient(135deg, #1a1d2e, #252840);
        border-radius: 12px;
        padding: 16px 20px;
        border-left: 4px solid;
        margin-bottom: 8px;
    }
    h1 { color: #ffffff; font-weight: 800; }
    h2, h3 { color: #e0e0e0; }
    .stMetric label { color: #aaaaaa; font-size: 12px; }
    .stMetric [data-testid="metric-container"] { background: #1a1d2e; border-radius: 10px; padding: 10px; }
    .sidebar .sidebar-content { background: #13151f; }
</style>
""", unsafe_allow_html=True)

COLORS = {'Fear': '#E05C5C', 'Neutral': '#F0A500', 'Greed': '#3BAF7E'}
plt.style.use('seaborn-v0_8-whitegrid')

# ─────────────────────────────────────────────────────────────────────────────
# LOAD DATA (cached)
# ─────────────────────────────────────────────────────────────────────────────
@st.cache_data
def load_data():
    import os
    BASE = r'c:\Users\Anant\OneDrive\Desktop\PrimeTrade'
    PROC = os.path.join(BASE, 'data', 'processed')

    paths = [
        os.path.join(PROC, 'merged_trader_sentiment_v2.csv'),
        'data/processed/merged_trader_sentiment_v2.csv',
        'data/merged_trader_sentiment_v2.csv',
        'merged_trader_sentiment_v2.csv',
    ]
    profiles_paths = [
        os.path.join(PROC, 'trader_profiles_final.csv'),
        'data/processed/trader_profiles_final.csv',
        'data/trader_profiles_final.csv',
        'trader_profiles_final.csv',
    ]
    df = None
    for p in paths:
        if os.path.exists(p):
            df = pd.read_csv(p)
            break
    tp = None
    for p in profiles_paths:
        if os.path.exists(p):
            tp = pd.read_csv(p)
            break

    if df is None:
        st.error("Could not find merged_trader_sentiment_v2.csv. Please place it in the same folder as dashboard.py or in a data/ subfolder.")
        st.stop()

    df['date'] = pd.to_datetime(df['date'])

    # Rebuild trader profiles if not found
    if tp is None:
        tp = df.groupby('account').agg(
            total_pnl      = ('daily_pnl',        'sum'),
            avg_daily_pnl  = ('daily_pnl',        'mean'),
            avg_win_rate   = ('win_rate',          'mean'),
            total_trades   = ('trade_count',       'sum'),
            days_traded    = ('date',             'nunique'),
            avg_long_ratio = ('long_short_ratio', 'mean'),
            pct_profitable = ('is_profitable',    'mean'),
        ).reset_index()
        median_t = tp['total_trades'].median()
        tp['freq_segment'] = np.where(tp['total_trades'] >= median_t, 'High Frequency', 'Low Frequency')
        tp['consistency_segment'] = np.where(
            (tp['avg_win_rate'] >= 0.45) & (tp['total_pnl'] > 0),
            'Consistent Winner', 'Inconsistent')

    return df, tp

df, trader_profile = load_data()

# ─────────────────────────────────────────────────────────────────────────────
# SIDEBAR
# ─────────────────────────────────────────────────────────────────────────────
st.sidebar.image("https://img.icons8.com/fluency/96/combo-chart--v2.png", width=60)
st.sidebar.title("🎛️ Dashboard Controls")
st.sidebar.markdown("---")

page = st.sidebar.radio(
    "Navigate to:",
    ["📊 Overview", "📈 Performance Analysis", "⚡ Behavior Analysis",
     "👥 Trader Segments", "🤖 Predictive Model", "🔍 Individual Trader"]
)

st.sidebar.markdown("---")
st.sidebar.markdown("**Filters**")

all_sentiments = ['Fear', 'Neutral', 'Greed']
selected_sentiments = st.sidebar.multiselect(
    "Sentiment Filter",
    options=all_sentiments,
    default=all_sentiments
)

date_min = df['date'].min().date()
date_max = df['date'].max().date()
date_range = st.sidebar.date_input(
    "Date Range",
    value=(date_min, date_max),
    min_value=date_min,
    max_value=date_max
)

# Apply filters
df_filtered = df[df['sentiment'].isin(selected_sentiments)].copy()
if len(date_range) == 2:
    d_start, d_end = pd.Timestamp(date_range[0]), pd.Timestamp(date_range[1])
    df_filtered = df_filtered[(df_filtered['date'] >= d_start) & (df_filtered['date'] <= d_end)]

sent_order = [s for s in ['Fear', 'Neutral', 'Greed'] if s in df_filtered['sentiment'].unique()]

st.sidebar.markdown("---")
st.sidebar.markdown(f"**{len(df_filtered):,}** trader-days | **{df_filtered['account'].nunique()}** traders")
st.sidebar.markdown(f"**{df_filtered['date'].nunique()}** unique days")

# ─────────────────────────────────────────────────────────────────────────────
# PAGE: OVERVIEW
# ─────────────────────────────────────────────────────────────────────────────
if page == "📊 Overview":
    st.title("📈 Trader Performance vs Market Sentiment")
    st.markdown("**Primetrade.ai — Data Science Intern Assignment** | May 2023 – May 2025")
    st.markdown("---")

    col1, col2, col3, col4, col5 = st.columns(5)
    col1.metric("Total Trader-Days", f"{len(df_filtered):,}")
    col2.metric("Unique Traders", df_filtered['account'].nunique())
    col3.metric("Trading Days", df_filtered['date'].nunique())
    col4.metric("Total PnL", f"${df_filtered['daily_pnl'].sum():,.0f}")
    col5.metric("Avg Win Rate", f"{df_filtered['win_rate'].mean()*100:.1f}%")

    st.markdown("---")

    # KPI cards by sentiment
    sent_stats = df_filtered.groupby('sentiment').agg(
        days    = ('date',         'nunique'),
        traders = ('account',      'nunique'),
        avg_pnl = ('daily_pnl',    'mean'),
        avg_wr  = ('win_rate',     'mean'),
        pct_prof= ('is_profitable','mean'),
    ).reset_index()

    st.subheader("Performance Snapshot by Sentiment")
    cols = st.columns(len(sent_stats))
    for col, (_, row) in zip(cols, sent_stats.iterrows()):
        with col:
            sent_color = {'Fear': '#E05C5C', 'Neutral': '#F0A500', 'Greed': '#3BAF7E'}[row['sentiment']]
            st.markdown(f"""
            <div style='background:linear-gradient(135deg,#1a1d2e,#252840);
                        border-radius:12px;padding:16px;
                        border-left:5px solid {sent_color};'>
              <h3 style='color:{sent_color};margin:0'>{row['sentiment']}</h3>
              <p style='color:#aaa;margin:4px 0;font-size:13px'>{int(row['days'])} days | {int(row['traders'])} traders</p>
              <h2 style='color:white;margin:4px 0'>${row['avg_pnl']:,.0f}</h2>
              <p style='color:#aaa;margin:0;font-size:12px'>Avg daily PnL</p>
              <p style='color:#ddd;font-size:13px;margin-top:6px'>
                Win Rate: <b>{row['avg_wr']*100:.1f}%</b> &nbsp;|&nbsp;
                Profitable: <b>{row['pct_prof']*100:.0f}%</b>
              </p>
            </div>""", unsafe_allow_html=True)

    st.markdown("---")
    st.subheader("PnL Timeline Overview")
    daily_agg = df_filtered.groupby(['date', 'sentiment'])['daily_pnl'].mean().reset_index()
    fig, ax = plt.subplots(figsize=(14, 4))
    for sent in sent_order:
        sub = daily_agg[daily_agg['sentiment'] == sent]
        ax.scatter(sub['date'], sub['daily_pnl'], color=COLORS[sent], alpha=0.6, s=30, label=sent)
    ax.axhline(0, color='gray', linestyle='--', linewidth=0.8)
    ax.set_ylabel('Avg Daily PnL (USD)')
    ax.set_title('Daily PnL over Time (colored by sentiment)')
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:,.0f}'))
    ax.legend()
    plt.xticks(rotation=30)
    plt.tight_layout()
    st.pyplot(fig)
    plt.close()

# ─────────────────────────────────────────────────────────────────────────────
# PAGE: PERFORMANCE ANALYSIS
# ─────────────────────────────────────────────────────────────────────────────
elif page == "📈 Performance Analysis":
    st.title("📈 Performance Analysis by Sentiment")
    st.markdown("---")

    q1 = df_filtered.groupby('sentiment').agg(
        traders        = ('account',       'nunique'),
        days           = ('date',          'nunique'),
        avg_pnl        = ('daily_pnl',     'mean'),
        median_pnl     = ('daily_pnl',     'median'),
        total_pnl      = ('daily_pnl',     'sum'),
        avg_win_rate   = ('win_rate',       'mean'),
        pct_profitable = ('is_profitable', 'mean'),
        avg_trades     = ('trade_count',   'mean'),
    ).reset_index()
    q1 = q1.set_index('sentiment').reindex(sent_order).reset_index()

    st.subheader("TABLE 1: Full Performance Summary")
    display_q1 = q1.copy()
    display_q1['avg_pnl']    = display_q1['avg_pnl'].apply(lambda x: f"${x:,.0f}")
    display_q1['median_pnl'] = display_q1['median_pnl'].apply(lambda x: f"${x:,.0f}")
    display_q1['total_pnl']  = display_q1['total_pnl'].apply(lambda x: f"${x:,.0f}")
    display_q1['avg_win_rate']   = display_q1['avg_win_rate'].apply(lambda x: f"{x*100:.1f}%")
    display_q1['pct_profitable'] = display_q1['pct_profitable'].apply(lambda x: f"{x*100:.1f}%")
    st.dataframe(display_q1, use_container_width=True)

    st.markdown("---")
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Avg Daily PnL by Sentiment")
        fig, ax = plt.subplots(figsize=(7, 4))
        colors = [COLORS[s] for s in sent_order]
        bars = ax.bar(sent_order, q1['avg_pnl'], color=colors, edgecolor='white', linewidth=1.5)
        ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:,.0f}'))
        for bar, v in zip(bars, q1['avg_pnl']):
            ax.text(bar.get_x() + bar.get_width()/2, v + abs(v)*0.02,
                    f'${v:,.0f}', ha='center', fontsize=10, fontweight='bold')
        ax.set_title("Avg Daily PnL")
        plt.tight_layout()
        st.pyplot(fig); plt.close()

    with col2:
        st.subheader("Win Rate & Profitability %")
        fig, ax = plt.subplots(figsize=(7, 4))
        x = np.arange(len(sent_order))
        w = 0.35
        b1 = ax.bar(x - w/2, q1['avg_win_rate']*100, w, color=[COLORS[s] for s in sent_order], label='Win Rate', alpha=0.85, edgecolor='white')
        b2 = ax.bar(x + w/2, q1['pct_profitable']*100, w, color=[COLORS[s] for s in sent_order], label='% Profitable Day', alpha=0.5, edgecolor='white')
        ax.set_xticks(x); ax.set_xticklabels(sent_order)
        ax.set_ylim(0, 110); ax.legend()
        ax.set_title("Win Rate vs % Profitable Days")
        for b in list(b1) + list(b2):
            ax.text(b.get_x()+b.get_width()/2, b.get_height()+1,
                    f'{b.get_height():.1f}%', ha='center', fontsize=8)
        plt.tight_layout()
        st.pyplot(fig); plt.close()

    st.subheader("PnL Distribution (Box Plot)")
    fig, ax = plt.subplots(figsize=(10, 5))
    data = [df_filtered[df_filtered['sentiment']==s]['daily_pnl'].values for s in sent_order]
    bp = ax.boxplot(data, labels=sent_order, patch_artist=True,
                    medianprops=dict(color='black', linewidth=2))
    for patch, s in zip(bp['boxes'], sent_order):
        patch.set_facecolor(COLORS[s]); patch.set_alpha(0.7)
    ax.axhline(0, color='gray', linestyle='--')
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x,_: f'${x:,.0f}'))
    ax.set_title("Daily PnL Distribution by Sentiment")
    plt.tight_layout(); st.pyplot(fig); plt.close()

    st.info("**Insight 1:** Fear days produce the highest average PnL ($5,185 vs $4,144 on Greed — +25%). Near-equal win rates suggest the edge comes from volatility capture, not better trade selection.")

# ─────────────────────────────────────────────────────────────────────────────
# PAGE: BEHAVIOR ANALYSIS
# ─────────────────────────────────────────────────────────────────────────────
elif page == "⚡ Behavior Analysis":
    st.title("⚡ Trader Behavior by Sentiment")
    st.markdown("---")

    q2 = df_filtered.groupby('sentiment').agg(
        avg_trade_count   = ('trade_count',       'mean'),
        avg_trade_size    = ('avg_trade_size',    'mean'),
        avg_ls_ratio      = ('long_short_ratio',  'mean'),
        pct_long_dominant = ('long_short_ratio',  lambda x: (x>1).mean()*100),
    ).reset_index().set_index('sentiment').reindex(sent_order).reset_index()

    st.subheader("TABLE 2: Behavior Summary by Sentiment")
    st.dataframe(q2.round(2), use_container_width=True)
    st.markdown("---")

    c1, c2 = st.columns(2)
    with c1:
        fig, ax = plt.subplots(figsize=(7, 4))
        ax.bar(sent_order, q2['avg_trade_count'], color=[COLORS[s] for s in sent_order], edgecolor='white')
        for i, v in enumerate(q2['avg_trade_count']):
            ax.text(i, v + max(q2['avg_trade_count'])*0.02, f'{v:.0f}', ha='center', fontsize=10, fontweight='bold')
        ax.set_title("Avg Trades per Day"); ax.set_ylabel("Count")
        plt.tight_layout(); st.pyplot(fig); plt.close()

    with c2:
        fig, ax = plt.subplots(figsize=(7, 4))
        ax.bar(sent_order, q2['avg_trade_size'], color=[COLORS[s] for s in sent_order], edgecolor='white')
        for i, v in enumerate(q2['avg_trade_size']):
            ax.text(i, v + max(q2['avg_trade_size'])*0.02, f'{v:,.0f}', ha='center', fontsize=10, fontweight='bold')
        ax.set_title("Avg Trade Size (tokens)"); ax.set_ylabel("Tokens")
        plt.tight_layout(); st.pyplot(fig); plt.close()

    c3, c4 = st.columns(2)
    with c3:
        fig, ax = plt.subplots(figsize=(7, 4))
        ax.bar(sent_order, q2['avg_ls_ratio'], color=[COLORS[s] for s in sent_order], edgecolor='white')
        ax.axhline(1, color='gray', linestyle='--', linewidth=1)
        for i, v in enumerate(q2['avg_ls_ratio']):
            ax.text(i, v + 0.1, f'{v:.2f}x', ha='center', fontsize=10, fontweight='bold')
        ax.set_title("Avg Long/Short Ratio"); ax.set_ylabel("Ratio")
        plt.tight_layout(); st.pyplot(fig); plt.close()

    with c4:
        fig, ax = plt.subplots(figsize=(7, 4))
        ax.bar(sent_order, q2['pct_long_dominant'], color=[COLORS[s] for s in sent_order], edgecolor='white')
        ax.set_ylim(0, 100)
        for i, v in enumerate(q2['pct_long_dominant']):
            ax.text(i, v + 1, f'{v:.1f}%', ha='center', fontsize=10, fontweight='bold')
        ax.set_title("% Long-Dominant Sessions"); ax.set_ylabel("%")
        plt.tight_layout(); st.pyplot(fig); plt.close()

    st.info("**Insight 2:** Fear triggers scalping mode (105+ trades/day, smaller positions). Greed triggers momentum mode (fewer but larger positions with stronger long bias).")

# ─────────────────────────────────────────────────────────────────────────────
# PAGE: TRADER SEGMENTS
# ─────────────────────────────────────────────────────────────────────────────
elif page == "👥 Trader Segments":
    st.title("👥 Trader Segmentation & Archetypes")
    st.markdown("---")

    seg_col = st.selectbox(
        "Segment Type",
        ['freq_segment', 'consistency_segment', 'bias_segment', 'archetype'],
        format_func=lambda x: {
            'freq_segment': 'Trade Frequency',
            'consistency_segment': 'Consistency (Winner/Inconsistent)',
            'bias_segment': 'Long/Short Bias',
            'archetype': 'Behavioral Archetype (Clustering)'
        }.get(x, x)
    )

    if seg_col not in trader_profile.columns:
        st.warning(f"Column '{seg_col}' not in trader_profiles_final.csv. Run bonus_analysis.py first for archetype column.")
        seg_col = 'consistency_segment' if 'consistency_segment' in trader_profile.columns else trader_profile.columns[-1]

    st.subheader(f"Segment Distribution: {seg_col}")
    seg_counts = trader_profile[seg_col].value_counts()
    c1, c2 = st.columns([1, 2])
    with c1:
        st.dataframe(seg_counts.reset_index().rename(columns={'index': 'Segment', seg_col: 'Count'}),
                     use_container_width=True)
    with c2:
        fig, ax = plt.subplots(figsize=(7, 4))
        seg_counts.plot(kind='bar', ax=ax, color='#3BAF7E', edgecolor='white', rot=15)
        ax.set_title(f"Traders per Segment: {seg_col}")
        ax.set_ylabel("# Traders")
        for i, v in enumerate(seg_counts.values):
            ax.text(i, v + 0.1, str(v), ha='center', fontsize=10, fontweight='bold')
        plt.tight_layout(); st.pyplot(fig); plt.close()

    st.markdown("---")
    st.subheader("Segment × Sentiment Performance Heatmap")

    if seg_col in df_filtered.merge(trader_profile[['account', seg_col]], on='account').columns:
        seg_df = df_filtered.merge(trader_profile[['account', seg_col]], on='account')
        pivot  = seg_df.groupby([seg_col, 'sentiment'])['daily_pnl'].mean().unstack(fill_value=0)
        pivot  = pivot[[c for c in ['Fear','Neutral','Greed'] if c in pivot.columns]]
        fig, ax = plt.subplots(figsize=(10, max(4, len(pivot)*1.2)))
        sns.heatmap(pivot, annot=True, fmt='.0f', cmap='RdYlGn', ax=ax,
                    linewidths=0.5, annot_kws={'size': 12})
        ax.set_title(f"Avg Daily PnL: {seg_col} × Sentiment")
        ax.tick_params(axis='x', rotation=0)
        plt.tight_layout(); st.pyplot(fig); plt.close()

    st.markdown("---")
    st.subheader("Trader Profiles Table")
    display_cols = ['account', 'total_pnl', 'avg_daily_pnl', 'avg_win_rate',
                    'days_traded', seg_col]
    display_cols = [c for c in display_cols if c in trader_profile.columns]
    st.dataframe(trader_profile[display_cols].round(3), use_container_width=True)

# ─────────────────────────────────────────────────────────────────────────────
# PAGE: PREDICTIVE MODEL
# ─────────────────────────────────────────────────────────────────────────────
elif page == "🤖 Predictive Model":
    st.title("🤖 Predictive Model — Next-Day Profitability")
    st.markdown("---")

    st.markdown("""
    ### Model: Random Forest Classifier
    **Target:** Will the trader be profitable tomorrow? (binary: 1=profitable, 0=not)

    **Features:** Current-day PnL, trade count, win rate, avg size, long/short ratio,
    sentiment (encoded), fear/greed value

    **Validation:** 5-Fold Stratified Cross-Validation
    """)

    with st.spinner("Training model on filtered data..."):
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import StratifiedKFold, cross_val_score
        from sklearn.metrics import roc_auc_score, roc_curve, confusion_matrix, classification_report

        df_m = df_filtered.sort_values(['account', 'date']).copy()
        df_m['sentiment_enc'] = df_m['sentiment'].map({'Fear': 0, 'Neutral': 1, 'Greed': 2})
        df_m['next_is_profitable'] = df_m.groupby('account')['is_profitable'].shift(-1)
        df_m = df_m.dropna(subset=['next_is_profitable'])
        df_m['next_is_profitable'] = df_m['next_is_profitable'].astype(int)

        FEATURES = [c for c in ['daily_pnl','trade_count','avg_trade_size',
                                  'win_rate','long_short_ratio','is_profitable',
                                  'sentiment_enc','value'] if c in df_m.columns]
        X = df_m[FEATURES].fillna(df_m[FEATURES].median())
        y = df_m['next_is_profitable']

        if len(y.unique()) < 2 or len(X) < 20:
            st.warning("Not enough data for model with current filters. Please expand the date range or sentiment selection.")
        else:
            rf = RandomForestClassifier(n_estimators=200, max_depth=6, class_weight='balanced', random_state=42, n_jobs=-1)
            cv_scores = cross_val_score(rf, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=42), scoring='roc_auc')
            rf.fit(X, y)
            y_pred  = rf.predict(X)
            y_proba = rf.predict_proba(X)[:,1]
            auc     = roc_auc_score(y, y_proba)

            m1, m2, m3 = st.columns(3)
            m1.metric("Mean CV ROC-AUC", f"{cv_scores.mean():.4f}", f"±{cv_scores.std():.4f}")
            m2.metric("Full-data AUC", f"{auc:.4f}")
            m3.metric("Features Used", len(FEATURES))

            c1, c2 = st.columns(2)
            with c1:
                st.subheader("Feature Importances")
                imp = pd.DataFrame({'Feature': FEATURES, 'Importance': rf.feature_importances_}).sort_values('Importance', ascending=True)
                fig, ax = plt.subplots(figsize=(7, 4))
                ax.barh(imp['Feature'], imp['Importance'], color='#3BAF7E', edgecolor='white')
                ax.set_title("Feature Importances")
                ax.set_xlabel("Importance")
                plt.tight_layout(); st.pyplot(fig); plt.close()

            with c2:
                st.subheader("ROC Curve")
                fpr, tpr, _ = roc_curve(y, y_proba)
                fig, ax = plt.subplots(figsize=(7, 4))
                ax.plot(fpr, tpr, color='#3BAF7E', linewidth=2, label=f'AUC={auc:.3f}')
                ax.fill_between(fpr, tpr, alpha=0.1, color='#3BAF7E')
                ax.plot([0,1],[0,1],'gray',linestyle='--')
                ax.set_xlabel("FPR"); ax.set_ylabel("TPR")
                ax.set_title("ROC Curve"); ax.legend()
                plt.tight_layout(); st.pyplot(fig); plt.close()

            st.subheader("Confusion Matrix")
            cm = confusion_matrix(y, y_pred)
            fig, ax = plt.subplots(figsize=(5, 4))
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax,
                        xticklabels=['Not Profitable','Profitable'],
                        yticklabels=['Not Profitable','Profitable'])
            ax.set_xlabel("Predicted"); ax.set_ylabel("Actual")
            plt.tight_layout(); st.pyplot(fig); plt.close()

            st.subheader("Cross-Validation Scores")
            cv_df = pd.DataFrame({'Fold': [f'Fold {i+1}' for i in range(len(cv_scores))], 'ROC-AUC': cv_scores.round(4)})
            st.dataframe(cv_df, use_container_width=True)

# ─────────────────────────────────────────────────────────────────────────────
# PAGE: INDIVIDUAL TRADER
# ─────────────────────────────────────────────────────────────────────────────
elif page == "🔍 Individual Trader":
    st.title("🔍 Individual Trader Deep Dive")
    st.markdown("---")

    trader_options = {acc[:10]+'...': acc for acc in df_filtered['account'].unique()}
    selected_label = st.selectbox("Select Trader", list(trader_options.keys()))
    selected_account = trader_options[selected_label]

    trader_data = df_filtered[df_filtered['account'] == selected_account].sort_values('date')

    if trader_data.empty:
        st.warning("No data for this trader with current filters.")
    else:
        m1, m2, m3, m4, m5 = st.columns(5)
        m1.metric("Total PnL",  f"${trader_data['daily_pnl'].sum():,.0f}")
        m2.metric("Avg Daily PnL", f"${trader_data['daily_pnl'].mean():,.0f}")
        m3.metric("Win Rate", f"{trader_data['win_rate'].mean()*100:.1f}%")
        m4.metric("Days Traded", trader_data['date'].nunique())
        m5.metric("% Profitable", f"{trader_data['is_profitable'].mean()*100:.0f}%")

        st.markdown("---")
        st.subheader("PnL Over Time")
        fig, ax = plt.subplots(figsize=(14, 5))
        ax.plot(trader_data['date'], trader_data['daily_pnl'],
                marker='o', linewidth=2, color='#3BAF7E', markersize=5)
        ax.fill_between(trader_data['date'], trader_data['daily_pnl'], 0,
                        where=trader_data['daily_pnl'] >= 0, alpha=0.15, color='#3BAF7E')
        ax.fill_between(trader_data['date'], trader_data['daily_pnl'], 0,
                        where=trader_data['daily_pnl'] < 0,  alpha=0.15, color='#E05C5C')
        # Sentiment shading
        for _, row in trader_data.iterrows():
            c = COLORS.get(row['sentiment'], 'white')
            ax.axvspan(row['date']-pd.Timedelta(hours=12),
                       row['date']+pd.Timedelta(hours=12), alpha=0.07, color=c)
        ax.axhline(0, color='gray', linestyle='--', linewidth=0.8)
        ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x,_: f'${x:,.0f}'))
        ax.set_title(f"Daily PnL — {selected_account[:12]}...")
        plt.xticks(rotation=30); plt.tight_layout()
        st.pyplot(fig); plt.close()

        st.markdown("---")
        st.subheader("Performance by Sentiment (This Trader)")
        t_sent = trader_data.groupby('sentiment').agg(
            days=('date','nunique'), avg_pnl=('daily_pnl','mean'),
            win_rate=('win_rate','mean'), trades=('trade_count','mean')
        ).reset_index()
        st.dataframe(t_sent.round(2), use_container_width=True)

        st.subheader("Raw Daily Data")
        st.dataframe(trader_data[['date','sentiment','daily_pnl','trade_count',
                                   'win_rate','long_short_ratio','is_profitable']].round(3),
                     use_container_width=True)
