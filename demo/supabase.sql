-- PrePair Database Schema and Setup
-- Run this in Supabase SQL Editor

-- Enable RLS
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- Create or update student_profiles table
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    firstName text,
    lastName text,
    university text,
    campus text,
    graduationYear text,
    major text,
    location text,
    bio text,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add missing columns to existing student_profiles if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.student_profiles ADD COLUMN bio text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.student_profiles ADD COLUMN avatar_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'university') THEN
        ALTER TABLE public.student_profiles ADD COLUMN university text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'campus') THEN
        ALTER TABLE public.student_profiles ADD COLUMN campus text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'graduationYear') THEN
        ALTER TABLE public.student_profiles ADD COLUMN graduationYear text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'major') THEN
        ALTER TABLE public.student_profiles ADD COLUMN major text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'location') THEN
        ALTER TABLE public.student_profiles ADD COLUMN location text;
    END IF;
END $$;

-- Create opportunities table
CREATE TABLE IF NOT EXISTS public.opportunities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    company text NOT NULL,
    location text NOT NULL,
    work_type text NOT NULL,
    description text NOT NULL,
    requirements text NOT NULL,
    questions jsonb NOT NULL DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'accepted', 'rejected')),
    answers jsonb DEFAULT '{}'::jsonb,
    attachments jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, opportunity_id) -- Prevent duplicate applications
);

-- Enable RLS on all tables
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view and edit own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Anyone can view opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can update own applications" ON public.applications;

-- Student profiles policies
CREATE POLICY "Users can view and edit own profile" ON public.student_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Opportunities policies (public read)
CREATE POLICY "Anyone can view active opportunities" ON public.opportunities
    FOR SELECT USING (is_active = true);

-- Applications policies
CREATE POLICY "Users can view own applications" ON public.applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON public.applications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('application-files', 'application-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for application files
CREATE POLICY "Users can upload own application files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'application-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own application files"
ON storage.objects FOR SELECT
USING (bucket_id = 'application-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.student_profiles;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.applications;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.opportunities;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed mock opportunity
INSERT INTO public.opportunities (
    title, 
    company, 
    location, 
    work_type, 
    description, 
    requirements,
    questions
) VALUES (
    'Growth Strategy Analyst Intern',
    'Urban Bean Roasters',
    'New York, NY',
    'Part-time, hybrid',
    'Help a growing local coffee brand expand their reach and impact. You''ll work directly with our founders to analyze customer data, research new partnership opportunities, and design campus activation strategies. This is a hands-on role where you''ll see your ideas come to life through real pilot programs and measurable growth initiatives.',
    '• Current undergraduate or recent graduate
• Strong analytical and problem-solving skills
• Interest in consumer brands and growth marketing
• Comfortable with data analysis and presentation
• Self-starter who thrives in a fast-paced startup environment
• Available 15-20 hours per week for 3 months',
    '[
        {
            "id": "q1",
            "text": "In 150-250 words, tell us about a time you drove growth with limited resources.",
            "type": "textarea",
            "required": true
        },
        {
            "id": "q2", 
            "text": "Share one measurable idea to increase weekly store foot traffic by 10 percent in 60 days.",
            "type": "textarea",
            "required": true
        },
        {
            "id": "q3",
            "text": "Upload a 1-page essay or slide deck with a quick plan for a campus activation.",
            "type": "file",
            "required": true
        }
    ]'::jsonb
) ON CONFLICT DO NOTHING;