import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart'; // Import Hive for Flutter
import 'package:logger/logger.dart';
import 'package:trees_india/commons/environment/global_environment.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'commons/app/app_initializer.dart';
import 'commons/utils/global_error_handler.dart';

final Logger _logger = Logger();
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables before using them (as asset)
  try {
    await dotenv.load(fileName: '.env');
  } catch (e) {
    _logger.w('dotenv load failed: $e');
  }

  // Initialize Firebase before using any Firebase services
  // try {
  //   await Firebase.initializeApp();
  // } catch (e) {
  //   _logger.w('Firebase.initializeApp failed: $e');
  // }

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  await Hive.initFlutter();

  GlobalEnvironment.loadEnvironment();

  // Widgets binding already initialized above.

  GlobalErrorHandler().setupGlobalErrorHandler();

  // Run the app within the error-handling zone
  runApp(
    ProviderScope(
      child: AppInitializer(navigatorKey: navigatorKey),
    ),
  );
}
