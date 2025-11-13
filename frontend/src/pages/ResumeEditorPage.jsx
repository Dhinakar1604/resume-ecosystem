import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaPlus, FaTimes, FaSave, FaSignOutAlt } from "react-icons/fa";
import logo from "/src/assets/quickcv-logo.svg";

export default function ResumeEditorPage() {
  const navigate = useNavigate();
 const [resumeData, setResumeData] = useState(null);
const [loading, setLoading] = useState(true);
const [aiLoading, setAiLoading] = useState(false); 

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchResume = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/upload/my-resume", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResumeData({
          ...res.data.extractedData,
          summary: res.data.extractedData.summary || "",
        });
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [navigate]);

 
  const updateArrayField = (field, index, key, value) => {
    const newArr = [...(resumeData[field] || [])];
    newArr[index][key] = value;
    setResumeData({ ...resumeData, [field]: newArr });
  };

  const addArrayItem = (field, template) => {
    const newArr = [...(resumeData[field] || []), template];
    setResumeData({ ...resumeData, [field]: newArr });
  };

  const removeArrayItem = (field, index) => {
    const newArr = [...resumeData[field]];
    newArr.splice(index, 1);
    setResumeData({ ...resumeData, [field]: newArr });
  };

  const saveResume = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      await axios.post("http://localhost:5000/api/upload/save", resumeData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Resume saved successfully!");
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error("Failed to save resume.");
    }
  };

const downloadPDF = async (resumeData) => {
  const element = document.getElementById("resume-preview");
  if (!element) return;

  element.style.maxWidth = "100%";
  element.style.margin = "0 auto";

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    scrollY: 0,
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = 210;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;


  if (pdfHeight <= 297) {
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  } else {

    let heightLeft = pdfHeight;
    let position = 0;
    while (heightLeft > 0) {
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= 297;
      if (heightLeft > 0) pdf.addPage();
      position -= 297;
    }
  }
  const filename = `${resumeData?.name || "resume"}_resume.pdf`;
  pdf.save(filename);
};

const generateSummary = async () => {
  if (!resumeData?.summary || resumeData.summary.trim() === "") {
    toast.error("Summary field is empty.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setAiLoading(true);  // start loader
    toast.info("Generating AI summary...");

    const res = await axios.post(
      "http://localhost:5000/api/ai/ai-improve",
      { text: resumeData.summary },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("AI result:", res.data.result);

    setResumeData(prev => ({
      ...prev,
      summary: res.data.result || prev.summary,
    }));

    toast.success("AI summary generated!");
  } catch (err) {
    console.error(err.response?.data || err.message);
    toast.error("Failed to generate summary.");
  } finally {
    setAiLoading(false); 
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-white">
        Loading...
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-white">
        <p className="text-xl font-semibold mb-4">No resume data found.</p>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          Go to Login
        </button>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
    <ToastContainer 
  theme="dark"
  position="top-center"
  autoClose={3000}
/>

 <header className="relative z-40 flex items-center justify-between px-8 py-6 bg-zinc-900/70 backdrop-blur-xl border-b border-zinc-800 shadow animate-slide-up">

  <div className="flex items-center gap-3">
    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/40">
      <img src={logo} className="w-8 h-8" />
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
      onClick={() => navigate(-1)}
     className="px-5 py-2.5 bg-white text-black font-medium rounded-xl border border-gray-300 hover:bg-gray-100 transition shadow"

    >
      ← Back
    </button>

    <button
      onClick={saveResume}
      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 rounded-xl text-white font-semibold shadow shadow-emerald-500/40 transition"
    >
      <FaSave /> Save
    </button>

    <button
      onClick={() => downloadPDF(resumeData)}
      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/80 hover:bg-blue-700 rounded-xl text-white font-semibold transition"
    >
      Download PDF
    </button>

    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-5 py-2.5 bg-red-700/70 hover:bg-red-600 rounded-xl border border-red-800/50 text-white transition"
    >
      <FaSignOutAlt /> Logout
    </button>
  </div>
</header>


      <div className="flex flex-grow flex-col md:flex-row p-6 gap-6">
       <div className="w-full md:w-1/2 p-6 rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 
shadow-[0_0_25px_rgba(6,182,212,0.3)] relative flex flex-col overflow-y-auto transition-all">

<img
  src={logo}
  alt="Background Logo"
  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 w-[1024px] h-[1024px] pointer-events-none"
/>


          <div className="relative z-10 flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-6 text-white">Edit Resume</h2>

            <Section title="Personal Details">
              <InputField
                label="Full Name"
                value={resumeData.name}
                onChange={(e) =>
                  setResumeData({ ...resumeData, name: e.target.value })
                }
              />
              <InputField
                label="Title"
                value={resumeData.title}
                onChange={(e) =>
                  setResumeData({ ...resumeData, title: e.target.value })
                }
              />
              <InputField
                label="Email"
                value={resumeData.email}
                onChange={(e) =>
                  setResumeData({ ...resumeData, email: e.target.value })
                }
              />
              <InputField
                label="Phone"
                value={resumeData.phone}
                onChange={(e) =>
                  setResumeData({ ...resumeData, phone: e.target.value })
                }
              />
              <InputField
                label="LinkedIn"
                value={resumeData.linkedin}
                onChange={(e) =>
                  setResumeData({ ...resumeData, linkedin: e.target.value })
                }
              />
              <InputField
                label="GitHub"
                value={resumeData.github}
                onChange={(e) =>
                  setResumeData({ ...resumeData, github: e.target.value })
                }
              />
<div className="relative">
  <TextareaField
    label="Summary"
    value={resumeData.summary}
    onChange={(e) =>
      setResumeData({ ...resumeData, summary: e.target.value })
    }
  />
  <div className="flex justify-end mt-2">
<button
  onClick={generateSummary}
  disabled={aiLoading || !resumeData.summary.trim()}
  className={`px-5 py-2.5 rounded-full font-semibold transition 
    ${
      aiLoading
        ? "bg-zinc-800/60 cursor-not-allowed text-white border border-cyan-400/50"
        : "bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow shadow-cyan-500/40"
    }`}
>
  {aiLoading ? (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      Processing…
    </div>
  ) : (
    "Generate with AI ✨"
  )}
</button>


  </div>
</div>
            </Section>
            <ArraySection
              title="Education"
              field="education"
              resumeData={resumeData}
              updateArrayField={updateArrayField}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
              template={{ degree: "", institution: "", location: "", years: "" }}
            />
            <ArraySection
              title="Experience"
              field="experience"
              resumeData={resumeData}
              updateArrayField={updateArrayField}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
              template={{ role: "", company: "", years: "", description: "" }}
            />
            <ArraySection
              title="Internships"
              field="internships"
              resumeData={resumeData}
              updateArrayField={updateArrayField}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
              template={{ role: "", company: "", years: "", description: "" }}
            />
            
<ArraySection
  title="Projects"
  field="projects"
  resumeData={resumeData}
  updateArrayField={updateArrayField}
  addArrayItem={addArrayItem}
  removeArrayItem={removeArrayItem}
  template={{ title: "", description: "", year: "" }}
/>
            <ArraySection
              title="Certifications"
              field="certifications"
              resumeData={resumeData}
              updateArrayField={updateArrayField}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
              template={{ name: "", issuer: "", year: "" }}
            />

            <SkillsSection
              title="Technical Skills"
              field="technicalSkills"
              resumeData={resumeData}
              setResumeData={setResumeData}
            />
            <SkillsSection
              title="Soft Skills"
              field="softSkills"
              resumeData={resumeData}
              setResumeData={setResumeData}
            />
            <SkillsSection
              title="Languages"
              field="languages"
              resumeData={resumeData}
              setResumeData={setResumeData}
            />
            <SkillsSection
              title="Areas of Interest"
              field="areasOfInterest"
              resumeData={resumeData}
              setResumeData={setResumeData}
            />
          </div>
        </div>

      <div
  id="resume-preview"
  className="w-full md:w-1/2 p-6 rounded-3xl bg-white shadow-lg overflow-y-auto"
>
  <ResumePreview resumeData={resumeData} />
</div>

      </div>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="font-semibold text-lg mb-3 text-indigo-200">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const InputField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-white mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
    />
  </div>
);

const TextareaField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-white mb-1">{label}</label>
    <textarea
      rows={4}
      value={value}
      onChange={onChange}
      className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
    />
  </div>
);

const ArraySection = ({ title, field, resumeData, updateArrayField, addArrayItem, removeArrayItem, template }) => (
  <Section title={title}>
    {resumeData[field]?.map((item, i) => (
      <div key={i} className="grid md:grid-cols-4 gap-2 mb-2 items-center">
        {Object.keys(template).map((key, idx) => (
          <input
            key={idx}
            type="text"
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={item[key] || ""}
            onChange={(e) => updateArrayField(field, i, key, e.target.value)}
            className="p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        ))}
        <button
          onClick={() => removeArrayItem(field, i)}
          className="text-red-500 hover:text-red-700"
        >
          <FaTimes />
        </button>
      </div>
    ))}
    <button
      onClick={() => addArrayItem(field, template)}
      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-600 mb-3"
    >
      <FaPlus /> Add {title}
    </button>
  </Section>
);

const SkillsSection = ({ title, field, resumeData, setResumeData }) => (
  <Section title={title}>
    {resumeData[field]?.map((skill, i) => (
      <div key={i} className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={skill}
          onChange={(e) => {
            const newSkills = [...resumeData[field]];
            newSkills[i] = e.target.value;
            setResumeData({ ...resumeData, [field]: newSkills });
          }}
          className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
        <button
          onClick={() => {
            const newSkills = [...resumeData[field]];
            newSkills.splice(i, 1);
            setResumeData({ ...resumeData, [field]: newSkills });
          }}
          className="text-red-500 hover:text-red-700"
        >
          <FaTimes />
        </button>
      </div>
    ))}
    <button
      onClick={() => setResumeData({ ...resumeData, [field]: [...(resumeData[field] || []), ""] })}
      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-600"
    >
      <FaPlus /> Add Item
    </button>
  </Section>
);


const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const AcademicCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l-9 5l9 5 9-5-9-5zm0 0v-5" />
  </svg>
);

const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const WrenchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TagSection = ({ title, data, Icon }) => {
  if (!data?.length) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center border-b border-sky-300 pb-2">
        <Icon />
        <h2 className="text-xl font-bold text-slate-700 uppercase tracking-wider ml-3">{title}</h2>
      </div>
      <div className="flex flex-wrap mt-4 gap-2">
        {data.map((item, i) => (
          <span
            key={i}
            className="bg-sky-100 text-sky-800 text-sm font-medium px-3 py-1 rounded-full"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};


const ResumePreview = ({ resumeData }) => {
  const {
    name,
    title,
    phone,
    email,
    linkedin,
    github,
    summary,
    education = [],
    experience = [],
    internships = [],
    projects = [], 
    certifications = [],
    technicalSkills = [],
    softSkills = [],
    languages = [],
    areasOfInterest = [],
  } = resumeData;

  return (
    <div className="p-10 bg-white shadow-xl font-sans min-h-screen">


<div className="text-center border-b-2 border-slate-300 pb-4 mb-6">
  <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">{name}</h1>
  <p className="text-2xl text-sky-600 mt-3">{title}</p>


 
  {(phone || email || linkedin || github) && (
    <p className="text-md text-slate-600 mt-2 flex justify-center flex-wrap gap-4 items-center">
      {phone && <span>{phone}</span>}
      {phone && email && <span>|</span>}
      {email && <span>{email}</span>}
      {(phone || email) && (linkedin || github) && <span>|</span>}
      {linkedin && (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 hover:underline"
        >
          LinkedIn
        </a>
      )}
      {linkedin && github && <span>|</span>}
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 hover:underline"
        >
          GitHub
        </a>
      )}
    </p>
  )}
</div>
      {summary && (
        <div className="mt-6">
          <div className="flex items-center border-b border-sky-300 pb-2">
            <BriefcaseIcon />
            <h2 className="text-xl font-bold text-slate-700 uppercase tracking-wider ml-3">Summary / Profile</h2>
          </div>
          <p className="text-slate-700 mt-4 leading-relaxed italic">{summary}</p>
        </div>
      )}

  
      {education?.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center border-b border-sky-300 pb-2">
            <AcademicCapIcon />
            <h2 className="text-xl font-bold text-slate-700 uppercase tracking-wider ml-3">Education</h2>
          </div>
          <div className="mt-4 space-y-4">
            {education.map((edu, i) => (
              <div key={i} className="border-l-4 border-sky-100 pl-4">
                <h3 className="text-lg font-bold text-slate-800">{edu.degree}</h3>
                <p className="text-md text-sky-700 font-semibold">
                  {edu.institution} - <span className="text-slate-600 font-normal">{edu.location}</span>
                </p>
                <p className="text-sm text-slate-500 italic mt-1">{edu.years}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {experience?.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center border-b border-sky-300 pb-2">
            <BriefcaseIcon />
            <h2 className="text-xl font-bold text-slate-700 uppercase tracking-wider ml-3">Experience</h2>
          </div>
          <div className="mt-4 space-y-4">
            {experience.map((exp, i) => (
              <div key={i}>
                <h3 className="text-lg font-bold text-slate-800">{exp.role}</h3>
                <p className="text-md text-sky-700 font-semibold">
                  {exp.company} | <span className="text-slate-500 font-normal">{exp.years}</span>
                </p>
                <p className="text-slate-600 mt-2">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {internships?.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center border-b border-sky-300 pb-2">
            <LightbulbIcon />
            <h2 className="text-xl font-bold text-slate-700 uppercase tracking-wider ml-3">Internships</h2>
          </div>
          <div className="mt-4 space-y-4">
            {internships.map((intern, i) => (
              <div key={i}>
                <h3 className="text-lg font-bold text-slate-800">{intern.role}</h3>
                <p className="text-md text-sky-700 font-semibold">
                  {intern.company} | <span className="text-slate-500 font-normal">{intern.years}</span>
                </p>
                <p className="text-slate-600 mt-2">{intern.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {projects?.length > 0 && (
  <div className="mt-6">
    <div className="flex items-center border-b border-sky-300 pb-2">
      <BriefcaseIcon /> 
      <h2 className="text-xl font-bold text-slate-700 uppercase tracking-wider ml-3">
        Projects
      </h2>
    </div>
    <div className="mt-4 space-y-4">
      {projects.map((proj, i) => (
        <div key={i} className="border-l-4 border-sky-100 pl-4">
          <h3 className="text-lg font-bold text-slate-800">{proj.title}</h3>
          <p className="text-md text-sky-700 font-semibold">
            {proj.year}
          </p>
          <p className="text-slate-600 mt-1">{proj.description}</p>
        </div>
      ))}
    </div>
  </div>
)}


      {certifications?.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center border-b border-sky-300 pb-2">
            <AcademicCapIcon />
            <h2 className="text-xl font-bold text-slate-700 uppercase tracking-wider ml-3">Certifications</h2>
          </div>
          <div className="mt-4 space-y-3">
            {certifications.map((cert, i) => (
              <div key={i}>
                <h3 className="text-lg font-bold text-slate-800">{cert.name}</h3>
                <p className="text-md text-sky-700 font-semibold">
                  {cert.issuer} | <span className="text-slate-500 font-normal">{cert.year}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <TagSection title="Technical Skills" data={technicalSkills} Icon={WrenchIcon} />
      <TagSection title="Soft Skills" data={softSkills} Icon={LightbulbIcon} />
      <TagSection title="Languages" data={languages} Icon={LightbulbIcon} />
      <TagSection title="Areas of Interest" data={areasOfInterest} Icon={AcademicCapIcon} />

    </div>
  );
};
