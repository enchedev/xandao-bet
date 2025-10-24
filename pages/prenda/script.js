let area;
let xandcoins;
let speed = 1250;
let multip = 1;
let start;
const ninguem = new Audio("../../audio/bolsonaro-ninguem.mp3");
const pegaram = new Audio("../../audio/bolsonaro-pegaram.mp3");

window.addEventListener('DOMContentLoaded', function() {
    area = document.getElementById("spawning-area");
    start = document.getElementById("start");

    xandcoins = localStorage.getItem("xandcoins");
    if(!xandcoins || xandcoins == 'NaN') xandcoins = 0;
    document.querySelector('.xandcoins p').textContent = xandcoins;
});

function clamp(min, value, max) {
    return Math.min(Math.max(value, min), max);
}

function setCookie(c_name, value) {
    localStorage.setItem(c_name, value);
}

function comecar() {
    start.onclick = "";
    ninguem.play();
    createObject();

    document.querySelector('#start').style.display = 'none';
}

function createObject() {
    limpar();

    var image = document.createElement("img");
    image.src = "../../images/bolsonaro celular.jpg";

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
    xandcoins = parseInt(xandcoins) + parseInt  (10 * multip);
    multip++;
    document.querySelector('.xandcoins p').textContent = xandcoins;
    speed -= 35;
    setCookie("xandcoins", xandcoins);
    
    if(!pegaram.ended) {
        pegaram.pause();
        pegaram.currentTime = 0;
    }

    pegaram.play();
}

function limpar() {
    const lula = document.getElementById('lula');
    if(lula) lula.remove();
}