import 'package:flutter/material.dart';
import '../../../../../../../../../commons/constants/app_colors.dart';
import '../../../../../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../../../../../commons/components/button/app/views/solid_button_widget.dart';
import '../../../../../../../../../commons/components/textfield/app/views/numeric_textfield_widget.dart';

class RechargeBottomSheet extends StatefulWidget {
  final Function(double) onRecharge;

  const RechargeBottomSheet({
    super.key,
    required this.onRecharge,
  });

  @override
  State<RechargeBottomSheet> createState() => _RechargeBottomSheetState();
}

class _RechargeBottomSheetState extends State<RechargeBottomSheet> {
  final List<double> _quickAmounts = [100, 200, 500, 1000, 2000, 5000];
  double _selectedAmount = 0;
  String _manualAmount = '';
  bool _isLoading = false;
  bool _showMinimumError = false;
  final GlobalKey<NumericTextfieldWidgetState> _textFieldKey = GlobalKey();

  // Main app color like navigation bottom
  static const Color mainAppColor = Color(0xFF055c3a);

  void _selectQuickAmount(double amount) {
    setState(() {
      _selectedAmount = amount;
      _manualAmount = amount.toStringAsFixed(0);
      _showMinimumError = false; // Clear error when selecting quick amount
    });
    // Update the text field controller directly
    _textFieldKey.currentState?.controller.text = amount.toStringAsFixed(0);
  }

  void _onAmountChanged(String value) {
    final amount = double.tryParse(value) ?? 0;
    setState(() {
      _selectedAmount = amount;
      _manualAmount = value;
      _showMinimumError = value.isNotEmpty && amount > 0 && amount < 100;
    });
  }

  void _onRecharge() {
    if (_selectedAmount < 100) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Minimum recharge amount is ₹100'),
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    widget.onRecharge(_selectedAmount);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(top: 12),
            decoration: BoxDecoration(
              color: AppColors.brandNeutral300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                H3Bold(
                  text: 'Recharge Wallet',
                  color: AppColors.brandNeutral800,
                ),
                const SizedBox(height: 8),
                B3Regular(
                  text: 'Select or enter amount to add to your wallet',
                  color: AppColors.brandNeutral500,
                ),
                const SizedBox(height: 24),
                B3Medium(
                  text: 'Quick Select',
                  color: AppColors.brandNeutral700,
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  children: _quickAmounts.map((amount) {
                    final isSelected = _selectedAmount == amount;
                    return InkWell(
                      onTap: () => _selectQuickAmount(amount),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? mainAppColor.withValues(alpha: 0.1)
                              : AppColors.brandNeutral50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected
                                ? mainAppColor
                                : AppColors.brandNeutral200,
                          ),
                        ),
                        child: B3Medium(
                          text: '₹${amount.toStringAsFixed(0)}',
                          color: isSelected
                              ? mainAppColor
                              : AppColors.brandNeutral600,
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),
                B3Medium(
                  text: 'Enter Amount',
                  color: AppColors.brandNeutral700,
                ),
                const SizedBox(height: 12),
                NumericTextfieldWidget(
                  key: _textFieldKey,
                  hintText: 'Enter amount',
                  isDecimalAllowed: true,
                  onTextChanged: _onAmountChanged,
                  initialText: _manualAmount,
                ),
                if (_showMinimumError) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(
                        Icons.error_outline,
                        color: AppColors.stateRed400,
                        size: 16,
                      ),
                      const SizedBox(width: 8),
                      B4Medium(
                        text: 'Minimum ₹100 is required',
                        color: AppColors.stateRed400,
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: SolidButtonWidget(
                    label: 'Proceed to Payment',
                    isLoading: _isLoading,
                    isEnabled: _selectedAmount >= 100 && !_isLoading,
                    onPressed: _onRecharge,
                  ),
                ),
                const SizedBox(
                    height: 54), // Reduced from 20 to move button higher
              ],
            ),
          ),
        ],
      ),
    );
  }
}
