import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { PiStudentBold } from "react-icons/pi";
import { useForm, Controller } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react"; // Import Lucide React icons
import DecorativeBackground from "./DecorativeBackground";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { setTokenAndRole } from "../../../redux/authSlice";

const FormField = React.memo(
  ({
    control,
    name,
    type,
    label,
    disabled,
    placeholder,
    initialAnimation,
    endAdornment,
  }) => (
    <motion.div
      initial={initialAnimation}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        rules={{
          required: `${label} is required`,
          ...(name === "email" && {
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          }),
        }}
        render={({ field, fieldState: { error } }) => (
          <>
            <div className="relative">
              <input
                {...field}
                type={type}
                id={name}
                className={`mt-1 block w-full px-3 py-2 bg-gray-50 border ${
                  error ? "border-red-500" : "border-gray-300"
                } rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300`}
                placeholder={placeholder}
                disabled={disabled}
              />
              {endAdornment && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1">
                  {endAdornment}
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
          </>
        )}
      />
    </motion.div>
  )
);

const ErrorAlert = React.memo(({ message }) => (
  <Alert variant="destructive" className="mb-4">
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
));

const StudentLoginForm = React.memo(({ onSubmit, isPending, error }) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  // Add state for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Toggle password visibility handler
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <ErrorAlert message={error} />}
      <FormField
        control={control}
        name="email"
        type="email"
        label="Student Email"
        placeholder="Enter your student email"
        disabled={isPending}
        initialAnimation={{ x: -50, opacity: 0 }}
      />
      <FormField
        control={control}
        name="password"
        type={showPassword ? "text" : "password"}
        label="Password"
        placeholder="Enter your password"
        disabled={isPending}
        initialAnimation={{ x: 50, opacity: 0 }}
        endAdornment={
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff size={18} className="text-gray-500" />
            ) : (
              <Eye size={18} className="text-gray-500" />
            )}
          </button>
        }
      />
      <motion.button
        type="submit"
        whileHover={{ scale: isPending ? 1 : 1.05 }}
        whileTap={{ scale: isPending ? 1 : 0.95 }}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isPending}
      >
        {isPending ? "Logging in..." : "Log In"}
      </motion.button>
    </form>
  );
});

const StudentLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = Cookies.get("userCookie");
    if (token) {
      navigate("/student/dashboard");
    }
  }, [navigate]);

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API_URL}/student/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      return data;
    },
    onSuccess: async (data) => {
      Cookies.set("userCookie", data.data.token, { expires: 1 });
      dispatch(
        setTokenAndRole({
          token: data.data.token,
        })
      );
      await navigate(data.redirect);
    },
  });

  const handleSubmit = useCallback(
    (data) => {
      loginMutation.mutate(data);
    },
    [loginMutation]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden p-4">
      <DecorativeBackground />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md z-10 relative"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <PiStudentBold className="text-white text-4xl" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold mb-6 text-center text-gray-800"
        >
          Student Login
        </motion.h2>
        <StudentLoginForm
          onSubmit={handleSubmit}
          isPending={loginMutation.isPending}
          error={loginMutation.error?.message}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <p>
            <a
              href="/forgot-password?role=student"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-300"
            >
              Forgot Password?
            </a>
          </p>
          <p>
            Not a registered user?{" "}
            <a
              href="/student/create-profile"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-300"
            >
              Create account
            </a>
          </p>
          <p>
            Not a student?{" "}
            <a
              href="/login/faculty"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-300"
            >
              Login as a faculty
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default React.memo(StudentLogin);
