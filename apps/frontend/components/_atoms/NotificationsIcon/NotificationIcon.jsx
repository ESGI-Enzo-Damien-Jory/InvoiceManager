import PropTypes from 'prop-types';
import { IoIosNotifications } from 'react-icons/io';
import generic from '../../../styles/atoms/_icons.module.scss';
import styles from './NotificationIcon.module.scss';

export default function NotificationIcon({ onClick, hasUnread }) {
  return (
    <button className={generic.icon_button_container} onClick={onClick}>
      <IoIosNotifications
        className={hasUnread ? styles.unread_icon : styles.read_icon}
      />
    </button>
  );
}

NotificationIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  hasUnread: PropTypes.bool.isRequired,
};
