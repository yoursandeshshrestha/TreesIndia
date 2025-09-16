package services

import (
	"fmt"
	"strings"
	"treesindia/models"
)

// ChatbotPrompts handles prompt engineering for different query types
type ChatbotPrompts struct{}

// NewChatbotPrompts creates a new prompt handler
func NewChatbotPrompts() *ChatbotPrompts {
	return &ChatbotPrompts{}
}

// GetSystemPrompt returns the base system prompt for the chatbot
func (cp *ChatbotPrompts) GetSystemPrompt() string {
	return `You are TreesIndia Assistant, a helpful AI assistant for the TreesIndia platform. TreesIndia is a comprehensive platform that offers:

1. **Property Listings**: Rental and sale properties (residential and commercial)
2. **Home Services**: Cleaning, plumbing, electrical, maintenance, and other home services
3. **Construction Projects**: Residential, commercial, and infrastructure projects
4. **Worker Services**: Available workers and service providers

Your role is to:
- Help users find properties, services, and projects
- Answer questions about the platform
- Provide helpful suggestions and guidance
- Maintain a friendly, professional, and helpful tone
- Ask clarifying questions when needed
- Provide relevant information from database results

**Important Guidelines:**
- Always be helpful, accurate, and concise
- If you have database results, incorporate them naturally into your response
- Ask for missing information (location, budget, preferences) when needed
- Provide actionable next steps
- Use emojis sparingly and appropriately
- Be conversational but professional

**Response Format:**
- Start with a direct answer to the user's question
- Include relevant data from database results if available
- End with helpful suggestions or next steps
- Keep responses under 200 words unless detailed information is needed`
}

// GetPropertySearchPrompt returns a specialized prompt for property queries
func (cp *ChatbotPrompts) GetPropertySearchPrompt(query *models.ChatbotQuery, dataResults map[string]interface{}, session *models.ChatbotSession) string {
	prompt := `You are helping a user find properties on TreesIndia. 

**User Query Analysis:**
- Query Type: Property Search
- Intent: %s
- Location Context: %s
- Entities: %s
- Filters: %s

**Available Property Data:**
%s

**Instructions:**
1. Acknowledge what the user is looking for
2. If you have property results, present them in a helpful way
3. If no results or incomplete information, ask for missing details
4. Provide relevant suggestions for next steps
5. Be encouraging and helpful

**Response Style:**
- Be enthusiastic about helping find the perfect property
- Mention key property features (bedrooms, location, price)
- Suggest ways to refine the search if needed
- Offer to help with booking or contacting property owners`

	return fmt.Sprintf(prompt,
		query.Intent,
		session.Location,
		cp.formatEntities(query.Entities),
		cp.formatFilters(query.Filters),
		cp.formatPropertyData(dataResults))
}

// GetServiceSearchPrompt returns a specialized prompt for service queries
func (cp *ChatbotPrompts) GetServiceSearchPrompt(query *models.ChatbotQuery, dataResults map[string]interface{}, session *models.ChatbotSession) string {
	prompt := `You are helping a user find and book services on TreesIndia.

**User Query Analysis:**
- Query Type: Service Search
- Intent: %s
- Location Context: %s
- Service Category: %s
- Entities: %s

**Available Service Data:**
%s

**Instructions:**
1. Understand what service the user needs
2. If you have service results, present them clearly
3. Explain pricing and booking process
4. Ask for location if not provided
5. Suggest popular services if query is vague

**Response Style:**
- Be helpful and solution-oriented
- Explain how the service booking works
- Mention pricing (fixed vs inquiry-based)
- Encourage booking or provide contact information`

	return fmt.Sprintf(prompt,
		query.Intent,
		session.Location,
		query.Entities["service_category"],
		cp.formatEntities(query.Entities),
		cp.formatServiceData(dataResults))
}

// GetProjectSearchPrompt returns a specialized prompt for project queries
func (cp *ChatbotPrompts) GetProjectSearchPrompt(query *models.ChatbotQuery, dataResults map[string]interface{}, session *models.ChatbotSession) string {
	prompt := `You are helping a user find construction or infrastructure projects on TreesIndia.

**User Query Analysis:**
- Query Type: Project Search
- Intent: %s
- Location Context: %s
- Project Type: %s
- Entities: %s

**Available Project Data:**
%s

**Instructions:**
1. Understand what type of project the user is interested in
2. Present available projects with key details
3. Explain project status and timeline
4. Provide contact information for project inquiries
5. Suggest related services if appropriate

**Response Style:**
- Be informative about project details
- Highlight project benefits and features
- Explain how to get more information
- Connect users with project managers or contractors`

	return fmt.Sprintf(prompt,
		query.Intent,
		session.Location,
		query.Entities["project_type"],
		cp.formatEntities(query.Entities),
		cp.formatProjectData(dataResults))
}

// GetGeneralPrompt returns a specialized prompt for general queries
func (cp *ChatbotPrompts) GetGeneralPrompt(query *models.ChatbotQuery, session *models.ChatbotSession) string {
	prompt := `You are helping a user with general questions about TreesIndia platform.

**User Query:**
%s

**User Context:**
- Location: %s
- Session Context: %s

**Instructions:**
1. Answer the user's question directly
2. Provide helpful information about TreesIndia
3. Suggest relevant features or services
4. Guide them to the right section of the platform
5. Be encouraging about using the platform

**Common Topics:**
- How to use TreesIndia
- How to book services
- How to list properties
- Payment methods
- Contact information
- Platform features

**Response Style:**
- Be welcoming and informative
- Use simple, clear language
- Provide step-by-step guidance when needed
- Encourage exploration of the platform`

	return fmt.Sprintf(prompt,
		query.OriginalText,
		session.Location,
		cp.formatContext(session.CurrentContext))
}

// GetFollowUpPrompt returns a prompt for follow-up questions
func (cp *ChatbotPrompts) GetFollowUpPrompt(message string, session *models.ChatbotSession, history []models.ChatbotMessage) string {
	prompt := `You are continuing a conversation with a user on TreesIndia. 

**Conversation Context:**
- Current Message: "%s"
- User Location: %s
- Session Context: %s

**Recent Conversation History:**
%s

**Instructions:**
1. Understand the context from previous messages
2. Provide a natural continuation of the conversation
3. Build on previous information shared
4. Maintain conversation flow
5. Ask clarifying questions if needed

**Response Style:**
- Be conversational and natural
- Reference previous context when relevant
- Keep the conversation flowing smoothly
- Be helpful and engaging`

	return fmt.Sprintf(prompt,
		message,
		session.Location,
		cp.formatContext(session.CurrentContext),
		cp.formatConversationHistory(history))
}

// Helper methods for formatting data

func (cp *ChatbotPrompts) formatEntities(entities map[string]interface{}) string {
	if len(entities) == 0 {
		return "None specified"
	}
	
	var parts []string
	for key, value := range entities {
		parts = append(parts, fmt.Sprintf("%s: %v", key, value))
	}
	return strings.Join(parts, ", ")
}

func (cp *ChatbotPrompts) formatFilters(filters map[string]interface{}) string {
	if len(filters) == 0 {
		return "None applied"
	}
	
	var parts []string
	for key, value := range filters {
		parts = append(parts, fmt.Sprintf("%s: %v", key, value))
	}
	return strings.Join(parts, ", ")
}

func (cp *ChatbotPrompts) formatContext(context map[string]interface{}) string {
	if len(context) == 0 {
		return "None"
	}
	
	var parts []string
	for key, value := range context {
		parts = append(parts, fmt.Sprintf("%s: %v", key, value))
	}
	return strings.Join(parts, ", ")
}

func (cp *ChatbotPrompts) formatPropertyData(dataResults map[string]interface{}) string {
	if dataResults == nil || len(dataResults) == 0 {
		return "No property data available"
	}
	
	properties, ok := dataResults["properties"].([]interface{})
	if !ok || len(properties) == 0 {
		return "No properties found matching the criteria"
	}
	
	var parts []string
	parts = append(parts, fmt.Sprintf("Found %d properties:", len(properties)))
	
	// Limit to first 3 properties for prompt
	maxProps := 3
	if len(properties) < maxProps {
		maxProps = len(properties)
	}
	
	for i := 0; i < maxProps; i++ {
		if prop, ok := properties[i].(map[string]interface{}); ok {
			title := "Unknown Property"
			if t, exists := prop["title"]; exists {
				title = fmt.Sprintf("%v", t)
			}
			
			price := "Price not specified"
			if p, exists := prop["monthly_rent"]; exists {
				price = fmt.Sprintf("₹%.0f/month", p)
			} else if p, exists := prop["sale_price"]; exists {
				price = fmt.Sprintf("₹%.0f", p)
			}
			
			location := "Location not specified"
			if city, exists := prop["city"]; exists {
				location = fmt.Sprintf("%v", city)
				if state, exists := prop["state"]; exists {
					location += fmt.Sprintf(", %v", state)
				}
			}
			
			parts = append(parts, fmt.Sprintf("- %s in %s for %s", title, location, price))
		}
	}
	
	return strings.Join(parts, "\n")
}

func (cp *ChatbotPrompts) formatServiceData(dataResults map[string]interface{}) string {
	if dataResults == nil || len(dataResults) == 0 {
		return "No service data available"
	}
	
	services, ok := dataResults["services"].([]interface{})
	if !ok || len(services) == 0 {
		return "No services found matching the criteria"
	}
	
	var parts []string
	parts = append(parts, fmt.Sprintf("Found %d services:", len(services)))
	
	// Limit to first 3 services for prompt
	maxServices := 3
	if len(services) < maxServices {
		maxServices = len(services)
	}
	
	for i := 0; i < maxServices; i++ {
		if service, ok := services[i].(map[string]interface{}); ok {
			name := "Unknown Service"
			if n, exists := service["name"]; exists {
				name = fmt.Sprintf("%v", n)
			}
			
			price := "Price on inquiry"
			if priceType, exists := service["price_type"]; exists {
				if priceType == "fixed" {
					if p, exists := service["price"]; exists {
						price = fmt.Sprintf("₹%.0f", p)
					}
				}
			}
			
			parts = append(parts, fmt.Sprintf("- %s (%s)", name, price))
		}
	}
	
	return strings.Join(parts, "\n")
}

func (cp *ChatbotPrompts) formatProjectData(dataResults map[string]interface{}) string {
	if dataResults == nil || len(dataResults) == 0 {
		return "No project data available"
	}
	
	projects, ok := dataResults["projects"].([]interface{})
	if !ok || len(projects) == 0 {
		return "No projects found matching the criteria"
	}
	
	var parts []string
	parts = append(parts, fmt.Sprintf("Found %d projects:", len(projects)))
	
	// Limit to first 3 projects for prompt
	maxProjects := 3
	if len(projects) < maxProjects {
		maxProjects = len(projects)
	}
	
	for i := 0; i < maxProjects; i++ {
		if project, ok := projects[i].(map[string]interface{}); ok {
			title := "Unknown Project"
			if t, exists := project["title"]; exists {
				title = fmt.Sprintf("%v", t)
			}
			
			status := "Status not specified"
			if s, exists := project["status"]; exists {
				status = fmt.Sprintf("%v", s)
			}
			
			location := "Location not specified"
			if city, exists := project["city"]; exists {
				location = fmt.Sprintf("%v", city)
				if state, exists := project["state"]; exists {
					location += fmt.Sprintf(", %v", state)
				}
			}
			
			parts = append(parts, fmt.Sprintf("- %s in %s (%s)", title, location, status))
		}
	}
	
	return strings.Join(parts, "\n")
}

func (cp *ChatbotPrompts) formatConversationHistory(history []models.ChatbotMessage) string {
	if len(history) == 0 {
		return "No previous conversation"
	}
	
	var parts []string
	for _, msg := range history {
		role := "User"
		if msg.Role == "assistant" {
			role = "Assistant"
		}
		parts = append(parts, fmt.Sprintf("%s: %s", role, msg.Content))
	}
	
	return strings.Join(parts, "\n")
}

// GetSuggestionsPrompt returns a prompt for generating contextual suggestions
func (cp *ChatbotPrompts) GetSuggestionsPrompt(query *models.ChatbotQuery, session *models.ChatbotSession) string {
	prompt := `Based on the current conversation context, generate 3-5 helpful suggestions for the user.

**Context:**
- Query Type: %s
- Intent: %s
- Location: %s
- Entities: %s

**Generate suggestions that:**
1. Are relevant to what the user is looking for
2. Help them find what they need
3. Are actionable and specific
4. Match their location and preferences
5. Follow TreesIndia platform capabilities

**Format as a JSON array of strings:**
["suggestion 1", "suggestion 2", "suggestion 3"]`

	return fmt.Sprintf(prompt,
		query.QueryType,
		query.Intent,
		session.Location,
		cp.formatEntities(query.Entities))
}
