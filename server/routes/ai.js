const express = require('express');
const { AIService } = require('../services/aiService');
const router = express.Router();

const aiService = new AIService();

// POST /api/ai/filter
router.post('/filter', async (req, res) => {
  try {
    const { userMessage, conversationHistory = [], currentFilters = {} } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    console.log('AI API - Processing filter request:', userMessage);
    
    const response = await aiService.generateFilterResponse(
      userMessage, 
      conversationHistory, 
      currentFilters
    );

    res.json(response);
  } catch (error) {
    console.error('AI API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: "I'm sorry, I encountered an error while processing your request. Please try again."
    });
  }
});

// POST /api/ai/chat (legacy endpoint)
router.post('/chat', async (req, res) => {
  try {
    const { userMessage, conversationHistory = [] } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    console.log('AI API - Processing chat request:', userMessage);
    
    const response = await aiService.generateResponse(userMessage, conversationHistory);

    res.json({ message: response });
  } catch (error) {
    console.error('AI API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: "I'm sorry, I encountered an error while processing your request. Please try again."
    });
  }
});

module.exports = router;

