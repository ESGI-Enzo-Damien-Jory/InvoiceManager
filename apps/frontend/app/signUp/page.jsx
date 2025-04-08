import { SignUp } from '@clerk/nextjs';
import styles from './styles.module.scss';

export default function signUp() {
  return (
    <div className={styles.container}>
      <SignUp routing="hash" />
    </div>
  );
}
