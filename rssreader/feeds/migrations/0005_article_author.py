# Generated by Django 4.1.7 on 2023-04-03 11:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('feeds', '0004_alter_article_pub_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='author',
            field=models.CharField(default='', max_length=200),
        ),
    ]
