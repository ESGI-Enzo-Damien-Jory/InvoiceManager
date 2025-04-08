import { useState } from 'react';
import styles from './NavBar.module.scss';
import PropTypes from 'prop-types';
import NavBarButton from '../../_atoms/NavBarButton/NavBarButton';
import { AiFillDollarCircle } from 'react-icons/ai';
import { IoIosPerson } from 'react-icons/io';
import { BiSolidReport } from 'react-icons/bi';
import HorizontalSeparatorLine from '../../_atoms/HoriontalSeparatorLine/HorizontalSeparatorLine';

export default function NavBar({ setSelectedComponent }) {
  const [activeButton, setActiveButton] = useState('Billing');

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    setSelectedComponent(buttonName);
  };

  return (
    <div className={styles.navbar_container}>
      <div className={styles.buttons_container}>
        <NavBarButton
          text="Billing"
          icon={<AiFillDollarCircle />}
          isActive={activeButton === 'Billing'}
          onClick={() => handleButtonClick('Billing')}
        />
        <NavBarButton
          text="Clients"
          icon={<IoIosPerson />}
          isActive={activeButton === 'Clients'}
          onClick={() => handleButtonClick('Clients')}
        />
        <NavBarButton
          text="Reporting"
          icon={<BiSolidReport />}
          isActive={activeButton === 'Reporting'}
          onClick={() => handleButtonClick('Reporting')}
        />
      </div>
      <HorizontalSeparatorLine />
    </div>
  );
}

NavBar.propTypes = {
  setSelectedComponent: PropTypes.func.isRequired,
};
