import uuid
from django.db import models

class User(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('LOCKED', 'Locked'),
        ('DELETED', 'Deleted'),
    ]

    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'  # 테이블 이름을 'users'로 지정

    def __str__(self):
        return self.email
