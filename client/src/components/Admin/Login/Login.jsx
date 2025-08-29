import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { setTokenAndRole } from "../../../redux/authSlice";
import CompanyBackground from "./DecorativeBackground";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";

const FormField = React.memo(
  ({
    control,
    name,
    type,
    label,
    error,
    disabled,
    placeholder,
    initialAnimation,
    endIcon,
  }) => {
    return (
      <motion.div
        initial={initialAnimation}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="relative">
          <input
            type={type}
            id={name}
            {...control.register(name, {
              required: `${label} is required`,
              ...(name === "email" && {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }),
            })}
            className={`mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border ${
              error ? "border-red-500" : "border-gray-300"
            } rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-300`}
            placeholder={placeholder}
            disabled={disabled}
          />
          {endIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1">
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 text-sm text-red-500"
          >
            {error.message}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

const ErrorAlert = React.memo(({ message }) => (
  <Alert variant="destructive" className="mb-4">
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
));

const AdminLoginForm = React.memo(
  ({ onSubmit, isPending, error, control, errors }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const formInputs = React.useMemo(
      () => [
        {
          name: "email",
          type: "text",
          label: "Email",
          placeholder: "Enter your email id",
          initialAnimation: { x: -50, opacity: 0 },
        },
        {
          name: "password",
          type: showPassword ? "text" : "password",
          label: "Password",
          placeholder: "Enter your password",
          initialAnimation: { x: 50, opacity: 0 },
          endIcon: (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-500 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff size={20} className="text-gray-500" />
              ) : (
                <Eye size={20} className="text-gray-500" />
              )}
            </button>
          ),
        },
      ],
      [showPassword]
    );

    return (
      <form onSubmit={onSubmit} className="space-y-6">
        {error && <ErrorAlert message={error} />}
        {formInputs.map((input) => (
          <FormField
            key={input.name}
            control={control}
            error={errors[input.name]}
            disabled={isPending}
            {...input}
          />
        ))}
        <motion.button
          type="submit"
          whileHover={{ scale: isPending ? 1 : 1.05 }}
          whileTap={{ scale: isPending ? 1 : 0.95 }}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300 ${
            isPending ? "opacity-75 cursor-not-allowed" : ""
          }`}
          disabled={isPending}
        >
          {isPending ? "Signing in..." : "Sign In"}
        </motion.button>
      </form>
    );
  }
);

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authToken = useSelector((state) => state.auth.token);

  React.useEffect(() => {
    if (authToken || Cookies.get("userCookie")) {
      navigate("/admin/dashboard");
    }
  }, [authToken, navigate]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_API_URL}/admin/login`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      Cookies.set("userCookie", data.token);
      dispatch(
        setTokenAndRole({
          token: data.token,
        })
      );
      toast.success(data.message);
      navigate("/admin/dashboard");
      reset();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
    },
  });

  const onSubmit = React.useCallback(
    (data) => {
      loginMutation.mutate(data);
    },
    [loginMutation]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden p-4">
      <CompanyBackground />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-xl w-full max-w-md z-10 relative"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mx-auto mb-6 flex items-center justify-center transform rotate-45"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-white transform -rotate-45"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold mb-6 text-center text-gray-800"
        >
          Admin Login
        </motion.h2>
        <AdminLoginForm
          onSubmit={handleSubmit(onSubmit)}
          isPending={loginMutation.isPending}
          error={
            loginMutation.error?.response?.data?.message ||
            loginMutation.error?.message
          }
          control={control}
          errors={errors}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <p>
            <a
              href="/forgot-password?role=admin"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-300"
            >
              Forgot Password?
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default React.memo(AdminLogin);
