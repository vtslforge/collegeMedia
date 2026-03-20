import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Calendar,
  GraduationCap,
  ArrowUpRight,
  MessageSquare,
  Layers,
  User,
  Search,
  X,
} from "lucide-react";
import {
  listenCareerOpportunities,
  listenInterviewExperiences,
  type CareerOpportunity,
  type InterviewExperience,
} from "../database";

// --- 1. POPUP / MODAL COMPONENT ---
interface ModalProps {
  experience: InterviewExperience;
  onClose: () => void;
}

const ExperienceModal: React.FC<ModalProps> = ({ experience, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/90 border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-slate-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{experience.companyName}</h2>
            <p className="text-amber-600 font-semibold text-sm">Interview Experience</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
              <User size={22} className="text-slate-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Shared by</p>
              <p className="font-semibold text-slate-900 text-lg">{experience.authorName}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs uppercase tracking-[0.24em] text-slate-500 font-semibold mb-3">Interview Rounds</h4>
              <div className="flex flex-wrap gap-2">
                {experience.rounds.map((round, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-100">
                    {round}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.24em] text-slate-500 font-semibold mb-3">Detailed Insight</h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">{experience.content}</p>
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
    <div className="group rounded-3xl p-5 border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.6))] shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 font-bold text-lg uppercase shrink-0">
            {job.companyName?.[0] || "?"}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-slate-900 font-semibold text-lg leading-tight truncate" title={job.role}>
              {job.role}
            </h3>
            <p className="text-slate-500 text-sm truncate">{job.companyName}</p>
          </div>
        </div>
        <span
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase shrink-0 ${
            job.status === "Hiring" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {job.status}
        </span>
      </div>

      <div className="space-y-3 mb-5 text-slate-600 text-sm">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-slate-400" />
          <span>
            Package: <span className="font-medium text-slate-900">{job.ctc}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap size={16} className="text-slate-400" />
          <span className="line-clamp-1">
            Criteria: <span className="font-medium text-slate-900">{job.criteria}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <span>
            Deadline: <span className="font-medium text-slate-900">{job.deadline}</span>
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          const url = job.applyLink.startsWith("http") ? job.applyLink : `https://${job.applyLink}`;
          window.open(url, "_blank", "noopener,noreferrer");
        }}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
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
    Easy: "bg-emerald-100 text-emerald-700",
    Medium: "bg-amber-100 text-amber-700",
    Hard: "bg-rose-100 text-rose-700",
  } as const;

  return (
    <div className="rounded-3xl p-5 border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.6))] shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="overflow-hidden">
          <h4 className="text-slate-900 font-semibold text-lg truncate">{experience.companyName}</h4>
          <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
            <User size={12} />
            <span className="truncate font-medium">Shared by {experience.authorName}</span>
          </div>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase shrink-0 ${
            difficultyColor[experience.difficulty as keyof typeof difficultyColor] || "bg-slate-100 text-slate-600"
          }`}
        >
          {experience.difficulty}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {experience.rounds.slice(0, 2).map((round, index) => (
          <span key={index} className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] px-2 py-1 rounded-full font-medium">
            <Layers size={10} />
            {round}
          </span>
        ))}
        {experience.rounds.length > 2 && <span className="text-[10px] text-slate-400 mt-1">+{experience.rounds.length - 2} more</span>}
      </div>

      <div className="bg-white/80 rounded-2xl border border-slate-200 p-3 mb-4">
        <div className="flex gap-2">
          <MessageSquare size={14} className="text-amber-500 mt-1 shrink-0" />
          <p className="text-slate-700 text-sm italic line-clamp-4 leading-relaxed">"{experience.content}"</p>
        </div>
      </div>

      <button onClick={onReadMore} className="text-slate-900 text-xs font-semibold hover:underline w-fit active:opacity-70">
        Read Full Entry
      </button>
    </div>
  );
};

// --- 4. MAIN CAREER PAGE ---
const Career: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"jobs" | "experiences">("jobs");
  const [jobs, setJobs] = useState<CareerOpportunity[]>([]);
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedExp, setSelectedExp] = useState<InterviewExperience | null>(null);

  useEffect(() => {
    const unsubJobs = listenCareerOpportunities((data) => {
      setJobs(data);
      if (activeTab === "jobs") setLoading(false);
    });

    const unsubExp = listenInterviewExperiences((data) => {
      setExperiences(data);
      if (activeTab === "experiences") setLoading(false);
    });

    return () => {
      unsubJobs();
      unsubExp();
    };
  }, [activeTab]);

  return (
    <div className="relative w-full min-h-[calc(100vh-6vh)] font-inter px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-6">
      {/* Atmospheric background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_10%,#d7f0ff_0%,transparent_60%),radial-gradient(50%_40%_at_90%_20%,#ffe9c2_0%,transparent_60%),linear-gradient(180deg,#f7fafc_0%,#e8eef5_100%)]" />
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute right-0 top-24 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs tracking-[0.24em] uppercase text-slate-500">Career Hub</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Placements & Experiences</h1>
            <p className="text-sm text-slate-500 mt-2">Openings, internships, and senior insights in one place.</p>
          </div>

          <div className="flex bg-white/80 p-1 rounded-full border border-slate-200 backdrop-blur w-fit">
            <button
              onClick={() => {
                setLoading(true);
                setActiveTab("jobs");
              }}
              className={`px-6 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === "jobs" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Job Board
            </button>
            <button
              onClick={() => {
                setLoading(true);
                setActiveTab("experiences");
              }}
              className={`px-6 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === "experiences" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Experiences
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "jobs" ? (
              jobs.length === 0 ? (
                <EmptyState message="No current openings." />
              ) : (
                jobs.map((job) => <CareerCard key={job.id} job={job} />)
              )
            ) : experiences.length === 0 ? (
              <EmptyState message="No experiences shared." />
            ) : (
              experiences.map((exp) => <ExperienceCard key={exp.id} experience={exp} onReadMore={() => setSelectedExp(exp)} />)
            )}
          </div>
        )}
      </div>

      {selectedExp && <ExperienceModal experience={selectedExp} onClose={() => setSelectedExp(null)} />}
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="bg-white/80 p-16 rounded-3xl border border-dashed border-slate-300 text-center w-full col-span-full">
    <Search className="text-slate-300 mx-auto mb-4" size={48} />
    <p className="text-slate-500 font-semibold text-lg">{message}</p>
  </div>
);

export default Career;
