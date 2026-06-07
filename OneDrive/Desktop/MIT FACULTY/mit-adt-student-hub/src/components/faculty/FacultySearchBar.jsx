import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import useFacultyStore from '../../store/facultyStore';
import { useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function FacultySearchBar() {
  const { t }   = useTranslation();
  const setSearch = useFacultyStore(s => s.setSearch);
  const [value, setValue] = useState('');

  function handleChange(e) {
    const v = e.target.value;
    setValue(v);
    setSearch(v);
  }

  async function handleClear() {
    await Haptics.impact({ style: ImpactStyle.Light });
    setValue('');
    setSearch('');
  }

  return (
    <div className="relative flex items-center px-4 py-2">
      <div className="relative w-full">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          color="var(--color-text-tertiary)"
          strokeWidth={2.5}
        />
        <input
          type="search"
          value={value}
          onChange={handleChange}
          placeholder={t('faculty.search_placeholder')}
          className="w-full bg-[var(--color-bg-secondary)] border-none rounded-[16px] pl-11 pr-10 py-3.5 text-[16px] font-bold text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-tertiary)] placeholder:font-bold transition-all focus:ring-2 focus:ring-[var(--color-primary)]/10"
          autoCorrect="off"
          autoCapitalize="none"
        />
        {value && (
          <button
            className="absolute right-3.5 top-1/2 -translate-y-1/2 active:opacity-60 bg-[var(--color-text-tertiary)]/20 rounded-full p-1 transition-transform active:scale-90"
            onClick={handleClear}
            type="button"
          >
            <X size={14} color="var(--color-text-secondary)" strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
}
