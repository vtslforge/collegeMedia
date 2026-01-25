import { useState } from "react";
import { createPost } from "../database";
import { auth, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Content = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!auth.currentUser) {
      alert("You must be logged in");
      return;
    }

    if (!text.trim()) {
      alert("Post cannot be empty");
      return;
    }

    setLoading(true);

    try {
      let media: { url: string; type: string } | null = null;

      if (file) {
        const fileRef = ref(
          storage,
          `posts/${auth.currentUser.uid}/${Date.now()}-${file.name}`
        );

        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);

        media = {
          url,
          type: file.type
        };
      }

      await createPost({
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.email!.split("@")[0],
        communityId: null,
        type: "feed",
        text,
        media: media ? [media] : [],
         likes: []
      });

      setText("");
      setFile(null);
      alert("Posted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to post");
    }

    setLoading(false);
  };

  return (
    <div className="bg-amber-950 h-auto ml-15 md:ml-40 mt-[5vh] p-3 flex flex-col gap-3">
      <h2 className="text-white font-bold">Create Post</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's happening on campus?"
        className="p-2 rounded text-black resize-none"
        rows={4}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-white"
      />

      <button
        onClick={handlePost}
        disabled={loading}
        className="bg-amber-600 text-white p-2 rounded cursor-pointer"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
};

export default Content;
