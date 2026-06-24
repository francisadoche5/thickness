import React, { useState } from 'react';
import { toggleLike, toggleBookmark } from '../api';

export default function PostActions({ post, userId, onCommentTap }) {
  const realLikes     = post.real_likes     || 0;
  const realComments  = post.real_comments  || 0;
  const realBookmarks = post.real_bookmarks || 0;

  const [liked,      setLiked]      = useState(post.user_liked      || false);
  const [bookmarked, setBookmarked] = useState(post.user_bookmarked || false);
  const [likes,      setLikes]      = useState((post.seed_likes     || 0) + realLikes);
  const [bookmarks,  setBookmarks]  = useState((post.seed_bookmarks || 0) + realBookmarks);

  const comments = (post.seed_comments || 0) + realComments;

  async function handleLike() {
    const next = !liked;
    setLiked(next);
    setLikes(prev => next ? prev + 1 : prev - 1);
    try {
      await toggleLike(userId, post.id);
    } catch {
      setLiked(!next);
      setLikes(prev => next ? prev - 1 : prev + 1);
    }
  }

  async function handleBookmark() {
    const next = !bookmarked;
    setBookmarked(next);
    setBookmarks(prev => next ? prev + 1 : prev - 1);
    try {
      await toggleBookmark(userId, post.id);
    } catch {
      setBookmarked(!next);
      setBookmarks(prev => next ? prev - 1 : prev + 1);
    }
  }

  return (
    <div className="flex items-center gap-5 px-3 py-2 border-t border-border">

      {/* Like */}
      <button
        onClick={handleLike}
        className="flex items-center gap-1.5 text-sm transition"
      >
        <span className={`text-lg ${liked ? 'scale-125' : ''} transition-transform`}>
          {liked ? '❤️' : '🤍'}
        </span>
        <span className={liked ? 'text-red-400' : 'text-gray-500'}>{likes}</span>
      </button>

      {/* Comment */}
      <button
        onClick={onCommentTap}
        className="flex items-center gap-1.5 text-sm transition"
      >
        <span className="text-lg">💬</span>
        <span className="text-gray-500">{comments}</span>
      </button>

      {/* Bookmark */}
      <button
        onClick={handleBookmark}
        className="flex items-center gap-1.5 text-sm transition ml-auto"
      >
        <span className={`text-lg ${bookmarked ? 'scale-125' : ''} transition-transform`}>
          {bookmarked ? '🔖' : '🏷️'}
        </span>
        <span className={bookmarked ? 'text-amber-400' : 'text-gray-500'}>{bookmarks}</span>
      </button>

    </div>
  );
}
