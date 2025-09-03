import React, { useState, useRef, useEffect } from 'react';
import './ChatbotSidebar.css'; // Reuse existing styles

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface FilterChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  currentFilters: any;
  propertyCount: number;
  onFilterChange: (filterName: string, value: string) => void;
  onClearFilters: () => void;
}

const FilterChatbot: React.FC<FilterChatbotProps> = ({ 
  isOpen, 
  onToggle, 
  currentFilters, 
  propertyCount,
  onFilterChange,
  onClearFilters 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm Auz from AuzLand Real Estate. I can see ${propertyCount} properties on the left. How can I help you filter them to find your perfect property?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Update welcome message when property count changes
  useEffect(() => {
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[0] = {
        ...newMessages[0],
        text: `Hi! I'm Auz from AuzLand Real Estate. I can see ${propertyCount} properties on the left. How can I help you filter them to find your perfect property?`
      };
      return newMessages;
    });
  }, [propertyCount]);

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

  const buildFilterContext = () => {
    const activeFilters = Object.entries(currentFilters)
      .filter(([key, value]) => value && value !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    return `Current active filters: ${activeFilters || 'None'}. Showing ${propertyCount} properties.`;
  };

  const parseFilterCommands = (response: string) => {
    // Simple filter parsing - look for common patterns
    const lowerResponse = response.toLowerCase();
    
    // Price filters
    if (lowerResponse.includes('under $') || lowerResponse.includes('below $')) {
      const priceMatch = lowerResponse.match(/(?:under|below)\s*\$?([\d,]+)/);
      if (priceMatch) {
        const price = priceMatch[1].replace(/,/g, '');
        onFilterChange('priceMax', price);
        return true;
      }
    }
    
    if (lowerResponse.includes('over $') || lowerResponse.includes('above $')) {
      const priceMatch = lowerResponse.match(/(?:over|above)\s*\$?([\d,]+)/);
      if (priceMatch) {
        const price = priceMatch[1].replace(/,/g, '');
        onFilterChange('priceMin', price);
        return true;
      }
    }

    // Bedroom filters
    if (lowerResponse.includes('bedroom')) {
      const bedroomMatch = lowerResponse.match(/(\d+)\s*(?:\+|\s*or\s*more)?\s*bedroom/);
      if (bedroomMatch) {
        onFilterChange('bedroomsMin', bedroomMatch[1]);
        return true;
      }
    }

    // Property type filters
    if (lowerResponse.includes('house') && lowerResponse.includes('only')) {
      onFilterChange('propertyType', 'house');
      return true;
    }
    if (lowerResponse.includes('apartment') && lowerResponse.includes('only')) {
      onFilterChange('propertyType', 'apartment');
      return true;
    }
    if (lowerResponse.includes('townhouse') && lowerResponse.includes('only')) {
      onFilterChange('propertyType', 'townhouse');
      return true;
    }

    // Clear filters
    if (lowerResponse.includes('clear filter') || lowerResponse.includes('show all') || lowerResponse.includes('remove filter')) {
      onClearFilters();
      return true;
    }

    return false;
  };

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
      let aiResponseText = "I'm here to help you filter AuzLand properties! ";
      
      const lowerInput = currentInput.toLowerCase();
      if (lowerInput.includes('price') || lowerInput.includes('cost')) {
        aiResponseText += "I can help filter by price range. What's your budget?";
      } else if (lowerInput.includes('location') || lowerInput.includes('suburb')) {
        aiResponseText += "I can filter by location. Which suburb interests you?";
      } else if (lowerInput.includes('bedroom') || lowerInput.includes('bathroom')) {
        aiResponseText += "I can filter by bedrooms and bathrooms. What size home are you looking for?";
      } else if (lowerInput.includes('house') || lowerInput.includes('apartment') || lowerInput.includes('townhouse')) {
        aiResponseText += "I can filter by property type. What type of property are you interested in?";
      } else {
        aiResponseText += "I can help filter properties by price, location, bedrooms, bathrooms, or property type. What would you like to filter by?";
      }
      
      // Try to parse and apply filters automatically
      const filtersApplied = parseFilterCommands(aiResponseText);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);

      // If filters were applied, add a follow-up message
      if (filtersApplied) {
        setTimeout(() => {
          const followUpMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "Filters applied! You should see the updated results on the left.",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, followUpMessage]);
        }, 1000);
      }
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
        text: `Hi! I'm Auz from AuzLand Real Estate. I can see ${propertyCount} properties on the left. How can I help you filter them to find your perfect property?`,
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  // Quick action buttons for common filters
  const handleQuickFilter = (action: string) => {
    let message = '';
    switch (action) {
      case 'houses-under-1m':
        onFilterChange('propertyType', 'house');
        onFilterChange('priceMax', '1000000');
        message = 'Showing houses under $1M';
        break;
      case 'apartments':
        onFilterChange('propertyType', 'apartment');
        message = 'Showing apartments only';
        break;
      case '3plus-bedrooms':
        onFilterChange('bedroomsMin', '3');
        message = 'Showing properties with 3+ bedrooms';
        break;
      case 'clear-all':
        onClearFilters();
        message = 'All filters cleared';
        break;
      default:
        return;
    }

    // Add system message about the action
    const systemMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  return (
    <aside id="filter-chat" className={`chatbot-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="chatbot-header">
        <div className="chatbot-title">
          <div className="chatbot-avatar">
            <img 
              src="/Rauz.png" 
              alt="Auz Filter Assistant"
              onError={(e) => {
                console.error('Failed to load Rauz.png image:', e);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '🔍';
              }}
            />
          </div>
          <h3>AUZ Filter Assistant</h3>
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
            title={`${isOpen ? 'Hide' : 'Show'} Filter Assistant`}
          >
            {isOpen ? '→' : '←'}
          </button>
        </div>
      </div>

      <div className="chatbot-content">
        {/* Quick Filter Buttons */}
        <div className="quick-filters" style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
          <div style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>Quick Filters:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            <button 
              className="quick-filter-btn"
              onClick={() => handleQuickFilter('houses-under-1m')}
              style={{ fontSize: '10px', padding: '4px 8px', border: '1px solid #ddd', borderRadius: '12px', background: '#f8f9fa', cursor: 'pointer' }}
            >
              Houses &lt; $1M
            </button>
            <button 
              className="quick-filter-btn"
              onClick={() => handleQuickFilter('apartments')}
              style={{ fontSize: '10px', padding: '4px 8px', border: '1px solid #ddd', borderRadius: '12px', background: '#f8f9fa', cursor: 'pointer' }}
            >
              Apartments
            </button>
            <button 
              className="quick-filter-btn"
              onClick={() => handleQuickFilter('3plus-bedrooms')}
              style={{ fontSize: '10px', padding: '4px 8px', border: '1px solid #ddd', borderRadius: '12px', background: '#f8f9fa', cursor: 'pointer' }}
            >
              3+ Beds
            </button>
            <button 
              className="quick-filter-btn"
              onClick={() => handleQuickFilter('clear-all')}
              style={{ fontSize: '10px', padding: '4px 8px', border: '1px solid #ddd', borderRadius: '12px', background: '#ffe6e6', cursor: 'pointer' }}
            >
              Clear All
            </button>
          </div>
        </div>

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
              placeholder="Ask me to filter properties: 'Show houses under $800k' or 'Filter by 3+ bedrooms'"
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

export default FilterChatbot;
