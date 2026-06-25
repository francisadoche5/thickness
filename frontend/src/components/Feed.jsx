import React, { useEffect, useState } from 'react';
import PostCard from './PostCard';
import PremiumGate from './PremiumGate';
import { getFreeFeed, getFullFeed } from '../api';
import { useLanguage } from '../i18n/LanguageContext';

export default function Feed({ isPremium, telegramId, onUnlocked, isAdmin, adminSecret }) {
  const { t } = useLanguage();
  const [freePosts,    setFreePosts]    = useState([]);
  const [premiumPosts, setPremiumPosts] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showGate,     setShowGate]     = useState(false);
  const [activeTab,    setActiveTab]    = useState('free');

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
        <div className="overflow-y-auto pb-20">
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
            />
          ))}
        </div>
      )}

    </div>
  );
}
