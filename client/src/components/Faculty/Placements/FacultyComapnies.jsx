import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { PlusCircle, X, Upload, Briefcase } from "lucide-react";
import Cookies from "js-cookie";

const FacultyCompanies = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const { register, handleSubmit, reset, watch } = useForm();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const token = Cookies.get("userCookie");

  const {
    data: companies,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_API_URL}/faculty/companies`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };
      return axios.post(
        `${import.meta.env.VITE_SERVER_API_URL}/faculty/companies`,
        data,
        config
      );
    },
    onSuccess: () => {
      toast.success("Company details saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      reset();
      setOpportunities([]);
      setIsOpen(false);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to save company details.";
      toast.error(message);
    },
  });

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("companyName", data.companyName);
      formData.append("companyLogo", data.companyLogo[0]);
      formData.append("opportunities", JSON.stringify(opportunities));

      await mutation.mutate(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Error submitting form");
    }
  };

  const handleAddOpportunity = (role, pkg) => {
    if (role.trim() && pkg.trim()) {
      setOpportunities([
        ...opportunities,
        { role: role.trim(), package: pkg.trim() },
      ]);
      // Clear input fields after adding
      document.getElementById("role").value = "";
      document.getElementById("package").value = "";
    }
  };

  const removeOpportunity = (index) => {
    setOpportunities(opportunities.filter((_, i) => i !== index));
  };

  const logoPreview = watch("companyLogo");

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">Companies</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-600 transition duration-300 ease-in-out flex items-center"
        >
          <PlusCircle className="mr-2" size={20} />
          Add Company Data
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div
            className="animate-spin rounded-full h-32 w-32 border-t-2 border
-b-2 border-indigo-500"
          ></div>
        </div>
      )}
      {error && <p className="text-red-500 mt-4">Failed to load companies.</p>}
      {!isLoading && !error && companies && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company._id}
              className="bg-white p-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  src={company.company.logo || "/placeholder.svg"}
                  alt={company.company.name}
                  className="w-full h-48 object-contain rounded-lg"
                />
              </div>
              <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                {company.company.name}
              </h3>
              <ul className="text-gray-700 mb-4">
                {company.opportunities.map((opportunity, idx) => (
                  <li key={idx} className="flex items-center text-sm mb-1">
                    <Briefcase size={16} className="mr-2 text-indigo-500" />
                    {opportunity.role} - {opportunity.package}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate(`/company/${company._id}`)}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition duration-300 ease-in-out w-full"
              >
                View More
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md"
            >
              <h2 className="text-2xl font-semibold mb-6 text-indigo-700">
                Enter Company Details
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    {...register("companyName", { required: true })}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Logo
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col w-full h-32 border-2 border-indigo-300 border-dashed hover:bg-gray-100 hover:border-indigo-500 rounded-lg">
                      <div className="flex flex-col items-center justify-center pt-7">
                        <Upload className="w-8 h-8 text-indigo-500" />
                        <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                          Upload Logo
                        </p>
                      </div>
                      <input
                        type="file"
                        {...register("companyLogo", { required: true })}
                        className="opacity-0"
                      />
                    </label>
                  </div>
                  {logoPreview && logoPreview[0] && (
                    <img
                      src={
                        URL.createObjectURL(logoPreview[0]) ||
                        "/placeholder.svg"
                      }
                      alt="Logo preview"
                      className="mt-2 w-full h-32 object-contain rounded-lg"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role & Package
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="role"
                      placeholder="Enter Role"
                      className="w-1/2 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      id="package"
                      placeholder="Enter Package"
                      className="w-1/2 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleAddOpportunity(
                          document.getElementById("role").value,
                          document.getElementById("package").value
                        )
                      }
                      className="bg-indigo-500 text-white p-2 rounded-lg shadow-md hover:bg-indigo-600 transition duration-300 ease-in-out"
                    >
                      <PlusCircle size={24} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {opportunities.map((opportunity, index) => (
                      <span
                        key={index}
                        className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full flex items-center text-sm"
                      >
                        {opportunity.role} - {opportunity.package}
                        <button
                          type="button"
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                          onClick={() => removeOpportunity(index)}
                        >
                          <X size={16} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow-md hover:bg-gray-400 transition duration-300 ease-in-out"
                    disabled={mutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition duration-300 ease-in-out flex items-center"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacultyCompanies;
