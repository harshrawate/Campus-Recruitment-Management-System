import React, { useState } from "react";
import { Search, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import Modal from "../Global/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import LoadingOverlay from "../Global/LoadingOverlay";
import ErrorOverlay from "../Global/ErrorOverlay";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import NoItems from "../Global/noItems";

const AdminUniversity = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const jwtToken = Cookies.get("userCookie");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const {
    data: universities = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin", "university"],
    queryFn: async () => {
      const response = await axios.get(
        import.meta.env.VITE_SERVER_API_URL + "/admin/university",
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      return response.data.data || [];
    },
    enabled: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchInterval: 5000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const addUniversity = async (formData) => {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_API_URL}/admin/add/university`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  };

  const { mutate } = useMutation({
    mutationFn: addUniversity,
    onSuccess: (data) => {
      toast.success("University added successfully");
      setIsAddModalOpen(false);
      reset();
    },
    onError: (error) => {
      console.log(error.response.data)
      toast.error(error.response?.data?.message || "Failed to add university");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["admin", "university"]);
    },
  });

  const handleAddUniversity = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("address", data.address);
      formData.append("website", data.website);
      formData.append("email", data.email);

      if (data.logo?.[0]) {
        formData.append("logo", data.logo[0]);
      }

      if (data.head) {
        const headData = {
          name: data.head.name,
          email: data.head.email,
          phone: data.head.phone,
        };
        formData.append("head", JSON.stringify(headData));
      }

      mutate(formData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add university");
    }
  };

  const filteredUniversities =
    universities?.filter((university) => {
      if (!university?.name) return false;

      return university.name.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [];

  if (isLoading) return <LoadingOverlay />;

  if (isError) {
    if (error?.response?.status === 401)
      return <ErrorOverlay statusCode={401} />;
    console.error(error);
  }

  return (
    <div className="p-8 space-y-8 pt-4 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-indigo-600">
            Universities
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add University
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="search"
              placeholder="Search universities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>
      {filteredUniversities.length !== 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((university) => (
              <UniversityCard key={university.id} university={university} />
            ))}
          </div>
        </>
      ) : (
        <>
          <NoItems />
        </>
      )}
      {/* University Grid */}

      {/* Add University Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <Modal
            onClose={() => setIsAddModalOpen(false)}
            title="Add New University"
          >
            <form
              onSubmit={handleSubmit(handleAddUniversity)}
              className="space-y-6"
            >
              {/* Basic University Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University Name
                </label>
                <input
                  {...register("name", {
                    required: "University name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  type="text"
                  className="w-full rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter university name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  {...register("address", {
                    required: "Address is required",
                  })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter complete address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  {...register("website", {
                    required: "Website URL is required",
                    pattern: {
                      value: /^https?:\/\/.+\..+/,
                      message: "Please enter a valid URL",
                    },
                  })}
                  type="url"
                  className="w-full rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://www.university.edu"
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.website.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University Email
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                  type="email"
                  className="w-full rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="admissions@university.edu"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University Logo
                </label>
                <div className="mt-1 flex items-center">
                  <div className="w-full">
                    <input
                      {...register("logo", {
                        required: "Logo is required",
                        validate: {
                          acceptedFormats: (files) =>
                            files[0]?.type.startsWith("image/") ||
                            "Only image files are allowed",
                          fileSize: (files) =>
                            files[0]?.size <= 10 * 1024 * 1024 ||
                            "File size must be less than 10MB",
                        },
                      })}
                      type="file"
                      accept="image/*"
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>
                {errors.logo && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.logo.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  PNG, JPG up to 10MB
                </p>
              </div>

              {/* Head Details Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Head Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      {...register("head.name", {
                        required: "Head's name is required",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters",
                        },
                      })}
                      type="text"
                      className="w-full rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter head's name"
                    />
                    {errors.head?.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.head.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      {...register("head.email", {
                        required: "Head's email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Please enter a valid email address",
                        },
                      })}
                      type="email"
                      className="w-full rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="head@university.edu"
                    />
                    {errors.head?.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.head.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      {...register("head.phone", {
                        required: "Head's phone number is required",
                        pattern: {
                          value:
                            /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4}$/,
                          message: "Please enter a valid phone number",
                        },
                      })}
                      type="tel"
                      className="w-full rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="987654321"
                    />
                    {errors.head?.phone && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.head.phone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
                >
                  Add University
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const UniversityCard = ({ university, onViewProfile }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
    >
      <div className="h-48 overflow-hidden bg-indigo-50">
        <img
          src={university.logo}
          alt={university.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {university.name}
            </h2>
            <p className="text-indigo-600 font-medium">{university.type}</p>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => navigate(`/university/${university._id}`)}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            View Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminUniversity;
