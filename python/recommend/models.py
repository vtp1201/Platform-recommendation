from django.db import models

# Create your models here.
class Job(models.Model):
    service = models.CharField(max_length=50)
    object = models.CharField(max_length=20)
    key = models.CharField(max_length=20)
    request = models.CharField(max_length=20)
    dataSource = models.CharField(max_length=50)
    dataDestination = models.CharField(max_length=20)

    def __str__(self):
<<<<<<< HEAD
        return self.name
=======
        return self.name
>>>>>>> 322b8cdcbb9db79deace14223a86783fa17464e0
