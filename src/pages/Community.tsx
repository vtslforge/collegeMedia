/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { 
  createCommunity, 
  listenCommunities, 
  joinCommunity, 
  type Community as CommunityType 
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
  const myCommunities = communities.filter(c => c.members.includes(currentUser?.uid || ""));
  const exploreCommunities = communities.filter(c => !c.members.includes(currentUser?.uid || ""));

  const handleJoin = async (id: string) => {
    if (!currentUser) return;
    await joinCommunity(id, currentUser.uid);
    // Auto-switch to "My Communities" after joining could be a nice touch
  };

  return (
    <div className="p-6 max-w-5xl mx-auto font-inter mt-[5vh]">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Communities</h1>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "my" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Communities
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "explore" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Explore & Create
          </button>
        </div>
      </div>

      {/* --- TAB 1: MY COMMUNITIES (VISIT) --- */}
      {activeTab === "my" && (
        <div>
          {myCommunities.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">You haven't joined any communities yet.</p>
              <button onClick={() => setActiveTab("explore")} className="text-blue-600 font-medium hover:underline">
                Go to Explore
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myCommunities.map((comm) => (
                <div 
                  key={comm.id} 
                  onClick={() => navigate(`/home/community/${comm.id}`)} // CLICK TO VISIT
                  className="group cursor-pointer border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {comm.name}
                    </h3>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                      Member
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {comm.description || "No description."}
                  </p>
                  <div className="text-sm font-medium text-blue-600">
                    Visit Community &rarr;
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: EXPLORE (JOIN / CREATE) --- */}
      {activeTab === "explore" && (
        <div>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <span>+</span> Create New Community
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exploreCommunities.map((comm) => (
              <div key={comm.id} className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{comm.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {comm.description || "No description."}
                </p>
                <div className="text-xs text-gray-400 mb-4">
                  {comm.members.length} Members • By {comm.ownerName}
                </div>
                <button 
                  onClick={() => handleJoin(comm.id!)}
                  className="w-full py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                >
                  Join Community
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reuse your existing Create Modal code here */}
      {showCreateModal && (
        <CreateCommunityModal 
          close={() => setShowCreateModal(false)} 
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

// ... Include your CreateCommunityModal component from the previous step here ...
// (I omitted it for brevity, but keep it at the bottom of the file)
const CreateCommunityModal = ({ close, currentUser }: { close: () => void, currentUser: any }) => {
    // ... (Same as previous code) ...
    // Just ensure createCommunity is imported
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
            allowMemberPosts: allowPosts
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Create Community</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:outline-none"
                  value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tech Enthusiasts" required 
                />
              </div>
    
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:outline-none"
                  value={desc} onChange={e => setDesc(e.target.value)} placeholder="What's this community about?" rows={3}
                />
              </div>
    
              <div className="mb-6 bg-gray-50 p-3 rounded border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={allowPosts} 
                    onChange={e => setAllowPosts(e.target.checked)}
                    className="w-5 h-5 text-black rounded focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">Allow members to post?</span>
                </label>
                <p className="text-xs text-gray-400 mt-1 ml-8">
                  If unchecked, only you (the owner) can create posts.
                </p>
              </div>
    
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={close} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
};

export default Community;