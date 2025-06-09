import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async-creatable";

const localSkills = [
  { label: "JavaScript", value: "javascript" },
  { label: "React", value: "react" },
  { label: "Angular", value: "angular" },
  { label: "Vue.js", value: "vuejs" },
  { label: "Node.js", value: "nodejs" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C#", value: "csharp" },
  { label: "Ruby", value: "ruby" },
  { label: "PHP", value: "php" },
  { label: "Swift", value: "swift" },
  { label: "Kotlin", value: "kotlin" },
  { label: "SQL", value: "sql" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "Linux", value: "linux" },
  { label: "Windows", value: "windows" },
  { label: "Cybersecurity", value: "cybersecurity" },
  { label: "AWS", value: "aws" },
  { label: "Azure", value: "azure" },
  { label: "Google Cloud", value: "google-cloud" },
  { label: "Docker", value: "docker" },
  { label: "Kubernetes", value: "kubernetes" },
  { label: "DevOps", value: "devops" },
  { label: "CI/CD", value: "ci-cd" },
  { label: "SEO", value: "seo" },
  { label: "Content Marketing", value: "content-marketing" },
  { label: "Social Media Marketing", value: "social-media-marketing" },
  { label: "Google Analytics", value: "google-analytics" },
  { label: "SEM", value: "sem" },
  { label: "Email Marketing", value: "email-marketing" },
  { label: "PPC", value: "ppc" },
  { label: "Sales Strategy", value: "sales-strategy" },
  { label: "Negotiation", value: "negotiation" },
  { label: "CRM", value: "crm" },
  { label: "Lead Generation", value: "lead-generation" },
  { label: "Account Management", value: "account-management" },
  { label: "Customer Service", value: "customer-service" },
  { label: "Graphic Design", value: "graphic-design" },
  { label: "UI/UX Design", value: "ui-ux-design" },
  { label: "Adobe Photoshop", value: "adobe-photoshop" },
  { label: "Adobe Illustrator", value: "adobe-illustrator" },
  { label: "Figma", value: "figma" },
  { label: "Sketch", value: "sketch" },
  { label: "InDesign", value: "indesign" },
  { label: "Financial Analysis", value: "financial-analysis" },
  { label: "Budgeting", value: "budgeting" },
  { label: "Forecasting", value: "forecasting" },
  { label: "QuickBooks", value: "quickbooks" },
  { label: "Excel", value: "excel" },
  { label: "Recruitment", value: "recruitment" },
  { label: "Talent Acquisition", value: "talent-acquisition" },
  { label: "Onboarding", value: "onboarding" },
  { label: "Employee Engagement", value: "employee-engagement" },
  { label: "HRIS", value: "hris" },
  { label: "Supply Chain Management", value: "supply-chain-management" },
  { label: "Logistics", value: "logistics" },
  { label: "Operations Management", value: "operations-management" },
  { label: "Inventory Management", value: "inventory-management" },
  { label: "Data Analysis", value: "data-analysis" },
  { label: "Data Science", value: "data-science" },
  { label: "Machine Learning", value: "machine-learning" },
  { label: "Deep Learning", value: "deep-learning" },
  { label: "R Programming", value: "r-programming" },
  { label: "SPSS", value: "spss" },
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

const SkillsSelector = ({ onChange, value }) => {
  const isDarkMode = useDarkMode();

  const loadOptions = (inputValue, callback) => {
    if (!inputValue) {
      return callback(localSkills);
    }
    const filtered = localSkills.filter((skill) =>
      skill.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    callback(filtered);
  };

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
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? "#4a5568" : "#e2e8f0",
    }),
    multiValueLabel: (provided) => ({
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
        Select Your Skills
      </label>
      <AsyncSelect
        isMulti
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        onChange={onChange}
        value={value}
        placeholder="Type to search for skills..."
        styles={customStyles}
      />
    </div>
  );
};

export default SkillsSelector;
