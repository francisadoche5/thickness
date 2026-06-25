import React, { useEffect, useState, useRef } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import Feed from './components/Feed';
import SubscriptionBadge from './components/SubscriptionBadge';
import { loginUser, getSubscription } from './api';
import logo from './assets/logo.webp';
import ProfileButton from './components/ProfileButton';

export default function App() {
  const [user, setUser]                   = useState(null);
  const [isPremium, setIsPremium]         = useState(false);
  const [expiresAt, setExpiresAt]         = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [devBoostUnlocked, setDevBoost]   = useState(false);
  const [showDevPrompt,    setShowDevPrompt] = useState(false);
  const [devPassword,      setDevPassword]   = useState('');
  const [devError,         setDevError]      = useState('');

  const DEV_PASSWORD = import.meta.env.VITE_DEV_PASSWORD || 'thickness_dev';
  const ADMIN_TG_ID  = import.meta.env.VITE_ADMIN_TELEGRAM_ID;
  const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

  // Secret logo tap counter
  const tapCount  = useRef(0);
  const tapTimer  = useRef(null);

  function handleLogoTap() {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    if (tapCount.current >= 7) {
      tapCount.current = 0;
      setShowDevPrompt(true);
      setDevPassword('');
      setDevError('');
    } else {
      tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
    }
  }

  function handleDevPasswordSubmit() {
    if (devPassword === DEV_PASSWORD) {
      setDevBoost(true);
      setShowDevPrompt(false);
      setDevError('');
    } else {
      setDevError('Wrong password.');
      setDevPassword('');
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const tg = window.Telegram?.WebApp;
        tg?.expand();

        const initData = tg?.initData;

        if (!initData) {
          setError('Open this app inside Telegram.');
          setLoading(false);
          return;
        }

        const loginRes = await loginUser(initData);
        const userData = loginRes.data.user;
        setUser(userData);

        const subRes = await getSubscription(userData.telegram_id);
        setIsPremium(subRes.data.isPremium || false);
        setExpiresAt(subRes.data.expiresAt || null);
      } catch (err) {
        console.error(err);
        setError('Failed to load. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark">
        <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark">
        <p className="text-red-400 text-sm text-center px-6">{error}</p>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="flex flex-col h-screen bg-dark text-white max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <img
            src={logo}
            alt="Thickness"
            className="h-24 w-auto object-contain"
            onClick={handleLogoTap}
          />
          <ProfileButton
            user={user}
            isPremium={isPremium}
            expiresAt={expiresAt}
            devBoostUnlocked={devBoostUnlocked}
            onDevBoost={() => setIsPremium(true)}
          />
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-hidden px-4 pt-4">
          <Feed
            isPremium={isPremium}
            telegramId={user?.telegram_id}
            onUnlocked={() => setIsPremium(true)}
            isAdmin={ADMIN_TG_ID && String(user?.telegram_id) === String(ADMIN_TG_ID)}
            adminSecret={ADMIN_SECRET}
          />
        </div>

        {/* DevBoost password modal */}
        {showDevPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-8">
            <div className="bg-zinc-900 rounded-2xl p-6 w-full flex flex-col gap-4 border border-zinc-700">
              <p className="text-white font-bold text-center text-base">🔐 Developer Access</p>
              <input
                type="password"
                value={devPassword}
                onChange={e => { setDevPassword(e.target.value); setDevError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleDevPasswordSubmit()}
                placeholder="Enter password"
                autoFocus
                className="bg-zinc-800 text-white text-sm rounded-xl px-4 py-3 outline-none border border-zinc-700 placeholder-gray-600"
              />
              {devError && (
                <p className="text-red-400 text-xs text-center">{devError}</p>
              )}
              <button
                onClick={handleDevPasswordSubmit}
                className="w-full py-3 rounded-xl bg-amber-500 text-black text-sm font-bold"
              >
                Unlock
              </button>
              <button
                onClick={() => setShowDevPrompt(false)}
                className="w-full py-2 text-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </LanguageProvider>
  );
}
