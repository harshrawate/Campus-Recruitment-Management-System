// FacultyCard.jsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Mail,
  Phone,
  Users,
  History,
  Key,
  Power,
  Edit,
  Trash2,
  Clock,
  Eye,
  EyeOff,
  Wand2,
} from "lucide-react";
import Modal from "../../Global/Modal";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getUserRole, getUserId } from "../../../utils/auth";

const FacultyCard = ({ faculty, universityId }) => {
  const [isLoginHistoryModalOpen, setIsLoginHistoryModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const jwtToken = Cookies.get("userCookie");
  const queryClient = useQueryClient();
  const userRole = getUserRole();
  const currentUserId = getUserId();
  const hasAdminAccess =
    ["super admin", "admin", "head"].includes(userRole) &&
    currentUserId !== faculty._id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const generateRandomPassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    setValue("newPassword", password);
    setValue("confirmPassword", password);
    return password;
  };

  const passwordMutation = useMutation({
    mutationFn: async ({ newPassword, confirmPassword }) => {
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_API_URL}/admin/faculty/updatePassword/${faculty._id}`,
        { password: newPassword },
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
          "Content-Type": "application/json",
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setIsPasswordModalOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_API_URL}/admin/faculty/${faculty._id}/toggleStatus`,
        {},
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["university", universityId]);
      setIsDeactivateModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  const editMutation = useMutation({
    mutationFn: async (updatedData) => {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_API_URL}/admin/faculty/${faculty._id}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["university", universityId]);
      setIsEditModalOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (deleteConfirmText !== "DELETE") {
        throw new Error("Please type DELETE to confirm");
      }
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_API_URL}/admin/faculty/${faculty._id}`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["university", universityId]);
      setIsDeleteModalOpen(false);
      setDeleteConfirmText("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const onPasswordSubmit = (data) => {
    passwordMutation.mutate({
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
    reset();
  };

  const onEditSubmit = (data) => {
    editMutation.mutate({
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
    });
    reset();
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 h-[200px] w-full flex flex-col">
      <div className="flex flex-col h-full">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-grow">
          <div className="bg-indigo-100 rounded-full p-3 self-start flex-shrink-0">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
          </div>
          <div className="space-y-2 w-full min-w-0">
            <h4 className="text-base sm:text-lg font-medium text-gray-900 break-words">
              {faculty.name}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{faculty.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{faculty.phoneNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-8 mt-auto">
          {hasAdminAccess && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsLoginHistoryModalOpen(true)}
                className="flex items-center gap-1 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800"
              >
                <History className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Login History</span>
              </button>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex items-center gap-1 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800"
              >
                <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Change Password</span>
              </button>
              <button
                onClick={() => setIsDeactivateModalOpen(true)}
                className="flex items-center gap-1 text-xs sm:text-sm text-red-600 hover:text-red-800"
              >
                <Power className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">
                  {faculty.isAccountDeactivated ? "Activate" : "Deactivate"}
                </span>
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800"
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Edit Details</span>
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1 text-xs sm:text-sm text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {hasAdminAccess && (
        <>
          {isLoginHistoryModalOpen && (
            <Modal
              title="Login History"
              onClose={() => setIsLoginHistoryModalOpen(false)}
            >
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {faculty?.loginTimestamps?.length > 0 ? (
                  faculty.loginTimestamps.map((timestamp, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs sm:text-sm text-gray-600"
                    >
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="break-all">
                        {formatTimestamp(timestamp)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No login history available</p>
                )}
              </div>
            </Modal>
          )}

          {isPasswordModalOpen && (
            <Modal
              title="Change Password"
              onClose={() => setIsPasswordModalOpen(false)}
            >
              <form
                onSubmit={handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <label
                      htmlFor="newPassword"
                      className="block text-xs sm:text-sm font-medium text-gray-700"
                    >
                      New Password
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        {...register("newPassword", { required: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-red-600 text-xs sm:text-sm">
                        Password is required
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs sm:text-sm font-medium text-gray-700"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        {...register("confirmPassword", { required: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-600 text-xs sm:text-sm">
                        Confirmation is required
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                  >
                    <Wand2 className="h-4 w-4" />
                    Generate Password
                  </button>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passwordMutation.isLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 text-sm w-full sm:w-auto"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </form>
            </Modal>
          )}

          {isEditModalOpen && (
            <Modal
              title="Edit Faculty Details"
              onClose={() => setIsEditModalOpen(false)}
            >
              <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
                <div>
                  <label
                    htmlFor="facultyName"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="facultyName"
                    defaultValue={faculty.name}
                    {...register("name", { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs sm:text-sm">
                      Name is required
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="facultyEmail"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="facultyEmail"
                    defaultValue={faculty.email}
                    {...register("email", { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs sm:text-sm">
                      Email is required
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="facultyPhone"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="facultyPhone"
                    defaultValue={faculty.phoneNumber}
                    {...register("phoneNumber", { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-600 text-xs sm:text-sm">
                      Phone number is required
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editMutation.isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 text-sm w-full sm:w-auto"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {isDeactivateModalOpen && (
            <Modal
              title="Confirm Deactivation"
              onClose={() => setIsDeactivateModalOpen(false)}
            >
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Are you sure you want to{" "}
                  {faculty.isAccountDeactivated ? "activate" : "deactivate"}{" "}
                  this faculty member's account?
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setIsDeactivateModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deactivateMutation.mutate()}
                    disabled={deactivateMutation.isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 text-sm w-full sm:w-auto"
                  >
                    {faculty.isAccountDeactivated ? "Activate" : "Deactivate"}
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {isDeleteModalOpen && (
            <Modal
              title="Confirm Deletion"
              onClose={() => setIsDeleteModalOpen(false)}
            >
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Please type "DELETE" to confirm deletion.
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate()}
                    disabled={
                      deleteConfirmText !== "DELETE" || deleteMutation.isLoading
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 text-sm w-full sm:w-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default FacultyCard;
