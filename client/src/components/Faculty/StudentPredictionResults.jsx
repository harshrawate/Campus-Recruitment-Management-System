import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import LoadingOverlay from "../Global/LoadingOverlay";
import ErrorOverlay from "../Global/ErrorOverlay";

const StudentPredictionResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const jwtToken = Cookies.get("userCookie");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["student", "prediction", id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_API_URL}/faculty/student/${id}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data;
    },
    enabled: !!id,
    retry: false,
  });

  if (isLoading) return <LoadingOverlay />;
  if (isError) return <ErrorOverlay message={error.message} />;
  
  const student = data;
  const predictions = student?.predictions;
  
  if (!predictions || !predictions.placement_probability) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-indigo-600 mb-6 hover:text-indigo-800 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </button>
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <h2 className="text-xl font-semibold text-gray-800">No Prediction Data Found</h2>
          <p className="text-gray-500 mt-2">Please run AI prediction on this student first before attempting to view results.</p>
        </div>
      </div>
    );
  }

  // Format chart data: multiply probability by 100 for percentages
  const chartData = (predictions.company_probabilities || [])
    .map(c => ({
      name: c.company,
      probability: Number((c.probability * 100).toFixed(1))
    }))
    .sort((a, b) => b.probability - a.probability); // Sort highest to lowest

  const name = `${student.personal?.firstName || ""} ${student.personal?.lastName || ""}`.trim();

  return (
    <div className="p-8 space-y-6 min-h-[calc(100vh-80px)] bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center text-indigo-600 mb-4 hover:text-indigo-800 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Students
          </button>
          <h1 className="text-3xl font-bold text-gray-900">AI Prediction Results</h1>
          <p className="text-gray-500 mt-1 text-lg">Detailed placement analysis for {name}</p>
        </div>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-indigo-600 text-white rounded-2xl shadow-xl flex flex-col justify-center items-center text-center transform transition duration-300 hover:scale-[1.02]">
           <p className="text-indigo-200 font-bold tracking-wider uppercase text-sm mb-3">Overall Placement Probability</p>
           <p className="text-6xl font-black">{(predictions.placement_probability * 100).toFixed(1)}%</p>
        </div>
        <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center transform transition duration-300 hover:scale-[1.02]">
           <p className="text-gray-400 font-bold tracking-wider uppercase text-sm mb-3">Top Recommended Company</p>
           <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
             {predictions.company || "None"}
           </p>
        </div>
      </div>

      {/* Analytics Graph */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mt-8">
        <div className="mb-8 border-b pb-4">
          <h3 className="text-2xl font-bold text-gray-800">Company Match Probabilities</h3>
          <p className="text-md text-gray-500 mt-1">Based on the student's academic and skill profile evaluated against real company benchmarks.</p>
        </div>
        
        {chartData.length > 0 ? (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 65 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 500 }} 
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 13 }}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  formatter={(value) => [`${value}%`, 'Placement Match']}
                />
                <Bar dataKey="probability" radius={[6, 6, 0, 0]} animationDuration={1500}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4F46E5' : '#a5b4fc'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
           <div className="flex justify-center items-center h-48 bg-gray-50 rounded-xl border border-dashed border-gray-300">
             <p className="text-center text-gray-500">No detailed company data available.</p>
           </div>
        )}
      </div>

      {/* Evaluated Metrics (Read Only) */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">Profile Metrics Evaluated</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">CGPA</p>
            <p className="text-2xl font-black text-gray-800">{predictions.cgpa || "N/A"}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Avg Test Score</p>
            <p className="text-2xl font-black text-gray-800">{predictions.avg_test_score || "N/A"}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Technical Score</p>
            <p className="text-2xl font-black text-gray-800">{predictions.technical_score || "N/A"}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Aptitude Score</p>
            <p className="text-2xl font-black text-gray-800">{predictions.aptitude_score || "N/A"}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Projects</p>
            <p className="text-2xl font-black text-gray-800">{predictions.num_projects || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Internships</p>
            <p className="text-2xl font-black text-gray-800">{predictions.num_internships || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 col-span-2 md:col-span-2">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">Technical Skills</p>
            <div className="flex flex-wrap gap-2">
              {predictions.skills && predictions.skills.length > 0 ? (
                predictions.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-lg text-sm font-semibold shadow-sm border border-indigo-200">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 font-medium">None Listed</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPredictionResults;
