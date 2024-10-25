import { useState } from 'react';
import PropTypes from 'prop-types';
import { BsFilter } from 'react-icons/bs';
import styles from './ClientFilterBar.module.scss';
import SearchBar from '@/components/_atoms/Searchbar/SearchBar';

export default function ClientFilterBar({ clients, onSearch }) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const counts = {
    all: clients?.length || 0,
    active:
      clients?.filter((client) => client.status === 'active')?.length || 0,
    inactive:
      clients?.filter((client) => client.status === 'inactive')?.length || 0,
  };

  const filterIndex = ['all', 'active', 'inactive'].indexOf(selectedFilter);
  const indicatorPosition = `translateX(${filterIndex * 100}%)`;

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      onSearch(clients);
      return;
    }

    const fuzzySearch = (str, pattern) => {
      const string = str.toLowerCase();
      pattern = pattern.toLowerCase();

      let patternIdx = 0;
      let strIdx = 0;
      let match = false;
      let matches = [];

      while (strIdx < string.length) {
        if (string[strIdx] === pattern[patternIdx]) {
          matches.push(strIdx);
          patternIdx++;
          if (patternIdx >= pattern.length) {
            match = true;
            break;
          }
        }
        strIdx++;
      }

      return match ? matches : null;
    };

    const getSearchScore = (str, pattern, matches) => {
      if (!matches) return 0;

      let consecutiveCount = 0;
      let score = matches.length;

      for (let i = 1; i < matches.length; i++) {
        if (matches[i] - matches[i - 1] === 1) {
          consecutiveCount++;
        }
      }

      const words = str.split(' ');
      let wordStartBonus = 0;
      let currentWordStart = 0;

      for (const match of matches) {
        for (const word of words) {
          if (match === currentWordStart) {
            wordStartBonus += 2;
          }
          currentWordStart += word.length + 1;
        }
      }

      return score + consecutiveCount * 2 + wordStartBonus;
    };

    const filteredClients = clients
      .map((client) => {
        const nameMatches = fuzzySearch(client.client_name, searchTerm);
        const emailMatches = fuzzySearch(client.email, searchTerm);

        const nameScore = nameMatches
          ? getSearchScore(client.client_name, searchTerm, nameMatches) * 2
          : 0;
        const emailScore = emailMatches
          ? getSearchScore(client.email, searchTerm, emailMatches)
          : 0;

        return {
          ...client,
          searchScore: Math.max(nameScore, emailScore),
        };
      })
      .filter((client) => client.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore);

    onSearch(filteredClients);
  };

  return (
    <div className={styles.container}>
      <div className={styles.child_container}>
        <button className={styles.filter_button}>
          <BsFilter />
          Filter
        </button>

        <div className={styles.radio_group}>
          <div
            className={styles.indicator}
            style={{ transform: indicatorPosition }}
          ></div>
          {['all', 'active', 'inactive'].map((filter) => {
            const filterLabels = {
              all: 'All',
              active: 'Recent',
              inactive: 'Outstanding',
            };

            const filterLabel = filterLabels[filter];

            return (
              <button
                key={filter}
                className={`${styles.radio_button} ${selectedFilter === filter ? styles.active : ''}`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filterLabel}
                <span className={styles.badge}>{counts[filter]}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className={`${styles.child_container} ${styles.right_bar}`}>
        <div className={styles.searchbar_container}>
          <SearchBar onSearch={handleSearch} />
        </div>

        <button className={styles.add_button}>Add client</button>
      </div>
    </div>
  );
}

ClientFilterBar.propTypes = {
  clients: PropTypes.arrayOf(
    PropTypes.shape({
      client_name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSearch: PropTypes.func.isRequired,
};
