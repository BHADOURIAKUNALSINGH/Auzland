import OpenAI from "openai";

// Initialize OpenAI client with DeepInfra configuration
const openai = new OpenAI({
  apiKey: "GG6cBsIY54h7PYIdginIuC2MsFlZafeg", // Hardcoded API key
  baseURL: 'https://api.deepinfra.com/v1/openai',
  dangerouslyAllowBrowser: true, // Required for frontend usage
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AIService {
  private model = "meta-llama/Meta-Llama-3-8B-Instruct";
  private stream = false;

  // System prompt to make the AI act as a real estate assistant
  private systemPrompt = `You are AUZ, the dedicated real estate assistant for AuzLand Real Estate. Always introduce yourself as "Auz from AuzLand Real Estate" when appropriate.

You ONLY help with:
- AuzLand property searches and listings
- Property locations, prices, and features
- Scheduling viewings for AuzLand properties
- Real estate advice related to AuzLand

NEVER answer questions about:
- General knowledge, science, math, or STEM subjects
- Politics, current events, or news
- Weather or other topics
- Properties from other companies
- Programming, technology, or academic subjects
- Personal advice unrelated to property
- Entertainment, sports, or hobbies

STRICT RULES:
- If asked about ANYTHING outside AuzLand Real Estate, politely redirect back to properties in a friendly, natural way. Use varied responses like:
  * "That's interesting, but I'm here to help with AuzLand properties! Are you looking for a particular type of home?"
  * "I wish I could help with that, but I specialize in real estate. What kind of property are you searching for?"
  * "That's outside my expertise - I focus on helping people find their perfect AuzLand property. What's your ideal location?"
- Keep ALL responses to 3-5 lines maximum
- Stay completely focused on AuzLand property listings
- Be warm, friendly, and conversational while redirecting`;

  async generateResponse(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      console.log('AI Service - Generating response for:', userMessage);

      // Build messages array with system prompt and conversation history
      // NOTE: Only last 5 messages are sent to API (not complete history) to save tokens and stay focused
      const messages: ChatMessage[] = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory.slice(-5), // Keep only last 5 messages for context
        { role: 'user', content: userMessage }
      ];

      if (this.stream) {
        // Handle streaming response (for future enhancement)
        const completion = await openai.chat.completions.create({
          messages: messages,
          model: this.model,
          stream: true,
          max_tokens: 50, // Very short responses (3-5 lines max)
          temperature: 0.7,
        });

        let response = '';
        for await (const chunk of completion) {
          if (chunk.choices[0].finish_reason) {
            console.log('Streaming finished');
          } else {
            response += chunk.choices[0].delta.content || '';
          }
        }
        return response;
      } else {
        // Handle non-streaming response
        const completion = await openai.chat.completions.create({
          messages: messages,
          model: this.model,
          stream: false,
          max_tokens: 50, // Very short responses (3-5 lines max)
          temperature: 0.7,
        });

        const response = completion.choices[0].message.content;
        console.log('AI Response generated. Usage:', completion.usage?.prompt_tokens, completion.usage?.completion_tokens);
        return response || "I'm sorry, I couldn't generate a response. Please try again.";
      }
    } catch (error) {
      console.error('AI Service Error Details:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      // Provide helpful error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          return "I'm having trouble connecting - it seems there's an authentication issue. Please check the API configuration.";
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          return "I'm currently experiencing high demand. Please try again in a moment.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          return "I'm having trouble connecting to my AI service. Please check your internet connection and try again.";
        }
      }
      
      return `I'm sorry, I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again later.`;
    }
  }

  // Method to enable/disable streaming
  setStreaming(enabled: boolean) {
    this.stream = enabled;
  }

  // Method to change the AI model
  setModel(model: string) {
    this.model = model;
  }
}

// Export a singleton instance
export const aiService = new AIService();
