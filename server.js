import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post("/generate", async (req, res) => {
  try {
    const { name, email, phone, location, education, experience, skills, projects, language } = req.body;

      
const prompt = `
Act as a Senior Executive Resume Writer. 
Goal: Generate a comprehensive, full-page CV in ${language === "fr" ? "French" : "English"}.

User Data to Process:
- Name: ${name}
- Contact: ${email} | ${phone} | ${location}
- Education: ${education}
- Experience: ${experience}
- Skills: ${skills}
- Projects: ${projects}

CRITICAL INSTRUCTIONS:
**IMPORTANT: Your entire response must be 300 words or fewer. Never exceed this limit. Prioritize brevity, clarity, and professionalism.
1. **NO SKIPPING**: You must include a section for Education, Contact, Experience, Skills, and Projects. If the input for a section is brief, use your knowledge to expand it into professional bullet points.
2. **EXPAND & POLISH**: Transform simple phrases into professional achievements using action verbs (e.g., "Led," "Developed," "Optimized").
3. **HTML STRUCTURE**:
   - <h1>${name}</h1>
   - Contact details in a <p> or <div>.
   - <h2>Section Title</h2> followed by <ul><li>...</li></ul> for all lists.
4. **JSON FORMAT**: Return ONLY valid JSON: {"html": "..."}. No markdown code blocks.

REQUIRED SECTIONS:
- Contact (Name, Email, Number, Location)
- Professional Summary (Create a 2-3 sentence hook based on their experience).
- Professional Experience (Minimum 3 detailed bullets per role).
- Education.
- Skills (Categorize them if possible, e.g., Technical vs. Soft Skills).
- Key Projects.
`;




    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Lower temperature = more consistent
      response_format: { type: "json_object" } // <--- CRITICAL: This forces Groq to return valid JSON
    });

    let raw = response.choices[0].message.content;

    // Groq's JSON mode is good, but let's be safe
    try {
      const cvData = JSON.parse(raw);
      res.json({ cv: cvData });
    } catch (parseError) {
      console.error("JSON Parse Error:", raw);
      res.status(500).json({ error: "AI returned invalid JSON format." });
    }

  } catch (err) {
    console.error("Groq API or Server Error:", err);
    res.status(500).json({ error: "Failed to generate CV. Check API key and connection." });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
