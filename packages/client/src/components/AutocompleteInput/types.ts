import type { FocusEvent, ReactNode, RefObject } from 'react';
import type { Key } from 'react-aria';
import type { ComboBoxProps } from 'react-aria-components';

/**
 * Represents a single option in the autocomplete
 */
export interface AutocompleteOptionItem {
  /** Unique identifier for the option */
  id: Key;
  /** Display label for the option */
  label: string;
  /** Optional value different from label */
  value?: string | number;
  /** Whether this option is disabled */
  isDisabled?: boolean;
  /** Optional section/group this option belongs to */
  section?: string;
  /** Any additional data for custom rendering */
  data?: Record<string, unknown>;
}

/**
 * Configuration for async loading behavior
 */
export interface AsyncConfig {
  /** Function to load options based on input value */
  loadOptions: (inputValue: string) => Promise<AutocompleteOptionItem[]>;
  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceMs?: number;
  /**
   * Minimum characters before triggering search
   * @default 1
   */
  minChars?: number;
  /** Custom loading component or text */
  loadingMessage?: ReactNode;
  /** Custom error message when loading fails */
  errorMessage?: ReactNode;
}

/**
 * Configuration for creatable/freeSolo mode
 */
export interface CreatableConfig {
  /** Enable creating new values */
  allowCreate: boolean;
  /**
   * Function to format the "create" option label
   * @param inputValue - The current input value
   * @returns Display text for the create option
   */
  formatCreateLabel?: (inputValue: string) => ReactNode;
  /**
   * Called when user creates a new value
   * @param inputValue - The value to create
   * @returns The created option (can be async)
   */
  onCreate?: (
    inputValue: string
  ) => AutocompleteOptionItem | Promise<AutocompleteOptionItem>;
  /**
   * Validate if a value can be created
   * @param inputValue - The value to validate
   * @returns true if valid, false or error message if invalid
   */
  validateCreate?: (inputValue: string) => boolean | string;
}

/**
 * Props for the AutocompleteInput component
 */
export interface AutocompleteInputProps extends Omit<
  ComboBoxProps<AutocompleteOptionItem>,
  'children' | 'className' | 'items'
> {
  // ============================================
  // DATA PROPS
  // ============================================

  /**
   * Static options to display (used when not using async)
   * Can also be used as initial/cached options with async
   */
  options?: AutocompleteOptionItem[];

  /**
   * Children for declarative option rendering
   * Alternative to options prop
   */
  children?: ReactNode;

  /**
   * Async loading configuration
   * When provided, enables async mode
   */
  async?: AsyncConfig;

  /**
   * Configuration for allowing creation of new values
   */
  creatable?: CreatableConfig;

  // ============================================
  // LABELS & CONTENT
  // ============================================

  /**
   * Label text to display above the input
   */
  label?: string;

  /**
   * Footnote text to display below the input
   */
  footnote?: string;

  /**
   * Error message when isInvalid is true
   */
  errorMessage?: string;

  /**
   * Tooltip message for the label info icon
   */
  tooltipMessage?: string;

  /**
   * Tooltip delay in milliseconds
   */
  tooltipDelay?: number;

  /**
   * Placeholder text when no value
   */
  placeholder?: string;

  /**
   * Message shown when no options match
   * @default 'No options found'
   */
  noOptionsMessage?: ReactNode;

  // ============================================
  // STATE PROPS
  // ============================================

  /**
   * Whether the field is disabled
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Whether the field is in an invalid state
   * @default false
   */
  isInvalid?: boolean;

  /**
   * Whether the field is required
   * @default false
   */
  isRequired?: boolean;

  /**
   * Whether the field is read-only
   * @default false
   */
  isReadonly?: boolean;

  /**
   * Whether the component is loading options
   * (for controlled loading state)
   */
  isLoading?: boolean;

  /**
   * Whether to show a clear button when the input has a value.
   * @default true
   */
  isClearable?: boolean;

  // ============================================
  // LAYOUT PROPS
  // ============================================

  /**
   * Whether to take full width of container
   * @default false
   */
  isFullWidth?: boolean;

  /**
   * Element to display at start of input (e.g., icon)
   */
  startAdornment?: ReactNode;

  /**
   * Element to display at end of input (before chevron)
   */
  endAdornment?: ReactNode;

  // ============================================
  // RENDERING PROPS
  // ============================================

  /**
   * Custom render function for individual options
   */
  renderOption?: (
    option: AutocompleteOptionItem,
    state: { isSelected: boolean; isFocused: boolean; isDisabled: boolean }
  ) => ReactNode;

  /**
   * Custom render function for the selected value display
   */
  renderValue?: (option: AutocompleteOptionItem | null) => ReactNode;

  /**
   * Custom render function for section headers
   */
  renderSectionHeader?: (section: string) => ReactNode;

  // ============================================
  // CSS CLASS NAMES
  // ============================================

  /**
   * Class name for the root container
   */
  className?: string;

  /**
   * Class name for the input wrapper/trigger
   */
  inputClassName?: string;

  /**
   * Class name for the dropdown popover
   */
  popoverClassName?: string;

  /**
   * Class name for the options list
   */
  listClassName?: string;

  // ============================================
  // REF PROPS (for form integration)
  // ============================================

  /**
   * Ref to the input element (for react-hook-form)
   */
  inputRef?: RefObject<HTMLInputElement | null>;

  /**
   * Ref to the trigger/wrapper element
   */
  triggerRef?: RefObject<HTMLDivElement | null>;

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Called when selection changes
   */
  onSelectionChange?: (key: Key | null) => void;

  /**
   * Called when input value changes (for controlled input)
   */
  onInputChange?: (value: string) => void;

  /**
   * Called when dropdown opens/closes
   */
  onOpenChange?: (isOpen: boolean) => void;

  /**
   * Called when input receives focus
   */
  onFocus?: (e: FocusEvent) => void;

  /**
   * Called when input loses focus
   */
  onBlur?: (e: FocusEvent) => void;

  /**
   * Called when the clear button is clicked.
   * Only fires when `isClearable` is true.
   */
  onClear?: () => void;

  // ============================================
  // FILTERING
  // ============================================

  /**
   * Custom filter function for options
   * Return true to include option
   */
  filterOption?: (
    option: AutocompleteOptionItem,
    inputValue: string
  ) => boolean;

  /**
   * When to show the dropdown menu
   * @default 'input' - show when typing
   */
  menuTrigger?: 'focus' | 'input' | 'manual';

  // ============================================
  // CONTROLLED VALUES
  // ============================================

  /**
   * Controlled selected key
   */
  selectedKey?: Key | null;

  /**
   * Default selected key (uncontrolled)
   */
  defaultSelectedKey?: Key;

  /**
   * Controlled input value
   */
  inputValue?: string;

  /**
   * Default input value (uncontrolled)
   */
  defaultInputValue?: string;

  /**
   * Name attribute for form submission
   */
  name?: string;

  // ============================================
  // SCRIBE REVIEW STATE
  // ============================================

  /** Amber highlight — AI flagged this field as low-confidence */
  needsReview?: boolean;
  /** Highlighted as the currently active review item */
  isActive?: boolean;
  /** Green highlight — field has been accepted during review */
  isAccepted?: boolean;
}

/**
 * Props for the AutocompleteOption component
 */
export interface AutocompleteOptionProps {
  /** Unique identifier for this option */
  id: Key;
  /** The display content (can be string or ReactNode for custom rendering) */
  children: ReactNode;
  /** The searchable text value (defaults to children if string) */
  textValue?: string;
  /** Whether this option is disabled */
  isDisabled?: boolean;
  /** Optional icon to display */
  icon?: ReactNode;
  /** Optional description text below the label */
  description?: string;
  /** Additional CSS class */
  className?: string;
}

/**
 * Props for the AutocompleteSection component
 */
export interface AutocompleteSectionProps {
  /** Section header title */
  title?: string;
  /** Custom header content (overrides title) */
  header?: ReactNode;
  /** The options within this section */
  children: ReactNode;
  /** Additional CSS class */
  className?: string;
}
