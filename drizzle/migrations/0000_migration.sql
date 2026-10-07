CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  role text CHECK (role IN ('renter','owner')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, location, phone)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    COALESCE(NEW.raw_user_meta_data->>'location',''),
    COALESCE(NEW.raw_user_meta_data->>'phone',''));
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.bikes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  owner_name text NOT NULL,
  model text NOT NULL,
  price_per_day numeric NOT NULL CHECK (price_per_day > 0),
  location text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.bikes TO authenticated;
GRANT ALL ON public.bikes TO service_role;
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved bikes visible" ON public.bikes FOR SELECT TO authenticated USING (status = 'approved' OR owner_id = auth.uid());
CREATE POLICY "owners submit pending" ON public.bikes FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND status = 'pending');

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id uuid NOT NULL REFERENCES public.bikes(id) ON DELETE CASCADE,
  renter_id uuid NOT NULL,
  start_date date NOT NULL,
  days int NOT NULL CHECK (days > 0 AND days <= 60),
  total_price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "renter sees own" ON public.bookings FOR SELECT TO authenticated USING (renter_id = auth.uid());
CREATE POLICY "renter books approved" ON public.bookings FOR INSERT TO authenticated WITH CHECK (
  renter_id = auth.uid() AND EXISTS (SELECT 1 FROM public.bikes b WHERE b.id = bike_id AND b.status = 'approved')
);