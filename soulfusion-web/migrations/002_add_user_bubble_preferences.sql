-- User Bubble Preferences & Engagement Tracking
-- For unified feed with algorithmic ranking

-- Track user preferences for each bubble (visible, hidden, etc.)
CREATE TABLE IF NOT EXISTS user_bubble_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bubble_id UUID REFERENCES bubbles(id) ON DELETE CASCADE,

    -- Preference state
    is_visible BOOLEAN DEFAULT true,        -- User wants to see this bubble
    is_hidden BOOLEAN DEFAULT false,        -- User explicitly hid this bubble
    is_pinned BOOLEAN DEFAULT false,        -- User pinned this bubble

    -- Engagement score (calculated from user interactions)
    engagement_score DECIMAL(10,2) DEFAULT 0,

    -- Stats tracking
    posts_count INTEGER DEFAULT 0,          -- Posts user made in this bubble
    likes_count INTEGER DEFAULT 0,          -- Likes user gave in this bubble
    comments_count INTEGER DEFAULT 0,       -- Comments user made in this bubble
    views_count INTEGER DEFAULT 0,          -- Posts user viewed in this bubble

    -- Timestamps
    last_interacted_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, bubble_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_bubble_prefs_user ON user_bubble_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bubble_prefs_visible ON user_bubble_preferences(user_id, is_visible);
CREATE INDEX IF NOT EXISTS idx_user_bubble_prefs_score ON user_bubble_preferences(user_id, engagement_score DESC);

-- Add function to update engagement score
CREATE OR REPLACE FUNCTION update_bubble_engagement_score(
    p_user_id UUID,
    p_bubble_id UUID
) RETURNS void AS $$
BEGIN
    UPDATE user_bubble_preferences
    SET
        engagement_score = (
            (posts_count * 10.0) +      -- Posts weighted highest
            (comments_count * 5.0) +    -- Comments weighted medium
            (likes_count * 2.0) +       -- Likes weighted lower
            (views_count * 0.1)         -- Views weighted lowest
        ),
        updated_at = NOW()
    WHERE user_id = p_user_id
    AND bubble_id = p_bubble_id;
END;
$$ LANGUAGE plpgsql;

-- Add function to track post interaction
CREATE OR REPLACE FUNCTION track_bubble_post_interaction(
    p_user_id UUID,
    p_bubble_id UUID,
    p_interaction_type TEXT  -- 'post', 'like', 'comment', 'view'
) RETURNS void AS $$
BEGIN
    INSERT INTO user_bubble_preferences (user_id, bubble_id, is_visible)
    VALUES (p_user_id, p_bubble_id, true)
    ON CONFLICT (user_id, bubble_id) DO NOTHING;

    CASE p_interaction_type
        WHEN 'post' THEN
            UPDATE user_bubble_preferences
            SET posts_count = posts_count + 1,
                last_interacted_at = NOW()
            WHERE user_id = p_user_id AND bubble_id = p_bubble_id;
        WHEN 'like' THEN
            UPDATE user_bubble_preferences
            SET likes_count = likes_count + 1,
                last_interacted_at = NOW()
            WHERE user_id = p_user_id AND bubble_id = p_bubble_id;
        WHEN 'comment' THEN
            UPDATE user_bubble_preferences
            SET comments_count = comments_count + 1,
                last_interacted_at = NOW()
            WHERE user_id = p_user_id AND bubble_id = p_bubble_id;
        WHEN 'view' THEN
            UPDATE user_bubble_preferences
            SET views_count = views_count + 1,
                last_interacted_at = NOW()
            WHERE user_id = p_user_id AND bubble_id = p_bubble_id;
    END CASE;

    PERFORM update_bubble_engagement_score(p_user_id, p_bubble_id);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_bubble_preferences TO sf_api_user;
GRANT EXECUTE ON FUNCTION update_bubble_engagement_score TO sf_api_user;
GRANT EXECUTE ON FUNCTION track_bubble_post_interaction TO sf_api_user;
