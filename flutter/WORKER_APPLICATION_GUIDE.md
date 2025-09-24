# Worker Application Flow

This document outlines the process for a user to apply to be a worker on the TreesIndia platform.

## Application Frontend Flow

The application process is a multi-step form designed to collect all necessary information from the applicant.

### Step 1: Personal Information

- **Full Name:** Required
- **Email Address:** Required
- **Phone Number:** Required (pre-filled and not editable)
- **Alternative Phone Number:** Required

### Step 2: Document Upload

- **Aadhaar Card:** Required (file upload)
- **PAN Card:** Required (file upload)
- **Profile Photo:** Required (file upload)
- **Police Verification:** Required (file upload)

### Step 3: Address Information

- **Street Address:** Required
- **City:** Required
- **State:** Required
- **Pincode:** Required
- **Landmark:** Optional

### Step 4: Skills & Experience

- **Years of Experience:** Required
- **Skills:** Required (at least one must be selected or added)
- **Custom Skill:** Optional field to add skills not in the predefined list.

### Step 5: Banking Information

- **Account Holder Name:** Required
- **Account Number:** Required
- **IFSC Code:** Required
- **Bank Name:** Required

### Step 6: Review

This final step allows the user to review all the information they have provided before submitting the application.

## Backend API Endpoints

The following API endpoints are used to manage worker applications.

### Create Worker Application

- **Endpoint:** `POST /role-applications/worker`
- **Description:** Submits the worker application. This endpoint expects a multipart/form-data request containing all the fields from the application form.

### Get User Application Status

- **Endpoint:** `GET /role-applications/me`
- **Description:** Retrieves the application status for the currently authenticated user. This is used to show the user if they have a pending, approved, or rejected application.

### Admin Endpoints

These endpoints are for admin use only to manage the applications.

- **`GET /admin/role-applications`**: Retrieve all applications.
- **`GET /admin/role-applications/{id}`**: Retrieve a specific application by its ID.
- **`PUT /admin/role-applications/{id}`**: Update an application's status (e.g., approve, reject).
- **`DELETE /admin/role-applications/{id}`**: Delete an application.
