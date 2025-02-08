require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;


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
        const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
        console.error("Error generating response:", error.message);
        return "Error generating tax advice. Please try again.";
    }
}

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


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


