-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    game_type VARCHAR(50) NOT NULL,
    entry_fee INTEGER NOT NULL DEFAULT 0,
    prize_pool INTEGER NOT NULL DEFAULT 0,
    max_participants INTEGER NOT NULL DEFAULT 100,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming', -- upcoming, active, completed, cancelled
    tournament_type VARCHAR(20) NOT NULL DEFAULT 'leaderboard', -- leaderboard, bracket, elimination
    rules JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournament participants table
CREATE TABLE IF NOT EXISTS tournament_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    rank INTEGER,
    prize_won INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, user_id)
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50) NOT NULL, -- daily, weekly, special
    game_type VARCHAR(50), -- null means all games
    target_type VARCHAR(50) NOT NULL, -- win_amount, games_played, streak, multiplier
    target_value INTEGER NOT NULL,
    reward_type VARCHAR(20) NOT NULL DEFAULT 'coins', -- coins, xp, badge
    reward_amount INTEGER NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_completions INTEGER DEFAULT 1, -- how many times can be completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge progress table
CREATE TABLE IF NOT EXISTS challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    leaderboard_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly, all_time
    game_type VARCHAR(50), -- null means all games
    metric VARCHAR(50) NOT NULL, -- total_winnings, biggest_win, games_won, level
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    prize_pool INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard entries table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_id UUID NOT NULL REFERENCES leaderboards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    rank INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(leaderboard_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_game_type ON tournaments(game_type);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_score ON tournament_participants(score DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id ON challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score ON leaderboard_entries(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_leaderboard_id ON leaderboard_entries(leaderboard_id);

-- Insert some sample challenges
INSERT INTO challenges (name, description, challenge_type, game_type, target_type, target_value, reward_type, reward_amount, start_time, end_time) VALUES
('Daily Winner', 'Win 1000 coins in any game today', 'daily', NULL, 'win_amount', 1000, 'coins', 500, NOW(), NOW() + INTERVAL '1 day'),
('Slot Master', 'Play 10 slot machine games', 'daily', 'slots', 'games_played', 10, 'coins', 200, NOW(), NOW() + INTERVAL '1 day'),
('High Roller', 'Win with a 5x multiplier or higher', 'daily', NULL, 'multiplier', 5, 'coins', 1000, NOW(), NOW() + INTERVAL '1 day'),
('Weekly Grinder', 'Play 50 games this week', 'weekly', NULL, 'games_played', 50, 'coins', 2000, NOW(), NOW() + INTERVAL '7 days'),
('Crash Expert', 'Cash out at 10x or higher in Crash', 'weekly', 'crash', 'multiplier', 10, 'coins', 5000, NOW(), NOW() + INTERVAL '7 days');

-- Insert sample leaderboards
INSERT INTO leaderboards (name, leaderboard_type, game_type, metric, start_time, end_time, prize_pool) VALUES
('Daily Winners', 'daily', NULL, 'total_winnings', NOW(), NOW() + INTERVAL '1 day', 10000),
('Weekly High Rollers', 'weekly', NULL, 'biggest_win', NOW(), NOW() + INTERVAL '7 days', 50000),
('Crash Champions', 'weekly', 'crash', 'total_winnings', NOW(), NOW() + INTERVAL '7 days', 25000),
('All-Time Legends', 'all_time', NULL, 'total_winnings', NULL, NULL, 0);

-- Insert a sample tournament
INSERT INTO tournaments (name, description, game_type, entry_fee, prize_pool, max_participants, start_time, end_time, status) VALUES
('Weekend Slots Tournament', 'Compete for the highest winnings in slot machines this weekend!', 'slots', 100, 10000, 50, NOW() + INTERVAL '1 day', NOW() + INTERVAL '3 days', 'upcoming');
