const express = require('express');
const axios = require('axios');
const router = express.Router();

// POST /api/analyze
router.post('/analyze', async (req, res) => {
  console.log('Analyze request received with body:', req.body);

  try {
    const { resumeText, jobDescText } = req.body;

    if (!resumeText || !jobDescText) {
      console.warn('Missing required fields');
      return res.status(400).json({
        error: 'Both resumeText and jobDescText are required',
        received: {
          resumeText: !!resumeText,
          jobDescText: !!jobDescText
        }
      });
    }

    console.log('Calling Gemini API...');
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Analyze this resume against job description:

Resume:
${resumeText}

Job Description:
${jobDescText}

Provide JSON response with:
- matchPercentage (number)
- missingSkills (array of strings)
- suggestions (array of strings)`
              }
            ]
          }
        ]
      },
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Gemini API raw response:', result);

    try {
      const jsonStart = result.indexOf('{');
      const jsonEnd = result.lastIndexOf('}') + 1;
      const jsonString = result.slice(jsonStart, jsonEnd);
      const analysisResult = JSON.parse(jsonString);

      res.json({
        success: true,
        ...analysisResult
      });
    } catch (parseError) {
      console.warn('Failed to parse JSON, returning raw text');
      res.json({
        success: true,
        analysis: result
      });
    }

  } catch (error) {
    console.error('Gemini API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
      response: error.response?.data
    });
  }
});

module.exports = router;
