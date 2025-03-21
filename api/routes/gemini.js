import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { query } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${"AIzaSyAU_kZW22fCUalxcppF1Vg2hLFy9hpnO08"}`,
      {
        contents: [
          {
            parts: [{ text: query }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const aiReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";
    res.json({ reply: aiReply });
  } catch (error) {
    console.error('Error communicating with Gemini AI:', error.response?.data || error.message || error);

    // Send a clear error message to the frontend
    res.status(500).json({
      error: 'Failed to communicate with Gemini AI',
      details: error.response?.data?.error?.message || error.message || 'Unknown error',
    });
  }
});

export default router;