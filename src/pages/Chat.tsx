/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { auth } from "../firebase";
import { sendGlobalMessage, listenGlobalMessages } from "../database";

const Chat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUser = auth.currentUser;

  // 1. Listen to Real-time Messages
  useEffect(() => {
    const unsubscribe = listenGlobalMessages((msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
      bottomRef.current?.scrollIntoView({ block: "end" });
    });
  };

  // Always keep chat scrolled to bottom
  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Ensure initial open scrolls to bottom and focuses input
  useEffect(() => {
    const t = setTimeout(scrollToBottom, 0);
    const f = setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      clearTimeout(f);
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    await sendGlobalMessage(inputText, currentUser);
    setInputText("");
    scrollToBottom();
  };

  return (
    <div className="relative w-full h-[calc(100vh-6vh)] overflow-hidden font-inter px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10  pb-4">
      {/* Atmospheric background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_10%,#d7f0ff_0%,transparent_60%),radial-gradient(50%_40%_at_90%_20%,#ffe9c2_0%,transparent_60%),linear-gradient(180deg,#f7fafc_0%,#e8eef5_100%)]" />
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute right-0 top-24 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <div className="mt-2 flex flex-col gap-4 flex-1 min-h-0">
          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="overflow-y-auto no-scrollbar space-y-4 bg-transparent border border-transparent rounded-3xl p-4 md:p-6 backdrop-blur flex-1 min-h-0"
          >
            {messages.map((msg) => {
              const isMe = msg.uid === currentUser?.uid;

              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-2xl bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 mr-2 mt-1 shrink-0">
                      {msg.displayName?.[0]?.toUpperCase()}
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] px-4 py-3 text-sm shadow-sm flex flex-col rounded-2xl break-words overflow-hidden ${
                      isMe
                        ? "bg-slate-900 text-white items-end"
                        : "bg-white text-slate-800 border border-slate-200 items-start"
                    }`}
                  >
                    <span className={`text-[10px] font-semibold mb-1 ${isMe ? "text-slate-300" : "text-slate-400"}`}>
                      {isMe ? "You" : msg.displayName}
                    </span>
                    <span className="break-words whitespace-pre-wrap">{msg.text}</span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} className="h-2" />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              ref={inputRef}
              autoFocus
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-full px-4 py-3 focus:ring-2 focus:ring-slate-900/10 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputText}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full p-3 w-12 h-12 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;

