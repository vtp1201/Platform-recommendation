from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.views import APIView

from excel2json import convert_from_file

class RecommendJobView(APIView):
    def post(self, request):
        if request.dataSource.endswith('.xlsx'):
            df = convert_from_file(request.dataSource)
        dataDestination = "output.txt"
        return JsonResponse({
                'message': 'Done',
                'dataDestination': dataDestination,
            }, status=status.HTTP_201_CREATED)