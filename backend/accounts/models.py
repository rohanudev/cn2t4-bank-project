import uuid
import random
from django.db import models
from users.models import User

def generate_account_number():
    return ''.join([str(random.randint(0, 9)) for _ in range(13)])

class Account(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed')
    ]
    account_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account_number = models.CharField(max_length=20, unique=True, default=generate_account_number)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts')
    balance = models.IntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'accounts'

    def __str__(self):
        return f'Account {self.account_id} ({self.user.email})'
