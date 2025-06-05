from datetime import timedelta
# from account.serializers import MyTokenObtainPairSerializer

# 自定义参数
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    # "TOKEN_OBTAIN_SERIALIZER": MyTokenObtainPairSerializer,
    "TOKEN_OBTAIN_SERIALIZER":'account.jwtpayload.MyTokenObtainPairSerializer',
}

