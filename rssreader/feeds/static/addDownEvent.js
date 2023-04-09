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
