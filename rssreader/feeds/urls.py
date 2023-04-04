# encoding: utf-8
"""
@author: lin
@license: (C) Copyright 2013-2017, Node Supply Chain Manager Corporation Limited.
@contact: 739217783@qq.com
@software: Pycharm
@file: urls.py
@time: 2023/4/1 16:38
@desc:
"""

from django.urls import path

from .views import feeds
from .views import mark_as_read
from .views import add_feed
from .views import manager
from .views import delete_feed
from .views import filter
from .views import filter_add
from .views import filter_delete
from .views import search

app_name = 'feeds'
urlpatterns = [
    path('', feeds, name='feeds'),
    path('mark-as-read/<int:article_id>/', mark_as_read,
         name='mark_as_read'),  # 标记已读
    path('manager/', manager, name='check'),  # 源管理界面
    path('search/', search, name='check'),  # 源管理界面
    path('add-feed/', add_feed, name='add_feed'),  # 添加源
    path('delete-feed/', delete_feed, name='delete-feed'),  # 删除源
    path('filter/', filter, name='filter'),  # 过滤器
    path('filter-add/', filter_add, name='filter'),  # 过滤器
    path('filter-delete/', filter_delete, name='filter'),  # 过滤器
]
