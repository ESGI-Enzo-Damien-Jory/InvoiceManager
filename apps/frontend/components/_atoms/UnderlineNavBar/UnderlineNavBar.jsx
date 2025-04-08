import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import styles from './UnderlineNavBar.module.scss';
import HorizontalSeparatorLine from '../HoriontalSeparatorLine/HorizontalSeparatorLine';

export default function UnderlineNavBar({
  options,
  selectedOption,
  setSelectedOption,
}) {
  const [underlineStyle, setUnderlineStyle] = useState({});
  const optionsRef = useRef({});

  useEffect(() => {
    const selectedButton = optionsRef.current[selectedOption];
    if (selectedButton) {
      setUnderlineStyle({
        left: `${selectedButton.offsetLeft}px`,
        width: `${selectedButton.offsetWidth}px`,
      });
    }
  }, [selectedOption]);

  return (
    <div className={styles.underline_navbar}>
      <div className={styles.options_container}>
        {options.map((option) => (
          <button
            key={option}
            ref={(el) => (optionsRef.current[option] = el)}
            className={`${styles.underline_navbar_option} ${
              selectedOption === option
                ? styles.underline_navbar_option_selected
                : ''
            }`}
            onClick={() => setSelectedOption(option)}
          >
            {option}
          </button>
        ))}
        <div className={styles.sliding_underline} style={underlineStyle} />
      </div>
      <HorizontalSeparatorLine />
    </div>
  );
}

UnderlineNavBar.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedOption: PropTypes.string.isRequired,
  setSelectedOption: PropTypes.func.isRequired,
};
