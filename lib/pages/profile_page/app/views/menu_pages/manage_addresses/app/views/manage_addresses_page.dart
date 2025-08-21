import 'package:flutter/material.dart';

class ManageAddressesPage extends StatelessWidget {
  const ManageAddressesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Addresses'),
      ),
      body: const Center(
        child: Text('Manage Addresses Page'),
      ),
    );
  }
}