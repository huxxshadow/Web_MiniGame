// 等待页面加载完毕后执行
document.addEventListener('DOMContentLoaded', function () {
    // 获取HTML元素
    var visitElement = document.getElementsByClassName('total-visits');

    // 如果该元素存在，则插入访问人数
    if (visitElement[0]) {
        visitElement[0].setAttribute('data-end', parseInt(visitData.totalVisits, 10) + 245);

    }
});