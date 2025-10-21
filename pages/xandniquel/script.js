const reelSymbols = [
    '../../images/luiz inacio droid da silva.jpg',
    '../../images/lula.jpeg',
    '../../images/marcal cadeira.jpg',
    '../../images/michel temer.png',
    '../../images/monark acorda.jpg',
    '../../images/stalin colher.jpg',
    '../../images/supermito.jpg',
    '../../images/xandao.jpeg'
];
var reel1;
var reel2;
var reel3;
var btn;
var message;

window.addEventListener('DOMContentLoaded', function() {
    reel1 = document.getElementById('reel-1');
    reel2 = document.getElementById('reel-2');
    reel3 = document.getElementById('reel-3');
    btn = document.getElementById('btn');
    message = document.getElementById('message');
});

let count = 0;

function spin() {
    if(count == 0) {
        message.textContent = "";
        btn.onclick = "";
    }
    count++;
    reel1.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    reel2.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    reel3.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    if(count < 40) setTimeout(spin, 50);
    else {
        count = 0;
        btn.onclick = spin;
        check();
        return;
    }
}

function ferramentaSecreta() {
    if(count == 0) {
        message.textContent = "";
        btn.onclick = "";
    }
    count++;
    reel1.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    reel2.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    reel3.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    if(count < 40) setTimeout(ferramentaSecreta, 50);
    else {
        var x = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
        reel1.src = x;
        reel2.src = x;
        reel3.src = x;
        count = 0;
        btn.onclick = spin;
        check();
        return;
    }
}

function check() {
    if(reel1.src == reel2.src && reel2.src == reel3.src) {
        message.textContent = "Jackpot";
    }
}
