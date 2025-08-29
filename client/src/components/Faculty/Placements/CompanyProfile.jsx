import { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";
import Cookies from "js-cookie";
import AddStudentModal from "./AddStudentModal";
import AddRoleModal from "./AddRoleModal";
import { toast } from "react-toastify";
import CustomSelect from "../../Global/CustomSelect";
import { Search, RefreshCw, Plus } from "lucide-react";
import BackButton from "../../Global/BackButton";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 px-4"
  >
    <div className="bg-indigo-50 rounded-full p-6 mb-4">
      <svg
        className="w-12 h-12 text-indigo-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No Students Added Yet
    </h3>
    <p className="text-gray-500 text-center max-w-sm">
      Start by clicking the "Add Students" button above to add students to this
      company's placement list.
    </p>
  </motion.div>
);

const CompanyProfile = () => {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [selectedToRemove, setSelectedToRemove] = useState([]);
  const [showSaveBanner, setShowSaveBanner] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    graduationYear: null,
  });

  const token = Cookies.get("userCookie");

  // Consolidated data fetching
  const fetchAllData = async () => {
    const urls = [
      `${import.meta.env.VITE_SERVER_API_URL}/faculty/company/${companyId}`,
      `${import.meta.env.VITE_SERVER_API_URL}/faculty/degree-programs`,
    ];

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const [companyData, degreeProgramsData] = await Promise.all(
        urls.map((url) => axios.get(url, { headers }))
      );

      return {
        companyData: companyData.data,
        degreeProgramsData: degreeProgramsData.data.data,
      };
    } catch (error) {
      throw new Error("Failed to fetch data");
    }
  };

  const {
    data: allData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["allCompanyData", companyId],
    queryFn: fetchAllData,
    enabled: !!companyId && !!token,
  });

  // Derived data from the consolidated query
  const company = allData?.companyData?.data?.company;
  const opportunities = allData?.companyData?.data?.opportunities;
  const placedStudents = allData?.companyData?.data?.placedStudents;
  const graduationYears = allData?.companyData?.data?.graduationYears;
  const degreeProgramsData = allData?.degreeProgramsData;

  const updatePlacementMutation = useMutation({
    mutationFn: async (updates) => {
      const token = Cookies.get("userCookie");

      if (!updates.removedStudents?.length && !updates.addedStudents?.length) {
        throw new Error("No updates provided");
      }

      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_API_URL}/faculty/company/${companyId}/placement`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries(["companyDashboard", companyId]);
        setSelectedToRemove([]);
        setShowSaveBanner(false);
      } else {
        toast.error("Failed to update placements");
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update placements"
      );
      queryClient.invalidateQueries(["companyDashboard", companyId]);
    },
  });

  const handleStudentRemove = (studentId) => {
    if (!studentId) {
      console.error("Invalid student ID:", studentId);
      toast.error("Invalid student selection");
      return;
    }

    setSelectedToRemove((prev) => {
      const newSelected = prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId];

      setShowSaveBanner(newSelected.length > 0);
      return newSelected;
    });
  };

  const handleSaveChanges = async () => {
    const validStudentIds = selectedToRemove.filter(
      (id) => id !== undefined && id !== null
    );

    if (validStudentIds.length === 0) {
      toast.error("No valid students selected for removal");
      return;
    }

    try {
      await updatePlacementMutation.mutateAsync({
        removedStudents: validStudentIds,
        addedStudents: [],
      });
    } catch (error) {
      console.error("Failed to update placements:", error);
    }
  };

  const handleAddStudents = async (data) => {
    try {
      await updatePlacementMutation.mutateAsync({
        addedStudents: data.addedStudents.map((student) => ({
          studentId: student.studentId,
          role: student.role,
        })),
      });
    } catch (error) {
      console.error("Failed to add students:", error);
    }
  };

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
  };

  const handleResetFilters = () => {
    setFilters({
      degreeProgram: null,
      branch: null,
      section: null,
      graduationYear: null,
      search: "",
    });
  };

  // Options setup for filters
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
    if (!graduationYears) return [];

    return graduationYears.map((year) => ({
      label: year.toString(),
      value: year.toString(),
    }));
  }, [graduationYears]);

  // Update filtered students logic
  const filteredStudents = useMemo(() => {
    if (!placedStudents) return [];
    let filtered = [...placedStudents];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm) ||
          student.rollNumber.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.graduationYear?.value) {
      filtered = filtered.filter(
        (student) =>
          student.graduationYear.toString() === filters.graduationYear.value
      );
    }

    if (filters.degreeProgram?.value) {
      filtered = filtered.filter(
        (student) => student.program === filters.degreeProgram.value
      );
    }

    if (filters.branch?.value) {
      filtered = filtered.filter(
        (student) => student.branch === filters.branch.value
      );
    }

    if (filters.section?.value) {
      filtered = filtered.filter(
        (student) => student.section === filters.section.value
      );
    }

    return filtered;
  }, [placedStudents, filters]);

  // Update stats based on filtered students
  const filteredStats = useMemo(() => {
    if (!filteredStudents.length) {
      return {
        totalOpportunities: opportunities?.length || 0,
        totalPlacedStudents: 0,
        averagePackage: "0",
      };
    }

    // Calculate average package only from valid numerical packages
    const validPackages = filteredStudents
      .map((student) => parseFloat(student.package))
      .filter((pkg) => !isNaN(pkg));

    const avgPackage =
      validPackages.length > 0
        ? (
            validPackages.reduce((acc, pkg) => acc + pkg, 0) /
            validPackages.length
          ).toFixed(2)
        : "0";

    return {
      totalOpportunities: opportunities?.length || 0,
      totalPlacedStudents: filteredStudents.length,
      averagePackage: avgPackage,
    };
  }, [filteredStudents, opportunities]);

  const handleBack = () => {
    if (showSaveBanner) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to go back without saving?"
        )
      ) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-indigo-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-indigo-100 rounded mb-4"></div>
          <div className="h-32 bg-indigo-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">
          Error loading company data: {error.message}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      {/*Banner*/}
      <AnimatePresence>
        {showSaveBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-indigo-200 z-50 flex items-center space-x-4"
          >
            <span className="text-gray-700">
              {selectedToRemove.length} student
              {selectedToRemove.length > 1 ? "s" : ""} selected for removal
            </span>
            <button
              onClick={handleSaveChanges}
              disabled={updatePlacementMutation.isLoading}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50"
            >
              {updatePlacementMutation.isLoading ? "Saving..." : "Save Changes"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Company Overview */}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <BackButton onClick={handleBack} />
        </div>
      </div>

      <motion.div
        variants={itemVariants}
        className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            {company?.logo && (
              <img
                src={company.logo}
                alt={company.name}
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {company?.name}
              </h1>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsAddRoleModalOpen(true)}
              className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100">
          <h3 className="text-gray-500 text-sm">Total Opportunities</h3>
          <p className="text-3xl font-bold text-indigo-500">
            {filteredStats?.totalOpportunities}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100">
          <h3 className="text-gray-500 text-sm">Placed Students</h3>
          <p className="text-3xl font-bold text-indigo-500">
            {filteredStats?.totalPlacedStudents || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100">
          <h3 className="text-gray-500 text-sm">Average Package</h3>
          <p className="text-3xl font-bold text-indigo-500">
            {filteredStats?.averagePackage}
          </p>
        </div>
      </motion.div>

      {/* Placed Students Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-sm border border-indigo-100"
      >
        <div className="p-4 border-b border-indigo-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Placed Students
            </h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Students
            </button>
          </div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-indigo-50 p-6 rounded-lg mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-indigo-700">Filters</h3>
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
                <label className="text-sm font-medium mb-1 block">Branch</label>
                <CustomSelect
                  options={branchOptions}
                  value={filters.branch}
                  onChange={(option) => handleFilterChange("branch", option)}
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
                  onChange={(option) => handleFilterChange("section", option)}
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
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search by name or roll number..."
                className="w-full p-3 pl-12 border-2 border-indigo-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400" />
            </div>
          </motion.div>
        </div>

        {!filteredStudents?.length ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Roll Number
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Branch
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Section
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Graduation Year
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Package
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {filteredStudents?.map((student, index) => (
                  <motion.tr
                    key={student.rollNumber}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`hover:bg-indigo-50 ${
                      selectedToRemove.includes(student._id) ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {student.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.rollNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.program}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.branch}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.section}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.graduationYear}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.role}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.package}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <button
                        onClick={() => {
                          handleStudentRemove(student._id);
                        }}
                        className={`px-3 py-1 rounded-md text-sm ${
                          selectedToRemove.includes(student._id)
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {selectedToRemove.includes(student._id)
                          ? "Undo Remove"
                          : "Remove"}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      {/* Opportunities Chart */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-sm border border-indigo-100 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Opportunities Overview
        </h2>
        <div className="h-64">
          <LineChart
            width={800}
            height={240}
            data={opportunities}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="role" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="package"
              stroke="#6366f1"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="placedCount"
              stroke="#818cf8"
              strokeWidth={2}
            />
          </LineChart>
        </div>
      </motion.div>
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        companyId={companyId}
        updateMutation={updatePlacementMutation}
        onSaveChanges={handleAddStudents}
      />
      <AddRoleModal
        isOpen={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
        companyId={companyId}
      />
    </motion.div>
  );
};

export default CompanyProfile;
