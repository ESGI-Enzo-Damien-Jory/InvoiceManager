import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BsFilter } from 'react-icons/bs';
import styles from './ItemFilterBar.module.scss';
import SearchBar from '@/components/_atoms/Searchbar/SearchBar';

export default function ItemFilterBar({
  items,
  onSearch,
  setAddItem,
  selectedOption,
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const counts = {
    all: items?.length || 0,
    active: items?.filter((item) => item.is_active)?.length || 0,
    inactive: items?.filter((item) => !item.is_active)?.length || 0,
  };

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

  useEffect(() => {
    let filteredResults = [...items];

    if (selectedFilter !== 'all') {
      filteredResults = filteredResults.filter((item) =>
        selectedFilter === 'active' ? item.is_active : !item.is_active
      );
    }

    if (searchTerm.trim()) {
      filteredResults = filteredResults
        .map((item) => {
          const nameMatches = fuzzySearch(item.name, searchTerm);
          const descriptionMatches = fuzzySearch(
            item.description || '',
            searchTerm
          );
          const priceMatches = fuzzySearch(
            item.default_price?.toString() || '',
            searchTerm
          );

          const nameScore = nameMatches
            ? getSearchScore(item.name, searchTerm, nameMatches) * 2
            : 0;
          const descriptionScore = descriptionMatches
            ? getSearchScore(
                item.description || '',
                searchTerm,
                descriptionMatches
              )
            : 0;
          const priceScore = priceMatches
            ? getSearchScore(
                item.default_price?.toString() || '',
                searchTerm,
                priceMatches
              )
            : 0;

          return {
            ...item,
            searchScore: Math.max(nameScore, descriptionScore, priceScore),
          };
        })
        .filter((item) => item.searchScore > 0)
        .sort((a, b) => b.searchScore - a.searchScore);
    }

    onSearch(filteredResults);
  }, [items, selectedFilter, searchTerm, onSearch]);

  return (
    <div className={styles.container}>
      <div className={styles.child_container}>
        <button className={styles.filter_button}>
          <BsFilter />
          Filter
        </button>

        <div className={styles.radio_group}>
          <div className={styles.indicator}></div>
          {['all', 'active', 'inactive'].map((filter) => {
            const filterLabels = {
              all: 'All',
              active: 'Active',
              inactive: 'Inactive',
            };

            const filterLabel = filterLabels[filter];

            return (
              <button
                key={filter}
                className={`${styles.radio_button} ${
                  selectedFilter === filter ? styles.active : ''
                }`}
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
          <SearchBar onSearch={setSearchTerm} />
        </div>

        <button className={styles.add_button} onClick={() => setAddItem(true)}>
          Add {selectedOption === 'Products' ? 'product' : 'service'}
        </button>
      </div>
    </div>
  );
}

ItemFilterBar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      default_price: PropTypes.number,
      is_active: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onSearch: PropTypes.func.isRequired,
  setAddItem: PropTypes.func.isRequired,
  selectedOption: PropTypes.string.isRequired,
};
