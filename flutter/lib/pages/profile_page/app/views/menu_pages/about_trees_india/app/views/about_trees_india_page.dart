import 'package:flutter/material.dart';

class AboutTreesIndiaPage extends StatelessWidget {
  const AboutTreesIndiaPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('About TreesIndia'),
      ),
      body: const Center(
        child: Text('About TreesIndia Page'),
      ),
    );
  }
}