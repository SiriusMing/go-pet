REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',  # 认证用户才给访问
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # 基于JSON Web Token的认证
        'rest_framework.authentication.BasicAuthentication',  # 基于用户名和密码的认证
        # 'rest_framework.authentication.SessionAuthentication',  # 基于session的认证
    ),
}
