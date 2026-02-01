/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { toggleLike, addComment, listenComments } from "../database";

const PostItem = ({ post }: { post: any }) => {
  const currentUser = auth.currentUser;
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  
  const isLiked = post.likes.includes(currentUser?.uid);

  // Load comments only when the user expands the section
  useEffect(() => {
    if (showComments) {
      const unsubscribe = listenComments(post.id, setComments);
      return () => unsubscribe();
    }
  }, [showComments, post.id]);

  const handleLike = async () => {
    if (!currentUser || !post.id) return; // Add check for post.id
    await toggleLike(post.id, currentUser.uid, isLiked);
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    await addComment(post.id, commentText, currentUser);
    setCommentText("");
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-4">
      {/* Post Header */}
      <div className="flex justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
            {post.authorName[0]}
          </div>
          <div>
            <span className="font-bold text-gray-900 block leading-none">{post.authorName}</span>
            <span className="text-xs text-gray-400">
               {post.type === 'event' && <span className="text-orange-600 font-bold mr-2">📅 EVENT</span>}
               {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now'}
            </span>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-800 mb-4">{post.text}</p>

      {/* Actions Bar */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-1 text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
        >
          {isLiked ? '❤️' : '🤍'} {post.likes.length} Likes
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-blue-600"
        >
          💬 Comments
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 bg-gray-50 rounded-lg p-3">
          <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
            {comments.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-bold text-gray-900 mr-2">{c.authorName}:</span>
                <span className="text-gray-700">{c.text}</span>
              </div>
            ))}
            {comments.length === 0 && <p className="text-xs text-gray-400">No comments yet.</p>}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            <button 
              onClick={handleSendComment}
              disabled={!commentText}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostItem;