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

interface FilterResponse {
  message: string;
  filters: {
    quickSearch: string;
    suburb: string;
    propertyType: string;
    availability: string;
    frontageMin: string;
    frontageMax: string;
    landSizeMin: string;
    landSizeMax: string;
    buildSizeMin: string;
    buildSizeMax: string;
    bedMin: string;
    bedMax: string;
    bathMin: string;
    bathMax: string;
    garageMin: string;
    garageMax: string;
    priceMin: string;
    priceMax: string;
    registrationConstructionStatus: string;
    clearAll: boolean;
  };
}

export class AIService {
  private model = "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8";
  private stream = false;

  // System prompt to make the AI act as a property filtering assistant
  private systemPrompt = `You are AUZ, the property filter assistant for AuzLand Real Estate.  
Your ONLY job: convert user requests into JSON filters for property listings.  

CRITICAL RULES:
- ALWAYS output valid JSON in the format below. No plain text, ever.  
- MUST include ALL filter fields in response (populate with current values or "" for removal).
- INCREMENTAL UPDATES: Start with current state, only change what user requests.
- REMOVE FILTERS: When user says "remove X" or "no X filter", set that field to "".
- ADD/MODIFY FILTERS: Set specific field values as requested.
- Use ONLY exact dropdown values (see lists below). Case doesn't matter - system will normalize.
- For suburb names: use the exact suburb name mentioned (e.g. "Oran Park" not "oran park").
- clearAll = true if user says "clear all", "reset all", "remove all filters", "start over".  
- If user asks irrelevant things, respond with fallback JSON asking what property they want.  
- Keep "message" short (2 lines max).  

RESPONSE FORMAT:
{
  "message": "",
  "filters": {
    "quickSearch": "", "suburb": "", "propertyType": "", "availability": "",
    "frontageMin": "", "frontageMax": "", "landSizeMin": "", "landSizeMax": "",
    "buildSizeMin": "", "buildSizeMax": "", "bedMin": "", "bedMax": "",
    "bathMin": "", "bathMax": "", "garageMin": "", "garageMax": "",
    "priceMin": "", "priceMax": "", "registrationConstructionStatus": "",
    "clearAll": false
  }
}

DROPDOWN VALUES:
- propertyType: "Land only", "Single story", "Double story", "Dual occupancy", "Apartment", "Townhouse", "Home & Land", ""  
- availability: "Available", "Under Offer", "Sold", ""  
- registrationConstructionStatus: "Registered", "Unregistered", "Under Construction", "Completed", ""  

FUZZY MATCH:
- house/home/residential → "Single story"  
- single → "Single story"  
- double/multi-level → "Double story"  
- land/lot/block → "Land only"  
- apartment/unit/flat → "Apartment"  
- townhouse/terrace → "Townhouse"  
- dual/duplex/granny flat → "Dual occupancy"  
- home & land/turnkey → "Home & Land"  

- available/for sale → "Available"  
- sold/off market → "Sold"  
- pending/under offer → "Under Offer"  

- registered/titled → "Registered"  
- unregistered/awaiting approval → "Unregistered"  
- under construction/building → "Under Construction"  
- completed/ready → "Completed"  

COMMON PATTERNS:
- "under $500k" → priceMax = "500000"  
- "over $1M" → priceMin = "1000000"  
- "between $500k and $1M" → priceMin = "500000", priceMax = "1000000"  
- "3+ bedrooms" → bedMin = "3"  
- "2-4 bedrooms" → bedMin = "2", bedMax = "4"  
- "at least 2 bathrooms" → bathMin = "2"  
- "garage for 2 cars" → garageMin = "2"  
- "land size over 500sqm" → landSizeMin = "500"  
- "build size under 200sqm" → buildSizeMax = "200"  
- Convert $1M=1000000, $500k=500000, $2.5M=2500000  
`;

  // Map AI-generated values to exact dropdown options expected by the filtering system
  // Convert empty values to default "all" states and validate dropdown options
  private normalizeFilterValues(filters: any): any {
    const normalized = { ...filters };

    // Valid dropdown options (must match exactly what's in the UI)
    const validPropertyTypes = ['Land only', 'Single story', 'Double story', 'Dual occupancy', 'Apartment', 'Townhouse', 'Home & Land'];
    const validAvailability = ['Available', 'Under Offer', 'Sold'];
    const validRegistrationStatus = ['Registered', 'Unregistered', 'Under Construction', 'Completed'];

    // Property Type mapping - STRICT validation with default handling
    if (normalized.propertyType && normalized.propertyType.trim() !== '') {
      const propertyTypeMap: { [key: string]: string } = {
        'land only': 'Land only',
        'single story': 'Single story', 
        'double story': 'Double story',
        'dual occupancy': 'Dual occupancy',
        'apartment': 'Apartment',
        'townhouse': 'Townhouse',
        'home & land': 'Home & Land',
        'home and land': 'Home & Land'
      };
      const lowerType = normalized.propertyType.toLowerCase();
      const mappedType = propertyTypeMap[lowerType];
      
      // Only set if it's a valid dropdown option
      if (mappedType && validPropertyTypes.includes(mappedType)) {
        normalized.propertyType = mappedType;
      } else {
        console.warn(`❌ Invalid propertyType "${normalized.propertyType}" - resetting to default (all types)`);
        normalized.propertyType = ''; // Default: All Types
      }
    } else {
      normalized.propertyType = ''; // Default: All Types
    }

    // Availability mapping - STRICT validation with default handling
    if (normalized.availability && normalized.availability.trim() !== '') {
      const availabilityMap: { [key: string]: string } = {
        'available': 'Available',
        'under offer': 'Under Offer',
        'sold': 'Sold'
      };
      const lowerAvail = normalized.availability.toLowerCase();
      const mappedAvail = availabilityMap[lowerAvail];
      
      // Only set if it's a valid dropdown option
      if (mappedAvail && validAvailability.includes(mappedAvail)) {
        normalized.availability = mappedAvail;
      } else {
        console.warn(`❌ Invalid availability "${normalized.availability}" - resetting to default (all availability)`);
        normalized.availability = ''; // Default: All Availability
      }
    } else {
      normalized.availability = ''; // Default: All Availability
    }

    // Registration/Construction Status mapping - STRICT validation with default handling
    if (normalized.registrationConstructionStatus && normalized.registrationConstructionStatus.trim() !== '') {
      const statusMap: { [key: string]: string } = {
        'registered': 'Registered',
        'unregistered': 'Unregistered', 
        'under construction': 'Under Construction',
        'completed': 'Completed'
      };
      const lowerStatus = normalized.registrationConstructionStatus.toLowerCase();
      const mappedStatus = statusMap[lowerStatus];
      
      // Only set if it's a valid dropdown option
      if (mappedStatus && validRegistrationStatus.includes(mappedStatus)) {
        normalized.registrationConstructionStatus = mappedStatus;
      } else {
        console.warn(`❌ Invalid registrationConstructionStatus "${normalized.registrationConstructionStatus}" - resetting to default (all statuses)`);
        normalized.registrationConstructionStatus = ''; // Default: All Statuses
      }
    } else {
      normalized.registrationConstructionStatus = ''; // Default: All Statuses
    }

    // Suburb normalization - empty means no suburb filter
    if (normalized.suburb && normalized.suburb.trim() !== '') {
      // Convert to title case (capitalize first letter of each word)
      normalized.suburb = normalized.suburb
        .toLowerCase()
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } else {
      normalized.suburb = ''; // Default: No suburb filter (all suburbs)
    }

    // Numeric filters - empty means no restriction
    const numericFields = ['priceMin', 'priceMax', 'frontageMin', 'frontageMax', 'landSizeMin', 'landSizeMax', 
                          'buildSizeMin', 'buildSizeMax', 'bedMin', 'bedMax', 'bathMin', 'bathMax', 'garageMin', 'garageMax'];
    
    numericFields.forEach(field => {
      if (normalized[field] && normalized[field].toString().trim() !== '') {
        // Validate it's a number
        const numValue = parseFloat(normalized[field]);
        if (isNaN(numValue) || numValue < 0) {
          console.warn(`❌ Invalid ${field} "${normalized[field]}" - resetting to default (no restriction)`);
          normalized[field] = ''; // Default: No restriction
        } else {
          normalized[field] = numValue.toString();
        }
      } else {
        normalized[field] = ''; // Default: No restriction
      }
    });

    // Text filters - empty means no filter
    if (normalized.quickSearch && normalized.quickSearch.trim() !== '') {
      normalized.quickSearch = normalized.quickSearch.trim();
    } else {
      normalized.quickSearch = ''; // Default: No search filter
    }

    console.log('✅ Normalized filters with defaults:', normalized);
    return normalized;
  }

  // Apply default values to any empty fields to ensure consistent filter state
  private applyDefaultValues(filters: any): any {
    const filtersWithDefaults = { ...filters };

    // Define all expected filter fields with their default values
    const defaultValues: { [key: string]: any } = {
      // Text/Search filters - empty means no filter
      quickSearch: '',
      suburb: '',
      
      // Dropdown filters - empty means "All" (show everything)
      propertyType: '',           // "All Types"
      availability: '',           // "All Availability" 
      registrationConstructionStatus: '', // "All Statuses"
      
      // Numeric range filters - empty means no restriction
      priceMin: '',
      priceMax: '',
      frontageMin: '',
      frontageMax: '',
      landSizeMin: '',
      landSizeMax: '',
      buildSizeMin: '',
      buildSizeMax: '',
      bedMin: '',
      bedMax: '',
      bathMin: '',
      bathMax: '',
      garageMin: '',
      garageMax: '',
      
      // Special flags
      clearAll: false
    };

    // Apply defaults for any missing or empty fields
    Object.keys(defaultValues).forEach(field => {
      if (filtersWithDefaults[field] === undefined || filtersWithDefaults[field] === null || filtersWithDefaults[field] === '') {
        filtersWithDefaults[field] = defaultValues[field];
        console.log(`🎯 Applied default for ${field}: "${defaultValues[field]}"`);
      }
    });

    // Ensure clearAll is always a boolean
    filtersWithDefaults.clearAll = Boolean(filtersWithDefaults.clearAll);

    console.log('✅ All fields have proper defaults applied');
    return filtersWithDefaults;
  }

  // Parse JSON response from AI and extract message and filters
  private parseFilterResponse(response: string): FilterResponse {
    try {
      // Try to find JSON in the response - look for the outermost braces
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in AI response:', response);
        throw new Error('No JSON found in response');
      }

      console.log('Attempting to parse JSON:', jsonMatch[0]);
      const parsedResponse = JSON.parse(jsonMatch[0]) as FilterResponse;
      
      // Validate the response structure
      if (!parsedResponse.message || !parsedResponse.filters) {
        throw new Error('Invalid response structure');
      }

      // Normalize filter values to match exact dropdown options
      const normalizedFilters = this.normalizeFilterValues(parsedResponse.filters);
      
      // Ensure ALL fields have default values if empty
      const filtersWithDefaults = this.applyDefaultValues(normalizedFilters);
      parsedResponse.filters = filtersWithDefaults;
      
      console.log('🔧 Normalized filter values:', normalizedFilters);
      console.log('🎯 Final filters with defaults:', filtersWithDefaults);

      return parsedResponse;
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      // Fallback response if parsing fails
      return {
        message: response || "I'm sorry, I couldn't process that request. Please try again.",
        filters: {
          quickSearch: '',
          suburb: '',
          propertyType: '',
          availability: '',
          frontageMin: '',
          frontageMax: '',
          landSizeMin: '',
          landSizeMax: '',
          buildSizeMin: '',
          buildSizeMax: '',
          bedMin: '',
          bedMax: '',
          bathMin: '',
          bathMax: '',
          garageMin: '',
          garageMax: '',
          priceMin: '',
          priceMax: '',
          registrationConstructionStatus: '',
          clearAll: false
        }
      };
    }
  }

  // New method that returns parsed filter response
  async generateFilterResponse(userMessage: string, conversationHistory: ChatMessage[] = [], currentFilters: any = {}): Promise<FilterResponse> {
    try {
      console.log('AI Service - Generating filter response for:', userMessage);

      // Build complete conversation history as formatted text
      const formattedConversationHistory = conversationHistory.length > 0 
        ? '\n\nPREVIOUS CONVERSATION:\n' + conversationHistory
            .map(msg => `${msg.role === 'user' ? 'User' : 'Auz'}: ${msg.content}`)
            .join('\n') + '\n'
        : '\n\nPREVIOUS CONVERSATION: (This is the start of the conversation)\n';

      // Build current filter context for AI
      const currentFilterContext = Object.keys(currentFilters).length > 0 
        ? '\n\nCURRENT ACTIVE FILTERS:\n' + 
          Object.entries(currentFilters)
            .filter(([key, value]) => value && value !== '')
            .map(([key, value]) => `${key}: "${value}"`)
            .join('\n') + 
          '\n\nIMPORTANT: Include ALL fields in response. Keep current values unless user requests changes. Set to "" to remove filters.'
        : '\n\nCURRENT ACTIVE FILTERS: None\n\nIMPORTANT: Include ALL fields in response.';

      console.log('📚 Complete conversation history being sent:', formattedConversationHistory);
      console.log('🎯 Current filter context:', currentFilterContext);

      // Build messages array with system prompt including conversation and filter context
      const messages: ChatMessage[] = [
        { role: 'system', content: this.systemPrompt + formattedConversationHistory + currentFilterContext },
        { role: 'user', content: userMessage }
      ];

      // Handle non-streaming response (increased token limit for JSON)
        const completion = await openai.chat.completions.create({
          messages: messages,
          model: this.model,
          stream: false,
        max_tokens: 200, // Increased for JSON response
        temperature: 0.3, // Lower temperature for more consistent JSON
      });

      const rawResponse = completion.choices[0].message.content;

      // Parse the response
      const parsedResponse = this.parseFilterResponse(rawResponse || "");
      return parsedResponse;
    } catch (error) {
      console.error('AI Service Error Details:', error);
      
      // Return fallback response
      return {
        message: "I'm sorry, I encountered an error while processing your request. Please try again.",
        filters: {
          quickSearch: '',
          suburb: '',
          propertyType: '',
          availability: '',
          frontageMin: '',
          frontageMax: '',
          landSizeMin: '',
          landSizeMax: '',
          buildSizeMin: '',
          buildSizeMax: '',
          bedMin: '',
          bedMax: '',
          bathMin: '',
          bathMax: '',
          garageMin: '',
          garageMax: '',
          priceMin: '',
          priceMax: '',
          registrationConstructionStatus: '',
          clearAll: false
        }
      };
    }
  }

  // Legacy method for backward compatibility - just returns the message
  async generateResponse(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    const filterResponse = await this.generateFilterResponse(userMessage, conversationHistory);
    return filterResponse.message;
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

// Export types and singleton instance
export type { FilterResponse };
export const aiService = new AIService();
