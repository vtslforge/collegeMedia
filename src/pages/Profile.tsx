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
      if (error.code === "auth/requires-recent-login") {
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

  const initials = user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase();

  return (
    <div className="relative w-full min-h-[calc(100vh-6vh)] font-inter px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-6">
      {/* Atmospheric background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_10%,#d7f0ff_0%,transparent_60%),radial-gradient(50%_40%_at_90%_20%,#ffe9c2_0%,transparent_60%),linear-gradient(180deg,#f7fafc_0%,#e8eef5_100%)]" />
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute right-0 top-24 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <div className="w-20 h-20 rounded-3xl bg-white/80 border border-slate-200 flex items-center justify-center text-3xl font-semibold text-slate-900 shadow-sm">
            {initials}
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Profile</h1>
          <p className="text-slate-500 text-sm">Manage your identity and security settings</p>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 text-sm text-center border ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 md:gap-6 xl:gap-8 min-w-0">
          <div className="min-w-0 flex flex-col gap-6">
            <div className="rounded-3xl bg-white/80 border border-slate-200/80 p-6 lg:p-8 backdrop-blur">
              <p className="text-xs tracking-[0.24em] uppercase text-slate-500">Account</p>
              <div className="mt-3">
                <h2 className="text-xl font-semibold text-slate-900">{user.displayName || "User"}</h2>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>

              <div className="mt-6">
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-2 tracking-wide">
                  Display Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:outline-none bg-white"
                    placeholder="Set your display name"
                  />
                  <button
                    onClick={handleUpdateName}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 font-medium text-sm transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/80 border border-slate-200/80 p-6 lg:p-8 backdrop-blur">
              <p className="text-xs tracking-[0.24em] uppercase text-slate-500">Security</p>
              <p className="text-sm text-slate-500 mt-2">Update your password to keep your account secure.</p>

              <div className="mt-5">
                {!showPasswordInput ? (
                  <button
                    onClick={() => setShowPasswordInput(true)}
                    className="w-full py-2.5 px-4 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                  >
                    Change Password
                  </button>
                ) : (
                  <div className="animate-fade-in-down">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:outline-none mb-3"
                      placeholder="Enter new password (min 6 chars)"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdatePassword}
                        disabled={loading || !password}
                        className="flex-1 py-2 bg-amber-500 text-slate-900 rounded-xl hover:bg-amber-400 disabled:opacity-50 font-medium text-sm"
                      >
                        Update Password
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordInput(false);
                          setPassword("");
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-medium text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-6 lg:p-8 bg-slate-900 text-white relative overflow-hidden h-full flex flex-col">
            <div className="absolute -top-24 -right-10 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />

            <div className="relative flex-1 flex flex-col">
              <p className="text-xs tracking-[0.24em] uppercase text-slate-400">Session</p>
              <h2 className="text-2xl font-semibold mt-2">You are signed in.</h2>
              <p className="text-slate-300 mt-2 text-sm">Keep your session secure and sign out when you are done.</p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Current account</div>
                <div className="mt-2 text-sm text-white break-words">{user.email}</div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-auto w-full py-3 text-red-200 font-medium hover:bg-white/10 rounded-xl transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
