
from django.urls import path
from.views import *

urlpatterns = [
    path('create_config/', create_config, name="create-config"),
    path('list_config/', list_config, name="list-config"),
    path('create_credentials/', create_credentials, name="create-credentials"),
    path('get_credentials/', get_credentials, name="get-credentials"),
    path('get_config/', get_config, name="get-credentials"),
    path('get_rank/', get_rank, name="get_rank"),
    path('download_domain_report/', download_domain_report, name="download_domain_report"),
    path('drill_rank_data/', drill_rank_data, name="drill_rank_data"),
    path('delete_domain/', delete_domain, name="delete_domain")
]
