import 'package:equatable/equatable.dart';
import '../../../services_page/domain/entities/service_detail_entity.dart';
import 'address_entity.dart';
import 'payment_entity.dart';
import 'payment_segment_entity.dart';
import 'payment_progress_entity.dart';
import 'worker_assignment_entity.dart';

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
  final WorkerAssignmentEntity? workerAssignment;
  final List<PaymentSegmentEntity>? paymentSegments;
  final PaymentProgressEntity? paymentProgress;

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
    this.workerAssignment,
    this.paymentSegments,
    this.paymentProgress,
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
        workerAssignment,
        paymentSegments,
        paymentProgress,
      ];

  BookingDetailsEntity copyWith({
    int? id,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? deletedAt,
    String? bookingReference,
    int? userId,
    int? serviceId,
    String? status,
    String? paymentStatus,
    String? bookingType,
    String? completionType,
    DateTime? scheduledDate,
    DateTime? scheduledTime,
    DateTime? scheduledEndTime,
    DateTime? actualStartTime,
    DateTime? actualEndTime,
    int? actualDurationMinutes,
    AddressEntity? address,
    String? description,
    String? contactPerson,
    String? contactPhone,
    String? specialInstructions,
    DateTime? holdExpiresAt,
    double? quoteAmount,
    String? quoteNotes,
    String? quoteProvidedBy,
    DateTime? quoteProvidedAt,
    DateTime? quoteAcceptedAt,
    DateTime? quoteExpiresAt,
    ServiceDetailEntity? service,
    PaymentEntity? payment,
    WorkerAssignmentEntity? workerAssignment,
    List<PaymentSegmentEntity>? paymentSegments,
    PaymentProgressEntity? paymentProgress,
  }) {
    return BookingDetailsEntity(
      id: id ?? this.id,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      deletedAt: deletedAt ?? this.deletedAt,
      bookingReference: bookingReference ?? this.bookingReference,
      userId: userId ?? this.userId,
      serviceId: serviceId ?? this.serviceId,
      status: status ?? this.status,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      bookingType: bookingType ?? this.bookingType,
      completionType: completionType ?? this.completionType,
      scheduledDate: scheduledDate ?? this.scheduledDate,
      scheduledTime: scheduledTime ?? this.scheduledTime,
      scheduledEndTime: scheduledEndTime ?? this.scheduledEndTime,
      actualStartTime: actualStartTime ?? this.actualStartTime,
      actualEndTime: actualEndTime ?? this.actualEndTime,
      actualDurationMinutes:
          actualDurationMinutes ?? this.actualDurationMinutes,
      address: address ?? this.address,
      description: description ?? this.description,
      contactPerson: contactPerson ?? this.contactPerson,
      contactPhone: contactPhone ?? this.contactPhone,
      specialInstructions: specialInstructions ?? this.specialInstructions,
      holdExpiresAt: holdExpiresAt ?? this.holdExpiresAt,
      quoteAmount: quoteAmount ?? this.quoteAmount,
      quoteNotes: quoteNotes ?? this.quoteNotes,
      quoteProvidedBy: quoteProvidedBy ?? this.quoteProvidedBy,
      quoteProvidedAt: quoteProvidedAt ?? this.quoteProvidedAt,
      quoteAcceptedAt: quoteAcceptedAt ?? this.quoteAcceptedAt,
      quoteExpiresAt: quoteExpiresAt ?? this.quoteExpiresAt,
      service: service ?? this.service,
      payment: payment ?? this.payment,
      workerAssignment: workerAssignment ?? this.workerAssignment,
      paymentSegments: paymentSegments ?? this.paymentSegments,
      paymentProgress: paymentProgress ?? this.paymentProgress,
    );
  }
}
