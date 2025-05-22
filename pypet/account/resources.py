from import_export import resources, fields
from import_export.widgets import CharWidget
from .models import CustomUser
from django.contrib.auth.hashers import make_password

class CustomUserResource(resources.ModelResource):
    # 定义字段和对应的 widget，用于控制导入时的行为
    id = fields.Field(attribute='id', column_name='id')
    name = fields.Field(attribute='name', column_name='name', widget=CharWidget())
    phone_number = fields.Field(attribute='phone_number', column_name='phone_number', widget=CharWidget())
    username = fields.Field(attribute='username', column_name='username', widget=CharWidget())
    password = fields.Field(attribute='password', column_name='password', widget=CharWidget())

    class Meta:
        model = CustomUser
        fields = ('id', 'name', 'phone_number', 'username', 'password')   # 指定要导入的字段
        export_order = fields  # 指定导出时的字段顺序
        skip_unchanged = True  # 跳过未更改的数据行
        report_skipped = True  # 在导入时报告被跳过的数据行

    def before_import_row(self, row, **kwargs):
        # Hash the password before importing each row
        if 'password' in row:
            row['password'] = make_password(row['password'])
