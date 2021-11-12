from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.views import APIView

from excel2json import convert_from_file

class RecommendJobView(APIView):
    def post(self, request):
        dataDestination = "web_book_data.json"
        return JsonResponse({
                'message': 'Done',
                'dataDestination': dataDestination,
                'DDLocation' : '/public/uploads/web_book_data.json',
        }, status=status.HTTP_201_CREATED)
        

