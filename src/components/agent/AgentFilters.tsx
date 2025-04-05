
import React from 'react';
import { DateRange } from 'react-day-picker';
import styles from '@/styles/modernUI.module.css';

interface AgentFiltersProps {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  schemeNameFilter: string;
  setSchemeNameFilter: React.Dispatch<React.SetStateAction<string>>;
}

export function AgentFilters({
  dateRange,
  setDateRange,
  schemeNameFilter,
  setSchemeNameFilter,
}: AgentFiltersProps) {
  const handleSchemeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSchemeNameFilter(e.target.value);
  };

  // For a simple implementation, we'll use basic date inputs
  // In a real app, you might want to use a date picker library
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setDateRange(prev => ({ ...prev, start: date }));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setDateRange(prev => ({ ...prev, end: date }));
  };

  // Format date for input value
  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <>
      <div className={styles.inputGroup}>
        <label htmlFor="scheme-name" className={styles.detailLabel}>Scheme Name</label>
        <input
          id="scheme-name"
          type="text"
          className={styles.input}
          placeholder="Filter by name"
          value={schemeNameFilter}
          onChange={handleSchemeNameChange}
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="start-date" className={styles.detailLabel}>Start Date</label>
        <input
          id="start-date"
          type="date"
          className={styles.input}
          value={formatDateForInput(dateRange.start)}
          onChange={handleStartDateChange}
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="end-date" className={styles.detailLabel}>End Date</label>
        <input
          id="end-date"
          type="date"
          className={styles.input}
          value={formatDateForInput(dateRange.end)}
          onChange={handleEndDateChange}
        />
      </div>
    </>
  );
}
