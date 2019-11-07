import json
from django.core import serializers
from .models import *
from datetime import timedelta, date, datetime


def custom_json_converter(o):
    if isinstance(o, date):
        return o.__str__()
    elif isinstance(o, datetime):
        return o.__str__()

def get_rank_record(domain_id, user_id, unique=False):
    domain = Domain.objects.get(id=domain_id, user_id=user_id)
    final_data = []
    if domain:
        configs = Config.objects.filter(domain_id=domain_id)
        config_ids = [config.id for config in configs]
        ranks = Rank.objects.filter(config_id__in=config_ids).order_by('-executed_ts')
        if unique:
            final_data = process_rank_record(ranks, domain)
            return final_data
        for rank in ranks:
            rank_obj = json.loads(serializers.serialize("json", [rank]))
            row = {}
            row.update(rank_obj[0].get("fields"))
            row.update({
                "executed_ts": str(rank.executed_ts),
                "keyword": rank.config.keyword,
                "domain_name": domain.domain
            })
            final_data.append(row)
    return final_data


def process_rank_record(ranks, domain):
    config_ranks = {}
    for rank in ranks:
        if rank.config_id not in config_ranks.keys():
            rank_obj = json.loads(serializers.serialize("json", [rank]))
            row = {}
            row.update(rank_obj[0].get("fields"))
            row.update({
                "executed_ts": rank.executed_ts,
                "keyword": rank.config.keyword,
                "domain_name": domain.domain
            })
            config_ranks[rank.config_id] = row
        else:
            target_row = config_ranks.get(rank.config_id, {})
            executed_ts = target_row.get("executed_ts")
            one_day_before = executed_ts - timedelta(days=1)
            seven_day_before = executed_ts - timedelta(days=7)
            thirty_day_before = executed_ts - timedelta(days=30)
            if rank.executed_ts == one_day_before:
                target_row["day1"] = rank.page_rank-target_row.get("page_rank")
            elif rank.executed_ts == seven_day_before:
                target_row["day7"] = rank.page_rank-target_row.get("page_rank")
            elif rank.executed_ts == thirty_day_before:
                target_row["day30"] = rank.page_rank-target_row.get("page_rank")
    return config_ranks

def get_keyword_rank_record(config_id, domain_name):
    last_month = datetime.today() - timedelta(days=30)
    ranks = Rank.objects.filter(config_id=config_id, executed_ts__gte=last_month).order_by('-executed_ts')
    final_data = []
    for rank in ranks:
        row = {"Domain": domain_name, "Page Rank": rank.page_rank, "Date Added": rank.executed_ts, "Keyword": rank.config.keyword}
        final_data.append(row)
    return final_data