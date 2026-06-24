const supabase = require('../../supabase');

async function getNotifications(userId) {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  return data || [];
}

async function markAllRead(userId) {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId);
  return { success: true };
}

async function getUnreadCount(userId) {
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  return count || 0;
}

module.exports = { getNotifications, markAllRead, getUnreadCount };
