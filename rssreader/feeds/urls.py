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
from .views import api_articles
from .views import readed
from .views import update_feed
from .views import filter_update
from .views import update_nameList

app_name = 'feeds'
urlpatterns = [
    path('', feeds, name='feeds'),
    path('mark-as-read/<int:article_id>/', mark_as_read,
         name='mark_as_read'),  # 标记已读
    path('manager/', manager, name='check'),  # 源管理界面
    path('search/', search, name='search'),  # 源管理界面
    path('add-feed/', add_feed, name='add_feed'),  # 添加源
    path('update-feed/', update_feed, name='update_feed'),  # 编辑源
    path('delete-feed/', delete_feed, name='delete-feed'),  # 删除源
    path('filter/', filter, name='filter'),  # 过滤器
    path('filter-add/', filter_add, name='filter_add'),  # 添加过滤器
    path('filter-update/', filter_update, name='filter_update'),  # 修改过滤器
    path('filter-delete/', filter_delete, name='filter-delete'),  # 删除过滤器
    path('api/articles/', api_articles, name='api_articles'),  # 获取文章列表(懒加载使用)
    path('readed/', readed, name='readed'),  # 已读文章
    path('updateNameList', update_nameList)  # 更新作者列表使用
]
