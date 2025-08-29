import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import BackButton from "../Global/BackButton";
import { useSearchParams } from "react-router-dom";

const resetPassword = async (email, role) => {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_API_URL}/forgot-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    console.log(error);
    throw new Error(error.message);
  }
  return response.json();
};

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const mutation = useMutation({
    mutationFn: (data) => resetPassword(data.email, role),
    onSuccess: (data) => {
      toast.success(data.message);
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-indigo-500 mb-12">
        Campus Recruitment Gateway
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
          <BackButton />
        </div>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="p-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-indigo-600 text-center">
              Reset Your Password
            </h2>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter your Email Address:
              </label>
              <input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={mutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-md font-medium
                ${
                  mutation.isPending
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-indigo-700"
                }
                transition-colors duration-200`}
            >
              {mutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                </div>
              ) : (
                "Send Email"
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
