import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  GraduationCap,
  Briefcase,
  Users,
  FileText,
  Github,
  Linkedin,
  Calendar,
  Award,
  Clock,
  ChevronDown,
  FileCodeIcon as FileContract,
  Building,
  UserCircle,
  ExternalLink,
  Download,
  Mail,
  Phone,
  Star,
  MapPin,
  AlertCircle,
  Percent,
  Book,
  DollarSign,
  ShieldCheck,
  Power,
  Lock,
  RefreshCw,
  Hash,
  MapPinned,
  LuggageIcon as Suitcase,
  Banknote,
  History,
  X,
  BarChart2,
  CalendarDays,
  ClockIcon as UserClock,
  CheckCircle,
} from "lucide-react";
import BackButton from "../../Global/BackButton";

const Section = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-indigo-100"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300"
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-6 h-6" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const InfoField = ({ label, value, icon: Icon }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-300"
  >
    <Icon className="w-5 h-5 text-indigo-500" />
    <div>
      <span className="text-sm text-gray-500">{label}</span>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  </motion.div>
);

const StudentProfile = () => {
  const [isLoginHistoryModalOpen, setIsLoginHistoryModalOpen] = useState(false);
  const { id } = useParams();
  const jwtToken = Cookies.get("userCookie");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_API_URL}/student/${id}`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-white rounded-xl shadow-2xl"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600">{error.message}</p>
        </motion.div>
      </div>
    );
  }

  const LoginHistoryModal = ({
    isOpen,
    onClose,
    loginHistory = [],
    lastLogin,
  }) => {
    const [filterType, setFilterType] = useState("all");

    const formatDateTime = (date) => {
      if (!date) return "Not available";
      return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    };

    const getTimeDifference = (date) => {
      const now = new Date();
      const loginDate = new Date(date);
      const diffInSeconds = Math.floor((now - loginDate) / 1000);

      if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
      if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
      return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    };

    const filterLogins = () => {
      const now = new Date();
      const history = [...loginHistory].reverse();

      switch (filterType) {
        case "today":
          return history.filter((date) => {
            const loginDate = new Date(date);
            return loginDate.toDateString() === now.toDateString();
          });
        case "week":
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          return history.filter((date) => new Date(date) > weekAgo);
        case "month":
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          return history.filter((date) => new Date(date) > monthAgo);
        default:
          return history;
      }
    };

    const getLoginStats = () => {
      const totalLogins = loginHistory.length;
      const today = loginHistory.filter(
        (date) => new Date(date).toDateString() === new Date().toDateString()
      ).length;
      const thisWeek = loginHistory.filter(
        (date) =>
          new Date(date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;
      const thisMonth = loginHistory.filter(
        (date) =>
          new Date(date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length;

      return { totalLogins, today, thisWeek, thisMonth };
    };

    const stats = getLoginStats();
    const filteredLogins = filterLogins();

    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-500 to-indigo-600">
                <div className="flex items-center space-x-3">
                  <History className="text-white w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Login History
                    </h2>
                    <p className="text-indigo-100 text-sm">
                      Total Logins: {stats.totalLogins}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-indigo-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-indigo-50">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <BarChart2 className="text-indigo-500 w-5 h-5" />
                    <span className="text-gray-600">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">
                    {stats.totalLogins}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-indigo-500 w-5 h-5" />
                    <span className="text-gray-600">Today</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">
                    {stats.today}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="text-indigo-500 w-5 h-5" />
                    <span className="text-gray-600">This Week</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">
                    {stats.thisWeek}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <UserClock className="text-indigo-500 w-5 h-5" />
                    <span className="text-gray-600">This Month</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">
                    {stats.thisMonth}
                  </p>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="px-6 py-4 border-b border-gray-200 flex space-x-4">
                {["all", "today", "week", "month"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterType(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filterType === filter
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {/* Login History List */}
              <div className="overflow-y-auto max-h-[calc(85vh-380px)] p-6">
                <div className="space-y-4">
                  {filteredLogins.length > 0 ? (
                    filteredLogins.map((loginDate, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-indigo-100 p-2 rounded-full">
                            <Clock className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {formatDateTime(loginDate)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {getTimeDifference(loginDate)}
                            </p>
                          </div>
                        </div>
                        {index === 0 && filterType === "all" && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Latest
                          </span>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        No login history available for this period
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const { student } = data;
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "Not provided";
  const formatCurrency = (amount) =>
    amount
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(amount)
      : "Not provided";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-gradient-to-br from-indigo-50 to-white min-h-screen">
      {/* Profile Header */}
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-indigo-100"
      >
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-40 h-40 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center shadow-lg"
          >
            {student.personal.photograph ? (
              <img
                src={student.personal.photograph || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircle className="w-24 h-24 text-indigo-300" />
            )}
          </motion.div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {student.personal.firstName} {student.personal.lastName}
            </h1>
            <p className="text-2xl text-indigo-600 font-semibold mb-1">
              {student.academic.rollNumber}
            </p>
            <p className="text-xl text-gray-600 mb-4">
              {student.academic.degreeProgram} • {student.academic.branch} • {student.academic.section}
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              {student.social.linkedin && (
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href={student.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:text-indigo-600 transition-colors duration-300"
                >
                  <Linkedin className="w-8 h-8" />
                </motion.a>
              )}
              {student.social.github && (
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href={student.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:text-indigo-600 transition-colors duration-300"
                >
                  <Github className="w-8 h-8" />
                </motion.a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center space-x-4">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className={`px-6 py-2 rounded-full text-sm font-semibold ${
              student.auth.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {student.auth.status.toUpperCase()}
          </motion.span>
          <motion.span
            whileHover={{ scale: 1.05 }}
            className={`px-6 py-2 rounded-full text-sm font-semibold ${
              student.placement.isPlaced
                ? "bg-indigo-100 text-indigo-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {student.placement.isPlaced ? "PLACED" : "NOT PLACED"}
          </motion.span>
        </div>
      </motion.div>
      {/* Main Content */}
      <div className="space-y-8">
        <Section title="Personal Information" icon={User} defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="College Email"
              value={student.personal.collegeEmail}
              icon={Mail}
            />
            <InfoField
              label="Personal Email"
              value={student.personal.personalEmail}
              icon={Mail}
            />
            <InfoField
              label="WhatsApp"
              value={student.personal.whatsappNumber}
              icon={Phone}
            />
            <InfoField
              label="Date of Birth"
              value={formatDate(student.personal.dateOfBirth)}
              icon={Calendar}
            />
            <InfoField
              label="Gender"
              value={student.personal.gender}
              icon={User}
            />
            <InfoField
              label="Religion"
              value={student.personal.religion}
              icon={Star}
            />
            <InfoField
              label="Caste"
              value={student.personal.caste}
              icon={Users}
            />
          </div>
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4 text-indigo-600">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-indigo-500 mb-2">
                  Permanent Address
                </h4>
                <div className="space-y-2">
                  <InfoField
                    label="Street"
                    value={student.personal.address.permanent?.street}
                    icon={MapPin}
                  />
                  <InfoField
                    label="City"
                    value={student.personal.address.permanent?.city}
                    icon={Building}
                  />
                  <InfoField
                    label="State"
                    value={student.personal.address.permanent?.state}
                    icon={MapPinned}
                  />
                  <InfoField
                    label="Pincode"
                    value={student.personal.address.permanent?.pincode}
                    icon={MapPin}
                  />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-indigo-500 mb-2">
                  Current Address
                </h4>
                <div className="space-y-2">
                  <InfoField
                    label="Street"
                    value={student.personal.address.current?.street}
                    icon={MapPin}
                  />
                  <InfoField
                    label="City"
                    value={student.personal.address.current?.city}
                    icon={Building}
                  />
                  <InfoField
                    label="State"
                    value={student.personal.address.current?.state}
                    icon={MapPinned}
                  />
                  <InfoField
                    label="Pincode"
                    value={student.personal.address.current?.pincode}
                    icon={MapPin}
                  />
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Academic Details"
          icon={GraduationCap}
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="College"
              value={student.academic.collegeName}
              icon={Building}
            />
            <InfoField
              label="CGPA"
              value={student.academic.cgpa}
              icon={Award}
            />
            <InfoField
              label="Backlogs"
              value={student.academic.backlogs}
              icon={AlertCircle}
            />
            <InfoField
              label="Graduation Year"
              value={student.academic.graduationYear}
              icon={Calendar}
            />
          </div>
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-indigo-600">
                10th Standard
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField
                  label="Percentage"
                  value={`${student.academic.tenth?.percentage}%`}
                  icon={Percent}
                />
                <InfoField
                  label="Board"
                  value={student.academic.tenth?.boardName}
                  icon={Book}
                />
                <InfoField
                  label="Passing Year"
                  value={student.academic.tenth?.passingYear}
                  icon={Calendar}
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-indigo-600">
                12th Standard
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField
                  label="Percentage"
                  value={`${student.academic.twelfth?.percentage}%`}
                  icon={Percent}
                />
                <InfoField
                  label="Board"
                  value={student.academic.twelfth?.boardName}
                  icon={Book}
                />
                <InfoField
                  label="Passing Year"
                  value={student.academic.twelfth?.passingYear}
                  icon={Calendar}
                />
              </div>
            </div>
            {student.academic.entranceExams?.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4 text-indigo-600">
                  Entrance Exams
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.academic.entranceExams.map((exam, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100"
                    >
                      <InfoField
                        label="Exam Name"
                        value={exam.examName}
                        icon={FileText}
                      />
                      <InfoField label="Rank" value={exam.rank} icon={Award} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        <Section title="Professional Experience" icon={Briefcase}>
          <div className="space-y-6">
            {student.professional.experience.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md border border-indigo-100"
              >
                <h3 className="font-semibold text-xl text-indigo-600 mb-2">
                  {exp.company}
                </h3>
                <p className="text-gray-700 text-lg">{exp.role}</p>
                <p className="text-gray-500">{exp.duration}</p>
              </motion.div>
            ))}
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-4 text-indigo-600">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {student.professional.skills.map((skill, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Documents" icon={FileContract}>
          <div className="space-y-6">
            {student.documents.aadhar && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-md border border-indigo-100"
              >
                <h3 className="font-semibold text-xl text-indigo-600 mb-4">
                  Aadhar Card
                </h3>
                <InfoField
                  label="Number"
                  value={student.documents.aadhar.number}
                  icon={Hash}
                />
                {student.documents.aadhar.document?.fileUrl && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={student.documents.aadhar.document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors duration-300"
                  >
                    <Download className="mr-2" />
                    View Document
                  </motion.a>
                )}
              </motion.div>
            )}
            {student.documents.pan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-md border border-indigo-100"
              >
                <h3 className="font-semibold text-xl text-indigo-600 mb-4">
                  PAN Card
                </h3>
                <InfoField
                  label="Number"
                  value={student.documents.pan.number}
                  icon={Hash}
                />
                {student.documents.pan.document?.fileUrl && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={student.documents.pan.document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors duration-300"
                  >
                    <Download className="mr-2" />
                    View Document
                  </motion.a>
                )}
              </motion.div>
            )}
          </div>
        </Section>

        <Section title="Placement Details" icon={Suitcase}>
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-2 rounded-full text-lg font-semibold ${
                  student.placement.isPlaced
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {student.placement.isPlaced ? "Placed" : "Not Placed"}
              </motion.span>
            </div>

            {student.placement.offers && student.placement.offers.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-indigo-600 mb-4">
                  Placement Offers
                </h3>
                {student.placement.offers.map((offer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-md border border-indigo-100"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoField
                        label="Company"
                        value={offer.company}
                        icon={Building}
                      />
                      <InfoField
                        label="Role"
                        value={offer.role}
                        icon={Briefcase}
                      />
                      <InfoField
                        label="CTC"
                        value={formatCurrency(offer.ctc)}
                        icon={Banknote}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  No placement offers recorded yet
                </p>
              </div>
            )}
          </div>
        </Section>

        <Section title="Family Information" icon={Users}>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-indigo-600">
                Father's Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Name"
                  value={student.family.father?.name}
                  icon={User}
                />
                <InfoField
                  label="Occupation"
                  value={student.family.father?.occupation}
                  icon={Briefcase}
                />
                <InfoField
                  label="Contact"
                  value={student.family.father?.contact}
                  icon={Phone}
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-indigo-600">
                Mother's Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Name"
                  value={student.family.mother?.name}
                  icon={User}
                />
                <InfoField
                  label="Occupation"
                  value={student.family.mother?.occupation}
                  icon={Briefcase}
                />
                <InfoField
                  label="Contact"
                  value={student.family.mother?.contact}
                  icon={Phone}
                />
              </div>
            </div>
            <InfoField
              label="Annual Income"
              value={`₹${
                student.family.annualIncome?.toLocaleString() || "Not provided"
              }`}
              icon={DollarSign}
            />
          </div>
        </Section>

        <Section title="Certifications" icon={Award}>
          <div className="space-y-6">
            {student.professional.certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md border border-indigo-100"
              >
                <h3 className="font-semibold text-xl text-indigo-600 mb-2">
                  {cert.name}
                </h3>
                <p className="text-gray-700">{cert.authority}</p>
                {cert.link && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors duration-300"
                  >
                    <ExternalLink className="mr-2" />
                    View Certificate
                  </motion.a>
                )}
              </motion.div>
            ))}
          </div>
        </Section>

        <Section title="Account Information" icon={UserCircle}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="Account Status"
              value={student.auth.status}
              icon={ShieldCheck}
            />
            <InfoField
              label="Role"
              value={student.auth.role}
              icon={UserCircle}
            />
            <InfoField
              label="Placement Status"
              value={student.placement.isPlaced ? "Placed" : "Not Placed"}
              icon={Briefcase}
            />
            <InfoField
              label="Profile Status"
              value={student.auth.isProfileComplete ? "Complete" : "Incomplete"}
              icon={CheckCircle}
            />
            <InfoField
              label="Account Active"
              value={student.auth.isDeactivated ? "No" : "Yes"}
              icon={Power}
            />
            <div className="relative">
              <InfoField
                label="Last Login"
                value={formatDate(student.auth.lastLogin)}
                icon={Clock}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLoginHistoryModalOpen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm hover:bg-indigo-200 transition-colors flex items-center space-x-1"
              >
                <History className="w-3 h-3" />
                <span>View History</span>
              </motion.button>
            </div>
            <InfoField
              label="Registration Date"
              value={formatDate(student.auth.registeredAt)}
              icon={Calendar}
            />
            <InfoField
              label="Last Password Change"
              value={formatDate(student.auth.lastPasswordChange)}
              icon={Lock}
            />
          </div>
        </Section>

        <Section title="System Information" icon={Building}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="Created At"
              value={formatDate(student.createdAt)}
              icon={Calendar}
            />
            <InfoField
              label="Last Updated"
              value={formatDate(student.updatedAt)}
              icon={RefreshCw}
            />
            <InfoField
              label="ID"
              value={student._id}
              icon={Hash}
              className="col-span-2"
            />
          </div>
        </Section>
      </div>
      <LoginHistoryModal
        isOpen={isLoginHistoryModalOpen}
        onClose={() => setIsLoginHistoryModalOpen(false)}
        loginHistory={student.auth.loginHistory}
      />
    </div>
  );
};

export default StudentProfile;
