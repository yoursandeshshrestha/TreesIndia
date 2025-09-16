# TreesIndia Chatbot System

A comprehensive AI-powered chatbot system for the TreesIndia platform that helps users find properties, book services, and get assistance with platform-related queries.

## Features

### 🤖 Intelligent Query Processing
- **Natural Language Understanding**: Processes user queries in natural language
- **Intent Classification**: Automatically categorizes queries (property, service, project, general)
- **Entity Extraction**: Extracts key information like location, budget, property type, etc.
- **Context Awareness**: Maintains conversation context across multiple exchanges

### 🏠 Property Assistance
- **Rental Property Search**: Help users find rental properties by location, budget, bedrooms, etc.
- **Sale Property Search**: Assist with property purchase queries
- **Property Comparison**: Compare properties based on user criteria
- **Property Details**: Provide detailed information about specific properties

### 🔧 Service Booking
- **Service Discovery**: Help users find relevant home services
- **Service Categories**: Support for cleaning, plumbing, electrical, maintenance, etc.
- **Pricing Information**: Provide pricing details (fixed vs inquiry-based)
- **Booking Guidance**: Guide users through the service booking process

### 🏗️ Project Information
- **Construction Projects**: Information about ongoing construction projects
- **Infrastructure Projects**: Details about infrastructure development
- **Project Timeline**: Project status and completion timelines
- **Contact Information**: Connect users with project managers

### 💡 Smart Suggestions
- **Contextual Suggestions**: AI-generated suggestions based on conversation context
- **Dynamic Recommendations**: Real-time suggestions that adapt to user needs
- **Popular Options**: Show trending searches and popular services

## Architecture

### Core Components

1. **Chatbot Models** (`models/chatbot.go`)
   - `ChatbotSession`: Manages conversation sessions
   - `ChatbotMessage`: Stores individual messages
   - `ChatbotSuggestion`: Manages suggestion system
   - `ChatbotQuery`: Structured query representation
   - `ChatbotResponse`: Structured response format

2. **Repository Layer** (`repositories/chatbot_repository.go`)
   - Database operations for sessions, messages, and suggestions
   - Session management and cleanup
   - Message history retrieval

3. **Service Layer** (`services/chatbot_service.go`)
   - Core business logic
   - OpenAI GPT integration
   - Query processing and response generation
   - Data fetching from existing services

4. **Prompt Engineering** (`services/chatbot_prompts.go`)
   - Specialized prompts for different query types
   - Context-aware prompt generation
   - Response formatting and optimization

5. **Controller Layer** (`controllers/chatbot_controller.go`)
   - HTTP API endpoints
   - Request/response handling
   - Error management

6. **Routes** (`routes/chatbot_routes.go`)
   - API route definitions
   - Middleware integration

## API Endpoints

### Session Management
- `POST /api/v1/chatbot/session` - Create new session
- `GET /api/v1/chatbot/session/{session_id}` - Get session details
- `DELETE /api/v1/chatbot/session/{session_id}` - Delete session
- `GET /api/v1/chatbot/sessions` - Get user sessions (authenticated)

### Messaging
- `POST /api/v1/chatbot/session/{session_id}/message` - Send message
- `GET /api/v1/chatbot/suggestions` - Get contextual suggestions

### Health & Monitoring
- `GET /api/v1/chatbot/health` - Health check

## Configuration

### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7
```

### Database Migration
Run the migration to create chatbot tables:
```sql
-- Located in: backend/migrations/040_create_chatbot_system.sql
```

## Usage Examples

### 1. Property Rental Query
```
User: "3BHK rent in Siliguri"
Bot: "What's your budget range for a 3BHK rental in Siliguri?"
User: "12k"
Bot: "Here are some 3BHK rental properties in Siliguri under ₹12,000/month:
      [Shows properties with details and contact info]"
```

### 2. Service Booking
```
User: "Home cleaning service"
Bot: "I can help you find home cleaning services. What's your location and preferred timing?"
User: "Siliguri, tomorrow morning"
Bot: "Here are available cleaning services in Siliguri for tomorrow morning:
      [Shows services with pricing and booking options]"
```

### 3. General Platform Help
```
User: "How do I book a service?"
Bot: "To book a service on TreesIndia:
      1. Search for your required service
      2. Select a service provider
      3. Choose your preferred time slot
      4. Complete payment
      5. Receive confirmation
      Would you like me to help you find a specific service?"
```

## Query Processing Flow

1. **User Input**: User sends a message
2. **Session Management**: Retrieve or create conversation session
3. **Query Analysis**: Parse user input using AI
4. **Intent Classification**: Determine query type and intent
5. **Data Fetching**: Retrieve relevant data from database
6. **Response Generation**: Generate AI response with data integration
7. **Suggestion Generation**: Create contextual suggestions
8. **Response Delivery**: Return structured response to user

## Integration Points

### Existing Services
The chatbot integrates with existing TreesIndia services:
- **Property Service**: Fetch property listings and details
- **Service Service**: Retrieve available services and pricing
- **Project Service**: Get project information and status
- **User Service**: Manage user sessions and preferences

### Database Integration
- **Property Tables**: Query properties table for listings
- **Service Tables**: Access services, categories, and subcategories
- **Project Tables**: Retrieve project information
- **User Tables**: Manage user context and preferences

## Performance Considerations

### Session Management
- Sessions expire after 24 hours of inactivity
- Automatic cleanup of expired sessions
- Efficient message history retrieval (limited to recent messages)

### AI Response Optimization
- Token usage tracking and optimization
- Response caching for common queries
- Fallback responses for API failures

### Database Optimization
- Indexed queries for fast session retrieval
- Efficient message storage and retrieval
- Optimized suggestion queries

## Security Features

### Session Security
- Unique session IDs (UUID)
- Session expiration and cleanup
- User authentication integration

### API Security
- Input validation and sanitization
- Rate limiting (inherited from existing middleware)
- Error handling without information leakage

## Monitoring and Analytics

### Metrics Tracked
- Session creation and usage
- Message processing time
- AI token usage
- Suggestion effectiveness
- User satisfaction indicators

### Logging
- Comprehensive logging for debugging
- Performance metrics logging
- Error tracking and reporting

## Future Enhancements

### Planned Features
1. **Voice Integration**: Support for voice queries
2. **Multi-language Support**: Support for regional languages
3. **Advanced Analytics**: User behavior analysis
4. **Personalization**: User preference learning
5. **Integration Expansion**: More service integrations

### Scalability Improvements
1. **Response Caching**: Redis-based response caching
2. **Load Balancing**: Multiple AI model support
3. **Database Sharding**: Horizontal scaling support
4. **Microservices**: Service decomposition

## Development Guidelines

### Adding New Query Types
1. Update query classification logic in `parseQuery()`
2. Add specialized prompt in `chatbot_prompts.go`
3. Implement data fetching in service layer
4. Update response generation logic

### Customizing Prompts
1. Modify prompts in `chatbot_prompts.go`
2. Test with various query types
3. Monitor response quality
4. Iterate based on user feedback

### Database Schema Changes
1. Update models in `models/chatbot.go`
2. Create migration scripts
3. Update repository methods
4. Test data integrity

## Troubleshooting

### Common Issues
1. **OpenAI API Failures**: Check API key and quota
2. **Database Connection**: Verify database connectivity
3. **Session Expiry**: Check session expiration logic
4. **Response Quality**: Review prompt engineering

### Debug Mode
Enable debug logging for detailed troubleshooting:
```go
logrus.SetLevel(logrus.DebugLevel)
```

## Support

For technical support or questions about the chatbot system:
- Check logs for error details
- Verify configuration settings
- Test with simple queries first
- Monitor API usage and limits

---

**Note**: This chatbot system is designed to be extensible and maintainable. Regular updates to prompts and integration points will help improve user experience over time.
