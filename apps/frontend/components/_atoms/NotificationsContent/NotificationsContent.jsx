import PropTypes from 'prop-types';
import { IoIosEye, IoIosEyeOff } from 'react-icons/io';
import styles from './NotificationsContent.module.scss';

export default function NotificationsContent({
  notifications,
  toggleReadStatus,
}) {
  return (
    <div className={styles.dropdown_content}>
      {notifications.map((notification) => (
        <div key={notification.id} className={styles.notification_item}>
          <button
            type="button"
            className={notification.isRead ? styles.read : styles.unread}
            onClick={() => toggleReadStatus(notification.id)}
          >
            {notification.text}
          </button>
          <div className={styles.eye_icon}>
            {notification.isRead ? (
              <IoIosEyeOff
                className={styles.icon}
                onClick={() => toggleReadStatus(notification.id)}
              />
            ) : (
              <IoIosEye
                className={styles.icon}
                onClick={() => toggleReadStatus(notification.id)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

NotificationsContent.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      isRead: PropTypes.bool.isRequired,
    })
  ).isRequired,
  toggleReadStatus: PropTypes.func.isRequired,
};
