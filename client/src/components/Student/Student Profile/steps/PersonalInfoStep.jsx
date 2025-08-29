import React, { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import { motion } from "framer-motion";
import FormField from "../components/FormField";
import TextInput from "../components/TextInput";
import SelectInput from "../components/SelectInput";
import FileUpload from "../../../Global/FileUpload";
import { useFileUpload } from "../../../../Hooks/useFileUpload";
import genderOptions from "../../../../Constants/gender.json";
import religionOptions from "../../../../Constants/religion.json";
import casteOptions from "../../../../Constants/caste.json";

const PersonalInfoStep = ({
  control,
  errors,
  watch,
  setValue,
  currentValues,
}) => {
  // Extract values from currentValues with fallbacks
  const firstName = currentValues?.firstName || "";
  const lastName = currentValues?.lastName || "";
  const whatsappNumber = currentValues?.whatsappNumber || "";
  const collegeEmail = currentValues?.collegeEmail || "";
  const personalEmail = currentValues?.personalEmail || "";
  const gender = currentValues?.gender || "";
  const caste = currentValues?.caste || "";
  const dateOfBirth = currentValues?.dateOfBirth
    ? new Date(currentValues.dateOfBirth)
    : null;

  // Address handling
  const currentAddress = currentValues?.address?.current || {};
  const permanentAddress = currentValues?.address?.permanent || {};
  const photographUrl = currentValues?.photograph || null;

  const { file: photograph, setFile: setPhotograph } =
    useFileUpload(photographUrl);
  const sameAddress = watch("sameAddress", false);

  useEffect(() => {
    setValue("firstName", firstName);
    setValue("lastName", lastName);
    setValue("whatsappNumber", whatsappNumber);
    setValue("collegeEmail", collegeEmail);
    setValue("personalEmail", personalEmail || "");
    setValue("gender", gender || "");
    setValue("religion", currentValues?.religion || "");
    setValue("caste", caste || "");
    setValue("dateOfBirth", dateOfBirth);

    setValue("currentAddress", {
      street: currentAddress.street || "",
      city: currentAddress.city || "",
      state: currentAddress.state || "",
      pincode: currentAddress.pincode || "",
    });

    setValue("permanentAddress", {
      street: permanentAddress.street || "",
      city: permanentAddress.city || "",
      state: permanentAddress.state || "",
      pincode: permanentAddress.pincode || "",
    });

    // Set same address if addresses are identical
    if (JSON.stringify(currentAddress) === JSON.stringify(permanentAddress)) {
      setValue("sameAddress", true);
    }
  }, [currentValues]);

  // Function to format phone number with country code
  const formatPhoneNumber = (number) => {
    // Remove any non-digit characters
    const cleaned = number.replace(/\D/g, "");

    // Check if number starts with country code
    if (cleaned.startsWith("91")) {
      // Format for Indian number: +91 70136 80808
      return `+91 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(
        7
      )}`;
    }

    // Fallback to original number if not in expected format
    return number;
  };

  useEffect(() => {
    setValue("sameAddress", sameAddress);
    if (sameAddress) {
      setValue("permanentAddress", watch("currentAddress"));
    }
  }, [sameAddress, setValue, watch]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="grid md:grid-cols-12 gap-4">
        <div className="md:col-span-4">
          <FormField label="First Name" required error={errors.firstName}>
            <Controller
              control={control}
              name="firstName"
              rules={{ required: "First name is required" }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  value={field.value || firstName}
                  disabled
                  className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                />
              )}
            />
          </FormField>
        </div>
        <div className="md:col-span-4">
          <FormField label="Last Name" required error={errors.lastName}>
            <Controller
              control={control}
              name="lastName"
              rules={{ required: "Last name is required" }}
              placeholder="Enter last name"
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  value={lastName}
                  disabled
                  className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                />
              )}
            />
          </FormField>
        </div>
        <div className="md:col-span-4">
          <FormField label="WhatsApp Number" error={errors.whatsappNumber}>
            <Controller
              name="whatsappNumber"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  value={formatPhoneNumber(whatsappNumber)}
                  disabled
                  className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                />
              )}
            />
          </FormField>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField label="University Email" error={errors.universityEmail}>
          <Controller
            name="universityEmail"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                value={collegeEmail}
                disabled
                className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            )}
          />
        </FormField>
        <FormField label="Personal Email" required error={errors.personalEmail}>
          <Controller
            name="personalEmail"
            control={control}
            rules={{
              required: "Personal email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                placeholder="Enter Personal Email"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <FormField label="Gender" required error={errors.gender}>
          <SelectInput
            control={control}
            name="gender"
            options={genderOptions}
            rules={{ required: "Gender is required" }}
            placeholder="Select gender"
          />
        </FormField>

        <FormField label="Religion" required error={errors.religion}>
          <SelectInput
            control={control}
            name="religion"
            options={religionOptions}
            rules={{ required: "Religion is required" }}
            placeholder="Select religion"
          />
        </FormField>

        <FormField label="Caste" required error={errors.caste}>
          <SelectInput
            control={control}
            name="caste"
            options={casteOptions}
            rules={{ required: "Caste is required" }}
            placeholder="Select caste"
          />
        </FormField>
      </div>

      <FormField label="Date of Birth" required error={errors.dateOfBirth}>
        <Controller
          name="dateOfBirth"
          control={control}
          rules={{ required: "Date of Birth is required" }}
          render={({ field }) => (
            <DatePicker
              selected={field.value}
              onChange={field.onChange}
              dateFormat="dd/MM/yyyy"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholderText="dd/mm/yyyy"
              maxDate={new Date()}
              showYearDropdown
              scrollableYearDropdown
            />
          )}
        />
      </FormField>

      {/* Current Address */}
      <div className="space-y-4">
        <h3 className="font-medium text-indigo-700">Current Address</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            label="Street"
            required
            error={errors?.currentAddress?.street}
          >
            <TextInput
              control={control}
              name="currentAddress.street"
              rules={{ required: "Street is required" }}
              placeholder="Enter street address"
            />
          </FormField>
          <FormField label="City" required error={errors?.currentAddress?.city}>
            <TextInput
              control={control}
              name="currentAddress.city"
              rules={{ required: "City is required" }}
              placeholder="Enter city"
            />
          </FormField>
          <FormField
            label="State"
            required
            error={errors?.currentAddress?.state}
          >
            <TextInput
              control={control}
              name="currentAddress.state"
              rules={{ required: "State is required" }}
              placeholder="Enter state"
            />
          </FormField>
          <FormField
            label="Pincode"
            required
            error={errors.currentAddress?.pincode}
          >
            <TextInput
              control={control}
              name="currentAddress.pincode"
              rules={{ required: "Pincode is required" }}
              placeholder="Enter pincode"
            />
          </FormField>
        </div>
      </div>

      {/* Permanent Address */}
      <div className="space-y-4">
        <div className="flex items-center">
          <Controller
            name="sameAddress"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <input
                type="checkbox"
                id="sameAddress"
                {...field}
                checked={field.value || false}
                className="mr-2 text-indigo-600 focus:ring-indigo-500"
              />
            )}
          />
          <label htmlFor="sameAddress" className="text-sm text-gray-700">
            Permanent address same as current address
          </label>
        </div>
        {!sameAddress && (
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="Street"
              required
              error={errors?.permanentAddress?.street}
            >
              <TextInput
                control={control}
                name="permanentAddress.street"
                rules={{ required: !sameAddress && "Street is required" }}
                placeholder="Enter street address"
              />
            </FormField>
            <FormField
              label="City"
              required
              error={errors?.permanentAddress?.city}
            >
              <TextInput
                control={control}
                name="permanentAddress.city"
                rules={{ required: !sameAddress && "City is required" }}
                placeholder="Enter city"
              />
            </FormField>
            <FormField
              label="State"
              required
              error={errors?.permanentAddress?.state}
            >
              <TextInput
                control={control}
                name="permanentAddress.state"
                rules={{ required: !sameAddress && "State is required" }}
                placeholder="Enter state"
              />
            </FormField>
            <FormField
              label="Pincode"
              required
              error={errors?.permanentAddress?.pincode}
            >
              <TextInput
                control={control}
                name="permanentAddress.pincode"
                rules={{ required: !sameAddress && "Pincode is required" }}
                placeholder="Enter pincode"
              />
            </FormField>
          </div>
        )}
      </div>

      <FormField label="Profile Photograph" required error={errors.photograph}>
        <Controller
          name="photograph"
          control={control}
          rules={{
            required: "Profile photograph is required",
            validate: {
              fileType: (value) => {
                if (!value && photograph) return true;
                if (photographUrl) return true; // Allow existing URL
                const allowedTypes = ["image/jpeg", "image/jpg"];
                return (
                  (value && allowedTypes.includes(value.type)) ||
                  "Only JPG and JPEG files are allowed"
                );
              },
            },
          }}
          render={({ field: { onChange, value } }) => (
            <FileUpload
              fieldName="photograph"
              value={value}
              onChange={(file) => {
                onChange(file);
                setPhotograph(file);
              }}
              accept={{
                "image/jpeg": [".jpg", ".jpeg"],
              }}
              showPreview
              helperText="Upload a JPG/JPEG photograph"
              error={errors.photograph}
              initialUrl={photographUrl} // Pass the AWS URL
            />
          )}
        />
      </FormField>
    </motion.div>
  );
};

export default PersonalInfoStep;
