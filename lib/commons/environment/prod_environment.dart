import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'global_environment.dart';

class ProdEnvironment {
  static void load() {
    GlobalEnvironment.apiBaseUrl = dotenv.env['PROD_API_BASE_URL'] ?? '';
    GlobalEnvironment.apiKey = dotenv.env['PROD_API_KEY'] ?? '';
    GlobalEnvironment.enableLogging =
        dotenv.env['PROD_ENABLE_LOGGING']?.toLowerCase() == 'true';
  }
}
