let area;
let xandtext;
let xandcoins;
let speed = 1250;

window.addEventListener('DOMContentLoaded', function() {
    area = document.getElementById("spawning-area");
    xandtext = this.document.getElementById("xandcoins");
    xandcoins = getCookie("xandcoins");
    createObject();
});

function clamp(min, value, max) {
    return Math.min(Math.max(value, min), max);
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "0";
}

function createObject() {
    limpar();

    var image = document.createElement("img");
    image.src = "../../images/lula.jpeg";

    var newObject = document.createElement("button");
    newObject.setAttribute("id", "lula");
    newObject.appendChild(image);
    newObject.onclick = neutralizar;
    area.appendChild(newObject);

    newObject.style.top = clamp(newObject.offsetHeight, Math.floor(Math.random() * area.offsetHeight), area.offsetHeight - newObject.offsetHeight) + "px";
    newObject.style.left = clamp(newObject.offsetWidth, Math.floor(Math.random() * area.offsetWidth), area.offsetWidth - newObject.offsetWidth) + "px";

    setTimeout(createObject, Math.max(100, speed));
}

function neutralizar() {
    const lula = document.getElementById('lula');
    lula.remove();
    xandcoins++;
    xandtext.innerHTML = "Você tem " + xandcoins + " Xandcoins";
    speed -= 35;
    document.cookie = "xandcoins=" + xandcoins + ";";
}

function limpar() {
    const lula = document.getElementById('lula');
    if(lula) lula.remove();
}