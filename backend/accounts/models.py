# accounts/models.py
from django.db import models
from users.models import User
import uuid

class Account(models.Model):
    account_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    status = models.CharField(max_length=50, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'accounts'  # 테이블 이름을 'accounts'로 지정

    def __str__(self):
        return str(self.account_id)
