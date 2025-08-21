enum HeadingType { h1, h2, h3, h4 }

enum BodyType { b1, b2, b3, b4 }

enum FontWeightType { bold, medium, regular }

enum TextFieldState { defaultState, active, disabled, error, success }

enum LocationStatus {
  initial, // When first starting up
  serviceDisabled, // Location service is disabled on the device
  permissionDenied, // User denied permission
  permissionDeniedForever, // User denied permission permanently
  available, // Location is available and being tracked
}

enum CustomErrorType { network, auth, generic, timeout, noData }

enum PositionAlignment { start, end, defaultPosition }
