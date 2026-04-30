import clsx from 'clsx';
import { ListBoxItem } from 'react-aria-components';

import type { AutocompleteOptionProps } from '../types';

import styles from './AutocompleteOption.module.css';

/**
 * AutocompleteOption component for declarative option rendering
 * Wraps React Aria's ListBoxItem with Spotlight styling
 */
const AutocompleteOption = ({
  id,
  children,
  textValue,
  isDisabled,
  icon,
  description,
  className,
  ...props
}: AutocompleteOptionProps) => {
  // Determine text value for accessibility and filtering
  const computedTextValue =
    textValue ?? (typeof children === 'string' ? children : 'Option');

  return (
    <ListBoxItem
      id={id}
      textValue={computedTextValue}
      isDisabled={isDisabled}
      className={({ isSelected }) =>
        clsx(
          'spotlight_input',
          'spotlight_interactive',
          'spotlight_selected',
          styles.spotlight_AutocompleteOption,
          {
            'spotlight_selected-selected': isSelected,
          },
          className
        )
      }
      {...props}
    >
      {({ isSelected }) => (
        <div className={styles.spotlight_AutocompleteOption_content}>
          {icon && (
            <span className={styles.spotlight_AutocompleteOption_icon}>
              {icon}
            </span>
          )}
          <div className={styles.spotlight_AutocompleteOption_text}>
            <span className={styles.spotlight_AutocompleteOption_label}>
              {children}
            </span>
            {description && (
              <span className={styles.spotlight_AutocompleteOption_description}>
                {description}
              </span>
            )}
          </div>
          {isSelected && (
            <span className={styles.spotlight_AutocompleteOption_checkmark}>
              <svg
                width='12'
                height='12'
                viewBox='0 0 12 12'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M10 3L4.5 8.5L2 6'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
          )}
        </div>
      )}
    </ListBoxItem>
  );
};

AutocompleteOption.displayName = 'AutocompleteOption';

export default AutocompleteOption;
