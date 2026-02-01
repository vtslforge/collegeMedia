import React, { useState, useRef } from "react";
import { Image as ImageIcon, X, Send, Loader2 } from "lucide-react";
import { createPost } from "../database";
import { auth } from "../firebase";
import { uploadToCloudinary } from "../cloudinary";

const Content: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = async () => {
    if (!auth.currentUser) { alert("You must be logged in"); return; }
    if (!text.trim() && !file) { return; }

    setLoading(true);
    try {
      let media: { url: string; type: string } | null = null;
      if (file) {
        const url = await uploadToCloudinary(file);
        media = { url, type: file.type };
      }

      await createPost({
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.email!.split("@")[0],
        communityId: null,
        type: "feed",
        text,
        media: media ? [media] : [],
        likes: []
      });

      setText("");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-2">
      <div className="bg-[#2b2d31] rounded-xl border border-[#1e1f22] shadow-2xl overflow-hidden">
        
        {/* Input Section */}
        <div className="p-4 flex gap-4">
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-amber-600 flex-shrink-0 flex items-center justify-center font-bold text-white ring-2 ring-[#1e1f22]">
            {auth.currentUser?.email?.[0].toUpperCase()}
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder="What's happening on campus?" 
              className="w-full bg-transparent text-[#dbdee1] text-base placeholder-[#949ba4] outline-none resize-none pt-2 min-h-[80px]"
            />

            {/* Image Preview Window */}
            {file && (
              <div className="relative rounded-lg overflow-hidden border border-[#1e1f22] bg-[#1e1f22] animate-in zoom-in-95 duration-200">
                <button 
                  onClick={() => setFile(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-500 text-white rounded-full transition-all z-10"
                >
                  <X size={14} />
                </button>
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Upload preview" 
                  className="w-full max-h-[350px] object-cover" 
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-4 py-3 bg-[#232428] border-t border-[#1e1f22] flex items-center justify-between">
          <div className="flex items-center">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              className="hidden" 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 text-[#b5bac1] hover:text-white hover:bg-[#35373c] rounded-md transition-all text-sm font-medium"
            >
              <ImageIcon size={18} className="text-amber-500" />
              <span>Image</span>
            </button>
          </div>

          <button 
            onClick={handlePost} 
            disabled={loading || (!text.trim() && !file)} 
            className={`
              flex items-center gap-2 px-5 py-2 rounded-md font-bold text-sm transition-all
              ${loading || (!text.trim() && !file)
                ? "bg-[#4e5058] text-[#80848e] cursor-not-allowed opacity-50"
                : "bg-amber-600 hover:bg-amber-500 text-white active:scale-95 shadow-lg shadow-amber-900/10"}
            `}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Content;