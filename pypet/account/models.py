from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户管理表'
    email = models.EmailField(verbose_name="邮箱地址",blank=True)
    phone_number = models.CharField(max_length=11, verbose_name="手机号码")
    name = models.CharField(max_length=20, verbose_name="真名", default="")
    grade = models.CharField(max_length=6, verbose_name="年级", default="")
    major_class = models.CharField(max_length=20,verbose_name="专业+班级",default='',blank=True)
    role = models.CharField(max_length=6, verbose_name="角色", default="")
    token = models.CharField(max_length=8, verbose_name="token", default="")
    token_expires = models.DateTimeField(verbose_name="token过期时间", auto_now=True)
    call_times = models.IntegerField(verbose_name="调用AI次数",default=0)
    def __str__(self):
        return self.name  # 确保返回的是字符串类型  否则会报错