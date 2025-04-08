import { useEffect, useState } from 'react';
import styles from './ImportExistingInvoices.module.scss';

export default function ImportExistingInvoices() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div
      className={`${styles.import_existing_invoices_container} ${isVisible ? styles.appear : ''}`}
    >
      <p className={styles.import_existing_invoices_text}>
        Want to import existing invoices?
      </p>
      <p className={styles.click_here_text}> Click Here </p>
    </div>
  );
}
