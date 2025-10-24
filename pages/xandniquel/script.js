const reelSymbols = [
    '../../images/luizinaciodroiddasilva.jpg',
    '../../images/lula.jpeg',
    '../../images/marcalcadeira.jpg',
    '../../images/micheltemer.png',
    '../../images/monarkacorda.jpg',
    '../../images/stalincolher.jpg',
    '../../images/supermito.jpg',
    '../../images/xandao.jpeg'
];
var reel1;
var reel2;
var reel3;
var btn;
var premium;
var message;
var xandcoins = 0;
var audio = new Audio("../../audio/niquel.mp3");
var loss = new Audio("../../audio/boowomp.mp3");
var win = [
    new Audio("../../audio/lula1.mp3"),
    new Audio("../../audio/lula2.mp3"),
    new Audio("../../audio/marcal.mp3"),
    new Audio("../../audio/temer.mp3"),
    new Audio("../../audio/monark.mp3"),
    new Audio("../../audio/stalin.mp3"),
    new Audio("../../audio/bolsonaro.mp3"),
    new Audio("../../audio/xandao.mp3")
];

window.addEventListener('DOMContentLoaded', function() {
    reel1 = document.getElementById('reel-1');
    reel2 = document.getElementById('reel-2');
    reel3 = document.getElementById('reel-3');
    btn = document.getElementById('btn');
    premium = document.getElementById('premium');
    message = document.getElementById('message');

    xandcoins = this.localStorage.getItem("xandcoins");
    if(!xandcoins || xandcoins == 'NaN') xandcoins = 0;
    document.querySelector('.xandcoins p').textContent = xandcoins;
    
    reel1.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    reel2.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    reel3.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];

    this.document.querySelector('.casino').style.height = this.document.body.offsetHeight + 'px';
});

function setCookie(c_name, value) {
    localStorage.setItem(c_name, value);
}

let count = 0;

function spin() {
    if(count == 0) {
        if(xandcoins < 500) {
            message.textContent = "Falta Xandcoins! Vá desviar mais verba!!!";
            return;
        }
        changeXands(-500);
        message.textContent = "";
        btn.onclick = "";
        premium.onclick = "";
        audio.play();
    }
    count++;
    reel1.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    reel2.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    reel3.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    if(count < 47) setTimeout(spin, 50);
    else {
        check();
        return;
    }
}

function ferramentaSecreta() {
    if(count == 0) {
        message.textContent = "";
        btn.onclick = "";
        premium.onclick = "";
        audio.play();
    }
    count++;
    reel1.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    reel2.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    reel3.src = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
    if(count < 47) setTimeout(ferramentaSecreta, 50);
    else {
        var y = Math.floor(Math.random() * reelSymbols.length);
        reel1.src = reelSymbols[y];
        reel2.src = reelSymbols[y];
        reel3.src = reelSymbols[y];
        check(y);
        return;
    }
}

function check(x) {
    var dura;
    audio.pause();
    audio.currentTime = 0;

    if(reel1.src == reel2.src && reel2.src == reel3.src) { // vitoria
        message.textContent = "JACKPOT!!!";
        win[x].play();
        confettiCelebration();
        changeXands(5000);
        dura = win[x].duration;
    } else {
        loss.play();
        dura = loss.duration;
    }
    
    setTimeout(() => { // resetar qnd acabar os sons
        count = 0;
        btn.onclick = spin;
        premium.onclick = ferramentaSecreta;
    }, dura*1000);
}

function changeXands(coinsChange) {
    xandcoins = parseInt(xandcoins) + parseInt(coinsChange);
    setCookie("xandcoins", xandcoins);
    document.querySelector('.xandcoins p').textContent = xandcoins;
}

function confettiCelebration() {
    confetti({
        particleCount: 1000,
        spread: 800,
        origin: { y: 0.6 }
    });

    // Pequenos disparos extras para dar um efeito mais natural
    setTimeout(() => {
        confetti({
            particleCount: 750,
            spread: 1000,
            origin: { x: 0.2, y: 0.6 },
            colors: ['#FFD700', '#FF4500', '#00FF7F', '#1E90FF']
        });
    }, 250);

    setTimeout(() => {
        confetti({
            particleCount: 750,
            spread: 1000,
            origin: { x: 0.8, y: 0.6 },
            colors: ['#FFD700', '#FF69B4', '#00CED1', '#ADFF2F']
        });
    }, 400);

    setTimeout(() => {
        confetti({
            particleCount: 750,
            spread: 1000,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FF4500', '#00FF7F', '#1E90FF']
        });
    }, 800);

    setTimeout(() => {
        confetti({
            particleCount: 750,
            spread: 1000,
            origin: { x: 0.2, y: 0.6 },
            colors: ['#FFD700', '#FF4500', '#00FF7F', '#1E90FF']
        });
    }, 1200);

    setTimeout(() => {
        confetti({
            particleCount: 750,
            spread: 1000,
            origin: { x: 0.8, y: 0.6 },
            colors: ['#FFD700', '#FF69B4', '#00CED1', '#ADFF2F']
        });
    }, 1600);
}
