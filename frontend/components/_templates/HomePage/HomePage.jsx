'use client';

import React, { useState } from 'react';

import styles from './HomePage.module.scss';

import TopBar from '../../_organisms/TopBar/TopBar';
import NavBar from '../../_organisms/NavBar/NavBar';

import Clients from '../Clients/Clients';
import Items from '../Items/Items';

export default function HomePage() {
  const [selectedComponent, setSelectedComponent] = useState('Billing');
  return (
    <div className={styles.home_page}>
      <TopBar />
      <NavBar setSelectedComponent={setSelectedComponent} />
      {/* {selectedComponent === 'Billing' && <Billing />} */}
      {selectedComponent === 'Clients' && <Clients />}
      {selectedComponent === 'Items' && <Items />}
      {/* {selectedComponent === 'Reporting' && <Reporting />} */}
    </div>
  );
}
