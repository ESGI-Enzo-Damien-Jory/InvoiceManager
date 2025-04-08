import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Dropdown.module.scss';
import { FaChevronDown } from 'react-icons/fa';

export default function Dropdown({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  return (
    <div
      className={`${styles.dropdown_custom} ${isOpen ? styles.open : styles.closed}`}
    >
      <button className={styles.dropdown_header} onClick={toggleDropdown}>
        {value}
        <span className={isOpen ? styles.arrow_up : styles.arrow_down}>
          <FaChevronDown className={styles.icon_arrow} />
        </span>
      </button>
      {isOpen && (
        <div className={styles.dropdown_list}>
          {options.map((option) => (
            <button
              key={option}
              className={styles.dropdown_item}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

Dropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
