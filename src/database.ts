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
  limit, 
  limitToLast,
  arrayRemove,
  where,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";

// 1. POST TYPE
export type Post = {
  id?: string;
  createdAt?: any;
  authorId: string;
  authorName: string;
  communityId: string | null;
  type: "feed" | "news" | "event";
  text: string;
  media: { url: string; type: string }[];
  likes: string[];
};

// 2. CREATE POST
export const createPost = async (data: Post) => {
  return await addDoc(collection(db, "posts"), {
    ...data,
    createdAt: serverTimestamp()
  });
};

// 3. REALTIME FEED (Dynamic Limit for Infinite Scroll)
export const listenFeed = (
  limitCount: number, // <--- Add this parameter
  callback: (posts: Post[]) => void
) => {
  const q = query(
    collection(db, "posts"),
    where("communityId", "==", null),
    orderBy("createdAt", "desc"),
    limit(limitCount) // <--- Use the variable here
  );

  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map(d => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        likes: data.likes || [] 
      };
    });
    callback(posts);
  });
};

// 4. LIKE / UNLIKE
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

// --- COMMUNITY FEATURES ---

// 5. Define Community Type
export type Community = {
  id?: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  members: string[];         
  allowMemberPosts: boolean; 
  createdAt: any;
};

// 6. Create Community
export const createCommunity = async (data: Omit<Community, "id" | "createdAt" | "members">) => {
  return await addDoc(collection(db, "communities"), {
    ...data,
    members: [data.ownerId], 
    createdAt: serverTimestamp()
  });
};

// 7. Listen to All Communities
export const listenCommunities = (
  callback: (communities: Community[]) => void
) => {
  const q = query(collection(db, "communities"), orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snap) => {
    const communities = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as Community));
    callback(communities);
  });
};

// 8. Join Community
export const joinCommunity = async (communityId: string, userId: string) => {
  const ref = doc(db, "communities", communityId);
  await updateDoc(ref, {
    members: arrayUnion(userId)
  });
};

// 9. Manage Roles
export const updateCommunitySettings = async (communityId: string, allowMemberPosts: boolean) => {
  const ref = doc(db, "communities", communityId);
  await updateDoc(ref, {
    allowMemberPosts: allowMemberPosts
  });
};

// 10. Listen to Community Posts
export const listenCommunityPosts = (
  communityId: string,
  callback: (posts: Post[]) => void
) => {
  const q = query(
    collection(db, "posts"),
    where("communityId", "==", communityId), 
    orderBy("createdAt", "desc"),
    limit(50) // Optional: Added a reasonable limit here too
  );

  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      likes: d.data().likes || []
    } as any));
    callback(posts);
  });
};

// 11. Get Single Community
export const getCommunity = async (id: string) => {
  const docRef = doc(db, "communities", id);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } as Community : null;
};

// --- INTERACTION FEATURES ---

// 12. Add Comment
export const addComment = async (postId: string, text: string, user: any) => {
  return await addDoc(collection(db, "posts", postId, "comments"), {
    text,
    authorId: user.uid,
    authorName: user.displayName || "User",
    createdAt: serverTimestamp()
  });
};

// 13. Listen to Comments
export const listenComments = (postId: string, callback: (comments: any[]) => void) => {
  const q = query(
    collection(db, "posts", postId, "comments"), 
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// 14. Kick Member
export const kickMember = async (communityId: string, userId: string) => {
  const ref = doc(db, "communities", communityId);
  await updateDoc(ref, {
    members: arrayRemove(userId)
  });
};

// 15. Leave Community
export const leaveCommunity = async (communityId: string, userId: string) => {
  const ref = doc(db, "communities", communityId);
  await updateDoc(ref, {
    members: arrayRemove(userId)
  });
};

// 16. DELETE COMMUNITY (Owner Only)
export const deleteCommunity = async (communityId: string) => {
  const ref = doc(db, "communities", communityId);
  await deleteDoc(ref);
};

// 17. GLOBAL CHAT SYSTEM (OPTIMIZED)

export const sendGlobalMessage = async (text: string, user: any) => {
  return await addDoc(collection(db, "global_chat"), {
    text,
    uid: user.uid,
    displayName: user.displayName || user.email!.split("@")[0], 
    createdAt: serverTimestamp()
  });
};

// Fetches Global Chat, sorted by date (Ascending), limit last 50
export const listenGlobalMessages = (callback: (msgs: any[]) => void) => {
  const q = query(
    collection(db, "global_chat"),
    orderBy("createdAt", "asc"),
    limitToLast(50) // <--- Performance Optimization
  );
  
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};