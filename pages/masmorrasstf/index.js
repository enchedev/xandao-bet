import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { InteractionManager } from 'three.interactive'
import { Tween } from 'tweenjs'

if(window.innerWidth < 300 || window.innerHeight < 300) {
    alert('Perdão, mas o jogo não é suportado nas dimensões')
    throw("Unsupported dimensions")
}

const map = [
    [
            [ 0, 0, 0, 1 ],
            [ 1, 2, 0, 1 ],
            [ 1, 0, 1, 0 ],
            [ 0, 0, 1, 1 ],
            [ 1, 0, 1, 0 ],
            [ 0, 0, 1, 1 ],
            [ 1, 0, 0, 1 ],
            [ 1, 0, 0, 1 ],
    ],
    [
            [ 0, 0, 0, 1 ],
            [ 1, 0, 0, 1 ],
            [ 1, 1, 1, 0 ],
            [ 0, 1, 1, 0 ],
            [ 0, 1, 0, 1 ],
            [ 1, 1, 0, 1 ],
            [ 1, 0, 0, 1 ],
            [ 1, 0, 1, 0 ],
    ],
    [
            [ 0, 0, 1, 0 ],
            [ 0, 0, 1, 1 ],
            [ 1, 1, 1, 0 ],
            [ 0, 1, 1, 1 ],
            [ 1, 0, 0, 1 ],
            [ 1, 0, 1, 0 ],
            [ 0, 0, 1, 1 ],
            [ 1, 1, 0, 0 ],
    ],
    [
            [ 0, 1, 1, 0 ],
            [ 0, 1, 1, 0 ],
            [ 0, 1, 1, 0 ],
            [ 0, 1, 0, 1 ],
            [ 1, 0, 1, 0 ],
            [ 0, 1, 1, 1 ],
            [ 1, 1, 1, 1 ],
            [ 0, 0, 1, 1 ],
    ],
    [
            [ 0, 1, 0, 1 ],
            [ 1, 1, 0, 0 ],
            [ 0, 1, 1, 1 ],
            [ 1, 0, 0, 1 ],
            [ 1, 1, 1, 0 ],
            [ 3, 1, 1, 0 ],
            [ 0, 1, 0, 1 ],
            [ 1, 1, 0, 0 ],
    ],
    [
            [ 0, 0, 0, 1 ],
            [ 1, 0, 0, 1 ],
            [ 1, 1, 1, 1 ],
            [ 1, 0, 0, 0 ],
            [ 0, 1, 1, 0 ],
            [ 0, 1, 0, 1 ],
            [ 1, 0, 1, 1 ],
            [ 1, 0, 0, 1 ],
    ],
    [
            [ 0, 0, 1, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 1, 0, 1 ],
            [ 1, 0, 1, 0 ],
            [ 0, 1, 1, 0 ],
            [ 0, 0, 0, 1 ],
            [ 1, 1, 0, 1 ],
            [ 1, 0, 1, 1 ],
    ],
    [
            [ 0, 1, 0, 1 ],
            [ 1, 0, 0, 1 ],
            [ 1, 0, 0, 1 ],
            [ 1, 1, 0, 1 ],
            [ 1, 1, 4, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 1, 0, 0 ],
    ],
    [
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
    ],

];

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

function radToDeg(rad) {
return rad / (Math.PI / 180);
}


let canvas = document.querySelector('#canvas')
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(120, 800 / 450, 0.1, 100)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(800, 450)
canvas.append(renderer.domElement)

const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()

let intMan = new InteractionManager(renderer, camera, renderer.domElement)
var inMap = false

var turnCooldown = false
let rotationTween = {}


var rotCopy = {};
var change = false;
var heldBreath = false

const breathSound = new Audio('./res/audio/heartbeat.wav');
const ambiance = new Audio('./res/audio/ambiance.wav');

document.addEventListener('keydown', k => {
    if(k.code === 'Space') heldBreath = !heldBreath
    if(k.key === 'w')
        console.log(map[player.x][player.y])
    else if(k.key === 'm')
    {
        inMap = !inMap
        change = true;
        camera.lookAt(0, 0, 0)

        if(inMap) {
            rotCopy = camera.rotation.clone()
            camera.position.y = 3;
            camera.position.z = -3;

            camera.fov = 90
            camera.updateProjectionMatrix()
            orbit.update()
        }
        else {
            camera.fov = 120;
            camera.updateProjectionMatrix()
            camera.rotation.set(rotCopy.x, rotCopy.y, rotCopy.z, rotCopy.order)
            camera.position.set(0, 0, 0)
        }
        console.log(inMap)
    }
    else if(k.key === 'd')
    {
        const str = "A tela lê " + distance(window.player, window.player.lula);
        document.querySelector('#terminal').textContent = str
        setTimeout(() => {
            if(document.querySelector('#terminal').textContent === str)
            document.querySelector('#terminal').textContent = ''
        }, 2000);
    }
    else if(k.code === 'ArrowLeft' && !turnCooldown) {
        turnCooldown = true;
        rotationTween = new Tween(camera.rotation)
            .to({
                y: degToRad( radToDeg(camera.rotation.y) +90 )
            }, 500).onComplete(() => turnCooldown = false)
            .start()
    }
    else if(k.code === 'ArrowRight' && !turnCooldown) {
        turnCooldown = true
        
        rotationTween = new Tween(camera.rotation)
        .to({
            y: degToRad( radToDeg(camera.rotation.y) -90 )
        }, 500).onComplete(() => turnCooldown = false)
            .start()
    }

    console.log(k.code)
})

function anyAvailableSwitch() {
    for (key in specials) {
        const x = +key[0]
        const y = +key[1]

        for(sw of previous) {
            if(sw !== null && sw.pos[0] === x && sw.pos[1] === y) {
                return { x: sw.pos[0], y: sw.pos[1] }
            }
        }
    }

    return {x: 0, y: 0}
}

function facing() {
    switch(radToDeg(camera.rotation.y)) {
        case 360:
        case 0:   return Direction.Up
        case -270:
        case 90:  return Direction.Left
        case 270:
        case -90: return Direction.Right
        case -180:
        case 180: return Direction.Down
    }
}

const Direction = {
    Up: 0,
    Left: 1,
    Right: 2,
    Down: 3,
}

let plane = new THREE.PlaneGeometry(1, 0.75)
let Walls = [
    new THREE.Mesh(
        plane,
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 'white'})
    ).rotateY(degToRad(180)),
    new THREE.Mesh(
        plane,
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 'white'})
    ).rotateY(degToRad(-90)),
    new THREE.Mesh(
        plane,
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 'white'})
    ).rotateY(degToRad(90)),
    new THREE.Mesh(
        plane,
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 'white'})
    ),
    new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 'gray'})
    ),
    new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 'gray'})
    ),
]


const loader = new THREE.TextureLoader()

let textures = {}

var done = 0;
function loadW(f, lbl) {
    loader.load(
        f, 
        text => 
        {
            text.colorSpace = THREE.SRGBColorSpace
            // textures.push(text)
            textures[lbl] = text
            updateWalls()
        }
        ,
        ammount =>
            console.log( fname, 'is ', (ammount.loaded / ammount.total * 100) + '% loaded' )
        ,
        // Function called when download errors
        err => {
            console.log( 'An error happened: ' )
            throw(err)
        }
    )
}       
    
loadW('./res/path.png', 'path')
loadW('./res/bricks.png', 'bricks')

loader.load('./res/carpet.png', tt => {
    textures['carpet'] = tt
    Walls[4].material.map = textures['carpet']
    Walls[4].material.needsUpdate = true
})
loader.load('./res/rock.png', tt => {
    textures['rock'] = tt
    Walls[5].material.map = textures['rock']
    Walls[5].material.needsUpdate = true
})

scene.add(...Walls)

intMan.add(Walls[Direction.Up])
intMan.add(Walls[Direction.Left])
intMan.add(Walls[Direction.Right])
intMan.add(Walls[Direction.Down])

Walls[Direction.Up].position.z = 0.5
Walls[Direction.Left].position.x = 0.5
Walls[Direction.Right].position.x = -0.5
Walls[Direction.Down].position.z = -0.5
Walls[4].position.y = -0.75
Walls[4].rotateX(degToRad(90));
Walls[5].position.y = 0.75
Walls[5].rotateX(degToRad(90));

let xands = 0;
function getXands() {
    xands = localStorage.getItem("xandcoins")
    if(!xands || xands == 'NaN') xands = 0;
}

function setXands() {
    localStorage.setItem('xandcoins', xands);
}

function rotateToAndMove(dir) {
    if(dir == facing()) return;
    var target = 0;
    switch(dir) {
        case Direction.Up:    target = 180;   break;
        case Direction.Left:  target = -90;  break;
        case Direction.Right: target = 90; break;
        case Direction.Down:  target = 0; break;
    }
    
    if(target - radToDeg(camera.rotation.y) === 0) {
        move(dir)
        return
    }
    
    console.log("Turning to ", target)
    if(degToRad(camera.rotation.y) < 0 && target === 180 )
        target = -target;

    if(camera.rotation.y === -180 && target > 0) camera.rotation.y = 180
    else if(camera.rotation.y === 180 && target < 0) camera.rotation.y = -180
    function tmp() {
        if(!turnCooldown) {
            turnCooldown = true;
            console.log("From ", radToDeg(camera.rotation.y), " to ", target);
            rotationTween = new Tween(camera.rotation)
                .to({y: degToRad(target)}, 500)
                .onComplete(() => { turnCooldown = false; move(dir) })
                .start();
            return;
        }
        else setTimeout(100, tmp)
    }

    tmp()
}

Walls[Direction.Up].addEventListener('click', ev => {
    if(facing() !== Direction.Up)
        rotateToAndMove(Direction.Up);
    else move(Direction.Up)
})
Walls[Direction.Down].addEventListener('click', ev => {
    if(facing() !== Direction.Down)
        rotateToAndMove(Direction.Down);
    else move(Direction.Down)
})
Walls[Direction.Left].addEventListener('click', ev => {
    if(facing() !== Direction.Left)
        rotateToAndMove(Direction.Left);
    else move(Direction.Left)
})
Walls[Direction.Right].addEventListener('click', ev => {
    if(facing() !== Direction.Right)
        rotateToAndMove(Direction.Right);
    else move(Direction.Right)
})

function updateWalls() {
    for(var i = 0; i < 4; ++i) {
        if(map[player.x][player.y][i] === 1) Walls[i].material.map = textures['path']
        else if(map[player.x][player.y][i] === 0) Walls[i].material.map = textures['bricks']
        else {
            specials[`${player.x}${player.y}`]()
        }

        Walls[i].material.needsUpdate = true
    }
}

let zoomTween = {}
let zooming = false;
function move(dir) {
    if(!inMap && (dir === undefined || map[player.x][player.y][dir] === 1) && !heldBreath) {
        change = true;
        function attemptZoom() {
            if(!zooming) {
                zooming = true;
                zoomTween = new Tween(camera)
                    .to({fov: 30.0}, 200)
                    .onUpdate(val => camera.updateProjectionMatrix())
                    .onComplete(() => {
                        zooming = false
                        camera.fov = 120
                        camera.updateProjectionMatrix()
                        updateWalls()
                    })
                    .start()
            }
            else setTimeout(attemptZoom, 100);
        }
        
        attemptZoom()
        fireEvent('onroomleave')

        if(dir !== undefined) {
            switch(dir) {
                case Direction.Up: player.y--; break
                case Direction.Down: player.y++; break
                case Direction.Right: player.x++; break
                case Direction.Left: player.x--; break
            }
        }
        
        // if not pushed yet.
        if(mapBlockMirror.find(e => e.x == player.x && e.y == player.y) === undefined) { 
            const temp = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.5, 0.5),
                new THREE.MeshBasicMaterial({ color: 'gray'})
            )
            temp.position.x = player.x
            temp.position.z = player.y
            scene.add(temp)
            mapBlocks.push(temp)
            mapBlockMirror.push({x: player.x, y: player.y})
        }

        fireEvent('onroomenter')
    }
    console.log(player.x, ' ', player.y)
}

let mapBlocks = []
let mapBlockMirror = []
window.player = {
    x: 0,
    y: 0,
    switches: 0,
    lula: {
        x: randomBetween(0, map.length),
        y: randomBetween(0, map[0].length),
        sounds: [
            new Audio('./res/audio/manga.wav'),
            new Audio('./res/audio/zegotinha.wav'),
            new Audio('res/audio/banana.wav'),
        ],
    },
    inventory: {}
}
move(undefined)

renderer.setAnimationLoop(animate)
renderer.setClearColor(0x0)

function animate() {
    // requestAnimationFrame(animate)
    // if(!window.hasFocus()) {
    if(!done)
    {
        intMan.update()

        if(turnCooldown) rotationTween.update()
        if(zooming) zoomTween.update()

        if(heldBreath && breathSound.paused) breathSound.play();
        else if(!heldBreath && !breathSound.paused) breathSound.pause();

        if(ambiance.paused) ambiance.play().catch((e) => {});

        if(window.player.switches === 2) win();     
        
        if(change)
        {
            change = false
            orbit.enabled = inMap
            Walls.forEach(ea => ea.visible = !inMap)
            mapBlocks.forEach(ea => ea.visible = inMap)
        }
    
        
        if(inMap) orbit.update()
        
        renderer.render(scene, camera)
    }
    // }
}

let lulaThread = setTimeout(lulaWalk, 10000);

var last = {}
function lulaWalk() {
    function calc() {
        try {
            window.player.lula.x = randomBetween(0, map.length)
            window.player.lula.y = randomBetween(0, map[window.player.lula.x].length);
        }
        catch(e) {
            setTimeout(calc, 600) 
            return
        }
        if(map[window.player.lula.x].length === 0) setTimeout(calc, 600)
    }

    var definetly = false;
    try{
    for(var i = 0; i < 4; ++i) {
        if(map[window.player.lula.x][window.player.lula.y][i] === 1)
        {
            switch(i) {
                case Direction.Up: window.player.lula.y--; break
                case Direction.Down: window.player.lula.y++; break
                case Direction.Right: window.player.lula.x++; break
                case Direction.Left: window.player.lula.x--; break
            }
            
            break
        }
    }
    } catch(err) {
        definetly = true
    }
    finally {
        if(last == window.player.lula || definetly) {
            console.log("Bored")
            calc();
        }
    }
    if(randomBetween(0, 10) === 0) {
        console.log("TPd2")
        calc()
    }

    console.log("lula at ", window.player.lula.x, ' ', window.player.lula.y);

    if(window.player.inventory['locator']) {
        for (var i = 0; i < mapBlockMirror.length; ++i) {
            if(mapBlockMirror[i].x === window.player.lula.x && mapBlockMirror[i].y === window.player.lula.y)
            {
                console.log("Found a block for enemy")
                mapBlocks[i].material.color = new THREE.Color('red');
                mapBlocks[i].needsUpdate = true;
                setTimeout((w) => {
                    mapBlocks[w].material.color = new THREE.Color('gray')
                }, 500, i);
            }
        }
    }

    if(distance(window.player, window.player.lula) === 0 && !heldBreath) {
        console.log("lost for ", heldBreath)
        gameOver()
    }

    if(randomBetween(0, 10)) {
        // var volumeDb = (100 - 20 * Math.log10(distance(player, lula)))
        var volumeDb = 1 / distance(window.player, window.player.lula)
        
        console.log("Playing at ", volumeDb)
        try {
            let select = window.player.lula.sounds[randomBetween(0, window.player.lula.sounds.length)]
            if(select['volume'] !== undefined) select.volume = volumeDb / 100
            select.click()
            select.play()
        } catch(e) {}
    }

    if(!done) setTimeout(lulaWalk, 1000);
}

function randomBetween(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function distance(objA, objB) { return Math.abs(objA.x - objB.x) + Math.abs(objA.y - objB.y)}
function gameOver() {
    done = true;
    // renderer.setAnimationLoop(null)
    let div = document.createElement('div');
    document.querySelector('#canvas').replaceWith(div)
    div.id = 'canvas'

    let image = document.createElement('img')
    image.src = './res/lula.png'
    image.width = div.offsetWidth
    image.height = div.offsetHeight
    image.top = div.offsetTop
    image.left = div.offsetLeft
    div.appendChild(image);

    window.player.lula.sounds[0].volume = 1;
    window.player.lula.sounds[0].click()
    window.player.lula.sounds[0].play()
    clearInterval(lulaThread)

    document.body.style.setProperty('--tc', 'red')
    let term = document.createElement('span')
    term.id = 'terminal'
    term.textContent = "Você foi lulado..."
    term.style.fontSize = "2rem"
    setTimeout(() => {
        let bot = document.createElement('button')
        bot.onclick = location.reload();
    }, 1000);
    div.append(term);
    setXands(xands - 1000)
}

var previous = [
    {
        pos: [],
        obj: null
    },
    {
        pos: [],
        obj: null
    },
    {
        pos: [],
        obj: null
    },
]

const specials = {
    ['01']: function (side) {
        newSwitch(0, [0, 1], side)
    },
    ['74']: function (side) {
        newSwitch(1, [7, 4], 2, 0, 0.5)
    },
}

function newSwitch(id, pos, side, x = 0.5, z = 0) {
    if(previous[id].obj !== null) return;

    previous[id].obj = new THREE.Mesh(
        new THREE.BoxGeometry( 0.25, 0.5, 0.3 ),
        new THREE.MeshBasicMaterial({color: 'gray'})
    )
    previous[id].obj.position.y = 0.1
    previous[id].obj.position.x = x
    previous[id].obj.position.z = z

    switch(side) {
        case Direction.Up: previous[id].obj.rotation.y = degToRad(0); break
        case Direction.Left: previous[id].obj.rotation.y = degToRad(90); break
        case Direction.Right: previous[id].obj.rotation.y = degToRad(-90); break
        case Direction.Down: previous[id].obj.rotation.y = degToRad(180); break
    }

    intMan.add(previous[id].obj);
    previous[id].obj.addEventListener('click', ev => {
        if(previous[id].obj === true) {
            text('Você consegue ouvir um xiado baixo da corrente passando por ele')
            return;
        }

        player.switches++;
        previous[id].obj
        good('Você achou um dos dijuntores! ('+player.switches+'/3)')
        previous[id].obj.material.color = new THREE.Color('green')
        previous[id].obj.material.needsUpdate = true;
    })

    scene.add(previous[id].obj)

    onEvent('onroomleave', () => {
        previous[id].obj.visible = false;
        intMan.remove(previous[id].obj)
    })

    onEvent('onroomenter', () => {
        if(window.player.x === pos[0] && window.player.y === pos[1]) {
            previous[id].obj.visible = true
            intMan.add(previous[id].obj);
        }
    })
}

let out = document.querySelector('#terminal');

function text(t) {
    document.body.style.setProperty('--tc', 'white')
    out.textContent = t;
    setTimeout(() => { if(out.textContent === t) out.textContent = ''}, 3000)
}

function good(txt) {
    document.body.style.setProperty('--tc', 'green')
    document.querySelector('#terminal').textContent = txt;
    setTimeout(() => {if(out.textContent === txt) out.textContent = ''}, 3000)
}


var eventRegistry = undefined;
function initRegistry() {
    eventRegistry = {
        'onroomleave': [],
        'onroomenter': []
    }
}

function fireEvent(str) {
    if(!eventRegistry) initRegistry()

    for(const member of eventRegistry[str])
        member()
}

function onEvent(str, fn) {
    if(!eventRegistry) initRegistry()

    if(eventRegistry[str] === undefined)
        eventRegistry[str] = []

    eventRegistry[str].push(fn)
}

document.querySelector('#terminal').style.width = canvas.clientWidth + 'px'


let stage = 0;
function win() {
    done = true;
    clearInterval(lulaThread)
    renderer.setAnimationLoop(null)
    document.querySelector('canvas').remove()
    document.querySelector('#terminal').remove()
    
    canvas.id = 'win';
    setXands(xands + 3000)
    let span = document.createElement('span')
    span.textContent = 'Você religou os dijuntores'
    let botao = document.createElement('button')
    botao.textContent = 'Continuar...'
    botao.onclick = (eve) => {
        stage++;

        switch(stage) {
            case 1: span.innerHTML = '<span class="bolso">Bolsonaro</span> é condenado a 13 prisões perpétuas'; break
            case 2: span.innerHTML = 'Xandão, orgulhoso da sua coragem, lhe promove ao cargo mais alto do STF'; break
            case 3: {
                botao.style.display = 'none'
                span.innerHTML = 'Um jogo por '
                span.innerHTML += '<a class="enche" href="https://github.com/enchedev/xandao-bet">EncheDev</a>'
            }
        }
    }
    canvas.appendChild(span);
    canvas.appendChild(botao);
}

window.player.inventory['locator'] = true;