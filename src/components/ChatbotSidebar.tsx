import React, { useState, useRef, useEffect } from 'react';
import './ChatbotSidebar.css';
import { aiService } from '../services/aiService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatbotSidebar: React.FC<ChatbotSidebarProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Auz from AuzLand Real Estate. What can I help you with today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Always scroll to top when sidebar opens
  useEffect(() => {
    if (isOpen && scrollerRef.current) {
      scrollerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    const currentInput = inputMessage;
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Convert messages to the format expected by AI service
      const conversationHistory = messages
        .filter(msg => !msg.isUser || msg.text.trim()) // Filter out empty messages
        .map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.text
        }));

      // Get AI response
      const aiResponseText = await aiService.generateResponse(currentInput, conversationHistory);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        text: "Hi! I'm Auz, your AuzLand Real Estate assistant. How can I help you today?",
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <aside id="rauz-chat" className={`chatbot-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="chatbot-header">
        <div className="chatbot-title">
          <div className="chatbot-avatar">
            <img 
              src="/Rauz.png" 
              alt="Auz AI Assistant"
              onError={(e) => {
                console.error('Failed to load Rauz.png image:', e);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '🤖';
              }}
            />
          </div>
          <h3>AUZ</h3>
        </div>
        <div className="chatbot-header-controls">
          <button 
            className="chatbot-delete-btn"
            onClick={clearChat}
            title="Clear chat history"
          >
            🗑️
          </button>
          <button 
            className="chatbot-toggle-btn"
            onClick={onToggle}
            title={`${isOpen ? 'Hide' : 'Show'} Chatbot`}
          >
            {isOpen ? '→' : '←'}
          </button>
        </div>
      </div>

      <div className="chatbot-content">
        <div className="messages-container" ref={scrollerRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rauz-message ${message.isUser ? 'rauz-user-message' : 'rauz-ai-message'}`}
            >
              <div className="rauz-message-content">
                {message.text}
              </div>
              <div className="rauz-message-timestamp">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="rauz-message rauz-ai-message typing">
              <div className="rauz-message-content">
                <div className="rauz-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chatbot-input-container">
          <div className="input-wrapper">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Auz about properties, locations, prices..."
              rows={1}
              className="chatbot-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="send-button"
              title="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ChatbotSidebar;
