// 顶部按钮组绑定事件

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
                checkbox.remove();
            });

            // 移除active类
            addCheckboxBtn.classList.remove("active");
        } else { // 如果按钮处于未激活状态
            // 获取所有卡片
            const cards = document.querySelectorAll(".card");

            // 遍历所有卡片并为其添加复选框
            cards.forEach(function (card, index) {
                // 创建复选框
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `check${index + 1}`;
                checkbox.className = "form-check-input position-absolute top-0 end-0";
                checkbox.addEventListener('click', function (event) {
                    // 阻止冒泡，避免触发 cardLink 的点击事件
                    event.stopPropagation();
                });

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

function addRss() {
    /* 添加按钮绑定事件 */
    const addBtn = document.getElementById("addBtn");
    const addModal = document.getElementById("addModal");
    const addFeedTitleInput = document.getElementById("addFeedTitleInput");
    const addFeedLinkInput = document.getElementById("addFeedLinkInput");
    const addFeedDescriptionInput = document.getElementById("addFeedDescriptionInput");
    const addFeedBtn = document.getElementById("addFeedBtn");

    // 添加源按钮点击事件监听器
    addBtn.addEventListener("click", function () {
        // 打开添加源模态框
        const modal = new bootstrap.Modal(addModal);
        modal.show();
    });

    // 添加按钮 click 事件监听器
    addFeedBtn.addEventListener("click", function () {
        // 获取输入框中的值
        const title = addFeedTitleInput.value;
        const link = addFeedLinkInput.value;
        const description = addFeedDescriptionInput.value;
        const category = addFeedCategoryInput.value;
        $.ajax({
            url: addFeedUrl,
            method: "POST",
            data: {
                feedName: title,
                feedLink: link,
                feedDescription: description,
                feedCategory: category,
                csrfmiddlewaretoken: csrf_token,
            },
            success: function (response) {
                // 当 AJAX 请求成功时执行
                if (response.success) {
                    // 关闭模态窗口
                    $('#addModal').modal('hide');
                    // 刷新页面
                    window.location.reload();
                } else {
                    // 显示错误信息
                    alert(response.message);
                }
            },
            error: function () {
                // 当 AJAX 请求出错时执行
                alert("添加失败.");
            },
        });
    });
}




function deleteRss() {
    /* 删除按钮绑定事件 */
    const deleteBtn = document.getElementById("delteBtn");
    deleteBtn.addEventListener("click", function () {
        // 获取所有被选中的复选框
        const checkboxes = document.querySelectorAll(".form-check-input:checked");
        if (checkboxes.length === 0) {
            alert("请先选择要删除的项");
            return;
        }
        // 获取所有被选中的卡片的名称
        const names = [];
        checkboxes.forEach(function (checkbox) {
            const card = checkbox.closest(".card");
            const name = card.querySelector(".card-title").textContent;
            names.push(name);
        });
        // 发送删除请求
        $.ajax({
            url: delFeedUrl,
            method: "POST",
            data: {
                names: names,
                csrfmiddlewaretoken: csrf_token,
            },
            traditional: true,
            success: function (response) {
                // 当 AJAX 请求成功时执行
                if (response.success) {
                    // 重新加载页面
                    location.reload();
                } else {
                    // 显示错误信息
                    alert(response.message);
                }
            },
            error: function () {
                // 当 AJAX 请求出错时执行
                alert("删除失败.");
            },
        });
    });
}

function carDeleteBtn() {
    // 编辑模态窗删除按钮添加事件
    const deleteBtn = document.getElementById("carDeleteBtn");
    deleteBtn.addEventListener("click", function () {

        // 获取需要删除的名称
        const names = [document.querySelector('#feedTitleInput').value];

        // 发送删除请求
        $.ajax({
            url: delFeedUrl,
            method: "POST",
            data: {
                names: names,
                csrfmiddlewaretoken: csrf_token,
            },
            traditional: true,
            success: function (response) {
                // 当 AJAX 请求成功时执行
                if (response.success) {
                    // 重新加载页面
                    location.reload();
                } else {
                    // 显示错误信息
                    alert(response.message);
                }
            },
            error: function () {
                // 当 AJAX 请求出错时执行
                alert("删除失败.");
            },
        });
    });
}

function refreshRss() {
    // 编辑按钮点击事件
    document.querySelectorAll('.edit-feed-btn').forEach(function (button) {
        button.addEventListener('click', function (event) {
            const feedTitleInput = document.querySelector('#feedTitleInput');
            const feedLinkInput = document.querySelector('#feedLinkInput');
            const feedCategoryInput = document.querySelector('#feedCategoryInput');
            const feedDescriptionInput = document.querySelector('#feedDescriptionInput');
            const { feedTitle, feedLink, feedDescription, feedCategory } = event.currentTarget.dataset;
            feedTitleInput.value = feedTitle;
            feedLinkInput.value = feedLink;
            feedDescriptionInput.value = feedDescription;
            feedCategoryInput.value = feedCategory;

        });
    });

    // 模态窗保存按钮点击事件
    document.querySelector('#saveChangesBtn').addEventListener('click', function () {
        // 定位输入框
        const feedTitleInput = document.querySelector('#feedTitleInput');
        const feedLinkInput = document.querySelector('#feedLinkInput');
        const feedDescriptionInput = document.querySelector('#feedDescriptionInput');
        const feedCategorInput = document.querySelector('#feedCategoryInput');
        // 获取输入框中的值
        const feedTitle = feedTitleInput.value;
        const feedCategor = feedCategorInput.value;
        const feedLink = feedLinkInput.value;
        const feedDescription = feedDescriptionInput.value;
        const feedId = document.querySelector('#editModal').dataset.feedId;
        console.log(feedTitle, feedLink, feedDescription, feedId)
        $.ajax({
            url: updateFeedUrl,
            method: "POST",
            data: {
                feedId: feedId,
                feedName: feedTitle,
                feedLink: feedLink,
                feedCategor: feedCategor,
                feedDescription: feedDescription,
                csrfmiddlewaretoken: csrf_token,
            },
            success: function (response) {
                // 当 AJAX 请求成功时执行
                if (response.success) {
                    // 关闭模态窗口
                    $('#editModal').modal('hide');
                    // 刷新页面
                    window.location.reload();
                } else {
                    // 显示错误信息
                    alert(response.message);
                }
            },
            error: function () {
                // 当 AJAX 请求出错时执行
                alert("保存失败.");
            },
        });
    });
}