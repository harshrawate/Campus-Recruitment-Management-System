import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Mail,
  Phone,
  GraduationCap,
  History,
  Key,
  Power,
  Trash2,
  Clock,
  Eye,
  EyeOff,
  Wand2,
  Loader2,
  Book,
  BookOpen,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getUserRole } from "../../../utils/auth";
import Modal from "../../Global/Modal";

const StudentCard = ({ student, universityId }) => {
  const [isLoginHistoryModalOpen, setIsLoginHistoryModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const jwtToken = Cookies.get("userCookie");
  const queryClient = useQueryClient();
  const userRole = getUserRole();
  const hasAdminAccess = ["super admin", "admin", "head"].includes(userRole);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm();

  const passwordMutation = useMutation({
    mutationFn: async (data) => {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_API_URL}/admin/student/updatePassword/${student._id}`,
        { password: data.newPassword },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Password updated successfully");
      setIsPasswordModalOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (deleteConfirmText !== "DELETE") {
        throw new Error('Please type "DELETE" to confirm');
      }
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_API_URL}/admin/student/${student._id}`,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Student deleted successfully");
      queryClient.invalidateQueries(["university", universityId]);
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete student");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_API_URL}/admin/student/${student._id}/toggleStatus`,
        {},
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["university", universityId]);
      setIsDeactivateModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  if (!student || typeof student !== "object") {
    return null;
  }

  const {
    personal = {},
    academic = {},
    auth = {}, // _id = "",
  } = student;

  const {
    firstName = "",
    lastName = "",
    collegeEmail = "",
    whatsappNumber = "",
  } = personal;

  const {
    rollNumber = "",
    branch = "",
    section = "",
    degreeProgram = "",
    graduationYear = "",
  } = academic;

  const { isProfileComplete, status, loginHistory, isDeactivated } = auth;

  const generateRandomPassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    setValue("newPassword", password);
    setValue("confirmPassword", password);
  };

  const onPasswordSubmit = (data) => {
    passwordMutation.mutate(data);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow p-6 transition-all hover:shadow-md">
      <div className="flex flex-col h-full">
        {/* Header Section - Keep existing code */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 rounded-full p-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {firstName} {lastName}
              </h3>
              <p className="text-sm text-gray-500">
                {rollNumber || "Not Specified by the User"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                isDeactivated
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {isDeactivated ? "Inactive" : "Active"}
            </span>
          </div>
        </div>

        {/* Content Grid - Updated with auth information */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Contact Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Contact</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {collegeEmail || "No email available"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{whatsappNumber || "No phone number"}</span>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Academic</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <BookOpen className="h-4 w-4 flex-shrink-0" />
              <span>
                {branch || "Not Select by the Student"} - Section{" "}
                {section || "Not Select by the Student"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Book className="h-4 w-4 flex-shrink-0" />
              <span>
                {degreeProgram || "Not Select by the Student"} •{" "}
                {graduationYear || "Not Select by the Student"}
              </span>
            </div>
          </div>

          {/* Auth Information - New Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Account</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {isProfileComplete ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              <span>
                Profile {isProfileComplete ? "Complete" : "Incomplete"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                Last login:{" "}
                {loginHistory.length > 0
                  ? formatTimestamp(loginHistory[loginHistory.length - 1])
                  : "Never"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Key className="h-4 w-4 flex-shrink-0" />
              <span>Status: {status || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Keep existing code */}
        {hasAdminAccess && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsLoginHistoryModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <History className="h-4 w-4 mr-1.5" />
                Login History
              </button>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <Key className="h-4 w-4 mr-1.5" />
                Change Password
              </button>
              <button
                onClick={() => setIsDeactivateModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
              >
                <Power className="h-4 w-4 mr-1.5" />
                {isDeactivated ? "Activate" : "Deactivate"}
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Login History Modal */}
      {isLoginHistoryModalOpen && (
        <Modal
          title="Login History"
          onClose={() => setIsLoginHistoryModalOpen(false)}
        >
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loginHistory.length > 0 ? (
              loginHistory.map((timestamp, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{formatTimestamp(timestamp)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No login history available</p>
            )}
          </div>
        </Modal>
      )}

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <Modal
          title="Change Password"
          onClose={() => setIsPasswordModalOpen(false)}
        >
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("newPassword", {
                      required: "Password is required",
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword", {
                      required: "Please confirm password",
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={generateRandomPassword}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Wand2 className="h-4 w-4" />
              Generate Password
            </button>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordMutation.isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {passwordMutation.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Change Password"
                )}
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
              {student.isAccountDeactivated ? "activate" : "deactivate"} this
              faculty member's account?
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
                {student.isAccountDeactivated ? "Activate" : "Deactivate"}
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
    </div>
  );
};

export default StudentCard;
