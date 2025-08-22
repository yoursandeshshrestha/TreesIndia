import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'global_environment.dart';

class DevEnvironment {
  static void load() {
    GlobalEnvironment.apiBaseUrl =
        dotenv.env['DEV_API_BASE_URL'] ?? 'http://10.0.2.2:8080/api/v1';
    GlobalEnvironment.enableLogging =
        dotenv.env['DEV_ENABLE_LOGGING']?.toLowerCase() == 'true';
    GlobalEnvironment.razorpayKey = dotenv.env['DEV_RAZORPAY_KEY'] ?? '';
  }
}
