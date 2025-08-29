import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { getUserRole } from "../../../utils/auth";

const DegreePrograms = ({ universityId, programs, onUpdatePrograms }) => {
  const [isAddingProgram, setIsAddingProgram] = useState(false);
  const [isEditingProgram, setIsEditingProgram] = useState(null);
  const [expandedProgram, setExpandedProgram] = useState(null);
  const [expandedBranch, setExpandedBranch] = useState(null);
  const jwtToken = Cookies.get("userCookie");
  const userRole = getUserRole();
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState,
  } = useForm({
    defaultValues: {
      name: "",
      branches: [],
    },
  });

  const { errors } = formState;

  const {
    fields: branchFields,
    append: appendBranch,
    remove: removeBranch,
  } = useFieldArray({
    control,
    name: "branches",
  });

  const branchesArray = useFieldArray({
    control,
    name: "branches",
  });

  useEffect(() => {
    if (isAddingProgram) {
      reset({
        name: "",
        branches: [],
      });
    }
  }, [isAddingProgram, reset]);

  const createProgramMutation = useMutation({
    mutationFn: async (programData) => {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_API_URL}/university/${universityId}/programs`,
        programData,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return response.data;
    },
    onSuccess: (newProgram) => {
      onUpdatePrograms((prev) => [
        ...prev,
        {
          _id: newProgram.id,
          programName: newProgram.name,
          branches: newProgram.branches || [],
        },
      ]);
      queryClient.invalidateQueries(["university", universityId]);
      setIsAddingProgram(false);
      reset(); // Changed from programForm.reset()
      toast.success("Program added successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add program");
    },
  });

  const updateProgramMutation = useMutation({
    mutationFn: async ({ programId, programData }) => {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_API_URL}/university/${universityId}/programs/${programId}`,
        programData,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return response.data;
    },
    onSuccess: (updatedProgram) => {
      onUpdatePrograms((prev) =>
        prev.map((p) =>
          p._id === updatedProgram._id
            ? {
                ...p,
                programName: updatedProgram.name,
                branches: updatedProgram.branches || [],
              }
            : p
        )
      );
      queryClient.invalidateQueries(["university", universityId]);
      setIsEditingProgram(null);
      reset(); // Changed from programForm.reset()
      toast.success("Program updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update program");
    },
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (programId) => {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_API_URL}/university/${universityId}/programs/${programId}`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return programId;
    },
    onSuccess: (programId) => {
      onUpdatePrograms((prev) => prev.filter((p) => p._id !== programId));
      queryClient.invalidateQueries(["university", universityId]);
      toast.success("Program deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete program");
    },
  });

  const handleCreateProgram = (data) => {
    const formattedBranches = data.branches
      .map((branch) => ({
        name: branch.value,
        sections: branch.sections?.map((section) => section.value) || [],
      }))
      .filter((branch) => branch.name);

    createProgramMutation.mutate({
      name: data.name,
      branches: formattedBranches,
    });
  };

  const handleUpdateProgram = (data) => {
    const formattedBranches = data.branches
      .map((branch) => ({
        name: branch.value,
        sections: branch.sections?.map((section) => section.value) || [],
      }))
      .filter((branch) => branch.name);

    updateProgramMutation.mutate({
      programId: isEditingProgram._id,
      programData: {
        name: data.name,
        branches: formattedBranches,
      },
    });
  };

  const startEditProgram = (program) => {
    setIsEditingProgram(program);
    const formattedBranches = program.branches.map((branch) => ({
      value: branch.name,
      sections: branch.sections?.map((section) => ({ value: section })) || [],
    }));

    reset({
      // Changed from programForm.reset()
      name: program.programName,
      branches: formattedBranches,
    });
  };

  const closeModal = () => {
    setIsAddingProgram(false);
    setIsEditingProgram(null);
    reset(); // Changed from programForm.reset()
  };

  const addSectionToBranch = (branchIndex) => {
    const currentBranch = getValues(`branches.${branchIndex}`);
    const sections = currentBranch.sections || [];

    // Create a new sections array with the new section
    const updatedSections = [...sections, { value: "" }];

    // Use setValue with the shouldDirty option to trigger re-render
    setValue(`branches.${branchIndex}.sections`, updatedSections, {
      shouldDirty: true,
      shouldTouch: true,
    });

    // Force re-render of the specific branch
    branchesArray.update(branchIndex, {
      ...currentBranch,
      sections: updatedSections,
    });
  };

  const removeSectionFromBranch = (branchIndex, sectionIndex) => {
    const currentBranch = getValues(`branches.${branchIndex}`);
    const sections = [...(currentBranch.sections || [])];
    sections.splice(sectionIndex, 1);

    // Use setValue with the shouldDirty option to trigger re-render
    setValue(`branches.${branchIndex}.sections`, sections, {
      shouldDirty: true,
      shouldTouch: true,
    });

    // Force re-render of the specific branch
    branchesArray.update(branchIndex, {
      ...currentBranch,
      sections: sections,
    });
  };

  const renderBranchSections = (branchIndex) => {
    const branch = getValues(`branches.${branchIndex}`);
    const sections = branch.sections || [];

    return (
      <div className="ml-4 mt-2 space-y-2">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="flex items-center gap-2">
            <input
              {...register(
                `branches.${branchIndex}.sections.${sectionIndex}.value`
              )}
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
              placeholder="Enter section name"
            />
            <button
              type="button"
              onClick={() => removeSectionFromBranch(branchIndex, sectionIndex)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addSectionToBranch(branchIndex)}
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm"
        >
          <Plus className="h-3 w-3" /> Add Section
        </button>
      </div>
    );
  };

  const renderProgramForm = (isEditing = false) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isEditing ? "Edit Program" : "Add New Program"}
          </h3>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(
            isEditing ? handleUpdateProgram : handleCreateProgram
          )}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Name
            </label>
            <input
              {...register("name", {
                required: "Program name is required",
              })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter program name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Branches and Sections
            </label>
            <div className="space-y-4">
              {branchFields.map((field, branchIndex) => (
                <div
                  key={field.id}
                  className="space-y-2 border-l-2 border-indigo-200 pl-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      {...register(`branches.${branchIndex}.value`)}
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                      placeholder="Enter branch name"
                    />
                    <button
                      type="button"
                      onClick={() => removeBranch(branchIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  {renderBranchSections(branchIndex)}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => appendBranch({ value: "", sections: [] })}
              className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="h-4 w-4" /> Add Branch
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isEditing
                  ? updateProgramMutation.isPending
                  : createProgramMutation.isPending
              }
              className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${
                isEditing
                  ? updateProgramMutation.isPending
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                  : createProgramMutation.isPending
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isEditing ? (
                updateProgramMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Program"
                )
              ) : createProgramMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Program"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  const renderBranchDetails = (branch, branchIndex) => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 pl-4 border-l-2 border-indigo-100"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{branch.name}</span>
        {branch.sections?.length > 0 && (
          <button
            onClick={() =>
              setExpandedBranch(
                expandedBranch === branchIndex ? null : branchIndex
              )
            }
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedBranch === branchIndex ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      <AnimatePresence>
        {expandedBranch === branchIndex && branch.sections?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 pl-4"
          >
            <div className="flex flex-wrap gap-2">
              {branch.sections.map((section, sectionIndex) => (
                <span
                  key={sectionIndex}
                  className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs"
                >
                  {section}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Degree Programs</h2>
        {userRole !== "Student" && (
          <button
            onClick={() => setIsAddingProgram(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
          >
            <Plus className="h-3 w-3" />
            Add Program
          </button>
        )}
      </div>

      <AnimatePresence>
        {programs.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 text-center"
          >
            No programs added yet
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {programs.map((program, index) => (
              <motion.div
                key={program._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-50 rounded-lg p-3 shadow-sm w-full"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3 truncate">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {program.programName}
                    </h3>
                    {program.branches && program.branches.length > 0 && (
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded flex-shrink-0">
                        {program.branches.length} branches
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-2">
                    {userRole !== "Student" && (
                      <>
                        <button
                          onClick={() => startEditProgram(program)}
                          className="text-gray-500 hover:text-indigo-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            deleteProgramMutation.mutate(program._id)
                          }
                          className="text-gray-500 hover:text-red-600"
                          disabled={deleteProgramMutation.isPending}
                        >
                          {deleteProgramMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </>
                    )}

                    {program.branches && program.branches.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedProgram(
                            expandedProgram === index ? null : index
                          )
                        }
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedProgram === index ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedProgram === index &&
                    program.branches &&
                    program.branches.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2"
                      >
                        <div className="space-y-2">
                          {program.branches.map((branch, branchIndex) => (
                            <div key={branchIndex}>
                              {renderBranchDetails(branch, branchIndex)}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isAddingProgram || isEditingProgram) &&
          renderProgramForm(!!isEditingProgram)}
      </AnimatePresence>
    </div>
  );
};

export default DegreePrograms;
