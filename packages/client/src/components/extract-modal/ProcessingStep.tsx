import { useEffect, useRef, useState } from 'react';
import { Icon, ProgressBar } from '@castandcrew/platform-ui';
import { TransferOrb } from '../TransferOrb';
import { ParticleStream } from './ParticleStream';
import styles from './ExtractModal.module.css';

const PHASES = [
  'Parsing document…',
  'Extracting fields…',
  'Validating data…',
  'Finalizing…',
];

function getPhase(progress: number): string {
  return PHASES[Math.min(Math.floor(progress / 25), 3)];
}

interface ProcessingStepProps {
  filename: string;
  onComplete: () => void;
}

export function ProcessingStep({ filename, onComplete }: ProcessingStepProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const filePanelRef = useRef<HTMLDivElement>(null);
  const orbPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const DURATION = 4000;
    const start = performance.now();
    let id: number;

    function tick(now: number) {
      const p = Math.min(((now - start) / DURATION) * 100, 100);
      setProgress(Math.round(p));
      if (p < 100) {
        id = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    }

    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => onCompleteRef.current(), 2000);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <div className={styles.processingLayout}>
      <div className={styles.processingTopRow}>
        {/* Canvas sits behind file/orb panels via z-index */}
        <div className={styles.streamOverlay}>
          <ParticleStream
            progress={progress / 100}
            sourceRef={filePanelRef}
            targetRef={orbPanelRef}
          />
        </div>

        <div className={styles.filePanel} ref={filePanelRef}>
          <Icon iconName='file-lines' size='3xl' familyVariant='regular' aria-hidden />
          <span className={styles.filePanel__name}>{filename}</span>
        </div>

        <div className={styles.orbPanel} ref={orbPanelRef}>
          <TransferOrb size={300} progress={progress / 100} />
        </div>

        {done && (
          <div className={styles.doneCheckCenter}>
            <svg viewBox="0 0 24 24" width="100" height="100" aria-hidden>
              <circle cx="12" cy="12" r="11" fill="#22c55e" />
              <path d="M6.5 12l3.5 3.5 7.5-7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
        )}
      </div>

      <div className={styles.progressSection}>
        <ProgressBar value={progress} showValueLabel={false} aria-label='Processing progress' />
        <p className={styles.progressSection__phase}>{done ? 'Done!' : getPhase(progress)}</p>
      </div>
    </div>
  );
}
