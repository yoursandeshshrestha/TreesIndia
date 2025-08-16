# TREESINDIA - Complete Application Flow & Features

## 🏠 **Platform Overview**

TREESINDIA is a unified digital platform with three main modules: **Home Services**, **Contractor**, and **Real Estate**. Users get free credits for property listings, can recharge their wallet, and brokers can buy subscriptions for unlimited posting. The platform features simplified phone+OTP authentication and a credit-based property posting system.

---

## 👥 **User Types & Authentication**

### **User (Homeowners/Tenants/Property Seekers)**

- **Login Method**: Phone OTP only
- **Profile Setup**: Name, phone, location
- **Credit System**: 3 free credits for property listings (admin-configurable)
- **Wallet System**: Rechargeable wallet for all transactions
- **Location Required**: GPS or manual address entry

### **Broker (Property Sellers)**

- **Login Method**: Phone OTP only
- **Subscription System**: Can buy unlimited posting subscriptions
- **Credit System**: Can use credits or subscription for posting
- **Wallet System**: Rechargeable wallet for subscriptions and credits

### **Admin**

- **Login Method**: Phone OTP only
- **Full Platform Management**: Users, services, contractors, properties
- **Configuration Management**: Credit limits, wallet limits, subscription plans
- **Approval Authority**: Property listings (for non-subscribed users)

---

## 🏗️ **Three Main Modules**

### **1. Home Services Module**

#### **User Flow:**

1. User clicks "Home Services" card on home screen
2. Bottom sheet opens with service categories
3. User selects category (e.g., "Plumbing")
4. Service listings shown (e.g., "Tap Repair - ₹500")
5. User can book service or contact provider

#### **Service Categories:**

- **Plumbing**: Tap repair, pipe installation, drainage
- **Cleaning**: House cleaning, deep cleaning, carpet cleaning
- **AC Repair**: AC installation, maintenance, repair
- **Electrical**: Wiring, repairs, installations
- **Carpentry**: Furniture repair, installation
- **Painting**: Interior, exterior, wall painting

#### **Service Booking Flow:**

```
1. Select service category → View service listings
2. Choose service → View details and pricing
3. Book service → Fill booking form
4. Payment → Razorpay integration
5. Service execution → Provider completes service
6. Review → Rate and review service
```

### **2. Contractor Module**

#### **User Flow:**

1. User clicks "Contractor" card on home screen
2. List of contractors shown with filtering options
3. User can filter by profession, skills, location
4. User can contact contractor (text/call with masking)
5. Direct communication with contractor

#### **Contractor Features:**

- **Profession Filtering**: Plumber, Electrician, Carpenter, etc.
- **Skill-based Search**: Specific skills and expertise
- **Location-based**: Nearby contractors
- **Rating System**: Reviews and ratings
- **Direct Contact**: Masked calls and messaging

#### **Contractor Contact Flow:**

```
1. Browse contractors → Apply filters
2. View contractor profile → Check skills and ratings
3. Contact contractor → Masked call or message
4. Discuss requirements → Direct communication
5. Schedule work → Arrange timing and location
6. Complete work → Direct payment to contractor
```

### **3. Real Estate Module**

#### **User Flow:**

1. User clicks "Rental/Property" card on home screen
2. Property listings shown with search and filter options
3. User can search and filter properties
4. User can contact seller/owner
5. Property viewing and transaction

#### **Property Features:**

- **Credit-based Posting**: 1 credit = 1 property listing
- **Subscription Posting**: Unlimited posting for brokers
- **Search & Filter**: Location, price, type, amenities
- **Contact System**: Masked calls and messaging
- **Viewing Scheduling**: Book property viewings

#### **Property Posting Flow:**

```
1. User wants to post property → Check credits/subscription
2. If credits available → Deduct credit and post
3. If subscription active → Post without credit deduction
4. If no credits/subscription → Buy credits or subscription
5. Property goes live → Visible to users
6. Handle inquiries → Contact management
```

---

## 🔐 **Simplified Authentication Flow**

### **Single Login Process:**

#### **Step 1: Phone Number Entry**

```
User enters phone number → System validates format → Show "Send OTP" button
```

#### **Step 2: OTP Delivery**

```
System sends 6-digit OTP via SMS → Show countdown timer (60s) → "Resend OTP" option
```

#### **Step 3: OTP Verification**

```
User enters OTP → System validates → Show loading state → Verify with backend
```

#### **Step 4: Account Creation/Login**

```
New User: Create account + Assign 3 credits + Initialize wallet + Redirect to home
Existing User: Load existing data + Redirect to home
```

### **User Types & Authentication:**

#### **User/Broker Login:**

- **Phone + OTP**: Single authentication method
- **Auto-registration**: First login creates account
- **Credit System**: 3 free credits on registration
- **Wallet System**: Rechargeable wallet (Razorpay)
- **Subscription**: Brokers can buy subscriptions

#### **Admin Login:**

- **Phone + OTP**: Same authentication method
- **Admin privileges**: Configuration management
- **Worker management**: Own and assign workers
- **Content approval**: Approve listings and conversions

---

## 💳 **Credit System**

### **Credit Usage:**

- **1 Credit = 1 Property Listing**
- **Credits Don't Expire**: Permanent until used
- **Admin Configurable**: Default limit can be changed
- **Purchase Available**: Users can buy more credits

### **Credit Flow:**

```
1. User registers → Gets 3 free credits (default)
2. User posts property → 1 credit deducted
3. User checks balance → Shows remaining credits
4. User buys credits → Wallet payment
5. Credits added → Available for property posting
```

### **Credit Validation:**

- **Before Posting**: Check if user has credits or subscription
- **During Posting**: Deduct credit on successful posting
- **After Posting**: Update user's credit balance
- **Error Handling**: Prevent posting if insufficient credits

---

## 💰 **Wallet System**

### **Wallet Features:**

- **Rechargeable**: Razorpay integration for payments
- **Admin Configurable**: Limit set by admin (default: 100,000)
- **Multi-purpose**: Credits, subscriptions, future services
- **Transaction History**: Complete record of all transactions

### **Wallet Flow:**

```
1. User wants to recharge → Select amount
2. Payment initiation → Razorpay integration
3. Payment processing → Secure transaction
4. Wallet updated → Balance increased
5. Transaction recorded → History updated
```

### **Wallet Usage:**

- **Credit Purchase**: Buy more credits for property posting
- **Subscription Purchase**: Buy broker subscriptions
- **Future Services**: Payment for home services
- **Withdrawal**: Request wallet withdrawal (admin approval)

---

## 📦 **Subscription System**

### **Broker Subscriptions:**

- **Admin Configurable**: Plans and pricing set by admin
- **Unlimited Posting**: No credit deduction required
- **No Admin Approval**: Direct posting without review
- **Priority Features**: Enhanced listing placement

### **Subscription Flow:**

```
1. Broker wants subscription → View available plans
2. Select plan → Choose duration and features
3. Payment → Wallet or direct payment
4. Subscription activated → Unlimited posting access
5. Subscription management → Renew, cancel, upgrade
```

### **Subscription Benefits:**

- **Unlimited Property Listings**: No credit requirement
- **Priority Placement**: Enhanced visibility
- **Advanced Analytics**: Detailed performance metrics
- **Dedicated Support**: Priority customer service
- **No Admin Approval**: Direct posting capability

---

## 🏠 **Home Services Module Flow**

### **Service Discovery:**

```
1. User opens app → Home screen with three cards
2. Clicks "Home Services" → Bottom sheet opens
3. Selects category → Service listings shown
4. Views service details → Pricing and description
5. Books service → Payment and scheduling
```

### **Service Categories Structure:**

```
Home Services
├── Plumbing
│   ├── Tap Repair - ₹500
│   ├── Pipe Installation - ₹1000
│   └── Drainage Cleaning - ₹800
├── Cleaning
│   ├── House Cleaning - ₹1500
│   ├── Deep Cleaning - ₹2500
│   └── Carpet Cleaning - ₹1200
├── AC Repair
│   ├── AC Installation - ₹3000
│   ├── AC Maintenance - ₹800
│   └── AC Repair - ₹1500
└── Electrical
    ├── Wiring - ₹2000
    ├── Switch Repair - ₹500
    └── Fan Installation - ₹800
```

### **Service Booking Process:**

```
1. Select service → View details and pricing
2. Fill booking form → Address, description, schedule
3. Make payment → Razorpay integration
4. Service provider assigned → Admin assignment
5. Service execution → Provider completes work
6. OTP verification → Complete service
7. Review and rating → Rate service provider
```

---

## 👷 **Contractor Module Flow**

### **Contractor Discovery:**

```
1. User clicks "Contractor" card → Contractor list
2. Apply filters → Profession, skills, location
3. View contractor profiles → Skills, experience, ratings
4. Contact contractor → Masked call or message
5. Direct communication → Discuss requirements
```

### **Contractor Features:**

#### **Filtering Options:**

- **Profession**: Plumber, Electrician, Carpenter, Painter
- **Skills**: Specific expertise and certifications
- **Location**: Nearby contractors
- **Rating**: Minimum rating filter
- **Experience**: Years of experience
- **Availability**: Available contractors

#### **Contractor Profile:**

- **Basic Info**: Name, photo, contact
- **Profession**: Primary and secondary skills
- **Experience**: Years of experience
- **Hourly Rate**: Pricing information
- **Availability**: Working hours and schedule
- **Rating**: Average rating and reviews
- **Portfolio**: Previous work examples

### **Contact Process:**

```
1. View contractor profile → Check details and ratings
2. Initiate contact → Masked call or message
3. Discuss requirements → Direct communication
4. Get quote → Contractor provides estimate
5. Schedule work → Arrange timing and location
6. Complete work → Direct payment to contractor
```

---

## 🏘️ **Real Estate Module Flow**

### **Property Discovery:**

```
1. User clicks "Rental/Property" card → Property listings
2. Apply search filters → Location, price, type
3. View property details → Photos, description, location
4. Contact seller → Masked call or message
5. Schedule viewing → Book property visit
6. Make offer → Negotiate price and terms
```

### **Property Posting Process:**

#### **Credit-based Posting:**

```
1. User wants to post property → Check credits
2. If credits available → Deduct 1 credit
3. Fill property details → Photos, description, price
4. Submit for posting → Property goes live
5. Handle inquiries → Manage buyer contacts
```

#### **Subscription-based Posting:**

```
1. Broker with subscription → Unlimited posting
2. Fill property details → Photos, description, price
3. Submit for posting → Direct posting (no approval)
4. Property goes live → Enhanced visibility
5. Handle inquiries → Manage buyer contacts
```

### **Property Features:**

#### **Search & Filter:**

- **Location**: City, area, landmarks
- **Price Range**: Minimum and maximum price
- **Property Type**: Apartment, house, villa, plot
- **BHK**: Number of bedrooms
- **Amenities**: Parking, gym, pool, etc.
- **Furnishing**: Furnished, semi-furnished, unfurnished

#### **Property Details:**

- **Basic Info**: Title, description, price
- **Location**: Address, landmarks, map
- **Specifications**: Area, BHK, floor, age
- **Amenities**: Available facilities
- **Photos**: Multiple high-quality images
- **Contact**: Seller information (masked)

---

## 💳 **Payment & Finance System**

### **Payment Methods:**

- **Razorpay Integration**: UPI, cards, wallets, net banking
- **Wallet Payments**: Internal wallet for credits and subscriptions
- **Direct Payments**: For services and property transactions
- **Secure Processing**: PCI compliant payment handling

### **Payment Flows:**

#### **Wallet Recharge:**

```
1. User initiates recharge → Select amount
2. Payment gateway → Razorpay integration
3. Payment processing → Secure transaction
4. Wallet updated → Balance increased
5. Transaction recorded → History updated
```

#### **Credit Purchase:**

```
1. User wants credits → Select credit package
2. Payment from wallet → Deduct wallet balance
3. Credits added → Available for property posting
4. Transaction recorded → Credit history updated
```

#### **Subscription Purchase:**

```
1. Broker selects plan → Choose subscription
2. Payment processing → Wallet or direct payment
3. Subscription activated → Unlimited posting access
4. Transaction recorded → Subscription history
```

---

## 🔔 **Notification System**

### **Notification Types:**

- **OTP Notifications**: Authentication and verification
- **Credit Alerts**: Low credit balance, credit usage
- **Wallet Notifications**: Recharge success, transaction updates
- **Subscription Alerts**: Renewal reminders, expiry warnings
- **Service Updates**: Booking confirmations, status changes
- **Property Inquiries**: New inquiries, visit confirmations

### **Notification Channels:**

- **SMS**: OTP and important alerts
- **Push Notifications**: Real-time updates
- **In-app Notifications**: Platform notifications
- **Email**: Detailed reports and summaries

---

## 🛡️ **Security & Privacy**

### **Data Protection:**

- **Encrypted Storage**: All sensitive data encrypted
- **Secure APIs**: JWT authentication and authorization
- **Privacy Compliance**: GDPR and local regulations

### **Call Masking System:**

```
1. User initiates call → Request masked number
2. Generate temporary number → Third-party service
3. Route call → Connect parties securely
4. Log call details → Duration, participants
5. Auto-expire number → After interaction
6. Clean up data → Remove temporary numbers
```

### **Credit & Wallet Security:**

- **Transaction Validation**: All transactions verified
- **Fraud Prevention**: Suspicious activity detection
- **Audit Trail**: Complete transaction history
- **Secure Storage**: Encrypted financial data

---

## 📊 **Analytics & Insights**

### **User Analytics:**

- **Registration Trends**: User growth and demographics
- **Credit Usage**: Credit consumption patterns
- **Wallet Activity**: Transaction volume and frequency
- **Module Usage**: Popular modules and features
- **Subscription Metrics**: Plan adoption and retention

### **Business Analytics:**

- **Revenue Tracking**: Credit sales, subscription revenue
- **Property Analytics**: Listing performance and engagement
- **Service Analytics**: Booking patterns and completion rates
- **Contractor Analytics**: Performance and rating trends

### **Platform Analytics:**

- **Credit System**: Usage patterns and optimization
- **Wallet System**: Transaction volume and user behavior
- **Subscription System**: Plan performance and user satisfaction
- **Module Performance**: Three main modules usage statistics

---

## 🔄 **Complete User Journey Examples**

### **New User Registration Journey:**

```
1. User downloads app → Opens application
2. Sees three main cards → Home Services, Contractor, Real Estate
3. Clicks "Get Started" → Phone number entry
4. Receives OTP → Enters verification code
5. Account created → Gets 3 free credits
6. Access to all modules → Can use platform
```

### **Property Posting Journey:**

```
1. User wants to post property → Clicks Real Estate module
2. Checks credits → Shows 3 available credits
3. Fills property details → Photos, description, price
4. Submits for posting → 1 credit deducted
5. Property goes live → Visible to users
6. Receives inquiries → Manages buyer contacts
```

### **Service Booking Journey:**

```
1. User needs service → Clicks Home Services module
2. Selects category → Plumbing services
3. Views service listings → Tap Repair - ₹500
4. Books service → Payment through Razorpay
5. Service provider assigned → Admin assignment
6. Service completed → OTP verification
7. Reviews service → Rates provider
```

### **Contractor Contact Journey:**

```
1. User needs contractor → Clicks Contractor module
2. Applies filters → Plumber, nearby, 4+ rating
3. Views contractor profiles → Skills and experience
4. Contacts contractor → Masked call initiated
5. Discusses requirements → Direct communication
6. Schedules work → Arranges timing
7. Work completed → Direct payment
```

---

## 🚀 **Technical Architecture**

### **Frontend:**

- **Flutter App**: Cross-platform mobile application
- **Next.js Admin Panel**: Web-based admin interface
- **Responsive Design**: Works on all devices

### **Backend:**

- **GoLang API**: High-performance backend services
- **PostgreSQL Database**: Reliable data storage
- **Redis Cache**: Fast data access and sessions

### **Integrations:**

- **Google Maps**: Location services and navigation
- **Razorpay**: Payment processing
- **Twilio/Exotel**: Call masking and SMS
- **Firebase**: Push notifications

### **Deployment:**

- **Hostinger VPS**: Phase 1 deployment
- **Docker Containers**: Scalable microservices
- **Load Balancing**: High availability setup
- **Future Migration**: AWS/DigitalOcean ready

---

## 📈 **Success Metrics**

### **User Engagement:**

- **Daily Active Users**: App usage frequency
- **Module Usage**: Three main modules adoption
- **Credit Usage**: Property posting activity
- **Wallet Activity**: Transaction volume
- **Subscription Adoption**: Broker subscription rates

### **Business Performance:**

- **Credit Sales**: Revenue from credit purchases
- **Subscription Revenue**: Monthly recurring revenue
- **Property Views**: Listing visibility and engagement
- **Service Bookings**: Home services completion rate
- **Contractor Engagement**: Contact and booking rates

### **Platform Quality:**

- **User Satisfaction**: Ratings and reviews
- **Response Time**: Service and inquiry response
- **Payment Success**: Transaction completion rate
- **System Uptime**: Platform availability

---

## 🎯 **Key Features Summary**

### **Core Features:**

- ✅ Three main modules (Home Services, Contractor, Real Estate)
- ✅ Simplified phone+OTP authentication
- ✅ Credit system for property posting
- ✅ Wallet system with Razorpay integration
- ✅ Subscription system for brokers
- ✅ Call masking for privacy
- ✅ Admin configuration management
- ✅ Real-time notifications

### **Advanced Features:**

- ✅ Credit-based property posting
- ✅ Unlimited posting for subscribed brokers
- ✅ Service booking and management
- ✅ Contractor filtering and contact
- ✅ Property search and discovery
- ✅ Secure payment processing
- ✅ Analytics and reporting
- ✅ Scalable microservices architecture

---

## 📞 **Support & Maintenance**

### **User Support:**

- **In-app Help**: FAQ and guidance
- **Customer Service**: Phone and chat support
- **Technical Support**: App and platform issues
- **Payment Support**: Transaction and wallet issues

### **Admin Support:**

- **Configuration Management**: Credit limits, wallet limits
- **Subscription Management**: Plan creation and management
- **User Management**: Account and credit management
- **Analytics Dashboard**: Performance monitoring

This comprehensive flow document provides complete context for the new TREESINDIA platform scope and serves as a reference for understanding the application's functionality and user journeys.
