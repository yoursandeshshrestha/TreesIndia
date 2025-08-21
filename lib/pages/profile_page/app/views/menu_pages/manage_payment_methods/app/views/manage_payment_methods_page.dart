import 'package:flutter/material.dart';

class ManagePaymentMethodsPage extends StatelessWidget {
  const ManagePaymentMethodsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Payment Methods'),
      ),
      body: const Center(
        child: Text('Manage Payment Methods Page'),
      ),
    );
  }
}