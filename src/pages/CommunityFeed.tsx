import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { 
  getCommunity, 
  listenCommunityPosts, 
  createPost, 
  kickMember,
  leaveCommunity,
  deleteCommunity, // <--- IMPORT THIS
  type Community,
  type Post 
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
      likes: []
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

  // --- NEW DELETE FUNCTION ---
  const handleDelete = async () => {
    if (!id || !confirm("⚠️ DANGER: Are you sure? This will delete the community forever!")) return;
    
    await deleteCommunity(id);
    navigate("/home/community");
  };

  if (!community) return <div className="p-8">Loading...</div>;

  const isOwner = community.ownerId === currentUser?.uid;
  const canPost = community.allowMemberPosts || isOwner;

  const displayedPosts = activeTab === "events" 
    ? posts.filter(p => p.type === "event") 
    : posts;

  return (
    <div className="max-w-3xl mx-auto pb-20 flex flex-col mt-[5vh] ">
      
      {/* 1. HEADER */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-400 to-purple-500"></div>
        
        {/* Top Controls */}
        <div className="flex justify-between items-center mb-2">
            <button onClick={() => navigate("/home/community")} className="text-sm text-gray-500 hover:text-black">
            &larr; Back
            </button>

            <div className="flex gap-2">
                {/* LEAVE BUTTON (For Members) */}
                {!isOwner && (
                    <button 
                        onClick={handleLeave} 
                        className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded border border-transparent hover:border-red-100 transition-colors"
                    >
                        Leave
                    </button>
                )}

                {/* DELETE BUTTON (For Owner) */}
                {isOwner && (
                    <button 
                        onClick={handleDelete} 
                        className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors shadow-sm"
                    >
                        Delete Community
                    </button>
                )}
            </div>
        </div>

        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
                <p className="text-gray-600 mt-1">{community.description}</p>
            </div>
            {isOwner && <span className="bg-black text-white text-xs px-2 py-1 rounded h-fit">Admin View</span>}
        </div>
      </div>

      {/* 2. TABS */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button 
            onClick={() => setActiveTab("feed")}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'feed' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
        >
            Feed
        </button>
        <button 
            onClick={() => setActiveTab("events")}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'events' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500'}`}
        >
            📅 Events
        </button>
        <button 
            onClick={() => setActiveTab("members")}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'members' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
            👥 Members ({community.members.length})
        </button>
      </div>

      {/* 3. CONTENT AREA */}
      
      {/* --- CREATE POST --- */}
      {activeTab !== 'members' && canPost && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <textarea
            className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none text-sm"
            placeholder={isEvent ? "Describe the event details..." : "What's on your mind?"}
            rows={2}
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
          />
          <div className="flex justify-between items-center mt-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                    type="checkbox" 
                    checked={isEvent} 
                    onChange={(e) => setIsEvent(e.target.checked)}
                    className="accent-orange-500 w-4 h-4"
                />
                <span className={`text-xs font-bold ${isEvent ? 'text-orange-600' : 'text-gray-400'}`}>
                    Mark as Event
                </span>
            </label>
            <button 
              onClick={handlePost}
              disabled={!newPostText}
              className={`px-6 py-1.5 text-white text-sm rounded-lg font-medium transition-colors ${isEvent ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50`}
            >
              Post {isEvent ? 'Event' : ''}
            </button>
          </div>
        </div>
      )}

      {/* --- POSTS LIST --- */}
      {activeTab !== 'members' && (
          <div className="space-y-4">
            {displayedPosts.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                    {activeTab === 'events' ? "No upcoming events." : "No posts yet."}
                </div>
            ) : (
                displayedPosts.map((post) => (
                    <PostItem key={post.id} post={post} />
                ))
            )}
          </div>
      )}

      {/* --- MEMBERS LIST --- */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {community.members.map((memberId) => (
                <div key={memberId} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                            U
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                                {memberId === community.ownerId ? "Community Owner (You)" : `User ID: ${memberId.slice(0, 6)}...`}
                            </span>
                            {memberId === community.ownerId && <span className="text-[10px] text-gray-500 uppercase tracking-wide">Admin</span>}
                        </div>
                    </div>
                    
                    {/* Kick Button (Only for Owner, cannot kick self) */}
                    {isOwner && memberId !== community.ownerId && (
                        <button 
                            onClick={() => handleKick(memberId)}
                            className="px-3 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                        >
                            Kick
                        </button>
                    )}
                </div>
            ))}
        </div>
      )}

    </div>
  );
};

export default CommunityFeed;