import pymysql
from configparser import ConfigParser


def read_conf(conf_file):
    config_parser = ConfigParser()
    config_parser.read(conf_file)
    return config_parser

class Connection:

    def __init__(self, config_file):
        self.conn = None
        self.cursor = None
        self.config_file = config_file

    def connect(self):
        config = read_conf(conf_file=self.config_file)
        host = config.get("client", "host")
        user = config.get("client", "user")
        password = config.get("client", "password")
        database = config.get("client", "database")
        self.conn = pymysql.connect(host, user, password, database)
        self.cursor = self.conn.cursor(pymysql.cursors.DictCursor)

    def get_cursor(self):
        return self.cursor

    def read(self, query):
        self.cursor.execute(query)
        results = self.cursor.fetchall()
        self.conn.commit()
        return results

    def write(self, query):
        self.cursor.execute(query)
        self.conn.commit()

    def close(self):
        self.conn.close()

def main():
    conn = Connection("/opt/immune/app_store/col/pluggable/UpworkTask/Ben/SerpScore/backend/api/sql.cnf")
    conn.connect()
    conn.get_cursor().execute("SELECT VERSION()")
    data = conn.get_cursor().fetchone()
    print("Database version : %s " % data)
    conn.close()