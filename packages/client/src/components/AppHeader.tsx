import { ProjectSelector, CountryTag } from '@castandcrew/platform-ui';
import styles from './AppHeader.module.css';

const PROJECTS = [
  {
    id: 'static-bloom',
    name: 'Static BLOOM',
    code: 'SB-001',
    countryIsoCode: 'us' as const,
    countryTagLabel: 'USD',
  },
  {
    id: 'sunset-ridge',
    name: 'Sunset Ridge',
    code: 'SR-002',
    countryIsoCode: 'us' as const,
    countryTagLabel: 'USD',
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    code: 'NL-003',
    countryIsoCode: 'ca' as const,
    countryTagLabel: 'CAD',
  },
];

interface AppHeaderProps {
  selectedProjectId: string;
  onProjectSelect: (id: string) => void;
}

export default function AppHeader({ selectedProjectId, onProjectSelect }: AppHeaderProps) {
  const selected = PROJECTS.find((p) => p.id === selectedProjectId) ?? PROJECTS[0];

  return (
    <header className={styles.appHeader}>
      <div className={styles.appHeader__left}>
        <ProjectSelector
          variant='breadcrumb'
          projects={PROJECTS}
          selectedProjectId={selectedProjectId}
          onProjectSelect={(p) => onProjectSelect(p.id)}
          ariaLabel='Select project'
          buttonClassName={styles.appHeader__projectSelector}
        />

        <span className={styles.appHeader__module}>/ Hours+</span>
      </div>

      <div className={styles.appHeader__right}>
        <span className={styles.appHeader__production}>
          {selected.name} Productions
        </span>
        <CountryTag
          countryCode={selected.countryIsoCode}
          tagText={selected.countryTagLabel}
          textPosition='right'
          size='sm'
          className={styles.appHeader__countryTag}
        />
      </div>
    </header>
  );
}
