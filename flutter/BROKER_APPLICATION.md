
# Broker Application Flow Documentation

This document outlines the process for broker applications, from the frontend user interface to the backend API endpoints.

## Frontend Application Flow

The broker application is a 5-step process on the web-app.

### Step 1: Personal Information

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| Full Name | Text | Yes | |
| Email Address | Email | Yes | Must be a unique email address. |
| Phone Number | Tel | Yes | Pre-filled from user profile and disabled. |
| Alternative Phone Number | Tel | Yes | 10-20 digits, `+` allowed. |

### Step 2: Document Upload

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| Aadhaar Card | File | Yes | Max 1MB |
| PAN Card | File | Yes | Max 1MB |
| Profile Photo | File | Yes | Max 1MB |

### Step 3: Address Information

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| Street Address | Text | Yes | |
| City | Text | Yes | |
| State | Text | Yes | |
| Pincode | Text | Yes | |
| Landmark | Text | No | |

### Step 4: Broker Details

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| License Number | Text | Yes | |
| Agency Name | Text | Yes | |

### Step 5: Review

This step allows the user to review all the information entered in the previous steps before submitting the application.

## Backend API Endpoints

### Create Broker Application

* **Endpoint:** `POST /role-applications/broker`
* **Description:** Submits a new broker application.
* **Request Body:** `multipart/form-data`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `license` | string | Yes | Broker license number. |
| `agency` | string | Yes | Broker agency name. |
| `contact_info` | string | Yes | JSON object with `name`, `email`, `phone`, `alternative_number`. |
| `address` | string | Yes | JSON object with `street`, `city`, `state`, `pincode`, `landmark` (optional). |
| `aadhar_card` | file | Yes | Aadhaar card document. |
| `pan_card` | file | Yes | PAN card document. |
| `profile_pic` | file | Yes | Profile picture. |

### Get User's Application Status

* **Endpoint:** `GET /role-applications/me`
* **Description:** Retrieves the role application for the currently authenticated user. This can be used to check the status of a submitted application.
