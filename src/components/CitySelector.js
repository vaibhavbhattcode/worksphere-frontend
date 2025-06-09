import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async-creatable";

const localCities = [
  { label: "Mumbai", value: "Mumbai" },
  { label: "Delhi", value: "Delhi" },
  { label: "Bengaluru", value: "Bengaluru" },
  { label: "Hyderabad", value: "Hyderabad" },
  { label: "Chennai", value: "Chennai" },
  { label: "Kolkata", value: "Kolkata" },
  { label: "Pune", value: "Pune" },
  { label: "Ahmedabad", value: "Ahmedabad" },
  { label: "Surat", value: "Surat" },
  { label: "Vadodara", value: "Vadodara" },
  { label: "Rajkot", value: "Rajkot" },
  { label: "Bhavnagar", value: "Bhavnagar" },
  { label: "Jamnagar", value: "Jamnagar" },
  { label: "Gandhinagar", value: "Gandhinagar" },
  { label: "Jaipur", value: "Jaipur" },
  { label: "Lucknow", value: "Lucknow" },
  { label: "Kanpur", value: "Kanpur" },
  { label: "Nagpur", value: "Nagpur" },
  { label: "Indore", value: "Indore" },
  { label: "Bhopal", value: "Bhopal" },
  { label: "Chandigarh", value: "Chandigarh" },
  { label: "Coimbatore", value: "Coimbatore" },
  { label: "Madurai", value: "Madurai" },
  { label: "Tiruchirappalli", value: "Tiruchirappalli" },
  { label: "Kochi", value: "Kochi" },
  { label: "Thiruvananthapuram", value: "Thiruvananthapuram" },
  { label: "Kozhikode", value: "Kozhikode" },
  { label: "Mysuru", value: "Mysuru" },
  { label: "Mangalore", value: "Mangalore" },
  { label: "Hubli-Dharwad", value: "Hubli-Dharwad" },
  { label: "Nashik", value: "Nashik" },
  { label: "Aurangabad", value: "Aurangabad" },
  { label: "Agra", value: "Agra" },
  { label: "Varanasi", value: "Varanasi" },
  { label: "Noida", value: "Noida" },
  { label: "Ghaziabad", value: "Ghaziabad" },
  { label: "Jalandhar", value: "Jalandhar" },
  { label: "Amritsar", value: "Amritsar" },
  { label: "Ludhiana", value: "Ludhiana" },
  { label: "Jodhpur", value: "Jodhpur" },
  { label: "Udaipur", value: "Udaipur" },
  { label: "Bhubaneswar", value: "Bhubaneswar" },
  { label: "Cuttack", value: "Cuttack" },
  { label: "Rourkela", value: "Rourkela" },
  { label: "Siliguri", value: "Siliguri" },
  { label: "Durgapur", value: "Durgapur" },
  { label: "Asansol", value: "Asansol" },
  { label: "Srinagar", value: "Srinagar" },
  { label: "Jammu", value: "Jammu" },
  { label: "Guwahati", value: "Guwahati" },
  { label: "Dibrugarh", value: "Dibrugarh" },
  { label: "Silchar", value: "Silchar" },
  { label: "Tirupati", value: "Tirupati" },
  { label: "Vijayawada", value: "Vijayawada" },
  { label: "Guntur", value: "Guntur" },
  { label: "Faridabad", value: "Faridabad" },
  { label: "Gurgaon", value: "Gurgaon" },
  { label: "Panipat", value: "Panipat" },
  { label: "Ambala", value: "Ambala" },
  { label: "Kota", value: "Kota" },
  { label: "Ujjain", value: "Ujjain" },
  { label: "Kolhapur", value: "Kolhapur" },
];

function useDarkMode() {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

const CitySelector = ({ onChange, value }) => {
  const loadOptions = async (inputValue, callback) => {
    if (!inputValue) {
      return callback(localCities);
    }
    const filtered = localCities.filter((city) =>
      city.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    if (filtered.length === 0) {
      callback([{ label: inputValue, value: inputValue }]);
    } else {
      callback(filtered);
    }
  };

  const selectedValue =
    localCities.find((city) => city.value === value) ||
    (value ? { label: value, value } : null);

  const isDarkMode = useDarkMode();

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: isDarkMode ? "#2d3748" : "white",
      borderColor: isDarkMode ? "#4a5568" : "#e2e8f0",
      color: isDarkMode ? "white" : "black",
      boxShadow: state.isFocused ? "0 0 0 1px #3182ce" : provided.boxShadow,
      "&:hover": {
        borderColor: isDarkMode ? "#63b3ed" : "#3182ce",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? "#2d3748" : "white",
      color: isDarkMode ? "white" : "black",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDarkMode ? "white" : "black",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDarkMode ? "#a0aec0" : "#718096",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? isDarkMode
          ? "#4a5568"
          : "#ebf8ff"
        : isDarkMode
        ? "#2d3748"
        : "white",
      color: isDarkMode ? "white" : "black",
    }),
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Your City
      </label>
      <AsyncSelect
        cacheOptions
        defaultOptions={localCities}
        loadOptions={loadOptions}
        onChange={onChange}
        value={selectedValue}
        placeholder="Type to search for cities..."
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        styles={customStyles}
      />
    </div>
  );
};

export default CitySelector;
