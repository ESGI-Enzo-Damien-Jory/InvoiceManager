import PropTypes from 'prop-types';
import { AiOutlineEdit, AiOutlineClose } from 'react-icons/ai';
import styles from './ClientActions.module.scss';

export default function ClientActions({ onEdit, onReset }) {
  return (
    <div className={styles.actions}>
      <button className={styles.edit_button} onClick={onEdit}>
        <AiOutlineEdit />
      </button>
      <button className={styles.reset_button} onClick={onReset}>
        <AiOutlineClose />
      </button>
    </div>
  );
}

ClientActions.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};
