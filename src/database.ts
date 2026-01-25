/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "./firebase";

export type Post = {
  authorId: string;
  authorName: string;
  communityId: string | null;
  type: "feed" | "news" | "event";
  text: string;
  media: { url: string; type: string }[];
  likes: string[];
};

export const createPost = async (data: Post) => {
  return await addDoc(collection(db, "posts"), {
    ...data,
    createdAt: serverTimestamp()
  });
};

// REALTIME FEED (schema-safe)
export const listenFeed = (
  callback: (posts: (Post & { id: string; createdAt: any })[]) => void
) => {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map(d => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        likes: data.likes || [] // 🔥 normalize old data
      };
    });
    callback(posts);
  });
};

// LIKE / UNLIKE
export const toggleLike = async (
  postId: string,
  userId: string,
  liked: boolean
) => {
  const ref = doc(db, "posts", postId);

  await updateDoc(ref, {
    likes: liked
      ? arrayRemove(userId)
      : arrayUnion(userId)
  });
};
