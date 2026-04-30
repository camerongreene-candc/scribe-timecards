import { useRef, useState } from 'react';
import {
  Button,
  ModalProvider,
  ModalTrigger,
  ModalContent,
  ModalFooter,
} from '@castandcrew/platform-ui';
import type { ApiResponse, ProcessApiResponse } from '@scribe-timecards/shared';
import { UploadPromptStep } from './UploadPromptStep';
import { ProcessingStep } from './ProcessingStep';
import styles from './ExtractModal.module.css';

type Step = 'upload' | 'processing';

interface ExtractModalProps {
  onComplete: (data: ProcessApiResponse) => void;
}

export function ExtractModal({ onComplete }: ExtractModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const apiResultRef = useRef<ProcessApiResponse | null>(null);
  const animDoneRef = useRef(false);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setStep('upload');
      setSelectedFile(null);
      apiResultRef.current = null;
      animDoneRef.current = false;
    }
  }

  async function handleProcess() {
    if (!selectedFile) return;
    apiResultRef.current = null;
    animDoneRef.current = false;
    setStep('processing');
    try {
      const body = new FormData();
      body.append('file', selectedFile);
      const res = await fetch('/api/process', { method: 'POST', body });
      const json: ApiResponse<ProcessApiResponse> = await res.json();
      apiResultRef.current = json.data;
      if (animDoneRef.current) {
        onComplete(json.data);
        setIsOpen(false);
      }
    } catch {
      setStep('upload');
    }
  }

  function handleAnimationComplete() {
    animDoneRef.current = true;
    if (apiResultRef.current) {
      onComplete(apiResultRef.current);
      setIsOpen(false);
    }
  }

  return (
    <ModalProvider
      title='Extract from Report'
      open={isOpen}
      onOpenChange={handleOpenChange}
      height='28rem'
      footerClassName={step === 'processing' ? styles.footerHidden : undefined}
    >
      <ModalTrigger>
        <Button buttonVariant='outlined'>Extract from DTS</Button>
      </ModalTrigger>
      <ModalContent>
        {step === 'upload' ? (
          <UploadPromptStep onFileChange={setSelectedFile} />
        ) : (
          <ProcessingStep
            filename={selectedFile?.name ?? ''}
            onComplete={handleAnimationComplete}
          />
        )}
      </ModalContent>
      <ModalFooter>
        <Button size='sm' slot='close' buttonVariant='outlined'>
          Cancel
        </Button>
        <Button size='sm' isDisabled={!selectedFile} onPress={handleProcess}>
          Process
        </Button>
      </ModalFooter>
    </ModalProvider>
  );
}
