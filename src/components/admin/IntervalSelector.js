import React from 'react';
import { Select, HStack, Text } from '@chakra-ui/react';
import { FiCalendar, FiClock, FiCalendar as FiCalendarOutline } from 'react-icons/fi';

const intervalOptions = [
  { value: 'hourly', label: 'Hourly', icon: <FiClock className="inline mr-1" /> },
  { value: 'daily', label: 'Daily', icon: <FiCalendarOutline className="inline mr-1" /> },
  { value: 'weekly', label: 'Weekly', icon: <FiCalendar className="inline mr-1" /> },
  { value: 'monthly', label: 'Monthly', icon: <FiCalendar className="inline mr-1" /> },
  { value: 'yearly', label: 'Yearly', icon: <FiCalendar className="inline mr-1" /> },
];

const IntervalSelector = ({
  interval,
  onIntervalChange,
  showDatePicker = true,
  date,
  onDateChange,
  className = '',
}) => {
  const selectedOption = intervalOptions.find(opt => opt.value === interval) || intervalOptions[0];

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="relative">
        <Select
          value={interval}
          onChange={(e) => onIntervalChange(e.target.value)}
          className="text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          size="sm"
        >
          {intervalOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </Select>
      </div>

      {showDatePicker && (
        <div className="flex-1 min-w-[200px]">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      )}
    </div>
  );
};

export default IntervalSelector;
