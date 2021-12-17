from django.http import JsonResponse

from rest_framework import status
from rest_framework.decorators import api_view

import pyrebase
import os
from . import firebasekey
from recommend import engine
from datetime import datetime
import shutil

@api_view(['POST'])
def post(request):
    service = ''.join(request.data.get('service', ''))
    object = ''.join(request.data.get('object', ''))
    key = ''.join(request.data.get('key', ''))
    Request = ''.join(request.data.get('request', ''))
    dataSourceObject = ''.join(request.data.get('dataSourceObject', ''))
    dataSourceKey = ''.join(request.data.get('dataSourceKey', ''))
    dataSourceRequest = ''.join(request.data.get('dataSourceRequest', ''))

    print(service, object, key, dataSourceObject, dataSourceKey, dataSourceRequest)
    if dataSourceKey == '' or dataSourceRequest == '':
        return JsonResponse({
            'message': 'import interactions file'
        }, status = status.HTTP_400_BAD_REQUEST)
    if( service == 'user to user'):
        DDLocation = userToUsers(object, key, Request, dataSourceObject, dataSourceKey)
        if DDLocation == 'error':
            return JsonResponse({
                'message': 'try again'
            }, status = status.HTTP_400_BAD_REQUEST)
        return JsonResponse({
            'message': 'Done',
            'dataDestination': "recommends.json",
            'DDLocation' : DDLocation,
        }, status=status.HTTP_201_CREATED)
    DDLocation = userToItems(object, key, Request, dataSourceObject, dataSourceKey, dataSourceRequest)
    if DDLocation == 'error':
        return JsonResponse({
            'message': 'try again'
        }, status = status.HTTP_400_BAD_REQUEST)
    return JsonResponse({
        'message': 'Done',
        'dataDestination': "recommends.json",
        'DDLocation' : DDLocation,
    }, status=status.HTTP_201_CREATED)

firebase = pyrebase.initialize_app(firebasekey.config)
storage = firebase.storage()

def uploadFile(fileName):
    path = os.path.dirname(os.path.abspath(__file__)) + "/files/"
    fileLocation = 'recommends.json'
    now = datetime.now().strftime("%d%m%Y%H%M%S")
    fileName = fileName + '-' + now + '-' + fileLocation
    storage.child(fileName).put(path + fileLocation)
    obj = (storage.child(fileName).get_url(None))
    return obj

def downloadFile(fileName, fileLocation):
    path = os.path.dirname(os.path.abspath(__file__)) + "/files/"
    filename = os.path.split(fileName)[1]
    storage.child(filename).download(path + fileLocation)

def userToUsers(object, key, request, dataSourceObject, dataSourceKey):
    path = os.path.dirname(os.path.abspath(__file__)) + "/files" 
    os.mkdir(path)
    users_df = ''
    interactions_df = ''
    try:
        if dataSourceObject != "":
            users_df = checkTypeFile(dataSourceObject)
            downloadFile(dataSourceObject, "users_df"+ users_df)
        if dataSourceKey != "":
            interactions_df = checkTypeFile(dataSourceKey)
            downloadFile(dataSourceKey, "interactions_df" + interactions_df)
    except:
        return "error"
    
    engine.person_id = object
    engine.key = key
    engine.content_id = request

    fileLocation = engine.get_recommendations(users_df, interactions_df)

    if fileLocation.split(',')[0] == 'error':
        print(fileLocation)
        shutil.rmtree(path)
        return 'error'
    fileName = 'user_to_' + request
    DDLocation = uploadFile(fileName)

    shutil.rmtree(path)
    
    return DDLocation

def checkTypeFile(filename):
    name, extension = os.path.splitext(filename)
    return extension

def userToItems(object, key, request, dataSourceObject, dataSourceKey, dataSourceRequest):
    path = os.path.dirname(os.path.abspath(__file__)) + "/files"
    os.mkdir(path)

    users_df = ''
    interactions_df = ''
    articles_df = ''
    try:
        if dataSourceObject != "":
            users_df = checkTypeFile(dataSourceObject)
            downloadFile(dataSourceObject, "users_df"+ users_df)
        if dataSourceKey != "":
            interactions_df = checkTypeFile(dataSourceKey)
            downloadFile(dataSourceKey, "interactions_df" + interactions_df)
        if dataSourceRequest != "":
            articles_df = checkTypeFile(dataSourceRequest)
            downloadFile(dataSourceRequest, "articles_df" + articles_df)
    except :
        return "error"

    engine.person_id = object
    engine.key = key
    engine.content_id = request
    
    fileLocation = engine.get_recommendations(users_df, interactions_df, articles_df)

    if fileLocation.split(',')[0] == 'error':
        print(fileLocation)
        shutil.rmtree(path)
        return 'error'
    fileName = 'user_to_' + request
    DDLocation = uploadFile(fileName)

    shutil.rmtree(path)

    return DDLocation
