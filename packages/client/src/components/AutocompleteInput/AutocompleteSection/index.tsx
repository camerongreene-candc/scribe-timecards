import clsx from 'clsx';
import { Header, ListBoxSection } from 'react-aria-components';

import type { AutocompleteSectionProps } from '../types';

import styles from './AutocompleteSection.module.css';

/**
 * AutocompleteSection component for grouping options
 * Wraps React Aria's ListBoxSection with Spotlight styling
 */
const AutocompleteSection = ({
  title,
  header,
  children,
  className,
  ...props
}: AutocompleteSectionProps) => {
  return (
    <ListBoxSection
      {...props}
      className={clsx(
        'spotlight_input',
        styles.spotlight_AutocompleteSection,
        className
      )}
    >
      {(title || header) && (
        <Header
          className={clsx(
            'spotlight_label-sm',
            styles.spotlight_AutocompleteSection_header
          )}
        >
          {header ?? title}
        </Header>
      )}
      {children}
    </ListBoxSection>
  );
};

AutocompleteSection.displayName = 'AutocompleteSection';

export default AutocompleteSection;
