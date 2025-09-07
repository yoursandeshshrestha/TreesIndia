import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dev_environment.dart';
import 'prod_environment.dart';

class GlobalEnvironment {
  static late String apiBaseUrl;
  static late String wsBaseUrl;
  static late bool enableLogging;
  static late String razorpayKey;

  static void loadEnvironment() {
    String environment = dotenv.env['ENVIRONMENT'] ?? 'development';

    if (environment == 'production') {
      ProdEnvironment.load();
    } else {
      DevEnvironment.load();
    }
  }
}
