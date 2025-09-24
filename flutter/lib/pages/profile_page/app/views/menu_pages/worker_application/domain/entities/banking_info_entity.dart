class BankingInfoEntity {
  final String accountHolderName;
  final String accountNumber;
  final String ifscCode;
  final String bankName;

  const BankingInfoEntity({
    required this.accountHolderName,
    required this.accountNumber,
    required this.ifscCode,
    required this.bankName,
  });

  BankingInfoEntity copyWith({
    String? accountHolderName,
    String? accountNumber,
    String? ifscCode,
    String? bankName,
  }) {
    return BankingInfoEntity(
      accountHolderName: accountHolderName ?? this.accountHolderName,
      accountNumber: accountNumber ?? this.accountNumber,
      ifscCode: ifscCode ?? this.ifscCode,
      bankName: bankName ?? this.bankName,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'accountHolderName': accountHolderName,
      'accountNumber': accountNumber,
      'ifscCode': ifscCode,
      'bankName': bankName,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is BankingInfoEntity &&
      other.accountHolderName == accountHolderName &&
      other.accountNumber == accountNumber &&
      other.ifscCode == ifscCode &&
      other.bankName == bankName;
  }

  @override
  int get hashCode {
    return accountHolderName.hashCode ^
      accountNumber.hashCode ^
      ifscCode.hashCode ^
      bankName.hashCode;
  }

  @override
  String toString() {
    return 'BankingInfoEntity(accountHolderName: $accountHolderName, accountNumber: $accountNumber, ifscCode: $ifscCode, bankName: $bankName)';
  }
}