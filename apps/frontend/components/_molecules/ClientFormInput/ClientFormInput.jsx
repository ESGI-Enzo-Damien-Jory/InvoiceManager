import React, { useState, useRef, useEffect } from 'react';
import FormInput from '../../_atoms/FormInput/FormInput';
import FormDropdown from '../../_atoms/FormDropdown/FormDropdown';
import ClientWidget from '../ClientWidget/ClientWidget';
import Avatar from '../../_atoms/Avatar/Avatar';
import styles from './ClientFormInput.module.scss';
import PropTypes from 'prop-types';
import { useUser } from '@clerk/nextjs';

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

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.statusText}`);
    }

    return method === 'DELETE' ? response : response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

const ClientDropdownItem = ({ client }) => {
  const fullName =
    client.type === 'company'
      ? `${client.details.company_name} (${client.details.contact_name})`
      : `${client.details.first_name} ${client.details.last_name}`;

  return (
    <div className={styles.client_item}>
      <div className={styles.client_avatar}>
        <Avatar image={client.image} name={client.client_name} size="sm" />
      </div>
      <div className={styles.client_info}>
        <div className={styles.client_name}>{fullName}</div>
        <div className={styles.client_email}>{client.email}</div>
      </div>
    </div>
  );
};

export default function ClientFormInput({ onChange }) {
  const { user, isSignedIn } = useUser();
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableClient, setEditableClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchClients = async () => {
      if (!isSignedIn || !user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await makeApiRequest('/api/clients', 'GET', user.id);
        if (response && response.data) {
          response.data.forEach((client) => {
            client.name =
              client.type === 'company'
                ? client.details.company_name
                : `${client.details.first_name} ${client.details.last_name}`;
          });

          setClients(response.data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch clients:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [isSignedIn, user?.id]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsDropdownOpen(e.target.value !== '');
  };

  const handleInputFocus = () => {
    if (inputValue) {
      setIsDropdownOpen(true);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setEditableClient(client);
    onChange(client);
    setIsDropdownOpen(false);
    setInputValue('');
    setIsEditing(false);
  };

  const handleResetClient = () => {
    setSelectedClient(null);
    setEditableClient(null);
    onChange(null);
    setInputValue('');
  };

  const handleEditClient = () => {
    setEditableClient({ ...selectedClient });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    setEditableClient((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editableClient || !user?.id) return;

    try {
      const updatedClient = await makeApiRequest(
        `/api/clients/${editableClient.id}`,
        'PUT',
        user.id,
        editableClient
      );

      setClients((prevClients) =>
        prevClients.map((client) =>
          client.id === editableClient.id ? editableClient : client
        )
      );

      setSelectedClient(editableClient);
      onChange(editableClient);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save client:', err);
      setError('Failed to save client changes');
    }
  };

  const handleCancelEdit = () => {
    setEditableClient(selectedClient);
    setIsEditing(false);
  };

  const filteredClients = clients.filter((client) => {
    const searchValue = inputValue.toLowerCase();
    const fullName =
      client.type === 'company'
        ? `${client.details.company_name} ${client.details.contact_name}`
        : `${client.details.first_name} ${client.details.last_name}`;

    return (
      fullName.toLowerCase().includes(searchValue) ||
      client.email.toLowerCase().includes(searchValue)
    );
  });

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.client_form_input} ref={dropdownRef}>
      {selectedClient ? (
        <ClientWidget
          client={selectedClient}
          editableClient={editableClient}
          isEditing={isEditing}
          onReset={handleResetClient}
          onEdit={handleEditClient}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onEditChange={handleEditChange}
        />
      ) : (
        <FormInput
          type="text"
          placeholder={
            isLoading ? 'Loading clients...' : 'Search by name or email'
          }
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          isDropdownOpen={isDropdownOpen}
          disabled={isLoading}
        />
      )}
      {isDropdownOpen && !isLoading && filteredClients.length > 0 && (
        <FormDropdown
          data={filteredClients}
          isOpen={isDropdownOpen}
          onSelect={handleClientSelect}
          renderItem={(client) => <ClientDropdownItem client={client} />}
        />
      )}
    </div>
  );
}

ClientFormInput.propTypes = {
  onChange: PropTypes.func.isRequired,
};
