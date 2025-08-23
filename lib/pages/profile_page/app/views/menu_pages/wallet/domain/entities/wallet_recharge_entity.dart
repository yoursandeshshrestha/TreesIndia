class WalletRechargeEntity {
  final double amount;
  final String paymentMethod;
  final String? referenceId;

  const WalletRechargeEntity({
    required this.amount,
    required this.paymentMethod,
    this.referenceId,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WalletRechargeEntity &&
        other.amount == amount &&
        other.paymentMethod == paymentMethod &&
        other.referenceId == referenceId;
  }

  @override
  int get hashCode {
    return amount.hashCode ^ paymentMethod.hashCode ^ referenceId.hashCode;
  }

  @override
  String toString() {
    return 'WalletRechargeEntity(amount: $amount, paymentMethod: $paymentMethod, referenceId: $referenceId)';
  }
}

class WalletRechargeResponseEntity {
  final PaymentEntity payment;
  final PaymentOrderEntity paymentOrder;

  const WalletRechargeResponseEntity({
    required this.payment,
    required this.paymentOrder,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WalletRechargeResponseEntity &&
        other.payment == payment &&
        other.paymentOrder == paymentOrder;
  }

  @override
  int get hashCode => payment.hashCode ^ paymentOrder.hashCode;

  @override
  String toString() {
    return 'WalletRechargeResponseEntity(payment: $payment, paymentOrder: $paymentOrder)';
  }
}

class PaymentEntity {
  final int id;
  final String paymentReference;
  final int userId;
  final double amount;
  final String status;
  final String type;
  final String method;

  const PaymentEntity({
    required this.id,
    required this.paymentReference,
    required this.userId,
    required this.amount,
    required this.status,
    required this.type,
    required this.method,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is PaymentEntity &&
        other.id == id &&
        other.paymentReference == paymentReference &&
        other.userId == userId &&
        other.amount == amount &&
        other.status == status &&
        other.type == type &&
        other.method == method;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        paymentReference.hashCode ^
        userId.hashCode ^
        amount.hashCode ^
        status.hashCode ^
        type.hashCode ^
        method.hashCode;
  }

  @override
  String toString() {
    return 'PaymentEntity(id: $id, paymentReference: $paymentReference, userId: $userId, amount: $amount, status: $status, type: $type, method: $method)';
  }
}

class PaymentOrderEntity {
  final String id;
  final int amount;
  final String currency;
  final String keyId;
  final String receipt;

  const PaymentOrderEntity({
    required this.id,
    required this.amount,
    required this.currency,
    required this.keyId,
    required this.receipt,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is PaymentOrderEntity &&
        other.id == id &&
        other.amount == amount &&
        other.currency == currency &&
        other.keyId == keyId &&
        other.receipt == receipt;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        amount.hashCode ^
        currency.hashCode ^
        keyId.hashCode ^
        receipt.hashCode;
  }

  @override
  String toString() {
    return 'PaymentOrderEntity(id: $id, amount: $amount, currency: $currency, keyId: $keyId, receipt: $receipt)';
  }
}
