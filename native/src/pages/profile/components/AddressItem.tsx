import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { type Address } from '../../../services';
import EditIcon from '../../../components/icons/EditIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';

interface AddressItemProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  isLastAddress: boolean;
}

export default function AddressItem({ address, onEdit, onDelete, isLastAddress }: AddressItemProps) {
  return (
    <View className="py-4">
      <View className="flex-row items-start justify-between">
        {/* Address content */}
        <View className="flex-1 mr-4">
          {/* Label (Home, Work, etc.) */}
          <Text
            className="text-base font-bold text-[#111928] mb-1"
            style={{ fontFamily: 'Inter-Bold' }}
          >
            {address.name}
          </Text>

          {/* Full address */}
          <Text
            className="text-sm text-[#4B5563]"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            {address.fullAddress || `${address.address}, ${address.city}, ${address.state} ${address.postalCode || address.postal_code}`}
          </Text>
        </View>

        {/* Edit and Delete buttons */}
        <View className="flex-row items-center">
          {/* Edit button */}
          <TouchableOpacity
            onPress={onEdit}
            className="p-2"
            activeOpacity={0.7}
          >
            <EditIcon size={18} color="#111928" />
          </TouchableOpacity>

          {/* Delete button */}
          <TouchableOpacity
            onPress={onDelete}
            disabled={isLastAddress}
            className="p-2 ml-2"
            activeOpacity={0.7}
          >
            <DeleteIcon 
              size={18} 
              color={isLastAddress ? '#9CA3AF' : '#B3261E'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

