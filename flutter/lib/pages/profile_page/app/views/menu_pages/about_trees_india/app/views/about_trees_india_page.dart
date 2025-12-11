import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/app_bar/app/views/custom_app_bar.dart';
import 'package:trees_india/commons/constants/app_colors.dart';

class AboutTreesIndiaPage extends StatelessWidget {
  const AboutTreesIndiaPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'About TreesIndia',
        backgroundColor: AppColors.white,
        iconColor: AppColors.brandNeutral800,
        titleColor: AppColors.brandNeutral800,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [Color(0xFF16A34A), Color(0xFF15803D)],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  // Logo
                  Container(
                    height: 100,
                    width: 150,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      color: Colors.transparent,
                    ),
                    padding: const EdgeInsets.all(8),
                    child: Image.asset(
                      'assets/logo/logo.png',
                      fit: BoxFit.contain,
                    ),
                  ),
                  const Text(
                    'Expert Care, Comfort, and Reliability',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'At Trees India, we believe that every home deserves expert care, comfort, and reliability. Our mission is to simplify everyday living by connecting you with trusted professionals for all your household and construction needs—right at your fingertips.\n\nWhether you need a plumber, electrician, carpenter, housekeeper, painter, or repair specialist, Trees India is your one-stop destination for quality service, transparent pricing, and timely assistance. Through our easy-to-use app, we bring together skilled technicians and modern convenience, ensuring that every service you book is handled with professionalism and care.\n\nWhat sets us apart is our commitment to excellence, customer satisfaction, and sustainable practices. Every professional in our network is verified, trained, and dedicated to delivering high-quality results that you can count on.\n\nAt Trees India, we don\'t just fix problems—we build trust, enhance homes, and make life a little easier, one service at a time.',
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFFBBF7D0),
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Key Features
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Why Choose TreesIndia?',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 24),
                  _buildFeatureCard(
                    Icons.verified_user,
                    'Verified Professionals',
                    'All our service providers are thoroughly verified and background-checked for your safety and peace of mind.',
                    Colors.blue,
                  ),
                  const SizedBox(height: 16),
                  _buildFeatureCard(
                    Icons.groups,
                    'Wide Network',
                    'Access to thousands of skilled professionals across various service categories in your area.',
                    Colors.green,
                  ),
                  const SizedBox(height: 16),
                  _buildFeatureCard(
                    Icons.emoji_events,
                    'Quality Assurance',
                    'We ensure high-quality service delivery with customer feedback and satisfaction guarantees.',
                    Colors.purple,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Contact Information
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Contact Us',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildContactCard(Icons.email, 'Email',
                      'support@treesindiaservices.com', Colors.green),
                  const SizedBox(height: 16),
                  _buildContactCard(
                      Icons.phone, 'Phone', '+91 9641864615', Colors.blue),
                  const SizedBox(height: 16),
                  _buildContactCard(
                      Icons.phone, 'Phone', '+91 7363952622', Colors.blue),
                  const SizedBox(height: 16),
                  _buildContactCard(
                      Icons.location_on,
                      'Address',
                      'Sevoke Road, Shastri Nagar, Siliguri, Darjeeling, West Bengal - 734001',
                      Colors.purple),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Legal Information Section
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Legal Information',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 16),
                  InkWell(
                    onTap: () => _showTermsAndConditionsModal(context),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: Colors.blue.shade50,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.description,
                              color: Colors.blue.shade600,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Terms and Conditions',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Icon(
                            Icons.arrow_forward_ios,
                            color: Colors.grey.shade400,
                            size: 16,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  InkWell(
                    onTap: () => _showPrivacyPolicyModal(context),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: Colors.green.shade50,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.privacy_tip,
                              color: Colors.green.shade600,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Privacy Policy',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Icon(
                            Icons.arrow_forward_ios,
                            color: Colors.grey.shade400,
                            size: 16,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureCard(
      IconData icon, String title, String description, MaterialColor color) {
    return Column(
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: color.shade50,
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            color: color.shade600,
            size: 32,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          description,
          style: const TextStyle(
            fontSize: 14,
            color: Colors.grey,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildContactCard(
      IconData icon, String title, String value, MaterialColor color) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color.shade50,
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            color: color.shade600,
            size: 20,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Colors.black87,
                ),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showTermsAndConditionsModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          insetPadding: const EdgeInsets.all(16),
          child: Container(
            constraints: const BoxConstraints(maxHeight: 700),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Color(0xFF16A34A),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(4),
                      topRight: Radius.circular(4),
                    ),
                  ),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Terms and Conditions',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Welcome to Trees India!',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'These Terms and Conditions ("Terms") govern your access to and use of our mobile application, website, and related services (collectively referred to as the "Platform"). By using the Platform, you agree to comply with and be bound by these Terms. Please read them carefully before using our services.',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.black54,
                            height: 1.6,
                          ),
                        ),
                        const SizedBox(height: 24),
                        _buildTermsSection(
                          '1. Acceptance of Terms',
                          'By downloading, accessing, or using Trees India, you acknowledge that you have read, understood, and agreed to these Terms. If you do not agree, please refrain from using the Platform.',
                        ),
                        _buildTermsSection(
                          '2. Services Offered',
                          'Trees India is a digital platform that connects users ("Customers") with verified professionals ("Service Providers") for a wide range of services including but not limited to:\n\n• Construction and maintenance\n• Plumbing and electrical work\n• Housekeeping and cleaning\n• Repairs, painting, carpentry, and related home services\n\nTrees India acts solely as a facilitator and does not directly provide the services listed. The actual service is delivered by independent third-party professionals.',
                        ),
                        _buildTermsSection(
                          '3. User Responsibilities',
                          'By using our Platform, you agree to:\n\n• Provide accurate, complete, and up-to-date information during registration and service booking.\n• Use the Platform only for lawful purposes.\n• Refrain from any activity that may disrupt, damage, or impair the Platform\'s functionality.\n• Treat all Service Providers and Trees India staff with respect and professionalism.\n\nYou are responsible for maintaining the confidentiality of your account credentials and any activity under your account.',
                        ),
                        _buildTermsSection(
                          '4. Booking and Payments',
                          '• All service bookings are subject to availability and confirmation.\n• Prices listed in the app are indicative and may vary based on the service scope or location.\n• Payments must be made through approved methods within the Platform.\n• Trees India partners with secure third-party payment gateways for processing transactions.\n• Any disputes related to payments or service completion must be reported promptly to our support team.',
                        ),
                        _buildTermsSection(
                          '5. Service Providers',
                          '• All Service Providers are verified and onboarded through a quality screening process.\n• Trees India is not responsible for any loss, damage, or injury arising from the actions or omissions of a Service Provider.\n• In the event of dissatisfaction, users may raise complaints through the in-app support system for review and resolution.',
                        ),
                        _buildTermsSection(
                          '6. Cancellations and Refunds',
                          '• Cancellations made before service confirmation may be eligible for a full or partial refund.\n• Once a service has commenced, refunds are handled on a case-by-case basis.\n• Trees India reserves the right to withhold refunds in case of policy violations, fraudulent activity, or misuse of the Platform.',
                        ),
                        _buildTermsSection(
                          '7. Limitation of Liability',
                          'Trees India shall not be liable for:\n\n• Any indirect, incidental, or consequential damages arising out of your use of the Platform or services.\n• Delays, service failures, or damages caused by third-party Service Providers.\n• Losses resulting from unauthorized access to your account.\n\nOur total liability, in any case, shall not exceed the total amount paid by you for the specific service in question.',
                        ),
                        _buildTermsSection(
                          '8. Intellectual Property Rights',
                          'All content, logos, designs, text, and software on the Trees India Platform are the exclusive property of Trees India. You may not copy, modify, distribute, or reproduce any content without prior written consent.',
                        ),
                        _buildTermsSection(
                          '9. Termination of Access',
                          'Trees India reserves the right to suspend or terminate your account if:\n\n• You violate these Terms.\n• You engage in fraudulent, abusive, or unlawful activity.\n• Required by law or regulatory authority.\n\nUpon termination, your access to the Platform and its features will cease immediately.',
                        ),
                        _buildTermsSection(
                          '10. Privacy and Data Protection',
                          'Your use of the Platform is also governed by our Privacy Policy, which outlines how we collect, use, and safeguard your data. Please review it carefully.',
                        ),
                        _buildTermsSection(
                          '11. Changes to Terms',
                          'Trees India may update these Terms from time to time. Updated versions will be posted on our Platform with a revised effective date. Continued use of the Platform after such updates implies your acceptance of the modified Terms.',
                        ),
                        _buildTermsSection(
                          '12. Governing Law and Jurisdiction',
                          'These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in Siliguri, West Bengal.',
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showPrivacyPolicyModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          insetPadding: const EdgeInsets.all(16),
          child: Container(
            constraints: const BoxConstraints(maxHeight: 700),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Color(0xFF16A34A),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(4),
                      topRight: Radius.circular(4),
                    ),
                  ),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Privacy Policy',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'At Trees India, we value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our mobile application, website, and related services (collectively referred to as "Services").',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.black54,
                            height: 1.6,
                          ),
                        ),
                        const SizedBox(height: 24),
                        _buildTermsSection(
                          '1. Information We Collect',
                          'We may collect the following types of information when you use our Services:\n\nPersonal Information: Name, phone number, email address, and location details when you register or book a service.\n\nService Information: Details related to the services you request, such as category, timing, and location.\n\nPayment Information: When you make payments through our platform, we may collect transaction details. (Note: Payment processing is handled by secure third-party providers.)\n\nDevice Information: IP address, browser type, operating system, and device identifiers to help us improve user experience.',
                        ),
                        _buildTermsSection(
                          '2. How We Use Your Information',
                          'We use the collected information to:\n\n• Provide, manage, and improve our Services.\n• Connect you with verified professionals for the requested services.\n• Communicate updates, offers, and service-related information.\n• Ensure customer support and respond to queries.\n• Comply with legal and regulatory obligations.',
                        ),
                        _buildTermsSection(
                          '3. Sharing of Information',
                          'We do not sell or rent your personal data. We may share information only with:\n\nService Professionals: To fulfill your requested services.\n\nPayment Gateways: For secure transaction processing.\n\nThird-Party Partners: Who assist in analytics, support, or marketing (under strict confidentiality agreements).\n\nLegal Authorities: When required by law or to protect the rights and safety of users or the company.',
                        ),
                        _buildTermsSection(
                          '4. Data Security',
                          'We implement robust technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. All sensitive information is encrypted and transmitted over secure channels.',
                        ),
                        _buildTermsSection(
                          '5. Your Rights',
                          'You have the right to:\n\n• Access and review your personal data.\n• Request correction or deletion of your information.\n• Withdraw consent for data processing (subject to legal obligations).\n\nYou can exercise these rights by contacting us at support@treesindiaservices.com.',
                        ),
                        _buildTermsSection(
                          '6. Cookies and Tracking',
                          'Our app and website may use cookies or similar technologies to enhance user experience and analyze usage patterns. You can manage cookie preferences through your device or browser settings.',
                        ),
                        _buildTermsSection(
                          '7. Updates to This Policy',
                          'We may update this Privacy Policy periodically. Any changes will be posted on our website/app with an updated effective date. We encourage users to review this policy regularly.',
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTermsSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.black54,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}
