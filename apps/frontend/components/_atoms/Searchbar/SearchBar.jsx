'use client';

import styles from './SearchBar.module.scss';
import { IoIosSearch } from 'react-icons/io';
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';

export default function SearchBar({ onSearch }) {
  const inputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <button
      type="button"
      className={styles.searchbar_container}
      onClick={handleContainerClick}
      aria-label="Search"
    >
      <IoIosSearch className={styles.icon} />
      <input
        type="text"
        placeholder="Search"
        className={styles.search_input}
        ref={inputRef}
        value={searchTerm}
        onChange={handleSearch}
      />
    </button>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};
