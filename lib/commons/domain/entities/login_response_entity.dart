class LoginResponseEntity {
  final String? authToken;
  final bool? isPasswordUpdated;
  final bool? isPasswordCompliant;

  LoginResponseEntity(
      {this.authToken, this.isPasswordUpdated, this.isPasswordCompliant});
  @override
  String toString() {
    return 'LoginResponseEntity(authToken: $authToken, isPasswordUpdated: $isPasswordUpdated, isPasswordComplaint: $isPasswordCompliant)';
  }

  LoginResponseEntity copyWith(
      {String? authToken, bool? isPasswordUpdated, bool? isPasswordComplaint}) {
    return LoginResponseEntity(
        authToken: authToken ?? this.authToken,
        isPasswordUpdated: isPasswordUpdated ?? this.isPasswordUpdated,
        isPasswordCompliant: isPasswordComplaint ?? isPasswordCompliant);
  }

  factory LoginResponseEntity.fromJson(Map<String, dynamic> json) {
    return LoginResponseEntity(
        authToken: json['authToken'],
        isPasswordUpdated: json['isPasswordUpdated'],
        isPasswordCompliant: json['isPasswordCompliant']);
  }
  Map<String, dynamic> toJson() {
    return {
      'authToken': authToken,
      'isPasswordUpdated': isPasswordUpdated,
      'isPasswordCompliant': isPasswordCompliant
    };
  }
  // factory LoginResponseEntity.fromJson(Map<String, dynamic> json){
  //   return LoginResponseEntity(
  //       authToken: json['authToken'],
  //       isPasswordUpdated: json['isPasswordUpdated'],
  //       isPasswordCompliant: json['isPasswordCompliant']
  //   );
  // }
}
