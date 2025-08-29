import 'package:equatable/equatable.dart';
import '../../../services_page/domain/entities/service_detail_entity.dart';
import 'address_entity.dart';
import 'payment_entity.dart';

class BookingDetailsEntity extends Equatable {
  final int id;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final String bookingReference;
  final int userId;
  final int serviceId;
  final String status;
  final String paymentStatus;
  final String bookingType;
  final String? completionType;
  final DateTime? scheduledDate;
  final DateTime? scheduledTime;
  final DateTime? scheduledEndTime;
  final DateTime? actualStartTime;
  final DateTime? actualEndTime;
  final int? actualDurationMinutes;
  final AddressEntity address;
  final String description;
  final String contactPerson;
  final String contactPhone;
  final String specialInstructions;
  final DateTime? holdExpiresAt;
  final double? quoteAmount;
  final String quoteNotes;
  final String? quoteProvidedBy;
  final DateTime? quoteProvidedAt;
  final DateTime? quoteAcceptedAt;
  final DateTime? quoteExpiresAt;
  final ServiceDetailEntity service;
  final PaymentEntity? payment;

  const BookingDetailsEntity({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.bookingReference,
    required this.userId,
    required this.serviceId,
    required this.status,
    required this.paymentStatus,
    required this.bookingType,
    this.completionType,
    this.scheduledDate,
    this.scheduledTime,
    this.scheduledEndTime,
    this.actualStartTime,
    this.actualEndTime,
    this.actualDurationMinutes,
    required this.address,
    required this.description,
    required this.contactPerson,
    required this.contactPhone,
    required this.specialInstructions,
    this.holdExpiresAt,
    this.quoteAmount,
    required this.quoteNotes,
    this.quoteProvidedBy,
    this.quoteProvidedAt,
    this.quoteAcceptedAt,
    this.quoteExpiresAt,
    required this.service,
    this.payment,
  });

  @override
  List<Object?> get props => [
        id,
        createdAt,
        updatedAt,
        deletedAt,
        bookingReference,
        userId,
        serviceId,
        status,
        paymentStatus,
        bookingType,
        completionType,
        scheduledDate,
        scheduledTime,
        scheduledEndTime,
        actualStartTime,
        actualEndTime,
        actualDurationMinutes,
        address,
        description,
        contactPerson,
        contactPhone,
        specialInstructions,
        holdExpiresAt,
        quoteAmount,
        quoteNotes,
        quoteProvidedBy,
        quoteProvidedAt,
        quoteAcceptedAt,
        quoteExpiresAt,
        service,
        payment,
      ];
}
