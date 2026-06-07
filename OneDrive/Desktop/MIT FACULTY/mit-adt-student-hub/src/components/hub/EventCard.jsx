import React from 'react';
import { MapPin, Clock, Tag } from 'lucide-react';

export default function EventCard({ event }) {
  const { title, description, venue, startTime, tags, posterURL } = event;
  
  const timeStr = startTime?.toDate 
    ? startTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : 'All day';
    
  const dateStr = startTime?.toDate
    ? startTime.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' })
    : 'Upcoming';

  return (
    <div className="flex gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-border mb-4 shadow-sm active:scale-[0.98] transition-transform">
      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center border border-border">
        {posterURL ? (
          <img src={posterURL} alt={title} className="w-full h-full object-cover" />
        ) : (
          <>
            <span className="text-[10px] font-black uppercase text-zinc-400">{startTime?.toDate ? startTime.toDate().toLocaleDateString([], { month: 'short' }) : 'MIT'}</span>
            <span className="text-2xl font-black text-primary leading-none">{startTime?.toDate ? startTime.toDate().getDate() : 'Hub'}</span>
          </>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{title}</h3>
        <div className="flex flex-col gap-1 mt-1.5">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <MapPin size={12} className="text-primary" />
            <span className="text-[11px] font-medium truncate">{venue || 'Arcus Campus'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <Clock size={12} className="text-primary" />
            <span className="text-[11px] font-medium">{timeStr} · {dateStr}</span>
          </div>
        </div>
        
        {tags && tags.length > 0 && (
          <div className="flex gap-1.5 mt-2 overflow-x-auto scroll-hide">
            {tags.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
