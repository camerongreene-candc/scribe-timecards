import { useRef, useState } from 'react';
import { Icon, SpinningLoader } from '@castandcrew/platform-ui';
import styles from './ExtractModal.module.css';

type UploadState = 'idle' | 'loading' | 'ready';

interface UploadPromptStepProps {
  onFileChange: (file: File | null) => void;
}

export function UploadPromptStep({ onFileChange }: UploadPromptStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [filename, setFilename] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    setUploadState('loading');
    setTimeout(() => {
      setUploadState('ready');
      onFileChange(file);
    }, 800);
  }

  return (
    <div className={styles.uploadArea}>
      {uploadState === 'idle' && (
        <button
          type='button'
          className={styles.dropzone}
          onClick={() => inputRef.current?.click()}
          aria-label='Select a file to upload'
        >
          <Icon iconName='cloud-arrow-up' size='3xl' aria-hidden />
          <span className={styles.dropzone__label}>Click to upload</span>
          <span className={styles.dropzone__hint}>.pdf · .csv · .xlsx · .xls</span>
        </button>
      )}

      {uploadState === 'loading' && (
        <div className={styles.uploadCentered}>
          <SpinningLoader size='lg' aria-label='Uploading file' />
        </div>
      )}

      {uploadState === 'ready' && (
        <div className={styles.uploadCentered}>
          <div className={styles.fileReady}>
            <Icon iconName='file-lines' size='3xl' familyVariant='regular' aria-hidden />
            <span className={styles.fileReady__name}>{filename}</span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type='file'
        accept='.pdf,.csv,.xlsx,.xls'
        className={styles.hiddenInput}
        onChange={handleChange}
      />
    </div>
  );
}
