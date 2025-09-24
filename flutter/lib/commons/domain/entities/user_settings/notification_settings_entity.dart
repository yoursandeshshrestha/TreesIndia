class NotificationSettingsEntity {
  final bool bookingReminders;
  final bool emailNotifications;
  final bool marketingEmails;
  final bool pushNotifications;
  final bool serviceUpdates;
  final bool smsNotifications;

  NotificationSettingsEntity({
    required this.bookingReminders,
    required this.emailNotifications,
    required this.marketingEmails,
    required this.pushNotifications,
    required this.serviceUpdates,
    required this.smsNotifications,
  });

  NotificationSettingsEntity copyWith({
    bool? bookingReminders,
    bool? emailNotifications,
    bool? marketingEmails,
    bool? pushNotifications,
    bool? serviceUpdates,
    bool? smsNotifications,
  }) {
    return NotificationSettingsEntity(
      bookingReminders: bookingReminders ?? this.bookingReminders,
      emailNotifications: emailNotifications ?? this.emailNotifications,
      marketingEmails: marketingEmails ?? this.marketingEmails,
      pushNotifications: pushNotifications ?? this.pushNotifications,
      serviceUpdates: serviceUpdates ?? this.serviceUpdates,
      smsNotifications: smsNotifications ?? this.smsNotifications,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is NotificationSettingsEntity &&
        other.bookingReminders == bookingReminders &&
        other.emailNotifications == emailNotifications &&
        other.marketingEmails == marketingEmails &&
        other.pushNotifications == pushNotifications &&
        other.serviceUpdates == serviceUpdates &&
        other.smsNotifications == smsNotifications;
  }

  @override
  int get hashCode {
    return bookingReminders.hashCode ^
        emailNotifications.hashCode ^
        marketingEmails.hashCode ^
        pushNotifications.hashCode ^
        serviceUpdates.hashCode ^
        smsNotifications.hashCode;
  }
}