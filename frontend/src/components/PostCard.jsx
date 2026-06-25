import React, { useState, useEffect } from 'react';
import PostActions from './PostActions';
import CommentSheet from './CommentSheet';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function PostCard({ post, isPremium, userId, onLockTap }) {
  const isLocked = post.tier === 'premium' && !isPremium;
  const [showComments, setShowComments] = useState(false);
  const [mediaUrl, setMediaUrl]         = useState(null);
  const [mediaError, setMediaError]     = useState(false);

  useEffect(() => {
    if (!isLocked && post.file_id) {
      setMediaUrl(`${BACKEND}/api/posts/media/${post.file_id}`);
    }
  }, [post.file_id, isLocked]);

  function renderMedia() {
    if (isLocked) {
      return (
        <button
          onClick={onLockTap}
          className="flex flex-col items-center gap-2 text-amber-400"
        >
          <span className="text-4xl">🔒</span>
          <span className="text-sm font-semibold">Premium</span>
        </button>
      );
    }

    if (!post.file_id) return null;

    if (mediaError) {
      return <span className="text-gray-600 text-sm">Media unavailable</span>;
    }

    if (post.type === 'video') {
      return (
        <video
          src={mediaUrl}
          controls
          playsInline
          className="w-full max-h-[400px] object-contain"
          onError={() => setMediaError(true)}
        />
      );
    }

    // image or document preview
    return (
      <img
        src={mediaUrl}
        alt={post.caption || 'post'}
        className="w-full max-h-[400px] object-contain"
        onError={() => setMediaError(true)}
      />
    );
  }

  return (
    <>
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-4">

        {/* Media */}
        <div className="relative bg-[#111] min-h-[180px] flex items-center justify-center">
          {renderMedia()}

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
            {isLocked ? post.caption.slice(0, 60) + '...' : post.caption}
          </div>
        )}

        {/* Date */}
        <div className="px-3 pb-2 text-xs text-gray-600">
          {new Date(post.created_at).toLocaleDateString()}
        </div>

        {/* Actions — likes, comments, bookmarks */}
        <PostActions
          post={post}
          userId={userId}
          onCommentTap={() => setShowComments(true)}
        />
      </div>

      {/* Comment sheet */}
      {showComments && (
        <CommentSheet
          post={post}
          userId={userId}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
}
