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

async function getFeed(tier) {
  const query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (tier === 'free') {
    query.eq('tier', 'free');
  }

  const { data } = await query;
  return data;
}

async function getPostById(postId) {
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();

  return data;
}

module.exports = { syncPost, getFeed, getPostById };
