-- Clans/Guilds System
CREATE TABLE IF NOT EXISTS clans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  tag VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id),
  logo_url TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_winnings BIGINT DEFAULT 0,
  member_count INTEGER DEFAULT 1,
  max_members INTEGER DEFAULT 50,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clan_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contribution_xp INTEGER DEFAULT 0,
  contribution_winnings BIGINT DEFAULT 0,
  UNIQUE(clan_id, user_id)
);

CREATE TABLE IF NOT EXISTS clan_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users(id),
  invitee_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Live Chat System
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  channel VARCHAR(50) DEFAULT 'global', -- global, clan_{id}, game_{type}
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- text, system, win_announcement
  metadata JSONB,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  banned_by UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  channel VARCHAR(50), -- null = all channels
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral System
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  referral_code VARCHAR(20) NOT NULL,
  bonus_claimed BOOLEAN DEFAULT false,
  bonus_amount INTEGER DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add referral code to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);

-- Loot Crates System
CREATE TABLE IF NOT EXISTS loot_crates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  currency_type VARCHAR(20) DEFAULT 'coins',
  rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loot_crate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crate_id UUID NOT NULL REFERENCES loot_crates(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- coins, xp, avatar, title, multiplier
  item_value JSONB NOT NULL,
  probability DECIMAL(5,4) NOT NULL, -- 0.0001 to 1.0000
  rarity VARCHAR(20) DEFAULT 'common'
);

CREATE TABLE IF NOT EXISTS loot_crate_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  crate_id UUID NOT NULL REFERENCES loot_crates(id),
  item_won JSONB NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Titles/Badges
CREATE TABLE IF NOT EXISTS user_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clan_members_clan ON clan_members(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_user ON clan_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
