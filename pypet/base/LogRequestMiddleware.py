import logging
import os
from pathlib import Path
class LogRequestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # 设置日志文件路径，放在项目根目录下
        project_root = Path(__file__).resolve().parent.parent
        log_file_path = os.path.join(project_root, 'request_log.log')

        # 配置日志记录器
        self.logger = logging.getLogger('RequestLogger')
        handler = logging.FileHandler(log_file_path)
        formatter = logging.Formatter('%(asctime)s - %(message)s')
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)

    def __call__(self, request):
        # 记录请求体
        try:
            body = request.body.decode('utf-8')
                # 记录请求头
            headers = {k: v for k, v in request.META.items() if k.startswith('HTTP_')}
            self.logger.info(f'Request Headers: {headers}')

            response = self.get_response(request)
            self.logger.info(f'Request Body: {body}')
            return response
        except UnicodeDecodeError:
            body = "Request body contains non-UTF-8 data."