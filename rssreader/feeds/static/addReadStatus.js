// 为卡片绑定点击事件

function card_addCickEvent() {
    /* 卡片增加点击事件， 点击后变灰，请求卡片为已读*/
    const cards = document.querySelectorAll('.card-link');
    cards.forEach(card => {
        card.addEventListener('mousedown', function (event) {
            if (event.which === 1 || event.which === 2) {
                this.closest('.card').classList.add('card-gray');
                const article_id = this.closest('.card').dataset.articleId;
                markCardAsRead(article_id, true);
            }
        });
    });
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
        },
        error: function (xhr, status, error) {
            console.log("An error occurred while marking the article as read");
        },
    });
}

$(document).ready(function () {
    card_addCickEvent() // 所有卡片增加点击事件+按钮添加点击事件
});

