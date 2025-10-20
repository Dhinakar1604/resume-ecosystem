import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    extractedData: {
      name: { type: String, default: "" },
      title: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      summary: { type: String, default: "" },
      education: { type: Array, default: [] },
      experience: { type: Array, default: [] },
      internships: { type: Array, default: [] },
      technicalSkills: { type: [String], default: [] },
      softSkills: { type: [String], default: [] },
      languages: { type: [String], default: [] },
      certifications: {
        type: [
          {
            name: { type: String, default: "" },
            issuer: { type: String, default: "" },
            year: { type: Number, default: null },
          },
        ],
        default: [],
      },
      areasOfInterest: { type: [String], default: [] },
      projects: {
        type: [
          {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            year: { type: Number, default: null },
          },
        ],
        default: [],
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);
