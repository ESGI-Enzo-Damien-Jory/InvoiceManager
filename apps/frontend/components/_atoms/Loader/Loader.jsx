import React from 'react';
import styles from './Loader.module.scss';

const Loader = () => {
  return (
    <div className={styles.loader_backdrop}>
      <div className={styles.loader_bar}></div>
    </div>
  );
};

export default Loader;
