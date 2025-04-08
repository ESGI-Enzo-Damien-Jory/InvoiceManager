'use client';

/**
 * Home component for the main landing page.
 *
 * This component displays the Topbar and Navbar as part of the main layout.
 *
 * @function Home
 * @returns {JSX.Element} The rendered Home component.
 */

import HomePage from '../components/_templates/HomePage/HomePage';
import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';

export const useSyncUserWithBackend = () => {
  const { user, isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) {
      console.log('Clerk not loaded yet');
      return;
    }

    const storedUserId = localStorage.getItem('lastSignedInUser');
    const currentUserId = user?.id;

    if (isSignedIn && currentUserId && currentUserId !== storedUserId) {
      console.log('New sign-in detected:', currentUserId);
      syncUser(user);
      localStorage.setItem('lastSignedInUser', currentUserId);
    }

    if (!isSignedIn) {
      console.log('Signed out, clearing stored user');
      localStorage.removeItem('lastSignedInUser');
    }
  }, [isLoaded, isSignedIn, user]);

  const syncUser = async (user) => {
    if (!user?.id || !user?.primaryEmailAddress?.emailAddress) {
      console.log('Missing required user data:', user);
      return;
    }

    try {
      console.log('Starting sync for user:', user.id);
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bypass-serverless': 'true',
        },
        credentials: 'include',
        body: JSON.stringify({
          clerk_user_id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          first_name: user.firstName,
          last_name: user.lastName,
          username: user.username || `${user.firstName}.${user.lastName}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          console.error('Sync conflict:', errorData);
        }
        throw new Error(`Sync failed: ${errorData.error}`);
      }

      const data = await response.json();
      console.log(
        data.isNewUser
          ? 'New user created successfully'
          : 'Existing user login updated'
      );
    } catch (error) {
      console.error('Sync error:', error);
      localStorage.removeItem('lastSignedInUser');
    }
  };
};

const Home = () => {
  useSyncUserWithBackend();
  return <HomePage />;
};

export default Home;
