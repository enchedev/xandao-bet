let ttc = document.getElementById('container');
let over = false;
let xands = 0;
let warningSpan = document.querySelector('.warning');

// [2] cells are padding since arrays are 0-indexed
let cellMap = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
];

// https://stackoverflow.com/questions/14573223/set-cookie-and-get-cookie-with-javascript
function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
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

    xands = +getCookie("xandcoins");
    updateXands();
});

function draw() {
    var x = checkWin();
    console.log(x);
    if(x) return;
    document.documentElement.style.setProperty('--tcolor', 'lightblue');
    over = true;
    document.querySelector('.title').textContent = "Endless war ending."
    document.querySelector('.subtitle').textContent = "Você e Stalin, agora travados numa guerra sem fim, perpétuamente aterrorizam o morro, transformando-o num campo de guerra de proporções genocidas. Lutam até as favelas desmoronarem sob o peso de seus soldados, por uma terra onde ninguém mais vive."
    document.querySelector('.try-again').style.display = 'block';
}

function botGuess() {
    var row = -1; 
    var col = -1;
    var runs = 0;

    function iterate() 
    {
        if(runs === 10) draw();

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
    
    if(!over)
    {
        console.log("Bot chose ", row, ' ', col);
        cellMap[row][col] = 2;
        addImage('../../images/stalin colher.jpg', col, row)
        checkWin();
    }
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

function activate(col, row) {
    if(col > 3 || row > 3) throw(`Invalid index ${col} ${row}`);

    if(!over)
    {
        //reset warnings
        if(warningSpan.textContent !== '') warningSpan.textContent = '';
        let ignorePlay = false;

        if(cellMap[col][row] == 0)
        {
            console.log("Set at ", col, " ", row, " for ", 1);
            cellMap[col][row] = 1;
            addImage('../../images/supermito.jpg', row, col);
            xands += 100;
            
            updateXands();
            checkWin();
            botGuess();
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
        over = true;
        document.documentElement.style.setProperty('--tcolor', 'lightgreen');
        document.querySelector('.title').textContent = "Great Ending!"
        document.querySelector('.subtitle').textContent = "O morro, agora sereno, canta louvores ao seu nome. Quinze novas vielas são nomeadas em sua honra, seu rosto agora parte da cultura da favela."

        setCookie("xandcoins", xands, 10000);
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
        over = true;
        document.querySelector('.title').textContent = "Bad Ending..."
        document.querySelector('.subtitle').textContent = "A favela se torna um dos eixos econômicos brasileiro, seu maior bem de exporte: Cocaína e jogadores de futebol. O estado cai aos joelhos ao ritmo que a quebrada se transforma numa utopia, o resto do país em inacabável taxa."

        for(row of cellMap) 
            for(cell of row)
                if(cell == 2) xands -= 100;
        setCookie("xandcoins", xands, 10000);
        document.querySelector('.try-again').style.display = 'block';
        return true;
    }
    return false;
}