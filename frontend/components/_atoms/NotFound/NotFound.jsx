import PropTypes from 'prop-types';
import styles from './NotFound.module.scss';

export default function NotFound({ text, image_name }) {
  return (
    <div className={styles.container}>
      <img src={`/${image_name}`} alt={text} className={styles.image} />
      <h1 className={styles.text_error}>{text}</h1>
    </div>
  );
}

NotFound.propTypes = {
  text: PropTypes.string.isRequired,
  image_name: PropTypes.string.isRequired,
};
