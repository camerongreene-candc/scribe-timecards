import styles from './ExtractModal.module.css';
import { TransferOrb } from '../TransferOrb';

export function ProcessingStep() {
  return (
    <div className={styles.processingStep}>
      <TransferOrb size={200} autoPlay />
      <p className={styles.processingStep__label}>Processing your report…</p>
    </div>
  );
}
