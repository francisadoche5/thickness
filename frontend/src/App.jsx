import React, { useEffect, useState } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import Feed from './components/Feed';
import SubscriptionBadge from './components/SubscriptionBadge';
import { loginUser, getSubscription } from './api';

export default function App() {
  const [user, setUser]           = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const tg = window.Telegram?.WebApp;
        tg?.expand();

        const telegramUser = tg?.initDataUnsafe?.user || {
          id: 123456789,
          username: 'testuser',
          first_name: 'Test',
        };

        const loginRes = await loginUser(telegramUser);
        const userData = loginRes.data.user;
        setUser(userData);

        const subRes = await getSubscription(userData.telegram_id);
        setIsPremium(subRes.data.isPremium || false);
        setExpiresAt(subRes.data.expiresAt || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  function handleUnlocked() {
    setIsPremium(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark">
        <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="flex flex-col h-screen bg-dark text-white max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h1 className="text-lg font-bold tracking-wide">Thickness</h1>
          <SubscriptionBadge isPremium={isPremium} expiresAt={expiresAt} />
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-hidden px-4 pt-4">
          <Feed
            isPremium={isPremium}
            telegramId={user?.telegram_id}
            onUnlocked={handleUnlocked}
          />
        </div>

      </div>
    </LanguageProvider>
  );
}
