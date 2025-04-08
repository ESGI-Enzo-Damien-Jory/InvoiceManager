import React, { useState } from 'react';
import styles from './Calendar.module.scss';
import PropTypes from 'prop-types';

export default function Calendar({ selectedDate, onDateSelect }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [slideClass, setSlideClass] = useState('');
  const [isSliding, setIsSliding] = useState(false);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleDayClick = (day) => {
    const selectedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(selectedDate);
  };

  const handlePreviousMonth = () => {
    if (!isSliding) {
      setIsSliding(true);
      setSlideClass(styles['slide-out-right']);

      setTimeout(() => {
        setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
        setCurrentYear((prev) => (currentMonth === 0 ? prev - 1 : prev));
        setSlideClass(styles['slide-in-left']);

        setTimeout(() => {
          setSlideClass(styles['slide-in-active']);
          setIsSliding(false);
        }, 100);
      }, 300);
    }
  };

  const handleNextMonth = () => {
    if (!isSliding) {
      setIsSliding(true);
      setSlideClass(styles['slide-out-left']);

      setTimeout(() => {
        setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
        setCurrentYear((prev) => (currentMonth === 11 ? prev + 1 : prev));
        setSlideClass(styles['slide-in-right']);

        setTimeout(() => {
          setSlideClass(styles['slide-in-active']);
          setIsSliding(false);
        }, 100);
      }, 300);
    }
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.calendar_header}>
        <button onClick={handlePreviousMonth} className={styles.nav_button}>
          &lt;
        </button>
        <span className={styles.month_year}>
          {new Date(currentYear, currentMonth).toLocaleString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </span>
        <button onClick={handleNextMonth} className={styles.nav_button}>
          &gt;
        </button>
      </div>
      <div className={styles.calendar_days_container}>
        <div className={`${styles.calendar_days} ${slideClass}`}>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={styles.calendar_day}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Calendar.propTypes = {
  selectedDate: PropTypes.string,
  onDateSelect: PropTypes.func.isRequired,
};
