import React from "react";
import FormField from "../components/FormField";
import TextInput from "../components/TextInput";

const FamilyInfoStep = ({ control, errors, currentValues = {} }) => {
  return (
    <div className="space-y-6">
      <FormField
        label="Father's Name"
        required
        error={errors?.family?.father?.name}
      >
        <TextInput
          control={control}
          name="family.father.name"
          defaultValue={currentValues?.father?.name || ""}
          rules={{ required: "Father's name is required" }}
          placeholder="Enter father's name"
        />
      </FormField>

      <FormField
        label="Father's Occupation"
        required
        error={errors?.family?.father?.occupation}
      >
        <TextInput
          control={control}
          name="family.father.occupation"
          defaultValue={currentValues?.father?.occupation || ""}
          rules={{ required: "Father's occupation is required" }}
          placeholder="Enter father's occupation"
        />
      </FormField>

      <FormField
        label="Father's Contact"
        required
        error={errors?.family?.father?.contact}
      >
        <TextInput
          control={control}
          name="family.father.contact"
          defaultValue={currentValues?.father?.contact || ""}
          rules={{
            required: "Father's contact is required",
            pattern: {
              value: /^\d{10}$/,
              message: "Please enter a valid 10-digit number",
            },
          }}
          placeholder="Enter father's contact number"
        />
      </FormField>

      <FormField
        label="Mother's Name"
        required
        error={errors?.family?.mother?.name}
      >
        <TextInput
          control={control}
          name="family.mother.name"
          defaultValue={currentValues?.mother?.name || ""}
          rules={{ required: "Mother's name is required" }}
          placeholder="Enter mother's name"
        />
      </FormField>

      <FormField
        label="Mother's Occupation"
        required
        error={errors?.family?.mother?.occupation}
      >
        <TextInput
          control={control}
          name="family.mother.occupation"
          defaultValue={currentValues?.mother?.occupation || ""}
          rules={{ required: "Mother's occupation is required" }}
          placeholder="Enter mother's occupation"
        />
      </FormField>

      <FormField
        label="Mother's Contact"
        required
        error={errors?.family?.mother?.contact}
      >
        <TextInput
          control={control}
          name="family.mother.contact"
          defaultValue={currentValues?.mother?.contact || ""}
          rules={{
            required: "Mother's contact is required",
            pattern: {
              value: /^\d{10}$/,
              message: "Please enter a valid 10-digit number",
            },
          }}
          placeholder="Enter mother's contact number"
        />
      </FormField>

      <FormField
        label="Annual Family Income"
        required
        error={errors?.family?.annualIncome}
      >
        <TextInput
          control={control}
          name="family.annualIncome"
          defaultValue={currentValues?.annualIncome || ""}
          rules={{
            required: "Annual family income is required",
            pattern: {
              value: /^\d+$/,
              message: "Please enter a valid number",
            },
          }}
          placeholder="Enter annual family income"
        />
      </FormField>
    </div>
  );
};

export default FamilyInfoStep;
