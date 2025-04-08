import { useState } from 'react';
import * as Flags from 'country-flag-icons/react/3x2';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import PropTypes from 'prop-types';
import styles from './CurrencySelector.module.scss';

const currencies = [
  { code: 'USD', name: 'United States Dollar', countryCode: 'US', symbol: '$' },
  { code: 'EUR', name: 'Euro', countryCode: 'EU', symbol: '€' },
  {
    code: 'GBP',
    name: 'British Pound Sterling',
    countryCode: 'GB',
    symbol: '£',
  },
  { code: 'JPY', name: 'Japanese Yen', countryCode: 'JP', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', countryCode: 'AU', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', countryCode: 'CA', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', countryCode: 'CH', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', countryCode: 'CN', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', countryCode: 'IN', symbol: '₹' },
];

export default function CurrencySelector({ onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
    onChange(currency);
    setIsOpen(false);
  };

  const renderFlag = (countryCode) => {
    const FlagComponent = Flags[countryCode];
    return FlagComponent ? <FlagComponent className={styles.flag} /> : null;
  };

  return (
    <div
      className={`${styles.currency_selector} ${isOpen ? styles.open : styles.closed}`}
    >
      <button
        className={`${styles.selected_currency} `}
        onClick={toggleDropdown}
      >
        {renderFlag(selectedCurrency.countryCode)}
        <span className={styles.currency_code}>{selectedCurrency.code}</span>
        <span className={styles.currency_name}>({selectedCurrency.name})</span>
        <span className={styles.arrow_icon}>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>
      {isOpen && (
        <ul
          className={`${styles.currency_list} ${isOpen ? styles.show : styles.hide}`}
        >
          {currencies.map((currency) => (
            <button
              key={currency.code}
              className={styles.currency_item}
              onClick={() => handleCurrencyChange(currency)}
            >
              {renderFlag(currency.countryCode)}
              <span className={styles.currency_code}>{currency.code}</span>
              <span className={styles.currency_name}>({currency.name})</span>
            </button>
          ))}
        </ul>
      )}
    </div>
  );
}

CurrencySelector.propTypes = {
  onChange: PropTypes.func.isRequired,
};
