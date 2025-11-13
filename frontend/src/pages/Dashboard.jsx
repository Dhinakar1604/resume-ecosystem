import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaSignOutAlt, FaFileAlt, FaRocket, FaBolt, FaChartLine, FaStar, FaCheckCircle, FaArrowRight, FaMagic, FaShieldAlt, FaCloud } from "react-icons/fa";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-t-transparent border-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-t-transparent border-cyan-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      
      {/* Animated Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 bg-zinc-900/80 backdrop-blur-2xl border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <FaRocket className="text-white text-xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 rounded-xl blur opacity-50 animate-pulse"></div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">
            <span className="text-white">Quick</span>
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">CV</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/upload")}
            className="group flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700/80 text-white px-5 py-2.5 rounded-xl transition-all duration-300 border border-zinc-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <FaUpload className="text-sm group-hover:scale-110 transition-transform" /> Upload
          </button>
          
          <button
            onClick={() => navigate("/resume-editor")}
            className="group relative flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <FaFileAlt className="text-sm relative z-10" /> 
            <span className="relative z-10">Editor</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-900/50 hover:bg-red-800/70 text-white px-5 py-2.5 rounded-xl transition-all duration-300 border border-red-800/50 hover:border-red-600/50"
          >
            <FaSignOutAlt className="text-sm" /> Logout
          </button>

          <div className="flex items-center gap-3 ml-2 pl-3 border-l border-zinc-700/50">
            <label htmlFor="profile-upload" className="cursor-pointer group relative">
              {profilePic ? (
                <div className="relative">
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-11 h-11 rounded-full object-cover border-2 border-zinc-700 group-hover:border-cyan-400 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400 opacity-0 group-hover:opacity-100 animate-ping"></div>
                </div>
              ) : (
                <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/30">
                  {userName.charAt(0).toUpperCase()}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-600 to-emerald-600 opacity-0 group-hover:opacity-50 blur group-hover:animate-pulse"></div>
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

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-24 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
              <div className="absolute top-20 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="absolute top-32 right-1/3 w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-28 left-1/3 w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-gradient-to-r from-cyan-950/50 to-emerald-950/50 backdrop-blur-xl rounded-full border border-cyan-800/30 shadow-lg shadow-cyan-500/10">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">Welcome back, {userName}</span>
            </div>
            
            <h2 className="text-7xl md:text-8xl font-black mb-8 leading-none tracking-tighter">
              <span className="block text-white mb-2">Craft Your</span>
              <span className="block bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent animate-gradient">Perfect Resume</span>
            </h2>
            
            <p className="text-gray-400 max-w-3xl mx-auto text-xl leading-relaxed mb-12 font-light">
              AI-powered resume builder that transforms your career story into compelling, 
              <span className="text-cyan-400 font-medium"> ATS-friendly documents</span> that get you hired faster.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <button
                onClick={() => navigate("/resume-editor")}
                className="group relative flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white px-10 py-5 rounded-2xl transition-all duration-300 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 text-lg font-bold overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                <FaMagic className="relative z-10" />
                <span className="relative z-10">Start Building Now</span>
                <FaArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => navigate("/upload")}
                className="group flex items-center gap-3 bg-zinc-800/50 hover:bg-zinc-700/50 text-white px-10 py-5 rounded-2xl transition-all duration-300 backdrop-blur-xl border border-zinc-700/50 hover:border-cyan-500/50 text-lg font-bold"
              >
                <FaUpload className="group-hover:scale-110 transition-transform" />
                Upload Existing Resume
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-cyan-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-cyan-400" />
                <span>Free templates</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-cyan-400" />
                <span>Instant download</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-24">
            <StatCard number="50K+" label="Resumes Created" icon={<FaFileAlt />} gradient="from-cyan-500 to-blue-500" />
            <StatCard number="95%" label="Success Rate" icon={<FaChartLine />} gradient="from-emerald-500 to-teal-500" />
            <StatCard number="< 5min" label="Build Time" icon={<FaBolt />} gradient="from-yellow-500 to-orange-500" />
            <StatCard number="4.9★" label="User Rating" icon={<FaStar />} gradient="from-pink-500 to-rose-500" />
          </div>

          {/* Features */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h3 className="text-5xl font-black mb-4 tracking-tight">
                <span className="text-white">Powerful Features</span>
              </h3>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Everything you need to create, optimize, and share professional resumes that stand out
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<FaMagic className="text-3xl" />}
                title="AI-Powered Writing"
                desc="Let AI craft compelling bullet points and descriptions that highlight your achievements and skills perfectly."
                gradient="from-cyan-500 to-blue-500"
              />
              <FeatureCard
                icon={<FaBolt className="text-3xl" />}
                title="Lightning Fast"
                desc="Build professional resumes in under 5 minutes. Our streamlined interface makes the process effortless."
                gradient="from-emerald-500 to-teal-500"
              />
              <FeatureCard
                icon={<FaFileAlt className="text-3xl" />}
                title="Premium Templates"
                desc="Choose from modern, ATS-friendly templates designed by HR professionals to pass screening systems."
                gradient="from-purple-500 to-pink-500"
              />
              <FeatureCard
                icon={<FaChartLine className="text-3xl" />}
                title="Smart Optimization"
                desc="Auto-optimize for job descriptions with intelligent keyword matching and industry-specific recommendations."
                gradient="from-orange-500 to-red-500"
              />
              <FeatureCard
                icon={<FaShieldAlt className="text-3xl" />}
                title="Secure & Private"
                desc="Your data is encrypted and secure. We never share your information with third parties. Complete privacy guaranteed."
                gradient="from-indigo-500 to-violet-500"
              />
              <FeatureCard
                icon={<FaCloud className="text-3xl" />}
                title="Cloud Sync"
                desc="Access your resumes anywhere, anytime. All changes are saved automatically and synced across devices."
                gradient="from-teal-500 to-cyan-500"
              />
            </div>
          </div>

          {/* Process */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h3 className="text-5xl font-black mb-4 tracking-tight">
                <span className="text-white">Simple Process</span>
              </h3>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Three steps to land your dream job
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent hidden md:block"></div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <ProcessCard
                  number="01"
                  title="Import or Start Fresh"
                  desc="Upload your existing resume or start from scratch. Our AI extracts and organizes your information automatically."
                  icon={<FaUpload />}
                />
                <ProcessCard
                  number="02"
                  title="Customize & Enhance"
                  desc="Use our intuitive editor with AI-powered suggestions to polish every section and make it shine."
                  icon={<FaMagic />}
                />
                <ProcessCard
                  number="03"
                  title="Export & Apply"
                  desc="Download as PDF, share via link, or integrate with job boards. Track applications and update anytime."
                  icon={<FaRocket />}
                />
              </div>
            </div>
          </div>

          {/* Testimonial Section */}
          <div className="mb-24">
            <div className="grid md:grid-cols-3 gap-6">
              <TestimonialCard
                quote="QuickCV helped me land my dream job at Google. The AI suggestions were spot-on!"
                author="Sarah Chen"
                role="Software Engineer"
              />
              <TestimonialCard
                quote="I created 5 tailored resumes in 30 minutes. Absolutely game-changing for job hunting."
                author="Michael Rodriguez"
                role="Product Manager"
              />
              <TestimonialCard
                quote="The templates are modern and professional. I got 3x more interview callbacks!"
                author="Priya Sharma"
                role="Data Scientist"
              />
            </div>
          </div>

          {/* CTA */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800/50 p-12 md:p-16">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-emerald-500/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <h3 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                <span className="text-white">Ready to Get</span>{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Hired?</span>
              </h3>
              <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Join 50,000+ professionals who transformed their careers with QuickCV. 
                Your next opportunity starts here.
              </p>
              <button
                onClick={() => navigate("/resume-editor")}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white px-12 py-6 rounded-2xl transition-all duration-300 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 text-xl font-bold overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                <span className="relative z-10">Create Your Resume Now</span>
                <FaArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900/50 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <FaRocket className="text-white text-lg" />
              </div>
              <div>
                <div className="font-black text-xl tracking-tight">
                  <span className="text-white">Quick</span>
                  <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">CV</span>
                </div>
                <p className="text-xs text-gray-500">Build Smarter. Get Hired.</p>
              </div>
            </div>
            
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} QuickCV. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

function StatCard({ number, label, icon, gradient }) {
  return (
    <div className="group relative bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 hover:bg-zinc-800/50 transition-all duration-300 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <div className={`text-3xl mb-3 bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>{icon}</div>
      <div className="text-4xl font-black mb-2 text-white">{number}</div>
      <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, gradient }) {
  return (
    <div className="group relative bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 hover:bg-zinc-800/50 transition-all duration-500 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      <div className={`relative w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="relative text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="relative text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function ProcessCard({ number, title, desc, icon }) {
  return (
    <div className="relative">
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-cyan-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-cyan-500/30 z-10">
        {icon}
      </div>
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 pt-14 hover:bg-zinc-800/50 transition-all duration-300 h-full">
        <div className="text-6xl font-black text-zinc-800 mb-4">{number}</div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, author, role }) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 hover:bg-zinc-800/50 transition-all duration-300">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className="text-yellow-500" />
        ))}
      </div>
      <p className="text-gray-300 leading-relaxed mb-6 italic">"{quote}"</p>
      <div>
        <div className="text-white font-bold">{author}</div>
        <div className="text-gray-500 text-sm">{role}</div>
      </div>
    </div>
  );
}