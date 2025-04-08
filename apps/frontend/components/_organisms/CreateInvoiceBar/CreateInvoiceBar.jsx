'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Logo from '../../_atoms/Logo/Logo';
import SeparatorLine from '../../_atoms/SeparatorLine/SeparatorLine';
import ImportExistingInvoices from '../../_atoms/ImportExistingInvoices/ImportExistingInvoices';
import styles from './CreateInvoiceBar.module.scss';
import { AiOutlineClose } from 'react-icons/ai';
import HorizontalSeparatorLine from '../../_atoms/HoriontalSeparatorLine/HorizontalSeparatorLine';

export default function CreateInvoiceBar({ handleGoBack }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsVisible(true), 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={styles.topbar_with_underline}>
      <div
        className={`${styles.create_invoice_bar_container} ${isVisible ? styles.appear : ''}`}
      >
        <div className={styles.left_container}>
          <Logo />
          <SeparatorLine />
          <p className={styles.create_invoice_text}>Create Invoice</p>
          <SeparatorLine />
          <ImportExistingInvoices />
        </div>
        <div className={styles.right_container}>
          <AiOutlineClose
            className={styles.close_icon}
            onClick={handleGoBack}
          />
        </div>
      </div>
      <HorizontalSeparatorLine />
    </div>
  );
}

CreateInvoiceBar.propTypes = {
  handleGoBack: PropTypes.func,
};
