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
          status: "Hiring",
        });
      } else if (postType === "experience") {
        await addInterviewExperience({
          companyName: companyName || "Company",
          authorName,
          authorId,
          difficulty: "Medium",
          content: text,
          rounds: ["General"],
        });
      } else {
        await createPost({
          authorId,
          authorName,
          communityId: null,
          type: "feed",
          text,
          media: mediaUrl ? [{ url: mediaUrl, type: file?.type || "image/png" }] : [],
          likes: [],
        });
      }

      // Reset
      setText("");
      setCompanyName("");
      setJobTitle("");
      setCtc("");
      setDeadline("");
      setCriteria("");
      setApplyLink("");
      setFile(null);
      alert("Published successfully!");
    } catch {
      alert("Error publishing post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-6vh)] font-inter px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-6">
      {/* Atmospheric background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_10%,#d7f0ff_0%,transparent_60%),radial-gradient(50%_40%_at_90%_20%,#ffe9c2_0%,transparent_60%),linear-gradient(180deg,#f7fafc_0%,#e8eef5_100%)]" />
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute right-0 top-24 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="mb-6 lg:pb-24">
        <h1 className="text-3xl md:text-4xl lg:text-5xl text-center font-semibold text-slate-900 tracking-tight">Presidency University Centralized App</h1>
        <p className="text-sm md:text-base text-slate-500 mt-2 text-center">Create, share, and organize everything campus in one place.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1.45fr] gap-4 md:gap-6 xl:gap-8 w-full min-h-full items-stretch min-w-0">
        {/* Left rail */}
        <div className="min-w-0 flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/70">
            <div>
              <p className="text-xs tracking-[0.24em] uppercase text-slate-500">Create</p>
              <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 leading-tight">
                Publish something
                <span className="block text-slate-500">that moves people forward.</span>
              </h1>
            </div>
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live in community
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "feed", label: "Feed", icon: <Newspaper size={14} /> },
              { id: "job", label: "Job", icon: <Briefcase size={14} /> },
              { id: "experience", label: "Experience", icon: <MessageSquare size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPostType(tab.id as any)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all border ${
                  postType === tab.id
                    ? "bg-slate-900 text-white border-slate-900 "
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4 rounded-3xl bg-white/80 border border-slate-200/80 p-5 lg:p-6 backdrop-blur">
            {postType === "job" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                <input
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-white/90 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 placeholder-slate-400"
                />
                <input
                  placeholder="Role (e.g. SDE)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="bg-white/90 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 placeholder-slate-400"
                />
                <input
                  placeholder="CTC (e.g. 12 LPA)"
                  value={ctc}
                  onChange={(e) => setCtc(e.target.value)}
                  className="bg-white/90 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 placeholder-slate-400"
                />
                <input
                  placeholder="Deadline (e.g. 10th Feb)"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-white/90 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 placeholder-slate-400"
                />
                <input
                  placeholder="Criteria"
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  className="bg-white/90 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm col-span-1 sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20 placeholder-slate-400"
                />
                <input
                  placeholder="Apply Link (URL)"
                  value={applyLink}
                  onChange={(e) => setApplyLink(e.target.value)}
                  className="bg-white/90 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm col-span-1 sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20 placeholder-slate-400"
                />
              </div>
            )}

            {postType === "experience" && (
              <input
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-white/90 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 placeholder-slate-400"
              />
            )}

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={postType === "job" ? "Add additional notes or instructions..." : "Share your thoughts..."}
              className="w-full bg-white/80 text-slate-900 text-base placeholder-slate-400 outline-none resize-none min-h-36 rounded-2xl border border-slate-200 p-4 focus:ring-2 focus:ring-slate-900/20"
            />

            {file && postType === "feed" && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200  bg-white">
                <button
                  onClick={() => setFile(null)}
                  className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full transition-colors hover:bg-red-500"
                >
                  <X size={16} />
                </button>
                <img src={URL.createObjectURL(file)} className="w-full max-h-64 object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Right rail */}
        <div className="rounded-3xl p-6 lg:p-8 bg-slate-900 text-white relative overflow-hidden h-full flex flex-col">
          <div className="absolute -top-24 -right-10 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />

          <div className="relative flex-1 flex flex-col">
            <p className="text-xs tracking-[0.24em] uppercase text-slate-400">Preview</p>
            <h2 className="text-2xl lg:text-3xl font-semibold mt-2">Your post, refined.</h2>
            <p className="text-slate-300 mt-2 text-sm">
              Craft a clear headline, add context, and publish when it feels right. Attach media to make it pop.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/70">
                <div className="text-xs text-slate-400">Post type</div>
                <div className="text-xs font-semibold text-amber-300">
                  {postType === "feed" ? "Feed" : postType === "job" ? "Career Opportunity" : "Interview Experience"}
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-200 line-clamp-6">
                {text.trim() ? text : "Start typing on the left to see a live preview here."}
              </div>
              {postType === "job" && (
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div>
                    <div className="text-slate-500">Company</div>
                    <div className="font-semibold text-white">{companyName || "Hidden Company"}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Role</div>
                    <div className="font-semibold text-white">{jobTitle || "Specialist"}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">CTC</div>
                    <div className="font-semibold text-white">{ctc || "Not Disclosed"}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Deadline</div>
                    <div className="font-semibold text-white">{deadline || "See Description"}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
              <button
                disabled={postType !== "feed"}
                onClick={() => fileInputRef.current?.click()}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  postType === "feed"
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-white/5 text-slate-500 cursor-not-allowed"
                }`}
              >
                <ImageIcon size={16} />
                Add media
                <input type="file" ref={fileInputRef} hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </button>

              <button
                onClick={handlePost}
                disabled={loading || (!text.trim() && postType === "feed")}
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-slate-900 px-6 py-2.5 text-sm font-bold  transition-all hover:bg-amber-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {loading ? "Posting..." : "Publish Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;

















