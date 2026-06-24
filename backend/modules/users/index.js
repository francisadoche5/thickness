const supabase = require('../../supabase');

async function getOrCreateUser(telegramUser) {
  const { id, username, first_name } = telegramUser;

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', id)
    .single();

  if (existing) return existing;

  const { data: newUser } = await supabase
    .from('users')
    .insert({ telegram_id: id, username, first_name })
    .select()
    .single();

  return newUser;
}

async function getUserById(telegramId) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  return data;
}

module.exports = { getOrCreateUser, getUserById };
