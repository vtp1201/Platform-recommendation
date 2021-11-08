from rest_framework import serializers

from recommend.models import Job

class CarSerializer(serializers.ModelSerializer):

    class Meta: 
        model = Job
        fields = ('service', 'object', 'key', 'request', 'dataSource', 'dataDestination')