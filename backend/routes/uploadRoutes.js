import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import Resume from "../models/Resume.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { createRequire } from "module";
import axios from "axios";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

function normalizeFields(data) {
  const arrayFields = [
    "education",
    "experience",
    "internships",
    "technicalSkills",
    "softSkills",
    "languages",
    "certifications",
    "areasOfInterest",
    "projects",
  ];

  arrayFields.forEach((field) => {
    if (!data[field]) {
      data[field] = [];
    } else if (typeof data[field] === "string") {
      try {
        const parsed = JSON.parse(data[field]);
        data[field] = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        data[field] = [];
      }
    } else if (!Array.isArray(data[field])) {
      data[field] = [data[field]];
    }
  });

  const stringFields = ["name", "title", "email", "phone", "linkedin", "github", "summary"];
  stringFields.forEach((field) => {
    if (!data[field] || typeof data[field] !== "string") data[field] = "";
  });

  return data;
}

async function parseResumeWithAI(text) {
  const prompt = `
You are an expert resume parsing assistant. Extract key information from the resume text below and return it as a *strict* JSON object.
Do not include any text or markdown before or after the JSON.

**Instructions:**
1.  Carefully read the entire resume text.
2.  Identify personal contact details, which are often at the very top.
3.  Extract information for all sections based on the detailed JSON format below.
4.  For array fields (education, internships, projects, certifications), create a separate JSON object for each *distinct* item.
5.  **CRITICAL:** If any field or sub-field is not present, use "" for strings, null for numbers, [] for arrays.

**JSON Output Format:**
{
  "name": "",
  "title": "",
  "email": "",
  "phone": "",
  "linkedin": "",
  "github": "",
  "summary": "",
  "education": [{"institution": "", "degree": "", "location": "", "dates": "", "gpa": ""}],
  "internships": [{"company": "", "role": "", "location": "", "dates": "", "description": ""}],
  "projects": [{"title": "", "dates": "", "description": ""}],
  "certifications": [{"name": "", "issuer": "", "year": null}],
  "technicalSkills": [],
  "softSkills": [],
  "languages": [],
  "areasOfInterest": []
}

**Resume text:**
"""${text}"""
`;

  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let aiText = res.data.choices[0].message.content;
    aiText = aiText.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(aiText);
    return normalizeFields(parsed);
  } catch (err) {
    console.error("AI JSON parse error:", err.message || err);
    return normalizeFields({
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
      technicalSkills: [],
      softSkills: [],
      languages: [],
      certifications: [],
      areasOfInterest: [],
      projects: [],
    });
  }
}
router.post("/", authenticateToken, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { originalname, mimetype, buffer } = req.file;
    let text = "";

    if (
      mimetype === "application/pdf" ||
      mimetype === "application/x-pdf" ||
      mimetype === "application/octet-stream"
    ) {
      try {
        const data = await pdfParse(buffer);
        text = data.text?.trim() || "";

        console.log(`PDF text length: ${text.length}`);

        if (!text) {
          return res.status(400).json({
            message:
              "PDF contains no readable text. Ensure it is a text-based PDF, not scanned.",
          });
        }
      } catch (err) {
        console.error("PDF parsing failed:", err);
        return res.status(500).json({ message: "Failed to parse PDF" });
      }
    } 

    else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value?.trim() || "";
      if (!text)
        return res.status(400).json({ message: "DOCX contains no readable text." });
    } 
    else {
      return res
        .status(400)
        .json({ message: "Unsupported file type. Only PDF and DOCX allowed." });
    }
    const extractedData = await parseResumeWithAI(text);

    res.json({ message: "Resume parsed successfully", extractedData, fileName: originalname });

  } catch (err) {
    console.error("Resume parse error:", err);
    res.status(500).json({ message: "Failed to parse resume" });
  }
});

router.post("/save", authenticateToken, async (req, res) => {
  try {
    const extractedData = req.body;
    if (!extractedData) return res.status(400).json({ message: "No data to save" });

    let resume = await Resume.findOne({ userId: req.userId });

    if (resume) {
      resume.extractedData = extractedData;
      resume.fileName = extractedData.fileName || resume.fileName;
      await resume.save();
    } else {
      resume = await Resume.create({
        userId: req.userId,
        fileName: extractedData.fileName || "resume",
        extractedData,
      });
    }

    res.status(200).json({ message: "Resume saved successfully", resume });
  } catch (err) {
    console.error("Resume save error:", err);
    res.status(500).json({ message: "Failed to save resume" });
  }
});

router.get("/my-resume", authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!resume) return res.status(404).json({ message: "No resume found for this user" });

    res.json(resume);
  } catch (err) {
    console.error("Fetch resume error:", err);
    res.status(500).json({ message: "Failed to fetch resume" });
  }
});

export default router