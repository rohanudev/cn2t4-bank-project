import uuid
from django.db import models
from accounts.models import Account


class Transaction(models.Model):
    TRANSACTION_CHOICES = [
        ('DEPOSIT', 'Deposit'),
        ('WITHDRAWAL', 'Withdrawal'),
        ('TRANSFER', 'Transfer')
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed')
    ]

    transaction_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='sent_transactions', null=True, blank=True)
    to_account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='received_transactions', null=True, blank=True)
    amount = models.IntegerField()
    balance_after = models.IntegerField(default=0)
    type = models.CharField(max_length=12, choices=TRANSACTION_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    memo = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'transactions'

    def __str__(self):
        return f'{self.type} : {self.amount} (from {self.sender_account} to {self.receiver_account})'
