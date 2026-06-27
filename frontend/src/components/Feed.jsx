import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PostCard from './PostCard';
import PremiumGate from './PremiumGate';
import { getFreeFeed, getFullFeed, getActiveLink } from '../api';
import { useLanguage } from '../i18n/LanguageContext';

function extractUrl(text) {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : null;
}

function LinkOverlay({ url, onClose }) {
  let domain = '';
  try { domain = new URL(url).hostname.replace('www.', ''); } catch {}

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl bg-black flex flex-col" style={{ height: '70vh' }}>
        {/* Top bar */}
        <div className="flex items-center gap-2 bg-zinc-900 px-3 py-2 border-b border-zinc-700 flex-shrink-0">
          <span className="text-blue-400 text-sm flex-1 truncate">🔗 {domain}</span>
          <button
            onClick={() => window.open(url, '_blank')}
            className="text-xs text-amber-400 font-semibold px-2 py-1 rounded-lg bg-zinc-800"
          >
            Open ↗
          </button>
          <button
            onClick={onClose}
            className="text-xs text-white font-bold px-2 py-1 rounded-lg bg-red-600"
          >
            ✕ Close
          </button>
        </div>
        {/* iframe */}
        <iframe
          src={url}
          title="link preview"
          className="w-full flex-1"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          allow="autoplay; encrypted-media"
        />
      </div>
    </div>,
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
  const postRefs = useRef({});  // map of post.id -> DOM ref
  const scrollRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // Always load free posts
        const freeRes = await getFreeFeed();
        setFreePosts((freeRes.data.posts || []).filter(p => p.tier === 'free'));

        // Load premium posts only if user is premium or admin
        if (isPremium || isAdmin) {
          const fullRes = await getFullFeed();
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

  // Scroll to post when navigating from bookmarks
  useEffect(() => {
    if (!navigateToPostId) return;
    // Switch to correct tab first
    const allPosts = [...freePosts, ...premiumPosts];
    const target = allPosts.find(p => p.id === navigateToPostId);
    if (target) {
      setActiveTab(target.tier === 'premium' ? 'premium' : 'free');
    }
    // Wait for render then scroll
    setTimeout(() => {
      const el = postRefs.current[navigateToPostId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Flash highlight
        el.style.outline = '2px solid #f59e0b';
        setTimeout(() => { el.style.outline = ''; }, 1500);
      }
      onNavigated?.();
    }, 100);
  }, [navigateToPostId]);

  // Fetch active link from backend and auto-open
  useEffect(() => {
    async function fetchLink() {
      try {
        const res = await getActiveLink();
        if (res.data.link?.url) {
          setOverlayUrl(res.data.link.url);
        }
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
        onUnlocked={() => {
          setShowGate(false);
          setActiveTab('free');
          onUnlocked();
        }}
        onBack={() => {
          setShowGate(false);
          setActiveTab('free');
        }}
      />
    );
  }

  const displayed = activeTab === 'free' ? freePosts : premiumPosts;

  return (
    <div className="flex flex-col h-full">
      {/* Auto-open link overlay */}
      {overlayUrl && <LinkOverlay url={overlayUrl} onClose={() => setOverlayUrl(null)} />}


      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        <button
          onClick={() => setActiveTab('free')}
          className={`flex-1 py-3 text-sm font-semibold transition ${
            activeTab === 'free'
              ? 'text-white border-b-2 border-white'
              : 'text-gray-500'
          }`}
        >
          {t('free')}
        </button>
        <button
          onClick={() => isPremium || isAdmin ? setActiveTab('premium') : setShowGate(true)}
          className={`flex-1 py-3 text-sm font-semibold transition ${
            activeTab === 'premium'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-gray-500'
          }`}
        >
          {t('premium')} ⭐
        </button>
      </div>

      {/* Posts */}
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
            />
          ))}
        </div>
      )}

    </div>
  );
}
