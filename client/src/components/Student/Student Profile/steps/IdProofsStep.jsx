import React from "react";
import { Controller } from "react-hook-form";
import { motion } from "framer-motion";
import FormField from "../components/FormField";
import TextInput from "../components/TextInput";
import FileUpload from "../../../Global/FileUpload";

const IdProofsStep = ({ control, errors, currentValues }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <FormField
        label="Aadhar Number"
        required
        error={errors.documents?.aadhar?.number}
      >
        <TextInput
          control={control}
          name="documents.aadhar.number"
          defaultValue={currentValues?.aadhar?.number}
          rules={{
            required: "Aadhar number is required",
            pattern: {
              value: /^\d{12}$/,
              message: "Please enter a valid 12-digit Aadhar number",
            },
          }}
          placeholder="Enter Aadhar number"
        />
      </FormField>

      <FormField
        label="Aadhar Card Upload"
        required
        error={errors.documents?.aadhar?.document}
      >
        <Controller
          name="documents.aadhar.document"
          control={control}
          defaultValue={null}
          rules={{
            validate: {
              fileType: (value) => {
                if (value) {
                  const allowedTypes = ["application/pdf"];
                  return (
                    allowedTypes.includes(value.type) ||
                    "Only PDF files are allowed"
                  );
                }
                return true;
              },
            },
          }}
          render={({ field: { onChange, value } }) => (
            <FileUpload
              fieldName="aadhar"
              value={value}
              onChange={onChange}
              initialUrl={currentValues?.aadhar?.document?.fileUrl}
              accept={{
                "application/pdf": [".pdf"],
              }}
              helperText="Upload Aadhar card in PDF format (max 5MB)"
              error={errors.documents?.aadhar?.document}
            />
          )}
        />
      </FormField>

      <FormField
        label="PAN Number"
        required
        error={errors.documents?.pan?.number}
      >
        <TextInput
          control={control}
          name="documents.pan.number"
          defaultValue={currentValues?.pan?.number}
          rules={{
            required: "PAN number is required",
            pattern: {
              value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
              message: "Please enter a valid PAN number",
            },
          }}
          placeholder="Enter PAN number"
        />
      </FormField>

      <FormField
        label="PAN Card Upload"
        required
        error={errors.documents?.pan?.document}
      >
        <Controller
          name="documents.pan.document"
          control={control}
          defaultValue={null}
          rules={{
            validate: {
              fileType: (value) => {
                if (value) {
                  const allowedTypes = ["application/pdf"];
                  return (
                    allowedTypes.includes(value.type) ||
                    "Only PDF files are allowed"
                  );
                }
                return true;
              },
            },
          }}
          render={({ field: { onChange, value } }) => (
            <FileUpload
              fieldName="pan"
              value={value}
              onChange={onChange}
              initialUrl={currentValues?.pan?.document?.fileUrl}
              accept={{
                "application/pdf": [".pdf"],
              }}
              helperText="Upload PAN card in PDF format (max 5MB)"
              error={errors.documents?.pan?.document}
            />
          )}
        />
      </FormField>
    </motion.div>
  );
};

export default IdProofsStep;
