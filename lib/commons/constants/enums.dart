enum HeadingType { h1, h2, h3, h4 }

enum BodyType { b1, b2, b3, b4 }

enum FontWeightType { bold, medium, regular }

enum TextFieldState { defaultState, active, disabled, error, success }

enum WorkflowType { series, parallel }

extension WorkflowTypeExtension on WorkflowType {
  int get value {
    switch (this) {
      case WorkflowType.series:
        return 1;
      case WorkflowType.parallel:
        return 2;
    }
  }

  static WorkflowType fromValue(int value) {
    switch (value) {
      case 1:
        return WorkflowType.series;
      case 2:
        return WorkflowType.parallel;
      default:
        return WorkflowType.series;
    }
  }
}

//ENUM for SignerType / ParticipantRole

enum ParticipantRole { signer, reviewer, ccRecipient }

extension ParticipantRoleExtension on ParticipantRole {
  int get value {
    switch (this) {
      case ParticipantRole.signer:
        return 1;
      case ParticipantRole.reviewer:
        return 2;
      case ParticipantRole.ccRecipient:
        return 3;
    }
  }

  static ParticipantRole fromValue(int value) {
    switch (value) {
      case 1:
        return ParticipantRole.signer;
      case 2:
        return ParticipantRole.reviewer;
      case 3:
        return ParticipantRole.ccRecipient;
      default:
        throw ArgumentError("Invalid value for SignerType: $value");
    }
  }
}

enum ParticipantOrGroupType { participant, group }

enum PositionAlignment { start, end, defaultPosition }

enum EStampingModes { online, offline }

enum CustomErrorType { network, auth, generic, timeout, noData }

enum PasswordStrength { veryWeak, weak, medium, strong, none }

enum SignatureType { eSignature, v2, v3,
//  PeruriSignature,
 }

enum PlaceholderType {
  signature,
  name,
  designation,
  department,
  mobile,
  email,
  idNumber,
  textbox,
  checkbox,
  radio,
  initials,
  photo,
  stamp,
  qrCode,
  qrDisclaimer,
}

extension PlaceholderTypeExtension on PlaceholderType {
  int get value {
    switch (this) {
      case PlaceholderType.textbox:
        return 1;
      case PlaceholderType.checkbox:
        return 2;
      case PlaceholderType.radio:
        return 3;
      case PlaceholderType.signature:
        return 4;
      case PlaceholderType.name:
      case PlaceholderType.designation:
      case PlaceholderType.department:
      case PlaceholderType.mobile:
      case PlaceholderType.email:
      case PlaceholderType.idNumber:
        return 5;
      case PlaceholderType.qrCode:
        return 6;
      case PlaceholderType.qrDisclaimer:
        return 7;
      case PlaceholderType.initials:
        return 8;
      case PlaceholderType.photo:
        return 11;
      case PlaceholderType.stamp:
        return 12;
    }
  }

  static PlaceholderType fromValue(int value) {
    switch (value) {
      case 1:
        return PlaceholderType.textbox;
      case 2:
        return PlaceholderType.checkbox;
      case 3:
        return PlaceholderType.radio;
      case 4:
        return PlaceholderType.signature;
      case 6:
        return PlaceholderType.qrCode;
      case 7:
        return PlaceholderType.qrDisclaimer;
      case 8:
        return PlaceholderType.initials;
      case 11:
        return PlaceholderType.photo;
      case 12:
        return PlaceholderType.stamp;
      default:
        throw ArgumentError("Invalid value for PlaceholderType: $value");
    }
  }

  static PlaceholderType getControlType(int controlId, String? placeHolder) {
    if (controlId == 5) {
      // For controlId 5, determine type based on placeholder value
      switch (placeHolder) {
        case 'Name':
          return PlaceholderType.name;
        case 'Designation':
          return PlaceholderType.designation;
        case 'Department':
          return PlaceholderType.department;
        case 'Mobile Number':
          return PlaceholderType.mobile;
        case 'Email ID':
          return PlaceholderType.email;
        case 'Identification No':
          return PlaceholderType.idNumber;
        default:
          return PlaceholderType.name;
      }
    } else {
      return fromValue(controlId);
    }
  }
}

enum AlignmentType { left, right, center }

extension AlignmentTypeExtension on AlignmentType {
  String get value {
    switch (this) {
      case AlignmentType.left:
        return 'Left';
      case AlignmentType.right:
        return 'Right';
      case AlignmentType.center:
        return 'Center';
    }
  }

  static AlignmentType fromValue(String value) {
    switch (value) {
      case 'Left':
        return AlignmentType.left;
      case 'Right':
        return AlignmentType.right;
      case 'Center':
        return AlignmentType.center;
      default:
        return AlignmentType.left;
    }
  }
}

enum SigningStatus {
  notNeeded,
  pending,
  processing,
  signed,
  
}

enum FlowType { initiationFlow, signingFlow, templateFlow, bulkSignFlow }

enum EMailPreference { primary, secondary }

enum InitiationType {
  initiation,
  signing,
  reviewing,
  initiationAndSigning,
  initiationAndReviewing
}

enum LocationStatus {
  initial, // When first starting up
  serviceDisabled, // Location service is disabled on the device
  permissionDenied, // User denied permission
  permissionDeniedForever, // User denied permission permanently
  available, // Location is available and being tracked
}

enum GeoFenceStatus {
  initializing,
  noGeofenceRequired,
  permissionNeeded,
  serviceDisabled,
  locationUnavailable,
  withinGeofence,
  outsideGeofence,
}
