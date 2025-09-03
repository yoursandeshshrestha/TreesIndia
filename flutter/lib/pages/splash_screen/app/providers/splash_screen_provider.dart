import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/pages/splash_screen/app/viewmodels/splash_screen_state.dart';

class SplashScreenNotifier extends StateNotifier<SplashScreenState> {
  SplashScreenNotifier() : super(const SplashScreenState());

  void updateCurrentPage(int page) {
    state = state.copyWith(currentPage: page);
  }

  void setLoading(bool loading) {
    state = state.copyWith(isLoading: loading);
  }

  void navigateToLogin(BuildContext context) {
    context.go('/login');
  }
}

final splashScreenProvider =
    StateNotifierProvider<SplashScreenNotifier, SplashScreenState>((ref) {
  return SplashScreenNotifier();
});
