import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Calendar, 
  GraduationCap, 
  ArrowUpRight, 
  MessageSquare, 
  Layers, 
  User,
  Search,
  X // Added X for closing the popup
} from 'lucide-react';
import { 
  listenCareerOpportunities, 
  listenInterviewExperiences, 
  type CareerOpportunity, 
  type InterviewExperience 
} from '../database'; 

// --- 1. POPUP / MODAL COMPONENT ---
interface ModalProps {
  experience: InterviewExperience;
  onClose: () => void;
}

const ExperienceModal: React.FC<ModalProps> = ({ experience, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{experience.companyName}</h2>
            <p className="text-blue-600 font-medium">Interview Experience</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-50">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Shared by</p>
              <p className="font-bold text-gray-900 text-lg">{experience.authorName}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Interview Rounds</h4>
              <div className="flex flex-wrap gap-2">
                {experience.rounds.map((round, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100">
                    {round}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Detailed Insight</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {experience.content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 2. CAREER CARD ---
export const CareerCard: React.FC<{ job: CareerOpportunity }> = ({ job }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl uppercase shrink-0">
            {job.companyName?.[0] || "?"}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-gray-900 font-semibold text-lg leading-tight truncate" title={job.role}>
              {job.role}
            </h3>
            <p className="text-gray-500 text-sm truncate">{job.companyName}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 ${
          job.status === 'Hiring' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {job.status}
        </span>
      </div>

      <div className="space-y-3 mb-6 text-gray-600 text-sm grow">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-gray-400" />
          <span>Package: <span className="font-medium text-gray-900">{job.ctc}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap size={16} className="text-gray-400" />
          <span className="line-clamp-1">Criteria: <span className="font-medium text-gray-900">{job.criteria}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span>Deadline: <span className="font-medium text-gray-900">{job.deadline}</span></span>
        </div>
      </div>

      <button 
        onClick={() => {
            const url = job.applyLink.startsWith('http') ? job.applyLink : `https://${job.applyLink}`;
            window.open(url, "_blank", "noopener,noreferrer");
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors mt-auto active:scale-[0.98]"
      >
        Apply Now
        <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
};

// --- 3. EXPERIENCE CARD ---
const ExperienceCard: React.FC<{ experience: InterviewExperience; onReadMore: () => void }> = ({ experience, onReadMore }) => {
  const difficultyColor = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <div className="overflow-hidden">
          <h4 className="text-gray-900 font-bold text-lg truncate">{experience.companyName}</h4>
          <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
            <User size={12} />
            <span className="truncate font-medium underline decoration-blue-200">Shared by {experience.authorName}</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${difficultyColor[experience.difficulty] || 'bg-gray-100'}`}>
          {experience.difficulty}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {experience.rounds.slice(0, 2).map((round, index) => (
          <span key={index} className="flex items-center gap-1 bg-gray-50 border border-gray-200 text-gray-600 text-[10px] px-2 py-1 rounded-md font-medium">
            <Layers size={10} />
            {round}
          </span>
        ))}
        {experience.rounds.length > 2 && <span className="text-[10px] text-gray-400 mt-1">+{experience.rounds.length - 2} more</span>}
      </div>

      <div className="bg-blue-50/50 rounded-lg p-3 mb-4 grow">
        <div className="flex gap-2">
          <MessageSquare size={14} className="text-blue-500 mt-1 shrink-0" />
          <p className="text-gray-700 text-sm italic line-clamp-4 leading-relaxed">
            "{experience.content}"
          </p>
        </div>
      </div>

      <button 
        onClick={onReadMore}
        className="text-blue-600 text-xs font-bold hover:underline w-fit active:opacity-70"
      >
        Read Full Entry
      </button>
    </div>
  );
};

// --- 4. MAIN CAREER PAGE ---
const Career: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'experiences'>('jobs');
  const [jobs, setJobs] = useState<CareerOpportunity[]>([]);
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for the selected experience for the popup
  const [selectedExp, setSelectedExp] = useState<InterviewExperience | null>(null);

  useEffect(() => {
    const unsubJobs = listenCareerOpportunities((data) => {
      setJobs(data);
      if (activeTab === 'jobs') setLoading(false);
    });

    const unsubExp = listenInterviewExperiences((data) => {
      setExperiences(data);
      if (activeTab === 'experiences') setLoading(false);
    });

    return () => {
      unsubJobs();
      unsubExp();
    };
  }, [activeTab]);

  return (
    <div className="p-8 bg-[#f9fafb] min-h-screen font-inter">
      <div className="max-w-6xl mx-auto">
        
        {/* Header and Tab Switching Logic */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Career Hub</h1>
            <p className="text-gray-500 mt-1 font-medium">Placements, Internships & Senior Insights</p>
          </div>

          <div className="flex bg-gray-200/50 p-1 rounded-xl w-fit border border-gray-200/50">
            <button 
              onClick={() => { setLoading(true); setActiveTab('jobs'); }}
              className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'jobs' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Job Board
            </button>
            <button 
              onClick={() => { setLoading(true); setActiveTab('experiences'); }}
              className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'experiences' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Experiences
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'jobs' ? (
              jobs.length === 0 ? <EmptyState message="No current openings." /> : jobs.map((job) => <CareerCard key={job.id} job={job} />)
            ) : (
              experiences.length === 0 ? <EmptyState message="No experiences shared." /> : 
              experiences.map((exp) => (
                <ExperienceCard 
                  key={exp.id} 
                  experience={exp} 
                  onReadMore={() => setSelectedExp(exp)} 
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* RENDER MODAL IF AN EXPERIENCE IS SELECTED */}
      {selectedExp && (
        <ExperienceModal 
          experience={selectedExp} 
          onClose={() => setSelectedExp(null)} 
        />
      )}
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="bg-white p-16 rounded-2xl border border-dashed border-gray-300 text-center w-full col-span-full">
    <Search className="text-gray-300 mx-auto mb-4" size={48} />
    <p className="text-gray-500 font-bold text-lg">{message}</p>
  </div>
);

export default Career;