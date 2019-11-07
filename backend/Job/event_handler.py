import threading
from queue import Queue

RANK_TABLE = "serpscore_rank"

class EventHandler(threading.Thread):

    def __init__(self, connection):
        super().__init__()
        self.data_queue = Queue()
        self.execute = True
        self.connection = connection

    def run(self):
        while self.execute:
            row = self.data_queue.get()
            config_id = row.get("keyword_id")
            rank = row.get("rank")
            executed_time = row.get("executed_time")
            query = "INSERT INTO {} (page_rank, executed_ts, config_id) VALUES ({}, '{}', {})".format(RANK_TABLE, rank,
                                                                                                      executed_time,
                                                                                                      config_id)
            self.connection.write(query=query)

    def add_event(self, row):
        self.data_queue.put(row)


    def stop_process(self):
        self.execute = False

def main():
    # For testing
    event = EventHandler()
    event.start()
    event.add_event({"data_file": "/opt/immune/app_store/col/pluggable/UpworkTask/Ben/GCS/data/1.csv",
                     "data": {"name": "sachin", "age": 19}})
    import time
    time.sleep(5)
    event.add_event({"data_file": "/opt/immune/app_store/col/pluggable/UpworkTask/Ben/GCS/data/1.csv",
                     "data": {"name": "sachin", "age": 25}})
    event.stop_process()