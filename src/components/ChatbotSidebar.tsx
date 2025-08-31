import React, { useState, useRef, useEffect } from 'react';
import './ChatbotSidebar.css';

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
      text: "Hi! I'm Auz, your AuzLand Real Estate assistant. How can I help you today?",
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

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(inputMessage),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('property') || lowerMessage.includes('house') || lowerMessage.includes('land')) {
      return "I can help you find properties! What type of property are you looking for? I can search by location, price range, property type, and more.";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return "Property prices vary by location and type. I can help you filter properties by price range. What's your budget?";
    } else if (lowerMessage.includes('location') || lowerMessage.includes('suburb') || lowerMessage.includes('area')) {
      return "I can help you find properties in specific areas. Which suburb or region are you interested in?";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return "I'm here to help! I can assist with property searches, explain features, answer questions about the platform, and more. What do you need help with?";
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('agent')) {
      return "I can help you get in touch with our team. Would you like me to show you how to contact us or schedule a viewing?";
    } else {
      const responses = [
        "That's an interesting question! Let me help you with that.",
        "I'd be happy to assist you with property-related inquiries.",
        "Great question! I can help you find the information you need.",
        "I'm here to make your property search easier. How can I help?",
        "Let me help you navigate through our property database."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
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
