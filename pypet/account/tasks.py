from celery import shared_task
from django.utils import timezone
from account.models import CustomUser

@shared_task
def reset_call_times():
    """每天午夜重置所有用户的 call_times 为 0"""
    CustomUser.objects.update(call_times=0)
    print(f"{timezone.now()} | 已重置所有用户的 call_times")