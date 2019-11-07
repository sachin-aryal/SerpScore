import json
import time
import job, event_handler, db_connection
import logging as log
import sys

DOMAIN_TABLE = "serpscore_domain"
CREDENTIALS_TABLE = "serpscore_credentials"
CONFIG_TABLE = "serpscore_config"

class TaskRunner():

    def __init__(self, sql_conf_file):
        self.sql_conf_file = sql_conf_file
        self.jobs = {}
        self.connection = db_connection.Connection(config_file=self.sql_conf_file)
        self.connection.connect()
        event_connection = db_connection.Connection(config_file=self.sql_conf_file)
        event_connection.connect()
        self.event_handler = event_handler.EventHandler(event_connection)
        self.event_handler.start()

    def read_config(self):
        final_config = {}
        self.update_credentials(final_config)
        return final_config

    def update_credentials(self, final_config):
        query = "SELECT *FROM {}".format(CREDENTIALS_TABLE)
        records = self.connection.read(query=query)
        for record in records:
            user_id = record.get("user_id")
            self.update_domains(user_id=user_id, final_config=final_config, credentials=record)

    def update_domains(self, user_id, final_config, credentials):
        query = "SELECT * FROM {} where user_id={}".format(DOMAIN_TABLE, user_id)
        records = self.connection.read(query=query)
        for record in records:
            self.update_config(user_id=user_id, domain=record, final_config=final_config, credentials=credentials)


    def update_config(self, user_id, domain, final_config, credentials):
        domain_id = domain.get("id")
        domain_name = domain.get("domain")
        query = 'SELECT *FROM {} WHERE domain_id={}'.format(CONFIG_TABLE, domain_id)
        records = self.connection.read(query=query)
        for record in records:
            record["domain_id"] = domain_id
            record["user_id"] = user_id
            record["domain_name"] = domain_name
            record["api_key"] = credentials.get("api_key")
            record["search_engine_id"] = credentials.get("search_engine_id")
        final_config[domain_name+":user_id:"+str(user_id)] = records

    def run(self):
        while True:
            try:
                data = self.read_config()
                current_items = []
                for domain, keywords in data.items():
                    for keyword in keywords:
                        identifier = domain + "_" + keyword["keyword"]
                        current_items.append(identifier)
                        old_job = self.jobs.get(identifier)
                        if old_job:
                            if int(keyword["status"]) == 0:
                                log.warning("Stopping process for keyword: {} and domain: {}".format(old_job.keyword,
                                                                                                  old_job.domain))
                                old_job.stop_process()
                                del self.jobs[identifier]
                                continue
                            else:
                                old_job.update_fields(keyword)
                                continue
                        if int(keyword["status"]) == 1:
                            log.warning("Create new job for keyword: {} and domain: {}".format(keyword["keyword"], domain))
                            gcs_job = job.GCSJob(keyword, self.event_handler)
                            gcs_job.start()
                            self.jobs[identifier] = gcs_job

                to_remove = []
                for identifier in self.jobs.keys():
                    if identifier not in current_items:
                        to_remove.append(identifier)
                for identifier in to_remove:
                    gcs_job = self.jobs.get(identifier)
                    if gcs_job:
                        log.warning(
                            "Stopping process for keyword: {} and domain: {}".format(gcs_job.keyword, gcs_job.domain))
                        gcs_job.stop_process()
                        del self.jobs[identifier]
            except Exception as ex:
                log.warning("Error occurred in task runner;Error: {}".format(str(ex)))

            time.sleep(60)

def main():
    # For test purpose
    if len(sys.argv) == 2:
        sql_conf_file = str(sys.argv[1])
        log.info("Background Task Started; SQL CONF PATH: {}".format(sql_conf_file))
        task_runner = TaskRunner(sql_conf_file=sql_conf_file)
        task_runner.run()
    else:
        log.error("Background Task Could not be started. Required argument missing.")

if __name__ == "__main__":
    main()