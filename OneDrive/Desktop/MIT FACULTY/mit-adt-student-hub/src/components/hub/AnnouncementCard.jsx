import React from 'react';
import { Megaphone, Calendar, Info } from 'lucide-react';

const CATEGORY_ICONS = {
  academic: <Info size={14} />,
  event:    <Calendar size={14} />,
  alert:    <Megaphone size={14} />
};

export default function AnnouncementCard({ announcement }) {
  const { title, body, category, publishedAt } = announcement;
  const date = publishedAt?.toDate ? publishedAt.toDate().toLocaleDateString() : 'Just now';

  return (
    <div className="flex-shrink-0 w-[280px] p-4 bg-white dark:bg-zinc-900 rounded-xl border border-border mr-3 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="p-1 rounded bg-primary/10 text-primary">
          {CATEGORY_ICONS[category] || <Info size={14} />}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
          {category}
        </span>
        <span className="text-[11px] text-zinc-400 ml-auto">{date}</span>
      </div>
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-1">{title}</h3>
      <p className="text-[12px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{body}</p>
    </div>
  );
}
