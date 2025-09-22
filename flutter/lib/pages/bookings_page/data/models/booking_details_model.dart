import '../../../services_page/data/models/service_model.dart';
import '../../domain/entities/booking_details_entity.dart';
import 'address_model.dart';
import 'payment_model.dart';
import 'payment_segment_model.dart';
import 'payment_progress_model.dart';
import 'worker_assignment_model.dart';

class BookingDetailsModel extends BookingDetailsEntity {
  const BookingDetailsModel({
    required super.id,
    required super.createdAt,
    required super.updatedAt,
    super.deletedAt,
    required super.bookingReference,
    required super.userId,
    required super.serviceId,
    required super.status,
    required super.paymentStatus,
    required super.bookingType,
    super.completionType,
    required super.scheduledDate,
    required super.scheduledTime,
    required super.scheduledEndTime,
    super.actualStartTime,
    super.actualEndTime,
    super.actualDurationMinutes,
    required super.address,
    required super.description,
    required super.contactPerson,
    required super.contactPhone,
    required super.specialInstructions,
    super.holdExpiresAt,
    super.quoteAmount,
    required super.quoteNotes,
    super.quoteProvidedBy,
    super.quoteProvidedAt,
    super.quoteAcceptedAt,
    super.quoteExpiresAt,
    required super.service,
    super.payment,
    super.workerAssignment,
    super.paymentSegments,
    // super.paymentProgress,
  });

  factory BookingDetailsModel.fromJson(Map<String, dynamic> json) {
    // Handle both old and new API response formats
    final userJson = json['user'] as Map<String, dynamic>?;
    final contactJson = json['contact'] as Map<String, dynamic>?;
    final addressJson = json['address'];

    return BookingDetailsModel(
      id: json['ID'] as int,
      // Handle both CreatedAt and created_at formats
      createdAt: DateTime.parse(json['created_at'] ?? json['CreatedAt'] as String),
      updatedAt: DateTime.parse(json['updated_at'] ?? json['UpdatedAt'] as String),
      deletedAt: (json['deleted_at'] ?? json['DeletedAt']) != null
          ? DateTime.parse((json['deleted_at'] ?? json['DeletedAt']) as String)
          : null,
      bookingReference: json['booking_reference'] as String,
      // Use user ID from user object if available, otherwise fallback to direct field
      userId: userJson?['ID'] as int? ?? json['user_id'] as int? ?? 0,
      // Use service ID from service object if available, otherwise fallback to direct field
      serviceId: (json['service'] as Map<String, dynamic>?)?['ID'] as int? ?? json['service_id'] as int? ?? 0,
      status: json['status'] as String,
      // Use payment status from payment object if available, otherwise fallback to direct field
      paymentStatus: (json['payment'] as Map<String, dynamic>?)?['status'] as String? ?? json['payment_status'] as String? ?? 'unknown',
      bookingType: json['booking_type'] as String,
      completionType: json['completion_type'] as String?,
      scheduledDate: json['scheduled_date'] != null
          ? DateTime.parse(json['scheduled_date'] as String)
          : null,
      scheduledTime: json['scheduled_time'] != null
          ? DateTime.parse(json['scheduled_time'] as String)
          : null,
      scheduledEndTime: json['scheduled_end_time'] != null
          ? DateTime.parse(json['scheduled_end_time'] as String)
          : null,
      actualStartTime: json['actual_start_time'] != null
          ? DateTime.parse(json['actual_start_time'] as String)
          : null,
      actualEndTime: json['actual_end_time'] != null
          ? DateTime.parse(json['actual_end_time'] as String)
          : null,
      actualDurationMinutes: json['actual_duration_minutes'] as int?,
      // Handle address as both object and string formats
      address: addressJson is String
          ? AddressModel.fromJsonString(addressJson)
          : AddressModel.fromJson(addressJson as Map<String, dynamic>),
      // Use contact description or fallback to description field
      description: contactJson?['description'] as String? ?? json['description'] as String? ?? '',
      // Use contact person or fallback to contact_person field
      contactPerson: contactJson?['person'] as String? ?? json['contact_person'] as String? ?? '',
      // Use user phone or fallback to contact_phone field
      contactPhone: userJson?['phone'] as String? ?? json['contact_phone'] as String? ?? '',
      // Use contact special_instructions or fallback to special_instructions field
      specialInstructions: contactJson?['special_instructions'] as String? ?? json['special_instructions'] as String? ?? '',
      holdExpiresAt: json['hold_expires_at'] != null
          ? DateTime.parse(json['hold_expires_at'] as String)
          : null,
      quoteAmount: json['quote_amount'] != null
          ? (json['quote_amount'] as num).toDouble()
          : null,
      // Handle quote_duration for quote_notes fallback
      quoteNotes: json['quote_notes'] as String? ?? json['quote_duration'] as String? ?? '',
      quoteProvidedBy: json['quote_provided_by']?.toString(),
      quoteProvidedAt: json['quote_provided_at'] != null
          ? DateTime.parse(json['quote_provided_at'] as String)
          : null,
      quoteAcceptedAt: json['quote_accepted_at'] != null
          ? DateTime.parse(json['quote_accepted_at'] as String)
          : null,
      quoteExpiresAt: json['quote_expires_at'] != null
          ? DateTime.parse(json['quote_expires_at'] as String)
          : null,
      service: _parseServiceFromJson(json['service'] as Map<String, dynamic>),
      payment: json['payment'] != null
          ? PaymentModel.fromJson(json['payment'] as Map<String, dynamic>)
          : null,
      workerAssignment: json['worker_assignment'] != null
          ? WorkerAssignmentModel.fromJson(json['worker_assignment'] as Map<String, dynamic>)
          : null,
      paymentSegments: json['payment_segments'] != null
          ? (json['payment_segments'] as List<dynamic>)
              .map((segment) => PaymentSegmentModel.fromJson(segment as Map<String, dynamic>))
              .toList()
          : null,
      // paymentProgress: json['payment_progress'] != null
      //     ? PaymentProgressModel.fromJson(json['payment_progress'] as Map<String, dynamic>)
      //     : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ID': id,
      'CreatedAt': createdAt.toIso8601String(),
      'UpdatedAt': updatedAt.toIso8601String(),
      'DeletedAt': deletedAt?.toIso8601String(),
      'booking_reference': bookingReference,
      'user_id': userId,
      'service_id': serviceId,
      'status': status,
      'payment_status': paymentStatus,
      'booking_type': bookingType,
      'completion_type': completionType,
      'scheduled_date': scheduledDate?.toIso8601String(),
      'scheduled_time': scheduledTime?.toIso8601String(),
      'scheduled_end_time': scheduledEndTime?.toIso8601String(),
      'actual_start_time': actualStartTime?.toIso8601String(),
      'actual_end_time': actualEndTime?.toIso8601String(),
      'actual_duration_minutes': actualDurationMinutes,
      'address': (address as AddressModel).toJson(),
      'description': description,
      'contact_person': contactPerson,
      'contact_phone': contactPhone,
      'special_instructions': specialInstructions,
      'hold_expires_at': holdExpiresAt?.toIso8601String(),
      'quote_amount': quoteAmount,
      'quote_notes': quoteNotes,
      'quote_provided_by': quoteProvidedBy,
      'quote_provided_at': quoteProvidedAt?.toIso8601String(),
      'quote_accepted_at': quoteAcceptedAt?.toIso8601String(),
      'quote_expires_at': quoteExpiresAt?.toIso8601String(),
      'service': (service as ServiceModel).toJson(),
      'payment': payment != null ? (payment as PaymentModel).toJson() : null,
      'worker_assignment': workerAssignment != null ? (workerAssignment as WorkerAssignmentModel).toJson() : null,
      'payment_segments': paymentSegments?.map((segment) => (segment as PaymentSegmentModel).toJson()).toList(),
      // 'payment_progress': paymentProgress != null
      //     ? (paymentProgress as PaymentProgressModel).toJson()
      //     : null,
    };
  }

  BookingDetailsEntity toEntity() {
    return BookingDetailsEntity(
      id: id,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
      bookingReference: bookingReference,
      userId: userId,
      serviceId: serviceId,
      status: status,
      paymentStatus: paymentStatus,
      bookingType: bookingType,
      completionType: completionType,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      scheduledEndTime: scheduledEndTime,
      actualStartTime: actualStartTime,
      actualEndTime: actualEndTime,
      actualDurationMinutes: actualDurationMinutes,
      address: (address as AddressModel).toEntity(),
      description: description,
      contactPerson: contactPerson,
      contactPhone: contactPhone,
      specialInstructions: specialInstructions,
      holdExpiresAt: holdExpiresAt,
      quoteAmount: quoteAmount,
      quoteNotes: quoteNotes,
      quoteProvidedBy: quoteProvidedBy,
      quoteProvidedAt: quoteProvidedAt,
      quoteAcceptedAt: quoteAcceptedAt,
      quoteExpiresAt: quoteExpiresAt,
      service: (service as ServiceModel).toEntity(),
      payment: payment != null ? (payment as PaymentModel).toEntity() : null,
      workerAssignment: workerAssignment != null ? (workerAssignment as WorkerAssignmentModel).toEntity() : null,
      paymentSegments: paymentSegments?.map((segment) => (segment as PaymentSegmentModel).toEntity()).toList(),
      // paymentProgress: paymentProgress != null ? (paymentProgress as PaymentProgressModel).toEntity() : null,
    );
  }

  static String _extractName(Map<String, dynamic>? obj) {
    if (obj == null) return '';
    final name = obj['name'] as String?;
    return name?.isNotEmpty == true ? name! : '';
  }

  static ServiceModel _parseServiceFromJson(Map<String, dynamic> serviceJson) {
    return ServiceModel(
      // Handle both ID and id field formats
      id: serviceJson['ID'] as int? ?? serviceJson['id'] as int? ?? 0,
      name: serviceJson['name'] as String,
      // Provide default values for missing fields in the new API response
      slug: serviceJson['slug'] as String? ?? '',
      description: serviceJson['description'] as String? ?? '',
      images: (serviceJson['images'] != null &&
              (serviceJson['images'] as List<dynamic>?)?.isNotEmpty == true)
          ? (serviceJson['images'] as List<dynamic>).cast<String>()
          : null,
      priceType: serviceJson['price_type'] as String,
      price: serviceJson['price'] as int?,
      duration: serviceJson['duration'] as String?,
      // Provide default values for missing category fields
      categoryId: serviceJson['category_id'] as int? ?? 0,
      subcategoryId: serviceJson['subcategory_id'] as int? ?? 0,
      categoryName:
          _extractName(serviceJson['category'] as Map<String, dynamic>?),
      subcategoryName:
          _extractName(serviceJson['subcategory'] as Map<String, dynamic>?),
      isActive: serviceJson['is_active'] as bool? ?? true,
      // Handle missing timestamp fields by providing defaults
      createdAt: serviceJson['created_at'] != null
          ? DateTime.parse(serviceJson['created_at'] as String)
          : DateTime.now(),
      updatedAt: serviceJson['updated_at'] != null
          ? DateTime.parse(serviceJson['updated_at'] as String)
          : DateTime.now(),
      deletedAt: serviceJson['deleted_at'] != null
          ? DateTime.parse(serviceJson['deleted_at'] as String)
          : null,
      serviceAreas: const [], // Empty list since this endpoint doesn't provide service areas
    );
  }

  factory BookingDetailsModel.fromEntity(BookingDetailsEntity entity) {
    return BookingDetailsModel(
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      bookingReference: entity.bookingReference,
      userId: entity.userId,
      serviceId: entity.serviceId,
      status: entity.status,
      paymentStatus: entity.paymentStatus,
      bookingType: entity.bookingType,
      completionType: entity.completionType,
      scheduledDate: entity.scheduledDate,
      scheduledTime: entity.scheduledTime,
      scheduledEndTime: entity.scheduledEndTime,
      actualStartTime: entity.actualStartTime,
      actualEndTime: entity.actualEndTime,
      actualDurationMinutes: entity.actualDurationMinutes,
      address: AddressModel.fromEntity(entity.address),
      description: entity.description,
      contactPerson: entity.contactPerson,
      contactPhone: entity.contactPhone,
      specialInstructions: entity.specialInstructions,
      holdExpiresAt: entity.holdExpiresAt,
      quoteAmount: entity.quoteAmount,
      quoteNotes: entity.quoteNotes,
      quoteProvidedBy: entity.quoteProvidedBy,
      quoteProvidedAt: entity.quoteProvidedAt,
      quoteAcceptedAt: entity.quoteAcceptedAt,
      quoteExpiresAt: entity.quoteExpiresAt,
      service: ServiceModel.fromEntity(entity.service),
      payment: entity.payment != null
          ? PaymentModel.fromEntity(entity.payment!)
          : null,
      workerAssignment: entity.workerAssignment != null
          ? WorkerAssignmentModel.fromEntity(entity.workerAssignment!)
          : null,
      paymentSegments: entity.paymentSegments?.map((segment) => PaymentSegmentModel.fromEntity(segment)).toList(),
      // paymentProgress: entity.paymentProgress != null
      //     ? PaymentProgressModel.fromEntity(entity.paymentProgress!)
      //     : null,
    );
  }
}
