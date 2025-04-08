import PropTypes from 'prop-types';
import styles from './CreateInvoiceButton.module.scss';

export default function CreateInvoiceButton({ onClick }) {
  return (
    <button className={styles.create_invoice_button} onClick={onClick}>
      Create Invoice
    </button>
  );
}

CreateInvoiceButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
