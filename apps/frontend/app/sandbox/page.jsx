'use client';

import styles from './page.module.scss';
import CreateInvoice from '../../components/_templates/CreateInvoice/CreateInvoice';
export default function SandBox() {
  return (
    <div className={styles.main}>
      <CreateInvoice />
    </div>
  );
}
