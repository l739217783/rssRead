
import json


with open(r'D:\systemLibrary\Desktop\RSS\rssreader\feeds\static\RSS_data.json', 'r', encoding='utf-8') as f:
    for author, info in json.load(f).items():
        print(author, info)
