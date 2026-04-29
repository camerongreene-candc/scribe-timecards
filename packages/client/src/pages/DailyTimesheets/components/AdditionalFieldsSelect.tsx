import React from 'react';
import { Badge, MultiSelectInput, MultiOption } from '@castandcrew/platform-ui';
import { ADDITIONAL_FIELD_DEFS } from '../helpers/DailyTimesheetPage.columns';
import styles from '../DailyTimesheetPage.module.css';

interface AdditionalFieldsSelectProps {
  selectedCols: Set<string>;
  onChange: (cols: Set<string>) => void;
}

export default function AdditionalFieldsSelect({ selectedCols, onChange }: AdditionalFieldsSelectProps) {
  function handleChange(keys: 'all' | Set<React.Key>) {
    if (keys === 'all') {
      onChange(new Set(ADDITIONAL_FIELD_DEFS.map((f) => f.id)));
    } else {
      onChange(new Set([...keys].map(String)));
    }
  }

  return (
    <MultiSelectInput
      selectedKeys={selectedCols}
      onChange={handleChange}
      hasSelectAll
      hasActions
      size='sm'
      className={styles.dts_addFieldsSelect}
      renderValue={(keys) => {
        const count = keys === 'all' ? ADDITIONAL_FIELD_DEFS.length : [...keys].length;
        return (
          <span className={styles.dts_addFieldsTrigger}>
            Additional Fields
            {count > 0 && (
              <Badge badgeValue={count} colorScheme='brand' size='sm' className={styles.dts_addFieldsBadge} />
            )}
          </span>
        );
      }}
    >
      {ADDITIONAL_FIELD_DEFS.map((f) => (
        <MultiOption key={f.id} value={f.id}>{f.label}</MultiOption>
      ))}
    </MultiSelectInput>
  );
}
