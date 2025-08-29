import Select from "react-select";

const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder,
  isDisabled = false,
}) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#6366F1" : "#E5E7EB",
      boxShadow: state.isFocused ? "0 0 0 2px #C7D2FE" : "none",
      "&:hover": {
        borderColor: "#6366F1",
      },
      borderRadius: "0.5rem",
      padding: "2px",
      minHeight: "42px", // Ensure consistent height
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#6366F1"
        : state.isFocused
        ? "#EEF2FF"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#4F46E5",
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.5rem",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      zIndex: 10,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#374151",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9CA3AF",
    }),
  };

  return (
    <Select
      styles={customStyles}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      className="w-full"
    />
  );
};

export default CustomSelect;


<label htmlFor="isPlaced" className="text-sm font-medium"></label>