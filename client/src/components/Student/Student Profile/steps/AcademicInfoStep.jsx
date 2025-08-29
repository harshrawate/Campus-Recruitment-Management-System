import React, { useMemo, useState, useEffect } from "react";
import { useFieldArray, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import FormField from "../components/FormField";
import SelectInput from "../components/SelectInput";
import DatePicker from "react-datepicker";

const AcademicInfoStep = ({ control, errors, currentValues, watch }) => {
  console.log(currentValues);
  const {
    fields: entranceExamFields,
    append: appendEntranceExam,
    remove: removeEntranceExam,
    replace: replaceEntranceExams,
  } = useFieldArray({
    control,
    name: "academic.entranceExams",
  });

  const selectedDegree = watch("academic.degreeProgram");
  const selectedBranch = watch("academic.branch");

  const getYearPickerProps = (maxYear = new Date().getFullYear()) => ({
    showYearPicker: true,
    dateFormat: "yyyy",
    maxDate: new Date(maxYear, 11, 31),
    minDate: new Date(1950, 0, 1),
    showMonthYearPicker: false,
    showFullMonthYearPicker: false,
    scrollableYearDropdown: true,
    yearDropdownItemNumber: 70,
  });

  useEffect(() => {
    if (currentValues?.entranceExams?.length > 0) {
      replaceEntranceExams(
        currentValues.entranceExams.map((exam) => ({
          examName: exam.examName,
          rank: exam.rank,
        }))
      );
    }
  }, [currentValues?.entranceExams, replaceEntranceExams]);

  // Process university degree options
  const degreeOptions = useMemo(() => {
    if (!currentValues?.university?.degreePrograms) return [];

    return currentValues.university.degreePrograms.map((program) => ({
      value: program.programName,
      label: program.programName,
    }));
  }, [currentValues]);

  // Dynamic branch options based on selected degree
  const branchOptions = useMemo(() => {
    if (!selectedDegree) return [];

    const selectedProgram = currentValues.university.degreePrograms.find(
      (program) =>
        program.programName === (selectedDegree?.value || selectedDegree)
    );

    return (selectedProgram?.branches || []).map((branch) => ({
      value: branch.name,
      label: branch.name,
    }));
  }, [selectedDegree, currentValues.university.degreePrograms]);

  const sectionOptions = useMemo(() => {
    if (!selectedDegree || !selectedBranch) return [];

    const selectedProgram = currentValues.university.degreePrograms.find(
      (program) =>
        program.programName === (selectedDegree?.value || selectedDegree)
    );

    const selectedBranchData = selectedProgram?.branches.find(
      (branch) => branch.name === (selectedBranch?.value || selectedBranch)
    );

    return (selectedBranchData?.sections || []).map((section) => ({
      value: section,
      label: section,
    }));
  }, [selectedDegree, selectedBranch, currentValues.university.degreePrograms]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <FormField label="College Name" className="bg-gray-50">
        <Controller
          control={control}
          name="academic.collegeName"
          defaultValue={currentValues?.university?.name || ""}
          render={({ field }) => (
            <input
              {...field}
              disabled
              placeholder="College name"
              className="w-full p-2 bg-gray-100 text-gray-600 border border-gray-200 rounded-md"
            />
          )}
        />
      </FormField>

      <FormField
        label="Roll Number"
        required
        error={errors?.academic?.rollNumber}
      >
        <Controller
          control={control}
          name="academic.rollNumber"
          defaultValue={currentValues?.rollNumber || ""}
          rules={{
            required: "Roll number is required",
            setValueAs: (v) => v.toLowerCase(),
          }}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Enter roll number"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              style={{ textTransform: "uppercase" }}
            />
          )}
        />
      </FormField>

      <FormField
        label="Degree Program"
        required
        error={errors?.academic?.degreeProgram}
      >
        <SelectInput
          control={control}
          name="academic.degreeProgram"
          defaultValue={currentValues?.degreeProgram}
          options={degreeOptions}
          rules={{ required: "Degree program is required" }}
          placeholder="Select degree program"
        />
      </FormField>

      {selectedDegree && (
        <FormField label="Branch" required error={errors?.academic?.branch}>
          <SelectInput
            control={control}
            name="academic.branch"
            defaultValue={currentValues?.branch}
            options={branchOptions}
            rules={{ required: "Branch is required" }}
            placeholder="Select branch"
          />
        </FormField>
      )}

      {selectedBranch && (
        <FormField label="Section" required error={errors?.academic?.section}>
          <SelectInput
            control={control}
            name="academic.section"
            defaultValue={currentValues?.section}
            options={sectionOptions}
            rules={{ required: "Section is required" }}
            placeholder="Select section"
          />
        </FormField>
      )}

      <FormField label="CGPA" required error={errors?.academic?.cgpa}>
        <Controller
          control={control}
          name="academic.cgpa"
          defaultValue={currentValues?.cgpa || ""}
          rules={{
            required: "CGPA is required",
            min: { value: 0, message: "CGPA cannot be negative" },
            max: { value: 10, message: "CGPA cannot exceed 10" },
          }}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              step="0.01"
              placeholder="Enter CGPA"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          )}
        />
      </FormField>

      <FormField
        label="Number of Backlogs"
        required
        error={errors?.academic?.backlogs}
      >
        <Controller
          control={control}
          name="academic.backlogs"
          defaultValue={currentValues?.backlogs ?? ""} // Use nullish coalescing
          rules={{
            required: "Number of backlogs is required",
            min: { value: 0, message: "Backlogs cannot be negative" },
          }}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              placeholder="Enter number of backlogs"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          )}
        />
      </FormField>

      <FormField
        label="Expected Graduation Year"
        required
        error={errors?.academic?.graduationYear}
      >
        <Controller
          control={control}
          name="academic.graduationYear"
          defaultValue={currentValues?.graduationYear || null}
          rules={{ required: "Graduation year is required" }}
          render={({ field: { onChange, value } }) => (
            <DatePicker
              selected={value ? new Date(value, 0) : null}
              onChange={(date) => onChange(date?.getFullYear())}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholderText="Select graduation year"
              {...getYearPickerProps(new Date().getFullYear() + 4)}
            />
          )}
        />
      </FormField>

      {/* 10th Details */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-medium">10th Standard Details</h3>
        <FormField
          label="Percentage"
          required
          error={errors?.academic?.tenth?.percentage}
        >
          <Controller
            control={control}
            name="academic.tenth.percentage"
            defaultValue={currentValues?.tenth?.percentage || ""}
            rules={{
              required: "10th percentage is required",
              min: { value: 0, message: "Percentage cannot be negative" },
              max: { value: 100, message: "Percentage cannot exceed 100" },
            }}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter 10th percentage"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            )}
          />
        </FormField>
        <FormField
          label="Board Name"
          required
          error={errors?.academic?.tenth?.boardName}
        >
          <Controller
            control={control}
            name="academic.tenth.boardName"
            defaultValue={currentValues?.tenth?.boardName || ""}
            rules={{ required: "Board name is required" }}
            render={({ field }) => (
              <input
                {...field}
                placeholder="Enter board name"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            )}
          />
        </FormField>
        <FormField
          label="Passing Year"
          required
          error={errors?.academic?.tenth?.passingYear}
        >
          <Controller
            control={control}
            name="academic.tenth.passingYear"
            defaultValue={currentValues?.tenth?.passingYear || null}
            rules={{ required: "Passing year is required" }}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                selected={value ? new Date(value, 0) : null}
                onChange={(date) => onChange(date?.getFullYear())}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                placeholderText="Select passing year"
                {...getYearPickerProps()}
              />
            )}
          />
        </FormField>
      </div>

      {/* 12th Details */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-medium">12th Standard Details</h3>
        <FormField
          label="Percentage"
          required
          error={errors?.academic?.twelfth?.percentage}
        >
          <Controller
            control={control}
            name="academic.twelfth.percentage"
            defaultValue={currentValues?.twelfth?.percentage || ""}
            rules={{
              required: "12th percentage is required",
              min: { value: 0, message: "Percentage cannot be negative" },
              max: { value: 100, message: "Percentage cannot exceed 100" },
            }}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter 12th percentage"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            )}
          />
        </FormField>
        <FormField
          label="Board Name"
          required
          error={errors?.academic?.twelfth?.boardName}
        >
          <Controller
            control={control}
            name="academic.twelfth.boardName"
            defaultValue={currentValues?.twelfth?.boardName || ""}
            rules={{ required: "Board name is required" }}
            render={({ field }) => (
              <input
                {...field}
                placeholder="Enter board name"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            )}
          />
        </FormField>
        <FormField
          label="Passing Year"
          required
          error={errors?.academic?.twelfth?.passingYear}
        >
          <Controller
            control={control}
            name="academic.twelfth.passingYear"
            defaultValue={currentValues?.twelfth?.passingYear || null}
            rules={{ required: "Passing year is required" }}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                selected={value ? new Date(value, 0) : null}
                onChange={(date) => onChange(date?.getFullYear())}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                placeholderText="Select passing year"
                {...getYearPickerProps()}
              />
            )}
          />
        </FormField>
      </div>

      {/* Entrance Exam Details */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-indigo-700">Entrance Exam Details</h3>
          <button
            type="button"
            onClick={() => appendEntranceExam({ examName: "", rank: "" })}
            className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 flex items-center"
          >
            + Add Exam
          </button>
        </div>
        {entranceExamFields.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No entrance exams added
          </p>
        ) : (
          entranceExamFields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-4 p-4 border rounded-md relative"
            >
              <button
                type="button"
                onClick={() => removeEntranceExam(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-600 bg-white rounded-full p-1"
                title="Delete exam"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  label="Exam Name"
                  required
                  error={errors?.academic?.entranceExams?.[index]?.examName}
                >
                  <Controller
                    control={control}
                    name={`academic.entranceExams.${index}.examName`}
                    defaultValue={field.examName || ""}
                    rules={{ required: "Exam name is required" }}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Enter exam name"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                  />
                </FormField>
                <FormField
                  label="Rank"
                  required
                  error={errors?.academic?.entranceExams?.[index]?.rank}
                >
                  <Controller
                    control={control}
                    name={`academic.entranceExams.${index}.rank`}
                    defaultValue={field.rank || ""}
                    rules={{ required: "Rank is required" }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        placeholder="Enter rank"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                  />
                </FormField>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default AcademicInfoStep;
