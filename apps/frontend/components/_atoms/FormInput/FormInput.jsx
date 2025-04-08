import PropTypes from 'prop-types';
import styles from './FormInput.module.scss';

export default function FormInput({
  type,
  placeholder,
  value,
  onChange,
  onFocus,
  isDropdownOpen,
}) {
  return (
    <div>
      <input
        className={`${styles.input} ${isDropdownOpen ? styles.open : styles.closed}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
      />
    </div>
  );
}

FormInput.propTypes = {
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  isDropdownOpen: PropTypes.bool,
};
