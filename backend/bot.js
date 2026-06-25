const { Telegraf } = require('telegraf');
const { getOrCreateUser } = require('./modules/users');
const { syncPost, deletePost } = require('./modules/posts');
const { fulfillPayment } = require('./modules/payments');
const { FREE_CHANNEL_ID, PREMIUM_CHANNEL_ID } = require('./config/channels');

const bot = new Telegraf(process.env.BOT_TOKEN);

// ── /start ────────────────────────────────────────────────────────────────────
bot.start(async (ctx) => {
  const user = ctx.from;
  await getOrCreateUser(user);

  await ctx.reply(
    `Welcome to *Thickness!* 🌟\n\nBrowse free content or unlock premium for exclusive posts.\n\nTap below to open the app!`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🌟 Open Thickness', web_app: { url: process.env.FRONTEND_URL } }
        ]]
      }
    }
  );
});

// ── Channel post listener ─────────────────────────────────────────────────────
bot.on('channel_post', async (ctx) => {
  const message = ctx.channelPost;
  const chatId = String(message.chat.id);

  if (chatId === String(FREE_CHANNEL_ID)) {
    await syncPost(message, 'free');
  } else if (chatId === String(PREMIUM_CHANNEL_ID)) {
    await syncPost(message, 'premium');
  }
});

// ── Channel post deleted ──────────────────────────────────────────────────────
bot.on('deleted_channel_post', async (ctx) => {
  try {
    const messageId = ctx.update?.deleted_channel_post?.message_id
      || ctx.update?.message_deleted?.message_id;
    if (!messageId) return;
    await deletePost(messageId);
  } catch (err) {
    console.error('Delete sync error:', err.message);
  }
});

// ── Telegram Stars payments ───────────────────────────────────────────────────
bot.on('pre_checkout_query', async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

bot.on('message', async (ctx) => {
  const payment = ctx.message?.successful_payment;
  if (!payment) return;

  const payload = payment.invoice_payload;
  const parts = payload.split('_');
  const telegramId = parts[parts.length - 1];
  const productKey = parts.slice(0, -1).join('_');

  await fulfillPayment(productKey, telegramId, ctx);
});

module.exports = bot;
