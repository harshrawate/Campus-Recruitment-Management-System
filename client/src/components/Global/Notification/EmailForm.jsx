import React from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";

const EmailForm = ({
  students,
  notificationType,
  onBack,
  onSuccess,
  onError,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      subject: "",
      content: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_API_URL}/faculty/notifications/email`,
        {
          studentIds: students,
          subject: data.subject,
          content: data.content,
          notificationType,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userCookie")}`,
          },
        }
      );

      onSuccess();
      reset();
    } catch (error) {
      onError();
      console.error("Failed to send email notification:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <input
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            errors.subject ? "border-red-500" : "border-gray-300"
          }`}
          {...register("subject", {
            required: "Subject is required",
            maxLength: {
              value: 255,
              message: "Subject cannot exceed 255 characters",
            },
          })}
          aria-invalid={errors.subject ? "true" : "false"}
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          className={`w-full px-4 py-2 border rounded-lg h-32 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            errors.content ? "border-red-500" : "border-gray-300"
          }`}
          {...register("content", {
            required: "Content is required",
            minLength: {
              value: 10,
              message: "Content should be at least 10 characters",
            },
            maxLength: {
              value: 5000,
              message: "Content cannot exceed 5000 characters",
            },
          })}
          aria-invalid={errors.content ? "true" : "false"}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {students.length} recipient{students.length !== 1 ? "s" : ""}
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
              isSubmitting
                ? "bg-gray-400"
                : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:shadow-lg"
            }`}
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Sending..." : "Send Email"}
          </motion.button>
        </div>
      </div>
    </form>
  );
};

export default EmailForm;
