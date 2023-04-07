//实现点击下载按钮，拉取数据

$(document).ready(function () {
    // 当用户点击 dropdown item 时，将 item 的值写入 input 的 value 中
    $('.dropdown-item').click(function (event) {
        event.preventDefault(); // 阻止表单的自动提交
        var value = $(this).data('value');
        $('#author-input').val(value);
        $(this).closest('.input-group').find('.dropdown-toggle').text($(this).text());
    });
});

// 同步按钮点击事件
$("#sync").click(function () {
    // 显示loading
    $('<div class="loading"></div>').appendTo('body');
    $('.loading').css('display', 'flex');
    $(".loading").show();

    // 发送请求
    $.ajax({
        url: "/feeds/",
        type: "POST",
        data: { upload: "true" },
        success: function (data) {
            // 隐藏loading
            $(".loading").hide();

            // 刷新页面
            window.location.reload();
        },
        error: function (xhr, status, error) {
            console.log("An error occurred while syncing feeds");
        },
    });
});
// 将单个卡片的点击事件封装成函数
function markCardAsRead(article_id) {
    var url = "/feeds/mark-as-read/" + article_id + "/";
    $.ajax({
        url: url,
        type: "POST",
        dataType: "json",
        data: { csrfmiddlewaretoken: "{{ csrf_token }}" },
        success: function (data) {
            console.log("Article " + article_id + " marked as read");
        },
        error: function (xhr, status, error) {
            console.log("An error occurred while marking the article as read");
        },
    });
}