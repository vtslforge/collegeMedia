/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, memo } from "react";

import { auth } from "../firebase";

import { toggleLike, addComment, listenComments } from "../database";

import { Heart, MessageSquare, Send, Loader2, Calendar } from "lucide-react";

// Sub-component to handle smooth image loading and prevent "jumping" UI

const MediaRenderer = ({ m }: { m: any }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Cloudinary Optimization

  const optimizedUrl = m.url.includes("cloudinary") ? m.url.replace("/upload/", "/upload/w_800,q_auto,f_auto/") : m.url;

  return (
    <div className="relative mt-3 w-full bg-[#1e1f22] rounded-lg overflow-hidden border border-[#35373c] min-h-[250px] flex items-center justify-center">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#2b2d31] animate-pulse">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
        </div>
      )}

      <img
        src={optimizedUrl}
        alt="post media"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full max-h-[500px] object-contain transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

const PostItem = ({ post }: { post: any }) => {
  const currentUser = auth.currentUser;

  const [showComments, setShowComments] = useState(false);

  const [comments, setComments] = useState<any[]>([]);

  const [commentText, setCommentText] = useState("");

  const likes = post.likes || [];

  const isLiked = currentUser && likes.includes(currentUser.uid);

  useEffect(() => {
    if (showComments && post.id) {
      const unsubscribe = listenComments(post.id, setComments);

      return () => unsubscribe();
    }
  }, [showComments, post.id]);

  const handleLike = async () => {
    if (!currentUser || !post.id) return;

    await toggleLike(post.id, currentUser.uid, !!isLiked);
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !currentUser || !post.id) return;

    await addComment(post.id, commentText, currentUser);

    setCommentText("");
  };

  const authorName = post.authorName || "Anonymous";

  return (
    <div className="bg-[#2b2d31] p-4 rounded-xl border border-[#1e1f22] shadow-xl mb-6 transition-all">
      {/* Header */}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner">{authorName.charAt(0).toUpperCase()}</div>

          <div className="flex flex-col">
            <span className="font-bold text-[#f2f3f5] text-sm hover:underline cursor-pointer">{authorName}</span>

            <span className="text-[10px] text-[#949ba4] flex items-center gap-1 uppercase font-semibold">
              {post.type === "event" && <Calendar size={10} className="text-orange-500" />}
              {post.type === "event" ? "Event" : "Feed"} • {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : "Just now"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}

      <p className="text-[#dbdee1] text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">{post.text}</p>

      {/* Media Rendering with fix for bad UX */}

      <div className="space-y-2">
        {post.media?.map((m: any, i: number) => (
          <MediaRenderer key={i} m={m} />
        ))}
      </div>

      {/* Action Bar */}

      <div className="flex items-center gap-6 pt-4 mt-4 border-t border-[#1e1f22]">
        <button onClick={handleLike} className={`flex items-center gap-2 text-sm font-bold transition-all active:scale-125 ${isLiked ? "text-red-500" : "text-[#b5bac1] hover:text-[#f2f3f5]"}`}>
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />

          {likes.length}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 text-sm font-bold transition-all ${showComments ? "text-white" : "text-[#b5bac1] hover:text-[#f2f3f5]"}`}>
          <MessageSquare size={18} />

          {comments.length > 0 ? comments.length : "Comment"}
        </button>
      </div>

      {/* Comments Section */}

      {showComments && (
        <div className="mt-4 pt-4 bg-[#232428] rounded-lg border border-[#1e1f22]">
          <div className="px-4 space-y-4 mb-4 max-h-64 overflow-y-auto custom-scrollbar">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-gray-600 shrink-0 mt-0.5" />

                <div className="flex flex-col bg-[#2b2d31] p-2 rounded-lg border border-[#1e1f22] max-w-[90%]">
                  <span className="text-[11px] font-black text-white">{c.authorName}</span>

                  <span className="text-sm text-[#dbdee1]">{c.text}</span>
                </div>
              </div>
            ))}

            {comments.length === 0 && <p className="text-center py-4 text-xs text-[#949ba4] italic">No voices here yet... be the first?</p>}
          </div>

          {/* Comment Input */}

          <div className="p-3 bg-[#1e1f22] flex gap-2 rounded-b-lg">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Reply to this post..."
              className="flex-1 bg-[#2b2d31] px-4 py-2 text-sm text-white rounded-full border border-[#1e1f22] outline-none focus:border-amber-500 transition-all"
            />

            <button onClick={handleSendComment} disabled={!commentText.trim()} className="p-2 bg-amber-600 text-white rounded-full hover:bg-amber-500 disabled:opacity-50 transition-all">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(PostItem);
