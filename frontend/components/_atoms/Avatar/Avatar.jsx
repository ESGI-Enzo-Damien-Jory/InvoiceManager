import { useState } from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';
import styles from './Avatar.module.scss';

export default function Avatar({
  image_source,
  alt_text = 'User Avatar',
  username = '',
  backgroundColor = '#f0f0f0',
}) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name) => {
    if (!name) return '';
    const words = name.split(' ');
    return words.length > 1 ? `${words[0][0]}${words[1][0]}` : words[0][0];
  };

  return (
    <div className={styles.avatar} style={{ backgroundColor }}>
      {image_source && !imageError ? (
        <Image
          src={image_source}
          alt={alt_text}
          className={styles.image}
          layout="fill"
          objectFit="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={styles.placeholder}>{getInitials(username)}</div>
      )}
    </div>
  );
}

Avatar.propTypes = {
  image_source: PropTypes.string,
  alt_text: PropTypes.string,
  username: PropTypes.string,
  backgroundColor: PropTypes.string,
};
