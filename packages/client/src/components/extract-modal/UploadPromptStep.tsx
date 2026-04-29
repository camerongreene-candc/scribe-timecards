import { useRef } from 'react';
import { Button } from '@castandcrew/platform-ui';
import styles from './ExtractModal.module.css';

interface UploadPromptStepProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
}

export function UploadPromptStep({ selectedFile, onFileChange }: UploadPromptStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFileChange(e.target.files?.[0] ?? null);
  }

  return (
    <div className={styles.uploadStep}>
      <p className={styles.uploadStep__hint}>
        Select a timecard report file to extract data from.
      </p>
      <div className={styles.uploadStep__row}>
        <Button buttonVariant='outlined' onPress={() => inputRef.current?.click()}>
          Choose File
        </Button>
        {selectedFile && (
          <span className={styles.uploadStep__filename}>{selectedFile.name}</span>
        )}
      </div>
      <input
        ref={inputRef}
        type='file'
        accept='.pdf,.csv,.xlsx,.xls'
        className={styles.uploadStep__hiddenInput}
        onChange={handleChange}
      />
    </div>
  );
}
