import re
import time
import json
import feedparser
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import urllib.request
from django.http import HttpResponseRedirect

from .models import Article
import os
from django.views.decorators.http import require_POST
from django.urls import reverse


@csrf_exempt
def mark_as_read(request, article_id):
    try:
        article = Article.objects.get(id=article_id)
        article.read_state = True
        article.save()
        return JsonResponse({'status': 'ok'})
    except:
        return JsonResponse(
            {'error': 'An error occurred while marking the article as read'})


def add_feed(request):
    if request.method == 'POST':
        # 获取表单提交的数据
        name = request.POST.get('name')
        url = request.POST.get('url')
        if name and url:
            # 打开 RSS_data.json 文件
            data_file = 'feeds/static/RSS_data.json'
            with open(data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            # 添加新的 RSS 源到数据中
            data[name] = url
            # 保存到文件
            with open(data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        return render(request, 'manager.html')


@csrf_exempt
def delete_feed(request):
    """删除指定源"""
    print('执行删除')
    name = request.POST.get('name')

    with open('feeds/static/RSS_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    if name in data:
        data.pop(name)

        with open('feeds/static/RSS_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
    else:
        print(f'源不存在:{name}')
    return JsonResponse({'success': True})


def manager(request):
    """读取RSS源信息，并传入manger显示"""
    with open('feeds/static/RSS_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    if request.method == 'POST':
        # 检测源的连通性
        results = []
        for name, url in data.items():
            start = time.time()
            try:
                urllib.request.urlopen(url, timeout=5)
                elapsed_time = time.time() - start
                if elapsed_time < 1:
                    results.append({'name': name, 'status': 'green'})
                elif elapsed_time < 5:
                    results.append({'name': name, 'status': 'yellow'})
                else:
                    results.append({'name': name, 'status': 'red'})
            except:
                results.append({'name': name, 'status': 'red'})
        return render(request, 'manager.html', {
            'feeds': results,
            'check': True
        })

    else:
        # 不需要检测，只显示源的名称
        results = [i for i in data]

    return render(request, 'manager.html', {'feeds': results, 'check': False})


@csrf_exempt
def search(request):
    """从数据库筛选数据，将数据返回给feeds页面的筛选器js使用"""
    if request.method == 'POST':
        print(f'请求数据{request.POST}')
        keyword = request.POST.getlist('keyword')
        author = request.POST.getlist('author')
        keyword = keyword[0] if keyword else ''
        author = author[0] if author else ''

        print(keyword, author)
        articles = Article.objects.filter(
            title__icontains=keyword, author=author)
        result = []
        for article in articles:
            result.append({
                'id': article.id,
                'title': article.title,
                'author': article.author,
                'link': article.link,
                'summary': article.summary[:65]+'...',
                'pub_date': article.pub_date,
            })
        print(result)
        return JsonResponse(result, safe=False)


# 过滤正常搜索版本，目前在用的是正则版
# def feeds(request):
#     with open('filter_data.json', 'r', encoding='utf-8') as f:
#         filter_data = json.load(f)

#     articles = []
#     feeds_url = ['https://www.fy6b.com/feed']
#     # feeds_url = ['https://example.com/feed', 'https://example.org/feed']
#     for feed in feeds_url:
#         feed_data = feedparser.parse(feed)
#         for entry_data in feed_data.entries:
#             title = entry_data.title.lower()
#             summary = entry_data.summary.lower()
#             if any(filter_word in title for filter_word in filter_data['filter_title']) or \
#                     any(filter_word in summary for filter_word in filter_data['filter_summary']):
#                 continue
#             try:
#                 article = Article.objects.get(title=entry_data.title,
#                                               link=entry_data.link)
#             except Article.DoesNotExist:
#                 article = Article.objects.create(
#                     title=entry_data.title,
#                     link=entry_data.link,
#                     summary=entry_data.summary,
#                     pub_date=time.strftime(
#                         "%Y-%m-%d", entry_data.published_parsed)
#                     # pub_date=entry_data.published
#                 )
#             if not article.read_state:
#                 articles.append(article)
#     return render(request, 'feeds.html', {'articles': articles})

@csrf_exempt
def feeds(request):
    """文章页，有请求的话，更新文章页并返回，没有的话，从数据库拉取展示"""

    # 用于模态窗口的作者选择(查询表author字段，列表形式返回，distinct()去重)
    name_list = Article.objects.values_list('author', flat=True).distinct()

    if request.POST.get('upload'):
        print('解析源,拉取数据')
        # 读取 filter.json 文件并解析（过滤关键字）
        with open('feeds/static/filter_data.json', 'r', encoding='utf-8') as f:
            filter_data = json.load(f)

        # 读取 RSS_data.json 文件并解析（RSS源）
        with open('feeds/static/RSS_data.json', 'r', encoding='utf-8') as f:
            rss_data = json.load(f)

        # 使用 feedparser 获取 RSS 订阅源中的文章
        articles = []
        for name, url in rss_data.items():
            feed_data = feedparser.parse(url)
            for entry_data in feed_data.entries:

                # 只检查标题是否匹配过滤器中的关键字，如果匹配则跳过此文章
                # if any(re.search(keyword, entry_data.title, re.IGNORECASE) for keyword in filter_data['filter_title']):
                #     continue

                # 检查标题和描述是否匹配过滤器中的关键字，如果匹配则跳过此文章
                if any(re.search(keyword, entry_data.title, re.IGNORECASE) or re.search(keyword, entry_data.summary, re.IGNORECASE) for keyword in filter_data['filter_title'] + filter_data['filter_summary']):
                    print(f'过滤：{entry_data.title}')
                    continue

                try:
                    # 检测是否存在，不存在添加
                    article = Article.objects.get(title=entry_data.title,
                                                  link=entry_data.link)
                except Article.DoesNotExist:
                    article = Article.objects.create(
                        title=entry_data.title,
                        link=entry_data.link,
                        summary=entry_data.summary,
                        author=name,
                        pub_date=time.strftime(
                            "%Y-%m-%d", entry_data.published_parsed)
                    )
                if not article.read_state:
                    # 检测是否阅读过，没阅读才展示
                    articles.append(article)

        return render(request, 'feeds.html', {'articles': articles, "name_list": name_list})
    else:
        print('数据库读取')
        # 从数据库中返回数据
        articles = Article.objects.filter(read_state=False)
        return render(request, 'feeds.html', {'articles': articles, "name_list": name_list})


def filter(request):
    """过滤器管理页面,实现添加、删除过滤词逻辑"""
    with open('feeds/static/filter_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    return render(request, 'filter.html', {'data': data})


@csrf_exempt
def filter_delete(request):
    """删除指定关键"""
    keyword = request.POST.get('name')
    print(f'删除关键字:{keyword}')

    with open('feeds/static/filter_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    for key in data:
        if keyword in data[key]:
            data[key].remove(keyword)

    with open('feeds/static/filter_data.json', "w", encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)

    return JsonResponse({'success': True})


@csrf_exempt
def filter_add(request):
    print('添加关键字')
    if request.method == "POST":
        # # 读取请求数据
        post_data = dict(request.POST)
        print(post_data)

        filter_value = post_data['KeyWord']
        filter_type = post_data['type']

        # 读取 JSON 数据
        with open("feeds/static/filter_data.json", "r", encoding='utf-8') as f:
            data = json.load(f)

        # 添加过滤词

        if ('filter_summary' in filter_type) and (filter_value[0] in data):
            print(f'描述关键字{filter_value[0]},已存在')
        elif ('filter_summary' in filter_type) and not (filter_value[0] in data):
            data['filter_summary'] = set(data['filter_summary'])
            data['filter_summary'].add(filter_value[0])
            data['filter_summary'] = list(data['filter_summary'])

        if ('filter_title' in filter_type) and (filter_value[0] in data):
            print(f'标题关键字{filter_value[0]},已存在')
        elif ('filter_title' in filter_type) and not (filter_value[0] in data):
            data['filter_title'] = set(data['filter_title'])
            data['filter_title'].add(filter_value[0])
            data['filter_title'] = list(data['filter_title'])

        # 写入 JSON 数据
        with open("feeds/static/filter_data.json", "w", encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)

        return JsonResponse({"success": True})
    else:
        return JsonResponse({"success": False, "message": "Invalid request method."})

    # def feeds(request):
    #     articles = []
    #
    #     with open(r'D:\systemLibrary\Desktop\RSS\rssreader\feeds\test.html', encoding='utf-8') as f:
    #         content = f.read()
    #     feed_data = feedparser.parse(content)
    #     for entry_data in feed_data.entries:
    #         articles.append({
    #             'title': entry_data.title,
    #             'link': entry_data.link,
    #             'pub_date': time.strftime("%Y-%m-%d %H:%M", entry_data.published_parsed),
    #             'summary': entry_data.summary,
    #             'read_state': False,
    #         })
    #
    #     # 'summary': entry_data.summary if entry_data.summary != entry_data.title else ''
    #     return render(request, 'feeds.html', {'articles': articles})
