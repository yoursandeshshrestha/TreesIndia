# Popular Services API Examples

The popular services endpoint now supports optional city and state parameters for location-based filtering.

## Base Endpoint

```
GET /api/v1/services/popular
```

## Examples

### 1. Get All Popular Services (No Location Filter)

```bash
curl -X GET "http://localhost:8080/api/v1/services/popular"
```

**Response:**

```json
{
  "success": true,
  "message": "Popular services retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Home Cleaning Service",
      "slug": "home-cleaning-service",
      "description": "Professional home cleaning service",
      "price_type": "fixed",
      "price": 1500.0,
      "category_name": "Home Services",
      "subcategory_name": "Cleaning",
      "service_areas": [
        {
          "id": 1,
          "city": "Mumbai",
          "state": "Maharashtra",
          "country": "India",
          "is_active": true
        }
      ]
    }
  ]
}
```

### 2. Filter by City Only

```bash
curl -X GET "http://localhost:8080/api/v1/services/popular?city=Mumbai"
```

**What it does:**

- Returns popular services available in Mumbai (any state)
- Uses case-insensitive partial matching
- Will match "Mumbai", "mumbai", "MUMBAI", etc.

### 3. Filter by State Only

```bash
curl -X GET "http://localhost:8080/api/v1/services/popular?state=Maharashtra"
```

**What it does:**

- Returns popular services available in Maharashtra (any city)
- Uses case-insensitive partial matching
- Will match "Maharashtra", "maharashtra", "MAHARASHTRA", etc.

### 4. Filter by Both City and State

```bash
curl -X GET "http://localhost:8080/api/v1/services/popular?city=Mumbai&state=Maharashtra"
```

**What it does:**

- Returns popular services available specifically in Mumbai, Maharashtra
- Both parameters must match for a service to be included
- Most specific filtering option

### 5. URL Encoded Parameters

```bash
curl -X GET "http://localhost:8080/api/v1/services/popular?city=New%20Delhi&state=Delhi"
```

**What it does:**

- Returns popular services in New Delhi, Delhi
- Handles spaces and special characters properly

## Frontend JavaScript Examples

### Using Fetch API

```javascript
// Get all popular services
const getAllPopularServices = async () => {
  const response = await fetch("/api/v1/services/popular");
  const data = await response.json();
  return data.data;
};

// Get popular services by city
const getPopularServicesByCity = async (city) => {
  const response = await fetch(
    `/api/v1/services/popular?city=${encodeURIComponent(city)}`
  );
  const data = await response.json();
  return data.data;
};

// Get popular services by state
const getPopularServicesByState = async (state) => {
  const response = await fetch(
    `/api/v1/services/popular?state=${encodeURIComponent(state)}`
  );
  const data = await response.json();
  return data.data;
};

// Get popular services by city and state
const getPopularServicesByLocation = async (city, state) => {
  const params = new URLSearchParams();
  if (city) params.append("city", city);
  if (state) params.append("state", state);

  const response = await fetch(`/api/v1/services/popular?${params.toString()}`);
  const data = await response.json();
  return data.data;
};
```

### Using Axios

```javascript
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1";

// Get all popular services
const getAllPopularServices = async () => {
  const response = await axios.get(`${API_BASE_URL}/services/popular`);
  return response.data.data;
};

// Get popular services by location
const getPopularServicesByLocation = async (city, state) => {
  const params = {};
  if (city) params.city = city;
  if (state) params.state = state;

  const response = await axios.get(`${API_BASE_URL}/services/popular`, {
    params,
  });
  return response.data.data;
};
```

## React Hook Example

```javascript
import { useState, useEffect } from "react";

const usePopularServices = (city, state) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (city) params.append("city", city);
        if (state) params.append("state", state);

        const response = await fetch(
          `/api/v1/services/popular?${params.toString()}`
        );
        const data = await response.json();

        if (data.success) {
          setServices(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Failed to fetch popular services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [city, state]);

  return { services, loading, error };
};

// Usage in component
const PopularServicesComponent = ({ userCity, userState }) => {
  const { services, loading, error } = usePopularServices(userCity, userState);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>
        Popular Services in {userCity}, {userState}
      </h2>
      {services.map((service) => (
        <div key={service.id}>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <p>
            Price:{" "}
            {service.price_type === "fixed"
              ? `₹${service.price}`
              : "Inquiry-based"}
          </p>
        </div>
      ))}
    </div>
  );
};
```

## Testing with Postman

1. **Get All Popular Services:**

   - Method: GET
   - URL: `http://localhost:8080/api/v1/services/popular`

2. **Filter by City:**

   - Method: GET
   - URL: `http://localhost:8080/api/v1/services/popular?city=Mumbai`

3. **Filter by State:**

   - Method: GET
   - URL: `http://localhost:8080/api/v1/services/popular?state=Maharashtra`

4. **Filter by Both:**
   - Method: GET
   - URL: `http://localhost:8080/api/v1/services/popular?city=Mumbai&state=Maharashtra`

## Important Notes

1. **Case Insensitive:** The search is case-insensitive and uses partial matching
2. **Optional Parameters:** Both city and state are optional
3. **Combined Filtering:** When both parameters are provided, both must match
4. **Active Services Only:** Only returns active services
5. **Service Areas:** Services are filtered based on their associated service areas
6. **Limit:** Default limit is 8 services (most recent active services)
7. **Ordering:** Results are ordered by creation date (newest first)

## Error Handling

```javascript
try {
  const response = await fetch("/api/v1/services/popular?city=InvalidCity");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch services");
  }

  if (data.success) {
    console.log("Services:", data.data);
  } else {
    console.error("API Error:", data.message);
  }
} catch (error) {
  console.error("Network Error:", error.message);
}
```
