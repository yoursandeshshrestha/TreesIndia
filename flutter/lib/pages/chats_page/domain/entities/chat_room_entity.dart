import 'package:trees_india/pages/bookings_page/domain/entities/booking_details_entity.dart';

import 'chat_message_entity.dart';

class ChatRoomEntity {
  final int id;
  final String roomType;
  final String roomName;
  final int? bookingId;
  final int? propertyId;
  final int? workerInquiryId;
  final bool isActive;
  final String? lastMessageAt;
  final String? closedAt;
  final String? closedReason;
  final Map<String, dynamic> metadata;
  final String createdAt;
  final String updatedAt;
  final List<ChatMessageEntity>? chatMessages;
  final BookingDetailsEntity? booking;

  const ChatRoomEntity({
    required this.id,
    required this.roomType,
    required this.roomName,
    this.bookingId,
    this.propertyId,
    this.workerInquiryId,
    required this.isActive,
    this.lastMessageAt,
    this.closedAt,
    this.closedReason,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    this.chatMessages,
    this.booking,
  });
}
