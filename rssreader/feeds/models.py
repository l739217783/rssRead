from django.db import models


class Article(models.Model):
    title = models.CharField(max_length=200)
    link = models.URLField(max_length=200)
    summary = models.TextField(default='')
    # pub_date = models.DateField('date published', auto_now_add=False)
    pub_date = models.TextField(default='')
    read_state = models.BooleanField(default=False)
    author = models.CharField(max_length=200, default='')

    def __str__(self):
        return self.title
