import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';
import useFacultyStore from '../../store/facultyStore';
import FacultyCard from './FacultyCard';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import { SearchX } from 'lucide-react';

/**
 * FacultyGrid — 2-column grid.
 * - Inserts an AdTile every AD_FREQUENCY (5) cards after a 4s delay.
 * - Shows AdMob Banner at bottom after 4s delay.
 * - Sorted PVC → VC → Dean → HOD → Faculty automatically (via store).
 */
export default function FacultyGrid() {
  const { t } = useTranslation();
  const { filtered, isLoading, openDetail } = useFacultyStore();
  const isAdmin = useAuthStore(s => s.isAdmin);
  // No ads anymore

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 px-4">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="pt-20">
        <EmptyState
          icon={SearchX}
          title={t('faculty.no_results')}
          subtitle={t('faculty.no_results_sub')}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-24">
      {filtered.map((item) => (
        <FacultyCard
          key={item.id}
          faculty={item}
          onClick={() => openDetail(item)}
        />
      ))}
    </div>
  );
}
