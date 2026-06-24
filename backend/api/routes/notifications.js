const router = require('express').Router();
const { getNotifications, markAllRead, getUnreadCount } = require('../../modules/notifications');

router.get('/:user_id', async (req, res) => {
  try {
    const notifications = await getNotifications(req.params.user_id);
    const unread = await getUnreadCount(req.params.user_id);
    res.json({ success: true, notifications, unread });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/read/:user_id', async (req, res) => {
  try {
    await markAllRead(req.params.user_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
