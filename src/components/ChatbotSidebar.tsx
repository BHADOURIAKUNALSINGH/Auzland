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
  currentFilters?: any;
  propertyCount?: number;
  onFiltersChange?: (newFilters: any) => void;
  onClearFilters?: () => void;
}

const ChatbotSidebar: React.FC<ChatbotSidebarProps> = ({ 
  isOpen, 
  onToggle, 
  currentFilters, 
  propertyCount = 0, 
  onFiltersChange, 
  onClearFilters 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm Auz from AuzLand Real Estate. I can see ${propertyCount} properties on the left. I can help you filter them to find your perfect property. What are you looking for?`,
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
      // Simulate AI response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple mock responses for real estate queries
      let aiResponseText = "I'm here to help with AuzLand properties! ";
      
      const lowerInput = currentInput.toLowerCase();
      if (lowerInput.includes('price') || lowerInput.includes('cost')) {
        aiResponseText += "Our properties range from $500,000 to $3,000,000+. What's your budget range?";
      } else if (lowerInput.includes('location') || lowerInput.includes('suburb')) {
        aiResponseText += "We have properties in Oran Park, Austral, Leppington, and surrounding areas. Which area interests you?";
      } else if (lowerInput.includes('bedroom') || lowerInput.includes('bathroom')) {
        aiResponseText += "We have properties from 1-5+ bedrooms and 1-4+ bathrooms. What size home are you looking for?";
      } else if (lowerInput.includes('viewing') || lowerInput.includes('inspect')) {
        aiResponseText += "I can help arrange a viewing! Please contact us at Abhi@auzlandre.com.au or visit our contact page.";
      } else {
        aiResponseText += "What type of property are you looking for? I can help with houses, apartments, townhouses, or land.";
      }
      
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
        text: `Hi! I'm Auz from AuzLand Real Estate. I can see ${propertyCount} properties on the left. I can help you filter them to find your perfect property. What are you looking for?`,
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
              placeholder="Ask me to filter the listings: 'Show houses under $1M' or 'Properties with 3+ bedrooms'"
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
