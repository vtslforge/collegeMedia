/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { Post } from "../database";
import { listenFeed, toggleLike } from "../database";
import { auth } from "../firebase";

// Force ID to be required for the frontend
type FeedPost = Post & { id: string; createdAt: any; authorName?: string };

const timeAgo = (timestamp: any) => {
  // Safety check: timestamp might be null briefly after creation
  if (!timestamp || typeof timestamp.toMillis !== "function") return "just now";

  const seconds = Math.floor((Date.now() - timestamp.toMillis()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

const Feed = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [activePost, setActivePost] = useState<FeedPost | null>(null);

  useEffect(() => {
    // FIX: We manually handle the data callback to cast types correctly
    const unsub = listenFeed((data) => {
      // We cast 'data' because we know listenFeed attaches IDs
      setPosts(data as FeedPost[]);
    });
    return () => unsub();
  }, []);

  return (
    <>
      <div className="bg-amber-100 h-auto ml-15 md:ml-40 mt-[5vh] p-4 flex flex-col gap-4">
        {posts.length === 0 && <p className="text-gray-600">No posts yet</p>}

        {posts.map((post) => {
          const userId = auth.currentUser?.uid || "";
          const likes = post.likes || []; // Safety check
          const liked = likes.includes(userId);

          return (
            <div
              key={post.id}
              className="bg-white p-4 rounded shadow flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                    {post.authorName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <p className="font-semibold text-sm">
                    @{post.authorName || "user"}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {timeAgo(post.createdAt)}
                </span>
              </div>

              {/* Preview Text */}
              <p
                className="text-gray-800 wrap-break-word line-clamp-3 cursor-pointer hover:underline"
                onClick={() => setActivePost(post)}
              >
                {post.text}
              </p>

              {/* Media */}
              {post.media?.map((m, i) => (
                <img
                  key={i}
                  src={m.url}
                  alt="post"
                  className="mt-2 max-h-96 object-cover rounded"
                />
              ))}

              {/* Actions */}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <button
                  onClick={() => toggleLike(post.id, userId, liked)}
                  className="cursor-pointer text-lg transition-transform active:scale-125"
                >
                  {liked ? "❤️" : "🤍"}
                </button>
                <span>{likes.length} likes</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {activePost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full p-4 rounded shadow flex flex-col gap-3 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center">
              <p className="font-bold">
                @{activePost.authorName || "user"}
              </p>
              <button
                onClick={() => setActivePost(null)}
                className="text-xl px-2 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>

            <p className="wrap-break-word whitespace-pre-wrap">
              {activePost.text}
            </p>

            {activePost.media?.map((m, i) => (
              <img
                key={i}
                src={m.url}
                alt="post"
                className="rounded max-h-96 object-cover"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Feed;