# Generated by Django 4.1.7 on 2023-04-03 16:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('feeds', '0005_article_author'),
    ]

    operations = [
        migrations.AlterField(
            model_name='article',
            name='pub_date',
            field=models.TextField(default=''),
        ),
    ]
