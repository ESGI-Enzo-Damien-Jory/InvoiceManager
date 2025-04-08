import PropTypes from 'prop-types';
import Avatar from '../Avatar/Avatar';
import styles from './ClientInfo.module.scss';

export default function ClientInfo({ client }) {
  return (
    <div className={styles.client_info}>
      <Avatar
        image_source={client.avatar}
        alt_text={client.name}
        username={client.name}
      />
      <div className={styles.details}>
        <div className={styles.name}>{client.name}</div>
        <div className={styles.email}>{client.email}</div>
      </div>
    </div>
  );
}

ClientInfo.propTypes = {
  client: PropTypes.shape({
    avatar: PropTypes.string,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
};
