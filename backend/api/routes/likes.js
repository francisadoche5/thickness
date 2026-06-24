const router = require('express').Router();
const { toggleLike, getLikeCount, isLikedByUser } = require('../../modules/likes');

router.post('/toggle', async (req, res) => {
  try {
    const { user_id, post_id } = req.body;
    if (!user_id || !post_id) return res.status(400).json({ error: 'Missing user_id or post_id' });
    const result = await toggleLike(user_id, post_id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:post_id', async (req, res) => {
  try {
    const { user_id } = req.query;
    const count = await getLikeCount(req.params.post_id);
    const liked = user_id ? await isLikedByUser(user_id, req.params.post_id) : false;
    res.json({ success: true, count, liked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
