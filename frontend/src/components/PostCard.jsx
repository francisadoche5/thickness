import React from 'react';
import { ASSETS } from '../config/assets';

export default function PostCard({ post, isPremium, onLockTap }) {
  const isLocked = post.tier === 'premium' && !isPremium;

  function getIcon() {
    if (post.type === 'video')    return ASSETS.playIcon;
    if (post.type === 'image')    return ASSETS.imageIcon;
    if (post.type === 'document') return ASSETS.docIcon;
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-4">

      {/* Media placeholder */}
      <div className="relative bg-[#111] min-h-[180px] flex items-center justify-center">
        {isLocked ? (
          <button
            onClick={onLockTap}
            className="flex flex-col items-center gap-2 text-amber-400"
          >
            <span className="text-4xl">🔒</span>
            <span className="text-sm font-semibold">Premium</span>
          </button>
        ) : (
          <span className="text-5xl">{getIcon()}</span>
        )}

        {/* Tier badge */}
        {post.tier === 'premium' && (
          <span className="absolute top-2 right-2 bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
            ⭐ Premium
          </span>
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="p-3 text-sm text-gray-300">
          {isLocked
            ? post.caption.slice(0, 60) + '...'
            : post.caption}
        </div>
      )}

      {/* Date */}
      <div className="px-3 pb-3 text-xs text-gray-600">
        {new Date(post.created_at).toLocaleDateString()}
      </div>

    </div>
  );
}
