import PropTypes from 'prop-types';
import styles from './Placeholder.module.scss';

export default function Placeholder({ size = 'small' }) {
  return <span className={`${styles.placeholder} ${styles[size]}`}></span>;
}

Placeholder.propTypes = {
  size: PropTypes.string,
};
