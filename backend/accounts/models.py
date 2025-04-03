import uuid
import random
from django.db import models
from users.models import User

def generate_account_number():
    from accounts.models import Account  # 함수 내부에서 import (순환 참조 방지)

    while True:
        number = ''.join(str(random.randint(0, 9)) for _ in range(13))
        if not Account.objects.filter(account_number=number).exists():  # 중복 체크
            return number

class Account(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed')
    ]

    account_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # UUID를 PK로 설정
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, to_field='user_id', db_column='user_id')  # FK를 UUID로 저장
    nickname = models.CharField(max_length=20)  # 계좌 별명
    balance = models.IntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'accounts'

    def __str__(self):
        return f'Account {self.account_id} ({self.user_id})'
    