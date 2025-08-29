"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { XIcon, Search, RefreshCw } from "lucide-react";
import Cookies from "js-cookie";
import CustomSelect from "../../Global/CustomSelect";

const RolesEmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center p-8 text-center"
  >
    <div className="bg-indigo-50 rounded-full p-4 mb-4">
      <svg
        className="w-10 h-10 text-indigo-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No Roles Available
    </h3>
    <p className="text-gray-500">
      No roles have been defined for this company yet.
    </p>
  </motion.div>
);

// Add empty state for students view
const StudentsEmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center p-8 text-center"
  >
    <div className="bg-indigo-50 rounded-full p-4 mb-4">
      <svg
        className="w-10 h-10 text-indigo-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No Eligible Students Found
    </h3>
    <p className="text-gray-500">
      Try adjusting the filters to find eligible students.
    </p>
  </motion.div>
);

const AddStudentModal = ({ isOpen, onClose, companyId, onSaveChanges }) => {
  const initialState = {
    selectedRole: null,
    filters: {
      degreeProgram: null,
      branch: null,
      section: null,
      graduationYear: null,
      search: "",
    },
    selectedStudents: [],
    currentPage: 1,
  };

  const [selectedRole, setSelectedRole] = useState(null);
  const [filters, setFilters] = useState({
    degreeProgram: null,
    branch: null,
    section: null,
    graduationYear: null,
    search: "",
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const token = Cookies.get("userCookie");

  useEffect(() => {
    if (!isOpen) {
      setSelectedRole(initialState.selectedRole);
      setFilters(initialState.filters);
      setSelectedStudents(initialState.selectedStudents);
      setCurrentPage(initialState.currentPage);
    }
  }, [isOpen]);

  // Combined query for all required data
  const { data: combinedData, isLoading } = useQuery({
    queryKey: ["combinedData", companyId, selectedRole, currentPage, filters],
    queryFn: async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = import.meta.env.VITE_SERVER_API_URL;

      const queries = [
        axios.get(`${baseUrl}/faculty/company/${companyId}/roles`, { headers }),
        axios.get(`${baseUrl}/faculty/degree-programs`, { headers }),
      ];

      // Only fetch students data if a role is selected
      if (selectedRole) {
        const params = new URLSearchParams({
          page: currentPage,
          limit: 10,
          role: selectedRole,
          degreeProgram: filters.degreeProgram?.value || "",
          branch: filters.branch?.value || "",
          section: filters.section?.value || "",
          graduationYear: filters.graduationYear?.value || "",
        });

        queries.push(
          axios.get(
            `${baseUrl}/faculty/company/${companyId}/eligible-students?${params}`,
            { headers }
          )
        );
      }

      const [rolesResponse, programsResponse, studentsResponse] =
        await Promise.all(queries);

      return {
        companyData: rolesResponse.data,
        degreeProgramsData: programsResponse.data.data,
        studentsData: selectedRole ? studentsResponse?.data : null,
      };
    },
    enabled: isOpen,
  });

  // Derived data from the combined query
  const { companyData, degreeProgramsData, studentsData } = combinedData || {};

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!studentsData?.data?.students) return [];

    const searchTerm = filters.search.toLowerCase().trim();
    if (!searchTerm) return studentsData.data.students;

    return studentsData.data.students.filter((student) => {
      const fullName =
        `${student.personal.firstName} ${student.personal.lastName}`.toLowerCase();
      const rollNumber = student.academic.rollNumber.toLowerCase();
      return fullName.includes(searchTerm) || rollNumber.includes(searchTerm);
    });
  }, [studentsData?.data?.students, filters.search]);

  // Options setup
  const programOptions = useMemo(
    () =>
      degreeProgramsData?.map((program) => ({
        label: program.programName,
        value: program.programName,
      })) || [],
    [degreeProgramsData]
  );

  const branchOptions = useMemo(
    () =>
      degreeProgramsData
        ?.find(
          (program) => program.programName === filters.degreeProgram?.value
        )
        ?.branches?.map((branch) => ({
          label: branch.name,
          value: branch.name,
        })) || [],
    [degreeProgramsData, filters.degreeProgram]
  );

  const sectionOptions = useMemo(
    () =>
      degreeProgramsData
        ?.find(
          (program) => program.programName === filters.degreeProgram?.value
        )
        ?.branches?.find((branch) => branch.name === filters.branch?.value)
        ?.sections?.map((section) => ({
          label: section,
          value: section,
        })) || [],
    [degreeProgramsData, filters.degreeProgram, filters.branch]
  );

  const graduationYearOptions = useMemo(() => {
    if (!studentsData?.data?.students) return [];

    const uniqueYears = [
      ...new Set(
        studentsData.data.students.map((student) =>
          student.academic.graduationYear.toString()
        )
      ),
    ].sort();

    return uniqueYears.map((year) => ({
      label: year,
      value: year,
    }));
  }, [studentsData?.data?.students]);

  // Handler functions remain the same
  const handleFilterChange = (name, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      if (name === "degreeProgram") {
        newFilters.branch = null;
        newFilters.section = null;
      }
      if (name === "branch") {
        newFilters.section = null;
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(initialState.filters);
    setCurrentPage(1);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudents((prev) => {
      const isSelected = prev.some((s) => s._id === student._id);
      if (isSelected) {
        return prev.filter((s) => s._id !== student._id);
      }
      return [...prev, student];
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;

    await onSaveChanges({
      addedStudents: selectedStudents.map((student) => ({
        studentId: student._id,
        status: "Accepted",
        role: selectedRole,
      })),
    });
    onClose();
  };

  const handleClose = () => {
    setSelectedRole(initialState.selectedRole);
    setFilters(initialState.filters);
    setSelectedStudents(initialState.selectedStudents);
    setCurrentPage(initialState.currentPage);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="bg-white rounded-lg w-11/12 max-h-[90vh] flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-indigo-50">
              <motion.h2
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-semibold text-indigo-700"
              >
                {selectedRole
                  ? `Add Students - ${selectedRole}`
                  : "Select Role"}
              </motion.h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="p-2 hover:bg-indigo-100 rounded-full transition-colors"
              >
                <XIcon className="w-6 h-6 text-indigo-500" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedRole ? (
                // Role Selection View
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {isLoading ? (
                    <div className="text-indigo-600">Loading roles...</div>
                  ) : !companyData?.data?.opportunities?.length ? (
                    <RolesEmptyState />
                  ) : (
                    companyData?.data?.opportunities?.map((opp) => (
                      <motion.div
                        key={opp.role}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedRole(opp.role)}
                        className="p-6 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors shadow-md"
                      >
                        <h3 className="font-medium text-indigo-700 text-lg mb-2">
                          {opp.role}
                        </h3>
                        <p className="text-sm text-indigo-500">
                          Package: {opp.package}
                        </p>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              ) : (
                // Student Selection View with Filters
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Filters Section */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-indigo-50 p-6 rounded-lg mb-6 shadow-md"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-indigo-700">
                        Filters
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleResetFilters}
                        className="flex items-center px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset Filters
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Program
                        </label>
                        <CustomSelect
                          options={programOptions}
                          value={filters.degreeProgram}
                          onChange={(option) =>
                            handleFilterChange("degreeProgram", option)
                          }
                          placeholder="Select Program"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Branch
                        </label>
                        <CustomSelect
                          options={branchOptions}
                          value={filters.branch}
                          onChange={(option) =>
                            handleFilterChange("branch", option)
                          }
                          placeholder="Select Branch"
                          isDisabled={!filters.degreeProgram}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Section
                        </label>
                        <CustomSelect
                          options={sectionOptions}
                          value={filters.section}
                          onChange={(option) =>
                            handleFilterChange("section", option)
                          }
                          placeholder="Select Section"
                          isDisabled={!filters.branch}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Graduation Year
                        </label>
                        <CustomSelect
                          options={graduationYearOptions}
                          value={filters.graduationYear}
                          onChange={(option) =>
                            handleFilterChange("graduationYear", option)
                          }
                          placeholder="Graduation Year"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) =>
                          handleFilterChange("search", e.target.value)
                        }
                        placeholder="Search by name or roll number..."
                        className="w-full p-3 pl-12 border-2 border-indigo-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                      />
                      <Search className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400" />
                    </div>
                  </motion.div>

                  {/* Students Table */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="overflow-x-auto bg-white rounded-lg shadow-md"
                  >
                    <table className="w-full">
                      <thead className="bg-indigo-100">
                        <tr>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Select
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Roll Number
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Program
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Branch
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Section
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Graduation Year
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-100">
                        {isLoading ? (
                          <tr>
                            <td
                              colSpan="7"
                              className="text-center p-6 text-indigo-600"
                            >
                              Loading students...
                            </td>
                          </tr>
                        ) : !filteredStudents?.length ? (
                          <StudentsEmptyState />
                        ) : (
                          filteredStudents?.map((student) => (
                            <motion.tr
                              key={student._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              whileHover={{ backgroundColor: "#EEF2FF" }}
                              className="transition-colors"
                            >
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  checked={selectedStudents.some(
                                    (s) => s._id === student._id
                                  )}
                                  onChange={() => handleStudentSelect(student)}
                                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                              </td>
                              <td className="p-3 text-gray-900">
                                {student.personal.firstName}{" "}
                                {student.personal.lastName}
                              </td>
                              <td className="p-3 text-gray-500">
                                {student.academic.rollNumber}
                              </td>
                              <td className="p-3 text-gray-500">
                                {student.academic.degreeProgram}
                              </td>
                              <td className="p-3 text-gray-500">
                                {student.academic.branch}
                              </td>
                              <td className="p-3 text-gray-500">
                                {student.academic.section}
                              </td>
                              <td className="p-3 text-gray-500">
                                {student.academic.graduationYear}
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-6 border-t border-gray-200 flex justify-between items-center bg-indigo-50"
            >
              <div className="text-sm text-indigo-600 font-medium">
                {selectedRole
                  ? `${selectedStudents.length} students selected`
                  : ""}
              </div>
              <div className="space-x-4">
                {selectedRole && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedRole(null)}
                    className="px-6 py-2 border-2 border-indigo-500 rounded-md text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    Back to Roles
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={!selectedRole || selectedStudents.length === 0}
                  className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  Add Selected
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddStudentModal;
