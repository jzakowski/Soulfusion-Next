// Bubbles API - Unified Social Feed with Threads-Style Algorithm
import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
const router = express.Router();

// ========== BUBBLES (Communities) ==========

// GET /api/bubbles - List all bubbles
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        b.*,
        EXISTS(SELECT 1 FROM bubble_memberships WHERE bubble_id = b.id AND user_id = $1) as is_member,
        COALESCE(ubp.is_visible, true) as is_visible,
        COALESCE(ubp.is_hidden, false) as is_hidden,
        COALESCE(ubp.is_pinned, false) as is_pinned,
        COALESCE(ubp.engagement_score, 0) as engagement_score
      FROM bubbles b
      LEFT JOIN user_bubble_preferences ubp ON ubp.bubble_id = b.id AND ubp.user_id = $1
      WHERE b.is_public = true
      ORDER BY b.member_count DESC
    `, [req.user.id]);

    res.json({ items: rows });
  } catch (error) {
    console.error('Error fetching bubbles:', error);
    res.status(500).json({ error: 'Failed to fetch bubbles' });
  }
});

// GET /api/bubbles/:id - Get bubble details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        b.*,
        EXISTS(SELECT 1 FROM bubble_memberships WHERE bubble_id = b.id AND user_id = $1) as is_member
      FROM bubbles b
      WHERE b.id = $2
    `, [req.user.id, req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Bubble not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching bubble:', error);
    res.status(500).json({ error: 'Failed to fetch bubble' });
  }
});

// POST /api/bubbles/:id/join - Join a bubble
router.post('/:id/join', requireAuth, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if already member
      const { rows: existing } = await client.query(
        'SELECT 1 FROM bubble_memberships WHERE bubble_id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
      );

      if (existing.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Already a member' });
      }

      // Add membership
      await client.query(
        'INSERT INTO bubble_memberships (bubble_id, user_id) VALUES ($1, $2)',
        [req.params.id, req.user.id]
      );

      // Update member count
      await client.query(
        'UPDATE bubbles SET member_count = member_count + 1 WHERE id = $1',
        [req.params.id]
      );

      // Initialize preference
      await client.query(
        `INSERT INTO user_bubble_preferences (user_id, bubble_id, is_visible)
        VALUES ($1, $2, true)
        ON CONFLICT (user_id, bubble_id) DO UPDATE SET is_visible = true`,
        [req.user.id, req.params.id]
      );

      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error joining bubble:', error);
    res.status(500).json({ error: 'Failed to join bubble' });
  }
});

// DELETE /api/bubbles/:id/join - Leave a bubble
router.delete('/:id/join', requireAuth, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'DELETE FROM bubble_memberships WHERE bubble_id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
      );

      await client.query(
        'UPDATE bubbles SET member_count = GREATEST(member_count - 1, 0) WHERE id = $1',
        [req.params.id]
      );

      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error leaving bubble:', error);
    res.status(500).json({ error: 'Failed to leave bubble' });
  }
});

// ========== USER PREFERENCES (NEW) ==========

// GET /api/bubbles/preferences - Get user's bubble preferences
router.get('/preferences', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        ubp.*,
        b.name,
        b.icon,
        b.color,
        b.description
      FROM user_bubble_preferences ubp
      JOIN bubbles b ON b.id = ubp.bubble_id
      WHERE ubp.user_id = $1
      ORDER BY
        ubp.is_pinned DESC,
        ubp.engagement_score DESC,
        b.name
    `, [req.user.id]);

    res.json({ items: rows });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// PUT /api/bubbles/preferences/:id - Update bubble preference
router.put('/preferences/:id', requireAuth, async (req, res) => {
  try {
    const { is_visible, is_hidden, is_pinned } = req.body;

    const { rows } = await pool.query(`
      UPDATE user_bubble_preferences
      SET
        is_visible = COALESCE($2, is_visible),
        is_hidden = COALESCE($3, is_hidden),
        is_pinned = COALESCE($4, is_pinned),
        updated_at = NOW()
      WHERE id = $1 AND user_id = $5
      RETURNING *
    `, [req.params.id, is_visible, is_hidden, is_pinned, req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Preference not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating preference:', error);
    res.status(500).json({ error: 'Failed to update preference' });
  }
});

// ========== UNIFIED FEED (NEW) ==========

// GET /api/bubbles/feed - UNIFIED FEED from all user's bubbles
router.get('/feed', requireAuth, async (req, res) => {
  try {
    const {
      filter = 'all',  // all, friends, anonymous
      cursor,
      limit = 20,
      bubble_id        // Optional: filter by specific bubble
    } = req.query;

    const parsedLimit = Math.min(parseInt(limit) || 20, 50);

    // Build query for unified feed with algorithm-based ranking
    let query = `
      SELECT DISTINCT
        bp.*,
        b.name as bubble_name,
        b.icon as bubble_icon,
        b.color as bubble_color,
        u.display_name,
        u.avatar_url,
        up.bio,
        up.verified,
        up.premium_tier,
        EXISTS(
          SELECT 1 FROM bubble_post_likes bpl
          WHERE bpl.post_id = bp.id AND bpl.user_id = $1
        ) as liked_by_user,
        COALESCE(ubp.engagement_score, 0) as user_bubble_engagement,
        -- Ranking score calculation
        (
          COALESCE(ubp.engagement_score, 0) * 0.4 +
          COALESCE(bp.trending_score, 0) * 0.3 +
          EXTRACT(EPOCH FROM (NOW() - bp.created_at)) / -86400 * 0.2 +
          (bp.like_count + bp.comment_count * 2) * 0.1
        ) as ranking_score
      FROM bubble_posts bp
      JOIN bubbles b ON b.id = bp.bubble_id
      LEFT JOIN users u ON u.id = bp.user_id
      LEFT JOIN user_profiles up ON up.user_id = bp.user_id
      LEFT JOIN user_bubble_preferences ubp
        ON ubp.user_id = $1 AND ubp.bubble_id = bp.bubble_id
      WHERE
        -- Only show from visible, non-hidden bubbles
        (ubp.is_visible IS NULL OR ubp.is_visible = true)
        AND (ubp.is_hidden IS NULL OR ubp.is_hidden = false)
    `;

    const params = [req.user.id];
    let paramCount = 1;

    // Filter by specific bubble if provided
    if (bubble_id) {
      paramCount++;
      query += ` AND bp.bubble_id = $${paramCount}`;
      params.push(bubble_id);
    }

    // Filter by type
    if (filter === 'friends') {
      paramCount++;
      query += ` AND bp.user_id IN (
        SELECT user_id_two FROM friendships WHERE user_id_one = $${paramCount} AND status = 'accepted'
        UNION
        SELECT user_id_one FROM friendships WHERE user_id_two = $${paramCount} AND status = 'accepted'
      )`;
      params.push(req.user.id);
    } else if (filter === 'anonymous') {
      query += ` AND bp.is_anonymous = true`;
    }

    // Cursor-based pagination
    if (cursor) {
      paramCount++;
      query += ` AND (bp.created_at, bp.id) < ($${paramCount}::timestamp, $${paramCount + 1}::uuid)`;
      params.push(...cursor.split('|'));
    }

    // Order by ranking score (Threads-like algorithm)
    query += `
      ORDER BY ranking_score DESC, bp.created_at DESC
      LIMIT $${paramCount + 2}
    `;
    params.push(parsedLimit + 1); // Fetch one extra to check for more

    const { rows } = await pool.query(query, params);

    const hasMore = rows.length > parsedLimit;
    const items = hasMore ? rows.slice(0, -1) : rows;
    const nextCursor = hasMore
      ? `${items[items.length - 1].created_at.toISOString()}|${items[items.length - 1].id}`
      : null;

    res.json({
      items,
      cursor: nextCursor,
      hasMore
    });
  } catch (error) {
    console.error('Error fetching unified feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// GET /api/bubbles/feed/trending - Trending feed (all bubbles)
router.get('/feed/trending', requireAuth, async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;

    let interval = '24 hours';
    if (timeframe === '7d') interval = '7 days';
    if (timeframe === '30d') interval = '30 days';

    const { rows } = await pool.query(`
      SELECT
        bp.*,
        b.name as bubble_name,
        b.icon as bubble_icon,
        b.color as bubble_color,
        u.display_name,
        u.avatar_url,
        up.bio,
        up.verified,
        up.premium_tier,
        EXISTS(
          SELECT 1 FROM bubble_post_likes bpl
          WHERE bpl.post_id = bp.id AND bpl.user_id = $1
        ) as liked_by_user
      FROM bubble_posts bp
      JOIN bubbles b ON b.id = bp.bubble_id
      LEFT JOIN users u ON u.id = bp.user_id
      LEFT JOIN user_profiles up ON up.user_id = bp.user_id
      LEFT JOIN user_bubble_preferences ubp
        ON ubp.user_id = $1 AND ubp.bubble_id = bp.bubble_id
      WHERE
        bp.created_at >= NOW() - INTERVAL '${interval}'
        AND (ubp.is_visible IS NULL OR ubp.is_visible = true)
        AND (ubp.is_hidden IS NULL OR ubp.is_hidden = false)
      ORDER BY
        (bp.like_count * 1 + bp.comment_count * 3 + bp.view_count * 0.1) DESC,
        bp.created_at DESC
      LIMIT 50
    `, [req.user.id]);

    res.json({ items: rows });
  } catch (error) {
    console.error('Error fetching trending feed:', error);
    res.status(500).json({ error: 'Failed to fetch trending feed' });
  }
});

// GET /api/bubbles/feed/loudest - "Loudest" feed (most comments, all bubbles)
router.get('/feed/loudest', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        bp.*,
        b.name as bubble_name,
        b.icon as bubble_icon,
        b.color as bubble_color,
        u.display_name,
        u.avatar_url,
        up.bio,
        up.verified,
        up.premium_tier,
        EXISTS(
          SELECT 1 FROM bubble_post_likes bpl
          WHERE bpl.post_id = bp.id AND bpl.user_id = $1
        ) as liked_by_user
      FROM bubble_posts bp
      JOIN bubbles b ON b.id = bp.bubble_id
      LEFT JOIN users u ON u.id = bp.user_id
      LEFT JOIN user_profiles up ON up.user_id = bp.user_id
      LEFT JOIN user_bubble_preferences ubp
        ON ubp.user_id = $1 AND ubp.bubble_id = bp.bubble_id
      WHERE
        bp.created_at >= NOW() - INTERVAL '7 days'
        AND (ubp.is_visible IS NULL OR ubp.is_visible = true)
        AND (ubp.is_hidden IS NULL OR ubp.is_hidden = false)
      ORDER BY bp.comment_count DESC, bp.created_at DESC
      LIMIT 50
    `, [req.user.id]);

    res.json({ items: rows });
  } catch (error) {
    console.error('Error fetching loudest feed:', error);
    res.status(500).json({ error: 'Failed to fetch loudest feed' });
  }
});

// ========== POSTS ==========

// POST /api/bubbles/posts - Create post (bubble_id in body)
router.post('/posts', requireAuth, async (req, res) => {
  try {
    const { bubble_id, content, media_urls = [], is_anonymous = false } = req.body;

    if (!bubble_id || !content?.trim()) {
      return res.status(400).json({ error: 'bubble_id and content are required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Generate anonymous ID if needed
      let anonymous_id = null;
      if (is_anonymous) {
        const { rows: [{ count }] } = await client.query(
          'SELECT COUNT(*) as count FROM bubble_anonymous_mappings WHERE post_id = $1',
          ['temp']
        );
        anonymous_id = `Anonym ${count + 1}`;
      }

      // Extract hashtags
      const hashtagRegex = /#(\w+)/g;
      const hashtags = (content.match(hashtagRegex) || []).map(h => h.toLowerCase());

      // Create post
      const { rows } = await client.query(`
        INSERT INTO bubble_posts (bubble_id, user_id, content, media_urls, is_anonymous, anonymous_id, hashtags)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [bubble_id, req.user.id, content, JSON.stringify(media_urls), is_anonymous, anonymous_id, JSON.stringify(hashtags)]);

      const post = rows[0];

      // Update bubble post count
      await client.query(
        'UPDATE bubbles SET post_count = post_count + 1 WHERE id = $1',
        [bubble_id]
      );

      // Track engagement (post creation)
      await client.query(
        'SELECT track_bubble_post_interaction($1, $2, $3)',
        [req.user.id, bubble_id, 'post']
      );

      // Update trending hashtags
      for (const tag of hashtags) {
        await client.query(`
          INSERT INTO trending_hashtags (hashtag, post_count, last_posted_at)
          VALUES ($1, 1, NOW())
          ON CONFLICT (hashtag) DO UPDATE SET
            post_count = trending_hashtags.post_count + 1,
            last_posted_at = NOW()
        `, [tag]);
      }

      await client.query('COMMIT');

      // Fetch full post with user data
      const { rows: fullPosts } = await pool.query(`
        SELECT
          bp.*,
          b.name as bubble_name,
          b.icon as bubble_icon,
          b.color as bubble_color,
          u.display_name,
          u.avatar_url,
          up.bio,
          up.verified,
          up.premium_tier
        FROM bubble_posts bp
        JOIN bubbles b ON b.id = bp.bubble_id
        LEFT JOIN users u ON u.id = bp.user_id
        LEFT JOIN user_profiles up ON up.user_id = bp.user_id
        WHERE bp.id = $1
      `, [post.id]);

      res.json(fullPosts[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// GET /api/bubbles/posts/:id - Get post details
router.get('/posts/:id', requireAuth, async (req, res) => {
  try {
    // Track view engagement
    await pool.query(`
      INSERT INTO user_bubble_preferences (user_id, bubble_id, is_visible)
      VALUES ($1, (SELECT bubble_id FROM bubble_posts WHERE id = $2), true)
      ON CONFLICT (user_id, bubble_id) DO UPDATE SET
        views_count = user_bubble_preferences.views_count + 1
    `, [req.user.id, req.params.id]);

    const { rows } = await pool.query(`
      SELECT
        bp.*,
        b.name as bubble_name,
        b.icon as bubble_icon,
        b.color as bubble_color,
        u.display_name,
        u.avatar_url,
        up.bio,
        up.verified,
        up.premium_tier,
        EXISTS(
          SELECT 1 FROM bubble_post_likes bpl
          WHERE bpl.post_id = bp.id AND bpl.user_id = $1
        ) as liked_by_user
      FROM bubble_posts bp
      JOIN bubbles b ON b.id = bp.bubble_id
      LEFT JOIN users u ON u.id = bp.user_id
      LEFT JOIN user_profiles up ON up.user_id = bp.user_id
      WHERE bp.id = $2
    `, [req.user.id, req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// PUT /api/bubbles/posts/:id - Update post (5 min window)
router.put('/posts/:id', requireAuth, async (req, res) => {
  try {
    const { content, media_urls } = req.body;

    const { rows } = await pool.query(`
      UPDATE bubble_posts
      SET
        content = COALESCE($2, content),
        media_urls = COALESCE($3, media_urls),
        updated_at = NOW()
      WHERE id = $1
        AND user_id = $4
        AND created_at >= NOW() - INTERVAL '5 minutes'
      RETURNING *
    `, [req.params.id, content, media_urls ? JSON.stringify(media_urls) : null, req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or edit window expired' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/bubbles/posts/:id - Delete post
router.delete('/posts/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM bubble_posts WHERE id = $1 AND user_id = $2 RETURNING bubble_id',
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update bubble post count
    await pool.query(
      'UPDATE bubbles SET post_count = GREATEST(post_count - 1, 0) WHERE id = $1',
      [rows[0].bubble_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ========== LIKES ==========

// POST /api/bubbles/posts/:id/like - Toggle like
router.post('/posts/:id/like', requireAuth, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if already liked
      const { rows: existing } = await client.query(
        'SELECT 1 FROM bubble_post_likes WHERE post_id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
      );

      let liked;
      if (existing.length > 0) {
        // Unlike
        await client.query(
          'DELETE FROM bubble_post_likes WHERE post_id = $1 AND user_id = $2',
          [req.params.id, req.user.id]
        );
        await client.query(
          'UPDATE bubble_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1',
          [req.params.id]
        );
        liked = false;
      } else {
        // Like
        await client.query(
          'INSERT INTO bubble_post_likes (post_id, user_id) VALUES ($1, $2)',
          [req.params.id, req.user.id]
        );
        await client.query(
          'UPDATE bubble_posts SET like_count = like_count + 1 WHERE id = $1',
          [req.params.id]
        );
        liked = true;
      }

      // Track engagement
      const { rows: [{ bubble_id }] } = await client.query(
        'SELECT bubble_id FROM bubble_posts WHERE id = $1',
        [req.params.id]
      );
      await client.query(
        'SELECT track_bubble_post_interaction($1, $2, $3)',
        [req.user.id, bubble_id, 'like']
      );

      await client.query('COMMIT');
      res.json({ liked });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// ========== COMMENTS ==========

// GET /api/bubbles/posts/:id/comments - Get comments
router.get('/posts/:id/comments', requireAuth, async (req, res) => {
  try {
    const { parent_id } = req.query;

    let query = `
      SELECT
        c.*,
        u.display_name,
        u.avatar_url,
        up.bio,
        up.verified
      FROM bubble_post_comments c
      LEFT JOIN users u ON u.id = c.user_id
      LEFT JOIN user_profiles up ON up.user_id = c.user_id
      WHERE c.post_id = $1
    `;
    const params = [req.params.id];

    if (parent_id) {
      query += ' AND c.parent_id = $2';
      params.push(parent_id);
    } else {
      query += ' AND c.parent_id IS NULL';
    }

    query += ' ORDER BY c.created_at ASC';

    const { rows } = await pool.query(query, params);
    res.json({ items: rows });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /api/bubbles/posts/:id/comments - Create comment
router.post('/posts/:id/comments', requireAuth, async (req, res) => {
  try {
    const { content, is_anonymous = false, parent_id } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'content is required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Generate anonymous ID if needed
      let anonymous_id = null;
      if (is_anonymous) {
        const { rows: [{ count }] } = await client.query(
          'SELECT COUNT(*) as count FROM bubble_anonymous_mappings WHERE post_id = $1',
          [req.params.id]
        );
        anonymous_id = `Anonym ${count + 1}`;
      }

      // Create comment
      const { rows } = await client.query(`
        INSERT INTO bubble_post_comments (post_id, user_id, content, is_anonymous, anonymous_id, parent_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [req.params.id, req.user.id, content, is_anonymous, anonymous_id, parent_id]);

      const comment = rows[0];

      // Update post comment count
      await client.query(
        'UPDATE bubble_posts SET comment_count = comment_count + 1 WHERE id = $1',
        [req.params.id]
      );

      // Track engagement
      const { rows: [{ bubble_id }] } = await client.query(
        'SELECT bubble_id FROM bubble_posts WHERE id = $1',
        [req.params.id]
      );
      await client.query(
        'SELECT track_bubble_post_interaction($1, $2, $3)',
        [req.user.id, bubble_id, 'comment']
      );

      await client.query('COMMIT');

      // Fetch full comment with user data
      const { rows: fullComments } = await pool.query(`
        SELECT
          c.*,
          u.display_name,
          u.avatar_url,
          up.bio,
          up.verified
        FROM bubble_post_comments c
        LEFT JOIN users u ON u.id = c.user_id
        LEFT JOIN user_profiles up ON up.user_id = c.user_id
        WHERE c.id = $1
      `, [comment.id]);

      res.json(fullComments[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// PUT /api/bubbles/comments/:id - Update comment
router.put('/comments/:id', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;

    const { rows } = await pool.query(`
      UPDATE bubble_post_comments
      SET content = $2, updated_at = NOW()
      WHERE id = $1 AND user_id = $3
      RETURNING *
    `, [req.params.id, content, req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// DELETE /api/bubbles/comments/:id - Delete comment
router.delete('/comments/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM bubble_post_comments WHERE id = $1 AND user_id = $2 RETURNING post_id',
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Update post comment count
    await pool.query(
      'UPDATE bubble_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = $1',
      [rows[0].post_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ========== ANONYMOUS CHAT REQUEST ==========

// POST /api/bubbles/posts/:id/chat-request
router.post('/posts/:id/chat-request', requireAuth, async (req, res) => {
  try {
    const { anonymous_id } = req.body;

    // Find the actual user ID from the anonymous mapping
    const { rows } = await pool.query(`
      SELECT user_id
      FROM bubble_anonymous_mappings
      JOIN bubble_posts ON bubble_posts.id = bubble_anonymous_mappings.post_id
      WHERE bubble_posts.id = $1
        AND bubble_anonymous_mappings.anonymous_id = $2
    `, [req.params.id, anonymous_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Anonymous user not found' });
    }

    const targetUserId = rows[0].user_id;

    // Check if chat already exists
    const { rows: existing } = await pool.query(`
      SELECT id, state
      FROM chats
      WHERE ((user_id_one = $1 AND user_id_two = $2)
         OR (user_id_one = $2 AND user_id_two = $1))
        AND type = 'anonymous'
    `, [req.user.id, targetUserId]);

    if (existing.length > 0) {
      return res.json({
        chat_id: existing[0].id,
        exists: true,
        state: existing[0].state
      });
    }

    // Create new anonymous chat
    const { rows: newChats } = await pool.query(`
      INSERT INTO chats (user_id_one, user_id_two, type, state)
      VALUES ($1, $2, 'anonymous', 'anonymous')
      RETURNING id
    `, [req.user.id, targetUserId]);

    res.json({
      chat_id: newChats[0].id,
      exists: false
    });
  } catch (error) {
    console.error('Error requesting chat:', error);
    res.status(500).json({ error: 'Failed to request chat' });
  }
});

// ========== REPORT ==========

// POST /api/bubbles/posts/:id/report
router.post('/posts/:id/report', requireAuth, async (req, res) => {
  try {
    const { reason, description } = req.body;

    await pool.query(`
      INSERT INTO bubble_post_reports (post_id, reporter_id, reason, description)
      VALUES ($1, $2, $3, $4)
    `, [req.params.id, req.user.id, reason, description]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ error: 'Failed to report post' });
  }
});

// ========== HASHTAGS ==========

// GET /api/bubbles/hashtags/trending
router.get('/hashtags/trending', requireAuth, async (req, res) => {
  try {
    const { limit = 10, timeframe = '24h' } = req.query;

    let interval = '24 hours';
    if (timeframe === '7d') interval = '7 days';
    if (timeframe === '30d') interval = '30 days';

    const { rows } = await pool.query(`
      SELECT
        hashtag,
        post_count,
        trending_score,
        last_posted_at
      FROM trending_hashtags
      WHERE last_posted_at >= NOW() - INTERVAL '${interval}'
      ORDER BY trending_score DESC, post_count DESC
      LIMIT $1
    `, [parseInt(limit)]);

    res.json({ items: rows });
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    res.status(500).json({ error: 'Failed to fetch trending hashtags' });
  }
});

export default router;
