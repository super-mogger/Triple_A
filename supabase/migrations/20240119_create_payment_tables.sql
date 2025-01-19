-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  duration INTEGER NOT NULL, -- duration in days
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id TEXT REFERENCES plans(id) NOT NULL,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id TEXT REFERENCES plans(id) NOT NULL,
  payment_id TEXT REFERENCES payments(razorpay_payment_id),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Plans policies (anyone can read, only admins can modify)
CREATE POLICY "Plans are viewable by everyone" ON plans
  FOR SELECT USING (true);

-- Payments policies (users can see their own payments)
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can create payments" ON payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update payments" ON payments
  FOR UPDATE USING (true);

-- Memberships policies (users can see their own memberships)
CREATE POLICY "Users can view their own memberships" ON memberships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage memberships" ON memberships
  FOR ALL USING (true);

-- Insert default plans
INSERT INTO plans (id, name, description, price, duration, features) VALUES
  ('monthly', 'Basic Plan', 'Monthly membership plan', 699, 30, '["Access to all gym equipment", "Personal trainer consultation", "Group fitness classes", "Locker room access", "Fitness assessment"]'),
  ('quarterly', 'Pro Plan', 'Quarterly membership plan', 1999, 90, '["All Monthly Plan features", "Nutrition guidance", "Progress tracking", "Priority booking for classes", "Guest passes (2)"]'),
  ('biannual', 'Elite Plan', 'Biannual membership plan', 3999, 180, '["All Quarterly Plan features", "Personalized workout plans", "Monthly body composition analysis", "Premium app features", "Unlimited guest passes"]')
ON CONFLICT (id) DO NOTHING; 