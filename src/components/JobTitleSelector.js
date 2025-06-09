import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";

const localJobTitles = [
  { label: "Software Engineer", value: "Software Engineer" },
  { label: "Full Stack Developer", value: "Full Stack Developer" },
  { label: "Frontend Developer", value: "Frontend Developer" },
  { label: "Backend Developer", value: "Backend Developer" },
  { label: "Data Scientist", value: "Data Scientist" },
  { label: "Data Analyst", value: "Data Analyst" },
  { label: "Machine Learning Engineer", value: "Machine Learning Engineer" },
  { label: "DevOps Engineer", value: "DevOps Engineer" },
  { label: "System Administrator", value: "System Administrator" },
  { label: "Product Manager", value: "Product Manager" },
  { label: "Project Manager", value: "Project Manager" },
  { label: "Business Analyst", value: "Business Analyst" },
  { label: "Digital Marketing Manager", value: "Digital Marketing Manager" },
  { label: "Marketing Executive", value: "Marketing Executive" },
  { label: "Sales Executive", value: "Sales Executive" },
  { label: "Account Manager", value: "Account Manager" },
  { label: "HR Manager", value: "HR Manager" },
  { label: "Human Resources Executive", value: "Human Resources Executive" },
  {
    label: "Customer Service Representative",
    value: "Customer Service Representative",
  },
  { label: "Financial Analyst", value: "Financial Analyst" },
  { label: "Accountant", value: "Accountant" },
  { label: "Consultant", value: "Consultant" },
  { label: "Content Writer", value: "Content Writer" },
  { label: "Graphic Designer", value: "Graphic Designer" },
  { label: "UI/UX Designer", value: "UI/UX Designer" },
  { label: "Web Designer", value: "Web Designer" },
  { label: "Mechanical Engineer", value: "Mechanical Engineer" },
  { label: "Electrical Engineer", value: "Electrical Engineer" },
  { label: "Civil Engineer", value: "Civil Engineer" },
  { label: "Architect", value: "Architect" },
  { label: "Quality Assurance Engineer", value: "Quality Assurance Engineer" },
  { label: "Operations Manager", value: "Operations Manager" },
  { label: "Supply Chain Manager", value: "Supply Chain Manager" },
  { label: "Administrative Assistant", value: "Administrative Assistant" },
  { label: "Receptionist", value: "Receptionist" },
  { label: "Research Analyst", value: "Research Analyst" },
  { label: "Software Tester", value: "Software Tester" },
  { label: "IT Support Specialist", value: "IT Support Specialist" },
  { label: "Security Analyst", value: "Security Analyst" },
  { label: "Network Engineer", value: "Network Engineer" },
  { label: "Database Administrator", value: "Database Administrator" },
  {
    label: "Business Development Manager",
    value: "Business Development Manager",
  },
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

const JobTitleSelector = ({ onChange, value }) => {
  const loadOptions = async (inputValue, callback) => {
    if (!inputValue) {
      return callback(localJobTitles);
    }
    const filtered = localJobTitles.filter((job) =>
      job.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    if (filtered.length === 0) {
      callback([{ label: inputValue, value: inputValue }]);
    } else {
      callback(filtered);
    }
  };

  const selectedValue =
    localJobTitles.find((job) => job.value === value) ||
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
        Select Your Job Title
      </label>
      <AsyncSelect
        cacheOptions
        defaultOptions={localJobTitles}
        loadOptions={loadOptions}
        onChange={onChange}
        value={selectedValue}
        placeholder="Type to search for job titles..."
        styles={customStyles}
      />
    </div>
  );
};

export default JobTitleSelector;
