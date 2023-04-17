// 懒加载代码
let loadedCount = document.querySelectorAll('.card').length;
const cardGroup = document.getElementById('cardGroup');
const loading = document.querySelector('.loading');
// const authorValue = document.getElementById('author-input').innerText;
const totalArticles = parseInt(document.getElementById('total-articles').getAttribute('data-total-articles'));
const existingTitles = [];
let isLoading = false; // 加载标记

function lazyLoad() {
  if (loadedCount >= totalArticles || isSearching || isLoading || window.scrollY === 0) {
    /* 
    符合任一条件则不执行懒加载
    loadedCount >= totalArticles：所有文章都已经加载完毕，不需要继续懒加载
    isSearching：处在筛选器后的页面不搜索,因为懒加载会将所有文章加载出来
    isLoading：当前正在加载文章，不应该重复加载
    window.scrollY === 0：页面还没有滚动过，不应该执行懒加载，防止页面刚加载时就执行懒加载
    */
    return;
  }

  isLoading = true; // 设置正在加载标记
  document.querySelectorAll('.card-title').forEach(title => existingTitles.push(title.innerText));

  // 发送 Ajax 请求，获取更多文章数据
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'feeds/api/articles/', true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  const data = JSON.stringify({
    start: loadedCount,
    count: 12,
    existingTitles: existingTitles,
    // 给后端传输参数，决定返回已读文章还是未读文章
    read_state: window.location.pathname == '/feeds/' ? false : true,
    // 如果模态框中有作者信息，则传递给后端，否则传递空字符串
    // author: authorValue ? authorValue : '',
  });

  // 通过网址，决定后续生成卡片的样式
  card_class = window.location.pathname == '/feeds/' ? 'card' : 'card card-gray';

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const articles = JSON.parse(xhr.responseText);
      let cardHtml = '';
      articles.forEach(article => {
        cardHtml += `
          <div class="col col-sm-6 col-lg-3 mb-4">
            <div class="${card_class}" data-article-id="${article.id}">
              <a href="${article.link}" class="card-link" target="_blank">
                <div class="card-body">
                  <h5 class="card-title text-truncate">${article.title}</h5>
                  <p class="card-text d">${article.summary.slice(0, 65)}</p>
                </div>
                <div class="card-footer position-absolute bottom-0 start-0 end-0 text-end text-muted small">
                  ${article.pub_date}
                </div>
              </a>
            </div>
          </div>
        `;
      });
      cardGroup.innerHTML += cardHtml;
      loadedCount = document.querySelectorAll('.card').length;
      isLoading = false; // 重置正在加载标记
      card_addCickEvent();
      /*  
      为新加载的卡片增加点击事件
      在feeds页面的话，引用的是addReadStatus.js中的card_addCickEvent()函数
      在readed页面的话，引用的是editCard_readstatus.js中的card_addCickEvent()函数
      前者是将卡片变灰，修改成已读
      后者是将卡片变白，修改成未读
      */
      // 
      loading.style.display = 'none';
    }
  };
  xhr.send(data);
}

// 滚动事件
window.addEventListener('scroll', function () {
  // 生成后的文章数量，卡片数量变动，所以要重新获取
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;
  if (scrollPosition >= pageHeight * 0.98 && !isSearching && !isLoading) {
    // 滚动到页面底部的 95% 时触发懒加载
    lazyLoad();
  }
});
