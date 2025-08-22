import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'global_environment.dart';

class ProdEnvironment {
  static void load() {
    GlobalEnvironment.apiBaseUrl = dotenv.env['PROD_API_BASE_URL'] ?? '';
    GlobalEnvironment.enableLogging =
        dotenv.env['PROD_ENABLE_LOGGING']?.toLowerCase() == 'true';
    GlobalEnvironment.razorpayKey = dotenv.env['PROD_RAZORPAY_KEY'] ?? '';
  }
}
