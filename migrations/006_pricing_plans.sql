-- Create pricing_plans for server-validated purchases
CREATE TABLE IF NOT EXISTS pricing_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  price_in_inr INTEGER NOT NULL CHECK (price_in_inr >= 0), -- rupees
  price_in_usd INTEGER,
  features TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER pricing_plans_updated_at
BEFORE UPDATE ON pricing_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

-- Public can read active plans
CREATE POLICY IF NOT EXISTS "Public read active pricing plans"
  ON pricing_plans FOR SELECT
  USING (is_active = TRUE);

-- Admin manage plans
CREATE POLICY IF NOT EXISTS "Admins manage pricing plans"
  ON pricing_plans FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));

-- Seed 3 default tiers
INSERT INTO pricing_plans (id, name, credits, price_in_inr, price_in_usd, features, is_popular)
VALUES
  ('1000', '1,000 Credits', 1000, 999, 15, ARRAY['Approx 250 credits per storyboard','Standard exports','Email support'], FALSE),
  ('3000', '3,000 Credits (10% OFF)', 3000, 2699, 41, ARRAY['Approx 250 credits per storyboard','Standard exports','Email support'], TRUE),
  ('5000', '5,000 Credits (20% OFF)', 5000, 3999, 60, ARRAY['Approx 250 credits per storyboard','Standard exports','Email support'], FALSE)
ON CONFLICT (id) DO NOTHING;
