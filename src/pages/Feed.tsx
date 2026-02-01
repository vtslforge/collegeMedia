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

      { threshold: 0.1 } // Trigger earlier for better UX

    );



    if (currentTarget) observer.observe(currentTarget);

    return () => {

      if (currentTarget) observer.unobserve(currentTarget);

    };

  }, [loading]);



  return (

    <div className="w-full max-w-2xl mx-auto px-4 pt-8 pb-24">

      {/* Header Section */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">

            Campus <span className="text-amber-500">Feed</span>

          </h1>

          <p className="text-[#949ba4] text-sm mt-1">Real-time updates from across campus</p>

        </div>

        <div className="bg-[#2b2d31] p-2 rounded-lg border border-[#1e1f22]">

          <Sparkles size={20} className="text-amber-500" />

        </div>

      </div>



      <div className="flex flex-col gap-6">

        {/* Post Rendering */}

        {posts.map((post, index) => (

          <div key={post.id || index} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>

            <PostItem post={post} />

          </div>

        ))}



        {/* Skeleton Loader - Matching Dark Theme */}

        {(loading || (posts.length > 0 && posts.length < limitCount)) && (

          <div className="space-y-6">

            {[1, 2].map((i) => (

              <div key={i} className="bg-[#2b2d31] p-5 rounded-xl border border-[#1e1f22] animate-pulse">

                <div className="flex gap-3 mb-4">

                  <div className="w-12 h-12 bg-[#35373c] rounded-full"></div>

                  <div className="space-y-2 flex-1 pt-1">

                    <div className="h-4 bg-[#35373c] rounded w-32"></div>

                    <div className="h-3 bg-[#35373c] rounded w-20"></div>

                  </div>

                </div>

                <div className="space-y-3">

                  <div className="h-4 bg-[#35373c] rounded w-full"></div>

                  <div className="h-4 bg-[#35373c] rounded w-5/6"></div>

                </div>

                <div className="mt-4 h-64 bg-[#1e1f22] rounded-lg border border-[#35373c]"></div>

              </div>

            ))}

          </div>

        )}



        {/* Empty State */}

        {!loading && posts.length === 0 && (

          <div className="flex flex-col items-center justify-center py-20 bg-[#2b2d31] rounded-2xl border border-dashed border-[#4e5058] text-center">

            <div className="bg-[#35373c] p-4 rounded-full mb-4">

              <Sparkles size={32} className="text-[#949ba4]" />

            </div>

            <h3 className="text-[#f2f3f5] font-bold text-lg">Silence in the halls</h3>

            <p className="text-[#949ba4] max-w-[250px] mt-2">No one has posted yet. Be the first to share something!</p>

          </div>

        )}



        {/* Infinite Scroll Trigger */}

        <div ref={bottomRef} className="h-20 flex items-center justify-center">

          {posts.length > 0 && (

            <div className="flex items-center gap-2 text-[#949ba4] text-sm">

              <Loader2 size={16} className="animate-spin text-amber-500" />

              <span>Fetching more posts...</span>

            </div>

          )}

        </div>

      </div>

    </div>

  );

};



export default Feed;