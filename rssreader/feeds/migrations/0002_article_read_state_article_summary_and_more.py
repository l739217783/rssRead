# Generated by Django 4.1.7 on 2023-04-01 14:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('feeds', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='read_state',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='article',
            name='summary',
            field=models.TextField(default=''),
        ),
        migrations.AlterField(
            model_name='article',
            name='pub_date',
            field=models.DateTimeField(auto_now_add=True, verbose_name='date published'),
        ),
    ]
