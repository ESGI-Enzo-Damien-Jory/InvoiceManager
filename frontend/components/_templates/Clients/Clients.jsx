'use client';

import React, { useState, useEffect } from 'react';
import { AiOutlineSortAscending } from 'react-icons/ai';
import { IoEllipsisHorizontal } from 'react-icons/io5';
import styles from './Clients.module.scss';
import SubNavTitle from '@/components/_atoms/SubNavTitle/SubNavTitle';
import UnderlineNavBar from '@/components/_atoms/UnderlineNavBar/UnderlineNavBar';
import NotFound from '@/components/_atoms/NotFound/NotFound';
import Avatar from '@/components/_atoms/Avatar/Avatar';
import Placeholder from '@/components/_atoms/Placeholder/Placeholder';
import Loader from '@/components/_atoms/Loader/Loader';
import { useUser } from '@clerk/nextjs';
import ClientFilterBar from '@/components/_molecules/ClientFilterBar/ClientFilterBar';
import Popup from '@/components/_atoms/Popup/Popup';
import CreateForm from '@/components/_molecules/ClientCreateForm/CreateForm';

export default function Clients() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedOption, setSelectedOption] = useState('Individuals');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        if (!user?.id) throw new Error('User ID not available');
        const clientType =
          selectedOption === 'Individuals' ? 'individual' : 'company';

        const response = await fetch(`/api/clients?type=${clientType}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'user-id': 'user_2aX9NB1',
          },
        });

        if (!response.ok)
          throw new Error(`Error fetching clients: ${response.statusText}`);

        const data = await response.json();
        setClients(data.data);
        setFilteredClients(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [isLoaded, isSignedIn, selectedOption, user]);

  const getSortIconClassName = (field) => {
    if (sortField !== field) return styles.sort_icon;
    return `${styles.sort_icon} ${sortDirection === 'desc' ? styles.rotate : ''}`;
  };

  const handleSort = (field) => {
    const newDirection =
      field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    const sortedClients = [...filteredClients].sort((a, b) => {
      const aField = field === 'name' ? a.client_name : a.invoice_date;
      const bField = field === 'name' ? b.client_name : b.invoice_date;
      if (aField < bField) return newDirection === 'asc' ? -1 : 1;
      if (aField > bField) return newDirection === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredClients(sortedClients);
    setSortField(field);
    setSortDirection(newDirection);
  };

  const handleSearch = (results) => {
    setFilteredClients(results);
  };

  return (
    <div className={styles.parent}>
      <SubNavTitle text="Clients" />
      <UnderlineNavBar
        options={['Individuals', 'Companies']}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
      />
      <ClientFilterBar
        clients={clients}
        onSearch={handleSearch}
        setAddClient={setIsPopupOpen}
      />

      <div className={styles.content}>
        {loading && <Loader />}
        {!loading && error && <div>Error: {error}</div>}
        {!loading && !error && filteredClients.length === 0 && (
          <div className={styles.not_found}>
            <NotFound
              text={`No ${selectedOption.toLowerCase()} found`}
              image_name="no_clients.svg"
            />
          </div>
        )}
        {!loading && !error && filteredClients.length > 0 && (
          <div className={styles.data_content}>
            <div className={styles.table_container}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.header_row}>
                    <th
                      className={`${styles.name_column} ${styles.sortable}`}
                      onClick={() => handleSort('name')}
                    >
                      NAME
                      <AiOutlineSortAscending
                        className={getSortIconClassName('name')}
                      />
                    </th>
                    <th>EMAIL</th>
                    <th>LATEST INVOICE</th>
                    <th
                      className={styles.sortable}
                      onClick={() => handleSort('invoiceDate')}
                    >
                      LATEST INVOICE DATE
                      <AiOutlineSortAscending
                        className={getSortIconClassName('invoiceDate')}
                      />
                    </th>
                    <th className={styles.checkbox_header}>SELECT</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className={`${styles.data_row} ${styles.row_animation}`}
                    >
                      <td className={`${styles.name_cell} ${styles.text}`}>
                        <Avatar
                          src={client.image}
                          alt={client.client_name}
                          username={client.client_name}
                          backgroundColor="#26262A"
                        />
                        {client.client_name}
                      </td>
                      <td className={styles.text}>{client.email}</td>
                      <td>
                        <Placeholder text="Latest Invoice" />
                      </td>
                      <td>
                        <Placeholder text="Invoice Date" />
                      </td>
                      <td className={styles.checkbox_container}>
                        <label
                          className={styles.custom_checkbox}
                          aria-label={`Select ${client.client_name}`}
                        >
                          <input
                            type="checkbox"
                            className={styles.checkbox_input}
                          />
                          <span className={styles.checkbox_indicator}></span>
                        </label>
                      </td>
                      <td>
                        <button className={styles.three_dots_btn}>
                          <IoEllipsisHorizontal
                            className={styles.ellipsis_icon}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Popup
        isOpened={isPopupOpen}
        setIsOpened={setIsPopupOpen}
        title={`${selectedOption === 'Individuals' ? 'Client' : 'Company'}`}
      >
        <CreateForm selectedOption={selectedOption} />
      </Popup>
    </div>
  );
}
