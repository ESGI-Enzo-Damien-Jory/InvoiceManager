import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Avatar from '../Avatar/Avatar';
import styles from './FormDropdown.module.scss';
import { AiOutlineUserAdd } from 'react-icons/ai';

export default function FormDropdown({ data, isOpen, onSelect }) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 500);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`${styles.dropdown} ${
        isVisible ? styles.dropdown_enter : styles.dropdown_exit
      }`}
    >
      {data.map((client) => (
        <button
          key={client.id}
          className={styles.client_item}
          onClick={() => onSelect(client)}
          type="button"
        >
          <Avatar
            image_source={client.avatar}
            alt_text={client.name}
            username={client.name}
          />
          <div className={styles.client_info}>
            <div className={styles.client_name}>{client.name}</div>
            <div className={styles.client_email}>{client.email}</div>
          </div>
        </button>
      ))}
      <button className={styles.add_user} type="button">
        <AiOutlineUserAdd className={styles.icon_add} />
        Create client
      </button>
    </div>
  );
}

FormDropdown.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      avatar: PropTypes.string,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    })
  ).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};
