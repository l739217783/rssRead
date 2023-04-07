// 为所有卡片增加点击事件，左键点击和中键点击的时候，卡片变灰色

function card_addCickEvent() {
    const cards = document.querySelectorAll('.card-link');
    cards.forEach(card => {
        card.addEventListener('mousedown', function (event) {
            if (event.which === 1 || event.which === 2) {
                this.closest('.card').classList.add('card-gray');
                const article_id = this.closest('.card').dataset.articleId;
                markCardAsRead(article_id);
            }
        });
    });

    // 全部已读按钮的点击事件
    $("#archive").click(function () {
        $(".card-link").each(function () {
            var article_id = $(this).closest(".card").data("article-id");
            markCardAsRead(article_id);
            // $(this).closest(".card").remove();
            this.closest('.card').classList.add('card-gray');

        });
        // setTimeout(() => {
        //   window.location.reload();
        // }, 2000);
    });

}

$(document).ready(function () {
    card_addCickEvent() // 所有卡片增加点击事件+按钮添加点击事件
});

