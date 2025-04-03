import uuid
import random
from django.db import models
from users.models import User

class Account(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed')
    ]

    account_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account_number = models.CharField(max_length=20, unique=True, blank=True)  # default 제거, blank=True 추가
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts')  
    nickname = models.CharField(max_length=20, null=True, blank=True)  
    balance = models.IntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'accounts'

    def save(self, *args, **kwargs):
        if not self.account_number:  # 값이 없을 때만 생성
            self.account_number = self.generate_unique_account_number()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_unique_account_number():
        while True:
            number = ''.join(str(random.randint(0, 9)) for _ in range(13))
            if not Account.objects.filter(account_number=number).exists():
                return number

    def __str__(self):
        return f'Account {self.account_number} ({self.user.user_id}) - {self.nickname or "No Nickname"}'
