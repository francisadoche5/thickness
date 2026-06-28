import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PostCard from './PostCard';
import PremiumGate from './PremiumGate';
import { getFreeFeed, getFullFeed, getActiveLink } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import giftBox from '../assets/adbox.webp';

function extractUrl(text) {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : null;
}

function LinkOverlay({ url, onClose }) {
  let domain = '';
  try { domain = new URL(url).hostname.replace('www.', ''); } catch {}

  const [canClose,  setCanClose]  = React.useState(false);
  const [countdown, setCountdown] = React.useState(10);
  const [tapped,    setTapped]    = React.useState(false);
  const [shake,     setShake]     = React.useState(false);

  // Countdown timer — close button unlocks after N seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subtle shake loop to attract attention
  React.useEffect(() => {
    const loop = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }, 3000);
    return () => clearInterval(loop);
  }, []);

  function handleBoxTap() {
    setTapped(true);
    setTimeout(() => {
      window.open(url, '_blank');
    }, 320); // brief flash before opening
  }

  return ReactDOM.createPortal(
    <>
      <style>{`
        @keyframes giftFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes giftShake {
          0%,100% { transform: rotate(0deg) translateY(0px); }
          20%     { transform: rotate(-4deg) translateY(-2px); }
          40%     { transform: rotate(4deg) translateY(-4px); }
          60%     { transform: rotate(-3deg) translateY(-2px); }
          80%     { transform: rotate(3deg) translateY(-1px); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 40px 10px rgba(220, 38, 38, 0.35), 0 0 80px 20px rgba(220, 38, 38, 0.15); }
          50%       { box-shadow: 0 0 60px 20px rgba(220, 38, 38, 0.55), 0 0 120px 40px rgba(220, 38, 38, 0.25); }
        }
        @keyframes tapFlash {
          0%   { opacity: 1; transform: scale(1); }
          50%  { opacity: 0.6; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ringPulse {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50%     { transform: scale(1.18); opacity: 0; }
        }
        .gift-float   { animation: giftFloat 3s ease-in-out infinite; }
        .gift-shake   { animation: giftShake 0.6s ease-in-out; }
        .gift-tap     { animation: tapFlash 0.32s ease-in-out; }
        .glow-ring    { animation: glowPulse 2s ease-in-out infinite; }
        .overlay-in   { animation: fadeInUp 0.4s ease-out both; }
        .ring-pulse   { animation: ringPulse 1.8s ease-out infinite; }
      `}</style>

      {/* Backdrop */}
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
           style={{ background: 'radial-gradient(ellipse at center, rgba(30,0,0,0.92) 0%, rgba(0,0,0,0.97) 100%)', backdropFilter: 'blur(6px)' }}>

        <div className="overlay-in flex flex-col items-center gap-6 px-6 w-full max-w-xs">

          {/* Sponsor label */}
          <div style={{ color: '#b45309', fontSize: '11px', letterSpacing: '0.18em', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>
            Sponsored
          </div>

          {/* Pulsing glow ring behind box */}
          <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
            {/* Outer ring 1 */}
            <div className="ring-pulse absolute rounded-full"
                 style={{ width: 240, height: 240, border: '2px solid rgba(220,38,38,0.4)', animationDelay: '0s' }} />
            {/* Outer ring 2 */}
            <div className="ring-pulse absolute rounded-full"
                 style={{ width: 210, height: 210, border: '2px solid rgba(220,38,38,0.25)', animationDelay: '0.6s' }} />

            {/* Gift box — tappable */}
            <button
              onClick={handleBoxTap}
              className={`relative z-10 glow-ring rounded-2xl bg-transparent border-0 p-0 cursor-pointer select-none focus:outline-none
                ${tapped ? 'gift-tap' : shake ? 'gift-shake' : 'gift-float'}`}
              style={{ width: 200, height: 200 }}
              aria-label="Open sponsored link"
            >
              <img
                src={giftBox}
                alt="Tap to open"
                style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', borderRadius: 16 }}
                draggable={false}
              />
            </button>
          </div>

          {/* CTA text */}
          <div className="text-center flex flex-col gap-1">
            <p style={{ color: '#f5f5f5', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em' }}>
              Tap the box to open
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>
              {domain}
            </p>
          </div>

          {/* Countdown / Close */}
          <div className="flex items-center gap-3">
            {canClose ? (
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#9ca3af',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '8px 20px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                }}
              >
                Skip ad ✕
              </button>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#6b7280',
                fontSize: '12px',
                fontWeight: 600,
                padding: '8px 20px',
                borderRadius: 999,
                letterSpacing: '0.05em',
              }}>
                Skip in {countdown}s
              </div>
            )}
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}

export default function Feed({ isPremium, telegramId, onUnlocked, isAdmin, adminSecret, navigateToPostId, onNavigated }) {
  const { t } = useLanguage();
  const [freePosts,    setFreePosts]    = useState([]);
  const [premiumPosts, setPremiumPosts] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showGate,     setShowGate]     = useState(false);
  const [activeTab,    setActiveTab]    = useState('free');
  const [overlayUrl,   setOverlayUrl]   = useState(null);
  const postRefs = useRef({});
  const scrollRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const freeRes = await getFreeFeed(telegramId);
        setFreePosts((freeRes.data.posts || []).filter(p => p.tier === 'free'));
        if (isPremium || isAdmin) {
          const fullRes = await getFullFeed(telegramId);
          setPremiumPosts((fullRes.data.posts || []).filter(p => p.tier === 'premium'));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isPremium, isAdmin]);

  useEffect(() => {
    if (!navigateToPostId) return;
    const allPosts = [...freePosts, ...premiumPosts];
    const target = allPosts.find(p => p.id === navigateToPostId);
    if (target) setActiveTab(target.tier === 'premium' ? 'premium' : 'free');
    setTimeout(() => {
      const el = postRefs.current[navigateToPostId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.outline = '2px solid #f59e0b';
        setTimeout(() => { el.style.outline = ''; }, 1500);
      }
      onNavigated?.();
    }, 100);
  }, [navigateToPostId]);

  useEffect(() => {
    async function fetchLink() {
      try {
        const res = await getActiveLink();
        if (res.data.link?.url) setOverlayUrl(res.data.link.url);
      } catch (err) {
        console.error('Failed to fetch active link', err);
      }
    }
    fetchLink();
  }, []);

  function handleDeleted(postId) {
    setFreePosts(prev => prev.filter(p => p.id !== postId));
    setPremiumPosts(prev => prev.filter(p => p.id !== postId));
  }

  if (showGate) {
    return (
      <PremiumGate
        telegramId={telegramId}
        onUnlocked={() => { setShowGate(false); setActiveTab('free'); onUnlocked(); }}
        onBack={() => { setShowGate(false); setActiveTab('free'); }}
      />
    );
  }

  const displayed = activeTab === 'free' ? freePosts : premiumPosts;

  return (
    <div className="flex flex-col h-full">
      {overlayUrl && <LinkOverlay url={overlayUrl} onClose={() => setOverlayUrl(null)} />}

      <div className="flex border-b border-border mb-4">
        <button
          onClick={() => setActiveTab('free')}
          className={`flex-1 py-3 text-sm font-semibold transition ${
            activeTab === 'free' ? 'text-white border-b-2 border-white' : 'text-gray-500'
          }`}
        >
          {t('free')}
        </button>
        <button
          onClick={() => isPremium || isAdmin ? setActiveTab('premium') : setShowGate(true)}
          className={`flex-1 py-3 text-sm font-semibold transition ${
            activeTab === 'premium' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-500'
          }`}
        >
          {t('premium')} ⭐
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 mt-10">{t('loading')}</p>
      ) : displayed.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">{t('noPosts')}</p>
      ) : (
        <div ref={scrollRef} className="overflow-y-auto pb-20">
          {displayed.map(post => (
            <PostCard
              key={post.id}
              post={post}
              isPremium={isPremium || isAdmin}
              userId={telegramId}
              onLockTap={() => setShowGate(true)}
              isAdmin={isAdmin}
              adminSecret={adminSecret}
              onDeleted={handleDeleted}
              postRef={el => { if (el) postRefs.current[post.id] = el; }}
              adUrl={overlayUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
