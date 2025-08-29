import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import LoadingOverlay from "../../Global/LoadingOverlay";
import ErrorOverlay from "../../Global/ErrorOverlay";
import BackButton from "../../Global/BackButton";
import Modal from "../../Global/Modal";
import UniversityInfo from "./UniversityInfo";
import Leadership from "./Leadership";
import StudentSection from "./StudentSection";
import { toast } from "react-toastify";
import { getUserRole } from "../../../utils/auth";

const UniversityProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const jwtToken = Cookies.get("userCookie");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const userRole = getUserRole();
  const hasAdminAccess = ["super admin", "admin"].includes(userRole);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["university", id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_API_URL}/university/${id}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      return response.data.data;
    },
    enabled: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchInterval: 5000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const editMutation = useMutation({
    mutationFn: async (updatedData) => {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_API_URL}/admin/university/${id}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return response.data;
    },
    onMutate: async (updatedData) => {
      await queryClient.cancelQueries(["university", id]);
      const previousData = queryClient.getQueryData(["university", id]);
      queryClient.setQueryData(["university", id], (old) => ({
        ...old,
        ...updatedData,
      }));
      return { previousData };
    },
    onError: (error, updatedData, context) => {
      queryClient.setQueryData(["university", id], context.previousData);
      toast.error(error.response?.data?.message || "An error occurred");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["university", id]);
      setIsEditModalOpen(false);
      toast.success(data.message || "University updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["university", id]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_API_URL}/admin/university/${id}`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
    },
    onMutate: async () => {
      await queryClient.cancelQueries(["universities"]);
      const previousUniversities = queryClient.getQueryData(["universities"]);

      queryClient.setQueryData(["universities"], (oldData) =>
        oldData ? oldData.filter((university) => university.id !== id) : []
      );

      return { previousUniversities };
    },
    onError: (error, _, context) => {
      if (context?.previousUniversities) {
        queryClient.setQueryData(
          ["universities"],
          context.previousUniversities
        );
      }
      toast.error(
        error.response?.data?.message || "Failed to delete university"
      );
    },
    onSuccess: () => {
      toast.success("University deleted successfully");
      queryClient.invalidateQueries(["universities"]);
      navigate("/admin/universities");
    },
  });

  const handleDelete = () => {
    if (deleteConfirmText === data?.university.name) {
      deleteMutation.mutate();
    }
  };

  const onEditSubmit = (formData) => {
    editMutation.mutate(formData);
  };

  React.useEffect(() => {
    if (isEditModalOpen && data) {
      reset({
        name: data.university.name,
        email: data.university.email,
        website: data.university.website,
        address: data.university.address,
      });
    }
  }, [isEditModalOpen, data, reset]);

  if (isLoading) return <LoadingOverlay />;

  if (isError) {
    if (error?.response?.status === 401)
      return <ErrorOverlay statusCode={401} />;
    return <ErrorOverlay statusCode={500} />;
  }

  const { university, faculties, students, degreePrograms } = data;
  const headFaculty = faculties.filter((faculty) => faculty.role === "Head");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <BackButton />
        <div className="flex gap-4">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Edit className="h-4 w-4" />
            Edit University
          </button>
          {hasAdminAccess && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete University
            </button>
          )}
        </div>
      </div>

      <UniversityInfo
        university={university}
        universityId={id}
        degreePrograms={degreePrograms}
      />

      <Leadership
        headFaculty={headFaculty}
        coordinators={faculties.filter((f) => f.role !== "Head")}
        universityId={id}
      />

      <StudentSection 
      students={students} universityId={id} 

      />

      {isEditModalOpen && (
        <Modal
          title="Edit University Details"
          onClose={() => setIsEditModalOpen(false)}
        >
          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700"
              >
                Website
              </label>
              <input
                {...register("website", {
                  required: "Website is required",
                  pattern: {
                    value: /^https?:\/\/.+\..+/,
                    message: "Invalid website URL",
                  },
                })}
                type="url"
                id="website"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.website.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <textarea
                {...register("address", { required: "Address is required" })}
                id="address"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={editMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editMutation.isPending}
                className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${
                  editMutation.isPending
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {editMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {hasAdminAccess && isDeleteModalOpen && (
        <Modal
          title="Delete University"
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete {university.name}? This action
              cannot be undone.
            </p>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Type <span className="font-semibold">{university.name}</span> to
                confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Type university name to confirm"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={
                  deleteConfirmText !== university.name ||
                  deleteMutation.isPending
                }
                className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${
                  deleteConfirmText === university.name &&
                  !deleteMutation.isPending
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-400 cursor-not-allowed"
                }`}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UniversityProfile;
