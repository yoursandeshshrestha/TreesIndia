import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'global_environment.dart';

class DevEnvironment {
  static void load() {
    // For Android Emulator, use 10.0.2.2 instead of localhost
    // For physical device or iOS, replace with your computer's IP address
    GlobalEnvironment.apiBaseUrl =
        dotenv.env['DEV_API_BASE_URL'] ?? 'http://10.0.2.2:8080/api/v1';
    GlobalEnvironment.apiKey = dotenv.env['DEV_API_KEY'] ?? '';
    GlobalEnvironment.enableLogging =
        dotenv.env['DEV_ENABLE_LOGGING']?.toLowerCase() == 'true';
  }
}
