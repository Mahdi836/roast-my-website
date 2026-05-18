-- In Supabase SQL Editor ausführen: supabase.com -> SQL Editor

CREATE TABLE roasts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip text NOT NULL,
  url text NOT NULL,
  result jsonb NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  is_pro boolean DEFAULT false,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now()
);

-- Index für schnelle IP-Abfragen
CREATE INDEX idx_roasts_ip ON roasts(ip);
CREATE INDEX idx_roasts_created_at ON roasts(created_at);

-- RLS deaktivieren (API nutzt service_role key)
ALTER TABLE roasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers DISABLE ROW LEVEL SECURITY;
