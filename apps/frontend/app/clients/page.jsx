'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';

const ClientsPage = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        if (!user?.id) {
          throw new Error('User ID not available');
        }

        const response = await fetch('/api/clients', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'user-id': 'user_2aX9NB1',
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching clients: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('data:', data.data);
        setClients(data.data);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [isLoaded, isSignedIn, user]);

  if (loading) {
    return <div>Loading clients...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in to view your clients.</div>;
  }

  return (
    <div>
      <h1>Your Clients</h1>
      {clients.length === 0 ? (
        <p>No clients found.</p>
      ) : (
        <ul>
          {clients.map((client) => (
            <li key={client.id}>
              <h2>{client.client_name}</h2>
              <p>Email: {client.email}</p>
              <p>Phone: {client.phone}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientsPage;
