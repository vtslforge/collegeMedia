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
    <div className="relative mt-4 w-full bg-slate-100 rounded-2xl overflow-hidden min-h-62.5 flex items-center justify-center border border-slate-200">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200/70 animate-pulse">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
        </div>
      )}

      <img
        src={optimizedUrl}
        alt="post media"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full max-h-125 object-contain transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
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
    <div className="bg-white/85 p-5 rounded-2xl shadow-sm border border-slate-200/80 transition-all w-full max-w-full overflow-hidden hover:shadow-md">
      {/* Header */}

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-slate-900 bg-gradient-to-br from-amber-200 via-amber-100 to-sky-100 border border-amber-200/60 shadow-sm">
            {authorName.charAt(0).toUpperCase()}
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 text-sm hover:underline cursor-pointer">{authorName}</span>

            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600 uppercase font-semibold w-fit">
              {post.type === "event" && <Calendar size={10} className="text-amber-500" />}
              {post.type === "event" ? "Event" : "Feed"} • {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : "Just now"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}

      <p className="text-slate-800 text-[15px] leading-relaxed mb-3 whitespace-pre-wrap break-words">{post.text}</p>

      {/* Media Rendering with fix for bad UX */}

      <div className="space-y-2">
        {post.media?.map((m: any, i: number) => (
          <MediaRenderer key={i} m={m} />
        ))}
      </div>

      {/* Action Bar */}

      <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-200/70">
        <button
          onClick={handleLike}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all active:scale-95 ${
            isLiked ? "text-red-500 bg-red-50" : "text-slate-700 bg-slate-100 hover:bg-slate-200"
          }`}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          {likes.length}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all ${
            showComments ? "text-slate-900 bg-slate-200" : "text-slate-700 bg-slate-100 hover:bg-slate-200"
          }`}
        >
          <MessageSquare size={18} />
          {comments.length > 0 ? comments.length : "Comment"}
        </button>
      </div>

      {/* Comments Section */}

      {showComments && (
        <div className="mt-4 pt-4 rounded-lg">
          <div className="px-1 space-y-4 mb-4 max-h-64 overflow-y-auto custom-scrollbar">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-slate-300 shrink-0 mt-0.5" />

                <div className="flex flex-col bg-slate-100 p-3 rounded-2xl max-w-[90%] border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700">{c.authorName}</span>

                  <span className="text-sm text-slate-800 break-words">{c.text}</span>
                </div>
              </div>
            ))}

            {comments.length === 0 && <p className="text-center py-4 text-xs text-slate-400 italic">No voices here yet... be the first?</p>}
          </div>

          {/* Comment Input */}

          <div className="p-3 flex gap-2 rounded-2xl bg-slate-100 border border-slate-200">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Reply to this post..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 rounded-full outline-none transition-all"
            />

            <button
              onClick={handleSendComment}
              disabled={!commentText.trim()}
              className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-400 disabled:opacity-50 transition-all"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(PostItem);
