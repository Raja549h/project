-- Alpha Veto D1 Database Schema

-- Users table for institutional login
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    company TEXT,
    designation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Signals table
CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    signal_id TEXT UNIQUE NOT NULL,
    ticker TEXT NOT NULL,
    signal_type TEXT NOT NULL,
    direction TEXT,
    confidence REAL NOT NULL,
    timestamp DATETIME NOT NULL,
    market_regime TEXT,
    proof_hash TEXT NOT NULL,
    signature TEXT NOT NULL,
    public_key_fingerprint TEXT NOT NULL,
    data_sources TEXT,
    outcome TEXT DEFAULT 'PENDING',
    outcome_timestamp DATETIME
);

-- Institutional leads table
CREATE TABLE IF NOT EXISTS institutional_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    designation TEXT,
    firm_type TEXT,
    aum_range TEXT,
    interest_area TEXT,
    message TEXT,
    ip_address TEXT,
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_signal_id ON signals(signal_id);
CREATE INDEX IF NOT EXISTS idx_ticker ON signals(ticker);
CREATE INDEX IF NOT EXISTS idx_timestamp ON signals(timestamp);