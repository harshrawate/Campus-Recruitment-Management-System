import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, MapPin, Globe, Upload, X } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import DegreePrograms from "./DegreePrograms";

const UniversityInfo = ({ university, universityId, degreePrograms }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [programs, setPrograms] = useState(degreePrograms || []);
  const jwtToken = Cookies.get("userCookie");
  const queryClient = useQueryClient();

  const logoMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_API_URL}/admin/university/${universityId}/logo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );
      return response.data.logo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["university", universityId]);
      setIsUploading(false);
    },
  });

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    logoMutation.mutate(file);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4 relative group">
          <img
            src={university.logo}
            alt={university.name}
            className="w-full h-auto rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
            <label className="hidden group-hover:flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Upload className="h-6 w-6 text-white" />
              <span className="text-white">Upload Logo</span>
            </label>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex flex-col items-center justify-center">
              <div className="w-3/4 bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="text-white mt-2">{uploadProgress}%</span>
              <button
                onClick={() => setIsUploading(false)}
                className="absolute top-2 right-2 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <div className="w-full md:w-3/4 space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {university.name}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="h-4 w-4 text-indigo-600 flex-shrink-0" />
              <span>{university.address}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="h-4 w-4 text-indigo-600 flex-shrink-0" />
              <span>{university.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Globe className="h-4 w-4 text-indigo-600 flex-shrink-0" />
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800"
              >
                {university.website}
              </a>
            </div>
          </div>
        </div>
      </div>
      <DegreePrograms
        universityId={universityId}
        programs={programs}
        onUpdatePrograms={setPrograms}
      />
    </div>
  );
};

export default UniversityInfo;
