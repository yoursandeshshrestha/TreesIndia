import 'package:equatable/equatable.dart';
import '../../domain/entities/address_entity.dart';

enum AddressStatus { initial, loading, success, failure }

class AddressState extends Equatable {
  final AddressStatus status;
  final List<AddressEntity> addresses;
  final AddressEntity? selectedAddress;
  final AddressEntity? createdAddress;
  final String? errorMessage;
  final bool isCreating;
  final bool isUpdating;
  final bool isDeleting;

  const AddressState({
    this.status = AddressStatus.initial,
    this.addresses = const [],
    this.selectedAddress,
    this.createdAddress,
    this.errorMessage,
    this.isCreating = false,
    this.isUpdating = false,
    this.isDeleting = false,
  });

  AddressState copyWith({
    AddressStatus? status,
    List<AddressEntity>? addresses,
    AddressEntity? selectedAddress,
    AddressEntity? createdAddress,
    String? errorMessage,
    bool? isCreating,
    bool? isUpdating,
    bool? isDeleting,
    bool clearSelectedAddress = false,
    bool clearCreatedAddress = false,
    bool clearErrorMessage = false,
  }) {
    return AddressState(
      status: status ?? this.status,
      addresses: addresses ?? this.addresses,
      selectedAddress: clearSelectedAddress ? null : (selectedAddress ?? this.selectedAddress),
      createdAddress: clearCreatedAddress ? null : (createdAddress ?? this.createdAddress),
      errorMessage: clearErrorMessage ? null : (errorMessage ?? this.errorMessage),
      isCreating: isCreating ?? this.isCreating,
      isUpdating: isUpdating ?? this.isUpdating,
      isDeleting: isDeleting ?? this.isDeleting,
    );
  }

  @override
  List<Object?> get props => [
        status,
        addresses,
        selectedAddress,
        createdAddress,
        errorMessage,
        isCreating,
        isUpdating,
        isDeleting,
      ];
}