// 筛选器
$(document).ready(function () {
    $("#search-btn").click(function () {
        var keyword = $("#keyword-input").val();
        var author = $("#author-input").val();
        isSearching = true;
        $.ajax({
            url: "feeds/search/",
            type: "POST",
            data: { keyword: keyword, author: author },
            dataType: "json",
            success: function (data) {
                // 这里的data是从服务器端返回的响应数据，可以通过该对象来获取响应数据
                // 因为使用的是dataType: "json"，所以data会被解析成一个 JSON 对象。

                $('#add-filter-modal').modal('hide'); // 关闭模态窗口
                $('#cardGroup').empty(); // 清空已有卡片

                // 循环遍历所有文章
                for (var i = 0; i < data.length; i++) {
                    var article = data[i];

                    // 生成HTML代码
                    var cardHtml = `
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
                    // 添加到页面
                    $('#cardGroup').append(cardHtml);
                }
                // 重新绑定卡片点击事件
                card_addCickEvent();
            },
            error: function (xhr, status, error) {
                console.log("An error occurred while searching");
            }
        });
    });

    // 移除懒加载
    // 定义空的 lazyLoad 函数
    function lazyLoad() { }

    // 移除 lazyLoad() 调用
    window.addEventListener('scroll', function () {
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;
        if (scrollPosition >= pageHeight) {
            // lazyLoad();  // 移除该行代码
        }
    });
    // 移除懒加载事件
    window.removeEventListener('scroll', lazyLoad);
});