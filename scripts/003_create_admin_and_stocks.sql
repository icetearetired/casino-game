-- Admin/Tester accounts system
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_tester BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_infinite_funds BOOLEAN DEFAULT false;

-- Fake Stock Market
CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  current_price DECIMAL(12, 2) NOT NULL,
  previous_price DECIMAL(12, 2) NOT NULL,
  high_24h DECIMAL(12, 2),
  low_24h DECIMAL(12, 2),
  volume_24h BIGINT DEFAULT 0,
  market_cap BIGINT,
  change_percent DECIMAL(8, 4) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID NOT NULL REFERENCES stocks(id),
  price DECIMAL(12, 2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  stock_id UUID NOT NULL REFERENCES stocks(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  average_buy_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stock_id)
);

CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  stock_id UUID NOT NULL REFERENCES stocks(id),
  transaction_type VARCHAR(10) NOT NULL, -- buy, sell
  quantity INTEGER NOT NULL,
  price_per_share DECIMAL(12, 2) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some initial stocks
INSERT INTO stocks (symbol, name, current_price, previous_price, high_24h, low_24h, market_cap) VALUES
('LCKY', 'Lucky Casino Inc', 150.00, 145.00, 155.00, 140.00, 15000000000),
('GOLD', 'Digital Gold Corp', 500.00, 495.00, 510.00, 480.00, 50000000000),
('DICE', 'Dice Gaming Ltd', 25.50, 24.00, 27.00, 23.50, 2500000000),
('CHIP', 'Casino Chips Co', 75.00, 72.50, 78.00, 70.00, 7500000000),
('JACK', 'Jackpot Holdings', 200.00, 195.00, 210.00, 190.00, 20000000000),
('SPIN', 'SpinWin Tech', 45.00, 43.50, 47.00, 42.00, 4500000000),
('BETS', 'BetSmart Inc', 120.00, 118.00, 125.00, 115.00, 12000000000),
('RAKE', 'Rake Analytics', 85.00, 82.00, 88.00, 80.00, 8500000000)
ON CONFLICT (symbol) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stock_history_stock ON stock_history(stock_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_time ON stock_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_stocks_user ON user_stocks(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_user ON stock_transactions(user_id);
