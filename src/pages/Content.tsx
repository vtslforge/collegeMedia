/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import { ImageIcon, X, Send, Loader2, Briefcase, MessageSquare, Newspaper } from "lucide-react";
import { createPost, addCareerOpportunity, addInterviewExperience } from "../database"; 
import { auth } from "../firebase";
import { uploadToCloudinary } from "../cloudinary";

const Content: React.FC = () => {
  const [postType, setPostType] = useState<"feed" | "job" | "experience">("feed");
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [text, setText] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>(""); 
  const [jobTitle, setJobTitle] = useState<string>(""); 
  const [ctc, setCtc] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [criteria, setCriteria] = useState<string>("");
  const [applyLink, setApplyLink] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const handlePost = async () => {
    if (!auth.currentUser) return alert("Please login");
    if (!text.trim() && !file) return;

    setLoading(true);
    try {
      let mediaUrl = "";
      if (file) mediaUrl = await uploadToCloudinary(file);

      const authorName = auth.currentUser.email!.split("@")[0];
      const authorId = auth.currentUser.uid;

      if (postType === "job") {
        await addCareerOpportunity({
          companyName: companyName || "Hidden Company",
          role: jobTitle || "Specialist",
          type: "Full-time",
          ctc: ctc || "Not Disclosed",
          location: "On-Campus",
          deadline: deadline || "See Description",
          criteria: criteria || "Check post details",
          applyLink: applyLink.startsWith("http") ? applyLink : `https://${applyLink}`,
          status: "Hiring"
        });
      } else if (postType === "experience") {
        await addInterviewExperience({
          companyName: companyName || "Company",
          authorName, authorId,
          difficulty: "Medium",
          content: text,
          rounds: ["General"]
        });
      } else {
        await createPost({
          authorId, authorName,
          communityId: null,
          type: "feed",
          text,
          media: mediaUrl ? [{ url: mediaUrl, type: file?.type || "image/png" }] : [],
          likes: []
        });
      }

      // Reset
      setText(""); setCompanyName(""); setJobTitle(""); setCtc("");
      setDeadline(""); setCriteria(""); setApplyLink(""); setFile(null);
      alert("Published successfully!");
    } catch {
      // 'err' removed here to satisfy linting
      alert("Error publishing post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto h-[94vh] flex flex-col justify-center space-y-6 font-inter py-4 px-1">
      <div className="rounded-xl overflow-hidden bg-foregroundBg border border-white/10 shadow-2xl">
        
        {/* Selector Tabs */}
        <div className="flex bg-cardsBg/30 border-b border-white/5">
          {[
            { id: "feed", label: "Feed", icon: <Newspaper size={14} /> },
            { id: "job", label: "Job", icon: <Briefcase size={14} /> },
            { id: "experience", label: "Experience", icon: <MessageSquare size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPostType(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold transition-all ${
                postType === tab.id ? "text-white bg-white/5 border-b-2 border-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {postType === "job" && (
            <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-300">
              <input placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="bg-white border border-gray-200 rounded-lg p-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" />
              <input placeholder="Role (e.g. SDE)" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="bg-white border border-gray-200 rounded-lg p-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" />
              <input placeholder="CTC (e.g. 12 LPA)" value={ctc} onChange={e => setCtc(e.target.value)} className="bg-white border border-gray-200 rounded-lg p-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" />
              <input placeholder="Deadline (e.g. 10th Feb)" value={deadline} onChange={e => setDeadline(e.target.value)} className="bg-white border border-gray-200 rounded-lg p-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" />
              <input placeholder="Criteria" value={criteria} onChange={e => setCriteria(e.target.value)} className="bg-white border border-gray-200 rounded-lg p-2.5 text-black text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" />
              <input placeholder="Apply Link (URL)" value={applyLink} onChange={e => setApplyLink(e.target.value)} className="bg-white border border-gray-200 rounded-lg p-2.5 text-blue-600 font-medium text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" />
            </div>
          )}

          {postType === "experience" && (
            <input placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" />
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={postType === "job" ? "Add additional notes or instructions..." : "Share your thoughts..."}
            className="w-full bg-transparent text-black text-lg placeholder-gray-400 outline-none resize-none min-h-30 pt-2"
          />

          {file && postType === "feed" && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <button onClick={() => setFile(null)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full transition-colors hover:bg-red-500"><X size={16}/></button>
              <img src={URL.createObjectURL(file)} className="w-full max-h-60 object-cover" />
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-black/5 flex items-center justify-between border-t border-white/5">
          <button 
            disabled={postType !== "feed"}
            onClick={() => fileInputRef.current?.click()} 
            className={`p-2 rounded-md transition-colors ${postType === "feed" ? "text-gray-500 hover:text-blue-600" : "text-gray-300 cursor-not-allowed"}`}
          >
            <ImageIcon size={20} />
            <input type="file" ref={fileInputRef} hidden onChange={e => setFile(e.target.files?.[0] || null)} />
          </button>

          <button
            onClick={handlePost}
            disabled={loading || (!text.trim() && postType === 'feed')}
            className="bg-black text-white px-8 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {loading ? "Posting..." : "Publish Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Content;