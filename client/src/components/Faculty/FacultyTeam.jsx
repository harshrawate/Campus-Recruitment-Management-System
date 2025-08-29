import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Search, Plus, Mail, Phone, Book } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import LoadingOverlay from "../Global/LoadingOverlay";
import ErrorOverlay from "../Global/ErrorOverlay";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Modal from "../Global/Modal";
import { getUserId } from "../../utils/auth";
import NoItems from "../Global/noItems";

const FacultyTeam = () => {
  const [filter, setFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();
  const jwtToken = Cookies.get("userCookie");
  const currentUserId = getUserId();

  const filterOptions = ["All", "Head", "Coordinator"];

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["faculty", "team"],
    queryFn: async () => {
      const response = await axios.get(
        import.meta.env.VITE_SERVER_API_URL + "/faculty/team",
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchInterval: 5000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const faculty = response?.faculty || [];

  const handleViewProfile = (faculty) => {
    setSelectedFaculty(faculty);
    setIsProfileModalOpen(true);
  };

  const addFaculty = async (newFacultyData) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_API_URL + "/faculty/add/team",
        newFacultyData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to add faculty member");
    }
  };

  const addFacultyMutation = useMutation({
    mutationFn: addFaculty,
    onMutate: async (newFaculty) => {
      await queryClient.cancelQueries(["faculty", "team"]);
      const previousFaculty = queryClient.getQueryData(["faculty", "team"]);
      queryClient.setQueryData(["faculty", "team"], (old) => [
        ...(old || []),
        { ...newFaculty, _id: String((old || []).length + 1) },
      ]);
      return { previousFaculty };
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error, _newFaculty, context) => {
      queryClient.setQueryData(["faculty", "team"], context.previousFaculty);
      toast.error(error.response?.data?.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["faculty", "team"]);
    },
  });

  // Then update the handleAddFaculty function to use addFacultyMutation.mutate:
  const handleAddFaculty = async (data) => {
    try {
      addFacultyMutation.mutate(data);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredFaculty = faculty
    .filter((member) => filter === "All" || member?.position === filter)
    .filter(
      (member) =>
        (member?.name?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (member?.position?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (member?.department?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        )
    )
    .sort((a, b) => {
      if (a._id === currentUserId) return -1;
      if (b._id === currentUserId) return 1;
      return 0;
    });

  if (isLoading) return <LoadingOverlay />;

  if (isError) {
    if (error?.response?.status === 401)
      return <ErrorOverlay statusCode={401} />;
    console.error(error);
  }

  return (
    <div className="p-8 space-y-8 pt-4 bg-gray-50 min-h-screen">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-indigo-600">
            Faculty Members
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Faculty
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="search"
              placeholder="Search by name, position, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          <div className="relative w-64">
            <select
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {filterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>

      {filteredFaculty.length !== 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map((member) => (
              <FacultyCard
                key={member._id}
                faculty={member}
                onViewProfile={() => handleViewProfile(member)}
                isCurrentUser={member._id === currentUserId}
              />
            ))}
          </div>

          <AnimatePresence>
            {isProfileModalOpen && selectedFaculty && (
              <ProfileModal
                onClose={() => setIsProfileModalOpen(false)}
                faculty={selectedFaculty}
              />
            )}
          </AnimatePresence>
        </>
      ) : (
        <>
          <NoItems />
          <AnimatePresence>
            {isAddModalOpen && (
              <AddFacultyModal
                onClose={() => setIsAddModalOpen(false)}
                onAddFaculty={handleAddFaculty}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

const FacultyCard = ({ faculty, onViewProfile, isCurrentUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
    >
      <div className="h-48 overflow-hidden bg-indigo-50">
        <img
          src={faculty.image}
          alt={faculty.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {faculty.name}
            </h2>
            <p className="text-indigo-600 font-medium">{faculty.position}</p>
            <p className="text-gray-600 text-sm">{faculty.department}</p>
          </div>
        </div>

        <div className="mt-4">
          {isCurrentUser ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              You
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={onViewProfile}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                View Profile
              </button>
              <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition duration-300">
                Message
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AddFacultyModal = ({ onClose, onAddFaculty }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      onAddFaculty(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal onClose={onClose} title="Add New Faculty Member">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            {...register("name", { required: true })}
            className={`mt-1 w-full rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-500 ${
              errors.name ? "border-red-500" : ""
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">Name is required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            {...register("email", { required: true })}
            className={`mt-1 w-full rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-500 ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">Email is required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Position
          </label>
          <select
            {...register("position", { required: true })}
            className={`mt-1 w-full rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-500 ${
              errors.position ? "border-red-500" : ""
            }`}
          >
            <option value="">Select a position</option>
            <option value="Professor">Head</option>
            <option value="Associate Professor">Coordinator</option>
          </select>
          {errors.position && (
            <p className="mt-1 text-sm text-red-500">Position is required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <input
            type="text"
            {...register("department", { required: true })}
            className={`mt-1 w-full rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-500 ${
              errors.department ? "border-red-500" : ""
            }`}
          />
          {errors.department && (
            <p className="mt-1 text-sm text-red-500">Department is required</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Add Faculty Member
        </button>
      </form>
    </Modal>
  );
};

const ProfileModal = ({ onClose, faculty }) => {
  return (
    <Modal onClose={onClose} title="Faculty Profile">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <img
            src={faculty.image}
            alt={faculty.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {faculty.name}
            </h3>
            <p className="text-indigo-600">{faculty.position}</p>
            <p className="text-gray-600">{faculty.department}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-gray-600">
            <Mail className="h-5 w-5" />
            <span>{faculty.email}</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600">
            <Phone className="h-5 w-5" />
            <span>{faculty.phone}</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600">
            <Book className="h-5 w-5" />
            <span>{faculty.specialization}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300">
            Edit Profile
          </button>
          <button className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition duration-300">
            Send Message
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FacultyTeam;
