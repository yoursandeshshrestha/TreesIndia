package services

import (
	"fmt"
	"strings"
)

// ResponseTemplates handles template-based response generation
type ResponseTemplates struct{}

// NewResponseTemplates creates a new response templates handler
func NewResponseTemplates() *ResponseTemplates {
	return &ResponseTemplates{}
}

// TemplateData represents data for template rendering
type TemplateData struct {
	Properties    []map[string]interface{} `json:"properties"`
	Total         int                      `json:"total"`
	Location      string                   `json:"location"`
	Bedrooms      int                      `json:"bedrooms"`
	Budget        int                      `json:"budget"`
	ServiceType   string                   `json:"service_type"`
	MissingInfo   []string                 `json:"missing_info"`
	Suggestions   []string                 `json:"suggestions"`
}

// GenerateResponse generates response based on intent and data
func (rt *ResponseTemplates) GenerateResponse(intent *SimpleIntent, data *TemplateData) string {
	switch intent.Type {
	case "property":
		return rt.generatePropertyResponse(intent, data)
	case "service":
		return rt.generateServiceResponse(intent, data)
	case "project":
		return rt.generateProjectResponse(intent, data)
	default:
		return rt.generateGeneralResponse(intent, data)
	}
}

// generatePropertyResponse generates property-related responses
func (rt *ResponseTemplates) generatePropertyResponse(intent *SimpleIntent, data *TemplateData) string {
	// Check if we need more information
	if len(data.MissingInfo) > 0 {
		return rt.generateMissingInfoResponse(intent, data)
	}
	
	// Generate response based on results
	if data.Total == 0 {
		return rt.generateNoResultsResponse(intent, data)
	}
	
	// Generate results response
	return rt.generatePropertyResultsResponse(intent, data)
}

// generateMissingInfoResponse generates response when information is missing
func (rt *ResponseTemplates) generateMissingInfoResponse(intent *SimpleIntent, data *TemplateData) string {
	var response strings.Builder
	
	if intent.Action == "rent" {
		response.WriteString("I'd be happy to help you find rental properties! ")
	} else if intent.Action == "sale" {
		response.WriteString("I'd be happy to help you find properties for sale! ")
	} else {
		response.WriteString("I'd be happy to help you find properties! ")
	}
	
	response.WriteString("To give you the best results, I need a bit more information:\n\n")
	
	for i, info := range data.MissingInfo {
		if i > 0 {
			response.WriteString("• ")
		} else {
			response.WriteString("• ")
		}
		
		switch info {
		case "location":
			response.WriteString("**Location**: Which city or area are you looking in?\n")
		case "number of bedrooms":
			response.WriteString("**Bedrooms**: How many bedrooms do you need? (1BHK, 2BHK, 3BHK, etc.)\n")
		case "budget range":
			response.WriteString("**Budget**: What's your budget range?\n")
		}
	}
	
	response.WriteString("\nOnce you provide these details, I can show you the best matching properties! 🏠")
	
	return response.String()
}

// generateNoResultsResponse generates response when no results found
func (rt *ResponseTemplates) generateNoResultsResponse(intent *SimpleIntent, data *TemplateData) string {
	var response strings.Builder
	
	response.WriteString("I couldn't find any properties matching your criteria. ")
	
	if data.Location != "" {
		response.WriteString(fmt.Sprintf("No %s properties found in %s", intent.Action, data.Location))
	} else {
		response.WriteString(fmt.Sprintf("No %s properties found", intent.Action))
	}
	
	if data.Bedrooms > 0 {
		response.WriteString(fmt.Sprintf(" with %d bedrooms", data.Bedrooms))
	}
	
	if data.Budget > 0 {
		response.WriteString(fmt.Sprintf(" under ₹%d", data.Budget))
	}
	
	response.WriteString(".\n\n**Try these suggestions:**\n")
	response.WriteString("• Expand your search area\n")
	response.WriteString("• Increase your budget range\n")
	response.WriteString("• Consider different property types\n")
	response.WriteString("• Set up alerts for new listings\n")
	
	return response.String()
}

// generatePropertyResultsResponse generates response with property results
func (rt *ResponseTemplates) generatePropertyResultsResponse(intent *SimpleIntent, data *TemplateData) string {
	var response strings.Builder
	
	// Header
	if data.Total == 1 {
		response.WriteString("Great! I found 1 property that matches your criteria:\n\n")
	} else {
		response.WriteString(fmt.Sprintf("Great! I found %d properties that match your criteria:\n\n", data.Total))
	}
	
	// Property details
	for i, prop := range data.Properties {
		if i >= 3 { // Limit to first 3 properties
			break
		}
		
		title, _ := prop["title"].(string)
		price := rt.formatPropertyPrice(prop)
		location := rt.formatPropertyLocation(prop)
		bedrooms, _ := prop["bedrooms"].(int)
		bathrooms, _ := prop["bathrooms"].(int)
		
		response.WriteString(fmt.Sprintf("**%d. %s**\n", i+1, title))
		response.WriteString(fmt.Sprintf("📍 %s\n", location))
		response.WriteString(fmt.Sprintf("💰 %s\n", price))
		response.WriteString(fmt.Sprintf("🏠 %dBHK, %d bathrooms\n", bedrooms, bathrooms))
		
		if description, ok := prop["description"].(string); ok && description != "" {
			// Truncate description if too long
			if len(description) > 100 {
				description = description[:100] + "..."
			}
			response.WriteString(fmt.Sprintf("📝 %s\n", description))
		}
		
		response.WriteString("\n")
	}
	
	// Footer
	if data.Total > 3 {
		response.WriteString(fmt.Sprintf("... and %d more properties available!\n\n", data.Total-3))
	}
	
	response.WriteString("Would you like to see more details about any of these properties or refine your search?")
	
	return response.String()
}

// generateServiceResponse generates service-related responses
func (rt *ResponseTemplates) generateServiceResponse(intent *SimpleIntent, data *TemplateData) string {
	var response strings.Builder
	
	response.WriteString("I can help you book home services on TreesIndia! ")
	
	if data.ServiceType != "" {
		response.WriteString(fmt.Sprintf("You're looking for **%s** services. ", strings.Title(data.ServiceType)))
	}
	
	response.WriteString("Here's how to get started:\n\n")
	
	response.WriteString("**Available Services:**\n")
	response.WriteString("• 🧹 House Cleaning\n")
	response.WriteString("• 🔧 Plumbing & Repairs\n")
	response.WriteString("• ⚡ Electrical Services\n")
	response.WriteString("• 🎨 Painting & Renovation\n")
	response.WriteString("• 🔨 Carpentry & Furniture\n")
	response.WriteString("• 🛠️ General Maintenance\n\n")
	
	response.WriteString("**To book a service:**\n")
	response.WriteString("1. Visit the Services section on TreesIndia\n")
	response.WriteString("2. Select your service type\n")
	response.WriteString("3. Choose your preferred time slot\n")
	response.WriteString("4. Complete payment\n")
	response.WriteString("5. Get confirmation\n\n")
	
	response.WriteString("What type of service do you need help with?")
	
	return response.String()
}

// generateProjectResponse generates project-related responses
func (rt *ResponseTemplates) generateProjectResponse(intent *SimpleIntent, data *TemplateData) string {
	var response strings.Builder
	
	response.WriteString("I can help you with construction and infrastructure projects on TreesIndia!\n\n")
	
	response.WriteString("**Available Project Types:**\n")
	response.WriteString("• 🏠 Residential Construction\n")
	response.WriteString("• 🏢 Commercial Projects\n")
	response.WriteString("• 🛣️ Infrastructure Development\n")
	response.WriteString("• 🔄 Renovation Projects\n")
	response.WriteString("• 🏗️ New Construction\n\n")
	
	response.WriteString("**How it works:**\n")
	response.WriteString("1. Browse available projects\n")
	response.WriteString("2. View project details and timeline\n")
	response.WriteString("3. Contact project managers\n")
	response.WriteString("4. Get quotes and proposals\n")
	response.WriteString("5. Start your project\n\n")
	
	response.WriteString("What type of project are you interested in?")
	
	return response.String()
}

// generateGeneralResponse generates general responses
func (rt *ResponseTemplates) generateGeneralResponse(intent *SimpleIntent, data *TemplateData) string {
	var response strings.Builder
	
	response.WriteString("Hello! I'm your TreesIndia Assistant. I can help you with:\n\n")
	
	response.WriteString("**🏠 Properties**\n")
	response.WriteString("• Find rental properties\n")
	response.WriteString("• Browse properties for sale\n")
	response.WriteString("• Compare property features\n\n")
	
	response.WriteString("**🔧 Services**\n")
	response.WriteString("• Book home services\n")
	response.WriteString("• Find service providers\n")
	response.WriteString("• Schedule maintenance\n\n")
	
	response.WriteString("**🏗️ Projects**\n")
	response.WriteString("• Construction projects\n")
	response.WriteString("• Infrastructure development\n")
	response.WriteString("• Renovation services\n\n")
	
	response.WriteString("What would you like help with today?")
	
	return response.String()
}

// formatPropertyPrice formats property price
func (rt *ResponseTemplates) formatPropertyPrice(prop map[string]interface{}) string {
	if monthlyRent, ok := prop["monthly_rent"].(int); ok && monthlyRent > 0 {
		return fmt.Sprintf("₹%d/month", monthlyRent)
	}
	if salePrice, ok := prop["sale_price"].(int); ok && salePrice > 0 {
		return fmt.Sprintf("₹%d", salePrice)
	}
	return "Price on inquiry"
}

// formatPropertyLocation formats property location
func (rt *ResponseTemplates) formatPropertyLocation(prop map[string]interface{}) string {
	city, _ := prop["city"].(string)
	state, _ := prop["state"].(string)
	
	if city != "" && state != "" {
		return fmt.Sprintf("%s, %s", city, state)
	} else if city != "" {
		return city
	} else if state != "" {
		return state
	}
	return "Location not specified"
}

// GetGreetingResponse returns greeting response
func (rt *ResponseTemplates) GetGreetingResponse() string {
	return "Hello! 👋 Welcome to TreesIndia! I'm here to help you find properties, book services, and explore projects. What can I help you with today?"
}

// GetHelpResponse returns help response
func (rt *ResponseTemplates) GetHelpResponse() string {
	return "I'm here to help! You can ask me about:\n\n" +
		"• **Properties**: '3BHK rent in Siliguri', '2BHK sale under 50L'\n" +
		"• **Services**: 'Book cleaning service', 'Find plumber'\n" +
		"• **Projects**: 'Construction projects', 'Renovation services'\n" +
		"• **General**: 'How to book?', 'Payment methods'\n\n" +
		"Just tell me what you're looking for!"
}

// GetErrorResponse returns error response
func (rt *ResponseTemplates) GetErrorResponse() string {
	return "I'm sorry, I encountered an issue processing your request. Please try again or contact our support team for assistance."
}
