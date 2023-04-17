import json

with open(r'D:\systemLibrary\Desktop\RSS\rssreader\feeds\static\RSS_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(type(data))
for i in data:
    print(i, type(i))
