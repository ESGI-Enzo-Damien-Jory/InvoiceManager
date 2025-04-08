import { useState } from 'react';
import NotificationIcon from '../../_atoms/NotificationsIcon/NotificationIcon';
import NotificationsContent from '../../_atoms/NotificationsContent/NotificationsContent';
import styles from './NotificationsDropdown.module.scss';

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Notification 1', isRead: false },
    { id: 2, text: 'Notification 2', isRead: false },
    { id: 3, text: 'Notification 3', isRead: true },
  ]);

  const hasUnread = notifications.some((notification) => !notification.isRead);

  const toggleReadStatus = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: !notification.isRead }
          : notification
      )
    );
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.dropdown_wrapper}>
      <NotificationIcon onClick={toggleDropdown} hasUnread={hasUnread} />
      <div
        className={`${styles.dropdown_content_wrapper} ${
          isOpen ? styles.open : ''
        }`}
      >
        <NotificationsContent
          notifications={notifications}
          toggleReadStatus={toggleReadStatus}
        />
      </div>
    </div>
  );
}
