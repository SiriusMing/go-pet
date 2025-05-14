# settings.py

# Celery 配置
CELERY_BROKER_URL = 'redis://localhost:6379/0'  # Redis 作为 Broker
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'  # 存储任务结果
CELERY_TIMEZONE = 'Asia/Shanghai'  # 时区
CELERY_ACCEPT_CONTENT = ['json']   # 任务序列化格式
CELERY_TASK_SERIALIZER = 'json'


# # RabbitMQ 配置
# RABBITMQ_HOST = os.environ.get("RABBITMQ_HOST", "localhost")
# RABBITMQ_PORT = os.environ.get("RABBITMQ_PORT", "9272")
# RABBITMQ_USER = os.environ.get("RABBITMQ_USER", "abdn")
# RABBITMQ_PASSWORD = os.environ.get("RABBITMQ_PASSWORD", "fakepassword")
# RABBITMQ_VHOST = os.environ.get("RABBITMQ_VHOST", "admin_vhost")

# # Celery 配置
# CELERY_BROKER_URL = f"amqp://{RABBITMQ_USER}:{RABBITMQ_PASSWORD}@{RABBITMQ_HOST}:{RABBITMQ_PORT}/{RABBITMQ_VHOST}"
# CELERY_RESULT_BACKEND = "rpc://"
# CELERY_ACCEPT_CONTENT = ['json']
# CELERY_TASK_SERIALIZER = 'json'
# CELERY_RESULT_SERIALIZER = 'json'
# # CELERY_TIMEZONE = TIME_ZONE