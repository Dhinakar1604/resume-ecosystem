import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FaUpload, FaSignOutAlt, FaPlus, FaTimes, FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [parsedData, setParsedData] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    summary: "",
    education: [],
    experience: [],
    internships: [],
    projects: [],
    certifications: [],
    technicalSkills: [],
    softSkills: [],
    languages: [],
    areasOfInterest: [],
  });

  const [userName, setUserName] = useState("User");
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserName(res.data.name || "User");

        if (res.data.profilePic) {
          setProfilePic(res.data.profilePic);
          localStorage.setItem("profilePic", res.data.profilePic);
        } else {
          const pic = localStorage.getItem("profilePic");
          if (pic) setProfilePic(pic);
        }
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleUploadAuto = async (incomingFile) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in.");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("resume", incomingFile);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Resume parsed successfully!");
      setParsedData(prev => ({ ...prev, ...res.data.extractedData }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    await handleUploadAuto(selected);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      await handleUploadAuto(dropped); 
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const commonInputStyles =
    "p-2 border border-zinc-700 rounded w-full bg-zinc-900/60 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400";

  return (
    <div className="min-h-screen relative bg-black text-white" onDragEnter={handleDrag}>
      <ToastContainer 
  theme="dark"
  position="top-center"
  autoClose={3000}
/>

      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-40 pointer-events-none"></div>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-cyan-600/20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute top-32 -right-48 w-[450px] h-[450px] bg-emerald-500/20 blur-3xl rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <nav className="relative z-40 flex items-center justify-between px-8 py-6 bg-zinc-900/70 backdrop-blur-xl border-b border-zinc-800 shadow">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/40">
            <FaFileAlt className="text-white text-xl" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-white">Quick</span>
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              CV
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 bg-zinc-800/70 hover:bg-zinc-700 rounded-xl border border-zinc-700/60 transition"
          >
            Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-700/70 hover:bg-red-600 rounded-xl border border-red-800/50 transition"
          >
            <FaSignOutAlt /> Logout
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-zinc-700/60">
            {profilePic ? (
              <img
                src={profilePic}
                className="w-12 h-12 rounded-full object-cover border border-zinc-600"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center font-bold text-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium">{userName}</span>
          </div>
        </div>
      </nav>

      <main className="relative z-30 p-8 flex flex-col items-center">

        <div
          className={`w-full max-w-7xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-8 shadow-2xl transition-all 
            ${
              dragActive
                ? "border-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.7)] scale-[1.02]"
                : ""
            }
          `}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            Upload Resume
          </h2>

          <label className="flex-1 cursor-pointer relative block rounded-2xl border-2 border-dashed border-zinc-700 p-10 hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition text-center">
            <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />

            {/* LOADING UI */}
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-10">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
                  <div
                    className="absolute inset-0 border-4 border-t-transparent border-emerald-400 rounded-full animate-spin"
                    style={{ animationDirection: "reverse" }}
                  ></div>
                </div>
                <p className="text-cyan-300 text-lg font-semibold animate-pulse">Processing…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-600/10 to-emerald-600/
10 border border-cyan-400/30 rounded-xl flex items-center justify-center shadow-md">
                  <FaUpload className="text-cyan-300 text-4xl" />
                </div>

                {file ? (
                  <>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-zinc-400">{(file.size / 1024).toFixed(2)} KB</p>
                    <p className="text-cyan-300 underline text-sm">Click to replace</p>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-semibold text-white">Click or drag your file here</p>
                    <p className="text-zinc-400 text-sm">Supports PDF & DOCX</p>
                  </>
                )}
              </div>
            )}
          </label>

          {dragActive && (
            <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl pointer-events-none border-2 border-cyan-400/70 shadow-[0_0_40px_rgba(6,182,212,0.6)]" />
          )}
        </div>

        <div className="w-full max-w-7xl mt-8 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            🧾Resume Details
          </h2>

          {/* BASIC INFO */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <input type="text" placeholder="Name" className={commonInputStyles}
              value={parsedData.name} onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })} />
            <input type="text" placeholder="Title" className={commonInputStyles}
              value={parsedData.title} onChange={(e) => setParsedData({ ...parsedData, title: e.target.value })} />
            <input type="email" placeholder="Email" className={commonInputStyles}
              value={parsedData.email} onChange={(e) => setParsedData({ ...parsedData, email: e.target.value })} />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Phone" className={commonInputStyles}
              value={parsedData.phone} onChange={(e) => setParsedData({ ...parsedData, phone: e.target.value })} />
            <input type="text" placeholder="LinkedIn URL" className={commonInputStyles}
              value={parsedData.linkedin} onChange={(e) => setParsedData({ ...parsedData, linkedin: e.target.value })} />
          </div>

          <input type="text" placeholder="GitHub URL" className={`${commonInputStyles} mb-4`}
            value={parsedData.github} onChange={(e) => setParsedData({ ...parsedData, github: e.target.value })} />

          <textarea
            placeholder="Summary"
            rows={4}
            className={`${commonInputStyles} mb-6`}
            value={parsedData.summary}
            onChange={(e) => setParsedData({ ...parsedData, summary: e.target.value })}
          />

          {/* Dynamic Sections */}
          <DynamicSection title="Education" field="education" parsedData={parsedData} setParsedData={setParsedData}
            addTemplate={{ degree: "", institution: "", location: "", years: "" }} />

          <DynamicSection title="Experience" field="experience" parsedData={parsedData} setParsedData={setParsedData}
            addTemplate={{ role: "", company: "", years: "", description: "" }} />

          <DynamicSection title="Internships" field="internships" parsedData={parsedData} setParsedData={setParsedData}
            addTemplate={{ role: "", company: "", years: "", description: "" }} />

          <DynamicSection title="Projects" field="projects" parsedData={parsedData} setParsedData={setParsedData}
            addTemplate={{ title: "", description: "", year: "" }} />

          <DynamicSection title="Certifications" field="certifications" parsedData={parsedData} setParsedData={setParsedData}
            addTemplate={{ name: "", issuer: "", year: "" }} />

          {/* Skills */}
          <SkillsSection title="Technical Skills" field="technicalSkills" parsedData={parsedData} setParsedData={setParsedData} commonInputStyles={commonInputStyles} />
          <SkillsSection title="Soft Skills" field="softSkills" parsedData={parsedData} setParsedData={setParsedData} commonInputStyles={commonInputStyles} />
          <SkillsSection title="Languages" field="languages" parsedData={parsedData} setParsedData={setParsedData} commonInputStyles={commonInputStyles} />
          <SkillsSection title="Areas of Interest" field="areasOfInterest" parsedData={parsedData} setParsedData={setParsedData} commonInputStyles={commonInputStyles} />

          {/* Save / Reset Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  if (!token) return navigate("/login");

                  const dataToSave = { ...parsedData, fileName: file?.name || "resume" };

                  await axios.post("http://localhost:5000/api/upload/save", dataToSave, {
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  toast.success("Resume saved successfully!");
                } catch {
                  toast.error("Failed to save resume.");
                }
              }}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 text-white font-semibold"
            >
              Save
            </button>

            <button
              onClick={() => {
                setParsedData({
                  name: "",
                  title: "",
                  email: "",
                  phone: "",
                  linkedin: "",
                  github: "",
                  summary: "",
                  education: [],
                  experience: [],
                  internships: [],
                  projects: [],
                  certifications: [],
                  technicalSkills: [],
                  softSkills: [],
                  languages: [],
                  areasOfInterest: [],
                });
                setFile(null);
                toast.info("Form cleared.");
              }}
              className="px-6 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-white font-semibold"
            >
              Discard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* COMPONENTS                                                             */
/* ---------------------------------------------------------------------- */

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="font-semibold mb-2 text-lg text-cyan-300">{title}</h3>
    {children}
  </div>
);

const AddButton = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition"
  >
    <FaPlus /> {label}
  </button>
);

const SkillsSection = ({ title, field, parsedData, setParsedData, commonInputStyles }) => (
  <Section title={title}>
    {parsedData[field]?.map((skill, i) => (
      <div key={i} className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={skill}
          onChange={(e) => {
            const list = [...parsedData[field]];
            list[i] = e.target.value;
            setParsedData({ ...parsedData, [field]: list });
          }}
          className={commonInputStyles}
        />
        <button
          onClick={() => {
            const list = [...parsedData[field]];
            list.splice(i, 1);
            setParsedData({ ...parsedData, [field]: list });
          }}
          className="text-red-400 hover:text-red-300 transition"
        >
          <FaTimes />
        </button>
      </div>
    ))}

    <AddButton label={`Add ${title}`} onClick={() =>
      setParsedData({ ...parsedData, [field]: [...parsedData[field], ""] })
    } />
  </Section>
);

const DynamicSection = ({ title, field, parsedData, setParsedData, addTemplate }) => (
  <Section title={title}>
    {parsedData[field]?.map((item, i) => (
      <div key={i} className="grid md:grid-cols-3 gap-2 mb-3">
        {Object.keys(item).map((key) => (
          <input
            key={key}
            type="text"
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={item[key]}
            onChange={(e) => {
              const arr = [...parsedData[field]];
              arr[i][key] = e.target.value;
              setParsedData({ ...parsedData, [field]: arr });
            }}
            className="p-2 border border-zinc-700 rounded w-full bg-zinc-900/60 text-white placeholder-zinc-400 focus:ring-2 focus:ring-cyan-400"
          />
        ))}

        <button
          type="button"
          onClick={() => {
            const arr = [...parsedData[field]];
            arr.splice(i, 1);
            setParsedData({ ...parsedData, [field]: arr });
          }}
          className="text-red-400 hover:text-red-300 transition"
        >
          <FaTimes />
        </button>
      </div>
    ))}

    <AddButton
      label={`Add ${title}`}
      onClick={() =>
        setParsedData({
          ...parsedData,
          [field]: [...parsedData[field], addTemplate],
        })
      }
    />
  </Section>
);
