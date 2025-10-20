-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mp_preapproval_id VARCHAR(255) UNIQUE,
  mp_plan_id VARCHAR(255),
  plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'paused', 'expired', 'payment_failed')),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'ARS',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  activated_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  last_payment_id VARCHAR(255),
  last_payment_status VARCHAR(50),
  last_payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_preapproval_id ON subscriptions(mp_preapproval_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for service role to manage all subscriptions
CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  sub_status VARCHAR(50);
  next_billing TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT status, next_billing_date 
  INTO sub_status, next_billing
  FROM subscriptions 
  WHERE user_id = user_uuid;
  
  IF sub_status IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF sub_status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  IF next_billing IS NOT NULL AND next_billing < NOW() THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION has_active_subscription(UUID) TO authenticated;

COMMENT ON TABLE subscriptions IS 'Stores user subscription information for Mercado Pago premium plans';
COMMENT ON COLUMN subscriptions.mp_preapproval_id IS 'Mercado Pago preapproval (subscription) ID';
COMMENT ON COLUMN subscriptions.plan_type IS 'Type of subscription plan: monthly or annual';
COMMENT ON COLUMN subscriptions.status IS 'Current subscription status';
COMMENT ON FUNCTION has_active_subscription IS 'Check if a user has an active premium subscription';
