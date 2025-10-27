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
