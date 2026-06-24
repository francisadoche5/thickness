const router = require('express').Router();
const { toggleBookmark, getBookmarks, isBookmarkedByUser } = require('../../modules/bookmarks');

router.post('/toggle', async (req, res) => {
  try {
    const { user_id, post_id } = req.body;
    if (!user_id || !post_id) {
      return res.status(400).json({ error: 'Missing user_id or post_id' });
    }
    const result = await toggleBookmark(user_id, post_id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/:user_id', async (req, res) => {
  try {
    const bookmarks = await getBookmarks(req.params.user_id);
    res.json({ success: true, bookmarks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/check/:post_id', async (req, res) => {
  try {
    const { user_id } = req.query;
    const bookmarked = user_id
      ? await isBookmarkedByUser(user_id, req.params.post_id)
      : false;
    res.json({ success: true, bookmarked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
