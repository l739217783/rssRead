// 检测页面是否有重复的卡片

const divs = document.querySelectorAll('div.card');
const idMap = {};
divs.forEach(function (div) {
    const id = div.getAttribute('data-article-id');
    if (id) {
        if (id in idMap) {
            idMap[id]++;
        } else {
            idMap[id] = 1;
        }
    }
});

const duplicateIds = Object.entries(idMap).filter(function (entry) {
    return entry[1] > 1;
});

if (duplicateIds.length > 0) {
    console.log('以下data-article-id在页面中出现了多次：');
    duplicateIds.forEach(function (entry) {
        console.log(entry[0] + ': ' + entry[1] + '次');
    });
} else {
    console.log('页面中没有重复的data-article-id。');
}
