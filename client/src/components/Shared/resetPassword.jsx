import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import validator from "validator";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import LoadingOverlay from "../Global/LoadingOverlay";

// API function for password reset
const resetPasswordApi = async (data) => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_API_URL}/resetPassword/${data.token}`,
    { password: data.password }
  );
  return response.data;
};

// API function to validate reset token
const validateResetTokenApi = async (token) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_API_URL}/validate-reset-token/${token}`
  );
  return response.data;
};

const passwordStrengthRules = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};

const ResetPassword = () => {
  const { id: token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValidationError, setTokenValidationError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    numbers: false,
    symbols: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const { isLoading: isValidating, isError } = useQuery({
    queryKey: ["validateResetToken", token],
    queryFn: () => validateResetTokenApi(token),
    enabled: !!token,
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: (data) => {
      toast.success(data.message);
      reset();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Password reset failed. Please try again."
      );
    },
  });

  const password = watch("password");

  useEffect(() => {
    if (!password) {
      setPasswordStrength({
        length: false,
        lowercase: false,
        uppercase: false,
        numbers: false,
        symbols: false,
      });
      return;
    }

    setPasswordStrength({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /[0-9]/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const onSubmit = (data) => {
    if (!validator.isStrongPassword(data.password, passwordStrengthRules)) {
      toast.error("Password does not meet strength requirements");
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    mutate({
      token,
      password: data.password,
    });
  };

  if (isValidating) {
    return <LoadingOverlay />;
  }

  // If token is not valid, show an error message
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-8 rounded-lg shadow-md text-center max-w-md"
        >
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Token Validation Failed
          </h2>
          <p className="text-gray-600 mb-4">
            {tokenValidationError ||
              "The password reset link is no longer valid."}
          </p>
          <p className="text-sm text-gray-500">
            Possible reasons: • Link has expired • Link has already been used •
            Link is incorrect
          </p>
          <p className="mt-4 inline-block text-black-500">
            Request a new password reset link
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <label htmlFor="password" className="block mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                {...register("password", {
                  required: "Password is required",
                  validate: (value) =>
                    validator.isStrongPassword(value, passwordStrengthRules) ||
                    "Password does not meet strength requirements",
                })}
                className="w-full p-2 border rounded pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Strength Indicators */}
            <AnimatePresence>
              <div className="mt-2 space-y-1">
                {Object.entries(passwordStrength).map(([key, value]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center space-x-2"
                  >
                    {value ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    <span className="text-sm">
                      {key === "length" && "At least 8 characters"}
                      {key === "lowercase" && "At least one lowercase letter"}
                      {key === "uppercase" && "At least one uppercase letter"}
                      {key === "numbers" && "At least one number"}
                      {key === "symbols" && "At least one special character"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.password.message}
              </motion.p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className="w-full p-2 border rounded"
            />
            {errors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
