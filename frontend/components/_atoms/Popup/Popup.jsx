import { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { IoIosClose } from 'react-icons/io';
import styles from './Popup.module.scss';

export default function Popup({ isOpened, setIsOpened, title, children }) {
  const dialogRef = useRef(null);

  const handleClose = useCallback(() => {
    setIsOpened(false);
  }, [setIsOpened]);

  useEffect(() => {
    if (isOpened && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (dialogRef.current) {
      dialogRef.current.close();
    }
  }, [isOpened]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClose]);

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.popup_backdrop} ${isOpened ? styles.visible : styles.hidden}`}
    >
      <div
        className={`${styles.popup_container} ${isOpened ? styles.visible : styles.hidden}`}
      >
        <button
          type="button"
          className={styles.close_button}
          onClick={handleClose}
        >
          <IoIosClose className={styles.close_icon} />
        </button>
        <div
          className={`${styles.popup_content_wrapper} ${isOpened ? styles.content_visible : ''}`}
        >
          {title && <h2 className={styles.popup_title}>{title}</h2>}
          <div className={styles.popup_content}>{children}</div>
        </div>
      </div>
    </dialog>
  );
}

Popup.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  setIsOpened: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
};
