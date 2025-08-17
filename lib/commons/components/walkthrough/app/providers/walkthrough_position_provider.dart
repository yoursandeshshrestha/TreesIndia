import 'package:trees_india/commons/components/walkthrough/app/viewmodels/walkthrough_position_state.dart';
import 'package:trees_india/commons/components/walkthrough/app/viewmodels/walkthrough_position_viewmodel.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final walkthroughPositionProvider = StateNotifierProvider<
    WalkthroughPositionViewModel, WalkthroughPositionState>(
  (ref) => WalkthroughPositionViewModel(),
)..registerProvider();
