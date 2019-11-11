from django.contrib import admin
from .models import Domain, Config, Credentials, Rank

# Register your models here.
admin.site.register(Domain)
admin.site.register(Config)
admin.site.register(Credentials)
admin.site.register(Rank)