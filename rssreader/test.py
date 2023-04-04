import json

with open(r'D:\systemLibrary\Desktop\RSS\rssreader\feeds\static\filter_data.json', 'r') as f:
    filter_data = json.load(f)

for keyword in filter_data['filter_title'] + filter_data['filter_summary']:
    print(keyword)
