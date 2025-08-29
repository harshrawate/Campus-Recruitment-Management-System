// SelectInput.js
import React from "react";
import { Controller } from "react-hook-form";
import Select from "react-select";

const SelectInput = ({
  control,
  name,
  options,
  rules,
  placeholder,
  defaultValue,
  isMulti = false,
  isDisabled = false,
}) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    defaultValue={defaultValue}
    render={({ field }) => {
      // Convert defaultValue to the format Select expects
      const selectValue = isMulti
        ? options.filter((option) => defaultValue?.includes(option.value))
        : options.find((option) => option.value === defaultValue) || null;

      return (
        <Select
          {...field}
          options={options}
          placeholder={placeholder}
          isMulti={isMulti}
          isDisabled={isDisabled}
          isSearchable={true}
          className="w-full"
          classNamePrefix="select"
          onChange={(selectedOption) => {
            const value = isMulti
              ? selectedOption?.map((opt) => opt.value)
              : selectedOption?.value;
            field.onChange(value);
          }}
          onBlur={field.onBlur}
          value={
            isMulti
              ? options.filter((option) => field.value?.includes(option.value))
              : options.find((option) => option.value === field.value) || null
          }
          styles={{
            control: (base, state) => ({
              ...base,
              backgroundColor: "white",
              borderColor: state.isFocused ? "#6366f1" : "#e5e7eb",
              boxShadow: state.isFocused ? "0 0 0 1px #6366f1" : base.boxShadow,
              "&:hover": {
                borderColor: state.isFocused ? "#6366f1" : "#d1d5db",
              },
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: "white",
              zIndex: 50,
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected ? "#6366f1" : "white",
              color: state.isSelected ? "white" : "#111827",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: state.isSelected ? "#6366f1" : "#f3f4f6",
              },
            }),
            singleValue: (base) => ({
              ...base,
              color: "#111827",
            }),
            placeholder: (base) => ({
              ...base,
              color: "#6b7280",
            }),
            input: (base) => ({
              ...base,
              color: "#111827",
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: "#f3f4f6",
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: "#111827",
            }),
            multiValueRemove: (base) => ({
              ...base,
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "#e5e7eb",
                color: "#111827",
              },
            }),
          }}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#6366f1",
              primary25: "#f3f4f6",
              neutral0: "white",
              neutral80: "#111827",
            },
            borderRadius: 6,
            spacing: {
              ...theme.spacing,
              controlHeight: 38,
              menuGutter: 4,
            },
          })}
        />
      );
    }}
  />
);

export default SelectInput;
