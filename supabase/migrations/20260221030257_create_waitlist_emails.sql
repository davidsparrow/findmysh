/*
  # Create waitlist_emails table

  ## Summary
  Stores email addresses submitted via the FindMySh landing page waitlist form.

  ## New Tables
  - `waitlist_emails`
    - `id` (uuid, primary key) — unique row identifier
    - `email` (text, unique, not null) — submitted email address
    - `created_at` (timestamptz) — submission timestamp
    - `ip_hint` (text, nullable) — optional forwarded IP for basic dedup/abuse

  ## Security
  - RLS enabled; only authenticated service-role can read rows
  - INSERT policy allows unauthenticated (anon) users to submit their own email
  - No SELECT policy for anon — emails are private

  ## Notes
  1. The UNIQUE constraint on email prevents duplicate signups
  2. No user auth required — public waitlist form
*/

CREATE TABLE IF NOT EXISTS waitlist_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  ip_hint text
);

ALTER TABLE waitlist_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon users can insert their email"
  ON waitlist_emails
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Service role can read all waitlist emails"
  ON waitlist_emails
  FOR SELECT
  TO service_role
  USING (true);
