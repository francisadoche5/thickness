const supabase = require('../../supabase');

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function syncPost(message, tier) {
  const fileId =
    message.photo?.[message.photo.length - 1]?.file_id ||
    message.video?.file_id ||
    message.document?.file_id ||
    null;

  const type = message.photo
    ? 'image'
    : message.video
    ? 'video'
    : message.document
    ? 'document'
    : 'text';

  const { data } = await supabase
    .from('posts')
    .insert({
      telegram_message_id: message.message_id,
      tier,
      type,
      file_id: fileId,
      caption: message.caption || message.text || null,
      seed_likes:     randomBetween(50, 500),
      seed_comments:  randomBetween(5, 80),
      seed_bookmarks: randomBetween(2, 60),
    })
    .select()
    .single();

  return data;
}

async function getFeed(tier, userId) {
  let query = supabase
    .from('posts')
    .select('*');

  if (tier === 'free') {
    query = query.eq('tier', 'free');
  }

  const { data: posts } = await query
    .order('created_at', { ascending: false })
    .limit(50);

  if (!posts) return [];

  // If userId provided, fetch which posts the user liked and bookmarked
  if (userId) {
    const postIds = posts.map(p => p.id);

    const [likesRes, bookmarksRes] = await Promise.all([
      supabase.from('likes').select('post_id').eq('user_id', userId).in('post_id', postIds),
      supabase.from('bookmarks').select('post_id').eq('user_id', userId).in('post_id', postIds),
    ]);

    const likedSet     = new Set((likesRes.data     || []).map(r => r.post_id));
    const bookmarkedSet = new Set((bookmarksRes.data || []).map(r => r.post_id));

    return posts.map(p => ({
      ...p,
      user_liked:      likedSet.has(p.id),
      user_bookmarked: bookmarkedSet.has(p.id),
    }));
  }

  return posts;
}

async function getPostById(postId) {
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();

  return data;
}

// Delete by telegram_message_id (used by bot on channel post delete)
async function deletePost(telegramMessageId) {
  await supabase
    .from('posts')
    .delete()
    .eq('telegram_message_id', telegramMessageId);
}

// Delete by database UUID (used by admin panel)
async function deletePostById(postId) {
  await supabase
    .from('posts')
    .delete()
    .eq('id', postId);
}

module.exports = { syncPost, deletePost, deletePostById, getFeed, getPostById };
