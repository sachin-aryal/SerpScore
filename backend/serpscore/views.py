import json

from django.http import JsonResponse, HttpResponse
from .models import *
from rest_framework import status
from . import util
import csv
import tldextract

def create_config(request):
    try:
        data = request.params
        user_id = request.user.id
        domain_id = data.get("domain_id", None)
        domain = data.get("domain")
        configs = data.get("keywords", [])
        if len(configs) == 0:
            return JsonResponse({"success": False, "message": "There should be at least one keyword."}, status=status.HTTP_200_OK)
        else:
            if domain_id:
                domain_object, created = Domain.objects.update_or_create(
                    id=domain_id, user_id=user_id, defaults=dict(domain=domain)
                )
            else:
                domain_object = Domain(domain=domain, user_id=user_id)
                domain_object.save()

            domain_id = domain_object.id
            old_config = Config.objects.filter(domain_id=domain_id)
            new_config_ids = [config.get("config_id") for config in configs]
            for each_old_config in old_config:
                if each_old_config.id not in new_config_ids:
                    each_old_config.delete()

            for config in configs:
                config_id = config.get("config_id")
                if int(config_id) == -2:
                    config_object = Config(keyword=config.get("keyword"), fetch_interval=config.get("fetch_interval"),
                                           status=config.get("status"), domain_id=domain_id)
                    config_object.save()
                else:
                    config_object = Config.objects.get(id=config_id)
                    config_object.keyword = config.get("keyword")
                    config_object.status = config.get("status")
                    config_object.fetch_interval = config.get("fetch_interval")
                    config_object.save()
        return JsonResponse({"success": True, "message": "Config Updated Successfully."}, status=status.HTTP_200_OK)
    except Exception as ex:
        return JsonResponse({"success": False, "message": "Error: {}".format(str(ex))}, status=status.HTTP_200_OK)

def list_config(request):
    try:
        user_id = request.user.id
        params = request.params
        limit = params.get("limit", None)
        if limit:
            domains = Domain.objects.filter(user_id=user_id)[0:limit]
        else:
            domains = Domain.objects.filter(user_id=user_id)
        domains = list(domains.values())
        final_data = []
        for each_domain in domains:
            row = {}
            domain_id = each_domain.get("id")
            row["id"] = domain_id
            try:
                row["domain"] = str(tldextract.extract(each_domain.get("domain")).domain).title()
            except:
                row["domain"] = each_domain.get("domain")
            final_data.append(row)
        return JsonResponse({"success": True, "data": json.dumps(final_data, default=util.custom_json_converter)}, status=status.HTTP_200_OK)
    except Exception as ex:
        return JsonResponse({"success": False, "message": "Error: {}".format(str(ex))}, status=status.HTTP_200_OK)


def create_credentials(request):
    try:
        data = request.params
        user_id = request.user.id
        api_key = data.get("api_key")
        search_engine_id = data.get("search_engine_id")
        Credentials.objects.update_or_create(
            user_id=user_id, defaults={"api_key": api_key, "search_engine_id": search_engine_id}
        )
        return JsonResponse({"success": True, "message": "Credentials Updated Successfully."}, status=status.HTTP_200_OK)
    except Exception as ex:
        return JsonResponse({"success": False, "message": "Error: {}".format(str(ex))}, status=status.HTTP_200_OK)


def get_credentials(request):
    try:
        user_id = request.user.id
        credentials = Credentials.objects.filter(user_id=user_id)
        credentials = list(credentials.values())
        if len(credentials) > 0:
            credentials = credentials[0]
        else:
            credentials = {}
        return JsonResponse({"success": True, "data": json.dumps(credentials, default=util.custom_json_converter)}, status=status.HTTP_200_OK)
    except Exception as ex:
        return JsonResponse({"success": False, "message": "Error: {}".format(str(ex))}, status=status.HTTP_200_OK)

def get_config(request):
    try:
        data = request.params
        user_id = request.user.id
        domain_id = data["domain_id"]
        domain = Domain.objects.get(id=domain_id, user_id=user_id)
        row = {}
        if domain:
            configs = Config.objects.filter(domain_id=domain_id)
            configs = list(configs.values())
            row["id"] = domain_id
            row["domain"] = domain.domain
            row["configs"] = configs
        return JsonResponse({"success": True, "data": json.dumps(row, default=util.custom_json_converter)}, status=status.HTTP_200_OK)
    except Exception as ex:
        return JsonResponse({"success": False, "message": "Error: {}".format(str(ex))}, status=status.HTTP_200_OK)


def get_rank(request):
    try:
        data = request.params
        user_id = request.user.id
        domain_id = data["domain_id"]
        final_data = util.get_rank_record(domain_id=domain_id, user_id=user_id, unique=True)
        return JsonResponse({"success": True, "data": json.dumps(list(final_data.values()), default=util.custom_json_converter)}, status=status.HTTP_200_OK)
    except Exception as ex:
        return JsonResponse({"success": False, "message": "Error: {}".format(str(ex))}, status=status.HTTP_200_OK)


def download_domain_report(request):
    try:
        data = request.params
        user_id = request.user.id
        domain_id = data["domain_id"]
        final_data = util.get_rank_record(domain_id=domain_id, user_id=user_id, unique=False)
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}_report.csv'.format(domain_id)
        writer = csv.writer(response)
        if len(final_data) > 0:
            writer.writerow(["Domain", 'Keyword', "Rank", "Added Date"])
            for row in final_data:
                writer.writerow([row.get("domain_name"), row.get("keyword"), row.get("page_rank"), row.get("executed_ts")])
        return response
    except Exception as ex:
        return JsonResponse({"success": False, "message": "Error: {}".format(str(ex))}, status=status.HTTP_200_OK)

def drill_rank_data(request):
    try:
        data = request.params
        user_id = request.user.id
        config_id = data["config_id"]
        config_object = Config.objects.get(id=config_id)
        final_data = []
        if config_object and config_object.domain.user_id == user_id:
            final_data = util.get_keyword_rank_record(config_id=config_id, domain_name=config_object.domain.domain)
        return JsonResponse({"success": True, "data": json.dumps(final_data, default=util.custom_json_converter)}, status=status.HTTP_200_OK)
    except Exception as ex:
        return JsonResponse({"success": False, "message": "Error: {}".format(str(ex))}, status=status.HTTP_200_OK)