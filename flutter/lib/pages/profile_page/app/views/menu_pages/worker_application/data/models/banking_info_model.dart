import '../../domain/entities/banking_info_entity.dart';

class BankingInfoModel {
  final String accountHolderName;
  final String accountNumber;
  final String ifscCode;
  final String bankName;

  const BankingInfoModel({
    required this.accountHolderName,
    required this.accountNumber,
    required this.ifscCode,
    required this.bankName,
  });

  factory BankingInfoModel.fromJson(Map<String, dynamic> json) {
    return BankingInfoModel(
      accountHolderName: json['accountHolderName'] ?? '',
      accountNumber: json['accountNumber'] ?? '',
      ifscCode: json['ifscCode'] ?? '',
      bankName: json['bankName'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accountHolderName': accountHolderName,
      'accountNumber': accountNumber,
      'ifscCode': ifscCode,
      'bankName': bankName,
    };
  }

  BankingInfoEntity toEntity() {
    return BankingInfoEntity(
      accountHolderName: accountHolderName,
      accountNumber: accountNumber,
      ifscCode: ifscCode,
      bankName: bankName,
    );
  }

  factory BankingInfoModel.fromEntity(BankingInfoEntity entity) {
    return BankingInfoModel(
      accountHolderName: entity.accountHolderName,
      accountNumber: entity.accountNumber,
      ifscCode: entity.ifscCode,
      bankName: entity.bankName,
    );
  }

  BankingInfoModel copyWith({
    String? accountHolderName,
    String? accountNumber,
    String? ifscCode,
    String? bankName,
  }) {
    return BankingInfoModel(
      accountHolderName: accountHolderName ?? this.accountHolderName,
      accountNumber: accountNumber ?? this.accountNumber,
      ifscCode: ifscCode ?? this.ifscCode,
      bankName: bankName ?? this.bankName,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is BankingInfoModel &&
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
    return 'BankingInfoModel(accountHolderName: $accountHolderName, accountNumber: $accountNumber, ifscCode: $ifscCode, bankName: $bankName)';
  }
}