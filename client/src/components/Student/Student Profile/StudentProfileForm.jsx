import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { steps } from "./constants";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import AcademicInfoStep from "./steps/AcademicInfoStep";
import ProfessionalInfoStep from "./steps/ProfessionalInfoStep";
import IdProofsStep from "./steps/IdProofsStep";
import FamilyInfoStep from "./steps/FamilyInfoStep";
import MiscellaneousStep from "./steps/MiscellaneousStep";
import ProgressIndicator from "./components/ProgressIndicator";
import { useDispatch } from "react-redux";
import { clearAllFiles } from "../../../redux/fileUploadSlice";
import { useQuery, useMutation } from "@tanstack/react-query";
import LoadingOverlay from "../../Global/LoadingOverlay";
import ErrorOverlay from "../../Global/ErrorOverlay";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import { setTokenAndRole } from "../../../redux/authSlice";

const StudentProfileForm = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const isUpdateMode = location.pathname === "/student/update-profile";

  const methods = useForm({
    defaultValues: {
      personal: {},
      academic: {},
      professional: {
        workExperience: [],
        skills: [],
        certifications: [],
      },
      documents: {},
      family: {},
      social: {},
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger,
  } = methods;

  const cookie = Cookies.get("userCookie");

  const fetchProfile = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_API_URL}/student/complete/profile`,
      {
        headers: {
          Authorization: `Bearer ${cookie}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  };

  const {
    data: profileData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["student", "complete", "profile"],
    queryFn: fetchProfile,
  });

  useEffect(() => {
    if (profileData && profileData.data) {
      if (profileData.data.profileStatus?.isComplete && !isUpdateMode) {
        navigate("/student/dashboard");
      } else {
        reset(profileData.data);
      }
    }
  }, [profileData, isUpdateMode, navigate, reset]);

  const validateForm = async () => {
    const fieldsToValidate = [
      ...[
        "personal.firstName",
        "personal.lastName",
        "personal.phoneNumber",
        "personal.collegeEmail",
        "personal.gender",
        "personal.caste",
        "personal.dateOfBirth",
      ],
      ...[
        "academic.university",
        "academic.rollNumber",
        "academic.collegeName",
        "academic.degreeProgram",
        "academic.branch",
        "academic.cgpa",
        "academic.graduationYear",
        "academic.tenth.percentage",
        "academic.tenth.boardName",
        "academic.tenth.passingYear",
        "academic.twelfth.percentage",
        "academic.twelfth.boardName",
        "academic.twelfth.passingYear",
      ],
      ...["skills", "workExperience"],
      ...["documents.aadhar.number", "documents.pan.number"],
      ...[
        "family.father.name",
        "family.father.occupation",
        "family.father.contact",
        "family.mother.name",
        "family.mother.occupation",
        "family.mother.contact",
        "family.annualIncome",
      ],
      ...["social.linkedin", "social.github", "social.resume"],
    ];

    return await trigger(fieldsToValidate);
  };
  const updateStudentProfile = async (formData) => {
    const response = await axios.put(
      `${import.meta.env.VITE_SERVER_API_URL}/student/update/profile`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${cookie}`,
        },
      }
    );
    return response.data;
  };

  const profileUpdateMutation = useMutation({
    mutationFn: updateStudentProfile,
    onSuccess: (data) => {
      console.log(data);
      dispatch(
        setTokenAndRole({
          isProfileComplete: true,
        })
      );
      dispatch(clearAllFiles());
      toast.success("Profile updated successfully");
      navigate("/student/dashboard");
    },
    onError: (error) => {
      console.error("Profile submission error:", error);
      toast.error(error.response?.data?.message || "Failed to submit profile");
    },
  });

  const onSubmit = async (data) => {
    try {
      const isStepValid = await validateForm();

      if (!isStepValid) {
        toast.error("Please fill in all required fields correctly");
        return;
      }

      if (currentStep === steps.length - 1) {
        setIsSubmitting(true);

        const formData = new FormData();

        if (data.photograph instanceof File) {
          formData.append("photograph", data.photograph);
        }

        if (data.documents.aadhar.document instanceof File) {
          formData.append("aadharDocument", data.documents.aadhar.document);
        }

        if (data.documents.pan.document instanceof File) {
          formData.append("panDocument", data.documents.pan.document);
        }

        if (data.social.resume instanceof File) {
          formData.append("resume", data.social.resume);
        }

        const formattedData = {
          personal: {
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            collegeEmail: data.collegeEmail,
            personalEmail: data.personalEmail,
            gender: data.gender,
            religion: data.religion,
            caste: data.caste,
            dateOfBirth: data.dateOfBirth,
            address: {
              current: data.currentAddress,
              permanent: data.sameAddress
                ? data.currentAddress
                : data.permanentAddress,
            },
          },
          academic: {
            rollNumber: data.academic.rollNumber.toLowerCase(),
            collegeName:
              data.academic.collegeName ||
              profileData.data.academic.university.name,
            degreeProgram: data.academic.degreeProgram,
            branch: data.academic.branch,
            section: data.academic.section,
            cgpa: parseFloat(data.academic.cgpa),
            backlogs: parseInt(data.academic.backlogs),
            graduationYear: parseInt(data.academic.graduationYear),
            tenth: {
              percentage: parseFloat(data.academic.tenth?.percentage),
              boardName: data.academic.tenth?.boardName,
              passingYear: parseInt(data.academic.tenth?.passingYear),
            },
            twelfth: {
              percentage: parseFloat(data.academic.twelfth?.percentage),
              boardName: data.academic.twelfth?.boardName,
              passingYear: parseInt(data.academic.twelfth?.passingYear),
            },
            entranceExams: data.academic.entranceExams?.map((exam) => ({
              examName: exam.examName,
              rank: parseInt(exam.rank),
            })),
          },
          professional: {
            experience: data.workExperience?.map((exp) => ({
              company: exp.company,
              role: exp.role,
              duration: `${new Date(exp.startDate).toLocaleDateString(
                "en-GB"
              )} - ${
                exp.currentlyWorking
                  ? "Present"
                  : new Date(exp.endDate).toLocaleDateString("en-GB")
              }`,
            })),
            skills: data.skills || [],
            certifications: data.certifications?.map((cert) => ({
              name: cert.name,
              authority: cert.authority,
              link: cert.link || "",
            })),
          },
          documents: {
            aadhar: {
              number: data.documents?.aadhar?.number,
              document: data.documents?.aadhar?.document,
            },
            pan: {
              number: data.documents?.pan?.number,
              document: data.documents?.pan?.document,
            },
          },
          family: {
            father: {
              name: data.family?.father?.name,
              occupation: data.family?.father?.occupation,
              contact: data.family?.father?.contact,
            },
            mother: {
              name: data.family?.mother?.name,
              occupation: data.family?.mother?.occupation,
              contact: data.family?.mother?.contact,
            },
            annualIncome: parseFloat(data.family.annualIncome),
          },
          social: {
            linkedin: data.social.linkedin || "",
            github: data.social.github || "",
            extracurricular: data.social.extracurricular
              ? data.social.extracurricular
                  .split("\n")
                  .map((activity) => activity.trim())
              : [],
          },
        };

        formData.append("profileData", JSON.stringify(formattedData));

        profileUpdateMutation.mutate(formData);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Form validation error:", error);
      toast.error("Please check all required fields");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoStep
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            currentValues={profileData?.data?.personal || {}}
          />
        );
      case 1:
        return (
          <AcademicInfoStep
            control={control}
            errors={errors}
            currentValues={profileData?.data?.academic || {}}
            watch={watch}
          />
        );
      case 2:
        return (
          <ProfessionalInfoStep
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            currentValues={profileData?.data?.professional || {}}
          />
        );
      case 3:
        return (
          <IdProofsStep
            control={control}
            errors={errors}
            currentValues={profileData?.data?.documents || {}}
            watch={watch}
          />
        );
      case 4:
        return (
          <FamilyInfoStep
            control={control}
            errors={errors}
            currentValues={profileData?.data?.family || {}}
            watch={watch}
          />
        );
      case 5:
        return (
          <MiscellaneousStep
            control={control}
            errors={errors}
            currentValues={profileData?.data?.social || {}}
            watch={watch}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) return <LoadingOverlay />;
  if (isError) return <ErrorOverlay statusCode={error?.response?.status} />;

  return (
    <motion.div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div className="bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
            {isUpdateMode ? "Update Profile" : "Complete Your Profile"}
          </h1>

          {!isUpdateMode && (
            <ProgressIndicator currentStep={currentStep} steps={steps} />
          )}

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {isUpdateMode ? (
                <>
                  <PersonalInfoStep
                    control={control}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    currentValues={profileData?.data?.personal || {}}
                    className="mt-2"
                  />
                  <AcademicInfoStep
                    control={control}
                    errors={errors}
                    currentValues={profileData?.data?.academic || {}}
                    watch={watch}
                    className="mt-2"
                  />
                  <ProfessionalInfoStep
                    control={control}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    currentValues={profileData?.data?.professional || {}}
                    className="mt-2"
                  />
                  <IdProofsStep
                    control={control}
                    errors={errors}
                    currentValues={profileData?.data?.documents || {}}
                    watch={watch}
                    className="mt-2"
                  />
                  <FamilyInfoStep
                    control={control}
                    errors={errors}
                    currentValues={profileData?.data?.family || {}}
                    watch={watch}
                    className="mt-2"
                  />
                  <MiscellaneousStep
                    control={control}
                    errors={errors}
                    currentValues={profileData?.data?.social || {}}
                    watch={watch}
                    className="mt-2"
                  />
                </>
              ) : (
                renderStep()
              )}

              <div className="mt-6 flex justify-between">
                {!isUpdateMode && currentStep > 0 && (
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    disabled={isSubmitting}
                  >
                    Previous
                  </motion.button>
                )}
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 ml-auto disabled:bg-indigo-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </motion.button>
              </div>
            </form>
          </FormProvider>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentProfileForm;
