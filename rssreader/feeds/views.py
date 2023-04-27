from requests.exceptions import RequestException
import re
import time
import json
import feedparser
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import Article
from django.db.models import Q
import requests


@csrf_exempt
def mark_as_read(request, article_id):
    """修改数据库卡片阅读状态
    article_id:卡片id
    status:阅读状态
    """
    read_status = True if request.POST.get('status') == 'true' else False
    print(request.POST.get('status'))
    try:
        article = Article.objects.get(id=article_id)
        article.read_state = read_status
        article.save()
        return JsonResponse({'status': 'ok'})
    except:  # noqa:E722
        return JsonResponse(
            {'error': 'An error occurred while marking the article as read'})


def add_feed(request):
    if request.method == 'POST':
        # 获取表单提交的数据
        name = request.POST.get('feedName')
        link = request.POST.get('feedLink')
        description = request.POST.get('feedDescription')
        if name and link:
            # 打开 RSS_data.json 文件
            data_file = 'feeds/static/RSS_data.json'
            with open(data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            # 添加新的 RSS 源到数据中
            data[name] = {'href': link, 'description': description}
            # 保存到文件
            with open(data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return JsonResponse({'success': True})
    return JsonResponse({'success': False, 'message': '添加失败'})


def delete_feed(request):
    """删除指定源"""
    names = request.POST.getlist('names')

    with open('feeds/static/RSS_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 删除json文件中的源
    for name in names:
        if name in data:
            data.pop(name)

            with open('feeds/static/RSS_data.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
        else:
            print(f'源不存在:{name}')

        # 删除数据库中的源
        # Article.objects.filter(author=name).delete()

    return JsonResponse({'success': True})


def manager(request):
    """读取RSS源信息，并传入manger显示"""
    with open('feeds/static/RSS_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    return render(request, 'manager.html', {'feeds': data})


def update_feed(request):
    if request.method == 'POST':
        feed_name = request.POST.get('feedName')
        feed_link = request.POST.get('feedLink')
        feed_categor = request.POST.get('feedCategor')
        feed_description = request.POST.get('feedDescription')

        print(feed_name, feed_link, feed_description)  # 调试输出表单提交的数据

        with open('feeds/static/RSS_data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 修改对应的 feed 数据
        data[feed_name]['href'] = feed_link
        data[feed_name]['description'] = feed_description
        data[feed_name]['category'] = feed_categor

        # 保存数据
        with open('feeds/static/RSS_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

        return JsonResponse({'success': True})

    return JsonResponse({'success': False, 'message': 'Invalid request method'})


@csrf_exempt
def search(request):
    """从数据库筛选数据，将数据返回给feeds页面的筛选器js使用"""
    if request.method == 'POST':
        print(f'请求数据{request.POST}')
        keyword = request.POST.get('keyword', '')
        author = request.POST.get('author', '')
        category = request.POST.get('category', '')
        read_state = request.POST.get('read_state', '')
        read_state = True if read_state == 'true' else False
        print(f'分类：{category}')
        # print(type(keyword), type(author))
        # print(keyword, author)

        if keyword.strip() == '' and author.strip() == '' and category.strip() == '':
            # 无条件查询
            # articles = Article.objects.filter(read_state=read_state)
            return JsonResponse('load_HomePage', safe=False)
        else:
            # 构造多条件查询
            query = Q(read_state=read_state)
            if keyword.strip() != '':
                query &= Q(title__contains=keyword) | Q(
                    summary__contains=keyword)
            if author.strip() != '':
                query &= Q(author=author)
            if category.strip() != '':
                with open('feeds/static/RSS_data.json', 'r', encoding='utf-8') as f:
                    feeds = json.load(f)
                authors = [k for k, v in feeds.items() if v['category']
                           == category]
                query &= Q(author__in=authors)

            articles = Article.objects.filter(query)

        result = []
        html_tag_pattern = re.compile(r'<[^>]+>')  # 去除HTML标签的正则

        for article in articles:
            # 去除HTML标签,防止影响卡片布局
            summary = html_tag_pattern.sub(
                '', article.summary) if article.summary else ''
            result.append({
                'id': article.id,
                'title': article.title,
                'author': article.author,
                'link': article.link,
                'summary': summary,
                'pub_date': article.pub_date,
            })
        print(result)
        return JsonResponse(result, safe=False)


@csrf_exempt
def update_nameList(request):
    """
    筛选按钮的分类更改时，异步请求，修改作者的下拉选项
    """
    category = request.POST.get('category', '')  # 获取前端发送过来的 category 参数

    with open('feeds/static/RSS_data.json', 'r', encoding='utf-8') as f:
        feeds = json.load(f)
        authors = [k for k, v in feeds.items() if v['category'] == category]

    return JsonResponse(authors, safe=False)


def readed(request):
    """从数据库拉取展示已读文章页"""
    articles = Article.objects.filter(read_state=True)

    # 筛选获取所有已读文章的作者
    name_list = Article.objects.filter(
        read_state=True).values_list('author', flat=True).distinct()

    # print(articles)
    return render(request, 'readed.html', {'articles': articles, 'name_list': name_list})


def get_content(data, retry_times=3):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) " "Chrome/74.0.3729.131 Safari/537.36"
    }
    for i in range(retry_times):
        # 失败重复请求 3 次
        try:
            r = requests.get(data['href'], headers=headers)
            r.raise_for_status()
            return r.text
        except RequestException as e:
            print(f"Error fetching URL {data['href']}: {e}")
            time.sleep(5)
    return False


@csrf_exempt
def feeds(request):
    """文章页，有请求的话，更新文章页并返回，没有的话，从数据库拉取展示"""

    html_tag_pattern = re.compile(r'<[^>]+>')  # 匹配HTML元素的正则

    # 用于模态窗口的作者选择(查询表author字段，列表形式返回，distinct()去重)
    name_list = Article.objects.values_list('author', flat=True).distinct()

    if request.method == 'POST':
        # 读取（过滤关键字）
        with open('feeds/static/filter_data.json', 'r', encoding='utf-8') as f:
            filter_data = json.load(f)

        # 决定当个更新还是全部更新
        # 读取 （RSS源）
        update_opt = request.POST.get('updateOpt', '')
        print(f'updateOpt:{update_opt}')

        with open('feeds/static/RSS_data.json', 'r', encoding='utf-8') as f:

            if update_opt == '':
                # 全部更新
                print('全部更新')
                rss_data = json.load(f)
            else:
                print(f'单独更新:{update_opt}')
                rss_data = {}
                for author, info in json.load(f).items():
                    if update_opt == author:
                        rss_data[author] = info
                # print(rss_data)

        # 用于统计请求成功、失败、其他情况的次数
        success_num = 0    # 成功请求统计
        error_num = 0  # 失败请求统计
        other_num = 0  # 其他情况统计（）

        for key, data in rss_data.items():
            print(f'解析源：{key}')

            content = get_content(data)
            if content == False:
                print(f'{key},请求失败')
                continue

            feed_data = feedparser.parse(content)
            for entry_data in feed_data.entries:
                # 检查标题和描述是否匹配过滤器中的关键字，如果匹配则跳过此文章
                if any(re.search(keyword, entry_data.title, re.IGNORECASE) or re.search(keyword, entry_data.summary, re.IGNORECASE) for keyword in filter_data['filter_title'] + filter_data['filter_summary']):  # noqa:E501
                    print(f'过滤：{entry_data.title}')
                    other_num += 1
                    continue

                try:
                    # 检测是否存在，不存在添加
                    article = Article.objects.get(title=entry_data.title,
                                                  link=entry_data.link)

                except Article.DoesNotExist:

                    try:
                        # 去除HTML标签
                        summary = html_tag_pattern.sub('', entry_data.summary)

                        article = Article.objects.create(
                            title=entry_data.title,
                            link=entry_data.link,
                            summary=summary,
                            author=key,
                            pub_date=time.strftime(
                                "%Y-%m-%d", entry_data.published_parsed)
                        )
                        success_num += 1

                    except AttributeError:
                        # 没有pub_date的情况（或者其他特殊情况）
                        print(f'文章:{entry_data.title},创建失败')
                        error_num += 1
                        continue

        # 请求的话，返回请求结果
        return JsonResponse({'post_info': {
            'success': success_num,
            'error': error_num,
            'other': other_num
        }})
    else:
        print('数据库读取')
        # 从数据库中返回数据
        articles = Article.objects.filter(read_state=False)

        # 移除summary中可能存在的HTML标签
        for article in articles:
            article.summary = html_tag_pattern.sub('', article.summary)

        # category_list = []
        category_list = set()
        # 读取rss_data.json中的类别信息，用于模态窗口的类别选择
        with open(r'D:\systemLibrary\Desktop\RSS\rssreader\feeds\static\RSS_data.json', 'r', encoding='utf-8') as f:
            rss_data = json.load(f)

            for key, data in rss_data.items():
                category_list.add(data['category'])

        return render(request, 'feeds.html', {'articles': articles, "name_list": name_list, "category_list": category_list})


def filter(request):
    """过滤器管理页面,实现添加、删除过滤词逻辑"""
    with open('feeds/static/filter_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    return render(request, 'filter.html', {'data': data})


@csrf_exempt
def filter_delete(request):
    """删除指定关键"""
    if request.method == "POST":
        keywords = json.loads(request.body)

        with open('feeds/static/filter_data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)

        data = {key: [kw for kw in data[key] if kw not in keywords]
                for key in data}

        with open('feeds/static/filter_data.json', "w", encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'success': False, 'message': '请求方法错误！'})


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


@csrf_exempt
def filter_update(request):
    """ 更新过滤器 """
    if request.method == "POST":
        data = json.loads(request.body)
        old_text = data.get('old')
        new_text = data.get('new')
    else:
        return None

    with open("feeds/static/filter_data.json", "r", encoding='utf-8') as f:
        file_data = json.load(f)

    # 旧的类别
    category = 'filter_title' if old_text['category'] == '标题' else 'filter_summary'

    # 仅更新过滤词,从对应类别中删除旧的关键字，添加新的关键字
    if old_text['keyword'] in file_data[category]:
        file_data[category].remove(old_text['keyword'])
        file_data[category].append(new_text['keyword'])

    # 如果类别更新，删除旧类别关键字，新类别添加关键字
    if old_text['category'] != new_text['category']:
        if old_text['category'] == '标题':
            """  
            如果原先是旧的类别是标题，修改的新的类别是描述
            那么从标题类别中移除关键字，给描述类别添加关键字
            相当于转移关键字
            """
            file_data['filter_title'].remove(old_text['keyword'])
            file_data['filter_summary'].append(new_text['keyword'])
        else:
            file_data['filter_summary'].remove(old_text['keyword'])
            file_data['filter_title'].append(new_text['keyword'])

    # 保存
    with open("feeds/static/filter_data.json", "w", encoding='utf-8') as f:
        json.dump(file_data, f, ensure_ascii=False)  # 写入文件

    return JsonResponse({"success": True})


@csrf_exempt
def api_articles(request):
    """获取文章列表(懒加载使用)"""
    html_tag_pattern = re.compile(r'<[^>]+>')  # 去除HTML标签的正则

    data = json.loads(request.body.decode('utf-8'))

    start = int(data.get('start', 0))
    count = int(data.get('count', 0))
    existing_titles = data.get('existingTitles', [])
    read_state = data.get('read_state')
    # author = data.get('author')

    articles = Article.objects.filter(read_state=read_state)[
        start:start+count]

    data = []
    for article in articles:
        # 如果该文章标题已经在之前的卡片中出现过，则不返回该文章
        if article.title in existing_titles:
            continue

        # 去除所有的HTML元素，防止影响卡片布局
        summary = html_tag_pattern.sub('', article.summary)

        data.append({
            'id': article.pk,
            'title': article.title,
            'summary': summary,
            'link': article.link,
            'pub_date': article.pub_date
        })

    return JsonResponse(data, safe=False, json_dumps_params={'ensure_ascii': False})
