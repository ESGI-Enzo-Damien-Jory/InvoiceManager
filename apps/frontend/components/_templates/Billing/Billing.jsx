import { useState } from 'react';
import styles from './Billing.module.scss';
import SubNavTitle from '@/components/_atoms/SubNavTitle/SubNavTitle';
import UnderlineNavBar from '@/components/_atoms/UnderlineNavBar/UnderlineNavBar';
import { useUser } from '@clerk/nextjs';
import RevenueWidget from '@/components/_molecules/RevenueWidget/RevenueWidget';

export default function Billing() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [selectedOption, setSelectedOption] = useState('Overview');

  return (
    <div className={styles.parent}>
      <SubNavTitle text="Billing" />
      <UnderlineNavBar
        options={['Overview', 'Quotation', 'Invoice']}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
      />
      <div className={styles.widget_grid_container}>
        <div className={styles.widget_container}>
          <RevenueWidget />
        </div>
        <div className={styles.widget_container}>{/* Future widget */}</div>
        <div className={styles.widget_container}>{/* Future widget */}</div>
        <div className={styles.widget_container}>{/* Future widget */}</div>
      </div>
    </div>
  );
}
