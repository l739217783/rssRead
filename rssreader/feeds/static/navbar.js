
//显示当前位置

// 获取当前页面的路径
var path = location.pathname;
console.log(path)
// 检查路径是否匹配对应的导航链接，如果匹配则添加active类
if (path === "/feeds/") {
    document.querySelector('a[href="feeds/"]').classList.add("active");
    console.log(1);
} else if (path === "/feeds/manager/") {
    document.querySelector('a[href="feeds/manager"]').classList.add("active");
    console.log(2);

} else if (path === "/feeds/filter/") {
    document.querySelector('a[href="feeds/filter"]').classList.add("active");
    console.log(3);

} else if (path === "/feeds/readed/") {
    document.querySelector('a[href="feeds/readed"]').classList.add("active");
    console.log(4);
}
