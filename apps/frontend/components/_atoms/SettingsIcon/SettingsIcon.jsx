import PropTypes from 'prop-types';
import { IoIosSettings } from 'react-icons/io';
import styles from '../../../styles/atoms/_icons.module.scss';

export default function NotificationIcon({ onClick }) {
  return (
    <button className={styles.icon_button_container} onClick={onClick}>
      <IoIosSettings />
    </button>
  );
}

NotificationIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
};
