from .models import CustomUser
from .serializers import modifyPhoneSerializer, modifyEmailSerializer, modifyPasswordSerializer, UserLoginSerializer, UserSerializer, IsPasswordSerializer, ResetSerializer, modifyNameSerializer
from .serializers import modifyGenderSerializer, userInfoSerializer, CheckPhoneSerializer, CustomTokenObtainPairSerializer, getAllUserInfoSerializer
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.utils import timezone
from base import email_inf
from django.utils.timezone import now
from datetime import timedelta
from rest_framework_simplejwt.views import TokenObtainPairView
from Crypto.Cipher import AES
import base64
from django.contrib.auth.hashers import make_password
import dotenv
from drf_yasg import openapi
import os
from datetime import datetime
from math import ceil
from pathlib import Path
import json
from django.core.paginator import Paginator, EmptyPage, InvalidPage
from drf_yasg.utils import swagger_auto_schema
import string
import requests
import random

# 加密
BASE_DIR = Path(__file__).resolve().parent.parent
dotenv.load_dotenv(dotenv_path=BASE_DIR / ".env", verbose=True)
key = os.environ.get(
    'PYOTP_SECRET_KEY',
    '8\xae\xdbp|h\x80\n\xfd\x9f\xa1\xfb\xf6W$\xd6'
)

# API配置
DeepSeek_API_Key = os.environ.get("DeepSeek_API_Key")
DeepSeek_API_URL = "https://api.deepseek.com/v1/chat/completions"

# 实现多轮对话
# client = OpenAI(api_key="<DeepSeek API Key>", base_url="https://api.deepseek.com")

# # Round 1
# messages = [{"role": "user", "content": "What's the highest mountain in the world?"}]
# response = client.chat.completions.create(
#     model="deepseek-chat",
#     messages=messages
# )

# messages.append(response.choices[0].message)
# print(f"Messages Round 1: {messages}")

# # Round 2
# messages.append({"role": "user", "content": "What is the second?"})
# response = client.chat.completions.create(
#     model="deepseek-chat",
#     messages=messages
# )

# messages.append(response.choices[0].message)
# print(f"Messages Round 2: {messages}")


def call_deepseek_chat(prompt, model="deepseek-chat", temperature=0.3, max_tokens=2048):
    """
    调用DeepSeek聊天API
    
    参数:
    prompt : str - 用户输入的提示内容
    model : str - 使用的模型名称(默认: deepseek-chat)
    temperature : float - 生成多样性(默认: 0.3)
    max_tokens : int - 最大生成token数(默认: 2048)
    
    返回:
    str - API返回内容或错误信息
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DeepSeek_API_Key}"
    }
    
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    try:
        response = requests.post(
            DeepSeek_API_URL,
            headers=headers,
            data=json.dumps(payload)
        )
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"] if result.get("choices") else "Error: No response content"
        
    except requests.exceptions.HTTPError as http_err:
        return f"HTTP error ({http_err.response.status_code}): {http_err.response.text}"
    except Exception as err:
        return f"Request failed: {str(err)}"



class callDeepSeekApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        """
        处理用户请求的API端点
        请求体格式：{"prompt": "你的问题"}
        """
        try:
            # 参数验证
            if not (user_prompt := request.data.get("prompt")):
                return Response(
                    {"error": "Missing required field 'prompt'"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            username=request.user.username
            user=CustomUser.objects.get(username=username)
            user.call_times+=1
            if(user.call_times > 100):
                return Response(
                    {
                        "status": "Failure",
                        "content": "There have been too many inquiries today. Refresh count at 0 o'clock every day",
                        "model": "System"
                    },
                    status=status.HTTP_200_OK
                )

            user.save()  # 必须调用save()才能保存到数据库
            # 调用API函数
            api_response = call_deepseek_chat(user_prompt)  # 直接调用本地函数

            # 错误处理
            if any(keyword in api_response.lower() for keyword in ["error", "failed"]):
                return Response(
                    {"error": api_response},
                    status=status.HTTP_502_BAD_GATEWAY  # 更准确的错误状态码
                )

            # 成功响应
            return Response(
                {
                    "status": "success",
                    "content": api_response,
                    "model": "deepseek-chat"
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"Server error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class askUserlengthApi(APIView):
    permission_classes = [IsAdminUser]  # 只允许管理员访问

    @swagger_auto_schema(
        operation_summary='获取用户总数对应的总页数',
        responses={
            200: openapi.Response('成功的响应', openapi.Schema(type=openapi.TYPE_OBJECT,
                                                          properties={
                                                              'total_pages': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                          })
                                  )
        }
    )
    def get(self, request):
        # 获取所有用户的数量
        total_users = get_user_model().objects.count()
        # 计算记录/500，向上取整
        total_pages = ceil(total_users / 500)
        return Response({'total_pages': total_pages})


class GetAllUserInfoApi(APIView):
    permission_classes = [IsAdminUser]  # 只允许管理员访问

    @swagger_auto_schema(
        operation_summary='获取所有用户信息',
        manual_parameters=[
            openapi.Parameter(
                name='page',
                in_=openapi.IN_QUERY,
                description='页码参数，默认为1',
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            200: '所有用户的信息',
            400: '页码超出范围'
        }
    )
    def get(self, request):
        # 获取页码参数，默认为1
        page = int(request.GET.get('page', 1))
        # 每页显示的用户数量
        per_page = 500
        # 获取所有用户
        users = CustomUser.objects.all()
        # 创建分页器
        paginator = Paginator(users, per_page)

        try:
            # 获取指定页的用户列表
            users_page = paginator.page(page)
        except (EmptyPage, InvalidPage):
            # 如果页码超出范围，返回错误
            return Response({'error': 'Page out of range'}, status=status.HTTP_400_BAD_REQUEST)

        # 序列化用户数据
        serialized_users = []
        for user in users_page:
            user_data = {
                'id': user.id,
                'name': user.name,
                'username': user.username,
                'email': user.email,
                'phone_number': user.phone_number,
                'grade': user.grade,
                'major_class': user.major_class,
                'role': user.role,
            }
            serialized_users.append(user_data)

        return Response(serialized_users)
    
class HeartBeatApi(APIView):
    permission_classes = []

    def get(self, request):
        current_time = datetime.now()  # 获取当前时间
        timestamp = current_time.timestamp()  # 将当前时间转换为时间戳
        timestamp=current_time
        return Response({
            'status': 'success',
            'timestamp': timestamp  # 添加时间戳到响应中
        }, status=status.HTTP_200_OK)


class UserRegisterApi(APIView):
    permission_classes = []  # 允许任何人注册

    @swagger_auto_schema(
        operation_summary='用户注册',
        operation_description='提供用户信息进行注册',
        responses={
            201: openapi.Response('注册成功', openapi.Schema(type=openapi.TYPE_OBJECT,
                                                         properties={
                                                             'message': openapi.Schema(type=openapi.TYPE_STRING)
                                                         })),
            400: openapi.Response('注册失败', openapi.Schema(type=openapi.TYPE_OBJECT,
                                                         properties={
                                                             'errors': openapi.Schema(type=openapi.TYPE_OBJECT)
                                                         }))
        },
        tags=['用户']
    )
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registration succeeded"}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # 存入cookie版本


class UserLoginApi(APIView):
    permission_classes = []

    @swagger_auto_schema(
        operation_summary='用户登录',
        operation_description='提供用户名和密码进行登录',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING, description='用户名', example='user123'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description='密码', format='password', example='yourpassword')
            },
            required=['username', 'password']
        ),
        responses={
            status.HTTP_200_OK: openapi.Response('登录成功'),
            status.HTTP_400_BAD_REQUEST: openapi.Response('无效的请求或认证失败'),
            status.HTTP_401_UNAUTHORIZED: openapi.Response('用户名或密码错误')
        },
        tags=['用户']
    )
    def post(self, request: Request) -> Response:
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = get_user_model().objects.get(
                username=serializer.validated_data["username"])
        except ObjectDoesNotExist:
            return Response({"message": "User not registered"}, status=status.HTTP_400_BAD_REQUEST)

        if user.check_password(serializer.validated_data["password"]):
            refresh = RefreshToken.for_user(user)

            # 使用自定义的TokenObtainPairSerializer生成token
            custom_token_serializer = CustomTokenObtainPairSerializer()
            token = custom_token_serializer.get_token(user)
            # 根据邮箱是否为空设置status的值
            if not user.email:
                response = Response({
                    "username": user.username,
                    "refresh": str(refresh),
                    "access": str(token.access_token),
                    "expire": token.access_token.payload["exp"] - token.access_token.payload["iat"],
                }, status=520)

                # 设置访问令牌的Cookie
                max_age = 60 * 60 * 24 * 1   # 设置Cookie有效期为1天
                expires = now() + timedelta(seconds=max_age)
                response.set_cookie(
                    'jwt_token',  # Cookie的名称
                    str(token.access_token),  # Cookie的值，这里是访问令牌
                    max_age=max_age,  # Cookie的有效期
                    httponly=False,
                    domain='abdn.kirisame.cc',  # 设置cookie的域名
                    # domain='127.0.0.1',
                    # secure=True,  # 如果使用HTTPS，则设置为True
                )

                return response
            else:
                response = Response({
                    "username": user.username,
                    "refresh": str(refresh),
                    "access": str(token.access_token),
                    "expire": token.access_token.payload["exp"] - token.access_token.payload["iat"],
                })
                # 设置访问令牌的Cookie
                max_age = 60 * 60 * 24 * 1   # 设置Cookie有效期为1天
                expires = now() + timedelta(seconds=max_age)
                response.set_cookie(
                    'jwt_token',  # Cookie的名称
                    str(token.access_token),  # Cookie的值，这里是访问令牌
                    max_age=max_age,  # Cookie的有效期
                    httponly=False,
                    domain='abdn.kirisame.cc',  # 设置cookie的域名
                    # domain='127.0.0.1',
                    # secure=True,  # 如果使用HTTPS，则设置为True
                )
                return response
        else:
            return Response({"message": "User login failed, please check your account password"}, status=status.HTTP_401_UNAUTHORIZED)


# 检查手机号码是否正确
class checkphoneApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request):
        serializer = CheckPhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data["phone_number"]
        username = request.user.username

        try:
            user = get_user_model().objects.get(phone_number=phone_number, username=username)
            return Response("Accept", status=status.HTTP_200_OK)
        except get_user_model().DoesNotExist:
            return Response("手机号码不存在", status=status.HTTP_400_BAD_REQUEST)


# 令牌发送api 通用api
class Is_PasswordApi(APIView):
    permission_classes = []

    def post(self, request: Request) -> Response:
        serializer = IsPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if get_user_model().objects.get(username=serializer.validated_data["username"]) == None:
            return Response("用户不存在", status=status.HTTP_400_BAD_REQUEST)
        user = get_user_model().objects.get(
            username=serializer.validated_data["username"])
        if user.email == serializer.validated_data["email"]:
            token_value = get_random_string(length=6)
            user.token = token_value
            user.token_expires = timezone.now() + timezone.timedelta(minutes=10)  # 设置10分钟后过期
            user.save()
            send_mail(
                '重置密码',
                message="",
                html_message=email_inf.EMAIL_BODY.format(name=user.username, code=token_value, time=timezone.now().strftime('%Y年%m月%d日')),
                from_email=email_inf.EMAIL_FROM,
                recipient_list=[user.email],
            )
            return Response({
                "Token email has been sent to your reserved mailbox, please check!"
            })
        else:
            return Response("The mailbox is incorrect or does not exist", status=status.HTTP_400_BAD_REQUEST)


# 后续感觉需要添加验证码等防爆破
class ResetPasswordApi(APIView):
    permission_classes = []

    def post(self, request: Request) -> Response:
        serializer = ResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        if get_user_model().objects.get(username=username):
            user = get_user_model().objects.get(username=username)
            if serializer.validated_data['token'] == user.token and user.token_expires and timezone.now() <= user.token_expires:
                user = get_user_model().objects.get(
                    username=serializer.validated_data['username'])
                # 更新密码前，先使用 set_password 方法加密密码
                user.set_password(serializer.validated_data['password'])
                user.save()
                return Response({
                    f"Your password has been changed successfully. Please log in again"
                })
            else:
                return Response({
                    "令牌超时或错误"
                })
        else:
            return Response({"The user name does not exist"}, status=status.HTTP_400_BAD_REQUEST)

# 普通修改密码
class modifyPasswordApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = modifyPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 获取用户
        username = request.user.username
        user = get_user_model().objects.get(username=username)

        # 检查新密码长度
        new_password = serializer.validated_data['password']
        if len(new_password) < 8:
            return Response({"error": "The new password must be longer than 8 characters."},
                            status=status.HTTP_400_BAD_REQUEST)

        # 验证旧密码
        if user.check_password(serializer.validated_data['old_password']):
            # 设置新密码
            user.set_password(new_password)
            user.save()
            return Response({"message": "Your password has been changed successfully. Please log in again."})

        # 如果旧密码不匹配或用户不存在
        return Response({"error": "The old password is incorrect or the user does not exist."},
                        status=status.HTTP_400_BAD_REQUEST)

   # 危险api
class ModifyPasswordApi(APIView):
    permission_classes = []
    def get(self, request, *args, **kwargs):
        # 遍历CustomUser模型中的所有记录
        users = CustomUser.objects.all()
        for user in users:
            # 哈希手机号并更新password字段
            if user.phone_number:
                last_six_digits = user.phone_number[-6:]
                user.set_password(last_six_digits)
                user.set_password(user.phone_number)
                user.save()
        return Response({"message": "Passwords have been updated."}, status=status.HTTP_200_OK)
# 以旧换新版本修改
# class modifyPhoneApi(APIView):
#     permission_classes = []
#     def post(self, request: Request) -> Response:
#         serializer = modifyPhoneSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         username = serializer.validated_data['username']
#         if get_user_model().objects.get(username=username):
#             user = get_user_model().objects.get(username=username)
#             if serializer.validated_data['token'] == user.token and timezone.now() <= user.token_expires:
#                 user = get_user_model().objects.get(username=serializer.validated_data['username'])
#                 user.phone_number = serializer.validated_data['phone_number']
#                 user.save()
#                 return Response({
#                     f"您的手机号修改成功!"
#                 })
#             else:
#                 return Response({
#                     "令牌超时或错误"
#                 })
#         else :
#             return Response({"The user name does not exist"},status=status.HTTP_404_NOT_FOUND)

# class modifyEmailApi(APIView):
#     permission_classes = []
#     def post(self, request: Request) -> Response:
#         serializer = modifyEmailSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         username = serializer.validated_data['username']
#         if get_user_model().objects.get(username=username):
#             user = get_user_model().objects.get(username=username)
#             if serializer.validated_data['token'] == user.token and timezone.now() <= user.token_expires:
#                 user = get_user_model().objects.get(username=serializer.validated_data['username'])
#                 user.email = serializer.validated_data['email']
#                 user.save()
#                 return Response({
#                     f"Your email address has been successfully modified!"
#                 })
#             else:
#                 return Response({
#                     "令牌超时或错误"
#                 })
#         else :
#             return Response({"The user name does not exist"},status=status.HTTP_400_BAD_REQUEST)

# 简易版本
class modifyEmailApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = modifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = request.user.username
        if get_user_model().objects.get(username=username):
            user = get_user_model().objects.get(username=username)
            user.email = serializer.validated_data['email']
            user.save()
            return Response("email modification successful")
        return Response({"The user name does not exist"}, status=status.HTTP_400_BAD_REQUEST)


class modifyPhoneApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = modifyPhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = request.user.username
        if get_user_model().objects.get(username=username):
            user = get_user_model().objects.get(username=username)
            user.phone_number = serializer.validated_data['phone_number']
            user.save()
            return Response("phone modification successful")
        return Response({"The user name does not exist"}, status=status.HTTP_400_BAD_REQUEST)


class modifyGenderApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = modifyGenderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = request.user.username
        if get_user_model().objects.get(username=username):
            user = get_user_model().objects.get(username=username)
            user.gender = serializer.validated_data['gender']
            user.save()
            return Response("Gender modification successful")
        return Response({"The user name does not exist"}, status=status.HTTP_400_BAD_REQUEST)


class modifyNameApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = modifyNameSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = request.user.username
        if get_user_model().objects.get(username=username):
            user = get_user_model().objects.get(username=username)
            user.name = serializer.validated_data['name']
            user.save()
            return Response("Name changed successfully")
        return Response({"The user name does not exist"}, status=status.HTTP_400_BAD_REQUEST)
