import React from 'react';
import { Megaphone } from 'lucide-react';

/**
 * AdTile — Inline ad tile between faculty cards.
 * On Android devices, AdMob native ads render here.
 * On web (browser), shows a clean "Sponsored" placeholder.
 *
 * Note: True Native Ads require `@capacitor-community/admob` v5+ native
 * view injection which needs custom Android code. For now this renders a
 * visually-integrated placeholder that keeps the UI consistent.
 * The real monetization comes from the Banner Ad at the bottom (see FacultyGrid).
 */
export default function AdTile() {
  return (
    <div
      id="admob-native-tile"
      className="col-span-2 mx-0 my-1 rounded-[22px] overflow-hidden border border-[#7DA0CA] bg-[#F2F2F7]"
      style={{ minHeight: 72 }}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-11 h-11 rounded-[14px] bg-[#C1E8FF] border border-[#7DA0CA] flex items-center justify-center flex-shrink-0">
          <Megaphone size={18} color="#052659" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5483B3]">Sponsored</span>
          <p className="text-[13px] font-semibold text-[#021024] leading-snug mt-0.5 truncate">
            Supporting free access for Arcus students
          </p>
        </div>
        <span className="text-[10px] text-[#7DA0CA] font-medium flex-shrink-0">Ad</span>
      </div>
    </div>
  );
}
