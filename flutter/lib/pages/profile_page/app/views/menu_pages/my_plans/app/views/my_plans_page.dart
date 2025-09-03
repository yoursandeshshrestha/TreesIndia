import 'package:flutter/material.dart';

class MyPlansPage extends StatelessWidget {
  const MyPlansPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Plans'),
      ),
      body: const Center(
        child: Text('My Plans Page'),
      ),
    );
  }
}