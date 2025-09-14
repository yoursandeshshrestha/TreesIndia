import 'package:flutter/material.dart';

class MessageInput extends StatefulWidget {
  final Function(String) onSendMessage;
  final bool isEnabled;

  const MessageInput({
    super.key,
    required this.onSendMessage,
    this.isEnabled = true,
  });

  @override
  State<MessageInput> createState() => _MessageInputState();
}

class _MessageInputState extends State<MessageInput> {
  final TextEditingController _textController = TextEditingController();
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    _textController.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    setState(() {
      _hasText = _textController.text.trim().isNotEmpty;
    });
  }

  void _sendMessage() {
    final text = _textController.text.trim();
    if (text.isNotEmpty && widget.isEnabled) {
      widget.onSendMessage(text);
      _textController.clear();
      setState(() {
        _hasText = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            offset: const Offset(0, -2),
            blurRadius: 4,
            color: Colors.black.withValues(alpha: 0.1),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(24),
                ),
                child: TextField(
                  controller: _textController,
                  enabled: widget.isEnabled,
                  decoration: const InputDecoration(
                    hintText: 'Type a message...',
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                  ),
                  maxLines: null,
                  textCapitalization: TextCapitalization.sentences,
                  onSubmitted: (_) => _sendMessage(),
                  onTapOutside: (_) => FocusScope.of(context).unfocus(),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Material(
              color: _hasText && widget.isEnabled
                  ? Theme.of(context).primaryColor
                  : Colors.grey[300],
              borderRadius: BorderRadius.circular(24),
              child: InkWell(
                onTap: _hasText && widget.isEnabled ? _sendMessage : null,
                borderRadius: BorderRadius.circular(24),
                child: SizedBox(
                  width: 48,
                  height: 48,
                  child: Icon(
                    Icons.send,
                    color: _hasText && widget.isEnabled
                        ? Colors.white
                        : Colors.grey[500],
                    size: 20,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
