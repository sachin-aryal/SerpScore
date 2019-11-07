import threading
import logging as log
import time
from datetime import datetime, date
import search
import string

VALID_CHARS_FOR_FILENAME = "-_.() %s%s" % (string.ascii_letters, string.digits)


class GCSJob(threading.Thread):
    def __init__(self, config, event_handler):
        threading.Thread.__init__(self)
        self.keyword = config["keyword"]
        self.domain = config["domain_name"]
        self.fetch_interval = int(float(config["fetch_interval"]) * 86400)
        self.credentials = {"api_key": config["api_key"], "search_engine_id": config["search_engine_id"]}
        self.keyword_id = config["id"]
        self.event_handler = event_handler
        self.execute = True


    def update_fields(self, config):
        self.keyword = config["keyword"]
        self.domain = config["domain_name"]
        self.fetch_interval = int(float(config["fetch_interval"]) * 86400)
        self.credentials = {"api_key": config["api_key"], "search_engine_id": config["search_engine_id"]}
        self.keyword_id = config["id"]

    def stop_process(self):
        self.execute = False

    def run(self):
        while self.execute:
            try:
                log.warning("Get page and rank keyword: {} and domain: {}".format(self.keyword, self.domain))
                page, rank = search.get_page_and_rank(self.keyword, self.domain, self.credentials)
                if rank:
                    executed_time = str(datetime.today().date())
                    row = {"keyword_id": self.keyword_id, "rank": rank, "executed_time": executed_time}
                    self.event_handler.add_event(row)
            except Exception as ex:
                log.error("Error occurred for keyword: {} and domain: {};Error: {}".format(self.keyword, self.domain,
                                                                                           str(ex)))
            time.sleep(self.fetch_interval)

