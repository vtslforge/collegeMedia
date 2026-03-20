/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  createCommunity,
  listenCommunities,
  joinCommunity,
  type Community as CommunityType,
} from "../database";

const Community = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<CommunityType[]>([]);
  const [activeTab, setActiveTab] = useState<"my" | "explore">("my"); // TABS
  const [showCreateModal, setShowCreateModal] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = listenCommunities(setCommunities);
    return () => unsubscribe();
  }, []);

  // Filter Communities based on membership
  const myCommunities = communities.filter((c) => c.members.includes(currentUser?.uid || ""));
  const exploreCommunities = communities.filter((c) => !c.members.includes(currentUser?.uid || ""));

  const handleJoin = async (id: string) => {
    if (!currentUser) return;
    await joinCommunity(id, currentUser.uid);
  };

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
            <p className="text-xs tracking-[0.24em] uppercase text-slate-500">Communities</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Find your people</h1>
            <p className="text-sm text-slate-500 mt-2">Join conversations, share ideas, and build circles on campus.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-white/80 p-1 rounded-full border border-slate-200 backdrop-blur">
              <button
                onClick={() => setActiveTab("my")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "my" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                My Communities
              </button>
              <button
                onClick={() => setActiveTab("explore")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "explore" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Explore & Create
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-300 transition-colors"
            >
              <span>+</span> New Community
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.4fr] gap-4 md:gap-6 xl:gap-8 min-w-0">
          <div className="min-w-0">
            {/* --- TAB 1: MY COMMUNITIES (VISIT) --- */}
            {activeTab === "my" && (
              <div>
                {myCommunities.length === 0 ? (
                  <div className="text-center py-16 bg-white/80 rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500 mb-4">You haven't joined any communities yet.</p>
                    <button
                      onClick={() => setActiveTab("explore")}
                      className="text-slate-900 font-semibold hover:underline"
                    >
                      Go to Explore
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {myCommunities.map((comm) => (
                      <div
                        key={comm.id}
                        onClick={() => navigate(`/home/community/${comm.id}`)}
                        className="group cursor-pointer rounded-3xl p-5 border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.6))] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden"
                      ><div className="absolute -top-12 -right-10 h-28 w-28 rounded-full bg-amber-300/25 blur-2xl" /><div className="absolute -bottom-14 -left-12 h-28 w-28 rounded-full bg-sky-300/25 blur-2xl" />
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-900 transition-colors">
                            {comm.name}
                          </h3>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-full font-semibold">
                            Member
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mb-5 line-clamp-2">
                          {comm.description || "No description."}
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">Visit Community<span className="text-slate-400 group-hover:text-slate-900 transition-colors">→</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- TAB 2: EXPLORE (JOIN / CREATE) --- */}
            {activeTab === "explore" && (
              <div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {exploreCommunities.map((comm) => (
                    <div key={comm.id} className="group rounded-3xl p-5 border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.6))] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden"><div className="absolute -top-12 -right-10 h-28 w-28 rounded-full bg-amber-300/25 blur-2xl" /><div className="absolute -bottom-14 -left-12 h-28 w-28 rounded-full bg-sky-300/25 blur-2xl" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{comm.name}</h3>
                      <p className="text-slate-600 text-sm mb-5 line-clamp-2">
                        {comm.description || "No description."}
                      </p>
                      <div className="text-xs text-slate-400 mb-4">
                        {comm.members.length} Members • By {comm.ownerName}
                      </div>
                      <button
                        onClick={() => handleJoin(comm.id!)}
                        className="w-full py-2 rounded-full bg-white/80 text-slate-900 border border-slate-200 hover:bg-white font-semibold text-xs transition-colors"
                      >
                        Join Community
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl p-6 lg:p-8 bg-slate-900 text-white relative overflow-hidden h-full flex flex-col self-start lg:sticky lg:top-6">
            <div className="absolute -top-24 -right-10 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />

            <div className="relative flex-1 flex flex-col">
              <p className="text-xs tracking-[0.24em] uppercase text-slate-400">Discover</p>
              <h2 className="text-2xl font-semibold mt-2">Build your circle.</h2>
              <p className="text-slate-300 mt-2 text-sm">
                Communities keep campus conversations organized, searchable, and easy to join.
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Quick tips</div>
                <div className="mt-2 text-sm text-slate-200">Name it clearly, add a short description, invite a few friends.</div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Best practice</div>
                <div className="mt-2 text-sm text-slate-200">
                  Keep your community focused. Smaller groups build stronger engagement.
                </div>
              </div>

              <div className="mt-auto pt-6 text-xs uppercase tracking-[0.3em] text-slate-500">Presidency University Centralized App</div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && <CreateCommunityModal close={() => setShowCreateModal(false)} currentUser={currentUser} />}
    </div>
  );
};

const CreateCommunityModal = ({ close, currentUser }: { close: () => void; currentUser: any }) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [allowPosts, setAllowPosts] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !currentUser) return;
    setLoading(true);

    try {
      await createCommunity({
        name,
        description: desc,
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || "Anonymous",
        allowMemberPosts: allowPosts,
      });
      close();
    } catch (err) {
      console.error(err);
      alert("Failed to create community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Create Community</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tech Enthusiasts"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:outline-none"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's this community about?"
              rows={3}
            />
          </div>

          <div className="mb-6 bg-gray-50 p-3 rounded border border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowPosts}
                onChange={(e) => setAllowPosts(e.target.checked)}
                className="w-5 h-5 text-black rounded focus:ring-black"
              />
              <span className="text-sm text-gray-700">Allow members to post?</span>
            </label>
            <p className="text-xs text-gray-400 mt-1 ml-8">
              If unchecked, only you (the owner) can create posts.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={close} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50">
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Community;








