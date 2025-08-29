// StudentSection.jsx
import React, { useState } from "react";
import { Search } from "lucide-react";
import NoItems from "../../Global/noItems";
import StudentCard from "./StudentCard";

const StudentSection = ({ students = [], universityId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const validStudents = students.filter((student) => {
    if (!student || typeof student !== "object") return false;

    if (!student.personal || !student.academic) return false;

    const hasRequiredPersonal =
      student.personal.firstName &&
      student.personal.lastName &&
      student.personal.collegeEmail &&
      student.personal.whatsappNumber;

    const hasRequiredAcademic =
      student.academic.rollNumber &&
      student.academic.branch &&
      student.academic.section &&
      student.academic.degreeProgram &&
      student.academic.graduationYear;

    return hasRequiredPersonal && hasRequiredAcademic;
  });

  const filteredStudents = validStudents.filter((student) => {
    const fullName =
      `${student.personal.firstName} ${student.personal.lastName}`.toLowerCase();
    const searchTerms = (searchQuery || "").toLowerCase();

    return (
      fullName.includes(searchTerms) ||
      (student.personal.collegeEmail || "")
        .toLowerCase()
        .includes(searchTerms) ||
      (student.academic.rollNumber || "").toLowerCase().includes(searchTerms) ||
      (student.academic.branch || "").toLowerCase().includes(searchTerms)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / itemsPerPage)
  );
  const currentPageSafe = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedStudents = filteredStudents.slice(
    (currentPageSafe - 1) * itemsPerPage,
    currentPageSafe * itemsPerPage
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
      <div className="flex justify-end mb-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, roll number, or branch..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-80"
          />
        </div>
      </div>

      {validStudents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No student data available</p>
        </div>
      ) : paginatedStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedStudents.map((student) => (
            <StudentCard
              key={student._id || Math.random().toString()}
              student={student}
              universityId={universityId}
            />
          ))}
        </div>
      ) : (
        <NoItems />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 border rounded-md ${
                currentPage === index + 1
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-50"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentSection;
