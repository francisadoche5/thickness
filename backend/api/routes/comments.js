const router = require('express').Router();
const { addComment, getComments, getCommentCount } = require('../../modules/comments');

router.post('/', async (req, res) => {
  try {
    const { user_id, post_id, text } = req.body;
    if (!user_id || !post_id || !text) {
      return res.status(400).json({ error: 'Missing user_id, post_id or text' });
    }
    const comment = await addComment(user_id, post_id, text);
    res.json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:post_id', async (req, res) => {
  try {
    const comments = await getComments(req.params.post_id);
    const count = await getCommentCount(req.params.post_id);
    res.json({ success: true, comments, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
