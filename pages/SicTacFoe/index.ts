let ttc = document.getElementById('container')! as HTMLElement;

document.addEventListener('click', (event: MouseEvent) => {
    if(
        event.x > +ttc.style.x  &&
        event.x < +ttc.style.x + +ttc.style.width &&
        event.y > +ttc.style.y &&
        event.y < +ttc.style.y + +ttc.style.height
    )
    {
        console.log("Inside box!");

        let innerX = event.x - +ttc.style.x;
        let innerY = event.y - +ttc.style.y;
        console.log(innerX / 3);
        console.log(innerY / 3);
    }
})

document.addEventListener('DOMContentLoaded', () => {
    let container = document.querySelector('#container') as HTMLElement;
    for(var i = 1; i <= 3; ++i)
    {
        let line = document.querySelector(`#container .l`)! as HTMLElement;
        line.style.width = container.offsetWidth + 'px';
        line.style.height = Math.trunc(container.offsetHeight / 3) + 'px';
        
        console.log(`height ${container.offsetHeight}`);
        
        for(var j = 1; j <= 3; ++j)
        {
            let cell = document.querySelector(`#container .l ${i}`) as HTMLElement;

            cell.style.width = Math.trunc(line.offsetWidth / 3) + 'px';
            cell.style.height = line.offsetHeight + 'px';

        }
    }
});