import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Filter,
  Plus,
  X,
  Trash,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Download,
  AlertCircle,
} from "lucide-react";
import { FaSort, FaSortUp, FaSortDown, FaDatabase } from "react-icons/fa";
import Select from "react-select";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import CustomSelect from "../Global/CustomSelect";
import NotificationButton from "../Global/Notification/NotificationButton";

const defaultColumns = [
  { key: "fullName", label: "Full Name", path: "personal" },
  { key: "rollNumber", label: "Roll Number", path: "academic.rollNumber" },
  {
    key: "collegeEmail",
    label: "College Email",
    path: "personal.collegeEmail",
  },
  {
    key: "graduationYear",
    label: "Graduation Year",
    path: "academic.graduationYear",
  },
];

const availableColumns = [
  {
    key: "personalEmail",
    label: "Personal Email",
    path: "personal.personalEmail",
  },
  { key: "dateOfBirth", label: "Date of Birth", path: "personal.dateOfBirth" },
  {
    key: "degreeProgram",
    label: "Degree Program",
    path: "academic.degreeProgram",
  },
  { key: "branch", label: "Branch", path: "academic.branch" },
  { key: "cgpa", label: "CGPA", path: "academic.cgpa" },
  { key: "backlogs", label: "Backlogs", path: "academic.backlogs" },
  {
    key: "tenthPercentage",
    label: "Tenth %",
    path: "academic.tenth.percentage",
  },
  {
    key: "twelfthPercentage",
    label: "Twelfth %",
    path: "academic.twelfth.percentage",
  },
  {
    key: "aadharNumber",
    label: "Aadhar Number",
    path: "documents.aadhar.number",
  },
  { key: "panNumber", label: "PAN Number", path: "documents.pan.number" },
  { key: "fatherName", label: "Father Name", path: "family.father.name" },
  {
    key: "fatherContact",
    label: "Father Contact",
    path: "family.father.contact",
  },
  { key: "motherName", label: "Mother Name", path: "family.mother.name" },
  {
    key: "motherContact",
    label: "Mother Contact",
    path: "family.mother.contact",
  },
  { key: "linkedin", label: "LinkedIn", path: "social.linkedin" },
  { key: "github", label: "GitHub", path: "social.github" },
];

const allColumns = [...defaultColumns, ...availableColumns];

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 mx-4"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">
                {title}
              </h2>
              <motion.button
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const FilteredStudents = () => {
  const [activeColumns, setActiveColumns] = useState(defaultColumns);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [filters, setFilters] = useState({});
  const [tempFilters, setTempFilters] = useState({});
  const [degreePrograms, setDegreePrograms] = useState([]);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [tempSelectedDegree, setTempSelectedDegree] = useState(null);
  const [branches, setBranches] = useState([]);
  const [localData, setLocalData] = useState([]);
  
  // Faculty Prediction State
  const [predictModalOpen, setPredictModalOpen] = useState(false);
  const [selectedStudentForPrediction, setSelectedStudentForPrediction] = useState(null);
  const [isPredictEditMode, setIsPredictEditMode] = useState(true);
  const [predictionData, setPredictionData] = useState({
    avg_test_score: "",
    technical_score: "",
    aptitude_score: "",
    num_projects: "",
    num_internships: "",
    skills: ""
  });
  const [placementStatus, setPlacementStatus] = useState({
    value: "all",
    label: "All Placement Status",
  });

  const placementOptions = [
    { value: "all", label: "All Placement Status" },
    { value: "placed", label: "Placed" },
    { value: "not_placed", label: "Not Placed" },
  ];

  const jwtToken = Cookies.get("userCookie");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const predictMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_API_URL}/faculty/student/${selectedStudentForPrediction._id}/predict`,
        data,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setPredictModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      navigate(`/faculty/student/${selectedStudentForPrediction._id}/prediction`);
    },
    onError: (err) => {
      alert("Failed to run prediction: " + (err.response?.data?.message || err.message));
    }
  });

  const handleOpenPredictModal = (student) => {
    setSelectedStudentForPrediction(student);
    if (student.predictions) {
      setPredictionData({
        avg_test_score: student.predictions.avg_test_score ?? "",
        technical_score: student.predictions.technical_score ?? "",
        aptitude_score: student.predictions.aptitude_score ?? "",
        num_projects: student.predictions.num_projects ?? "",
        num_internships: student.predictions.num_internships ?? "",
        skills: student.predictions.skills ? student.predictions.skills.join(", ") : ""
      });
      setIsPredictEditMode(false);
    } else {
      setPredictionData({
        avg_test_score: "",
        technical_score: "",
        aptitude_score: "",
        num_projects: "",
        num_internships: "",
        skills: student.professional?.skills ? student.professional.skills.join(", ") : ""
      });
      setIsPredictEditMode(true);
    }
    setPredictModalOpen(true);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "students",
      currentPage,
      filters,
      sortConfig,
      placementStatus.value,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(sortConfig.key && {
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
        }),
        ...filters,
        ...(placementStatus.value !== "all" && {
          isPlaced: placementStatus.value === "placed",
        }),
      });

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_API_URL}/faculty/student/filtered?${params}`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return response.data;
    },
  });

  const { data: universityData } = useQuery({
    queryKey: ["university", "degreePrograms"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_API_URL}/faculty/degree-programs`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return response.data;
    },
  });

  useEffect(() => {
    if (universityData?.data) {
      setDegreePrograms(
        universityData.data.map((program) => ({
          value: program.programName,
          label: program.programName,
          branches: program.branches,
        }))
      );
    }
  }, [universityData]);

  useEffect(() => {
    if (tempSelectedDegree) {
      const program = degreePrograms.find(
        (p) => p.value === tempSelectedDegree.value
      );
      setBranches(
        program?.branches.map((branch) => ({ value: branch, label: branch })) ||
          []
      );
    } else {
      setBranches([]);
    }
  }, [tempSelectedDegree, degreePrograms]);

  useEffect(() => {
    if (selectedDegree) {
      const program = degreePrograms.find(
        (p) => p.value === selectedDegree.value
      );
      setBranches(
        program?.branches.map((branch) => ({ value: branch, label: branch })) ||
          []
      );
    } else {
      setBranches([]);
    }
  }, [selectedDegree, degreePrograms]);

  useEffect(() => {
    if (data?.data.students) {
      setLocalData(data.data.students);
    }
  }, [data]);

  const getNestedValue = (obj, path) => {
    if (path === "fullName") {
      return `${obj.personal.firstName} ${obj.personal.lastName}`;
    }
    return path.split(".").reduce((curr, key) => curr?.[key], obj);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        }
        if (prev.direction === "desc") {
          return { key: "", direction: "" };
        }
      }
      return { key, direction: "asc" };
    });
  };

  const handleAddColumn = (column) => {
    setActiveColumns((prev) => [...prev, column]);
    setShowAddColumn(false);
  };

  const handleRemoveColumn = (key) => {
    setActiveColumns((prev) => prev.filter((col) => col.key !== key));
  };

  const handleFilter = () => {
    setFilters(tempFilters);
    setSelectedDegree(tempSelectedDegree);
    setShowFilter(false);
    setCurrentPage(1);
  };

  const resetTempFilters = () => {
    setTempFilters(filters);
    setTempSelectedDegree(selectedDegree);
  };

  useEffect(() => {
    if (showFilter) {
      resetTempFilters();
    }
  }, [showFilter]);

  const renderFilterField = (column) => {
    switch (column.key) {
      case "dateOfBirth":
        return (
          <div key={column.key} className="space-y-2">
            <label className="block text-sm font-medium">Age Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Age"
                className="w-full px-3 py-2 border rounded-md"
                value={tempFilters.ageMin || ""}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    ageMin: e.target.value,
                  }))
                }
              />
              <input
                type="number"
                placeholder="Max Age"
                className="w-full px-3 py-2 border rounded-md"
                value={tempFilters.ageMax || ""}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    ageMax: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        );

      case "degreeProgram":
        return (
          <div key={column.key} className="space-y-2">
            <label className="block text-sm font-medium">Degree Program</label>
            <Select
              options={degreePrograms}
              value={tempSelectedDegree}
              onChange={(value) => {
                setTempSelectedDegree(value);
                setTempFilters((prev) => ({
                  ...prev,
                  degreeProgram: value?.value,
                }));
              }}
              className="w-full"
              isClearable
            />
          </div>
        );

      case "branch":
        return (
          <div key={column.key} className="space-y-2">
            <label className="block text-sm font-medium">Branch</label>
            <Select
              options={branches}
              isDisabled={!tempSelectedDegree}
              value={branches.find((b) => b.value === tempFilters.branch)}
              onChange={(value) =>
                setTempFilters((prev) => ({ ...prev, branch: value?.value }))
              }
              className="w-full"
              isClearable
            />
          </div>
        );

      case "cgpa":
      case "tenthPercentage":
      case "twelfthPercentage":
        return (
          <div key={column.key} className="space-y-2">
            <label className="block text-sm font-medium">
              {column.label} Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Min"
                className="w-full px-3 py-2 border rounded-md"
                value={tempFilters[`${column.key}Min`] || ""}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    [`${column.key}Min`]: e.target.value,
                  }))
                }
              />
              <input
                type="number"
                step="0.01"
                placeholder="Max"
                className="w-full px-3 py-2 border rounded-md"
                value={tempFilters[`${column.key}Max`] || ""}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    [`${column.key}Max`]: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        );

      case "backlogs":
        return (
          <div key={column.key} className="space-y-2">
            <label className="block text-sm font-medium">Backlogs Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-full px-3 py-2 border rounded-md"
                value={tempFilters.backlogsMin || ""}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    backlogsMin: e.target.value,
                  }))
                }
              />
              <input
                type="number"
                placeholder="Max"
                className="w-full px-3 py-2 border rounded-md"
                value={tempFilters.backlogsMax || ""}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    backlogsMax: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        );

      case "graduationYear":
        return (
          <div key={column.key} className="space-y-2">
            <label className="block text-sm font-medium">Graduation Year</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-md"
              value={tempFilters.graduationYear || ""}
              onChange={(e) =>
                setTempFilters((prev) => ({
                  ...prev,
                  graduationYear: e.target.value,
                }))
              }
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const params = new URLSearchParams({
        limit: 10000, // Large number to get all records
        ...filters,
        ...(sortConfig.key && {
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
        }),
        ...(placementStatus.value !== "all" && {
          isPlaced: placementStatus.value === "placed",
        }),
      });

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_API_URL}/faculty/student/filtered?${params}`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );

      const excelData = response.data.data.students.map((student) => {
        const row = {};
        activeColumns.forEach((column) => {
          let value;
          if (column.key === "fullName") {
            value = `${student.personal.firstName} ${student.personal.lastName}`;
          } else {
            value = getNestedValue(student, column.path);
          }

          // Format special values
          if (column.key === "dateOfBirth" && value) {
            value = new Date(value).toLocaleDateString();
          } else if (
            ["cgpa", "tenthPercentage", "twelfthPercentage"].includes(
              column.key
            ) &&
            value
          ) {
            value = Number(value).toFixed(2);
          } else if (column.key === "isPlaced") {
            value = value ? "Yes" : "No";
          }

          row[column.label] = value ?? "N/A";
        });
        return row;
      });

      // Create and style the worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const columnWidths = activeColumns.map(() => ({ wch: 15 }));
      worksheet["!cols"] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

      // Generate filename
      let filename = "Filtered Student Data";
      if (filters.degreeProgram) filename += `-${filters.degreeProgram}`;
      if (filters.branch) filename += `-${filters.branch}`;
      if (sortConfig.key) {
        filename += `-sorted-by-${sortConfig.key}-${sortConfig.direction}`;
      }
      filename += ".xlsx";

      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="w-3 h-3 text-gray-400" />;
    }
    if (sortConfig.direction === "asc") {
      return <FaSortUp className="w-3 h-3 text-indigo-500" />;
    }
    if (sortConfig.direction === "desc") {
      return <FaSortDown className="w-3 h-3 text-indigo-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  const hasNoData = !localData || localData.length === 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50/30 rounded-xl shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddColumn(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Column
          </motion.button>
          <div className="w-48">
            <CustomSelect
              options={placementOptions}
              value={placementStatus}
              onChange={(selectedOption) => {
                setPlacementStatus(selectedOption);
                setCurrentPage(1);
              }}
              placeholder="Select placement status"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadExcel}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-400 to-blue-400 text-white rounded-lg shadow-lg shadow-sky-100 hover:shadow-xl hover:shadow-sky-200 transition-all duration-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Excel
          </motion.button>
        </div>
        <NotificationButton
          students={localData.map((student) => student._id)}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowFilter(true)}
          className="px-4 py-2.5 bg-white border border-indigo-200 text-indigo-500 rounded-lg shadow-lg shadow-indigo-100 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-200 flex items-center gap-2"
        >
          <Filter className="w-4 h-4" /> Filter
        </motion.button>
      </div>

      {hasNoData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-indigo-100 p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="flex gap-3 mb-4"
          >
            <FaDatabase className="w-8 h-8 text-indigo-400" />
            <AlertCircle className="w-8 h-8 text-indigo-400" />
          </motion.div>

          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold text-gray-700 mb-2"
          >
            No Data Available
          </motion.h3>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 text-center max-w-md"
          >
            There are currently no student records matching your search
            criteria. Try adjusting your filters.
          </motion.p>
        </motion.div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                    {activeColumns.map((column) => (
                      <th
                        key={column.key}
                        className="p-3 cursor-pointer relative text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-indigo-100/50"
                        onClick={() => handleSort(column.key)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{column.label}</span>
                          <div className="flex items-center gap-2">
                            {getSortIcon(column.key)}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveColumn(column.key);
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="p-3 cursor-pointer relative text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {localData.map((student, index) => (
                    <motion.tr
                      key={student._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-indigo-50 hover:bg-indigo-50/30 transition-colors"
                    >
                      {activeColumns.map((column) => (
                        <td
                          key={column.key}
                          className="p-3 text-sm text-gray-600"
                        >
                          {column.key === "fullName"
                            ? `${student.personal.firstName} ${student.personal.lastName}`
                            : getNestedValue(student, column.path)}
                        </td>
                      ))}
                      <td className="p-3 text-sm">
                        <button 
                          onClick={() => handleOpenPredictModal(student)}
                          className="px-3 py-1.5 bg-indigo-100 text-indigo-700 flex items-center gap-1 rounded hover:bg-indigo-200 transition-colors shadow-sm"
                        >
                          <span className="text-xs">🔮</span> Predict
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-center items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-2 bg-white border border-indigo-200 text-indigo-500 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <span className="px-4 py-2 bg-indigo-50 rounded-lg text-sm font-medium text-indigo-500">
          Page {currentPage} of {data?.data.pagination.totalPages}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={!data?.data.pagination.hasNextPage}
          className="p-2 bg-white border border-indigo-200 text-indigo-500 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>

      <Modal
        isOpen={showAddColumn}
        onClose={() => setShowAddColumn(false)}
        title="Add Column"
      >
        <div className="grid grid-cols-2 gap-3">
          {allColumns
            .filter((col) => !activeColumns.find((ac) => ac.key === col.key))
            .map((column) => (
              <motion.button
                key={column.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAddColumn(column)}
                className="px-3 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {column.label}
              </motion.button>
            ))}
        </div>
      </Modal>

      <Modal
        isOpen={showFilter}
        onClose={() => {
          setShowFilter(false);
          resetTempFilters();
        }}
        title="Filter Students"
      >
        <div className="space-y-4">
          {activeColumns.map((column) => renderFilterField(column))}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setTempFilters({});
                setTempSelectedDegree(null);
              }}
              className="w-1/2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Reset
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFilter}
              className="w-1/2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Apply Filters
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* AI Prediction Modal */}
      <Modal
        isOpen={predictModalOpen}
        onClose={() => setPredictModalOpen(false)}
        title="🔮 AI Prediction Mode"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 border-b pb-3 mb-4">
            Enter the academic metrics for <span className="font-semibold text-gray-800">{selectedStudentForPrediction?.personal?.firstName} {selectedStudentForPrediction?.personal?.lastName}</span> to calculate their placement probability and best-fit company.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Average Test Score</label>
              <input type="number" disabled={!isPredictEditMode} className="w-full px-3 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500" value={predictionData.avg_test_score} onChange={(e) => setPredictionData({...predictionData, avg_test_score: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Technical Score</label>
              <input type="number" disabled={!isPredictEditMode} className="w-full px-3 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500" value={predictionData.technical_score} onChange={(e) => setPredictionData({...predictionData, technical_score: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Aptitude Score</label>
              <input type="number" disabled={!isPredictEditMode} className="w-full px-3 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500" value={predictionData.aptitude_score} onChange={(e) => setPredictionData({...predictionData, aptitude_score: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Total Projects</label>
              <input type="number" disabled={!isPredictEditMode} className="w-full px-3 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500" value={predictionData.num_projects} onChange={(e) => setPredictionData({...predictionData, num_projects: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Internship Count</label>
              <input type="number" disabled={!isPredictEditMode} className="w-full px-3 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500" value={predictionData.num_internships} onChange={(e) => setPredictionData({...predictionData, num_internships: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Skills (comma separated)</label>
              <input type="text" disabled={!isPredictEditMode} className="w-full px-3 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500" value={predictionData.skills} onChange={(e) => setPredictionData({...predictionData, skills: e.target.value})} placeholder="e.g. React, Node.js, Python" />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            {selectedStudentForPrediction?.predictions && !isPredictEditMode ? (
              <button 
                onClick={() => setIsPredictEditMode(true)} 
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200"
              >
                Edit Marks
              </button>
            ) : (
              <div></div>
            )}
            
            <div className="flex gap-3">
              <button onClick={() => setPredictModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 font-medium hover:bg-gray-200">Cancel</button>
              {isPredictEditMode && (
                <button 
                  onClick={() => predictMutation.mutate({
                    ...predictionData,
                    skills: predictionData.skills.split(",").map(s => s.trim()).filter(Boolean)
                  })} 
                  disabled={predictMutation.isPending} 
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium shadow-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {predictMutation.isPending ? "Predicting..." : "Update & Predict"}
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FilteredStudents;
