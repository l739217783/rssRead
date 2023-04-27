//一些按钮的事件绑定

$(document).ready(function () {
    /* 下拉菜单选择作者后，将作者的值写入 input 中 */
    $('#author-dropdown').on('click', 'a.dropdown-item', function (event) {
        event.preventDefault();
        var value = $(this).data('value');
        $('#author-input').val(value);
        $(this).closest('.input-group').find('.dropdown-toggle').text($(this).text());
        authorValue = value;
    });

    /* 下拉菜单选择分类后，将分类的值写入 input 中 */
    $('#category-dropdown').on('click', 'a.dropdown-item', function (event) {
        event.preventDefault();
        var value = $(this).data('value');
        $('#category-input').val(value);
        $(this).closest('.input-group').find('.dropdown-toggle').text($(this).text());

        // 发送 AJAX 请求
        $.ajax({
            url: '/feeds/updateNameList',
            type: 'POST',
            data: { 'category': value },
            dataType: 'json',
            success: function (data) {
                // 将返回的数据更新到作者下拉菜单中
                var nameDropdown = $('#author-input').closest('.input-group').find('.dropdown-menu');
                nameDropdown.empty(); // 先清空下拉菜单中的选项
                $.each(data, function (index, name) {
                    nameDropdown.append('<li><a class="dropdown-item" href="#" data-value="' + name + '">' + name + '</a></li>');
                });
            }
        });
    });
});


// 添加复选checkbox 点击事件
toggleCheckboxDisplay();
function toggleCheckboxDisplay() {
    /* 编辑按钮绑定事件(显示隐藏复选框) */

    // 获取添加复选框按钮和状态
    const addCheckboxBtn = document.getElementById("addCheckboxBtn");
    let isActivated = false; // 默认为未激活状态


    // 为添加复选框按钮添加点击事件监听器
    addCheckboxBtn.addEventListener("click", function () {
        if (isActivated) { // 如果按钮处于激活状态
            // 获取所有卡片
            const cards = document.querySelectorAll(".card");

            // 遍历所有卡片并移除复选框
            cards.forEach(function (card, index) {
                const checkbox = card.querySelector(".form-check-input");
                if (checkbox) {
                    checkbox.remove();
                }


            });

            // 移除active类
            const addCheckboxBtn = document.getElementById("addCheckboxBtn");
            addCheckboxBtn.classList.remove("active");
        } else { // 如果按钮处于未激活状态
            // 获取所有卡片
            const cards = document.querySelectorAll(".card");

            // 遍历所有卡片并为其添加复选框
            cards.forEach(function (card, index) {
                // 创建复选框
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = index + 1;
                checkbox.className = "form-check-input position-absolute top-0 end-0";

                // 移除原有的卡片点击事件


                // checkbox.addEventListener('click', function (event) {
                //     // 阻止冒泡，避免触发 cardLink 的点击事件
                //     event.stopPropagation();
                // });

                // 将复选框添加到卡片中
                const cardLink = card.querySelector(".card-link");
                cardLink.insertBefore(checkbox, cardLink.firstChild);
            });
            // 添加active类
            addCheckboxBtn.classList.add("active");
        }

        // 切换按钮状态
        isActivated = !isActivated;
    });
}


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
        data: { updateOpt: authorValue },
        success: function (data) {
            // 隐藏loading
            $(".loading").hide();

            console.log(data);
            // 解析服务器返回的 JSON 数据
            var postInfo = data.post_info;

            // 显示成功、错误和其它文章的数量信息
            alert(`成功上传 ${postInfo.success} 篇文章，解析失败 ${postInfo.error} 篇，过滤掉 ${postInfo.other} 篇。`);


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

    const checkbox = document.querySelectorAll('.form-check-input');
    const checked = document.querySelectorAll('.form-check-input:checked');

    // 没有复选框情况：先提示是否归档所有文章，再归档
    if (checkbox.length == 0) {
        result = confirm('是否归档所有文章？');
        if (result) {
            $(".card-link").each(function () {
                var article_id = $(this).closest(".card").data("article-id");
                markCardAsRead(article_id, true);
                // $(this).closest(".card").remove();
                this.closest('.card').classList.add('card-gray');

            });
        }
    }

    // 有复选框的情况
    if (checkbox.length > 0 && checked.length === 0) {
        alert('请选择要归档的文章');
        return;
    } else if (checked.length > 0) {
        // 归档复选框选中的文章
        $(checked).each(function () {
            var article_id = $(this).closest(".card").data("article-id");
            markCardAsRead(article_id, true);
            // $(this).closest(".card").remove();
            this.closest('.card').classList.add('card-gray');
        });
    }

    // setTimeout(() => {
    //   window.location.reload();
    // }, 2000);
});