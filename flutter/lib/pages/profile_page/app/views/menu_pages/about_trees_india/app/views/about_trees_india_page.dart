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
            // Header
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'About TreesIndia',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Learn more about our mission and values',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Company Overview
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
                    height: 80,
                    width: 120,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      color: Colors.white.withValues(alpha: 0.1),
                    ),
                    padding: const EdgeInsets.all(8),
                    child: Image.asset(
                      'assets/logo/treesindia-logo.png',
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Connecting You with Trusted Service Providers',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'TreesIndia is your trusted platform for finding reliable, verified service providers for all your home and business needs. We connect customers with skilled professionals to make your life easier and your spaces better.',
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

            // Mission & Vision
            LayoutBuilder(
              builder: (context, constraints) {
                if (constraints.maxWidth > 600) {
                  return Row(
                    children: [
                      Expanded(child: _buildMissionCard()),
                      const SizedBox(width: 16),
                      Expanded(child: _buildVisionCard()),
                    ],
                  );
                } else {
                  return Column(
                    children: [
                      _buildMissionCard(),
                      const SizedBox(height: 16),
                      _buildVisionCard(),
                    ],
                  );
                }
              },
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
                  LayoutBuilder(
                    builder: (context, constraints) {
                      if (constraints.maxWidth > 900) {
                        return Row(
                          children: [
                            Expanded(
                                child: _buildFeatureCard(
                              Icons.verified_user,
                              'Verified Professionals',
                              'All our service providers are thoroughly verified and background-checked for your safety and peace of mind.',
                              Colors.blue,
                            )),
                            const SizedBox(width: 16),
                            Expanded(
                                child: _buildFeatureCard(
                              Icons.groups,
                              'Wide Network',
                              'Access to thousands of skilled professionals across various service categories in your area.',
                              Colors.green,
                            )),
                            const SizedBox(width: 16),
                            Expanded(
                                child: _buildFeatureCard(
                              Icons.emoji_events,
                              'Quality Assurance',
                              'We ensure high-quality service delivery with customer feedback and satisfaction guarantees.',
                              Colors.purple,
                            )),
                          ],
                        );
                      } else {
                        return Column(
                          children: [
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
                        );
                      }
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Services Overview
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
                    'Our Services',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      _buildServiceCard('Home Cleaning',
                          'Professional house cleaning services'),
                      _buildServiceCard(
                          'Plumbing', 'Expert plumbing and repair services'),
                      _buildServiceCard(
                          'Electrical', 'Licensed electrician services'),
                      _buildServiceCard(
                          'Carpentry', 'Skilled carpentry and woodwork'),
                      _buildServiceCard(
                          'Painting', 'Professional painting services'),
                      _buildServiceCard(
                          'Pest Control', 'Safe and effective pest control'),
                      _buildServiceCard('Appliance Repair',
                          'Expert appliance repair services'),
                      _buildServiceCard(
                          'And More...', 'Wide range of services available'),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Company Stats
            LayoutBuilder(
              builder: (context, constraints) {
                if (constraints.maxWidth > 800) {
                  return Row(
                    children: [
                      Expanded(
                          child: _buildStatCard(
                              '10K+', 'Happy Customers', Colors.blue)),
                      const SizedBox(width: 12),
                      Expanded(
                          child: _buildStatCard(
                              '5K+', 'Verified Professionals', Colors.green)),
                      const SizedBox(width: 12),
                      Expanded(
                          child: _buildStatCard(
                              '50+', 'Cities Covered', Colors.purple)),
                      const SizedBox(width: 12),
                      Expanded(
                          child: _buildStatCard(
                              '4.8★', 'Customer Rating', Colors.orange)),
                    ],
                  );
                } else {
                  return Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      SizedBox(
                        width: (constraints.maxWidth - 12) / 2,
                        child: _buildStatCard(
                            '10K+', 'Happy Customers', Colors.blue),
                      ),
                      SizedBox(
                        width: (constraints.maxWidth - 12) / 2,
                        child: _buildStatCard(
                            '5K+', 'Verified Professionals', Colors.green),
                      ),
                      SizedBox(
                        width: (constraints.maxWidth - 12) / 2,
                        child: _buildStatCard(
                            '50+', 'Cities Covered', Colors.purple),
                      ),
                      SizedBox(
                        width: (constraints.maxWidth - 12) / 2,
                        child: _buildStatCard(
                            '4.8★', 'Customer Rating', Colors.orange),
                      ),
                    ],
                  );
                }
              },
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
                  LayoutBuilder(
                    builder: (context, constraints) {
                      if (constraints.maxWidth > 900) {
                        return Row(
                          children: [
                            Expanded(
                                child: _buildContactCard(Icons.phone, 'Phone',
                                    '+91 1800-123-4567', Colors.blue)),
                            const SizedBox(width: 16),
                            Expanded(
                                child: _buildContactCard(Icons.email, 'Email',
                                    'support@treesindia.com', Colors.green)),
                            const SizedBox(width: 16),
                            Expanded(
                                child: _buildContactCard(
                                    Icons.location_on,
                                    'Address',
                                    'Mumbai, Maharashtra, India',
                                    Colors.purple)),
                          ],
                        );
                      } else {
                        return Column(
                          children: [
                            _buildContactCard(Icons.phone, 'Phone',
                                '+91 1800-123-4567', Colors.blue),
                            const SizedBox(height: 16),
                            _buildContactCard(Icons.email, 'Email',
                                'support@treesindia.com', Colors.green),
                            const SizedBox(height: 16),
                            _buildContactCard(Icons.location_on, 'Address',
                                'Mumbai, Maharashtra, India', Colors.purple),
                          ],
                        );
                      }
                    },
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

  Widget _buildMissionCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(
                  color: Color(0xFFDCFCE7),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.emoji_events,
                  color: Color(0xFF2563EB),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Our Mission',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'To revolutionize the service industry by providing a seamless platform that connects customers with verified, skilled professionals, ensuring quality service delivery and customer satisfaction.',
            style: TextStyle(
              fontSize: 14,
              color: Colors.black54,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVisionCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(
                  color: Color(0xFFDCFCE7),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.public,
                  color: Color(0xFF16A34A),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Our Vision',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'To become the leading service marketplace in India, empowering millions of service providers and customers with technology-driven solutions that make everyday tasks convenient and reliable.',
            style: TextStyle(
              fontSize: 14,
              color: Colors.black54,
              height: 1.5,
            ),
          ),
        ],
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

  Widget _buildServiceCard(String title, String description) {
    return Container(
      width: 150,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.black87,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: const TextStyle(
              fontSize: 12,
              color: Colors.grey,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
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

  Widget _buildStatCard(String value, String label, MaterialColor color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color.shade600,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: color.shade900,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
