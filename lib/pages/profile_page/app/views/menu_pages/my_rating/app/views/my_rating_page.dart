import 'package:flutter/material.dart';

class MyRatingPage extends StatelessWidget {
  const MyRatingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Rating'),
      ),
      body: const Center(
        child: Text('My Rating Page'),
      ),
    );
  }
}