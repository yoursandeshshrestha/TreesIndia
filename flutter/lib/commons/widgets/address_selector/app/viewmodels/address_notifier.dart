import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/utils/services/notification_service.dart';
import '../../domain/entities/address_entity.dart';
import '../../domain/usecases/get_addresses_usecase.dart';
import '../../domain/usecases/create_address_usecase.dart';
import '../../domain/usecases/update_address_usecase.dart';
import '../../domain/usecases/delete_address_usecase.dart';
import 'address_state.dart';

class AddressNotifier extends StateNotifier<AddressState> {
  final GetAddressesUseCase getAddressesUseCase;
  final CreateAddressUseCase createAddressUseCase;
  final UpdateAddressUseCase updateAddressUseCase;
  final DeleteAddressUseCase deleteAddressUseCase;
  final NotificationService notificationService;

  AddressNotifier({
    required this.getAddressesUseCase,
    required this.createAddressUseCase,
    required this.updateAddressUseCase,
    required this.deleteAddressUseCase,
    required this.notificationService,
  }) : super(const AddressState());

  Future<void> loadAddresses() async {
    state = state.copyWith(status: AddressStatus.loading);
    try {
      final response = await getAddressesUseCase();
      state = state.copyWith(
        status: AddressStatus.success,
        addresses: response.addresses,
        clearErrorMessage: true,
      );
    } catch (e) {
      state = state.copyWith(
        status: AddressStatus.failure,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> createAddress(CreateAddressRequestEntity request) async {
    state = state.copyWith(isCreating: true, clearErrorMessage: true);
    try {
      final newAddress = await createAddressUseCase(request);
      final updatedAddresses = [...state.addresses, newAddress];

      state = state.copyWith(
        isCreating: false,
        addresses: updatedAddresses,
        createdAddress: newAddress,
        status: AddressStatus.success,
      );
    } catch (e) {
      state = state.copyWith(
        isCreating: false,
        errorMessage: e.toString(),
        status: AddressStatus.failure,
      );
    }
  }

  Future<void> updateAddress(UpdateAddressRequestEntity request) async {
    state = state.copyWith(isUpdating: true, clearErrorMessage: true);
    try {
      final updatedAddress = await updateAddressUseCase(request);
      final updatedAddresses = state.addresses
          .map((address) =>
              address.id == updatedAddress.id ? updatedAddress : address)
          .toList();

      state = state.copyWith(
        isUpdating: false,
        addresses: updatedAddresses,
        selectedAddress: state.selectedAddress?.id == updatedAddress.id
            ? updatedAddress
            : state.selectedAddress,
        status: AddressStatus.success,
      );
    } catch (e) {
      state = state.copyWith(
        isUpdating: false,
        errorMessage: e.toString(),
        status: AddressStatus.failure,
      );
    }
  }

  Future<void> deleteAddress(int addressId) async {
    state = state.copyWith(isDeleting: true, clearErrorMessage: true);
    try {
      final message = await deleteAddressUseCase.call(addressId);
      if (message == 'Cannot delete last address' ||
          message == 'Address cannot be deleted') {
        state = state.copyWith(
          isDeleting: false,
          errorMessage: message,
          status: AddressStatus.success,
        );
        notificationService.showErrorSnackBar(message);
        return;
      }
      final updatedAddresses =
          state.addresses.where((address) => address.id != addressId).toList();

      state = state.copyWith(
        isDeleting: false,
        addresses: updatedAddresses,
        selectedAddress: state.selectedAddress?.id == addressId
            ? null
            : state.selectedAddress,
        status: AddressStatus.success,
        clearSelectedAddress: state.selectedAddress?.id == addressId,
      );
    } catch (e) {
      state = state.copyWith(
        isDeleting: false,
        errorMessage: e.toString(),
        status: AddressStatus.failure,
      );
      // notificationService.showErrorSnackBar(message);
    }
  }

  void selectAddress(AddressEntity address) {
    state = state.copyWith(selectedAddress: address);
  }

  void clearSelection() {
    state = state.copyWith(clearSelectedAddress: true);
  }

  void clearCreatedAddress() {
    state = state.copyWith(clearCreatedAddress: true);
  }

  void clearError() {
    state = state.copyWith(clearErrorMessage: true);
  }
}
