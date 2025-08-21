// import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
// import 'package:trees_india/commons/components/textfield/app/viewmodels/base_textfield_viewmodel.dart';
// import 'package:trees_india/commons/components/textfield/app/viewmodels/password_textfield_multi_validation_viewmodel.dart';
// import 'package:trees_india/commons/components/textfield/domain/entities/textfield_entity.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter/services.dart';

// import 'base_textfield_widget.dart';

// class PasswordTextFieldMultiValidationWidget extends BaseTextfieldWidget {
//   final String initialText;
//   final IconData? leadingIcon;
//   final IconData? trailingIcon;
//   final bool showVisibilityToggle;
//   final BuildContext? context;

//   PasswordTextFieldMultiValidationWidget({
//     super.key,
//     this.initialText = '',
//     this.leadingIcon,
//     this.trailingIcon,
//     this.showVisibilityToggle = true,
//     super.enabled,
//     super.readOnly,
//     required super.onTextChanged,
//     this.context,
//   }) : super(hintText: 'Password');
//   @override
//   PasswordTextFieldMultiValidationWidgetState createState() =>
//       PasswordTextFieldMultiValidationWidgetState();
// }

// class PasswordTextFieldMultiValidationWidgetState
//     extends BaseTextfieldWidgetState<PasswordTextFieldMultiValidationWidget> {
//   @override
//   BaseTextFieldViewModel createViewModel() {
//     return PasswordTextFieldMultiValidationViewModel(
//       TextFieldEntity(
//         text: widget.initialText,
//         obscureText: true,
//         leadingIcon: widget.leadingIcon,
//         trailingIcon: widget.showVisibilityToggle
//             ? Icons.visibility_off
//             : widget.trailingIcon,
//         inputFormatters: [
//           LengthLimitingTextInputFormatter(15),
//         ],
//       ),
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     return ValueListenableBuilder<TextFieldEntity>(
//       valueListenable: viewModel,
//       builder: (context, state, child) {
//         if (controller.text != state.text) {
//           controller.text = state.text;
//           controller.selection = TextSelection.fromPosition(
//             TextPosition(offset: controller.text.length),
//           );
//         }

//         final validationMessages = viewModel.validateText(state, context);

//         return Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             buildTextField(state, validationMessages, context),
//             const SizedBox(height: 12.0),
//             if (state.text.isNotEmpty)
//               buildPasswordStrengthIndicator(state, context),
//             if (state.text.isNotEmpty) const SizedBox(height: 20.0),
//             if (validationMessages.isNotEmpty && state.text.isNotEmpty)
//               buildValidationMessages(validationMessages),
//           ],
//         );
//       },
//     );
//   }

//   Widget buildPasswordStrengthIndicator(
//       TextFieldEntity state, BuildContext context) {
//     final passwordViewModel =
//         viewModel as PasswordTextFieldMultiValidationViewModel;
//     final strength = passwordViewModel.calculateStrength(state, context);
//     final strengthText = passwordViewModel.getStrengthText(context, strength);
//     final strengthTextColor = passwordViewModel.getStrengthTextColor(strength);

//     return Column(
//       crossAxisAlignment: CrossAxisAlignment.start,
//       children: [
//         Row(
//           mainAxisAlignment: MainAxisAlignment.spaceBetween,
//           children: [
//             B4Medium(text: 'Password strength'),
//             if (strengthText.isNotEmpty)
//               B4Medium(
//                 text: strengthText,
//                 color: strengthTextColor,
//               ),
//           ],
//         ),
//         const SizedBox(height: 8.0),
//         if (strengthText.isNotEmpty)
//           SizedBox(
//             height: 4.0,
//             child: Row(
//               children: [
//                 // First segment
//                 Expanded(
//                   child: Container(
//                     decoration: BoxDecoration(
//                       borderRadius: const BorderRadius.horizontal(
//                         left: Radius.circular(2.0),
//                         right: Radius.circular(2.0),
//                       ),
//                       color: passwordViewModel.getStrengthSegmentColor(
//                           strength, 0),
//                     ),
//                     margin: const EdgeInsets.only(right: 3),
//                   ),
//                 ),
//                 // Second segment
//                 Expanded(
//                   child: Container(
//                     decoration: BoxDecoration(
//                       borderRadius: const BorderRadius.horizontal(
//                         left: Radius.circular(2.0),
//                         right: Radius.circular(2.0),
//                       ),
//                       color: passwordViewModel.getStrengthSegmentColor(
//                           strength, 1),
//                     ),
//                     margin: const EdgeInsets.symmetric(horizontal: 3),
//                   ),
//                 ),
//                 // Third segment
//                 Expanded(
//                   child: Container(
//                     decoration: BoxDecoration(
//                       borderRadius: const BorderRadius.horizontal(
//                         left: Radius.circular(2.0),
//                         right: Radius.circular(2.0),
//                       ),
//                       color: passwordViewModel.getStrengthSegmentColor(
//                           strength, 2),
//                     ),
//                     margin: const EdgeInsets.symmetric(horizontal: 3),
//                   ),
//                 ),
//                 // Fourth segment
//                 Expanded(
//                   child: Container(
//                     decoration: BoxDecoration(
//                       borderRadius: const BorderRadius.horizontal(
//                         left: Radius.circular(2.0),
//                         right: Radius.circular(2.0),
//                       ),
//                       color: passwordViewModel.getStrengthSegmentColor(
//                           strength, 3),
//                     ),
//                     margin: const EdgeInsets.only(left: 3),
//                   ),
//                 ),
//               ],
//             ),
//           ),
//       ],
//     );
//   }

//   @override
//   Widget? buildTrailingIcon(TextFieldEntity state, BuildContext context) {
//     {
//       if (viewModel is PasswordTextFieldMultiValidationViewModel &&
//           (viewModel as PasswordTextFieldMultiValidationViewModel)
//               .showVisibilityToggle) {
//         return Padding(
//           padding: const EdgeInsetsDirectional.only(end: 16.0),
//           child: GestureDetector(
//             onTap: viewModel.toggleObscureText,
//             child: SizedBox(
//               width: 18.0,
//               height: 18.0,
//               child: Icon(
//                 state.obscureText ? Icons.visibility_off : Icons.visibility,
//                 size: 18.0,
//               ),
//             ),
//           ),
//         );
//       } else if (state.trailingIcon != null) {
//         return Padding(
//           padding: const EdgeInsetsDirectional.only(end: 16.0),
//           child: GestureDetector(
//             onTap: state.obscureText ? viewModel.toggleObscureText : null,
//             child: SizedBox(
//               width: 18.0,
//               height: 18.0,
//               child: Icon(
//                 state.trailingIcon!,
//                 size: 18.0,
//               ),
//             ),
//           ),
//         );
//       }
//     }
//     return null;
//   }
// }
