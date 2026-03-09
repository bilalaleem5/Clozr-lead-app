-- =============================================
-- COMPLETE DATABASE SCHEMA - Run in NeonDB SQL Editor
-- Drop old tables first if they exist
-- =============================================

DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- =============================================
-- 1. LEADS TABLE
-- =============================================
CREATE TABLE leads (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255),
  company     VARCHAR(255),
  industry    VARCHAR(100),
  email       VARCHAR(255),
  phone       VARCHAR(50),
  website     TEXT,
  address     TEXT,
  linkedin_url TEXT,                          -- Added as requested
  rating      NUMERIC(3,1),
  icp_score   INTEGER DEFAULT 0,
  source      VARCHAR(100),                   -- 'Google Maps', 'LinkedIn', etc.
  category    VARCHAR(100),
  country     VARCHAR(100),
  status      VARCHAR(50) DEFAULT 'new',      -- new | contacted | replied | closed
  scraped_at  TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 2. CAMPAIGNS TABLE
-- =============================================
CREATE TABLE campaigns (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(255),
  service_description TEXT,
  tone                VARCHAR(50),            -- 'formal', 'casual', etc.
  special_offer       TEXT,
  channels            TEXT[],                 -- Array: ['email','whatsapp','linkedin']
  status              VARCHAR(50) DEFAULT 'draft',
  created_at          TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 3. MESSAGES TABLE
-- =============================================
CREATE TABLE messages (
  id           SERIAL PRIMARY KEY,
  lead_id      INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id  INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
  channel      VARCHAR(50),                   -- 'email' | 'whatsapp' | 'linkedin'
  content      TEXT NOT NULL,                 -- For email: "SUBJECT: ...\n\nBODY: ..."
  type         VARCHAR(50) DEFAULT 'initial', -- 'initial' | 'followup1' | 'followup2' | 'followup3'
  status       VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'sent' | 'failed'
  sent_at      TIMESTAMP,
  scheduled_at TIMESTAMP,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 4. CONVERSATIONS TABLE
-- =============================================
CREATE TABLE conversations (
  id               SERIAL PRIMARY KEY,
  lead_id          INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  channel          VARCHAR(50),
  direction        VARCHAR(20),               -- 'inbound' | 'outbound'
  content          TEXT,
  intent_score     INTEGER DEFAULT 0,
  escalation_flag  BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 5. ALERTS TABLE
-- =============================================
CREATE TABLE alerts (
  id         SERIAL PRIMARY KEY,
  lead_id    INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  type       VARCHAR(100),
  message    TEXT,
  seen       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INDEXES (Performance)
-- =============================================
CREATE INDEX idx_leads_status     ON leads(status);
CREATE INDEX idx_leads_icp_score  ON leads(icp_score);
CREATE INDEX idx_leads_source     ON leads(source);
CREATE INDEX idx_messages_status  ON messages(status);
CREATE INDEX idx_messages_lead    ON messages(lead_id);
CREATE INDEX idx_messages_channel ON messages(channel);
CREATE INDEX idx_messages_type    ON messages(type);
CREATE INDEX idx_conv_lead        ON conversations(lead_id);
CREATE INDEX idx_alerts_lead      ON alerts(lead_id);
CREATE INDEX idx_alerts_seen      ON alerts(seen);
