import 'package:flutter/material.dart';
import '../../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../../commons/components/button/app/views/solid_button_widget.dart';
import '../../../../../../commons/constants/app_colors.dart';
import '../../../../../../commons/constants/app_spacing.dart';

class MapLocationPicker extends StatefulWidget {
  final void Function(double latitude, double longitude, String? address)? onLocationSelected;
  final VoidCallback? onCancel;

  const MapLocationPicker({
    super.key,
    this.onLocationSelected,
    this.onCancel,
  });

  @override
  State<MapLocationPicker> createState() => _MapLocationPickerState();
}

class _MapLocationPickerState extends State<MapLocationPicker> {
  double? _selectedLat;
  double? _selectedLng;
  String? _selectedAddress;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              H4Bold(
                text: 'Pick Location on Map',
                color: AppColors.brandNeutral900,
              ),
              const Spacer(),
              IconButton(
                onPressed: widget.onCancel,
                icon: const Icon(Icons.close),
                constraints: const BoxConstraints(
                  minWidth: 32,
                  minHeight: 32,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: AppSpacing.lg),
          
          // Map placeholder - In a real implementation, you would use
          // google_maps_flutter or another map package
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.brandNeutral100,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.brandNeutral300),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.map_outlined,
                    size: 64,
                    color: AppColors.brandNeutral400,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  H4Bold(
                    text: 'Map Integration Required',
                    color: AppColors.brandNeutral600,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  B3Regular(
                    text: 'Add google_maps_flutter package\nto enable map location picking',
                    color: AppColors.brandNeutral500,
                    textAlign: TextAlign.center,
                  ),
                  
                  const SizedBox(height: AppSpacing.lg),
                  
                  // Demo location selection
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.brandNeutral300),
                    ),
                    child: Column(
                      children: [
                        B3Bold(
                          text: 'Demo Mode',
                          color: AppColors.brandNeutral700,
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        B4Regular(
                          text: 'Select a demo location:',
                          color: AppColors.brandNeutral600,
                        ),
                        const SizedBox(height: AppSpacing.md),
                        
                        // Demo locations
                        _buildDemoLocationButton(
                          'Bangalore Office',
                          12.9716, 77.5946,
                          'Koramangala, Bangalore, Karnataka',
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        _buildDemoLocationButton(
                          'Mumbai Office',
                          19.0760, 72.8777,
                          'Bandra West, Mumbai, Maharashtra',
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        _buildDemoLocationButton(
                          'Delhi Office',
                          28.6139, 77.2090,
                          'Connaught Place, New Delhi',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Selected location info
          if (_selectedLat != null && _selectedLng != null) ...[
            const SizedBox(height: AppSpacing.lg),
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.brandPrimary50,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.brandPrimary200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.location_on,
                        size: 16,
                        color: AppColors.brandPrimary600,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      B3Bold(
                        text: 'Selected Location',
                        color: AppColors.brandPrimary700,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  if (_selectedAddress != null)
                    B4Regular(
                      text: _selectedAddress!,
                      color: AppColors.brandNeutral700,
                    ),
                  B4Regular(
                    text: 'Coordinates: ${_selectedLat!.toStringAsFixed(6)}, ${_selectedLng!.toStringAsFixed(6)}',
                    color: AppColors.brandNeutral600,
                  ),
                ],
              ),
            ),
          ],
          
          const SizedBox(height: AppSpacing.xl),
          
          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: widget.onCancel,
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: SolidButtonWidget(
                  label: 'Use This Location',
                  onPressed: (_selectedLat != null && _selectedLng != null) 
                      ? () => widget.onLocationSelected?.call(
                          _selectedLat!,
                          _selectedLng!,
                          _selectedAddress,
                        )
                      : null,
                  isLoading: false,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDemoLocationButton(String name, double lat, double lng, String address) {
    final isSelected = _selectedLat == lat && _selectedLng == lng;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedLat = lat;
          _selectedLng = lng;
          _selectedAddress = address;
        });
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.brandPrimary50 : Colors.white,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isSelected 
                ? AppColors.brandPrimary600 
                : AppColors.brandNeutral300,
          ),
        ),
        child: Row(
          children: [
            Icon(
              Icons.location_on,
              size: 16,
              color: isSelected 
                  ? AppColors.brandPrimary600 
                  : AppColors.brandNeutral500,
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  B4Bold(
                    text: name,
                    color: isSelected 
                        ? AppColors.brandPrimary700 
                        : AppColors.brandNeutral700,
                  ),
                  B4Regular(
                    text: address,
                    color: AppColors.brandNeutral600,
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(
                Icons.check_circle,
                size: 18,
                color: AppColors.brandPrimary600,
              ),
          ],
        ),
      ),
    );
  }
}