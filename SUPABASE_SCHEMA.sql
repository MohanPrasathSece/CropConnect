-- Enable Row Level Security
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Create roles enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('farmer', 'aggregator', 'retailer', 'consumer', 'admin');
    END IF;
END $$;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'consumer',
  wallet_address TEXT,
  is_active BOOLEAN DEFAULT true,
  address JSONB,
  farmer_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crops table
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  variety TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit DECIMAL NOT NULL,
  farm_location JSONB,
  quality JSONB,
  is_organic BOOLEAN DEFAULT false,
  certifications JSONB DEFAULT '[]'::jsonb,
  harvest_date DATE NOT NULL,
  sowing_date DATE,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  ai_analysis JSONB,
  blockchain_hash TEXT,
  smart_contract_address TEXT,
  transaction_hash TEXT,
  qr_code JSONB,
  traceability_id TEXT UNIQUE,
  status TEXT DEFAULT 'draft',
  availability TEXT DEFAULT 'available',
  views INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit DECIMAL NOT NULL,
  total_amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  delivery_address JSONB,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'cash',
  advance_payment DECIMAL DEFAULT 0,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  quality_requirements JSONB,
  tracking_updates JSONB DEFAULT '[]'::jsonb,
  farmer_rating JSONB,
  buyer_rating JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Aggregator Collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id TEXT UNIQUE NOT NULL,
  aggregator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  collected_quantity DECIMAL NOT NULL,
  collected_unit TEXT NOT NULL,
  collection_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  collection_location JSONB,
  quality_assessment JSONB,
  traceability JSONB,
  blockchain JSONB,
  storage JSONB,
  processing JSONB,
  market_info JSONB,
  transport JSONB,
  buyer_info JSONB,
  compliance JSONB,
  status TEXT DEFAULT 'collected',
  alerts JSONB DEFAULT '[]'::jsonb,
  analytics JSONB,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transactions table (for logging blockchain interactions separately if needed)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_hash TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'registration', 'payment', 'transfer'
  status TEXT DEFAULT 'pending',
  payload JSONB,
  blockchain_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS for all tables
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (can be refined)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Crops are viewable by everyone" ON crops FOR SELECT USING (true);
CREATE POLICY "Farmers can insert their own crops" ON crops FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update their own crops" ON crops FOR UPDATE USING (auth.uid() = farmer_id);

CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);
CREATE POLICY "Buyers can insert orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Aggregators can manage their collections" ON collections FOR ALL USING (auth.uid() = aggregator_id);
