import React, { useEffect, useState } from 'react';
import PostCard from './PostCard';
import PremiumGate from './PremiumGate';
import { getFreeFeed, getFullFeed } from '../api';
import { useLanguage } from '../i18n/LanguageContext';

export default function Feed({ isPremium, telegramId, onUnlocked }) {
  const { t } = useLanguage();
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showGate, setShowGate]   = useState(false);
  const [activeTab, setActiveTab] = useState('free');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = isPremium
          ? await getFullFeed()
          : await getFreeFeed();
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isPremium]);

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

  const displayed = activeTab === 'free'
    ? posts.filter(p => p.tier === 'free')
    : posts;

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
          onClick={() => isPremium ? setActiveTab('premium') : setShowGate(true)}
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
              isPremium={isPremium}
              userId={telegramId}
              onLockTap={() => setShowGate(true)}
            />
          ))}
        </div>
      )}

    </div>
  );
}
