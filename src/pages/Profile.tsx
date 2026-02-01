/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { auth } from "../firebase"; // Ensure path matches your folder structure
import { updateProfile, updatePassword, signOut, onAuthStateChanged, type User } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  // Form States
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false); // Toggle for password field

  // UI States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Handle Name Update
  const handleUpdateName = async () => {
    if (!user) return;
    setLoading(true);
    setMessage(null);

    try {
      await updateProfile(user, { displayName: displayName });
      setMessage({ type: "success", text: "Profile name updated successfully." });
    } catch (error: any) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to update name: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async () => {
    if (!user) return;
    if (password.length < 6) {
        setMessage({ type: "error", text: "Password must be at least 6 characters." });
        return;
    }
    setLoading(true);
    setMessage(null);

    try {
      await updatePassword(user, password);
      setMessage({ type: "success", text: "Password updated successfully." });
      setPassword(""); 
      setShowPasswordInput(false); // Hide input after success
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: "error", text: "Please logout and login again to change password." });
      } else {
        setMessage({ type: "error", text: "Failed: " + error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to logout." });
    }
  };

  if (!user) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-gray-100 font-inter">
      
      {/* 1. Header & Current User Info */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile</h1>
        <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-3xl mb-3 text-blue-600 font-bold">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
            {user.displayName || "User"}
        </h2>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      {/* Feedback Message */}
      {message && (
        <div className={`p-3 mb-6 rounded-lg text-sm text-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* 2. Display Name Section */}
      <div className="mb-6">
        <label className="block text-xs uppercase font-bold text-gray-400 mb-2 tracking-wide">
            Display Name
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
            placeholder="Set your display name"
          />
          <button
            onClick={handleUpdateName}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium text-sm transition-all"
          >
            Save
          </button>
        </div>
      </div>

      <hr className="my-6 border-gray-100" />

      {/* 3. Password Section (Toggle) */}
      <div className="mb-6">
        <label className="block text-xs uppercase font-bold text-gray-400 mb-2 tracking-wide">
            Security
        </label>
        
        {!showPasswordInput ? (
            // State A: Button only
            <button
                onClick={() => setShowPasswordInput(true)}
                className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
            >
                Change Password
            </button>
        ) : (
            // State B: Input Field
            <div className="animate-fade-in-down">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"
                    placeholder="Enter new password (min 6 chars)"
                    autoFocus
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleUpdatePassword}
                        disabled={loading || !password}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
                    >
                        Update Password
                    </button>
                    <button
                        onClick={() => {
                            setShowPasswordInput(false);
                            setPassword("");
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}
      </div>

      <hr className="my-6 border-gray-100" />

      {/* 4. Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors text-sm"
      >
        Sign Out
      </button>

    </div>
  );
};

export default Profile;