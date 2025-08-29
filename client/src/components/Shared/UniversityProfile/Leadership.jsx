import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Loader2 } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import FacultyCard from "./FacultyCard";
import Modal from "../../Global/Modal";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getUserRole } from "../../../utils/auth";
import NoItems from "../../Global/noItems";

const Leadership = ({ headFaculty, coordinators, universityId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);
  const [newFacultyRole, setNewFacultyRole] = useState("Coordinator");

  const itemsPerPage = 4;
  const jwtToken = Cookies.get("userCookie");
  const queryClient = useQueryClient();

  const userRole = getUserRole();
  const hasAdminAccess = ["super admin", "admin"].includes(userRole);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
    },
  });

  const addFacultyMutation = useMutation({
    mutationFn: async (newFacultyData) => {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_API_URL}/admin/faculty`,
        {
          ...newFacultyData,
          universityId,
        },
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["university", universityId]);
      toast.success(`${data.message}`);
      reset();
      setIsAddFacultyModalOpen(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to add faculty member"
      );
    },
  });

  const filteredCoordinators = coordinators.filter(
    (faculty) =>
      faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCoordinators.length / itemsPerPage);
  const paginatedCoordinators = filteredCoordinators.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const onSubmit = (data) => {
    addFacultyMutation.mutate({
      ...data,
      role: newFacultyRole,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Leadership</h2>
        {hasAdminAccess && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            onClick={() => setIsAddFacultyModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Faculty
          </button>
        )}
      </div>

      {/* Head Profile */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-4">
          Head of Institution
        </h3>
        {headFaculty.length !== 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {headFaculty.map((faculty) => (
              <FacultyCard
                key={faculty._id}
                faculty={faculty}
                universityId={universityId}
              />
            ))}
          </div>
        ) : (
          <NoItems />
        )}
      </div>

      {/* Coordinators */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-indigo-600">
            Coordinators
          </h3>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        {paginatedCoordinators.length !== 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedCoordinators.map((faculty) => (
              <FacultyCard
                key={faculty._id}
                faculty={faculty}
                universityId={universityId}
              />
            ))}
          </div>
        ) : (
          <>
            <NoItems />
          </>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 border rounded-md ${
                  currentPage === index + 1
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {hasAdminAccess && isAddFacultyModalOpen && (
        <Modal
          title="Add New Faculty"
          onClose={() => {
            if (!addFacultyMutation.isLoading) {
              reset();
              setIsAddFacultyModalOpen(false);
            }
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                placeholder="Dr. Jane Smith"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.name ? "border-red-500" : ""
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="jane.smith@university.edu"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="9870654321"
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^\d+$/,
                    message: "Invalid phone number",
                  },
                })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.phoneNumber ? "border-red-500" : ""
                }`}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={newFacultyRole}
                onChange={(e) => setNewFacultyRole(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="Head">Head</option>
                <option value="Coordinator">Coordinator</option>
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  if (!addFacultyMutation.isLoading) {
                    reset();
                    setIsAddFacultyModalOpen(false);
                  }
                }}
                disabled={addFacultyMutation.isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addFacultyMutation.isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {addFacultyMutation.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Faculty"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Leadership;
