import 'package:trees_india/commons/domain/entities/user_settings/notification_settings_entity.dart';

class NotificationSettingsModel {
  final bool bookingReminders;
  final bool emailNotifications;
  final bool marketingEmails;
  final bool pushNotifications;
  final bool serviceUpdates;
  final bool smsNotifications;

  NotificationSettingsModel({
    required this.bookingReminders,
    required this.emailNotifications,
    required this.marketingEmails,
    required this.pushNotifications,
    required this.serviceUpdates,
    required this.smsNotifications,
  });

  factory NotificationSettingsModel.fromJson(Map<String, dynamic> json) {
    return NotificationSettingsModel(
      bookingReminders: json['booking_reminders'] ?? false,
      emailNotifications: json['email_notifications'] ?? false,
      marketingEmails: json['marketing_emails'] ?? false,
      pushNotifications: json['push_notifications'] ?? false,
      serviceUpdates: json['service_updates'] ?? false,
      smsNotifications: json['sms_notifications'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'booking_reminders': bookingReminders,
      'email_notifications': emailNotifications,
      'marketing_emails': marketingEmails,
      'push_notifications': pushNotifications,
      'service_updates': serviceUpdates,
      'sms_notifications': smsNotifications,
    };
  }

  NotificationSettingsEntity toEntity() {
    return NotificationSettingsEntity(
      bookingReminders: bookingReminders,
      emailNotifications: emailNotifications,
      marketingEmails: marketingEmails,
      pushNotifications: pushNotifications,
      serviceUpdates: serviceUpdates,
      smsNotifications: smsNotifications,
    );
  }

  factory NotificationSettingsModel.fromEntity(
      NotificationSettingsEntity entity) {
    return NotificationSettingsModel(
      bookingReminders: entity.bookingReminders,
      emailNotifications: entity.emailNotifications,
      marketingEmails: entity.marketingEmails,
      pushNotifications: entity.pushNotifications,
      serviceUpdates: entity.serviceUpdates,
      smsNotifications: entity.smsNotifications,
    );
  }

  NotificationSettingsModel copyWith({
    bool? bookingReminders,
    bool? emailNotifications,
    bool? marketingEmails,
    bool? pushNotifications,
    bool? serviceUpdates,
    bool? smsNotifications,
  }) {
    return NotificationSettingsModel(
      bookingReminders: bookingReminders ?? this.bookingReminders,
      emailNotifications: emailNotifications ?? this.emailNotifications,
      marketingEmails: marketingEmails ?? this.marketingEmails,
      pushNotifications: pushNotifications ?? this.pushNotifications,
      serviceUpdates: serviceUpdates ?? this.serviceUpdates,
      smsNotifications: smsNotifications ?? this.smsNotifications,
    );
  }
}
