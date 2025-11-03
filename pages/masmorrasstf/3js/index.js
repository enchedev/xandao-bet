import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import { degToRad, radToDeg } from 'three/src/math/MathUtils'
import { InteractionManager } from 'three.interactive'
import { Tween } from '@tweenjs/tween.js'

let canvas = document.querySelector('#canvas')
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(120, 800 / 450, 0.1, 100)
// camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setSize(800, 450)
renderer.domElement.id = 'canvas'

canvas.replaceWith(renderer.domElement)
const orbit = new OrbitControls(camera, renderer.domElement)

orbit.update()

let intMan = new InteractionManager(renderer, camera, renderer.domElement)
scene.add(new THREE.GridHelper(10, 10))
var inMap = false

let animationQ = []
var turnCooldown = false

let rotationTween = {}
var rotCopy = [];
document.addEventListener('keydown', k => {
    if(k.key === 'm')
    {
        inMap = !inMap
        camera.lookAt(0, 0, 0)

        if(inMap) {
            rotCopy = [camera.rotation.x, camera.rotation.y, camera.rotation.z];
            camera.position.y = 3;
            camera.position.z = -3;
            orbit.update()
        }
        else {
            camera.rotation.set(...rotCopy)
            camera.position.set(0, 0, 0)
        }
        console.log(inMap)
    }
    else if(k.key === 'l')
        console.log('C ', camera.position.x, ' ', camera.position.z)
    else if(k.key === 'r')
        console.log(`Rotation ${0} ${radToDeg(camera.rotation.y)} ${0}`)
    else if(k.key === 'f')
        console.log(`facing ${facing()}`)
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
    else if(k.code === 'ArrowUp' && !inMap) {
        move(facing())
    }
    else if(k.code === 'ArrowLeft' && !turnCooldown) {
        move(inverse(facing()))
    }

    console.log(k.code)
})

function facing() {
    switch(radToDeg(camera.rotation.y)) {
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
            debugger
            throw(xhr)
        }
    )
}
    
loadW('./res/path.png', 'path')
loadW('./res/bricks.png', 'bricks')

scene.add(...Walls)

intMan.add(Walls[Direction.Up])
intMan.add(Walls[Direction.Left])
intMan.add(Walls[Direction.Right])
intMan.add(Walls[Direction.Down])

Walls[Direction.Up].position.z = 0.5
Walls[Direction.Left].position.x = 0.5
Walls[Direction.Right].position.x = -0.5
Walls[Direction.Down].position.z = -0.5

function rotateToAndMove(dir) {
    var target = 0;
    switch(dir) {
        case Direction.Up:    target = 180;   break;
        case Direction.Left:  target = -90;  break;
        case Direction.Right: target = 90; break;
        case Direction.Down:  target = 0; break;
    }
    console.log("Turning to ", target)
    
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
    // move(Direction.Up)
})
Walls[Direction.Down].addEventListener('click', ev => {
    if(facing() !== Direction.Down)
        rotateToAndMove(Direction.Down);
    // move(Direction.Down)
})
Walls[Direction.Left].addEventListener('click', ev => {
    if(facing() !== Direction.Left)
        rotateToAndMove(Direction.Left);
    // move(Direction.Left)
})
Walls[Direction.Right].addEventListener('click', ev => {
    if(facing() !== Direction.Right)
        rotateToAndMove(Direction.Right);
    // move(Direction.Right)
})

function animate() {
    // requestAnimationFrame(animate)
    intMan.update()
    if(turnCooldown) rotationTween.update()

    orbit.enabled = inMap
    Walls.forEach(ea => ea.visible = !inMap)
    mapBlocks.forEach(ea => ea.visible = inMap)
    
    if(inMap) orbit.update()
    
    renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

function updateWalls() {
    for(var i = 0; i < 4; ++i) {
        if(map[player.x][player.y][i]) Walls[i].material.map = textures['path']
        else Walls[i].material.map = textures['bricks']

        Walls[i].material.needsUpdate = true
    }
}

let zoomTween = {}
function move(dir) {
    if(!inMap && (dir === undefined || map[player.x][player.y][dir] === 1)) {
        if(dir) {
            switch(dir) {
                case Direction.Up: player.y--; break
                case Direction.Down: player.y++; break
                case Direction.Right: player.x++; break
                case Direction.Left: player.x--; break
            }
        }

        updateWalls()
        
        // zoomTween = new Tween(camera)
        //     .to({fov: 30}, 500)
        //     .chain(
        //         new Tween(camera)
        //             .to({fov: 90}, 500)
        //     ).start()
        
        // if not pushed yet.
        if(mapBlockMirror.find(e => e.x == player.x && e.y == player.y) === undefined) { 
            const temp = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial({ color: 'darkgray'})
            )
            temp.position.x = player.y
            temp.position.z = player.x
            scene.add(temp)
            mapBlocks.push(temp)
            mapBlockMirror.push({x: player.x, y: player.y})
        }
    }
    console.log(player.x, ' ', player.y)
}

let mapBlocks = []
let mapBlockMirror = []

const map = [
    [
            [ 0, 0, 1, 1 ],
            [ 1, 0, 1, 1 ],
            [ 1, 0, 1, 0 ],
            [ 0, 0, 0, 0 ],
    ],
    [
            [ 0, 1, 0, 1 ],
            [ 1, 1, 0, 1 ],
            [ 1, 1, 0, 0 ],
            [ 0, 0, 0, 0 ],
    ],
    [
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
    ],
    [
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
            [ 0, 0, 0, 0 ],
    ],

];

window.player = {
    x: 0,
    y: 0
}
move(undefined)

renderer.setAnimationLoop(animate)
renderer.setClearColor(0x0)