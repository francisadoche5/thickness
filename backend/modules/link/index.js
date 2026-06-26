const supabase = require('../../supabase');

// Save or overwrite the single active link
async function setActiveLink(url, tier) {
  await supabase
    .from('active_link')
    .upsert({ id: 1, url, tier, updated_at: new Date().toISOString() });
}

async function getActiveLink() {
  const { data } = await supabase
    .from('active_link')
    .select('*')
    .eq('id', 1)
    .single();
  return data;
}

async function clearActiveLink() {
  await supabase
    .from('active_link')
    .delete()
    .eq('id', 1);
}

module.exports = { setActiveLink, getActiveLink, clearActiveLink };
