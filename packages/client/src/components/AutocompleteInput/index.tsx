import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Key } from 'react-aria';
import {
  Button,
  ComboBox,
  FieldError,
  Group,
  Header,
  Input,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover,
} from 'react-aria-components';

import { Icon, FieldFootnote, FieldLabel } from '@castandcrew/platform-ui';

import styles from './AutocompleteInput.module.css';
import { useAsyncAutocomplete } from './hooks/useAsyncAutocomplete';
import type { AutocompleteInputProps, AutocompleteOptionItem } from './types';

/**
 * AutocompleteInput Component
 *
 * A searchable dropdown input that supports both static options and async loading,
 * with features for creatable values, sections/grouping, custom rendering, and
 * loading/empty states.
 *
 * Built on React Aria Components for full accessibility support.
 *
 * @example
 * Basic static options:
 * ```tsx
 * <AutocompleteInput
 *   label="Country"
 *   options={[
 *     { id: 'us', label: 'United States' },
 *     { id: 'uk', label: 'United Kingdom' },
 *   ]}
 *   onSelectionChange={(key) => setCountry(key)}
 * />
 * ```
 *
 * @example
 * Async loading:
 * ```tsx
 * <AutocompleteInput
 *   label="Search Users"
 *   async={{
 *     loadOptions: async (query) => {
 *       const users = await api.searchUsers(query);
 *       return users.map(u => ({ id: u.id, label: u.name }));
 *     },
 *     debounceMs: 500,
 *     minChars: 2,
 *   }}
 * />
 * ```
 */
const AutocompleteInput = ({
  // Data
  options: staticOptions = [],
  children,
  async,
  creatable,

  // Labels
  label,
  footnote,
  errorMessage,
  tooltipMessage,
  tooltipDelay,
  placeholder,
  noOptionsMessage = 'No options found',

  // State
  isDisabled = false,
  isInvalid = false,
  isRequired = false,
  isReadonly = false,
  isLoading: controlledLoading,
  isClearable = true,

  // Layout
  isFullWidth = false,
  startAdornment,
  endAdornment,

  // Rendering
  renderOption,
  renderSectionHeader,

  // Classes
  className,
  inputClassName,
  popoverClassName,
  listClassName,

  // Scribe review state
  needsReview,
  isActive,
  isAccepted,

  // Refs
  inputRef,
  triggerRef,

  // Events
  onSelectionChange,
  onInputChange,
  onOpenChange,
  onFocus,
  onBlur,
  onClear,
  onKeyDown,

  // Filtering
  filterOption,
  menuTrigger = 'focus',

  // Controlled
  selectedKey,
  defaultSelectedKey,
  inputValue: controlledInputValue,
  defaultInputValue,
  name,

  ...props
}: AutocompleteInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  // Resolve a key to its option label from the available options
  const resolveKeyToLabel = useCallback(
    (key: Key | null | undefined, opts: AutocompleteOptionItem[]): string => {
      if (key === null || key === undefined) return '';
      const match = opts.find(
        opt => String(opt.id) === String(key)
      );
      return match?.label ?? '';
    },
    []
  );

  // Internal state for input value (uncontrolled mode)
  // Initialize from selectedKey/defaultSelectedKey if options are available
  const [internalInputValue, setInternalInputValue] = useState(() => {
    if (defaultInputValue !== null && defaultInputValue !== undefined) return defaultInputValue;
    const initKey = selectedKey ?? defaultSelectedKey;
    if (initKey !== null && initKey !== undefined && staticOptions.length > 0) {
      const label = staticOptions.find(
        opt => String(opt.id) === String(initKey)
      )?.label;
      if (label) return label;
    }
    return '';
  });
  const inputValue = controlledInputValue ?? internalInputValue;

  // Async loading hook
  const {
    options: asyncOptions,
    isLoading: asyncLoading,
    error: asyncError,
  } = useAsyncAutocomplete({
    loadOptions: async?.loadOptions,
    inputValue,
    debounceMs: async?.debounceMs ?? 300,
    minChars: async?.minChars ?? 1,
    enabled: !!async,
  });

  // Determine options source
  const baseOptions = async ? asyncOptions : staticOptions;

  // Keep input value in sync when selectedKey changes (controlled mode)
  const prevSelectedKeyRef = useRef(selectedKey);
  useEffect(() => {
    if (selectedKey === prevSelectedKeyRef.current) return;
    prevSelectedKeyRef.current = selectedKey;
    if (controlledInputValue !== undefined) return; // consumer controls input

    const label = resolveKeyToLabel(selectedKey, baseOptions);
    setInternalInputValue(label);
  }, [selectedKey, baseOptions, controlledInputValue, resolveKeyToLabel]);
  const isLoading = controlledLoading ?? asyncLoading;

  // Track whether the input is showing a selected option's label
  const hasSelectionText = useRef(false);
  hasSelectionText.current = baseOptions.some(
    opt => opt.label === inputValue && inputValue.length > 0
  );

  // Filter options (only for static mode, async handles its own filtering)
  // When the input shows a selected label, show all options
  const filteredOptions = useMemo(() => {
    if (async) return baseOptions; // Async mode: server handles filtering
    if (hasSelectionText.current) return baseOptions; // Show all when selection is displayed

    if (!filterOption) {
      // Default filtering: case-insensitive label match
      return baseOptions.filter(opt =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
      );
    }

    return baseOptions.filter(opt => filterOption(opt, inputValue));
  }, [baseOptions, inputValue, filterOption, async]);

  // Add "create" option if creatable
  const optionsWithCreate = useMemo(() => {
    if (!creatable?.allowCreate) return filteredOptions;

    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return filteredOptions;

    // Check if exact match already exists
    const exactMatch = filteredOptions.some(
      opt => opt.label.toLowerCase() === trimmedInput.toLowerCase()
    );

    if (exactMatch) return filteredOptions;

    // Validate if provided
    if (creatable.validateCreate) {
      const validation = creatable.validateCreate(trimmedInput);
      if (validation !== true) return filteredOptions;
    }

    // Add create option
    const createOption: AutocompleteOptionItem = {
      id: `__create__${trimmedInput}`,
      label: trimmedInput,
      data: { isCreateOption: true },
    };

    return [...filteredOptions, createOption];
  }, [filteredOptions, inputValue, creatable]);

  // Group options by section
  const groupedOptions = useMemo(() => {
    const groups = new Map<string | undefined, AutocompleteOptionItem[]>();

    optionsWithCreate.forEach(option => {
      const section = option.section;
      if (!groups.has(section)) {
        groups.set(section, []);
      }
      groups.get(section)?.push(option);
    });

    return groups;
  }, [optionsWithCreate]);

  // Handle input change — when the user starts typing over a selected value,
  // clear the selection text and start fresh with just the new character
  const handleInputChange = useCallback(
    (value: string) => {
      let nextValue = value;
      if (hasSelectionText.current && value.length > 0) {
        // User typed a character over the selection — keep only the last char
        nextValue = value.slice(-1);
        onSelectionChange?.(null);
      }
      if (controlledInputValue === undefined) {
        setInternalInputValue(nextValue);
      }
      onInputChange?.(nextValue);
    },
    [controlledInputValue, onInputChange, onSelectionChange]
  );

  // Handle selection — resolve the key to a label and update the input value
  // ourselves, rather than relying on react-aria's onInputChange which can
  // pass the stringified key instead of the textValue in some cases.
  const handleSelectionChange = useCallback(
    async (key: Key | null) => {
      if (key?.toString().startsWith('__create__') && creatable?.onCreate) {
        const newValue = key.toString().replace('__create__', '');
        const newOption = await creatable.onCreate(newValue);
        if (controlledInputValue === undefined) {
          setInternalInputValue(newOption.label);
        }
        onSelectionChange?.(newOption.id);
      } else {
        // Resolve key to label from our options list
        const label = resolveKeyToLabel(key, baseOptions);
        if (controlledInputValue === undefined) {
          setInternalInputValue(label);
        }
        onSelectionChange?.(key);
      }
    },
    [creatable, onSelectionChange, baseOptions, controlledInputValue, resolveKeyToLabel]
  );

  // Handle clear
  const handleClear = useCallback(() => {
    if (controlledInputValue === undefined) {
      setInternalInputValue('');
    }
    onInputChange?.('');
    onSelectionChange?.(null);
    onClear?.();
  }, [controlledInputValue, onInputChange, onSelectionChange, onClear]);

  const showClear =
    isClearable && !isDisabled && !isReadonly && inputValue.length > 0;

  // Render option content
  const renderOptionContent = (
    option: AutocompleteOptionItem,
    state: { isSelected: boolean; isFocused: boolean; isDisabled: boolean }
  ) => {
    const isCreateOption = option.data?.isCreateOption;

    if (renderOption) {
      return renderOption(option, state);
    }

    if (isCreateOption) {
      const createLabel =
        creatable?.formatCreateLabel?.(option.label) ??
        `Create "${option.label}"`;
      return (
        <span className={styles.spotlight_AutocompleteInput_createOption}>
          <Icon iconName='plus' size='xs' />
          {createLabel}
        </span>
      );
    }

    return option.label;
  };

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <div
          role='status'
          aria-live='polite'
          className={styles.spotlight_AutocompleteInput_empty}
        >
          <Icon iconName='spinner' size='sm' />
          {async?.loadingMessage ?? 'Loading...'}
        </div>
      );
    }

    if (asyncError) {
      return (
        <div role='alert' className={styles.spotlight_AutocompleteInput_empty}>
          <Icon iconName='triangle-exclamation' size='sm' />
          {async?.errorMessage ?? 'Error loading options'}
        </div>
      );
    }

    return (
      <div className={styles.spotlight_AutocompleteInput_empty}>
        {noOptionsMessage}
      </div>
    );
  };

  // Check if we have sections
  const hasSections = Array.from(groupedOptions.keys()).some(
    key => key !== undefined
  );

  return (
    <ComboBox
      className={clsx(
        'spotlight_validation',
        'spotlight_interactive',
        'spotlight_input',
        styles.spotlight_AutocompleteInput,
        {
          [styles['spotlight_AutocompleteInput-full-width']]: isFullWidth,
        },
        className
      )}
      isDisabled={isDisabled || isReadonly}
      isInvalid={isInvalid}
      selectedKey={selectedKey}
      defaultSelectedKey={defaultSelectedKey}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onSelectionChange={handleSelectionChange}
      onOpenChange={onOpenChange}
      menuTrigger={menuTrigger}
      defaultFilter={() => true}
      allowsEmptyCollection
      aria-label={label ?? 'Autocomplete'}
      name={name}
      {...props}
    >
      {label && (
        <FieldLabel
          label={label}
          isRequired={isRequired}
          tooltipMessage={tooltipMessage}
          tooltipDelay={tooltipDelay}
        />
      )}

      <Group
        ref={triggerRef}
        className={clsx(
          'spotlight_input',
          'spotlight_validation',
          'spotlight_selected',
          'spotlight_body-base',
          'spotlight_interactive',
          {
            [styles['spotlight_AutocompleteInput-readonly']]: isReadonly,
            'spotlight_validation-invalid': isInvalid,
            'spotlight_selected-selected': isFocused,
            [styles.activeCell]: isActive,
            [styles.acceptedCell]: !isActive && isAccepted,
            [styles.mediumConfidence]: !isActive && !isAccepted && needsReview,
          },
          styles.spotlight_AutocompleteInput_group,
          inputClassName
        )}
      >
        {startAdornment && (
          <span className={styles.spotlight_AutocompleteInput_adornment}>
            {startAdornment}
          </span>
        )}
        <Input
          ref={inputRef}
          className={styles.spotlight_AutocompleteInput_input}
          placeholder={placeholder}
          readOnly={isReadonly}
          onFocus={e => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onKeyDown={onKeyDown}
        />
        {endAdornment && (
          <span className={styles.spotlight_AutocompleteInput_adornment}>
            {endAdornment}
          </span>
        )}
        {showClear && (
          <button
            type='button'
            className={styles.spotlight_AutocompleteInput_clear}
            onClick={handleClear}
            aria-label='Clear input'
            tabIndex={-1}
          >
            <Icon iconName='circle-xmark' size='xs' />
          </button>
        )}
        {isLoading && (
          <span className={styles.spotlight_AutocompleteInput_loading}>
            <Icon iconName='spinner' size='xs' />
          </span>
        )}
        <Button className={styles.spotlight_AutocompleteInput_button}>
          <Icon iconName='chevron-down' size='xs' />
        </Button>
      </Group>

      <Popover
        className={clsx(
          styles.spotlight_AutocompleteInput_popover,
          'spotlight_input',
          'spotlight_selected',
          'spotlight_popover',
          popoverClassName
        )}
        offset={4}
      >
        <ListBox
          className={clsx(
            styles.spotlight_AutocompleteInput_list,
            listClassName
          )}
          renderEmptyState={renderEmptyState}
        >
          {children ??
            (hasSections
              ? Array.from(groupedOptions.entries()).map(
                  ([sectionName, sectionOptions]) => {
                    if (!sectionName) {
                      // Render ungrouped options directly
                      return sectionOptions.map(option => (
                        <ListBoxItem
                          key={option.id}
                          id={option.id}
                          textValue={option.label}
                          isDisabled={option.isDisabled}
                          className={({ isSelected }) =>
                            clsx(
                              'spotlight_input',
                              'spotlight_interactive',
                              'spotlight_selected',
                              styles.spotlight_AutocompleteInput_option,
                              {
                                'spotlight_selected-selected': isSelected,
                              }
                            )
                          }
                        >
                          {({ isSelected, isFocused, isDisabled: disabled }) =>
                            renderOptionContent(option, {
                              isSelected,
                              isFocused,
                              isDisabled: disabled,
                            })
                          }
                        </ListBoxItem>
                      ));
                    }

                    return (
                      <ListBoxSection
                        key={sectionName}
                        className={styles.spotlight_AutocompleteInput_section}
                      >
                        <Header
                          className={
                            styles.spotlight_AutocompleteInput_sectionHeader
                          }
                        >
                          {renderSectionHeader?.(sectionName) ?? sectionName}
                        </Header>
                        {sectionOptions.map(option => (
                          <ListBoxItem
                            key={option.id}
                            id={option.id}
                            textValue={option.label}
                            isDisabled={option.isDisabled}
                            className={({
                              isSelected,
                              isFocused,
                              isDisabled: disabled,
                            }) =>
                              clsx(
                                'spotlight_input',
                                'spotlight_interactive',
                                'spotlight_selected',
                                styles.spotlight_AutocompleteInput_option,
                                {
                                  'spotlight_selected-selected': isSelected,
                                  [styles[
                                    'spotlight_AutocompleteInput_option-focused'
                                  ]]: isFocused,
                                  [styles[
                                    'spotlight_AutocompleteInput_option-disabled'
                                  ]]: disabled,
                                }
                              )
                            }
                          >
                            {({
                              isSelected,
                              isFocused,
                              isDisabled: disabled,
                            }) =>
                              renderOptionContent(option, {
                                isSelected,
                                isFocused,
                                isDisabled: disabled,
                              })
                            }
                          </ListBoxItem>
                        ))}
                      </ListBoxSection>
                    );
                  }
                )
              : optionsWithCreate.map(option => (
                  <ListBoxItem
                    key={option.id}
                    id={option.id}
                    textValue={option.label}
                    isDisabled={option.isDisabled}
                    className={({ isSelected }) =>
                      clsx(
                        'spotlight_input',
                        'spotlight_interactive',
                        'spotlight_selected',
                        styles.spotlight_AutocompleteInput_option,
                        {
                          'spotlight_selected-selected': isSelected,
                        }
                      )
                    }
                  >
                    {({ isSelected, isFocused, isDisabled: disabled }) =>
                      renderOptionContent(option, {
                        isSelected,
                        isFocused,
                        isDisabled: disabled,
                      })
                    }
                  </ListBoxItem>
                )))}
        </ListBox>
      </Popover>

      {footnote && !isInvalid && <FieldFootnote footnote={footnote} />}
      {isInvalid && errorMessage && (
        <FieldError
          className={clsx('spotlight_field-error-message', 'spotlight_body-xs')}
        >
          <Icon iconName='triangle-exclamation' size='xs' />
          {errorMessage}
        </FieldError>
      )}
    </ComboBox>
  );
};

AutocompleteInput.displayName = 'AutocompleteInput';

export default AutocompleteInput;
