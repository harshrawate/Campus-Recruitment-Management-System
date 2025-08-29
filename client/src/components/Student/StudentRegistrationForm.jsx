import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import BackButton from "../Global/BackButton";
import { PiStudentBold } from "react-icons/pi";
import { toast } from "react-toastify";

import countryCodes from "../../Constants/countryCode.json";
import LoadingOverlay from "../Global/LoadingOverlay";

const checkPasswordStrength = (password) => {
  // Explicitly check for empty or null password
  if (!password || password.trim() === "") {
    return {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      specialChar: false,
    };
  }

  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

const FormInput = React.memo(
  ({
    control,
    name,
    type,
    label,
    disabled,
    placeholder,
    validation = {},
    showPassword,
    onTogglePassword,
    children,
    hideError = false,
  }) => (
    <Controller
      control={control}
      name={name}
      rules={{
        required: `${label} is required`,
        ...validation,
      }}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col">
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
          <div className="relative">
            {children ? (
              children({ field, error })
            ) : (
              <input
                {...field}
                type={showPassword ? "text" : type}
                id={name}
                className={`block w-full px-3 py-2 bg-gray-50 border ${
                  error ? "border-red-500" : "border-gray-300"
                } rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300`}
                placeholder={placeholder}
                disabled={disabled}
              />
            )}
            {type === "password" && onTogglePassword && (
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            )}
          </div>
          {!hideError && error && (
            <p className="text-sm text-red-500 mt-1">{error.message}</p>
          )}
        </div>
      )}
    />
  )
);

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "rgb(168, 85, 247)" : base.borderColor,
    boxShadow: state.isFocused ? "0 0 0 2px rgba(168, 85, 247, 0.5)" : null,
    "&:hover": {
      borderColor: state.isFocused ? "rgb(168, 85, 247)" : base.borderColor,
    },
    marginTop: "0.25rem",
    backgroundColor: "rgb(249, 250, 251)",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgb(168, 85, 247)"
      : base.backgroundColor,
    color: state.isSelected ? "white" : base.color,
    "&:hover": {
      backgroundColor: state.isSelected
        ? "rgb(168, 85, 247)"
        : "rgba(168, 85, 247, 0.1)",
    },
  }),
};

const StudentRegistrationForm = () => {
  const navigate = useNavigate();
  const [otpVerificationMode, setOtpVerificationMode] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [encryptedOTP, setEncryptedOTP] = useState("");
  const [iv, setIv] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const timerRef = useRef(null);

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      whatsappCountryCode: null,
      whatsappNumber: "",
      emailOtp: "",
      phoneOtp: "",
      password: "",
      confirmPassword: "",
      university: null,
    },
    mode: "onBlur",
  });

  // Watch form fields
  const email = watch("email");
  const whatsappCountryCode = watch("whatsappCountryCode");
  const whatsappNumber = watch("whatsappNumber");
  const password = watch("password");

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    const storedTimerEnd = localStorage.getItem("otpTimerEnd");
    if (storedTimerEnd) {
      const remainingTime = Math.max(
        0,
        Math.ceil((Number(storedTimerEnd) - Date.now()) / 1000)
      );
      if (remainingTime > 0) {
        setOtpSent(true);
        setOtpTimer(remainingTime);
      } else {
        localStorage.removeItem("otpTimerEnd");
      }
    }
  }, []);

  useEffect(() => {
    if (otpSent && otpTimer > 0) {
      // Start timer on first call
      if (otpTimer === 120) {
        localStorage.setItem(
          "otpTimerEnd",
          (Date.now() + otpTimer * 1000).toString()
        );
      }

      timerRef.current = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            localStorage.removeItem("otpTimerEnd");
            setOtpSent(false);
            setOtpVerificationMode(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [otpSent, otpTimer]);

  useEffect(() => {
    if (password && password.trim() !== "") {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
      });
    }
  }, [password]);

  const { data: universitiesResponse, isLoading: isLoadingUniversities } =
    useQuery({
      queryKey: ["universities"],
      queryFn: async () => {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_API_URL}/universities`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch universities");
        }
        const data = await response.json();
        return data.universities;
      },
      onError: (error) => {
        toast.error("Failed to load universities: " + error.message);
      },
    });

  // Get the universities array from the response
  const universities = universitiesResponse || [];

  const resetOtpStates = () => {
    setOtpSent(false);
    setOtpTimer(0);
    setOtpVerificationMode(null);
    setEncryptedOTP("");
    setIv("");
  };

  const sendEmailOtpMutation = useMutation({
    mutationFn: async (email) => {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API_URL}/student/verify-email/otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send Email OTP");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setEncryptedOTP(data.encryptedOTP);
      setIv(data.iv);
      setOtpSent(true);
      setOtpTimer(120);
      setOtpVerificationMode("email");
    },
    onError: (error) => {
      toast.error(`${error}`);
    },
  });

  const sendPhoneOtpMutation = useMutation({
    mutationFn: async (phoneDetails) => {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API_URL}/student/verify-phone/otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(phoneDetails),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send Phone OTP");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setEncryptedOTP(data.encryptedOTP);
      setIv(data.iv);
      setOtpSent(true);
      setOtpTimer(120);
      setOtpVerificationMode("phone");
    },
    onError: (error) => {
      toast.error(`${error}`);
      resetOtpStates();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data) => {
      const verifyEndpoint =
        otpVerificationMode === "email"
          ? "/student/verify-otp/email"
          : "/student/verify-otp/phone";

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API_URL}${verifyEndpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otp: data.otp,
            encryptedOTP,
            iv,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "OTP verification failed");
      }

      return response.json();
    },
    onSuccess: () => {
      if (otpVerificationMode === "email") {
        setEmailVerified(true);
      } else {
        setPhoneVerified(true);
      }
      resetOtpStates();
    },
    onError: (error) => {
      setError("otp", {
        type: "manual",
        message: error.message,
      });
      resetOtpStates();
    },
  });

  // Registration mutation
  const registrationMutation = useMutation({
    mutationFn: async (data) => {
      // Ensure whatsappCountryCode exists and has a value property
      const countryCode = data.whatsappCountryCode?.value;
      if (!countryCode) {
        throw new Error("Please select a country code");
      }

      const formattedWhatsappNumber = `${countryCode}${data.whatsappNumber}`;

      const requestBody = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        whatsappNumber: formattedWhatsappNumber,
        password: data.password,
        universityId: data.university.value,
      };
      console.log(requestBody)

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_API_URL}/student/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Add any required headers here, like CORS headers if needed
              Accept: "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        const responseText = await response.text();

        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error("Failed to parse response as JSON:", e);
          throw new Error(
            "Server returned invalid JSON. Response: " +
              (responseText.substring(0, 100) + "...")
          );
        }

        if (!response.ok) {
          throw new Error(responseData.message || "Registration failed");
        }

        return responseData;
      } catch (error) {
        if (error.message.includes("Failed to fetch")) {
          throw new Error(
            "Unable to connect to the server. Please check your internet connection."
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Registration successful!");
      navigate("/login");
    },
    onError: (error) => {
      console.error("Registration Error:", error);
      toast.error(error.message || "Registration failed");
    },
  });

  const onSubmit = async (data) => {
    try {
      // Pre-submission validation
      if (!emailVerified) {
        toast.error("Please verify your email address");
        return;
      }

      if (!phoneVerified) {
        toast.error("Please verify your phone number");
        return;
      }

      if (data.password !== data.confirmPassword) {
        setError("confirmPassword", {
          type: "manual",
          message: "Passwords do not match",
        });
        return;
      }

      if (Object.values(passwordStrength).some((v) => !v)) {
        toast.error("Please ensure your password meets all requirements");
        return;
      }

      await registrationMutation.mutateAsync(data);
    } catch (error) {
      console.error("Form Submission Error:", error);
    }
  };

  const handleSendOtp = async (source) => {
    if (otpTimer > 0) {
      toast.error(
        `Please wait ${formatTime(otpTimer)} before requesting another OTP`
      );
      return;
    }
    try {
      if (source === "email") {
        if (!email) {
          toast.error("Please enter an email address");
          return;
        }
        await sendEmailOtpMutation.mutateAsync(email);
      } else if (source === "phone") {
        if (!whatsappCountryCode || !whatsappNumber) {
          toast.error("Please enter WhatsApp country code and number");
          return;
        }
        const phoneDetails = {
          phoneNumber: `+${whatsappCountryCode.value}${whatsappNumber}`,
        };
        await sendPhoneOtpMutation.mutateAsync(phoneDetails);
      }
    } catch (error) {
      console.error(`OTP sending error for ${source}:`, error);
      toast.error(`Failed to send OTP to ${source}`);
    }
  };

  const isLoading =
    isSubmitting ||
    sendEmailOtpMutation.isPending ||
    sendPhoneOtpMutation.isPending ||
    registrationMutation.isPending ||
    verifyOtpMutation.isPending;

  if (isLoadingUniversities) {
    return <LoadingOverlay />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md mx-auto"
      >
        <BackButton />
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
          <PiStudentBold className="text-white text-3xl sm:text-4xl" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
          Student Registration
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              control={control}
              name="firstName"
              type="text"
              label="First Name"
              placeholder="Enter first name"
              disabled={isLoading}
            />
            <FormInput
              control={control}
              name="lastName"
              type="text"
              label="Last Name"
              placeholder="Enter last name"
              disabled={isLoading}
            />
          </div>

          <FormInput
            control={control}
            name="university"
            label="University"
            disabled={isLoading}
          >
            {({ field }) => (
              <Select
                {...field}
                options={universities.map((uni) => ({
                  value: uni._id,
                  label: uni.name,
                }))}
                placeholder="Select your university"
                styles={customSelectStyles}
                isDisabled={isLoading}
                noOptionsMessage={() => "No universities available"}
                className="w-full"
              />
            )}
          </FormInput>

          <div className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-start space-x-2">
                <div className="flex-grow">
                  <FormInput
                    control={control}
                    name="email"
                    type="email"
                    label="College Email"
                    placeholder="Enter your email"
                    disabled={isLoading || emailVerified}
                    validation={{
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    }}
                  />
                </div>
                <div className="pt-7">
                  {!emailVerified && otpVerificationMode !== "phone" && (
                    <button
                      type="button"
                      onClick={() => handleSendOtp("email")}
                      disabled={
                        isLoading ||
                        sendEmailOtpMutation.isPending ||
                        otpTimer > 0 ||
                        !email
                      }
                      className="whitespace-nowrap bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendEmailOtpMutation.isPending
                        ? "Sending..."
                        : otpTimer > 0
                        ? `Retry (${formatTime(otpTimer)})`
                        : "Send OTP"}
                    </button>
                  )}
                  {emailVerified && (
                    <div className="flex items-center text-green-500">
                      <CheckCircle size={20} className="mr-1" />
                      <span className="text-sm">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {otpSent && otpVerificationMode === "email" && (
                <div className="flex items-start space-x-2">
                  <div className="flex-grow">
                    <FormInput
                      control={control}
                      name="emailOtp"
                      type="text"
                      label="Email OTP"
                      placeholder="Enter OTP sent to your email"
                      disabled={isLoading}
                      validation={{
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: "Invalid OTP format",
                        },
                      }}
                    />
                  </div>
                  <div className="pt-7">
                    <button
                      type="button"
                      onClick={() =>
                        verifyOtpMutation.mutate({ otp: watch("emailOtp") })
                      }
                      disabled={isLoading || !watch("emailOtp")}
                      className="whitespace-nowrap bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
              {otpSent && otpVerificationMode === "email" && (
                <p className="text-sm text-gray-500 -mt-2">
                  OTP will expire in {formatTime(otpTimer)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-start space-x-2">
                <div className="w-1/3">
                  <FormInput
                    control={control}
                    name="whatsappCountryCode"
                    label="Country Code"
                    disabled={phoneVerified}
                  >
                    {({ field }) => (
                      <Select
                        {...field}
                        options={countryCodes.map((country) => ({
                          value: country.code,
                          label: `${country.iso} (+${country.code})`,
                          iso: country.iso,
                        }))}
                        getOptionLabel={(option) => `${option.label}`}
                        getOptionValue={(option) => option.value}
                        placeholder="Select"
                        styles={customSelectStyles}
                        isDisabled={phoneVerified}
                      />
                    )}
                  </FormInput>
                </div>
                <div className="flex-grow">
                  <FormInput
                    control={control}
                    name="whatsappNumber"
                    type="tel"
                    label="WhatsApp Number"
                    placeholder="Enter WhatsApp number"
                    disabled={isLoading || phoneVerified}
                    validation={{
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Invalid WhatsApp number",
                      },
                    }}
                  />
                </div>
                <div className="pt-7">
                  {!phoneVerified && otpVerificationMode !== "email" && (
                    <button
                      type="button"
                      onClick={() => handleSendOtp("phone")}
                      disabled={
                        isLoading ||
                        sendPhoneOtpMutation.isPending ||
                        otpTimer > 0 ||
                        !whatsappCountryCode ||
                        !whatsappNumber
                      }
                      className="whitespace-nowrap bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendPhoneOtpMutation.isPending
                        ? "Sending..."
                        : otpTimer > 0
                        ? `Retry (${formatTime(otpTimer)})`
                        : "Send OTP"}
                    </button>
                  )}
                  {phoneVerified && (
                    <div className="flex items-center text-green-500">
                      <CheckCircle size={20} className="mr-1" />
                      <span className="text-sm">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {otpSent && otpVerificationMode === "phone" && (
                <div className="flex items-start space-x-2">
                  <div className="flex-grow">
                    <FormInput
                      control={control}
                      name="phoneOtp"
                      type="text"
                      label="WhatsApp OTP"
                      placeholder="Enter OTP sent to your WhatsApp"
                      disabled={isLoading}
                      validation={{
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: "Invalid OTP format",
                        },
                      }}
                    />
                  </div>
                  <div className="pt-7">
                    <button
                      type="button"
                      onClick={() =>
                        verifyOtpMutation.mutate({ otp: watch("phoneOtp") })
                      }
                      disabled={isLoading || !watch("phoneOtp")}
                      className="whitespace-nowrap bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
              {otpSent && otpVerificationMode === "phone" && (
                <p className="text-sm text-gray-500 -mt-2">
                  OTP will expire in {formatTime(otpTimer)}
                </p>
              )}
            </div>
          </div>

          <FormInput
            control={control}
            name="password"
            type="password"
            label="Password"
            placeholder="Create a strong password"
            disabled={isLoading}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <div className="text-sm space-y-1">
            <div className="flex items-center">
              {passwordStrength.length ? (
                <CheckCircle size={16} className="text-green-500 mr-2" />
              ) : (
                <XCircle size={16} className="text-red-500 mr-2" />
              )}
              At least 8 characters long
            </div>
            <div className="flex items-center">
              {passwordStrength.uppercase ? (
                <CheckCircle size={16} className="text-green-500 mr-2" />
              ) : (
                <XCircle size={16} className="text-red-500 mr-2" />
              )}
              Contains uppercase letter
            </div>
            <div className="flex items-center">
              {passwordStrength.lowercase ? (
                <CheckCircle size={16} className="text-green-500 mr-2" />
              ) : (
                <XCircle size={16} className="text-red-500 mr-2" />
              )}
              Contains lowercase letter
            </div>
            <div className="flex items-center">
              {passwordStrength.number ? (
                <CheckCircle size={16} className="text-green-500 mr-2" />
              ) : (
                <XCircle size={16} className="text-red-500 mr-2" />
              )}
              Contains number
            </div>
            <div className="flex items-center">
              {passwordStrength.specialChar ? (
                <CheckCircle size={16} className="text-green-500 mr-2" />
              ) : (
                <XCircle size={16} className="text-red-500 mr-2" />
              )}
              Contains special character
            </div>
          </div>

          <FormInput
            control={control}
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            disabled={isLoading}
            showPassword={showConfirmPassword}
            onTogglePassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          />

          {(sendEmailOtpMutation.error ||
            sendPhoneOtpMutation.error ||
            registrationMutation.error) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {sendEmailOtpMutation.error?.message ||
                sendPhoneOtpMutation.error?.message ||
                registrationMutation.error?.message}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={
              !emailVerified ||
              !phoneVerified ||
              isLoading ||
              Object.values(passwordStrength).some((v) => !v)
            }
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Create Account"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default StudentRegistrationForm;
