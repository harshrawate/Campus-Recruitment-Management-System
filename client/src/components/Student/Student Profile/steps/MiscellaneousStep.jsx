import React from "react";
import { Controller } from "react-hook-form";
import { motion } from "framer-motion";
import FormField from "../components/FormField";
import TextInput from "../components/TextInput";
import FileUpload from "../../../Global/FileUpload";

const MiscellaneousStep = ({ control, errors, currentValues, watch }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <FormField
        label="LinkedIn Profile"
        required
        error={errors?.social?.linkedin}
      >
        <Controller
          name="social.linkedin"
          control={control}
          defaultValue={currentValues?.linkedin || ""}
          rules={{
            required: "LinkedIn profile URL is required",
            pattern: {
              value: /^https:\/\/[a-z]{2,3}\.linkedin\.com\/.*$/,
              message: "Please enter a valid LinkedIn URL",
            },
          }}
          render={({ field }) => (
            <TextInput
              control={control}
              name="social.linkedin"
              placeholder="Enter LinkedIn profile URL"
            />
          )}
        />
      </FormField>

      <FormField label="GitHub Profile" required error={errors?.social?.github}>
        <Controller
          name="social.github"
          control={control}
          defaultValue={currentValues?.github || ""}
          rules={{
            required: "GitHub profile URL is required",
            pattern: {
              value: /^https:\/\/github\.com\/.*$/,
              message: "Please enter a valid GitHub URL",
            },
          }}
          render={({ field }) => (
            <TextInput
              control={control}
              name="social.github"
              placeholder="Enter GitHub profile URL"
            />
          )}
        />
      </FormField>

      <FormField label="Resume Upload" required error={errors?.social?.resume}>
        <Controller
          name="social.resume"
          control={control}
          rules={{
            required: "Resume upload is required",
            validate: {
              fileType: (value) => {
                const allowedTypes = [
                  "application/pdf",
                  "application/msword",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ];
                return (
                  !value ||
                  (value && allowedTypes.includes(value.type)) ||
                  "Only PDF, DOC, and DOCX files are allowed"
                );
              },
            },
          }}
          render={({ field: { onChange, value } }) => (
            <FileUpload
              fieldName="resume"
              value={value}
              onChange={onChange}
              initialUrl={currentValues?.resume}
              accept={{
                "application/pdf": [".pdf"],
                "application/msword": [".doc"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  [".docx"],
              }}
              helperText="Upload resume in PDF, DOC, or DOCX format"
              error={errors?.social?.resume}
              showPreview={true}
            />
          )}
        />
      </FormField>

      {/* Extracurricular activities can remain optional */}
      <FormField
        label="Extracurricular Activities"
        error={errors?.social?.extracurricular}
      >
        <Controller
          name="social.extracurricular"
          control={control}
          defaultValue={
            currentValues?.extracurricular
              ? currentValues.extracurricular.join(", ")
              : ""
          }
          render={({ field }) => (
            <textarea
              {...field}
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="Enter your extracurricular activities (New Line-separated)"
            />
          )}
        />
      </FormField>
    </motion.div>
  );
};

export default MiscellaneousStep;
