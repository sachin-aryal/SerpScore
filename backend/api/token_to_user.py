import json

from rest_framework_jwt.serializers import VerifyJSONWebTokenSerializer
from rest_framework.exceptions import ValidationError
from django.http import JsonResponse

class AuthenticationMiddlewareJWT(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            requested_url = request.build_absolute_uri('?')
            if "api/get_api_token" not in requested_url and "/api/" in requested_url:

                token = request.META.get('HTTP_AUTHORIZATION', " ").split(' ')[1]
                data = {'token': token}
                valid_data = VerifyJSONWebTokenSerializer().validate(data)
                user = valid_data['user']
                request.user = user
        except ValidationError as v:
            return JsonResponse({'message': "Not Authorized."}, status=401)
        try:
            data = json.loads(request.body)
            request.params = data
        except:
            request.params = {}
        return self.get_response(request)