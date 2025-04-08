//import clerk

import { SignIn } from '@clerk/nextjs';
import styles from './styles.module.scss';

export default function signIn() {
  return (
    <div className={styles.container}>
      <SignIn routing="hash" />
    </div>
  );
}
