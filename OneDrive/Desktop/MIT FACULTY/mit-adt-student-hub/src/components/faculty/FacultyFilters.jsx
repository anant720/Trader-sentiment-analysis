import { useTranslation } from 'react-i18next';
import useFacultyStore from '../../store/facultyStore';
import Chip from '../ui/Chip';

/**
 * FacultyFilters — horizontal scrollable row of dept + floor chiclets.
 */
export default function FacultyFilters() {
  const { t } = useTranslation();

  const departments  = useFacultyStore(s => s.departments);
  const floors       = useFacultyStore(s => s.floors);
  const activeDept   = useFacultyStore(s => s.activeDept);
  const activeFloor  = useFacultyStore(s => s.activeFloor);
  const activeWing   = useFacultyStore(s => s.activeWing);
  const setDeptFilter  = useFacultyStore(s => s.setDeptFilter);
  const setFloorFilter = useFacultyStore(s => s.setFloorFilter);
  const setWingFilter  = useFacultyStore(s => s.setWingFilter);
  const clearFilters   = useFacultyStore(s => s.clearFilters);

  const hasFilter = !!(activeDept || activeFloor !== null || activeWing);

  return (
    <div
      className="flex gap-2 px-4 pb-3 overflow-x-auto scroll-hide"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* All — clears filters */}
      <Chip active={!hasFilter} onClick={clearFilters}>
        {t('faculty.filter_all')}
      </Chip>

      {/* Floor chips */}
      {floors?.map?.(floor => (
        <Chip
          key={`floor-${floor}`}
          active={activeFloor === floor}
          onClick={() => setFloorFilter(floor)}
        >
          {t('faculty.floor')} {floor}
        </Chip>
      ))}

      {/* Wing chips */}
      {['North', 'South'].map(wing => (
        <Chip
          key={`wing-${wing}`}
          active={activeWing === wing}
          onClick={() => setWingFilter(wing)}
        >
          {wing} Wing
        </Chip>
      ))}

      {/* Dept chips */}
      {departments?.map?.(dept => (
        <Chip
          key={dept}
          active={activeDept === dept}
          onClick={() => setDeptFilter(dept)}
        >
          {dept.length > 12 ? dept.split(/[\s&]/)[0] : dept}
        </Chip>
      ))}
    </div>
  );
}
