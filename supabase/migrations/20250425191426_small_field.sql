/*
  # Reset and rebuild database schema
  
  1. Tables
    - profiles
    - memorials
    - memories
    - memory_likes
    - comments
    - memorial_invites
    - memorial_members
    - rate_limits
  
  2. Security
    - Enable RLS on all tables
    - Create non-recursive policies
    - Set up proper access control
*/

-- Disable RLS temporarily to allow cleanup
ALTER TABLE IF EXISTS public.memorials DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.memories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.memory_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.memorial_invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.memorial_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rate_limits DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname, tablename 
             FROM pg_policies 
             WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END
$$;

-- Create or replace tables

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id),
  username TEXT UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Memorials table
CREATE TABLE IF NOT EXISTS public.memorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fullname TEXT NOT NULL,
  birthdate DATE,
  passeddate DATE,
  createdat TIMESTAMPTZ DEFAULT now(),
  coverimage TEXT,
  description TEXT,
  privacy TEXT NOT NULL DEFAULT 'family',
  contributorcount INTEGER DEFAULT 0,
  memorycount INTEGER DEFAULT 0,
  ainarrative TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  allow_invites BOOLEAN DEFAULT true
);

-- Memories table
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorialid UUID REFERENCES memorials(id) NOT NULL,
  contributorid UUID REFERENCES auth.users(id) NOT NULL,
  contributorname TEXT,
  contributoravatar TEXT,
  relationship TEXT,
  content TEXT NOT NULL,
  date DATE,
  timeperiod TEXT,
  emotion TEXT,
  mediaurl TEXT,
  likes INTEGER DEFAULT 0,
  createdat TIMESTAMPTZ DEFAULT now()
);

-- Memory likes table
CREATE TABLE IF NOT EXISTS public.memory_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(memory_id, user_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Memorial invites table
CREATE TABLE IF NOT EXISTS public.memorial_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID REFERENCES memorials(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  uses INTEGER DEFAULT 0
);

-- Memorial members table
CREATE TABLE IF NOT EXISTS public.memorial_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID REFERENCES memorials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  invite_id UUID REFERENCES memorial_invites(id),
  UNIQUE(memorial_id, user_id)
);

-- Rate limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_memories_memorialid ON memories(memorialid);
CREATE INDEX IF NOT EXISTS idx_memory_likes_memory_id ON memory_likes(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_likes_user_id ON memory_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_memory_id ON comments(memory_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_memorial_invites_code ON memorial_invites(code);
CREATE INDEX IF NOT EXISTS idx_memorial_members_memorial_id ON memorial_members(memorial_id);
CREATE INDEX IF NOT EXISTS idx_memorial_members_user_id ON memorial_members(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id_timestamp ON rate_limits(user_id, timestamp DESC);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

-- Create policies for memorials (non-recursive)
CREATE POLICY "Memorial owners full access"
  ON memorials FOR ALL
  TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public memorials are viewable"
  ON memorials FOR SELECT
  TO public
  USING (privacy = 'public');

CREATE POLICY "Members can view memorials"
  ON memorials FOR SELECT
  TO public
  USING (
    id IN (
      SELECT memorial_id 
      FROM memorial_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create policies for memories
CREATE POLICY "Users can manage their own memories"
  ON memories FOR ALL
  TO public
  USING (contributorid = auth.uid());

CREATE POLICY "Anyone can view memories from public memorials"
  ON memories FOR SELECT
  TO public
  USING (
    memorialid IN (
      SELECT id FROM memorials WHERE privacy = 'public'
    )
  );

-- Create policies for memory likes
CREATE POLICY "Users can manage their own likes"
  ON memory_likes FOR ALL
  TO public
  USING (user_id = auth.uid());

-- Create policies for comments
CREATE POLICY "Users can manage their own comments"
  ON comments FOR ALL
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "Users can view comments on public memorials"
  ON comments FOR SELECT
  TO public
  USING (
    memory_id IN (
      SELECT m.id FROM memories m
      JOIN memorials mem ON m.memorialid = mem.id
      WHERE mem.privacy = 'public'
    )
  );

-- Create policies for memorial invites
CREATE POLICY "Memorial owners can manage invites"
  ON memorial_invites FOR ALL
  TO public
  USING (
    memorial_id IN (
      SELECT id FROM memorials WHERE user_id = auth.uid()
    )
  );

-- Create policies for memorial members
CREATE POLICY "Users can view their memberships"
  ON memorial_members FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "Memorial owners can manage memberships"
  ON memorial_members FOR ALL
  TO public
  USING (
    memorial_id IN (
      SELECT id FROM memorials WHERE user_id = auth.uid()
    )
  );

-- Create policies for rate limits
CREATE POLICY "Users can manage their own rate limits"
  ON rate_limits FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create helper functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create function to generate invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    code := substring(md5(random()::text), 1, 8);
    SELECT EXISTS(
      SELECT 1 FROM memorial_invites WHERE memorial_invites.code = code
    ) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;