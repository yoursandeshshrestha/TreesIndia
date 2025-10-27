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
