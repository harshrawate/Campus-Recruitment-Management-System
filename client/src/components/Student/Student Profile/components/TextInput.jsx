import React from "react";
import { Controller } from "react-hook-form";

const TextInput = ({
  control,
  name,
  rules,
  placeholder,
  type = "text",
  defaultValue,
}) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    defaultValue={defaultValue}
    render={({ field, fieldState: { error } }) => (
      <input
        {...field}
        type={type}
        placeholder={placeholder}
        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
        ${error ? "border-red-500" : "border-gray-300"}`}
      />
    )}
  />
);

export default TextInput;
