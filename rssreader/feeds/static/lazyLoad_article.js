


// 懒加载代码
let loadedCount = document.querySelectorAll('.card').length;
const cardGroup = document.getElementById('cardGroup');
const loading = document.querySelector('.loading');
const totalArticles = parseInt(document.getElementById('total-articles').getAttribute('data-total-articles'));

function lazyLoad() {
  if (loadedCount >= totalArticles) {
    // 所有文章都已经加载完毕，不需要继续懒加载
    return;
  }
  if (isSearching) {
    // 处在筛选器后的页面不搜索
    return;
  }

  // 显示加载动画
  loading.style.display = 'flex';

  // 发送 Ajax 请求，获取更多文章数据
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'feeds/api/articles?start=' + loadedCount + '&count=12', true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const articles = JSON.parse(xhr.responseText);
      let cardHtml = '';
      articles.forEach(article => {
        cardHtml += `
          <div class="col col-sm-6 col-lg-3 mb-4">
            <div class="card" data-article-id="${article.id}">
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
      loading.style.display = 'none';
    }
  };
  xhr.send(null);
}

// 滚动事件
window.addEventListener('scroll', function () {
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;
  if (scrollPosition >= pageHeight * 0.95 && !isSearching) {
    // 滚动到页面底部的 95% 时触发懒加载
    lazyLoad();
  }
});
