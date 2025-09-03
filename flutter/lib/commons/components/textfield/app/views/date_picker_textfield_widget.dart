import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DatePickerTextField extends StatefulWidget {
  final String hintText;
  final String? initialText;
  final Function(String) onTextChanged;
  final bool hasClearTextButton;
  final bool enabled;
  final String dateFormat;

  const DatePickerTextField({
    super.key,
    required this.hintText,
    this.initialText,
    required this.onTextChanged,
    this.hasClearTextButton = true,
    this.enabled = true,
    this.dateFormat = 'dd-MM-yyyy',
  });

  @override
  State<DatePickerTextField> createState() => _DatePickerTextFieldState();
}

class _DatePickerTextFieldState extends State<DatePickerTextField> {
  late TextEditingController _controller;
  late DateFormat _formatter;

  @override
  void initState() {
    super.initState();
    _formatter = DateFormat(widget.dateFormat);
    _controller = TextEditingController(text: widget.initialText ?? '');
  }

  @override
  void didUpdateWidget(covariant DatePickerTextField oldWidget) {
    super.didUpdateWidget(oldWidget);
    _formatter = DateFormat(widget.dateFormat); // Update formatter if changed

    if (widget.initialText != oldWidget.initialText &&
        widget.initialText != _controller.text) {
      _controller.text = widget.initialText ?? '';
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    try {
      final DateTime? picked = await showDatePicker(
        context: context,
        initialDate: _tryParseDate(_controller.text) ?? DateTime.now(),
        firstDate: DateTime(1900),
        lastDate: DateTime(2100),
        builder: (context, child) {
          return Theme(
            data: Theme.of(context).copyWith(
              dialogTheme: DialogThemeData(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
            child: child!,
          );
        },
      );

      if (picked != null) {
        final formattedDate = _formatter.format(picked);
        _controller.text = formattedDate;
        widget.onTextChanged(formattedDate);
      }
    } catch (e) {
      // Handle date format or parsing issues silently or log them
    }
  }

  DateTime? _tryParseDate(String dateText) {
    try {
      return _formatter.parse(dateText);
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: TextField(
        controller: _controller,
        enabled: widget.enabled,
        style: const TextStyle(fontSize: 14),
        decoration: InputDecoration(
          hintText: widget.hintText,
          hintStyle: const TextStyle(fontSize: 14),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          suffixIcon: IconButton(
            icon: const Icon(Icons.calendar_today, size: 20),
            onPressed: widget.enabled ? () => _selectDate(context) : null,
            padding: const EdgeInsets.all(8),
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(width: 1),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: Colors.grey.shade400, width: 1),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide:
                BorderSide(color: Theme.of(context).primaryColor, width: 1.5),
          ),
        ),
        readOnly: true,
        onTap: widget.enabled ? () => _selectDate(context) : null,
      ),
    );
  }
}
