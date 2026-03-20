import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  getCommunity,
  listenCommunityPosts,
  createPost,
  kickMember,
  leaveCommunity,
  deleteCommunity,
  type Community,
  type Post,
} from "../database";
import PostItem from "./PostItem";

const CommunityFeed = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  // Data States
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  // UI States
  const [activeTab, setActiveTab] = useState<"feed" | "events" | "members">("feed");
  const [newPostText, setNewPostText] = useState("");
  const [isEvent, setIsEvent] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Fetch Community
    getCommunity(id).then((data) => {
      if (!data) navigate("/home/community");
      setCommunity(data);
    });

    // Listen to Posts
    const unsubscribe = listenCommunityPosts(id, setPosts);
    return () => unsubscribe();
  }, [id, navigate]);

  const handlePost = async () => {
    if (!newPostText.trim() || !currentUser || !id) return;

    await createPost({
      authorId: currentUser.uid,
      authorName: currentUser.displayName || "User",
      communityId: id,
      type: isEvent ? "event" : "feed",
      text: newPostText,
      media: [],
      likes: [],
    });
    setNewPostText("");
    setIsEvent(false);
    setActiveTab(isEvent ? "events" : "feed");
  };

  const handleKick = async (memberId: string) => {
    if (!id || !confirm("Are you sure you want to kick this user?")) return;
    await kickMember(id, memberId);
    const updated = await getCommunity(id);
    if (updated) setCommunity(updated);
  };

  const handleLeave = async () => {
    if (!id || !currentUser || !confirm("Are you sure you want to leave this community?")) return;
    await leaveCommunity(id, currentUser.uid);
    navigate("/home/community");
  };

  const handleDelete = async () => {
    if (!id || !confirm("⚠️ DANGER: Are you sure? This will delete the community forever!")) return;

    await deleteCommunity(id);
    navigate("/home/community");
  };

  if (!community) return <div className="p-8">Loading...</div>;

  const isOwner = community.ownerId === currentUser?.uid;
  const canPost = community.allowMemberPosts || isOwner;

  const displayedPosts = activeTab === "events" ? posts.filter((p) => p.type === "event") : posts;

  return (
    <div className="relative w-full min-h-[calc(100vh-6vh)] font-inter px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-6">
      {/* Atmospheric background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_10%,#d7f0ff_0%,transparent_60%),radial-gradient(50%_40%_at_90%_20%,#ffe9c2_0%,transparent_60%),linear-gradient(180deg,#f7fafc_0%,#e8eef5_100%)]" />
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute right-0 top-24 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="rounded-3xl bg-white/80 border border-slate-200/80 p-6 lg:p-8 backdrop-blur mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => navigate("/home/community")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-colors"
            >
              ← Back to Communities
            </button>

            <div className="flex gap-2">
              {!isOwner && (
                <button
                  onClick={handleLeave}
                  className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1 rounded-full border border-rose-100 transition-colors"
                >
                  Leave
                </button>
              )}

              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1 rounded-full transition-colors shadow-sm"
                >
                  Delete Community
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-start justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.24em] uppercase text-slate-500">Community</p>
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mt-2">{community.name}</h1>
              <p className="text-slate-500 mt-2 max-w-2xl">{community.description}</p>
            </div>
            {isOwner && <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded-full h-fit">Admin View</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.4fr] gap-4 md:gap-6 xl:gap-8 min-w-0">
          <div className="min-w-0">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveTab("feed")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                  activeTab === "feed"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white/80 text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                Feed
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                  activeTab === "events"
                    ? "bg-amber-500 text-slate-900 border-amber-400"
                    : "bg-white/80 text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                  activeTab === "members"
                    ? "bg-sky-500 text-white border-sky-400"
                    : "bg-white/80 text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                Members ({community.members.length})
              </button>
            </div>

            {/* Create Post */}
            {activeTab !== "members" && canPost && (
              <div className="rounded-3xl bg-white/80 border border-slate-200/80 p-5 lg:p-6 backdrop-blur mb-6">
                <textarea
                  className="w-full p-3 bg-white rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900/10 focus:outline-none resize-none text-sm"
                  placeholder={isEvent ? "Describe the event details..." : "What's on your mind?"}
                  rows={3}
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                />
                <div className="flex flex-wrap justify-between items-center mt-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isEvent}
                      onChange={(e) => setIsEvent(e.target.checked)}
                      className="accent-amber-500 w-4 h-4"
                    />
                    <span className={`text-xs font-bold ${isEvent ? "text-amber-600" : "text-slate-400"}`}>
                      Mark as Event
                    </span>
                  </label>
                  <button
                    onClick={handlePost}
                    disabled={!newPostText}
                    className={`px-5 py-2 text-xs rounded-full font-semibold transition-colors ${
                      isEvent ? "bg-amber-500 hover:bg-amber-400 text-slate-900" : "bg-slate-900 hover:bg-slate-800 text-white"
                    } disabled:opacity-50`}
                  >
                    Post {isEvent ? "Event" : ""}
                  </button>
                </div>
              </div>
            )}

            {/* Posts List */}
            {activeTab !== "members" && (
              <div className="space-y-4">
                {displayedPosts.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-white/70 rounded-2xl border border-dashed">
                    {activeTab === "events" ? "No upcoming events." : "No posts yet."}
                  </div>
                ) : (
                  displayedPosts.map((post) => <PostItem key={post.id} post={post} />)
                )}
              </div>
            )}

            {/* Members List */}
            {activeTab === "members" && (
              <div className="rounded-3xl bg-white/80 border border-slate-200/80 overflow-hidden">
                {community.members.map((memberId) => (
                  <div key={memberId} className="flex justify-between items-center p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-xs font-bold">
                        U
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">
                          {memberId === community.ownerId ? "Community Owner (You)" : `User ID: ${memberId.slice(0, 6)}...`}
                        </span>
                        {memberId === community.ownerId && (
                          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Admin</span>
                        )}
                      </div>
                    </div>

                    {isOwner && memberId !== community.ownerId && (
                      <button
                        onClick={() => handleKick(memberId)}
                        className="px-3 py-1 text-xs text-rose-600 border border-rose-200 rounded-full hover:bg-rose-50"
                      >
                        Kick
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl p-6 lg:p-8 bg-slate-900 text-white relative overflow-hidden h-full flex flex-col self-start lg:sticky lg:top-6">
            <div className="absolute -top-24 -right-10 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />

            <div className="relative flex-1 flex flex-col">
              <p className="text-xs tracking-[0.24em] uppercase text-slate-400">Community</p>
              <h2 className="text-2xl font-semibold mt-2">Keep it active.</h2>
              <p className="text-slate-300 mt-2 text-sm">
                Encourage meaningful posts, highlight events, and welcome new members.
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Tip</div>
                <div className="mt-2 text-sm text-slate-200">Pin a weekly prompt to spark engagement.</div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Reminder</div>
                <div className="mt-2 text-sm text-slate-200">Events show up for everyone. Keep them up to date.</div>
              </div>

              <div className="mt-auto pt-6 text-xs uppercase tracking-[0.3em] text-slate-500">Presidency University Centralized App</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;

