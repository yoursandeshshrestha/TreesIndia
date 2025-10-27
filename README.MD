# Trees India Platform

A comprehensive multi-service platform connecting users with home services, construction services, property rentals, and marketplace features for vendors, workers, and projects.

## Project Structure

This repository contains multiple interconnected components:

- **Flutter Mobile App** (`/flutter`) - Cross-platform mobile application for iOS and Android
- **Web Application** (`/web-app`) - React-based web interface _(documentation coming soon)_
- **Admin Panel** (`/Admin`) - Administrative dashboard _(documentation coming soon)_
- **Backend API** (`/Backend`) - Node.js/Express backend services

---

## Flutter Mobile Application

### Overview

Trees India mobile app is a feature-rich platform that provides:

- **Home & Construction Services** - Browse and book professional services
- **Property Marketplace** - Search and list properties for sale or rent
- **Vendor & Worker Directory** - Connect with verified contractors and skilled workers
- **Real-time Communication** - Chat with service providers and property owners
- **Booking Management** - Track service bookings and work assignments
- **Subscription Plans** - Access premium marketplace features

### Technology Stack

| Category               | Technology                         |
| ---------------------- | ---------------------------------- |
| **Framework**          | Flutter 3.5.3                      |
| **State Management**   | Flutter Riverpod 2.5.1             |
| **Architecture**       | Clean Architecture + MVVM          |
| **Navigation**         | GoRouter 14.2.7                    |
| **Local Storage**      | Hive 2.2.3                         |
| **HTTP Client**        | Dio 5.6.0                          |
| **Authentication**     | Firebase Auth + JWT                |
| **Push Notifications** | Firebase Cloud Messaging 16.0.0    |
| **Real-time Chat**     | WebSocket (web_socket_channel)     |
| **Payments**           | Razorpay Flutter 1.4.0             |
| **Maps**               | Flutter Map 7.0.2                  |
| **Location Services**  | Geolocator 14.0.2, Geocoding 4.0.0 |
| **Image Handling**     | Image Picker, Cached Network Image |
| **Crash Reporting**    | Firebase Crashlytics               |

--- 

## Application Workflows & Screenshots

### 1. User Onboarding Flow

New users go through a seamless onboarding process with phone authentication and location setup.

**Workflow Steps:**

```
Splash Screen > Login (Phone) > OTP Verification > Location Setup > Home Page
```

#### Screenshots:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.13.46 AM.jpeg" width="250" alt="Login Screen"/>
      <br/>
      <b>Login Screen</b>
      <br/>
      <sub>Phone number authentication</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.39.00 AM.jpeg" width="250" alt="OTP Verification"/>
      <br/>
      <b>OTP Verification</b>
      <br/>
      <sub>One-time password entry</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.39.01 AM.jpeg" width="250" alt="Location Setup"/>
      <br/>
      <b>Location Setup</b>
      <br/>
      <sub>GPS-based location detection</sub>
    </td>
  </tr>
</table>

---

### 2. Home Page & Service Discovery

The home page serves as the central hub with location-based service discovery, banners, and quick access to all features.

**Key Features:**

- Dynamic location-based content
- Service categories (Home Services, Construction, Rental & Properties)
- Popular services carousel
- Property listings (Sale & Rental)
- Search functionality

#### Screenshots:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.13.47 AM.jpeg" width="250" alt="Home Page"/>
      <br/>
      <b>Home Page</b>
      <br/>
      <sub>Main dashboard with services</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.42.03 AM.jpeg" width="250" alt="Service Categories"/>
      <br/>
      <b>Service Categories</b>
      <br/>
      <sub>Browse by category</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.34.12 AM.jpeg" width="250" alt="Service List"/>
      <br/>
      <b>Service Listings</b>
      <br/>
      <sub>Available services with pricing</sub>
    </td>
  </tr>
</table>

---

### 3. Service Booking Flow

Users can browse services, view details, and complete bookings with integrated payment.

**Workflow Steps:**

```
Browse Services > Service Details > Select Date/Time > Choose Address > Payment > Confirmation
```

#### Screenshots:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.44.27 AM.jpeg" width="250" alt="Service Details"/>
      <br/>
      <b>Service Details</b>
      <br/>
      <sub>Pricing and description</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.44.28 AM.jpeg" width="250" alt="Booking Form"/>
      <br/>
      <b>Booking Form</b>
      <br/>
      <sub>Date, time, and address selection</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.34.14 AM (1).jpeg" width="250" alt="Payment"/>
      <br/>
      <b>Payment Gateway</b>
      <br/>
      <sub>Razorpay integration</sub>
    </td>
  </tr>
</table>

---

### 4. Marketplace Features

Subscription-gated marketplace for properties, projects, vendors, and workers.

**Marketplace Sections:**

- **Rental & Properties** - Browse and list properties
- **Projects** - Construction and development projects
- **Vendors** - Service providers and contractors
- **Workers** - Skilled workers directory

#### Screenshots:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.51.48 AM (2).jpeg" width="250" alt="Properties List"/>
      <br/>
      <b>Properties Marketplace</b>
      <br/>
      <sub>Available properties for rent/sale</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.51.48 AM (1).jpeg" width="250" alt="Property Details"/>
      <br/>
      <b>Property Details</b>
      <br/>
      <sub>Location, images, and contact info</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.51.48 AM.jpeg" width="250" alt="Vendors"/>
      <br/>
      <b>Vendors Directory</b>
      <br/>
      <sub>Browse verified vendors</sub>
    </td>
  </tr>
</table>

---

### 5. Bookings History & Management

Users can view and track all their service bookings with detailed status updates and history.

**Features:**

- View all bookings (Past, Current, Upcoming)
- Track booking status in real-time
- View booking details and service provider information
- Access booking receipts and invoices
- Cancel or reschedule bookings
- Rate and review completed services

#### Screenshots:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.34.12 AM (1).jpeg" width="250" alt="Bookings List"/>
      <br/>
      <b>Bookings List</b>
      <br/>
      <sub>All user bookings</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.34.12 AM (2).jpeg" width="250" alt="Booking Details"/>
      <br/>
      <b>Track worker location</b>
      <br/>
      <sub>Live location updates</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.34.13 AM.jpeg" width="250" alt="Booking History"/>
      <br/>
      <b>Multi-segment payment booking</b>
      <br/>
      <sub>Payment history and receipts</sub>
    </td>
  </tr>
</table>

---

### 6. Real-time Communication

WebSocket-powered chat for seamless communication between users and service providers.

**Features:**

- Real-time messaging
- Conversation history
- Unread message indicators
- Push notifications
- Auto-refresh on app resume

#### Screenshots:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.13.50 AM (1).jpeg" width="250" alt="Bookings List"/>
      <br/>
      <b>Conversations</b>
      <br/>
      <sub>with service providers and property owners</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.59.46 AM.jpeg" width="250" alt="Booking Details"/>
      <br/>
      <b>Real Time Chat</b>
      <br/>
      <sub>with service providers and property owners</sub>
    </td>
  </tr>
</table>

---

### 7. Profile & Account Management

Comprehensive user profile with multiple management features.

**Profile Features:**

- Edit personal information
- Manage properties and vendor profiles
- Address management
- Wallet and subscription management
- Worker/Broker applications
- App settings

#### Screenshots:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.13.47 AM (1).jpeg" width="250" alt="Profile Page"/>
      <br/>
      <b>Profile Page</b>
      <br/>
      <sub>User dashboard and account overview</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.13.48 AM.jpeg" width="250" alt="Edit Profile"/>
      <br/>
      <b>Edit Profile</b>
      <br/>
      <sub>Update personal information</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.13.49 AM (1).jpeg" width="250" alt="Subscription Details"/>
      <br/>
      <b>Subscription Details</b>
      <br/>
      <sub>View and manage subscription plans</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.13.47 AM (2).jpeg" width="250" alt="Manage Addresses"/>
      <br/>
      <b>Manage Addresses</b>
      <br/>
      <sub>Save and edit service addresses</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.13.48 AM (1).jpeg" width="250" alt="Wallet Page"/>
      <br/>
      <b>Wallet Page</b>
      <br/>
      <sub>Balance and transaction history</sub>
    </td>
    <td align="center">
      <img src="screenshots/mobile-app/WhatsApp Image 2025-10-28 at 3.13.49 AM.jpeg" width="250" alt="Vendor Profiles"/>
      <br/>
      <b>Vendor Profiles</b>
      <br/>
      <sub>Manage vendor business listings</sub>
    </td>
  </tr>
</table>

---

## Web Application

### Overview

The Trees India web application is a modern, responsive platform built with Next.js that provides customers with seamless access to home and construction services through their web browsers. It complements the mobile app by offering a desktop-optimized experience with enhanced visualization and workflow management.

**Key Capabilities:**

- **Service Discovery & Booking** - Browse and book services with advanced filtering
- **B2B Marketplace** - Subscription-gated platform for professionals (Projects, Vendors, Workers, Properties)
- **Professional Onboarding** - Multi-step applications for workers and brokers
- **Real-time Communication** - WebSocket-powered chat and notifications
- **Advanced Booking Features** - Location tracking, segmented payments, quote management
- **Profile Management** - Comprehensive account and subscription management

### Technology Stack

| Category                | Technology                           |
| ----------------------- | ------------------------------------ |
| **Framework**           | Next.js 15.5.0 (React 19.1.0)        |
| **Language**            | TypeScript                           |
| **State Management**    | Redux Toolkit + TanStack React Query |
| **Styling**             | Tailwind CSS 4, Material-UI (MUI)    |
| **Backend Integration** | Supabase, Axios                      |
| **Real-time Features**  | WebSocket                            |
| **Maps & Location**     | Leaflet, React Leaflet               |
| **Animations**          | Framer Motion, Lottie React          |
| **UI Components**       | Material-UI, Lucide React            |
| **Notifications**       | Sonner (Toast notifications)         |
| **Date Management**     | date-fns                             |

---

## Application Workflows & Screenshots

### 1. Home Page & Service Discovery

The landing page serves as the central hub with hero section, service categories, and property listings.

**Key Features:**

- Hero section with search functionality
- Popular services carousel
- Service category navigation
- Featured properties showcase
- Promotional banners
- Location-based content

#### Screenshot:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/web-app/Screenshot 2025-10-28 at 3.27.23 AM.png" width="800" alt="Home Page"/>
      <br/>
      <b>Home Page</b>
      <br/>
      <sub>Hero section with service discovery and featured content</sub>
    </td>
  </tr>
</table>

---

### 2. Service Categories & Listings

Browse through categorized services with detailed filtering and search capabilities.

**Features:**

- Category-based navigation
- Service cards with pricing
- Advanced filtering options
- Search with autocomplete
- Service details modal

#### Screenshot:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/web-app/Screenshot 2025-10-28 at 3.29.06 AM.png" width="800" alt="Service Categories"/>
      <br/>
      <b>Service Categories & Browse</b>
      <br/>
      <sub>Categorized service listings with filtering</sub>
    </td>
  </tr>
</table>

---

### 3. Service Booking Workflow

Comprehensive booking interface with slot selection, address management, and payment processing.

**Workflow Steps:**

```
Service Selection > Date/Time Slot > Address Selection > Contact Info > Payment > Confirmation
```

**Features:**

- Booking sidebar with service details
- Calendar-based slot selection
- Multiple address management
- Price summary breakdown
- Real-time availability checking

#### Screenshot:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/web-app/Screenshot 2025-10-28 at 3.29.41 AM.png" width="800" alt="Booking Page"/>
      <br/>
      <b>Service Booking Interface</b>
      <br/>
      <sub>Complete booking workflow with slot selection and address management</sub>
    </td>
  </tr>
</table>

---

### 4. Marketplace Platform

Subscription-gated B2B marketplace connecting businesses with projects, vendors, workers, and properties.

**Marketplace Sections:**

- **Projects** - Construction and home service projects
- **Vendors** - Service providers and contractors
- **Workers** - Skilled workforce directory
- **Rental Properties** - Property listings for lease

**Features:**

- Advanced filtering (business type, skills, location)
- Stats dashboard for analytics
- Create and manage listings
- Subscription requirement enforcement

#### Screenshot:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/web-app/Screenshot 2025-10-28 at 4.21.16 AM.png" width="800" alt="Marketplace"/>
      <br/>
      <b>Marketplace Dashboard</b>
      <br/>
      <sub>B2B platform for projects, vendors, workers, and properties</sub>
    </td>
  </tr>
</table>

---

### 5. Profile & Account Dashboard

Comprehensive user profile with multiple management sections and settings.

**Profile Sections:**

- About - Personal information and bio
- My Bookings - Booking history with tracking
- My Properties - Listed properties management
- My Vendors - Bookmarked vendors
- My Work - Work assignments (for service providers)
- Wallet - Balance and transaction history
- Subscription - Plan management and upgrades
- Settings - Notification preferences and privacy

#### Screenshot:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/web-app/Screenshot 2025-10-28 at 3.28.17 AM.png" width="800" alt="Profile Dashboard"/>
      <br/>
      <b>Profile Dashboard</b>
      <br/>
      <sub>User profile with comprehensive account management</sub>
    </td>
  </tr>
</table>

---

### 6. Booking Management & Tracking

Advanced booking management with real-time location tracking and segmented payment support.

**Features:**

- View all bookings (Past, Current, Upcoming)
- Real-time location tracking for active services
- Multi-segment payment system for long-term projects
- Quote acceptance workflow
- Booking status updates
- Service provider communication
- Payment history and receipts

#### Screenshot:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/web-app/Screenshot 2025-10-28 at 4.19.26 AM.png" width="800" alt="Booking Tracking"/>
      <br/>
      <b>Booking Management & Tracking</b>
      <br/>
      <sub>Track bookings with location updates and payment segments</sub>
    </td>
  </tr>
</table>

---

### 7. Marketplace Listing Details

Detailed views for marketplace listings including vendors, workers, projects, and properties.

**Features:**

- Complete profile information
- Contact details and communication
- Portfolio/work samples
- Reviews and ratings
- Service area and availability
- Direct booking or inquiry options

#### Screenshot:

<table>
  <tr>
    <td align="center">
      <img src="screenshots/web-app/Screenshot 2025-10-28 at 4.21.41 AM.png" width="800" alt="Listing Details"/>
      <br/>
      <b>Marketplace Listing Details</b>
      <br/>
      <sub>Detailed vendor, worker, or property profile</sub>
    </td>
  </tr>
</table>
