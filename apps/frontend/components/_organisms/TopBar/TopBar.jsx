import styles from './TopBar.module.scss';
import { useRouter } from 'next/navigation';

import Logo from '../../_atoms/Logo/Logo';
import SeparatorLine from '../../_atoms/SeparatorLine/SeparatorLine';
import UserDropdown from '../../_molecules/UserDropdown/UserDropdown';
import SearchBar from '../../_atoms/Searchbar/SearchBar';
import NotificationsDropdown from '../../_molecules/NotificationsDropdown/NotificationsDropdown';
import Settings from '../../_molecules/Settings/Settings';
import CreateInvoiceButton from '../../_atoms/CreateInvoiceButton/CreateInvoiceButton';

export default function TopBar() {
  const router = useRouter();

  const handleCreateInvoiceClick = () => {
    router.push('/createInvoice');
  };

  return (
    <div className={styles.topbar_container}>
      <Logo />
      <SeparatorLine />
      <UserDropdown />
      <div className={styles.search_bar_container}>
        <SearchBar />
      </div>
      <NotificationsDropdown />
      <Settings />
      <SeparatorLine />
      <CreateInvoiceButton onClick={handleCreateInvoiceClick} />
    </div>
  );
}
