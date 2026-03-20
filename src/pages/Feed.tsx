import { useState, useEffect, useRef } from "react";

import { listenFeed, type Post } from "../database";

import PostItem from "./PostItem";

import { Loader2, Sparkles } from "lucide-react";

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [limitCount, setLimitCount] = useState(10);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = listenFeed(limitCount, (data) => {
      setPosts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [limitCount]);

  useEffect(() => {
    const currentTarget = bottomRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setLimitCount((prev) => prev + 10);
        }
      },
      { threshold: 0.1 }
    );

    if (currentTarget) observer.observe(currentTarget);
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [loading]);

  return (
    <div className="relative w-full min-h-[calc(100vh-6vh)] font-inter px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-6">
      {/* Atmospheric background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_10%,#d7f0ff_0%,transparent_60%),radial-gradient(50%_40%_at_90%_20%,#ffe9c2_0%,transparent_60%),linear-gradient(180deg,#f7fafc_0%,#e8eef5_100%)]" />
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute right-0 top-24 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4 md:gap-6 xl:gap-8 w-full items-start min-w-0">
        {/* Main feed */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
            <div>
              <p className="text-xs tracking-[0.24em] uppercase text-slate-500">Campus Feed</p>
              <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 leading-tight">
                Live updates
                <span className="block text-slate-500">from the community.</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-500 bg-white/70">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live now
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-6">
            {/* Post Rendering */}
            {posts.map((post, index) => (
              <div
                key={post.id || index}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PostItem post={post} />
              </div>
            ))}

            {/* Skeleton Loader */}
            {(loading || (posts.length > 0 && posts.length < limitCount)) && (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white/80 p-5 rounded-2xl animate-pulse border border-slate-200/80">
                    <div className="flex gap-3 mb-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                      <div className="space-y-2 flex-1 pt-1">
                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                        <div className="h-3 bg-slate-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    </div>
                    <div className="mt-4 h-56 bg-slate-100 rounded-xl border border-slate-200"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && posts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 bg-white/80 rounded-2xl border border-dashed border-slate-300 text-center">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <Sparkles size={32} className="text-slate-400" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg">Quiet today</h3>
                <p className="text-slate-500 max-w-62.5 mt-2">No one has posted yet. Be the first to share something!</p>
              </div>
            )}

            {/* Infinite Scroll Trigger */}
            <div ref={bottomRef} className="h-16 flex items-center justify-center">
              {posts.length > 0 && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 size={16} className="animate-spin text-amber-500" />
                  <span>Fetching more posts...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="rounded-3xl p-6 lg:p-8 bg-slate-900 text-white relative overflow-hidden lg:sticky lg:top-6 self-start min-w-0">
          <div className="absolute -top-24 -right-10 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />

          <div className="relative">
            <p className="text-xs tracking-[0.24em] uppercase text-slate-400">Feed Pulse</p>
            <h2 className="text-2xl lg:text-3xl font-semibold mt-2">Stay in the loop.</h2>
            <p className="text-slate-300 mt-2 text-sm">
              Catch highlights, discover trending conversations, and keep track of what matters on campus.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Today's mood</div>
                <div className="mt-2 text-lg font-semibold text-white">Curious + collaborative</div>
                <div className="mt-2 text-xs text-slate-400">Most shared: internship tips, project demos</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Quick tip</div>
                <div className="mt-2 text-sm text-slate-200">
                  Add a clear headline and one takeaway. Posts with a takeaway get more saves.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;

