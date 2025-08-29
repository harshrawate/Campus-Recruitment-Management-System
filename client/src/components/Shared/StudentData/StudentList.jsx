import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Search,
  School,
  Users,
  SortAsc,
  SortDesc,
  UserCircle,
  X,
} from "lucide-react";
import { getUserRole } from "../../../utils/auth.js";
import LoadingOverlay from "../../Global/LoadingOverlay.jsx";
import CustomSelect from "../../Global/CustomSelect.jsx";
import { useForm, Controller } from "react-hook-form";

const PlacementBubbles = ({ offers = [] }) => {
  // Generate consistent colors based on company names
  const getCompanyColor = (company = "") => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index =
      company.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {offers.map((offer, index) => {
        const company = offer?.company || "Unknown Company";
        const role = offer?.role || "Unknown Role";
        const ctc = offer?.ctc || "N/A";

        return (
          <div
            key={offer?._id || index}
            className={`${getCompanyColor(
              company
            )} text-white text-sm px-3 py-1 rounded-full`}
            title={`${role} - ${ctc} LPA`}
          >
            {company}
          </div>
        );
      })}
    </div>
  );
};

const StudentList = () => {
  const navigate = useNavigate();
  const jwtToken = Cookies.get("userCookie");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [selectedPlacementStatus, setSelectedPlacementStatus] = useState("");
  const [updatedPlacements, setUpdatedPlacements] = useState(new Map());

  const { control, reset } = useForm();
  const role = getUserRole();
  const isAdminRole = role === "admin" || role === "super admin";
  const isPlacementRole = role === "head" || role === "coordinator";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["students", "data"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_API_URL}/students/data`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      return response.data;
    },
  });

  const currentUniversity = useMemo(() => {
    if (!isAdminRole || !data?.data?.universities) return null;
    return selectedUniversity
      ? data.data.universities.find((uni) => uni.name === selectedUniversity)
      : null;
  }, [isAdminRole, data, selectedUniversity]);

  const filteredAndSortedStudents = useMemo(() => {
    if (!data?.data?.students) return [];

    let filtered = data.data.students;

    if (isAdminRole && selectedUniversity) {
      filtered = filtered.filter(
        (student) => student.university === selectedUniversity
      );
    }
    if (selectedDegree) {
      filtered = filtered.filter(
        (student) => student.degree === selectedDegree
      );
    }
    if (selectedBranch) {
      filtered = filtered.filter(
        (student) => student.branch === selectedBranch
      );
    }
    if (selectedSection) {
      filtered = filtered.filter(
        (student) => student.section === selectedSection
      );
    }
    if (selectedSection) {
      filtered = filtered.filter(
        (student) => student.section === selectedSection
      );
    }
    if (selectedYear) {
      filtered = filtered.filter(
        (student) => student?.graduationYear.toString() === selectedYear
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
      );
    }
    if (selectedPlacementStatus) {
      filtered = filtered.filter((student) => {
        if (updatedPlacements.has(student.id)) {
          const updatedStatus = updatedPlacements.get(student.id).isPlaced;
          return selectedPlacementStatus === "placed"
            ? updatedStatus
            : !updatedStatus;
        }
        return selectedPlacementStatus === "placed"
          ? student.isPlaced
          : !student.isPlaced;
      });
    }

    return [...filtered].sort((a, b) => {
      if (sortConfig.key === "name") {
        const nameA = a.name.split(" ").pop().toLowerCase();
        const nameB = b.name.split(" ").pop().toLowerCase();
        return sortConfig.direction === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      if (sortConfig.key === "rollNumber") {
        return sortConfig.direction === "asc"
          ? a.rollNumber.localeCompare(b.rollNumber)
          : b.rollNumber.localeCompare(a.rollNumber);
      }
      return 0;
    });
  }, [
    data,
    isAdminRole,
    selectedUniversity,
    selectedDegree,
    selectedBranch,
    selectedSection,
    selectedYear,
    searchQuery,
    sortConfig,
    selectedPlacementStatus,
    updatedPlacements,
  ]);

  const availablePrograms = useMemo(() => {
    if (isAdminRole) {
      return currentUniversity?.programs || [];
    } else {
      return data?.data?.university?.programs || [];
    }
  }, [isAdminRole, currentUniversity, data]);

  const universityOptions = useMemo(
    () =>
      data?.data?.universities?.map((uni) => ({
        value: uni.name,
        label: uni.name,
      })) || [],
    [data]
  );

  const degreeOptions = useMemo(
    () =>
      availablePrograms.map((prog) => ({
        value: prog.degree,
        label: prog.degree,
      })) || [],
    [availablePrograms]
  );

  const branchOptions = useMemo(() => {
    if (!selectedDegree || !availablePrograms) return [];

    const selectedProgram = availablePrograms.find(
      (prog) => prog.degree === selectedDegree
    );
    return (
      selectedProgram?.branches.map((branch) => ({
        value: branch.name,
        label: branch.name,
      })) || []
    );
  }, [selectedDegree, availablePrograms]);

  const sectionOptions = useMemo(() => {
    if (!selectedDegree || !selectedBranch || !availablePrograms) return [];

    const selectedProgram = availablePrograms.find(
      (prog) => prog.degree === selectedDegree
    );
    const selectedBranchData = selectedProgram?.branches.find(
      (b) => b.name === selectedBranch
    );

    return (
      selectedBranchData?.sections?.map((section) => ({
        value: section,
        label: section,
      })) || []
    );
  }, [selectedDegree, selectedBranch, availablePrograms]);

  const yearOptions = useMemo(
    () =>
      Array.from(
        new Set(
          data?.data?.students
            ?.filter((s) => s.graduationYear != null)
            .map((s) => s.graduationYear)
        )
      )
        .sort()
        .map((year) => ({
          value: year.toString(),
          label: year.toString(),
        })) || [],
    [data]
  );

  const hasActiveFilters = useMemo(() => {
    return (
      selectedUniversity !== "" ||
      selectedDegree !== "" ||
      selectedBranch !== "" ||
      selectedSection !== "" ||
      selectedYear !== "" ||
      searchQuery !== "" ||
      selectedPlacementStatus !== "" ||
      sortConfig.key !== "name" ||
      sortConfig.direction !== "asc"
    );
  }, [
    selectedUniversity,
    selectedDegree,
    selectedBranch,
    selectedSection,
    selectedYear,
    searchQuery,
    selectedPlacementStatus,
    sortConfig.key,
    sortConfig.direction,
  ]);

  const resetFilters = () => {
    setSelectedUniversity("");
    setSelectedDegree("");
    setSelectedBranch("");
    setSelectedSection("");
    setSelectedYear("");
    setSearchQuery("");
    setSelectedPlacementStatus("");
    setSortConfig({
      key: "name",
      direction: "asc",
    });

    reset({
      university: null,
      degree: null,
      branch: null,
      section: null,
      year: null,
      placementStatus: null,
    });
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 p-4">Error: {error.message}</div>
    );
  }

  const universityName = isAdminRole
    ? selectedUniversity || "All Universities"
    : data?.data?.university?.name;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header with University name and total count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <School className="inline-block mr-2" size={24} />
          <h1 className="text-xl font-semibold text-gray-800">
            {universityName}
          </h1>
        </div>
        <div className="bg-indigo-100 px-4 py-2 rounded-lg">
          <span className="text-indigo-700 font-medium">
            Total Students: {filteredAndSortedStudents.length}
          </span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-4 mb-6">
        {/* Main filters container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Placement Status Filter */}
          {isPlacementRole && (
            <div className="w-full">
              <Controller
                name="placementStatus"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    options={[
                      { value: "", label: "All Placement Status" },
                      { value: "placed", label: "Placed" },
                      { value: "not_placed", label: "Not Placed" },
                    ]}
                    value={field.value || null}
                    onChange={(option) => {
                      field.onChange(option);
                      setSelectedPlacementStatus(option?.value || "");
                    }}
                    placeholder="Select Status"
                    isClearable={true}
                  />
                )}
              />
            </div>
          )}

          {/* University Filter - Only for admin */}
          {isAdminRole && (
            <div className="w-full">
              <Controller
                name="university"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    options={universityOptions}
                    value={universityOptions.find(
                      (option) => option.value === selectedUniversity
                    )}
                    onChange={(option) => {
                      field.onChange(option);
                      setSelectedUniversity(option.value);
                      setSelectedDegree("");
                      setSelectedBranch("");
                    }}
                    placeholder="Select University"
                  />
                )}
              />
            </div>
          )}

          {/* Degree Filter */}
          <div className="w-full">
            <Controller
              name="degree"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  options={degreeOptions}
                  value={field.value || null}
                  onChange={(option) => {
                    field.onChange(option);
                    setSelectedDegree(option?.value || "");
                    setSelectedBranch("");
                  }}
                  placeholder="Select Degree"
                  isClearable={true}
                />
              )}
            />
          </div>

          {/* Branch Filter */}
          <div className="w-full">
            <Controller
              name="branch"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  options={branchOptions}
                  value={field.value || null}
                  onChange={(option) => {
                    field.onChange(option);
                    setSelectedBranch(option?.value || "");
                    setSelectedSection("");
                  }}
                  placeholder="Select Branch"
                  isDisabled={!selectedDegree}
                  isClearable={true}
                />
              )}
            />
          </div>

          {/* Section Filter */}
          <div className="w-full">
            <Controller
              name="section"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  options={sectionOptions}
                  value={field.value || null}
                  onChange={(option) => {
                    field.onChange(option);
                    setSelectedSection(option?.value || "");
                  }}
                  placeholder="Select Section"
                  isDisabled={!selectedBranch}
                  isClearable={true}
                />
              )}
            />
          </div>

          {/* Year Filter */}
          <div className="w-full">
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  options={yearOptions}
                  value={field.value || null}
                  onChange={(option) => {
                    field.onChange(option);
                    setSelectedYear(option?.value || "");
                  }}
                  placeholder="Select Year"
                  isClearable={true}
                />
              )}
            />
          </div>
        </div>

        {/* Search and Sort Section */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <X size={16} />
              Reset Filters
            </motion.button>
          )}

          {/* Sort Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() =>
                setSortConfig({
                  key: "name",
                  direction: sortConfig.direction === "asc" ? "desc" : "asc",
                })
              }
              className={`px-4 py-2 rounded-lg border ${
                sortConfig.key === "name"
                  ? "bg-indigo-500 text-white"
                  : "border-gray-300 hover:border-indigo-500"
              }`}
            >
              Sort by Name{" "}
              {sortConfig.key === "name" &&
                (sortConfig.direction === "asc" ? (
                  <SortAsc className="inline" size={16} />
                ) : (
                  <SortDesc className="inline" size={16} />
                ))}
            </button>
            <button
              onClick={() =>
                setSortConfig({
                  key: "rollNumber",
                  direction: sortConfig.direction === "asc" ? "desc" : "asc",
                })
              }
              className={`px-4 py-2 rounded-lg border ${
                sortConfig.key === "rollNumber"
                  ? "bg-indigo-500 text-white"
                  : "border-gray-300 hover:border-indigo-500"
              }`}
            >
              Sort by Roll No.{" "}
              {sortConfig.key === "rollNumber" &&
                (sortConfig.direction === "asc" ? (
                  <SortAsc className="inline" size={16} />
                ) : (
                  <SortDesc className="inline" size={16} />
                ))}
            </button>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredAndSortedStudents.map((student, index) => (
          <motion.div
            key={student.rollNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
          >
            {/* Student Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 break-words">
                  {student?.name || "Not Specified by the User"}
                </h3>
                <p className="text-gray-600">
                  {student?.rollNumber || "Not Specified by the User"}
                </p>
              </div>
              <GraduationCap
                className="text-indigo-500 flex-shrink-0 ml-2"
                size={24}
              />
            </div>

            {/* Student Details */}
            <div className="mt-4 space-y-2">
              <p className="text-gray-600 break-words">
                <span className="font-medium">Email:</span>{" "}
                {student?.email || "Not Specified by the User"}
              </p>
              {isAdminRole && (
                <p className="text-gray-600">
                  <span className="font-medium">University:</span>{" "}
                  {student?.university || "Not Specified by the User"}
                </p>
              )}
              <p className="text-gray-600">
                <span className="font-medium">Degree:</span>{" "}
                {student?.degree || "Not Specified by the User"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Branch:</span>{" "}
                {student?.branch || "Not Specified by the User"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Section:</span>{" "}
                {student.section || "N/A"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Graduation Year:</span>{" "}
                {student?.graduationYear || "N/A"}
              </p>

              {/* Placement Status - Only for placement roles */}

              {isPlacementRole && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Placement Offers</h4>
                  <div className="space-y-2">
                    {isPlacementRole && (
                      <div className="mt-4">
                        {/* Display company bubbles */}
                        {student.placement?.isPlaced &&
                          student.placement?.offers && (
                            <PlacementBubbles
                              offers={student.placement.offers}
                            />
                          )}

                        {/* Safe access to offers array */}
                        {student.placement?.offers?.map((offer) => (
                          <div
                            key={offer._id}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <p className="font-medium">
                                {offer?.company || "Not Specified by the user"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {offer.role}
                              </p>
                              <p className="text-sm text-gray-600">
                                {offer.ctc} LPA
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* View Profile Button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => navigate(`/student/${student.id}`)}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <UserCircle className="mr-2" size={20} />
                  <span>View Profile</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedStudents.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <Users className="mx-auto mb-4" size={48} />
          <p>No students found matching the current filters.</p>
        </div>
      )}
    </div>
  );
};

export default StudentList;
