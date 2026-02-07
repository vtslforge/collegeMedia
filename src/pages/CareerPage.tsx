import React from 'react';
import { Briefcase, Calendar, GraduationCap, ArrowUpRight } from 'lucide-react';
import { type CareerOpportunity } from '../database'; 

interface CareerCardProps {
  job: CareerOpportunity;
}

export const CareerCard: React.FC<CareerCardProps> = ({ job }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
            {job.companyName?.[0] || "?"}
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold text-lg leading-tight">{job.role}</h3>
            <p className="text-gray-500 text-sm">{job.companyName}</p>
          </div>
        </div>
        <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {job.status}
        </span>
      </div>

      <div className="space-y-3 mb-6 text-gray-600 text-sm">
        <div className="flex items-center gap-2">
          <Briefcase size={16} />
          <span>Package: <span className="font-medium text-gray-900">{job.ctc}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap size={16} />
          <span>Criteria: <span className="font-medium text-gray-900">{job.criteria}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>Deadline: <span className="font-medium text-gray-900">{job.deadline}</span></span>
        </div>
      </div>

      <button 
        onClick={() => window.open(job.applyLink, "_blank")}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        Apply Now
        <ArrowUpRight size={18} />
      </button>
    </div>
  );
};