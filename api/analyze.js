import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Get API Key from Environment Variables
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // 3. Use Gemini 2.5 Flash for fast analysis
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  try {
    const { image } = req.body; // Base64 string from index.html

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const prompt = `
      Analyze this DLS 26 (Dream League Soccer) screenshot.
      - Find the Account/Team Rating at the top.
      - List player names and ratings (e.g., Messi 86, Ronaldo 84).
      - Identify if cards are Legendary (Gold), Rare (Blue), or Common (White).
      - Calculate a final 'Estimated Account Prize' in USD based on these players.
      Return the answer in a clean, easy-to-read summary.
    `;

    // 4. Send the image to Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // 5. Send result back to your HTML app
    res.status(200).json({ analysis: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Analysis failed: " + error.message });
  }
}
