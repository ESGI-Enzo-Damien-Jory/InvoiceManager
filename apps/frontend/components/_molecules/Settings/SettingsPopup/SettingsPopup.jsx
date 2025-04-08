import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './SettingsPopup.module.scss';
import PropTypes from 'prop-types';
import {
  IoIosClose,
  IoIosSettings,
  IoIosDocument,
  IoMdPerson,
  IoIosCash,
  IoIosStats,
} from 'react-icons/io';
import SettingsGeneral from '@/components/_atoms/SettingsCategory/SettingsGeneral/SettingsGeneral';
import SettingsInvoice from '@/components/_atoms/SettingsCategory/SettingsInvoice/SettingsInvoice';
import SettingsClients from '@/components/_atoms/SettingsCategory/SettingsClients/SettingsClients';
import SettingsTax from '@/components/_atoms/SettingsCategory/SettingsTax/SettingsTax';
import SettingsReports from '@/components/_atoms/SettingsCategory/SettingsReports/SettingsReports';
import SeparatorLine from '@/components/_atoms/SeparatorLine/SeparatorLine';

export default function SettingsPopup({ onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [isVisible, setIsVisible] = useState(false);
  const [fadeOutContent, setFadeOutContent] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

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

  const categories = [
    { name: 'General', icon: <IoIosSettings /> },
    { name: 'Invoices', icon: <IoIosDocument /> },
    { name: 'Clients', icon: <IoMdPerson /> },
    { name: 'Tax', icon: <IoIosCash /> },
    { name: 'Reports', icon: <IoIosStats /> },
  ];

  const handleCategoryChange = (name) => {
    setFadeOutContent(true);
    setTimeout(() => {
      setSelectedCategory(name);
      setFadeOutContent(false);
    }, 300);
  };

  const renderContent = () => {
    return (
      <div
        className={`${styles.settings_content} ${
          fadeOutContent ? styles.content_hidden : styles.content_visible
        }`}
      >
        {(() => {
          switch (selectedCategory) {
            case 'General':
              return <SettingsGeneral />;
            case 'Invoices':
              return <SettingsInvoice />;
            case 'Clients':
              return <SettingsClients />;
            case 'Tax':
              return <SettingsTax />;
            case 'Reports':
              return <SettingsReports />;
            default:
              return <SettingsGeneral />;
          }
        })()}
      </div>
    );
  };

  return (
    <dialog
      className={`${styles.popup_backdrop} ${
        isVisible ? styles.visible : styles.hidden
      }`}
      ref={dialogRef}
    >
      <div
        className={`${styles.popup_container} ${
          isVisible ? styles.visible : styles.hidden
        }`}
      >
        <button
          type="button"
          className={styles.close_button}
          onClick={handleClose}
          aria-label="Close"
        >
          <IoIosClose className={styles.close_icon} />
        </button>
        <div className={styles.popup_main_container}>
          <div className={styles.settings_navbar}>
            {categories.map(({ name, icon }) => (
              <button
                key={name}
                className={
                  selectedCategory === name
                    ? styles.active_nav_item
                    : styles.nav_item
                }
                onClick={() => handleCategoryChange(name)}
              >
                {icon}
                {name}
              </button>
            ))}
          </div>
          <SeparatorLine className={styles.separator_line} />
          {renderContent()}
        </div>
      </div>
    </dialog>
  );
}

SettingsPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
};
