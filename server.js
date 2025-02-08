require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ["https://tax-gpt.netlify.app"];

app.use(cors({
    origin: allowedOrigins,
    methods: "GET,POST,OPTIONS",
    allowedHeaders: "Content-Type,Authorization"
}));

app.use(bodyParser.json());


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Function to generate tax advice using Gemine
async function generateITRAdvice(incomeSources, deductions) {
    const prompt = `
    You are a supreme absolute tax assistant helping users determine the correct ITR form and tax-saving options.
    The user has the following income sources: ${incomeSources}.
    They are considering deductions under: ${deductions}.
    
    Recommend the appropriate ITR form and suggest possible tax-saving investments.
    Keep the response concise and easy to understand. Don't say consult a professional.
    `;

    try {
        const response = await fetch(`${backendURL}/get-advice`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ incomeSources, deductions })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // 🔹 Convert Markdown to HTML: Replace **bold** with <b> tags
        let formattedAdvice = data.advice
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Convert **bold** to <b> tag
            .replace(/\n/g, "<br>"); // Add line breaks

        responseDiv.innerHTML = `<p>${formattedAdvice}</p>`;
    } catch (error) {
        console.error("Fetch error:", error);
        responseDiv.innerHTML = "❌ Error fetching advice. Please try again.";
    }
}

// ✅ Fix: Handle CORS Preflight Requests
app.options("*", cors());
// Generating Tax Advice
app.post("/get-advice", async (req, res) => {
    const { incomeSources, deductions } = req.body;

    if (!incomeSources || !deductions) {
        return res.status(400).json({ error: "Please provide both income sources and deductions." });
    }

    const advice = await generateITRAdvice(incomeSources, deductions);
    res.json({ advice });
});

// Serve the frontend (HTML + JS)
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("Backend is working! 🚀");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


