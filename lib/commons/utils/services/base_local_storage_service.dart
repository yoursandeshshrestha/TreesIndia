import 'package:hive/hive.dart';
import 'dart:async';

/// A base class for managing local storage operations using Hive.
///
/// This class provides basic methods for saving, retrieving, deleting,
/// and clearing data from a Hive box. It uses lazy initialization to open
/// the Hive box only when needed and supports error handling for all operations.
///
/// Type Parameter:
/// - `T`: The type of the data stored in the Hive box.
abstract class BaseLocalStorageService<T> {
  /// The name of the Hive box used by this service.
  String get boxName;

  Box<T>? _box;

  /// Opens the Hive box associated with this service.
  ///
  /// This method opens the box only if it is not already open, improving performance.
  ///
  /// Returns:
  /// - A `Future` that resolves to the opened `Box<T>`.
  Future<Box<T>> _openBox() async {
    if (_box == null || !_box!.isOpen) {
      // Guard against long hangs when opening the Hive box
      _box = await Hive.openBox<T>(boxName).timeout(const Duration(seconds: 2),
          onTimeout: () {
        // If opening hangs, create an in-memory box fallback
        // Note: Hive doesn't support explicit in-memory boxes here; rethrow
        throw TimeoutException('Opening Hive box "$boxName" timed out');
      });
    }
    return _box!;
  }

  /// Saves the provided data in the Hive box under the specified key.
  ///
  /// Parameters:
  /// - `key`: The key under which the value will be stored.
  /// - `value`: The value to be stored in the Hive box.
  ///
  /// Throws:
  /// - An `Exception` if the data could not be saved.
  Future<void> saveData(String key, T value) async {
    try {
      var box = await _openBox();
      await box.put(key, value);
    } catch (e) {
      throw Exception('Failed to save data: $e');
    }
  }

  Future<T?> getData(String key) async {
    try {
      var box = await _openBox();
      return box.get(key);
    } catch (e) {
      throw Exception('Failed to get data: $e');
    }
  }

  /// Deletes the data associated with the specified key from the Hive box.
  ///
  /// Parameters:
  /// - `key`: The key of the value to be deleted.
  ///
  /// Throws:
  /// - An `Exception` if the data could not be deleted.
  Future<void> deleteData(String key) async {
    try {
      var box = await _openBox();
      await box.delete(key);
    } catch (e) {
      throw Exception('Failed to delete data: $e');
    }
  }

  /// Clears all data from the Hive box associated with this service.
  ///
  /// Throws:
  /// - An `Exception` if the data could not be cleared.
  Future<void> clearAllData() async {
    try {
      var box = await _openBox();
      await box.clear();
    } catch (e) {
      throw Exception('Failed to clear all data: $e');
    }
  }

  /// Closes the Hive box associated with this service.
  ///
  /// This method can be used to free up resources when the box is no longer needed.
  ///
  /// Throws:
  /// - An `Exception` if the box could not be closed.
  Future<void> closeBox() async {
    try {
      var box = await _openBox();
      await box.close();
      _box = null; // Reset the box instance
    } catch (e) {
      throw Exception('Failed to close box: $e');
    }
  }
}
