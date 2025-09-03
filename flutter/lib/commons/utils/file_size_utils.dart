import 'dart:io';
import 'package:file_picker/file_picker.dart';

class FileUtils {
  static const double maxSizeInMB = 15.0;
  static const int maxSizeInBytes = 15 * 1024 * 1024;

  double getFileSizeInMB(PlatformFile file) {
    final bytes = File(file.path!).statSync().size.toDouble();
    return bytes / (1024 * 1024);
  }

  int getFileSizeInBytes(PlatformFile file) {
    return File(file.path!).lengthSync();
  }

  bool isFileSizeValid(PlatformFile file) {
    return getFileSizeInMB(file) <= maxSizeInMB;
  }

  // New static methods for File objects

  /// Get file size in MB for a File object
  static double getFileSize(File file) {
    final bytes = file.lengthSync().toDouble();
    return bytes / (1024 * 1024);
  }

  /// Check if a File is below the size limit
  static bool isFileSizeValidForFile(File file, {double maxMB = maxSizeInMB}) {
    return getFileSize(file) <= maxMB;
  }

  /// Format file size to human-readable string
  static String formatFileSize(int bytes) {
    if (bytes < 1024) {
      return '$bytes B';
    } else if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(1)} KB';
    } else {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
  }

  /// Convert MB to bytes
  static int mbToBytes(double mb) {
    return (mb * 1024 * 1024).toInt();
  }

  /// Get filename from a path
  static String getFileName(String path) {
    return path.split('/').last;
  }
}
