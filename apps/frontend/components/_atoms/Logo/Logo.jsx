import { useRouter } from 'next/navigation';
import styles from './Logo.module.scss';

export default function Logo() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <button className={styles.logo} onClick={handleLogoClick}>
      InMa
    </button>
  );
}
