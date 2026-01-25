/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { Post } from "../database";
import { listenFeed, toggleLike } from "../database";
import { auth } from "../firebase";

type FeedPost = Post & { id: string; createdAt: any };

const timeAgo = (timestamp: any) => {
  const seconds = Math.floor((Date.now() - timestamp.toMillis()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

const Feed = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);

  useEffect(() => {
    const unsub = listenFeed(setPosts);
    return () => unsub();
  }, []);

  return (
    <div className="bg-amber-100 h-auto ml-15 md:ml-40 mt-[5vh] p-3 flex flex-col gap-3">
      {posts.length === 0 && <p>No posts yet</p>}

      {posts.map((post) => {
        const userId = auth.currentUser?.uid || "";
        const liked = post.likes.includes(userId);

        return (
          <div key={post.id} className="bg-white p-3 rounded shadow flex flex-col gap-2">
            <p>{post.text}</p>

            {post.media?.map((m, i) => (
              <img key={i} src={m.url} alt="post" className="mt-2 max-w-xs rounded" />
            ))}

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{timeAgo(post.createdAt)}</span>

              <div className="flex items-center gap-2">
                <button onClick={() => toggleLike(post.id, userId, liked)} className="cursor-pointer">
                  {liked ? "❤️" : "🤍"}
                </button>
                <span>{post.likes.length}</span>
                <p className="font-bold text-sm text-gray-700">@{post.authorName}</p>
                <p>{post.text}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Feed;
