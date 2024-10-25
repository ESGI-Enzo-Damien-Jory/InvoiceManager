import PropTypes from 'prop-types';
import styles from './SubNavTitle.module.scss';

export default function SubNavTitle({ text }) {
  return <h1 className={styles.sub_nav_title}>{text}</h1>;
}

SubNavTitle.propTypes = {
  text: PropTypes.string.isRequired,
};
