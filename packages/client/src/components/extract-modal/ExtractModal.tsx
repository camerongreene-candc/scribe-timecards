import { useState } from 'react';
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

type Step = 'upload' | 'processing';

interface ExtractModalProps {
  onComplete: (data: ProcessApiResponse) => void;
}

export function ExtractModal({ onComplete }: ExtractModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setStep('upload');
      setSelectedFile(null);
    }
  }

  async function handleProcess() {
    if (!selectedFile) return;
    setStep('processing');
    try {
      const body = new FormData();
      body.append('file', selectedFile);
      const res = await fetch('/api/process', { method: 'POST', body });
      const json: ApiResponse<ProcessApiResponse> = await res.json();
      onComplete(json.data);
    } catch {
      setStep('upload');
    }
  }

  return (
    <ModalProvider
      title='Extract from Report'
      open={isOpen}
      onOpenChange={handleOpenChange}
      height='24rem'
    >
      <ModalTrigger>
        <Button buttonVariant='outlined'>Extract from Report</Button>
      </ModalTrigger>
      <ModalContent>
        {step === 'upload' ? (
          <UploadPromptStep selectedFile={selectedFile} onFileChange={setSelectedFile} />
        ) : (
          <ProcessingStep />
        )}
      </ModalContent>
      {step === 'upload' && (
        <ModalFooter>
          <Button size='sm' slot='close' buttonVariant='outlined'>
            Cancel
          </Button>
          <Button size='sm' isDisabled={!selectedFile} onPress={handleProcess}>
            Process
          </Button>
        </ModalFooter>
      )}
    </ModalProvider>
  );
}
