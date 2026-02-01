/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import { sendGlobalMessage, listenGlobalMessages } from "../database";

const Chat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const dummy = useRef<HTMLDivElement>(null); 
  const currentUser = auth.currentUser;

  // 1. Listen to Real-time Messages
  useEffect(() => {
    const unsubscribe = listenGlobalMessages((msgs) => {
      setMessages(msgs);
      setTimeout(() => dummy.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    await sendGlobalMessage(inputText, currentUser);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto mt-[5vh] bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
      
      {/* Header */}
      <div className="bg-gray-50 border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <h1 className="font-bold text-gray-800 text-lg">Global Campus Chat</h1>
        </div>
        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Live</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
        {messages.map((msg) => {
          const isMe = msg.uid === currentUser?.uid;

          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              
              {/* Avatar (Only for others) */}
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 mr-2 mt-1 shrink-0">
                  {msg.displayName?.[0]?.toUpperCase()}
                </div>
              )}

              {/* Bubble */}
              <div className={`max-w-[75%] px-4 py-2 text-sm shadow-sm flex flex-col ${
                isMe 
                  ? "bg-blue-600 text-white rounded-2xl rounded-tr-none items-end" // Align 'You' to right
                  : "bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none items-start"
              }`}>
                
                {/* NAME HEADER (Always Visible) */}
                <span className={`text-[10px] font-bold mb-0.5 ${
                    isMe ? "text-blue-200" : "text-gray-400"
                }`}>
                    {isMe ? "You" : msg.displayName}
                </span>

                {/* Message Text */}
                <span>{msg.text}</span>
              </div>

            </div>
          );
        })}
        <div ref={dummy}></div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-500 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />
        <button 
          type="submit" 
          disabled={!inputText}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➤
        </button>
      </form>
    </div>
  );
};

export default Chat;