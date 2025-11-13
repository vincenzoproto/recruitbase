-- Fix RLS policies for candidate dashboard and social feed

-- 1. Applications table - candidates can only see their own
DROP POLICY IF EXISTS "Candidates can view their own applications" ON applications;
DROP POLICY IF EXISTS "Candidates can create applications" ON applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their offers" ON applications;

CREATE POLICY "Candidates can view their own applications"
ON applications FOR SELECT
USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can create applications"
ON applications FOR INSERT
WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Recruiters can view applications for their offers"
ON applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM job_offers
    WHERE job_offers.id = applications.job_offer_id
    AND job_offers.recruiter_id = auth.uid()
  )
);

-- 2. Notifications - users can only see their own
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- 3. Matches - candidates can only see their own
DROP POLICY IF EXISTS "Candidates can view their matches" ON matches;
DROP POLICY IF EXISTS "Recruiters can view matches for their offers" ON matches;
DROP POLICY IF EXISTS "System can create matches" ON matches;

CREATE POLICY "Candidates can view their matches"
ON matches FOR SELECT
USING (auth.uid() = candidate_id);

CREATE POLICY "Recruiters can view matches for their offers"
ON matches FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM job_offers
    WHERE job_offers.id = matches.job_offer_id
    AND job_offers.recruiter_id = auth.uid()
  )
);

CREATE POLICY "System can create matches"
ON matches FOR INSERT
WITH CHECK (true);

-- 4. Posts - public read, authenticated write
DROP POLICY IF EXISTS "Everyone can view posts" ON posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

CREATE POLICY "Everyone can view posts"
ON posts FOR SELECT
USING (true);

CREATE POLICY "Users can create their own posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON posts FOR DELETE
USING (auth.uid() = user_id);

-- 5. Post Comments - public read, authenticated write
DROP POLICY IF EXISTS "Everyone can view comments" ON post_comments;
DROP POLICY IF EXISTS "Users can create comments" ON post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;

CREATE POLICY "Everyone can view comments"
ON post_comments FOR SELECT
USING (true);

CREATE POLICY "Users can create comments"
ON post_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON post_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON post_comments FOR DELETE
USING (auth.uid() = user_id);

-- 6. Post Reactions - public read, authenticated write
DROP POLICY IF EXISTS "Everyone can view reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users can create reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON post_reactions;

CREATE POLICY "Everyone can view reactions"
ON post_reactions FOR SELECT
USING (true);

CREATE POLICY "Users can create reactions"
ON post_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON post_reactions FOR DELETE
USING (auth.uid() = user_id);

-- 7. Post Reposts - public read, authenticated write
DROP POLICY IF EXISTS "Everyone can view reposts" ON post_reposts;
DROP POLICY IF EXISTS "Users can create reposts" ON post_reposts;
DROP POLICY IF EXISTS "Users can delete their own reposts" ON post_reposts;

CREATE POLICY "Everyone can view reposts"
ON post_reposts FOR SELECT
USING (true);

CREATE POLICY "Users can create reposts"
ON post_reposts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reposts"
ON post_reposts FOR DELETE
USING (auth.uid() = user_id);