'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import CreateForm from '@/components/_molecules/CreateForm/CreateForm';

const makeApiRequest = async (url, method, userId, data = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'user-id': userId,
  };

  const config = {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) }),
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Error: ${response.statusText}`);
  }

  return method === 'DELETE' ? response : response.json();
};

export default function Clients() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedOption, setSelectedOption] = useState('Individuals');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [addClient, setAddClient] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  const getClientType = useCallback(
    () => (selectedOption === 'Individuals' ? 'individual' : 'company'),
    [selectedOption]
  );

  const handleApiOperation = async (operation) => {
    if (!isSignedIn) {
      throw new Error('User not signed in');
    }

    try {
      await operation();
      await fetchClients();
      setIsPopupOpen(false);
      setAddClient(false);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const fetchClients = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      if (!user?.id) throw new Error('User ID not available');
      const data = await makeApiRequest(
        `/api/clients?type=${getClientType()}`,
        'GET',
        user.id
      );
      setClients(data.data);
      setFilteredClients(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user, getClientType]);

  const createClient = async (clientData) => {
    await handleApiOperation(async () => {
      const data = {
        ...clientData,
        image: clientData.image || null,
        type: getClientType(),
      };
      await makeApiRequest('/api/clients', 'POST', user.id, data);
    });
  };

  const updateClient = async (clientId, clientData) => {
    await handleApiOperation(async () => {
      const data = {
        ...clientData,
        image: clientData.image || null,
        type: getClientType(),
      };
      await makeApiRequest(`/api/clients/${clientId}`, 'PUT', user.id, data);
    });
  };

  const handleDelete = async (clientId) => {
    await handleApiOperation(async () => {
      await makeApiRequest(`/api/clients/${clientId}`, 'DELETE', user.id);
    });
  };

  const handleSort = (field) => {
    const newDirection =
      field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    const sortedClients = [...filteredClients].sort((a, b) => {
      const aField = field === 'name' ? a.client_name : a.invoice_date;
      const bField = field === 'name' ? b.client_name : b.invoice_date;
      return (aField < bField ? -1 : 1) * (newDirection === 'asc' ? 1 : -1);
    });
    setFilteredClients(sortedClients);
    setSortField(field);
    setSortDirection(newDirection);
  };

  const getSortIconClassName = (field) =>
    `${styles.sort_icon} ${sortField === field && sortDirection === 'desc' ? styles.rotate : ''}`;

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    setSelectedClient(null);
  }, [addClient]);

  const renderTableHeader = () => (
    <tr className={styles.header_row}>
      <th
        className={`${styles.name_column} ${styles.sortable}`}
        onClick={() => handleSort('name')}
      >
        NAME
        <AiOutlineSortAscending className={getSortIconClassName('name')} />
      </th>
      <th>EMAIL</th>
      <th>LATEST INVOICE</th>
      <th className={styles.sortable} onClick={() => handleSort('invoiceDate')}>
        LATEST INVOICE DATE
        <AiOutlineSortAscending
          className={getSortIconClassName('invoiceDate')}
        />
      </th>
      <th className={styles.checkbox_header}>SELECT</th>
      <th></th>
    </tr>
  );

  const renderTableRow = (client) => (
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
          <input type="checkbox" className={styles.checkbox_input} />
          <span className={styles.checkbox_indicator}></span>
        </label>
      </td>
      <td>
        <button
          onClick={() =>
            setIsDropdownOpen(isDropdownOpen === client.id ? null : client.id)
          }
          className={styles.three_dots_btn}
        >
          <IoEllipsisHorizontal className={styles.ellipsis_icon} />
        </button>
        {isDropdownOpen === client.id && (
          <div className={styles.dropdown_menu}>
            <button
              onClick={() => {
                setSelectedClient(client);
                setIsPopupOpen(true);
              }}
            >
              Edit
            </button>
            <button onClick={() => handleDelete(client.id)}>Delete</button>
          </div>
        )}
      </td>
    </tr>
  );

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
        onSearch={setFilteredClients}
        setAddClient={setAddClient}
      />

      <div className={styles.content}>
        {loading && <Loader />}
        {!loading && !error && filteredClients?.length === 0 && (
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
                <thead>{renderTableHeader()}</thead>
                <tbody>{filteredClients.map(renderTableRow)}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Popup
        isOpened={isPopupOpen || addClient}
        setIsOpened={isPopupOpen ? setIsPopupOpen : setAddClient}
        title={`${selectedOption === 'Individuals' ? 'Client' : 'Company'}`}
      >
        <CreateForm
          client={addClient ? null : selectedClient}
          selectedOption={selectedOption}
          rawQueryMethod={isPopupOpen ? updateClient : createClient}
          onSuccess={() => {
            setIsPopupOpen(false);
            setAddClient(false);
          }}
        />
      </Popup>
    </div>
  );
}
