const axios = require('axios');

exports.getSqlHint = async (req, res) => {
  const { problemStatement, userQuery } = req.body;

  const systemPrompt = `
    You are a SQL Tutor for CipherSQLStudio. 
    Problem: "${problemStatement}"
    User's Attempt: "${userQuery}"
    
    CRITICAL INSTRUCTION: 
    1. Provide a conceptual hint to help the user solve the problem.
    2. DO NOT provide the actual SQL code or the direct solution.
    3. Point out logical errors or suggest SQL keywords (like JOIN, GROUP BY, WHERE) they might need.
    4. Keep the response under 3 sentences.
  `;

  try {
    // Example using Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.LLM_API_KEY}`,
      {
        contents: [{ parts: [{ text: systemPrompt }] }]
      }
    );

    const hint = response.data.candidates[0].content.parts[0].text;
    res.json({ hint });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hint from AI." });
  }
};