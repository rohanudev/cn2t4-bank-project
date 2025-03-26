# transactions/models.py
from django.db import models
from accounts.models import Account
import uuid

class Transaction(models.Model):
    transaction_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender_account = models.ForeignKey(Account, related_name='sent_transactions', on_delete=models.CASCADE)
    receiver_account = models.ForeignKey(Account, related_name='received_transactions', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=18, decimal_places=2)
    status = models.CharField(max_length=50, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transactions'  # 테이블 이름을 'transactions'로 지정

    def __str__(self):
        return str(self.transaction_id)
