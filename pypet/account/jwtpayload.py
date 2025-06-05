from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
User = get_user_model()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)
        # 添加额外信息，例如用户名
        token['username'] = user.username
        # 不想包含user_id，可以不添加下面这行
        # token['user_id'] = user.id
        return token