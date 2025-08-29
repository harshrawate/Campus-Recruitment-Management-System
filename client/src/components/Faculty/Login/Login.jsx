import React, { useEffect, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import FacultyBackground from "./DecorativeBackground";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { setTokenAndRole } from "../../../redux/authSlice";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";

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

const FacultyLoginForm = React.memo(({ onSubmit, isPending, error }) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const passwordIcon = showPassword ? (
    <Eye
      size={20}
      className="text-gray-500 cursor-pointer hover:text-gray-700"
      onClick={togglePasswordVisibility}
    />
  ) : (
    <EyeOff
      size={20}
      className="text-gray-500 cursor-pointer hover:text-gray-700"
      onClick={togglePasswordVisibility}
    />
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <ErrorAlert message={error} />}
      <FormField
        control={control}
        name="email"
        type="email"
        label="Email"
        placeholder="Enter your email"
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
        endAdornment={passwordIcon}
      />
      <motion.button
        type="submit"
        whileHover={{ scale: isPending ? 1 : 1.05 }}
        whileTap={{ scale: isPending ? 1 : 0.95 }}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 ${
          isPending ? "opacity-75 cursor-not-allowed" : ""
        }`}
        disabled={isPending}
      >
        {isPending ? "Signing in..." : "Sign In"}
      </motion.button>
    </form>
  );
});

const OptimizedFacultyBackground = React.memo(() => {
  const backgroundElements = useMemo(
    () =>
      [...Array(5)].map((_, i) => ({
        color: ["#FDE68A", "#93C5FD", "#C4B5FD", "#6EE7B7", "#FCA5A5"][i],
        width: `${Math.random() * 400 + 200}px`,
        height: `${Math.random() * 400 + 200}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDuration: Math.random() * 10 + 10,
        movement: Math.random() * 100 - 50,
      })),
    []
  );

  return <FacultyBackground elements={backgroundElements} />;
});

const FacultyLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const authToken = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (authToken || Cookies.get("userCookie")) {
      navigate("/faculty/dashboard");
    }
  }, [authToken, navigate]);

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API_URL}/faculty/login`,
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
    onSuccess: (data) => {
      Cookies.set("userCookie", data.token, { expires: 1 });
      dispatch(
        setTokenAndRole({
          token: data.token,
        })
      );
      queryClient.setQueryData(["facultyUser"], data.faculty);
      navigate(`/faculty/dashboard`);
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
      <OptimizedFacultyBackground />
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
          className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
            />
          </svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold mb-6 text-center text-gray-800"
        >
          Faculty Login
        </motion.h2>
        <FacultyLoginForm
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
              href="/forgot-password?role=faculty"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-300"
            >
              Forgot Password?
            </a>
          </p>
          <p>
            Not a faculty?{" "}
            <a
              href="/login/student"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-300"
            >
              Login as a student
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default React.memo(FacultyLogin);
