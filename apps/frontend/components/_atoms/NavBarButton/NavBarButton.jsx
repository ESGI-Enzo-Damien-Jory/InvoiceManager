import PropTypes from 'prop-types';
import styles from './NavBarButton.module.scss';

export default function NavbarButton({ text, icon, isActive, onClick }) {
  return (
    <button
      className={`${styles.navbar_button} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.text}>{text}</span>
    </button>
  );
}

NavbarButton.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.node,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
};
