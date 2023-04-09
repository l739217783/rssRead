// 修改卡片已读状态成未读状态


// 为所有卡片增加点击事件，左键点击和中键点击的时候，卡片变白色，同时修改卡片的成未读状态
function card_addCickEvent() {
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


// 阻止链接的默认行为
function handleLinkClick(event) {
    event.preventDefault();
}

// 监听所有链接
const links = document.querySelectorAll('a.card-link');
links.forEach(link => {
    link.addEventListener('click', handleLinkClick);
});





// 请求修改卡片阅读状态
function markCardAsRead(article_id, status) {
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
