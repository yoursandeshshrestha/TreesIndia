import { PropertyFormData } from "@/types/propertyForm";
import { Property, PropertiesResponse } from "@/types/property";
import { API_BASE_URL } from "@/lib/constants";
import { getCookie, COOKIE_NAMES } from "@/lib/auth-api";

export interface PropertyUploadResponse {
  success: boolean;
  message: string;
  data: Property;
}

export class PropertyService {
  private static instance: PropertyService;

  public static getInstance(): PropertyService {
    if (!PropertyService.instance) {
      PropertyService.instance = new PropertyService();
    }
    return PropertyService.instance;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = getCookie(COOKIE_NAMES.ACCESS_TOKEN);

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async uploadProperty(
    propertyData: PropertyFormData
  ): Promise<PropertyUploadResponse> {
    try {
      const formData = new FormData();

      // Add all form fields
      formData.append("title", propertyData.title);
      formData.append("description", propertyData.description);
      formData.append("property_type", propertyData.property_type);
      formData.append("listing_type", propertyData.listing_type);
      formData.append(
        "price_negotiable",
        propertyData.price_negotiable.toString()
      );
      formData.append("state", propertyData.state);
      formData.append("city", propertyData.city);

      // Add optional fields
      if (propertyData.sale_price) {
        formData.append("sale_price", propertyData.sale_price.toString());
      }
      if (propertyData.monthly_rent) {
        formData.append("monthly_rent", propertyData.monthly_rent.toString());
      }
      if (propertyData.bedrooms) {
        formData.append("bedrooms", propertyData.bedrooms.toString());
      }
      if (propertyData.bathrooms) {
        formData.append("bathrooms", propertyData.bathrooms.toString());
      }
      if (propertyData.area) {
        formData.append("area", propertyData.area.toString());
      }
      if (propertyData.floor_number) {
        formData.append("floor_number", propertyData.floor_number.toString());
      }
      if (propertyData.age) {
        formData.append("age", propertyData.age.toString());
      }
      if (propertyData.furnishing_status) {
        formData.append("furnishing_status", propertyData.furnishing_status);
      }
      if (propertyData.address) {
        formData.append("address", propertyData.address);
      }
      if (propertyData.pincode) {
        formData.append("pincode", propertyData.pincode);
      }

      // Add images
      propertyData.images.forEach((image) => {
        formData.append("images", image);
      });

      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/user/properties`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload property");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Property upload error:", error);
      throw error;
    }
  }

  async getUserProperties(
    page: number = 1,
    limit: number = 20
  ): Promise<PropertiesResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/user/properties?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user properties");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Get user properties error:", error);
      throw error;
    }
  }
}

export const propertyService = PropertyService.getInstance();
