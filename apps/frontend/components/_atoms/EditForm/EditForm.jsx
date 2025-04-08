import { useState } from 'react';
import PropTypes from 'prop-types';
import { AiOutlineSave, AiOutlineClose } from 'react-icons/ai';
import styles from './EditForm.module.scss';

export default function EditForm({
  editableClient,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
}) {
  const [isClosing, setIsClosing] = useState(false);

  const handleCancelClick = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onCancelEdit();
    }, 400);
  };

  const handleSaveClick = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onSaveEdit();
    }, 400);
  };

  return (
    <div
      className={`${styles.edit_form} ${isClosing ? styles.edit_form_closing : ''}`}
    >
      <h3>Edit Client</h3>
      <p>Name</p>
      <input
        type="text"
        name="name"
        value={editableClient.name}
        onChange={onEditChange}
        className={styles.edit_input}
      />
      <p>Email</p>
      <input
        type="email"
        name="email"
        value={editableClient.email}
        onChange={onEditChange}
        className={styles.edit_input}
      />
      <p>Phone</p>
      <input
        type="text"
        name="phone"
        value={editableClient.phone}
        onChange={onEditChange}
        className={styles.edit_input}
      />
      <p>Address</p>
      <input
        type="text"
        name="address"
        value={editableClient.address}
        onChange={onEditChange}
        className={styles.edit_input}
      />
      <div className={styles.action_buttons}>
        <button className={styles.cancel_button} onClick={handleCancelClick}>
          <AiOutlineClose className={styles.icons} /> Cancel
        </button>
        <button className={styles.save_button} onClick={handleSaveClick}>
          <AiOutlineSave className={styles.icons} /> Save
        </button>
      </div>
    </div>
  );
}

EditForm.propTypes = {
  editableClient: PropTypes.object.isRequired,
  onEditChange: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
};
