import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class CircularSelector extends StatelessWidget {
  final List<int> options;
  final int? selectedValue;
  final Function(int) onSelected;
  final String label;
  final bool allowCustomInput;

  const CircularSelector({
    super.key,
    required this.options,
    required this.selectedValue,
    required this.onSelected,
    required this.label,
    this.allowCustomInput = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.brandNeutral800,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),

        Wrap(
          spacing: AppSpacing.sm,
          runSpacing: AppSpacing.sm,
          children: [
            // Predefined options
            ...options.map((option) => _CircularOption(
              value: option,
              isSelected: selectedValue == option,
              onTap: () => onSelected(option),
            )),

            // Custom input option
            if (allowCustomInput)
              _CustomInputOption(
                isSelected: selectedValue != null && !options.contains(selectedValue),
                selectedValue: selectedValue,
                onSelected: onSelected,
              ),
          ],
        ),
      ],
    );
  }
}

class _CircularOption extends StatelessWidget {
  final int value;
  final bool isSelected;
  final VoidCallback onTap;

  const _CircularOption({
    required this.value,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: isSelected ? AppColors.stateGreen500 : AppColors.white,
          border: Border.all(
            color: isSelected ? AppColors.stateGreen500 : AppColors.brandNeutral300,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(24),
        ),
        child: Center(
          child: Text(
            value.toString(),
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: isSelected ? AppColors.white : AppColors.brandNeutral700,
            ),
          ),
        ),
      ),
    );
  }
}

class _CustomInputOption extends StatefulWidget {
  final bool isSelected;
  final int? selectedValue;
  final Function(int) onSelected;

  const _CustomInputOption({
    required this.isSelected,
    required this.selectedValue,
    required this.onSelected,
  });

  @override
  State<_CustomInputOption> createState() => _CustomInputOptionState();
}

class _CustomInputOptionState extends State<_CustomInputOption> {
  final TextEditingController _controller = TextEditingController();
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    if (widget.isSelected && widget.selectedValue != null) {
      _controller.text = widget.selectedValue.toString();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTap() {
    if (!_isEditing) {
      setState(() {
        _isEditing = true;
      });
    }
  }

  void _handleSubmit() {
    final value = int.tryParse(_controller.text);
    if (value != null && value > 0) {
      widget.onSelected(value);
      setState(() {
        _isEditing = false;
      });
    } else {
      // Clear invalid input
      _controller.clear();
      setState(() {
        _isEditing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isEditing) {
      return Container(
        width: 60,
        height: 48,
        decoration: BoxDecoration(
          color: AppColors.white,
          border: Border.all(
            color: AppColors.stateGreen500,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(24),
        ),
        child: TextField(
          controller: _controller,
          autofocus: true,
          keyboardType: TextInputType.number,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.brandNeutral700,
          ),
          decoration: const InputDecoration(
            border: InputBorder.none,
            contentPadding: EdgeInsets.zero,
          ),
          onSubmitted: (_) => _handleSubmit(),
          onTapOutside: (_) => _handleSubmit(),
        ),
      );
    }

    return GestureDetector(
      onTap: _handleTap,
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: widget.isSelected ? AppColors.stateGreen500 : AppColors.white,
          border: Border.all(
            color: widget.isSelected ? AppColors.stateGreen500 : AppColors.brandNeutral300,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(24),
        ),
        child: Center(
          child: widget.isSelected && widget.selectedValue != null
              ? Text(
                  widget.selectedValue.toString(),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.white,
                  ),
                )
              : const Icon(
                  Icons.add,
                  size: 20,
                  color: AppColors.brandNeutral500,
                ),
        ),
      ),
    );
  }
}