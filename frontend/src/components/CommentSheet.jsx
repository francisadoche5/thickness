import React, { useEffect, useState } from 'react';
import { getComments, postComment } from '../api';

export default function CommentSheet({ post, userId, onClose }) {
  const [comments, setComments] = useState([]);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getComments(post.id);
        setComments(res.data.comments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [post.id]);

  async function handleSend() {
    if (!text.trim()) return;
    try {
      const res = await postComment(userId, post.id, text.trim());
      setComments(prev => [...prev, res.data.comment]);
      setText('');
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">

      {/* Sheet */}
      <div className="bg-[#1a1a1a] rounded-t-2xl flex flex-col max-h-[70vh]">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
          <span className="font-semibold text-white">Comments</span>
          <button onClick={onClose} className="text-gray-500 text-sm">Close</button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {loading ? (
            <p className="text-gray-500 text-sm text-center mt-4">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-4">No comments yet. Be first!</p>
          ) : (
            comments.map((c, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-xs text-amber-400 font-semibold">
                  {c.users?.first_name || c.users?.username || 'User'}
                </span>
                <span className="text-sm text-gray-300">{c.text}</span>
                <span className="text-xs text-gray-600">
                  {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Write a comment..."
            className="flex-1 bg-[#111] text-white text-sm rounded-xl px-3 py-2 outline-none border border-border"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="bg-amber-500 text-black text-sm font-bold px-3 py-2 rounded-xl disabled:opacity-40"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
