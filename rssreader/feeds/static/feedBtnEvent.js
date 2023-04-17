//一些按钮的事件绑定

$(document).ready(function () {
    /* 下拉菜单选择作者后，将作者的值写入 input 中 */
    $('.dropdown-item').click(function (event) {
        // 阻止表单的自动提交,防止点击后页面刷新
        event.preventDefault();
        var value = $(this).data('value');
        $('#author-input').val(value);
        $(this).closest('.input-group').find('.dropdown-toggle').text($(this).text());
    });
});

$("#sync").click(function () {
    /* 给同步按钮绑定点击事件 */

    // 显示loading动画
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

$("#archive").click(function () {
    /* 给归档按钮绑定点击事件 */
    $(".card-link").each(function () {
        var article_id = $(this).closest(".card").data("article-id");
        markCardAsRead(article_id, true);
        // $(this).closest(".card").remove();
        this.closest('.card').classList.add('card-gray');

    });
    // setTimeout(() => {
    //   window.location.reload();
    // }, 2000);
});