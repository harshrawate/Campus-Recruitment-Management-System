import React, { useEffect, useState } from "react";
import {
  useFieldArray,
  Controller,
  useFormContext,
  FormProvider,
} from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import FormField from "../components/FormField";
import TextInput from "../components/TextInput";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import enGB from "date-fns/locale/en-GB";
import {
  Plus,
  Trash,
  X,
  Edit,
  Save,
  ExternalLink,
  Building,
  Calendar,
} from "lucide-react";
import { registerLocale } from "react-datepicker";

registerLocale("en-GB", enGB);

const WorkExperienceForm = ({ index, onSave, onCancel }) => {
  const methods = useFormContext();
  const {
    control,
    formState: { errors },
    watch,
  } = methods;

  const currentlyWorkingWatch = watch(
    `workExperience.${index}.currentlyWorking`
  );
  const startDate = watch(`workExperience.${index}.startDate`);

  return (
    <div className="space-y-4 p-4 border rounded-md bg-white">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Company */}
        <FormField
          label="Company"
          required
          error={errors?.workExperience?.[index]?.company}
        >
          <TextInput
            control={control}
            name={`workExperience.${index}.company`}
            rules={{ required: "Company name is required" }}
            placeholder="Enter company name"
          />
        </FormField>

        {/* Role */}
        <FormField
          label="Role"
          required
          error={errors?.workExperience?.[index]?.role}
        >
          <TextInput
            control={control}
            name={`workExperience.${index}.role`}
            rules={{ required: "Role is required" }}
            placeholder="Enter role"
          />
        </FormField>

        {/* Start Date */}
        <FormField
          label="Start Date"
          required
          error={errors?.workExperience?.[index]?.startDate}
        >
          <Controller
            name={`workExperience.${index}.startDate`}
            control={control}
            rules={{ required: "Start date is required" }}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                dateFormat="dd/MM/yyyy"
                locale="en-GB"
                className="w-full p-2 border rounded-md"
                placeholderText="dd/mm/yyyy"
                showYearDropdown
                scrollableYearDropdown
                maxDate={new Date()}
              />
            )}
          />
        </FormField>

        {!currentlyWorkingWatch && (
          <FormField
            label="End Date"
            required
            error={errors?.workExperience?.[index]?.endDate}
          >
            <Controller
              name={`workExperience.${index}.endDate`}
              control={control}
              rules={{
                required: !currentlyWorkingWatch && "End date is required",
                validate: (value) => {
                  return (
                    !startDate ||
                    !value ||
                    value >= startDate ||
                    "End date must be after start date"
                  );
                },
              }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={field.onChange}
                  dateFormat="dd/MM/yyyy"
                  locale="en-GB"
                  className="w-full p-2 border rounded-md"
                  placeholderText="dd/mm/yyyy"
                  showYearDropdown
                  scrollableYearDropdown
                  minDate={startDate}
                  maxDate={new Date()}
                />
              )}
            />
          </FormField>
        )}
      </div>

      {/* Currently Working Checkbox */}
      <FormField className="flex items-center">
        <Controller
          name={`workExperience.${index}.currentlyWorking`}
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <>
              <input
                type="checkbox"
                id={`currentlyWorking-${index}`}
                {...field}
                checked={field.value || false}
                className="text-indigo-600 focus:ring-indigo-500 mr-2"
              />
              <label
                htmlFor={`currentlyWorking-${index}`}
                className="text-sm text-gray-700"
              >
                Currently Working
              </label>
            </>
          )}
        />
      </FormField>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Experience
        </button>
      </div>
    </div>
  );
};

const WorkExperienceCard = ({ experience, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="p-4 border rounded-md bg-white shadow-sm hover:shadow-md transition-shadow max-w-2xl"
  >
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-indigo-600" />
          <h4 className="font-medium text-lg text-gray-900">
            {experience.company}
          </h4>
        </div>
        <p className="text-gray-700 font-medium">{experience.role}</p>
        <div className="flex items-center gap-1 text-gray-600 text-sm">
          <Calendar className="w-4 h-4" />
          <span>
            {experience.startDate?.toLocaleDateString("en-GB")} -
            {experience.currentlyWorking
              ? " Present"
              : experience.endDate?.toLocaleDateString("en-GB")}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100"
          title="Edit"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
          title="Delete"
        >
          <Trash className="w-5 h-5" />
        </button>
      </div>
    </div>
  </motion.div>
);

const CertificationForm = ({ control, errors, index, onSave, onCancel }) => (
  <div className="space-y-4 p-4 border rounded-md bg-white max-w-2xl">
    <div className="grid md:grid-cols-2 gap-4">
      {/* Certificate Name */}
      <FormField
        label="Certificate Name"
        required
        error={errors?.certifications?.[index]?.name}
      >
        <TextInput
          control={control}
          name={`certifications.${index}.name`}
          rules={{ required: "Certificate name is required" }}
          placeholder="Enter certificate name"
        />
      </FormField>

      {/* Issuing Authority */}
      <FormField
        label="Issuing Authority"
        required
        error={errors?.certifications?.[index]?.authority}
      >
        <TextInput
          control={control}
          name={`certifications.${index}.authority`}
          rules={{ required: "Issuing authority is required" }}
          placeholder="Enter issuing authority"
        />
      </FormField>

      {/* Certificate Link */}
      <FormField
        label="Certificate Link"
        error={errors?.certifications?.[index]?.link}
        className="md:col-span-2"
      >
        <TextInput
          control={control}
          name={`certifications.${index}.link`}
          rules={{
            pattern: {
              value:
                /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
              message: "Please enter a valid URL",
            },
          }}
          placeholder="Enter certificate link"
        />
      </FormField>
    </div>

    {/* Action Buttons */}
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Certificate
      </button>
    </div>
  </div>
);

const CertificationCard = ({ certification, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="p-4 border rounded-md bg-white shadow-sm hover:shadow-md transition-shadow max-w-2xl"
  >
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <h4 className="font-medium text-lg text-gray-900">
          {certification.name}
        </h4>
        <p className="text-gray-600">{certification.authority}</p>
        {certification.link && (
          <a
            href={certification.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
          >
            View Certificate
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100"
          title="Edit"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
          title="Delete"
        >
          <Trash className="w-5 h-5" />
        </button>
      </div>
    </div>
  </motion.div>
);

const ProfessionalInfoStep = ({ currentValues = {} }) => {
  const [skillInput, setSkillInput] = useState("");
  const [editingWorkIndex, setEditingWorkIndex] = useState(null);
  const [editingCertIndex, setEditingCertIndex] = useState(null);
  const [isAddingWork, setIsAddingWork] = useState(false);
  const [isAddingCert, setIsAddingCert] = useState(false);

  const methods = useFormContext();
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = methods;

  const {
    fields: workFields,
    append: appendWork,
    remove: removeWork,
  } = useFieldArray({
    control,
    name: "workExperience",
  });

  const {
    fields: certFields,
    append: appendCert,
    remove: removeCert,
  } = useFieldArray({
    control,
    name: "certifications",
  });

  // Initialize form with existing professional data
  useEffect(() => {
    // Pre-fill work experience
    if (currentValues.experience && currentValues.experience.length > 0) {
      const formattedWorkExperience = currentValues.experience.map((exp) => {
        const [startDateStr, endDateStr] = exp.duration.split(" - ");
        return {
          company: exp.company || "",
          role: exp.role || "",
          startDate: startDateStr ? new Date(startDateStr) : null,
          endDate:
            endDateStr === "Present"
              ? null
              : endDateStr
              ? new Date(endDateStr)
              : null,
          currentlyWorking: endDateStr === "Present",
        };
      });

      // Clear existing work fields and add saved experiences
      removeWork();
      formattedWorkExperience.forEach((exp) => appendWork(exp));
    }

    // Pre-fill skills
    if (currentValues.skills && currentValues.skills.length > 0) {
      setValue("skills", currentValues.skills);
    }

    // Pre-fill certifications
    if (
      currentValues.certifications &&
      currentValues.certifications.length > 0
    ) {
      const formattedCertifications = currentValues.certifications.map(
        (cert) => ({
          name: cert.name || "",
          authority: cert.authority || "",
          link: cert.link || "",
        })
      );

      // Clear existing certification fields and add saved certifications
      removeCert();
      formattedCertifications.forEach((cert) => appendCert(cert));
    }
  }, [currentValues, appendWork, appendCert, removeWork, removeCert, setValue]);

  const workExperience = watch("workExperience");
  const skills = watch("skills") || [];
  const certifications = watch("certifications") || [];

  useEffect(() => {
    workExperience?.forEach((experience, index) => {
      if (experience.currentlyWorking) {
        setValue(`workExperience.${index}.endDate`, null);
      }
    });
  }, [workExperience, setValue]);

  const handleAddWorkClick = () => {
    appendWork({
      company: "",
      role: "",
      startDate: null,
      endDate: null,
      currentlyWorking: false,
    });
    setIsAddingWork(true);
    setEditingWorkIndex(workFields.length); // Set editing index to the new field
  };

  const handleSaveWork = (index) => {
    const work = workExperience[index];
    if (work.company && work.role && work.startDate) {
      setIsAddingWork(false);
      setEditingWorkIndex(null);
    }
  };

  const handleCancelWork = (index) => {
    if (isAddingWork) {
      removeWork(index);
    }
    setIsAddingWork(false);
    setEditingWorkIndex(null);
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const newSkills = [...skills];
      if (!newSkills.includes(skillInput.trim())) {
        newSkills.push(skillInput.trim());
        setValue("skills", newSkills);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setValue(
      "skills",
      skills.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleAddCertClick = () => {
    appendCert({ name: "", authority: "", link: "" });
    setIsAddingCert(true);
  };

  const handleSaveCert = (index) => {
    const cert = certifications[index];
    if (cert.name && cert.authority) {
      setIsAddingCert(false);
      setEditingCertIndex(null);
    }
  };

  const handleCancelCert = (index) => {
    if (isAddingCert) {
      removeCert(index);
    }
    setIsAddingCert(false);
    setEditingCertIndex(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-indigo-700">Work Experience</h3>
          {!isAddingWork && (
            <button
              type="button"
              onClick={handleAddWorkClick}
              className="text-indigo-500 hover:text-indigo-600 flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" />
              Add Experience
            </button>
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {[...workFields]
              .sort((a, b) => {
                const aStartDate =
                  workExperience[workFields.indexOf(a)].startDate;
                const bStartDate =
                  workExperience[workFields.indexOf(b)].startDate;
                return bStartDate - aStartDate; // Newest first
              })
              .map((field, sortedIndex) => {
                const originalIndex = workFields.indexOf(field);
                const isEditing =
                  editingWorkIndex === originalIndex ||
                  (isAddingWork && originalIndex === workFields.length - 1);

                if (isEditing) {
                  return (
                    <WorkExperienceForm
                      key={field.id}
                      index={originalIndex}
                      onSave={() => handleSaveWork(originalIndex)}
                      onCancel={() => handleCancelWork(originalIndex)}
                    />
                  );
                }

                return (
                  <WorkExperienceCard
                    key={field.id}
                    experience={workExperience[originalIndex]}
                    onEdit={() => setEditingWorkIndex(originalIndex)}
                    onDelete={() => removeWork(originalIndex)}
                  />
                );
              })}
          </AnimatePresence>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="font-medium text-indigo-700">Skills</h3>
        <div className="space-y-2">
          <FormField label="Add Skills" error={errors?.skills}>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillInputKeyDown}
              className="w-full p-2 border rounded-md"
              placeholder="Type a skill and press Enter"
            />
          </FormField>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-indigo-500 hover:text-indigo-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-indigo-700">Certifications</h3>
          {!isAddingCert && (
            <button
              type="button"
              onClick={handleAddCertClick}
              className="text-indigo-500 hover:text-indigo-600 flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" />
              Add Certification
            </button>
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {certFields.map((field, index) => {
              const isEditing =
                editingCertIndex === index ||
                (isAddingCert && index === certFields.length - 1);

              if (isEditing) {
                return (
                  <CertificationForm
                    key={field.id}
                    control={control}
                    errors={errors}
                    index={index}
                    onSave={() => handleSaveCert(index)}
                    onCancel={() => handleCancelCert(index)}
                  />
                );
              }

              return (
                <CertificationCard
                  key={field.id}
                  certification={certifications[index]}
                  onEdit={() => setEditingCertIndex(index)}
                  onDelete={() => removeCert(index)}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfessionalInfoStep;
