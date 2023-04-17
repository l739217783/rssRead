// 筛选器
$(document).ready(function () {
    $("#search-btn").click(function () {
        var keyword = $("#keyword-input").val();
        var author = $("#author-input").val();

        // 清空 author 选项并强制清除下拉框的选中状态
        $("#author-input").val("");
        $(".dropdown-toggle").text("Select Author"); // 恢复按钮上的文本

        isSearching = true;
        // 给后端传输参数，决定返回已读文章还是未读文章
        read_state = window.location.pathname == '/feeds/' ? false : true
        card_class = window.location.pathname == '/feeds/' ? 'card' : 'card card-gray';

        $.ajax({
            url: "feeds/search/",
            type: "POST",
            data: {
                keyword: keyword,
                author: author,
                read_state: read_state
            },
            dataType: "json",
            success: function (data) {
                // 这里的data是从服务器端返回的响应数据，可以通过该对象来获取响应数据
                // 因为使用的是dataType: "json"，所以data会被解析成一个 JSON 对象。

                // 重置模态窗口
                $("#exampleModalLabel").text("Search Form"); // 将标题设置为默认值
                $("#keyword-input").val(""); // 清空keyword输入框
                $('#add-filter-modal').modal('hide'); // 关闭模态窗口
                $('#cardGroup').empty(); // 清空已有卡片

                if (data == 'load_HomePage') {
                    //没有任何选项的话,重新加载页面
                    location.reload()
                }
                // 循环遍历所有文章
                for (var i = 0; i < data.length; i++) {
                    var article = data[i];

                    // 生成HTML代码
                    var cardHtml = `
                        <div class="col col-sm-6 col-lg-3 mb-4">
                            <div class="${card_class}" data-article-id="${article.id}">
                            <a href="${article.link}" class="card-link" target="_blank">
                                <div class="card-body">
                                <h5 class="card-title text-truncate">${article.title}</h5>
                                <p class="card-text d">${article.summary}</p>
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
