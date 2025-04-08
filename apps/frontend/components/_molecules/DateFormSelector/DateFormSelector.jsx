import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FiCalendar } from 'react-icons/fi';
import styles from './DateFormSelector.module.scss';
import Calendar from '../Calendar/Calendar';

export default function DateFormSelector({ label, onDateChange }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [fadeClass, setFadeClass] = useState('fade-in');
  const [isRendered, setIsRendered] = useState(false);
  const calendarRef = useRef(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onDateChange(date);

    const today = new Date().toISOString().split('T')[0];
    setIsWarningVisible(date < today);

    closeCalendar();
  };

  const toggleCalendar = () => {
    if (isCalendarOpen) {
      closeCalendar();
    } else {
      setIsRendered(true);
      setFadeClass('fade-in');
      setIsCalendarOpen(true);
    }
  };

  const closeCalendar = () => {
    setFadeClass('fade-out');
    setTimeout(() => {
      setIsCalendarOpen(false);
      setIsRendered(false);
    }, 300);
  };

  const handleClickOutside = useCallback((event) => {
    if (calendarRef.current && !calendarRef.current.contains(event.target)) {
      closeCalendar();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className={styles.date_form_selector}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.custom_date_input} onClick={toggleCalendar}>
        <input
          type="text"
          value={selectedDate || 'Select a date'}
          readOnly
          className={`${styles.date_input} ${selectedDate ? styles.selected : styles.unselected} ${isWarningVisible ? styles.warning_input : ''}`}
        />
        <FiCalendar className={styles.calendar_icon} />
      </div>
      {isRendered && (
        <div
          ref={calendarRef}
          className={`${styles.calendar_popup} ${styles[fadeClass]}`}
        >
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateChange}
          />
        </div>
      )}
      {isWarningVisible && (
        <div className={styles.warning_message}>
          <FiCalendar className={styles.icon_calendar_warning} />
          <p>The selected date is in the past!</p>
        </div>
      )}
    </div>
  );
}

DateFormSelector.propTypes = {
  label: PropTypes.string,
  onDateChange: PropTypes.func.isRequired,
};
