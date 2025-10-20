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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

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
        console.error(err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in.", { position: "top-center", color: "white" });
      navigate("/login");
      return;
    }
    if (!file) {
      toast.error("Please select a resume file.", { position: "top-center", color: "white" });
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("✅ Resume parsed successfully!", { position: "top-center", color: "white" });
      setParsedData({ ...parsedData, ...res.data.extractedData });
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Upload failed.", { position: "top-center", color: "white" });
    } finally {
      setLoading(false);
    }
  };

  const updateArrayField = (field, index, key, value) => {
    const newArr = [...(parsedData[field] || [])];
    newArr[index][key] = value;
    setParsedData({ ...parsedData, [field]: newArr });
  };

  const addArrayItem = (field, template) => {
    const newArr = [...(parsedData[field] || []), template];
    setParsedData({ ...parsedData, [field]: newArr });
  };

  const removeArrayItem = (field, index) => {
    const newArr = [...parsedData[field]];
    newArr.splice(index, 1);
    setParsedData({ ...parsedData, [field]: newArr });
  };

  const commonInputStyles = "p-2 border-gray-600 rounded w-full bg-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col">
      <ToastContainer />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white/10 backdrop-blur-md border-b border-gray-700 shadow-lg">
        <h1 className="text-3xl font-bold tracking-wide">
          <span className="text-white">Quick</span>
          <span className="text-gray-400">CV</span>
        </h1>
        <div className="flex items-center gap-4 ml-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition duration-300"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300"
          >
            <FaSignOutAlt /> Logout
          </button>
          <div className="flex items-center gap-2 relative">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white/50" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-white font-medium">{userName}</span>
          </div>
        </div>
      </nav>

      <main className="flex-grow p-8 flex flex-col items-center">
        {/* Upload Section */}
        <div className="w-full max-w-5xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Upload Resume</h2>
          <form onSubmit={handleUpload} className="flex flex-col md:flex-row items-center gap-4">
            <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/30 p-6 rounded-2xl cursor-pointer hover:border-white/50 bg-white/5 text-white/70 transition">
              {file ? <p className="font-medium">{file.name}</p> : <p>Click or drag a PDF/DOCX file here</p>}
              <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
            </label>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Parsing..." : "Upload & Parse"}
            </button>
          </form>
        </div>

        {/* Manual / Parsed Data Forms */}
        <div className="w-full max-w-5xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-indigo-400">🧾 Resume Details (Manual / Uploaded)</h2>

          {/* Basic Info */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <input type="text" placeholder="Name" value={parsedData.name} onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })} className={commonInputStyles} />
            <input type="text" placeholder="Title" value={parsedData.title} onChange={(e) => setParsedData({ ...parsedData, title: e.target.value })} className={commonInputStyles} />
            <input type="email" placeholder="Email" value={parsedData.email} onChange={(e) => setParsedData({ ...parsedData, email: e.target.value })} className={commonInputStyles} />
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Phone" value={parsedData.phone} onChange={(e) => setParsedData({ ...parsedData, phone: e.target.value })} className={commonInputStyles} />
            <input type="text" placeholder="LinkedIn URL" value={parsedData.linkedin} onChange={(e) => setParsedData({ ...parsedData, linkedin: e.target.value })} className={commonInputStyles} />
          </div>
          <input type="text" placeholder="GitHub URL" value={parsedData.github} onChange={(e) => setParsedData({ ...parsedData, github: e.target.value })} className={`${commonInputStyles} mb-4`} />
          <textarea placeholder="Summary" value={parsedData.summary} onChange={(e) => setParsedData({ ...parsedData, summary: e.target.value })} className={`${commonInputStyles} mb-6`} rows={4} />

          {/* Sections */}
          <DynamicSection title="Education" field="education" parsedData={parsedData} setParsedData={setParsedData} addTemplate={{ degree: "", institution: "", location: "", years: "" }} />
          <DynamicSection title="Experience" field="experience" parsedData={parsedData} setParsedData={setParsedData} addTemplate={{ role: "", company: "", years: "", description: "" }} />
          <DynamicSection title="Internships" field="internships" parsedData={parsedData} setParsedData={setParsedData} addTemplate={{ role: "", company: "", years: "", description: "" }} />
          <DynamicSection title="Projects" field="projects" parsedData={parsedData} setParsedData={setParsedData} addTemplate={{ title: "", description: "", year: "" }} />
          <DynamicSection title="Certifications" field="certifications" parsedData={parsedData} setParsedData={setParsedData} addTemplate={{ name: "", issuer: "", year: "" }} />

          {/* Skills */}
          <SkillsSection commonInputStyles={commonInputStyles} title="Technical Skills" field="technicalSkills" parsedData={parsedData} setParsedData={setParsedData} />
          <SkillsSection commonInputStyles={commonInputStyles} title="Soft Skills" field="softSkills" parsedData={parsedData} setParsedData={setParsedData} />
          <SkillsSection commonInputStyles={commonInputStyles} title="Languages" field="languages" parsedData={parsedData} setParsedData={setParsedData} />
          <SkillsSection commonInputStyles={commonInputStyles} title="Areas of Interest" field="areasOfInterest" parsedData={parsedData} setParsedData={setParsedData} />

          {/* Save / Discard */}
          <div className="flex gap-4 justify-end mt-6">
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  if (!token) return navigate("/login");
                  const dataToSave = { ...parsedData, fileName: file?.name || "resume" };
                  await axios.post("http://localhost:5000/api/upload/save", dataToSave, { headers: { Authorization: `Bearer ${token}` } });
                  toast.success("✅ Resume saved successfully!");
                } catch (err) {
                  console.error(err.response?.data || err.message);
                  toast.error("Failed to save resume.");
                }
              }}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-semibold"
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
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-semibold"
            >
              Discard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* 🔧 Reusable Components */
const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="font-semibold mb-2 text-lg text-indigo-400">{title}</h3>
    {children}
  </div>
);

const AddButton = ({ label, onClick }) => (
  <button type="button" onClick={onClick} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition">
    <FaPlus /> {label}
  </button>
);

const SkillsSection = ({ title, field, parsedData, setParsedData, commonInputStyles }) => (
  <div className="mb-4">
    <h3 className="font-semibold mb-2 text-lg text-indigo-400">{title}</h3>
    {parsedData[field]?.map((skill, i) => (
      <div key={i} className="flex items-center gap-2 mb-1">
        <input
          type="text"
          value={skill}
          onChange={(e) => {
            const newSkills = [...parsedData[field]];
            newSkills[i] = e.target.value;
            setParsedData({ ...parsedData, [field]: newSkills });
          }}
          className={commonInputStyles}
        />
        <button
          onClick={() => {
            const newSkills = [...parsedData[field]];
            newSkills.splice(i, 1);
            setParsedData({ ...parsedData, [field]: newSkills });
          }}
          className="text-red-500 hover:text-red-400 transition"
        >
          <FaTimes />
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={() =>
        setParsedData({
          ...parsedData,
          [field]: [...(parsedData[field] || []), ""],
        })
      }
      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition"
    >
      <FaPlus /> Add Item
    </button>
  </div>
);

const DynamicSection = ({ title, field, parsedData, setParsedData, addTemplate }) => (
  <Section title={title}>
    {parsedData[field]?.map((item, i) => (
      <div key={i} className={`grid md:grid-cols-${Object.keys(item).length + 1} gap-2 mb-2 items-center`}>
        {Object.keys(item).map((key) => (
          <input
            key={key}
            type="text"
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={item[key] || ""}
            onChange={(e) => {
              const newArr = [...parsedData[field]];
              newArr[i][key] = e.target.value;
              setParsedData({ ...parsedData, [field]: newArr });
            }}
            className="p-2 border-gray-600 rounded w-full bg-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ))}
        <button
          type="button"
          onClick={() => {
            const newArr = [...parsedData[field]];
            newArr.splice(i, 1);
            setParsedData({ ...parsedData, [field]: newArr });
          }}
          className="text-red-500 hover:text-red-400 transition"
        >
          <FaTimes />
        </button>
      </div>
    ))}
    <AddButton label={`Add ${title}`} onClick={() => setParsedData({ ...parsedData, [field]: [...(parsedData[field] || []), addTemplate] })} />
  </Section>
);
