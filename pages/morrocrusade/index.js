let blockInput = false;
let xands = 0;
let warningSpan = document.querySelector('.warning');

let cellMap = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
];

const delay = ms => new Promise(res => setTimeout(res, ms));
function setCookie(c_name, value) {
    localStorage.removeItem("xandcoins");
    localStorage.setItem(c_name, value);
}

window.onresize = () => {
    window.location.reload();
};


document.addEventListener('DOMContentLoaded', () => {
    let container = document.querySelector('#container');

    let lines = document.querySelectorAll(`#container .l`)
        .forEach( (line, index) => {
            line.style.width = container.offsetWidth + 'px';
            line.style.height = Math.trunc(container.offsetHeight / 3) + 'px';
            
            for(var j = 0; j < 3; ++j)
            {
                var cell = document.querySelector(`#container .l${index} .c${j}`);
        
                cell.style.width = Math.trunc(line.offsetWidth / 3) + 'px';
                cell.style.height = line.offsetHeight + 'px';

                // console.log(`cellMap[${index}][${j - 1}] = true;`)
                cellMap[index][j] = 0;
            }
        });

    xands = +localStorage.getItem("xandcoins");
    
    if(!xands || xands == 'NaN') xands = 0;
    updateXands();

    // 1 in r chance of bot starting
    var chance = Math.trunc(Math.random() * 10);
    if(chance % 3 === 1) botGuess();
});

function draw() {
    // if(checkWin()) return;
    document.documentElement.style.setProperty('--tcolor', 'lightblue');
    blockInput = true;
    document.querySelector('.title').textContent = "Empate."
    document.querySelector('.subtitle').textContent = "Você e Stalin, agora travados numa guerra sem fim, perpétuamente aterrorizam o morro, transformando-o num campo de guerra de proporções genocidas. Lutam até as favelas desmoronarem sob o peso de seus soldados, por uma terra onde ninguém mais vive."
    document.querySelector('.try-again').style.display = 'block';
}

async function botGuess() {
    var row = -1; 
    var col = -1;
    var runs = 0;

    function iterate() 
    {
        if(runs === 10) { 
            checkWin();
        }

        var stop = false;
        for (index = 0; index < cellMap.length; ++index) {
            for (subin = 0; subin < cellMap[index].length; ++subin)
            {
                if(cellMap[index][subin] === 0 && Math.trunc(Math.random() * 100) % 2 === 1) {
                    row = index;
                    col = subin;
                    
                    stop = true;
                    break;
                }
            }
            if(stop) break;
        }   
        runs++;
    }
    
    while((row == -1 || col == -1) && runs < 11) iterate();
    
    if(!blockInput)
    {
        warningSpan.textContent = 'Stalin está pensando...'
        blockInput = true;

        await delay((Math.random() * 1000));
        console.log("Bot chose ", row, ' ', col);
        cellMap[row][col] = 2;
        addImage('../../images/stalincolher.jpg', col, row)
        checkWin();
        
        blockInput = false;
    }
    warningSpan.textContent = ''
}

function addImage(where, row, col) {
    var image = document.createElement('img');
        image.src = where
        image.id  = 'cellImg'

        var father = document.querySelector(`#container .l${col} .c${row}`);

        console.log(`added image to '#container .l${col} .c${row}'`);

        image.style.width = father.offsetWidth + 'px';
        father.appendChild(image);
}

function updateXands() {
    document.querySelector('.xandcoins p').textContent = xands;
}

async function activate(col, row) {
    if(col > 3 || row > 3) throw(`Invalid index ${col} ${row}`);

    if(!blockInput)
    {
        //reset warnings
        if(warningSpan.textContent !== '') warningSpan.textContent = '';
        let ignorePlay = false;

        if(cellMap[col][row] == 0)
        {
            console.log("Set at ", col, " ", row, " for ", 1);
            cellMap[col][row] = 1;
            addImage('../../images/supermito.jpg', row, col);
            xands += 10;
            
            updateXands();
            checkWin();
            await botGuess();
        }
        else {
            if(cellMap[col][row] === 1) {
                warningSpan.textContent = "Você ja conquistou esse morro!";
                ignorePlay = true;
            }
            else warningSpan.textContent = "O malandro ja pegou essa!";
            warningSpan.style.display = 'block';
        }
    }
}

function checkWin() {
    if(
        (cellMap[0][0] == 1 && cellMap[0][1] == 1 && cellMap[0][2] == 1) ||
        (cellMap[1][0] == 1 && cellMap[1][1] == 1 && cellMap[1][2] == 1) ||
        (cellMap[2][0] == 1 && cellMap[2][1] == 1 && cellMap[2][2] == 1) ||

        (cellMap[0][0] == 1 && cellMap[1][0] == 1 && cellMap[2][0] == 1) ||
        (cellMap[0][1] == 1 && cellMap[1][1] == 1 && cellMap[2][1] == 1) ||
        (cellMap[0][2] == 1 && cellMap[1][2] == 1 && cellMap[2][2] == 1) ||
        
        (cellMap[0][0] == 1 && cellMap[1][1] == 1 && cellMap[2][2] == 1) ||
        (cellMap[0][2] == 1 && cellMap[1][1] == 1 && cellMap[2][0] == 1)
    ) {
        blockInput = true;
        document.documentElement.style.setProperty('--tcolor', 'lightgreen');
        document.querySelector('.title').textContent = "Vitória!"
        document.querySelector('.subtitle').textContent = "O morro, agora sereno, canta louvores ao seu nome. Quinze novas vielas são nomeadas em sua honra, seu rosto agora parte da cultura da favela."

        setCookie("xandcoins", xands);
        document.querySelector('.try-again').style.display = 'block';
        return true;
    }
    else if (
        (cellMap[0][0] == 2 && cellMap[0][1] == 2 && cellMap[0][2] == 2) ||
        (cellMap[1][0] == 2 && cellMap[1][1] == 2 && cellMap[1][2] == 2) ||
        (cellMap[2][0] == 2 && cellMap[2][1] == 2 && cellMap[2][2] == 2) ||

        (cellMap[0][0] == 2 && cellMap[1][0] == 2 && cellMap[2][0] == 2) ||
        (cellMap[0][1] == 2 && cellMap[1][1] == 2 && cellMap[2][1] == 2) ||
        (cellMap[0][2] == 2 && cellMap[1][2] == 2 && cellMap[2][2] == 2) ||
        
        (cellMap[0][0] == 2 && cellMap[1][1] == 2 && cellMap[2][2] == 2) ||
        (cellMap[0][2] == 2 && cellMap[1][1] == 2 && cellMap[2][0] == 2)
    ){
        document.documentElement.style.setProperty('--tcolor', 'crimson');
        blockInput = true;
        document.querySelector('.title').textContent = "Perda..."
        document.querySelector('.subtitle').textContent = "A favela se torna um dos eixos econômicos brasileiro, seu maior bem de exporte: Cocaína e jogadores de futebol. O estado cai aos joelhos ao ritmo que a quebrada se transforma numa utopia, o resto do país em inacabável taxa."

        for(row of cellMap) 
            for(cell of row)
                if(cell == 2) xands -= 100;
        setCookie("xandcoins", xands);
        document.querySelector('.try-again').style.display = 'block';
        return true;
    }
    
    let empty = cellMap.filter(row => row.filter(cell => cell === 0).length > 0);
    if(empty.length === 0 && !blockInput) {
        draw();
        blockInput = true;
        return true;
    } 

    return false;
}