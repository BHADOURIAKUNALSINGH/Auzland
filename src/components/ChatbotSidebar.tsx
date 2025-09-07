import React, { useState, useRef, useEffect } from 'react';
import './ChatbotSidebar.css';
import { aiService, FilterResponse } from '../services/aiService';

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
      text: `Hi! I'm Auz from AuzLand Real Estate. Loading properties... Try quick filters like 'land', 'townhouse', or a suburb name. I can also help with basic analytics like averages and counts. What interests you?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Update welcome message when property count changes
  useEffect(() => {
    if (propertyCount !== undefined) {
      const propertyText = propertyCount === 0 
        ? "Loading properties..." 
        : `I can see ${propertyCount} properties on the left.`;
      
      const newWelcomeText = `Hi! I'm Auz from AuzLand Real Estate. ${propertyText} Try quick filters like 'land', 'townhouse', or a suburb name. I can also help with basic analytics like averages and counts. What interests you?`;
      
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[0] && newMessages[0].id === '1') {
          newMessages[0] = {
            ...newMessages[0],
            text: newWelcomeText
          };
        }
        return newMessages;
      });
    }
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
      // Build conversation history for Lambda function
      const conversationHistory = messages
        .map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.text
        }))
        .slice(-10); // Keep last 10 messages for context

      // Prepare request payload for Lambda function
      const requestPayload = {
        message: currentInput,
        history: conversationHistory,
        currentFilters: currentFilters || {}
      };

      console.log('🚀 Sending request to Lambda:', requestPayload);

      // Call the Lambda function via API Gateway
      const response = await fetch('https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const lambdaResponse = await response.json();
      console.log('📥 Lambda response:', lambdaResponse);

      // Handle different response types from Lambda
      await handleLambdaResponse(lambdaResponse);

    } catch (error) {
      console.error('Error calling Lambda function:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble processing your request right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  const handleLambdaResponse = async (lambdaResponse: any) => {
    const responseType = lambdaResponse.type;

    switch (responseType) {
      case 'filters':
        await handleFilterResponse(lambdaResponse);
        break;
      
      case 'analytics':
        await handleAnalyticsResponse(lambdaResponse);
        break;
      
      case 'small_talk':
        await handleSmallTalkResponse(lambdaResponse);
        break;
      
      default:
        console.warn('Unknown response type from Lambda:', responseType);
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I received an unexpected response format. Could you please rephrase your request?",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  const handleFilterResponse = async (response: any) => {
    console.log('🔧 Handling filter response:', response);
    
    // Apply filters if provided and not clearing all
    if (response.filters) {
      const hasFiltersToApply = Object.values(response.filters).some((value: any) => 
        value !== '' && value !== false && value !== null && value !== undefined
      );

      if (hasFiltersToApply && !response.filters.clearAll) {
        console.log('🤖 Chatbot applying new filters:', response.filters);
        if (onFiltersChange) {
          const { clearAll, ...filterValues } = response.filters;
          onFiltersChange(filterValues);
        }
      } else if (response.filters.clearAll) {
        console.log('🤖 Chatbot clearing all filters');
        if (onClearFilters) {
          onClearFilters();
        }
      }
    }

    // Only show the Lambda response
    let messageText = response.message || "Filters have been updated!";

    // Add AI response message
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: messageText,
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const handleAnalyticsResponse = async (response: any) => {
    console.log('📊 Handling analytics response:', response);
    
    // Keep technical details in console for debugging
    if (response.rowsConsidered !== undefined) {
      console.log(`📊 Analysis based on ${response.rowsConsidered} properties`);
    }
    if (response.facts) {
      console.log('📊 Structured facts received:', response.facts);
      if (response.facts.metrics) {
        console.log('📈 Key metrics:', response.facts.metrics);
      }
      if (response.facts.items) {
        console.log('🏠 Highlighted properties:', response.facts.items);
      }
    }
    if (response.vegaLite) {
      console.log('📈 Chart data received:', response.vegaLite);
    }

    // Handle proposed filters from Lambda
    if (response.proposedFilters) {
      console.log('🔧 Lambda proposed filters:', response.proposedFilters);
      console.log('💬 Proposed filters message:', response.proposedFiltersMessage);
      
      // Apply proposed filters automatically for hybrid queries
      if (onFiltersChange) {
        const { clearAll, ...filterValues } = response.proposedFilters;
        if (clearAll && onClearFilters) {
          onClearFilters();
        } else {
          onFiltersChange(filterValues);
        }
        console.log('🤖 Applied proposed filters from analytics query');
      }
    }

    // Show the analytics answer
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response.answer || "Here's your analytics result:",
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const handleSmallTalkResponse = async (response: any) => {
    console.log('💬 Handling small talk response:', response);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response.message || "Hi! How can I help you with property searches today?",
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    const propertyText = propertyCount === 0 
      ? "Loading properties..." 
      : `I can see ${propertyCount} properties on the left.`;
    
    setMessages([
      {
        id: Date.now().toString(),
        text: `Hi! I'm Auz from AuzLand Real Estate. ${propertyText} Try quick filters like 'land', 'townhouse', or a suburb name. I can also help with basic analytics like averages and counts. What interests you?`,
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
              placeholder="Try: 'land', 'Oran Park', 'average price of apartments in Box Hill', or 'most expensive townhouses'"
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

