// 为卡片绑定点击事件

function card_addCickEvent() {
    /* 卡片增加点击事件， 点击后变白，请求恢复卡片为未*/
    const cards = document.querySelectorAll('.card-link');
    cards.forEach(card => {
        card.addEventListener('mousedown', function (event) {
            if (event.which === 1 || event.which === 2) {
                const cardElement = this.closest('.card');
                if (cardElement.classList.contains('card-gray')) {
                    cardElement.classList.remove('card-gray');
                }
                const article_id = cardElement.dataset.articleId;
                markCardAsRead(article_id, false);
            }
        });
    });
}

function handleLinkClick(event) {
    /* 阻止链接的默认行为 */
    event.preventDefault();
}

// 监听所有链接
const links = document.querySelectorAll('a.card-link');
links.forEach(link => {
    link.addEventListener('click', handleLinkClick);
});

function markCardAsRead(article_id, status) {
    /* 请求修改卡片阅读状态，修改为未读状态 */
    var url = "/feeds/mark-as-read/" + article_id + "/";
    $.ajax({
        url: url,
        type: "POST",
        dataType: "json",
        data: { csrfmiddlewaretoken: "{{ csrf_token }}", status: status },
        success: function (data) {
            console.log("卡片" + article_id + ",移除已读状态成功");
        },
        error: function (xhr, status, error) {
            console.log("移除卡片已读状态失败");
        },
    });
}


$(document).ready(function () {
    card_addCickEvent() // 所有卡片增加点击事件
});
