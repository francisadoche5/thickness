const router = require('express').Router();
const supabase = require('../../supabase');
const PRODUCTS = require('../../config/products');

let botInstance = null;

function setBot(bot) {
  botInstance = bot;
}

router.post('/invoice', async (req, res) => {
  try {
    const { telegram_id, product_key } = req.body;
    const product = Object.values(PRODUCTS).find(p => p.key === product_key);
    if (!product) return res.status(400).json({ error: 'Invalid product' });

    const invoice = await botInstance.telegram.createInvoiceLink({
      title: product.label,
      description: `Unlock premium content on Thickness`,
      payload: `${product.key}_${telegram_id}`,
      currency: 'XTR',
      prices: [{ label: product.label, amount: product.stars }],
    });

    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, setBot };
