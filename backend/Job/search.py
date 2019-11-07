from googleapiclient.discovery import build
import logging as log


def google_search(search_term, user_link, credentials):
    API_KEY = credentials.get("api_key")
    CASE_ID = credentials.get("search_engine_id")
    service = build("customsearch", "v1", developerKey=API_KEY, cache_discovery=False) # If cache error occured
    # un-comment it.
    # service = build("customsearch", "v1", developerKey=API_KEY)
    page = 1
    start = 1
    while True:
        if page > 10:
            break
        try:
            res = service.cse().list(
                q=search_term,
                cx=CASE_ID,
                num=10,
                start=start
            ).execute()

            items = res.get("items", [])
            for index, item in enumerate(items):
                if item.get("displayLink") in user_link or user_link in item.get("displayLink"):
                    rank = start+index
                    return page, rank
            start = res['queries']['nextPage'][0]['startIndex']
        except Exception as ex:
            log.error("Error Occurred: "+str(ex))
            break
        page += 1
    return None, None


def get_page_and_rank(keyword, domain, credentials):
    return google_search(keyword, domain, credentials)
