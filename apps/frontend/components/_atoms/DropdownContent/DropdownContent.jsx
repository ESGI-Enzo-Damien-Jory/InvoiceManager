import styles from './DropdownContent.module.scss';
import {
  IoIosPerson,
  IoIosWallet,
  IoIosSettings,
  IoIosExit,
} from 'react-icons/io';

export default function DropdownContent() {
  const actions = [
    { icon: IoIosPerson, label: 'Account infos', style: styles.action },
    { icon: IoIosWallet, label: 'Billing infos', style: styles.action },
    { icon: IoIosSettings, label: 'Settings', style: styles.action },
    { icon: IoIosExit, label: 'Log out', style: styles.action_exit },
  ];

  return (
    <div className={styles.user_actions}>
      {actions.map(({ icon: Icon, label, style }) => (
        <span key={label} className={style}>
          <Icon className={styles.icon} />
          <span className={styles.text}>{label}</span>
        </span>
      ))}
    </div>
  );
}
