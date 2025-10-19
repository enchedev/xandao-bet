var ttc = document.getElementById('container');
document.addEventListener('click', function (event) {
    if (event.x > +ttc.style.x &&
        event.x < +ttc.style.x + +ttc.style.width &&
        event.y > +ttc.style.y &&
        event.y < +ttc.style.y + +ttc.style.height) {
        console.log("Inside box!");
        var innerX = event.x - +ttc.style.x;
        var innerY = event.y - +ttc.style.y;
        console.log(innerX / 3);
        console.log(innerY / 3);
    }
});
document.addEventListener('DOMContentLoaded', function () {
    var container = document.querySelector('#container');
    for (var i = 1; i <= 3; ++i) {
        var line = document.querySelector("#container .l");
        line.style.width = container.offsetWidth + 'px';
        line.style.height = Math.trunc(container.offsetHeight / 3) + 'px';
        console.log("height ".concat(container.offsetHeight));
        for (var j = 1; j <= 3; ++j) {
            var cell = document.querySelector("#container .l ".concat(i));
            cell.style.width = Math.trunc(line.offsetWidth / 3) + 'px';
            cell.style.height = line.offsetHeight + 'px';
        }
    }
});
