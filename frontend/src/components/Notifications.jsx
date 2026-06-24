import React, { useEffect, useState } from 'react';
import { getNotifications, markNotificationsRead } from '../api';

export default function Notifications({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getNotifications(userId);
        setNotifications(res.data.notifications || []);
        await markNotificationsRead(userId);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) {
    return <p className="text-center text-gray-500 mt-10 text-sm">Loading...</p>;
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-16 gap-3">
        <span className="text-4xl">🔔</span>
        <p className="text-gray-500 text-sm">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto pb-20 px-4 pt-4 flex flex-col gap-3">
      {notifications.map((n, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 p-3 rounded-xl border ${
            n.read ? 'border-border bg-card' : 'border-amber-500/30 bg-amber-500/5'
          }`}
        >
          <span className="text-xl">🔔</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-white">{n.message}</span>
            <span className="text-xs text-gray-600">
              {new Date(n.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
