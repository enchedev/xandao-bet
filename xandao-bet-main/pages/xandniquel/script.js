const reelSymbols = ['images/luiz inacio droid da silva.jpg', '🍋', '🍊', '🍉', '🍇', '🔔', '💎'];
// TODO: arrumar isso de cima ai
var reel1;
var reel2;
var reel3;
var message;

window.addEventListener('DOMContentLoaded', function() {
    reel1 = document.getElementById('reel-1');
    reel2 = document.getElementById('reel-2');
    reel3 = document.getElementById('reel-3');
    message = document.getElementById('message');
});

function getRandomImage() {
    const randomIndex = Math.floor(Math.random() * reelSymbols.length);
    return reelSymbols[randomIndex];
}

function spinReels() {
    message.textContent = '';
    
    reel1.style.backgroundImage = "url(" + getRandomImage() + ")";
    reel2.style.backgroundImage = "url(" + getRandomImage() + ")";
    reel3.style.backgroundImage = "url(" + getRandomImage() + ")";
    
    setTimeout(() => {
        if (reel1.style.backgroundImage === reel2.style.backgroundImage && reel2.style.backgroundImage === reel3.style.backgroundImage) {
            message.textContent = 'Você venceu! 🎉';
        } else {
            message.textContent = 'Tente novamente! 😞';
        }
    }, 1000);
}

let count = 0;
function spin() {
    reel1.style.backgroundImage = "url(" + getRandomImage() + ")";
    reel2.style.backgroundImage = "url(" + getRandomImage() + ")";
    reel3.style.backgroundImage = "url(" + getRandomImage() + ")";
    if(count < 50) setTimeout(spin, 50);
}