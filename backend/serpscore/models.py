from django.db import models
from django.contrib.auth.models import User
from django.db.models.deletion import CASCADE
from django.utils import timezone


class Domain(models.Model):

    domain = models.CharField(max_length=250)
    user = models.ForeignKey(to=User, on_delete=CASCADE)

    class Meta:
        unique_together = ('domain', 'user')

    def __str__(self):
        return self.domain+str(self.user)


class Config(models.Model):

    domain = models.ForeignKey(to=Domain, on_delete=CASCADE)
    keyword = models.CharField(max_length=200)
    fetch_interval = models.IntegerField()
    status = models.BooleanField(default=False)

    def __str__(self):
        return str(self.domain)+"-"+self.keyword

class Credentials(models.Model):
    api_key = models.CharField(max_length=250)
    search_engine_id = models.CharField(max_length=250)
    user = models.ForeignKey(to=User, on_delete=CASCADE)
    class Meta:
        unique_together = ('api_key', 'search_engine_id', 'user')


class Rank(models.Model):
    page_rank = models.IntegerField(blank=False)
    executed_ts = models.DateField(default=timezone.now)
    config = models.ForeignKey(to=Config, on_delete=CASCADE)
    class Meta:
        unique_together = ('executed_ts', 'config')
