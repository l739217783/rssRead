// 为卡片绑定点击事件

function card_addCickEvent() {
    /* 卡片点击事件重置 */

    const cardList = document.querySelectorAll('.card')
    cardList.forEach(card => {
        card.addEventListener('click', handleCardClick);

    });

    function handleCardClick(event) {
        const elem = event.target.closest('.form-check-input');

        // 根据复选框状态执行相应操作

        if (!elem) {  // 获取点击的元素，判断是否为复选框(卡片区域是null,复选为返回input)
            const checkbox = event.currentTarget.querySelector('.form-check-input');
            if (checkbox) {  // 检测是否有复选框
                event.preventDefault();
                // 有复选框，禁止跳转链接
                checkbox.checked = !checkbox.checked;
            } else {
                // 没有复选框，跳转链接，标记已读
                const article_id = event.currentTarget.dataset.articleId;
                markCardAsRead(article_id, true);
            }
        }
    }
}

function markCardAsRead(article_id, status) {
    /* 请求后端，修改对应卡片的阅读状态 */
    var url = "/feeds/mark-as-read/" + article_id + "/";
    $.ajax({
        url: url,
        type: "POST",
        dataType: "json",
        data: { csrfmiddlewaretoken: "{{ csrf_token }}", status: status },
        success: function (data) {
            console.log("Article " + article_id + " marked as read");
            location.reload();
        },
        error: function (xhr, status, error) {
            console.log("An error occurred while marking the article as read");
        },
    });
}

$(document).ready(function () {
    card_addCickEvent()
});

