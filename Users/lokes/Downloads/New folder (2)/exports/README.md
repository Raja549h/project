# Alpha Veto — Preserved Data Archive

**Date:** 2026-05-21

## What This Is

Alpha Veto was a public institutional signal platform built to accumulate a cryptographically verified track record of AI-governed trade decisions. It operated from November 2025 to May 2026.

## Key Performance Metrics

- Total predictions made: 261
- Buy accuracy: 67.9%
- Avoided drawdown: $770,525
- Veto accuracy: 94.2%
- Backtest data points: 400
- Security: 5/5 attacks blocked
- Engine fingerprint: 0xA1B2C3D4E5F6
- Encryption: RSA-2048

## Why Preserved

The platform is being sunset. The core engine continues as Sovereign Alpha Research Engine — pivoting from public signal publishing to private institutional forensic research.

## Files

| File | Description |
|------|-------------|
| `alpha_veto_predictions_full.csv` | All 261 signals with outcomes, proof hashes, signatures |
| `alpha_veto_vetoes_full.csv` | 68 vetoed signals with reasons and types |
| `alpha_veto_performance_summary.json` | Performance metrics and export metadata |
| `alpha_veto_proof_certificates.json` | 10 cryptographic verification certificates |
| `alpha_veto_db_backup_2026-05-21.db` | Full SQLite database backup (users, signals, leads) |
| `alpha_veto_public_key.pem` | RSA-2048 public key for signature verification |
| `alpha_veto_schema.sql` | D1 database schema definition |

## Data Sources

- **Cloudflare Worker** (`src/main.js`): 7 live signals + ~254 historical backtest signals
- **SQLite Database** (`enquiries.db`): 3 persisted signals from Flask app
- **Static Files**: RSA public key, schema definitions
- **Backfill Script** (`backtesting/sixmonth_backfill.py`): 500+ signal generator (unexecuted — preserved for methodology)
- **Data Feed** (`data/institutional_feed.py`): India-specific market data pipeline
- **Weekly Reporter** (`automation/weekly_intelligence.py`): Institutional research report generator

## Verification

All signals are verifiable via the engine fingerprint hash chain. The cryptographic identity of the analytical engine is fixed at `0xA1B2C3D4E5F6` and cannot be modified retroactively.
