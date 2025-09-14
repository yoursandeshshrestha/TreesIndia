import 'package:trees_india/pages/bookings_page/data/models/booking_details_model.dart';

import '../../domain/entities/chat_room_entity.dart';
import 'chat_message_model.dart';

class ChatRoomModel {
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
  final List<ChatMessageModel>? chatMessages;
  final BookingDetailsModel? booking;

  ChatRoomModel({
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

  factory ChatRoomModel.fromJson(Map<String, dynamic> json) {
    return ChatRoomModel(
      id: json['id'] ?? 0,
      roomType: json['room_type'] ?? '',
      roomName: json['room_name'] ?? '',
      bookingId: json['booking_id'],
      propertyId: json['property_id'],
      workerInquiryId: json['worker_inquiry_id'],
      isActive: json['is_active'] ?? true,
      lastMessageAt: json['last_message_at'],
      closedAt: json['closed_at'],
      closedReason: json['closed_reason'],
      metadata: json['metadata'] ?? {},
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
      chatMessages: json['messages'] != null
          ? (json['messages'] as List)
              .map((message) => ChatMessageModel.fromJson(message))
              .toList()
          : null,
      booking: json['booking'] != null
          ? BookingDetailsModel.fromJson(json['booking'])
          : null,
    );
  }

  ChatRoomEntity toEntity() {
    return ChatRoomEntity(
      id: id,
      roomType: roomType,
      roomName: roomName,
      bookingId: bookingId,
      propertyId: propertyId,
      workerInquiryId: workerInquiryId,
      isActive: isActive,
      lastMessageAt: lastMessageAt,
      closedAt: closedAt,
      closedReason: closedReason,
      metadata: metadata,
      createdAt: createdAt,
      updatedAt: updatedAt,
      chatMessages: chatMessages?.map((message) => message.toEntity()).toList(),
      booking: booking?.toEntity(),
    );
  }
}

