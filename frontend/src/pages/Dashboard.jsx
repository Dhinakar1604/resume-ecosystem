import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaSignOutAlt, FaFileAlt } from "react-icons/fa";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Fetch user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserName(res.data.name);

        if (res.data.profilePic) {
          setProfilePic(res.data.profilePic);
          localStorage.setItem("profilePic", res.data.profilePic);
        } else {
          const pic = localStorage.getItem("profilePic");
          if (pic) setProfilePic(pic);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err.response?.data?.message || err.message);
        localStorage.removeItem("token");
        localStorage.removeItem("profilePic");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Handle profile picture change
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
      localStorage.setItem("profilePic", reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-4 bg-white/10 backdrop-blur-md border-b border-gray-700 shadow-lg">
        <h1 className="text-3xl font-bold tracking-wide">
          <span className="text-white">Quick</span>
          <span className="text-gray-400">CV</span>
        </h1>

        <div className="flex items-center gap-4 ml-auto">
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            <FaUpload /> Upload
          </button>
          
          <button
            onClick={() => navigate("/resume-editor")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            <FaFileAlt />Editor
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            <FaSignOutAlt /> Logout
          </button>

          <div className="flex items-center gap-2 relative">
            <label htmlFor="profile-upload" className="cursor-pointer">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </label>
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              className="hidden"
              onChange={handleProfileChange}
            />
            <span className="text-white font-medium">{userName}</span>
          </div>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center text-center flex-grow px-6 py-12">
        <h2 className="text-5xl font-extrabold mb-4 text-white drop-shadow-md">
          Welcome, <span className="text-gray-300">{userName}</span> 🚀
        </h2>
        <p className="text-gray-300 max-w-2xl text-lg leading-relaxed mb-8">
          QuickCV is your intelligent resume builder that helps you create, update,
          and manage your professional resumes in minutes. Upload your details once,
          and generate tailored resumes for different roles instantly.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-8 w-full max-w-5xl">
          <FeatureCard
            title="Build Resume"
            desc="Create stunning, AI-assisted resumes with modern templates and easy customization."
          />
          <FeatureCard
            title="Edit Anytime"
            desc="Instantly update sections like education, experience, or achievements whenever needed."
          />
          <FeatureCard
            title="Save & Share"
            desc="Download your resume as PDF or share it securely using a QuickCV link."
          />
        </div>
      </main>

      <footer className="text-center text-gray-500 py-4 border-t border-gray-700">
        © {new Date().getFullYear()} QuickCV — Build Smarter. Apply Faster.
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition duration-300 shadow-md text-left">
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
