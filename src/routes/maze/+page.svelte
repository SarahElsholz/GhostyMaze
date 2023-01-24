<script lang="ts">
    import {onMount} from 'svelte';
	import { null_to_empty } from 'svelte/internal';

    //wall id type
        interface WallID {start: {x: number, y: number}, end: {x: number, y: number}}

    //global variables
        const distance = 10;
        let w;
        let h;
        let canvas: HTMLCanvasElement;
        let rectangle: HTMLDivElement;
        let ghost: HTMLImageElement;
        let enemy: HTMLImageElement;
        let imgX: number;
        let imgY: number;
        let ctx: CanvasRenderingContext2D;
        let width = 100;
        let walls: [top:WallID[],bottom:WallID[], left:WallID[], right:WallID[]] = [[],[],[],[]];
        let gameOver: boolean = false;
        let fruitImage: HTMLImageElement;
        let score: number = 0;
        let presentImage: HTMLImageElement;
        let badPresentX: number = 5;
        let badPresentY: number = 10;
        let time = new Date();
        let seconds: string = "00";
        let minutes: string = "00";
        let timerMinutes: number = 0;
        let timerSeconds: number = 0;
        let timerDiv: HTMLDivElement;
        let level = 1;
        let canvasWidth = 500;
        let fruits: [{x: number, y: number}] = [{x: 20, y: 20}];
        let presents: [{x: number, y: number}] = [{x: 5, y: 10}];
        let scores: {level: number, score: number, time: string, timerMinutes: number, timerSeconds: number}[] = [];
        let highscore: number = 0;
        let fastest: number = 0;
        let winninglevel: number = 0;
        let fastestlevel: number;

    //wrapText
        function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number){
            let words = text.split(' ');
            let line = '';

            for(let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
            }
            ctx.fillText(line, x, y);
        }

    //type declaration for the maze grid
        interface MazeGrid {
                gridSize: number, //value defines height and width of the grid(identical)
                colNum: number, //number of columns and rows(identical)
                grid: Cell[]
            }

    //type declaration for the individual cells
                interface Cell {
                    walls: {
                        topWall: boolean,
                        rightWall: boolean,
                        bottomWall: boolean,
                        leftWall: boolean
                    },
                    position: {x: number, y: number} //position of the top left corner
                    visited: boolean,
                    parentGrid: MazeGrid,
                    neighbours: {[key: string]: Cell}
                }
    //check for top neighbour
                function getTopNeighbour(cell: Cell, mazeGrid: MazeGrid){
                    if(cell.position.y !== 0 && cell.visited === false){
                        let topNeighbour: Cell = {
                            walls: {
                                topWall: true,
                                rightWall: true,
                                bottomWall: true,
                                leftWall: true
                            },
                            position: {x: cell.position.x, y: cell.position.y - (canvas.width/mazeGrid.colNum)},
                            visited: false,
                            parentGrid: mazeGrid,
                            neighbours: {}
                        }
                        cell.neighbours.top = topNeighbour;
                    }
                }
    //check for right neighbour
                function getRightNeighbour(cell: Cell, mazeGrid: MazeGrid){
                    if(cell.position.x !== canvas.width - (canvas.width/mazeGrid.colNum)){
                        let rightNeighbour = {
                            walls: {
                                topWall: true,
                                rightWall: true,
                                bottomWall: true,
                                leftWall: true
                            },
                            position: {x: cell.position.x + (canvas.width/mazeGrid.colNum), y: cell.position.y},
                            visited: false,
                            parentGrid: mazeGrid,
                            neighbours: {}
                        }
                        cell.neighbours.right = rightNeighbour;
                    }
                    }

    //check for bottom neighbour
                function getBottomNeighbour(cell: Cell, mazeGrid: MazeGrid){
                    if(cell.position.y !== canvas.width - mazeGrid.colNum){
                        let bottomNeighbour = {
                            walls: {
                                topWall: true,
                                rightWall: true,
                                bottomWall: true,
                                leftWall: true
                            },
                            position: {x: cell.position.x, y: cell.position.y + (canvas.width/mazeGrid.colNum)},
                            visited: false,
                            parentGrid: mazeGrid,
                            neighbours: {}
                        }
                        cell.neighbours.bottom = bottomNeighbour;
                    }
                    }

    //check for left neighbour
                    function getLeftNeighbour(cell: Cell, mazeGrid: MazeGrid){
                        if(cell.position.x !== 0){
                        let leftNeighbour = {
                            walls: {
                                topWall: true,
                                rightWall: true,
                                bottomWall: true,
                                leftWall: true
                            },
                            position: {x: cell.position.x - (canvas.width/mazeGrid.colNum), y: cell.position.y},
                            visited: false,
                            parentGrid: mazeGrid,
                            neighbours: {}
                        }
                        cell.neighbours.left = leftNeighbour;
                    }
                    }

        //check wall collision
        function checkTopCollision(x: number, y: number, walls: [top:WallID[],bottom:WallID[], left:WallID[], right:WallID[]]){
            let topWalls = walls[0];

            for(let wall of topWalls){
                if(wall.start.x === x-20 && wall.start.y === y-15){
                        return true;
                }
            }
        }
        function checkBottomCollision(x: number, y: number, walls: [top:WallID[],bottom:WallID[], left:WallID[], right:WallID[]]){
            let bottomWalls = walls[1];

            for(let wall of bottomWalls){
                if(wall.start.x === x-20 && wall.start.y === y+85){
                        return true;
                }
            }
        }
        function checkLeftCollision(x: number, y: number, walls: [top:WallID[],bottom:WallID[], left:WallID[], right:WallID[]]){
            let leftWalls = walls[2];

            for(let wall of leftWalls){
                if(wall.start.x === x-20 && wall.start.y === y-15){
                        return true;
                }
            }
        }
        function checkRightCollision(x: number, y: number, walls: [top:WallID[],bottom:WallID[], left:WallID[], right:WallID[]]){
            let rightWalls = walls[3];

            for(let wall of rightWalls){
                if(wall.start.x === x+80 && wall.start.y === y-15){
                        return true;
                }
            }
        }

    //assets
                function getRand(min: number, max: number, step: number) {
                    let delta,
                        range,
                        rand;
                    if (arguments.length < 2) {
                        max = min;
                        min = 0;
                    }
                    if (!step) {
                        step = 1;
                    }
                    delta = max - min;
                    range = delta / step;
                    rand = Math.random();
                    rand *= range;
                    rand = Math.floor(rand);
                    rand *= step;
                    rand += min;
                    return rand;
                }

                function randomNum(number: number, padding: number){
                  return number = getRand(0,canvas.width, 100)+padding;
                }

                function drawAsset(asset: HTMLImageElement, assetX: number, assetY: number){
                    ctx.drawImage(asset, assetX, assetY, width, width);
                }

                function renderAssets(){
                    for(let fruit in fruits){
                        ctx.clearRect(fruits[fruit].x, fruits[fruit].y, width-40, width-40);
                        if(imgX === fruits[fruit].x && imgY === fruits[fruit].y+5){
                            ctx.drawImage(ghost, imgX, imgY, width-40, width-15);
                        }
                    }
                    for(let present in presents){
                        ctx.clearRect(presents[present].x, presents[present].y, width-10, width-15);
                        if(imgX === presents[present].x+15 && imgY === presents[present].y+5){
                            ctx.drawImage(ghost, imgX, imgY, width-40, width-15);
                        }
                    }
                    for(let fruit in fruits){
                            fruits[fruit].x = randomNum(fruits[fruit].x, 20);
                            fruits[fruit].y = randomNum(fruits[fruit].y, 20);
                            drawAsset(fruitImage, fruits[fruit].x, fruits[fruit].y);
                    }
                    for(let present in presents){
                            presents[present].x = randomNum(presents[present].x, 5);
                            presents[present].y = randomNum(presents[present].y, 10);
                            drawAsset(presentImage, presents[present].x, presents[present].y);
                    }
                    ctx.clearRect(badPresentX, badPresentY, width-10, width-15);
                    if(imgX === badPresentX+15 && imgY === badPresentY+5){
                        ctx.drawImage(ghost, imgX, imgY, width-40, width-15);
                    }
                    badPresentX = randomNum(badPresentX, 5);
                    badPresentY = randomNum(badPresentY, 10);
                    drawAsset(presentImage, badPresentX, badPresentY);
                };
                let assetInterval: NodeJS.Timer;

                function stopInterval(){
                    clearInterval(assetInterval);
                };


    //keydown
        function handleKeydown(event: KeyboardEvent){
            if(imgX === canvas.width-80 && imgY === 15){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = '2em Verdana sans-serif';
                ctx.fillStyle = "#bd0113";
                let maxWidth = canvas.width-100;
                let lineHeight = 40;
                let x = 10;
                let y = canvas.width/2;
                if(timerMinutes == 0){
                    let text = `You Won in ${timerSeconds} seconds with a score of ${score}! The next Level will start in a second`;
                    wrapText(ctx, text, x, y, maxWidth, lineHeight);
                    if(timerSeconds < 10){
                        scores[level-1] = {level: level, score: score, time: `00 : 0${timerSeconds}`, timerMinutes: timerMinutes, timerSeconds: timerSeconds};
                    }else{
                    scores[level-1] = {level: level, score: score, time: `00 : ${timerSeconds}`, timerMinutes: timerMinutes, timerSeconds: timerSeconds};
                    }
                }else{
                    if(timerMinutes == 1){
                        let text = `You Won with a score of ${score} in 1 minute and ${timerSeconds} seconds! The next Level will start in a second`;
                    wrapText(ctx, text, x, y, maxWidth, lineHeight);
                        if(timerSeconds < 10){
                            scores[level-1] = {level: level, score: score, time: `00 : 0${timerSeconds}`, timerMinutes: timerMinutes, timerSeconds: timerSeconds};
                        }else{
                        scores[level-1] = {level: level, score: score, time: `0${timerMinutes} : ${timerSeconds}`, timerMinutes: timerMinutes, timerSeconds: timerSeconds};
                        }
                    }else{
                        let text = `You Won with a score of ${score} in ${timerMinutes} minutes and ${timerSeconds} seconds! The next Level will start in a second`;
                    wrapText(ctx, text, x, y, maxWidth, lineHeight);
                        if(timerSeconds < 10){
                            scores[level-1] = {level: level, score: score, time: `00 : 0${timerSeconds}`, timerMinutes: timerMinutes, timerSeconds: timerSeconds};
                        }else{
                            scores[level-1] = {level: level, score: score, time: `${timerMinutes} : ${timerSeconds}`, timerMinutes: timerMinutes, timerSeconds: timerSeconds};
                        }
                    }
                }
                stopInterval();
                setTimeout(()=>{
                timerDiv.style.display = 'none';
                gameOver = true;
                score = 0;
                level += 1;
                canvasWidth += 100;
                }, 1200)
                setTimeout(renew, 1200);
                return;
            }
            for(let fruit in fruits){
                console.log(fruits[fruit], imgX, imgY)
                if(imgX === fruits[fruit].x && imgY === fruits[fruit].y-5){
                    fruits[fruit].x = 0;
                    fruits[fruit].y = 0;
                    score += 1;
                    console.log(score)
                }
            }
            for(let present in presents){
                if(imgX === presents[present].x+15 && imgY === presents[present].y+5){
                    presents[present].x = 0;
                    presents[present].y = 0;
                    score += 10;
                    console.log(score)
                }
            }
            if(imgX === badPresentX+15 && imgY === badPresentY+5){
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.font = '2em Verdana sans-serif';
                    ctx.fillStyle = "#bd0113";
                    let text = "BOOM! Sorry, you lost!";
                    let maxWidth = canvas.width-100;
                    let lineHeight = 40;
                    let x = 10;
                    let y = canvas.width/2;
                    wrapText(ctx, text, x, y, maxWidth, lineHeight);
                    timerDiv.style.display = 'none';
                    badPresentX = 5;
                    badPresentY = 10;
                    stopInterval();
                    gameOver = true;
                    if(level > 1){
                        for(let i = 0; i < scores.length; i++){
                            if(scores[i].score > highscore){
                                highscore = scores[i].score;
                                winninglevel = scores[i].level;
                            };
                            if(fastest === 0){
                                fastest = scores[0].timerMinutes*60+scores[0].timerSeconds;
                                fastestlevel = scores[0].level;
                            }else{
                                if(scores[i].timerMinutes*60+scores[i].timerSeconds < fastest){
                                    fastest = scores[i].timerMinutes*60+scores[i].timerSeconds;
                                    fastestlevel = scores[i].level;
                                }
                            }
                        }
                        setTimeout(()=>{
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        text = `Your Highscore was ${highscore} in level ${winninglevel} and your fastes level was ${fastestlevel} with ${fastest} seconds`;
                        wrapText(ctx, text, x, y, maxWidth, lineHeight);
                    }, 1200);
                    }
                    return;
                }

            ctx.clearRect(imgX, imgY, width-30, width-20);
            if(event.key === "ArrowUp"){
                // event.preventDefault();
                let collision = checkTopCollision(imgX, imgY, walls);

                if(!collision){
                    imgY -= 100;
                    ctx.drawImage(ghost, imgX, imgY, width-40, width-15);
                }else{
                    ctx.drawImage(ghost, imgX, imgY, width-40, width-15);
                }

            }else if(event.key === "ArrowDown"){
                // event.preventDefault();
                let collision = checkBottomCollision(imgX, imgY, walls);
                if(!collision){
                    imgY += 100;
                    ctx.drawImage(ghost, imgX, imgY, width-40, width-15);
                }else{
                    ctx.drawImage(ghost, imgX, imgY, width-40, width-15);
                }

            }else if(event.key === "ArrowLeft"){
                let collision = checkLeftCollision(imgX, imgY, walls);
                if(!collision){
                    imgX -= 100;
                    ctx.drawImage(ghost, imgX, imgY, width-40, width-15);
                }else{
                    ctx.drawImage(ghost, imgX, imgY, width-40, width-15);
                }

            }else if(event.key === "ArrowRight"){
                let collision = checkRightCollision(imgX, imgY, walls);
                if(!collision){
                    imgX += 100;
                    ctx.drawImage(ghost, imgX, imgY, width-40, width-15);
                }else{
                    ctx.drawImage(ghost, imgX, imgY, width-40, width-15);
                }
            }
        }

    //restart
        function newGame(){
            canvasWidth = 500;
            level = 1;
            scores.length = 0;
            setTimeout(renew, 300);

        }

    //renew canvas
        function renew(){
            clearInterval(assetInterval);
            ctx.clearRect(0, 0, canvas.width, canvas.width);
            assetInterval = setInterval(renderAssets, 5000);
            createMaze("#ffffff");
            ctx.drawImage(ghost, imgX, imgY, width-40, width-15);

            timerDiv.style.display = 'flex';
            timerMinutes = 0;
            timerSeconds = 0;
            minutes = "00";
            seconds = "00";
            score = 0;
            for(let i = 0; i < level; i++){
                fruits[i] = {x: i+1, y: i+1};
            };
            for(let i = 0; i < level-3; i++){
                presents[i] = {x: i+1, y: i+1};
            };
        }

    //create maze
        function createMaze(color: string){
            let mazeGrid: MazeGrid = {
                    gridSize: canvas.width,
                    colNum: canvas.width/width,
                    grid: []
                }
                console.log("gridsize", mazeGrid.gridSize);
            walls =[[],[],[],[]];
            w = (canvas.width/100)-20;
            h = (canvas.width/100)-20;
            imgX = 20;
            imgY = (canvas.width-((canvas.width/(canvas.width/width))-15));
            console.log(imgY)
            ctx = canvas.getContext("2d")!;

    //add cells to the grid
                function addCells(grid: Cell[]){
                    let x: number = 0;
                    let y: number = 0;
                    for(let i = 0; i < (mazeGrid.colNum*mazeGrid.colNum); i ++){
                        let cell: Cell = {
                            walls: {
                                topWall: true,
                                rightWall: true,
                                bottomWall: true,
                                leftWall: true
                            },
                            position: {x, y},
                            visited: false,
                            parentGrid: mazeGrid,
                            neighbours: {}
                            };
                        getTopNeighbour(cell, mazeGrid);
                        getRightNeighbour(cell, mazeGrid);
                        getBottomNeighbour(cell, mazeGrid);
                        getLeftNeighbour(cell, mazeGrid);
                        grid.push(cell)
                        if(y <= canvas.width - (canvas.width/mazeGrid.colNum)){ //there are more rows
                            if(x < canvas.width - (canvas.width/mazeGrid.colNum)){ //each cell in one row
                                x += (canvas.width/mazeGrid.colNum);
                            }
                            else if(x === canvas.width - (canvas.width/mazeGrid.colNum)){
                                x = 0;
                                y += (canvas.width/mazeGrid.colNum);
                            }
                        }
                    }
                }

    //walls
                //get top walls
                    function getTop(cell: Cell){
                        if(cell.walls.topWall === true){
                            let wall = {start: {x: cell.position.x, y: cell.position.y}, end: {x: cell.position.x + width, y: cell.position.y}}
                            walls[0].push(wall)
                        }else{return}
                    }
                //get right walls
                    function getRight(cell: Cell){
                        if(cell.walls.rightWall === true){
                            let wall = {start: {x: cell.position.x + width, y: cell.position.y}, end: {x: cell.position.x + width, y: cell.position.y + width}}
                            walls[3].push(wall)
                        }else{return}
                    }
                //get bottom walls
                    function getBottom(cell: Cell){
                        if(cell.walls.bottomWall === true){
                            let wall = {start: {x: cell.position.x, y: cell.position.y + width}, end: {x: cell.position.x + width, y: cell.position.y + width}}
                            walls[1].push(wall)
                        }else{return}
                    }
                //get left wall
                    function getLeft(cell: Cell){
                        if(cell.walls.leftWall === true){
                            let wall = {start: {x: cell.position.x, y: cell.position.y}, end: {x: cell.position.x, y: cell.position.y + width}}
                            walls[2].push(wall)
                        }else{return}
                    }

    //check neighbour position and remove walls
                function removeNeighbouringWall(selected: Cell, current: Cell){
                            //check if neighbour is top
                            if(selected.position.y < current.position.y){
                                //yes? current.topWall = false, neighbour.bottomWall = false
                                current.walls.topWall = false;
                                selected.walls.bottomWall = false;
                            }

                            //check if neighbour is right
                            if(selected.position.x > current.position.x){
                                //yes? neighbour.leftWall = false, current.rightWall = false
                                current.walls.rightWall = false;
                                selected.walls.leftWall = false;
                            }

                            //check if neighbour is bottom
                            if(selected.position.y > current.position.y){
                                //yes? current.bottomWall = false, neighbour.topWall = false
                                current.walls.bottomWall = false;
                                selected.walls.topWall = false;
                            }

                            //check if neighbour is left
                            if(selected.position.x < current.position.x){
                                //yes? current.leftWall = false, neighbour.rightWall = false
                                current.walls.leftWall = false;
                                selected.walls.rightWall = false;
                            }
                            }

    //INITALIZING MAZE

                let grid: Cell[] = []
                addCells(grid)

                let stack: Cell[] = [];
                let visited: Cell[] = [];

                function main(grid: Cell[], current: Cell, stack: Cell[]){
                    if(current){
                        let isVisited = visited.includes(current);
                        if(!isVisited){
                            current.visited = true;
                            visited.push(current);
                        }
                        let newStack = Array.from(stack);
                        newStack.push(current);
                        let parseStack;

                        let selected = findNeighbours(current, visited);
                        if(selected){
                            removeNeighbouringWall(selected, current)
                            parseStack = newStack;
                            current = selected;
                        }else{
                            let updateStack = Array.from(newStack);
                            if(updateStack[updateStack.length-1].position === updateStack[updateStack.length-2].position){
                                updateStack.splice(updateStack.length-2, 2)
                            }else{
                                updateStack.splice(updateStack.length-1, 1);
                            }
                            current = updateStack[updateStack.length-1];
                            parseStack = updateStack;
                        }
                        while(visited.length !== grid.length){
                            main(grid, current, parseStack)
                        }
                    }else{console.log("Cell not found")}

                    }

                    function findNeighbours(cell: Cell, visited: Cell[]){
                        let unvisited: Cell[] = [];
                        for(let key in cell.neighbours){
                            let c = cell.neighbours[key];
                            let visitedCell = visited.find(cu => cu.position.x === c.position.x && cu.position.y === c.position.y);
                            if(!visitedCell){
                                let unvisitedCell = grid.find(cu => cu.position.x === c.position.x && cu.position.y === c.position.y)
                                if(unvisitedCell){
                                    unvisited.push(unvisitedCell)
                                }
                            }
                        }
                        let idx = Math.floor(Math.random()*unvisited.length);
                        let selected = unvisited[idx];
                        return selected;
                    }

                    main(grid, grid[0], stack)

    //remove entrance wall and exit wall
                    // let entrance = visited.find(cell => cell.position.x === 0 && cell.position.y === canvas.width-(canvas.width/mazeGrid.colNum))!
                    // entrance.walls.bottomWall = false;
                    let exit = visited.find(cell => cell.position.x === canvas.width-(canvas.width/mazeGrid.colNum) && cell.position.y === 0)!
                    exit.walls.rightWall = false;
    //render grid on canvas
                    function renderMaze(grid: Cell[]){
                            for(let cell of grid){
                                getTop(cell);
                                getRight(cell);
                                getBottom(cell);
                                getLeft(cell);
                            }

                        }
                    renderMaze(visited)
                    for(let pos of walls){
                        for(let wall of pos){
                        ctx.strokeStyle = color;
                        ctx.beginPath();
                        ctx.moveTo(wall.start.x, wall.start.y);
                        ctx.lineTo(wall.end.x, wall.end.y);
                        ctx.stroke();
                    }
                    }

                    console.log(grid);
                    console.log(walls);
        }

//MOUNT canvas
        onMount(()=>{
            createMaze("#ffffff");
            assetInterval = setInterval(renderAssets, 5000);
            ctx.drawImage(ghost, imgX, imgY, width-40, width-15);

            const interval = setInterval(()=>{
                time = new Date();
                if(timerSeconds === undefined && timerMinutes === undefined){
                    timerSeconds = 0;
                    timerMinutes = 0;
                }
                if(timerSeconds < 60){
                    timerSeconds += 1;
                    if(timerSeconds < 10){
                        seconds = `0${timerSeconds}`
                    }else{
                        seconds = `${timerSeconds}`
                    }
                }else if(timerSeconds == 60){
                    timerMinutes += 1;
                    timerSeconds = 0;
                    if(timerSeconds < 10){
                        seconds = `0${timerSeconds}`
                    }else{
                        seconds = `${timerSeconds}`
                    }
                    if(timerMinutes < 10){
                        minutes = `0${timerMinutes}`
                    }else{
                        minutes = `${timerMinutes}`
                    }
                }
            },1000);
            return () => {
                clearInterval(interval)
            }
        })
  </script>

<!-- layout -->
  <svelte:window on:keydown={handleKeydown}/>
    <div class="flex justify-center p-5 text-gray-300 dark:text-gray-300" bind:this={timerDiv}>
        <div class="border border-blue-200 dark:border-blue-200 mt-3 px-2 h-6"><h1>{minutes}:{seconds}</h1></div>
        <div class="pr-20"></div>
        <div class="p-4"><h1>Level {level}</h1></div>
    </div>
    <div id="ghostRectangle" style="top:100px;left:100px; display: none;" bind:this={rectangle}>
        <img src="./static/assets/ghost.png" alt="ghost" width="100" id="ghost" bind:this={ghost} >
    </div>
    <div id="rectangle" style="top:100px;left:100px; display: none;">
        <img src="./static/assets/enemy.svg" alt="enemy" width="100" id="enemy" bind:this={enemy}>
    </div>
    <div id="fruitrectangle" style="top:100px;left:100px; display: none;">
        <img src="./static/assets/fruit1.png" alt="fruit" width="100" id="fruit" bind:this={fruitImage}>
    </div>
    <div id="presentrectangle" style="top:100px;left:100px; display: none;">
        <img src="./static/assets/present.png" alt="present" width="100" id="present" bind:this={presentImage}>
    </div>
    <div class="p-4 flex justify-center" id="canvas">
        <canvas id="maze" width={canvasWidth} height={canvasWidth} bind:this={canvas}></canvas>
    </div>
    <div class="p-4 flex justify-center">
        <button type="button" on:click={newGame} class="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2">Restart</button>
    </div>
    <div class="p-4 flex justify-center">

        {#if scores.length !== 0}
        <ul>
            <h1>Scores</h1>
            {#each scores as score}
            <ul>Level {score.level}: score {score.score}, time {score.time}</ul>
            {/each}
        </ul>
        {/if}
    </div>

<!-- style -->
    <style>
        #rectangle {
        width: 100px;
        height: 150px;
        position: fixed;
        }
    </style>