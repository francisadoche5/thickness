import React, { useEffect, useState } from 'react';
import { getUserBookmarks } from '../api';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function BookmarksSheet({ userId, onClose }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getUserBookmarks(userId);
        setBookmarks(res.data.bookmarks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60" onClick={onClose}>
      <div
        className="bg-zinc-900 rounded-t-2xl flex flex-col"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-bold text-white text-base">🔖 Saved Posts</span>
          <button onClick={onClose} className="text-gray-500 text-sm">Close</button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 pb-8">
          {loading ? (
            <p className="text-gray-500 text-sm text-center mt-8">Loading...</p>
          ) : bookmarks.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-8">No saved posts yet.</p>
          ) : (
            bookmarks.map(b => {
              const post = b.posts;
              if (!post) return null;
              return (
                <div key={b.id} className="flex gap-3 bg-zinc-800 rounded-xl overflow-hidden">
                  {/* Thumbnail */}
                  {post.file_id && post.type === 'image' && (
                    <img
                      src={`${BACKEND}/api/posts/media/${post.file_id}`}
                      alt=""
                      className="w-20 h-20 object-cover flex-shrink-0"
                    />
                  )}
                  {post.file_id && post.type === 'video' && (
                    <div className="w-20 h-20 bg-black flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">▶️</span>
                    </div>
                  )}
                  {!post.file_id && (
                    <div className="w-20 h-20 bg-zinc-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📄</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex flex-col justify-center py-2 pr-3 min-w-0">
                    {post.caption && (
                      <p className="text-sm text-gray-300 line-clamp-2">{post.caption}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <span className={`text-xs mt-1 font-semibold ${post.tier === 'premium' ? 'text-amber-400' : 'text-green-400'}`}>
                      {post.tier === 'premium' ? '⭐ Premium' : 'Free'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
