//#region canvas
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

function setCanvasDimensions() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(ratio, ratio);
}
//#endregion

const CelestialBody = {
    name: "Planet",
    size: 1,
    distFromCenter: 100,
    xPos: 0,
    yPos: 0,
    hexColor: "",
    glow: false,
    glowValue: 10,
    rotateSpeed: 0,

    ringCount: 0,
    ringColor: "",
    ringSize: 1,
    ringSpacing: 1

}


//#region initialisePlanets
var Sun = Object.create(CelestialBody);
var Mercury = Object.create(CelestialBody);
var Venus = Object.create(CelestialBody);
var Earth = Object.create(CelestialBody);
var Mars = Object.create(CelestialBody);
var Jupiter = Object.create(CelestialBody);
var Saturn = Object.create(CelestialBody);


function generatePlanetParameters() {

    Sun.name = "Sun";
    Sun.size = 40;
    Sun.xPos = canvas.clientWidth / 2;
    Sun.yPos = canvas.clientHeight / 2  ;
    Sun.hexColor = "#ffac12";
    Sun.glow = true;
    Sun.glowValue = 50;
    
    
    Mercury.name = "Mercury";
    Mercury.size = 2;
    Mercury.xPos = canvas.clientWidth / 2 + 30;
    Mercury.yPos = canvas.clientHeight / 2;
    Mercury.hexColor = "#5c5837";
    Mercury.glow = false;
    Mercury.glowValue = 50;
    Mercury.rotateSpeed = 300;
    
    
    
    Venus.name = "Venus";
    Venus.size = 4;
    Venus.xPos = canvas.clientWidth / 2 + 40;
    Venus.yPos = canvas.clientHeight / 2;
    Venus.hexColor = "#5c5837";
    Venus.glow = false;
    Venus.glowValue = 50;
    Venus.rotateSpeed = 200;
    
    
    Earth.name = "Earth";
    Earth.size = 5;
    Earth.xPos = canvas.clientWidth / 2 + 70;
    Earth.yPos = canvas.clientHeight / 2;
    Earth.hexColor = "#32a852";
    Earth.glow = false;
    Earth.glowValue = 50;
    Earth.rotateSpeed = 100;
    
    
    Mars.name = "Mars";
    Mars.size = 3.5;
    Mars.xPos = canvas.clientWidth / 2 + 90;
    Mars.yPos = canvas.clientHeight / 2;
    Mars.hexColor = "#946437";
    Mars.glow = false;
    Mars.glowValue = 50;
    Mars.rotateSpeed = 140;
    
    
    Jupiter.name = "Jupiter";
    Jupiter.size = 15;
    Jupiter.xPos = canvas.clientWidth / 2 + 150;
    Jupiter.yPos = canvas.clientHeight / 2;
    Jupiter.hexColor = "#ffd29e";
    Jupiter.glow = false;
    Jupiter.glowValue = 0;
    Jupiter.rotateSpeed = 40;
    Jupiter.ringCount = 1; 
    Jupiter.ringSize = 0.3; 
    Jupiter.ringSpacing = 5; 
    Jupiter.ringColor = "#ffd29e";

    Saturn.name = "Saturn";
    Saturn.size = 10;
    Saturn.xPos = canvas.clientWidth / 2 + 180;
    Saturn.yPos = canvas.clientHeight / 2;
    Saturn.hexColor = "#ffd29e";
    Saturn.glow = false;
    Saturn.glowValue = 0;
    Saturn.rotateSpeed = 45;
    Saturn.ringCount = 1;
    Saturn.ringSize = 8;
    Saturn.ringSpacing = 9;
    Saturn.ringColor = "#ffd29e";

}

let Planets = [];
Planets.push(Sun);
Planets.push(Mercury);
Planets.push(Venus);
Planets.push(Earth);
Planets.push(Mars);
Planets.push(Jupiter);
Planets.push(Saturn);
//#endregion

let isDocumentLoaded = false;
let isLoadingTransition = false;
let stopLoadingScreen = false;
let isSolarSystem = false;

var hasRunInit = false;

let scale = 1;
var scaleSpeed = 0; // Adjust this value to control zoom speed
function getObjectFitSize(
    contains, //true = contain, false = cover
    containerWidth,
    containerHeight,
    width,
    height
) {
    var doRatio = width / height;
    var cRatio = containerWidth / containerHeight;
    var targetWidth = 0;
    var targetHeight = 0;
    var test = contains ? doRatio > cRatio : doRatio < cRatio;

    if (test) {
        targetWidth = containerWidth;
        targetHeight = targetWidth / doRatio;
    } else {
        targetHeight = containerHeight;
        targetWidth = targetHeight * doRatio;
    }

    return {
        width: targetWidth,
        height: targetHeight,
        x: (containerWidth - targetWidth) / 2,
        y: (containerHeight - targetHeight) / 2
    };
}

//#region randomGeneration
function generateRandomArbitrary(min, max) {
    return (Math.random() * (max - min) + min);
}

function generateRandomLambda(min, max, mean, stdDeviation) {
    // Generate a random number using Box-Muller transform for normal distribution
    let u1 = Math.random();
    let u2 = Math.random();
    let randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

    // Scale the standard normal to the desired mean and standard deviation
    let randNormal = mean + stdDeviation * randStdNormal;

    // Ensure the result is within the bounds
    return Math.min(Math.max(randNormal, min), max);
}
//#endregion

//#region loadingPage

const starCount = 6000; // Determines how many stars our loading page will have (do not set this value too high)
const galaxyRotateSpeed = 80; // Determines how fast our stars rotate about the center of the galaxy
let starPositionsX = []; // Caches the x positions for our stars
let starPositionsY = []; // Caches the y positions for our stars
let starSpeedMultiplier = []; // The multiplier for our stars the further away from the center they are

let starColors = [];

// Generates the initial points for our stars, call this in init
function generateStars() {
    if (stopLoadingScreen) { return; }

    starPositionsX.length = starCount;
    starPositionsY.length = starCount;
    starSpeedMultiplier.length = starCount;
    starColors.length = starCount;

    for (var i = 0; i < starCount; i++) {
        starPositionsX[i] = generateRandomLambda(0, canvas.width, canvas.clientWidth * 0.5, 60);
        starPositionsY[i] = generateRandomLambda(0, canvas.height, canvas.clientHeight * 0.5, 60);

        let distanceFromCenter = Math.sqrt(Math.pow(starPositionsX[i] - canvas.clientWidth * 0.5, 2) + Math.pow(starPositionsY[i] - canvas.clientHeight * 0.5, 2));
        starSpeedMultiplier[i] = Math.max(0.1, distanceFromCenter * 0.001);

        let starColorRandom = generateRandomLambda(0, 10, 5, 3);
        let starEdgeColor = "";

        if (starColorRandom <= 3) {
            starEdgeColor = "#65d4fc";
        }
        else if (starColorRandom >= 7) {
            starEdgeColor = "#881da8";
        }
        else {
            starEdgeColor = "#ffffff";
        }

        starColors[i] = interpolateColors("#fae684", starEdgeColor, Math.min(1, distanceFromCenter * 0.007));
    }
    console.log("generating stars!");
}

// Rotates our stars about a fixed point, call this in update
function rotateStars(dt) {
    if (stopLoadingScreen) { return; }
    let angle = dt * galaxyRotateSpeed;

    for (let i = 0; i < starCount; i++) {
        let rotatedPoint = rotatePoint(starPositionsX[i], starPositionsY[i], canvas.clientWidth * 0.5, canvas.clientHeight * 0.5, angle * starSpeedMultiplier[i]);
        starPositionsX[i] = rotatedPoint.x;
        starPositionsY[i] = rotatedPoint.y;
    }
}

function renderStars() {
    if (stopLoadingScreen) { return; }
    for (let i = 0; i < starCount; i++) {
        ctx.scale(1, 1);
        ctx.beginPath();
        ctx.arc(starPositionsX[i], starPositionsY[i], 2, 0, 2 * Math.PI);
        ctx.fillStyle = starColors[i];
        //loadingCTX.shadowColor = "white";
        //loadingCTX.shadowBlur = 1;
        ctx.fill();
    }
    console.log("rendering stars!");
}

function renderStarGlow() {
    if (stopLoadingScreen) { return; }
    ctx.beginPath();
    ctx.arc(canvas.clientWidth * 0.5, canvas.clientHeight * 0.5, 80, 0, 2 * Math.PI);
    ctx.fillStyle = "rgb(255, 255, 255, 2%)";
    ctx.fill();
}
//#endregion

//#region colors
function interpolateColors(color1, color2, percent) {
    // Convert the hex colors to RGB values
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    // Interpolate the RGB values
    const r = Math.round(r1 + (r2 - r1) * percent);
    const g = Math.round(g1 + (g2 - g1) * percent);
    const b = Math.round(b1 + (b2 - b1) * percent);

    // Convert the interpolated RGB values back to a hex color
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
//#endregion

//#region Math

function rotatePoint(x, y, cx, cy, angle) {
    // Degrees to radians
    const radians = angle * (Math.PI / 180);

    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const nx = (cos * (x - cx)) - (sin * (y - cy)) + cx;
    const ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;

    return { x: nx, y: ny };
}

function normalize(x, y) {
    const magnitude = Math.sqrt(x * x + y * y);
    if (magnitude === 0) {
        return { x: 0, y: 0 };
    }
    return { x: x / magnitude, y: y / magnitude };
}
//#endregion

//#region onDocumentLoaded
let loadingDelay = 1000;

document.onreadystatechange = () => {
    setTimeout(() => {
        onDocumentLoaded()
    }, loadingDelay);

    console.log("Website is loaded!");
}

function onDocumentLoaded() {
    isDocumentLoaded = true;
    isLoadingTransition = true;
    document.getElementById("loadingTransition").style.opacity = "100%";

}
function whileLoadingTransition() {
    if (!isLoadingTransition || !isDocumentLoaded) { return; }
    scaleSpeed += 0.05;
    scaleSpeed = Math.min(10, scaleSpeed);
    setTimeout(() => {
        transitionToMainPage()
    }, 1200);
    
}

//#endregion

//#region transitionToMainPage
let starSpeedMainPage = 1000;
let starRangeMainPage = 10;
let mainPageTransition = false; //plays our star animation

let starDirMainX = [];
let starDirMainY = [];

let starPosMainX = [];
let starPosMainY = [];

let spawnDelayMainPage = 0;
let spawnTimerMainPage = 0;

function transitionToMainPage() {
    document.getElementById("loadingTransition").style.transitionDuration = "0.3s";
    document.getElementById("loadingTransition").style.opacity = "0%";
    stopLoadingScreen = true;
    scale = 1;
    scaleSpeed = 0;

    mainPageTransition = true;
    isLoadingTransition = false;

    setTimeout(() => {
        loadSolarSystem()
    }, 5000);
}

function generateNewStar() {
    if (!mainPageTransition) { return; }

    starPosMainX.push(canvas.clientWidth * 0.5);
    starPosMainY.push(canvas.clientHeight * 0.5);

    while (true) {
        let randXPos = generateRandomArbitrary(canvas.clientWidth * 0.5 - starRangeMainPage, canvas.clientWidth * 0.5 + starRangeMainPage);
        let randYPos = generateRandomArbitrary(canvas.clientHeight * 0.5 - starRangeMainPage, canvas.clientHeight * 0.5 + starRangeMainPage);

        if (randXPos != canvas.clientWidth * 0.5 && randYPos != canvas.clientHeight * 0.5) { //ensures that the randX and randY do not spawn in the direct screen center
            starDirMainX.push(randXPos - canvas.clientWidth * 0.5);
            starDirMainY.push(randYPos - canvas.clientHeight * 0.5);

            break;
        }
    }
}

function generateMainPageStars(dt) {
    if (!mainPageTransition) { return; }

    // Generate one star
    spawnTimerMainPage += dt;

    if (spawnTimerMainPage >= spawnDelayMainPage) {
        generateNewStar();
        // Calculate the next random delay
        spawnTimerMainPage = 0;
        spawnDelayMainPage = generateRandomArbitrary(0.01, 0.06);
    }
}

function renderMainPageStars() {
    for (let i = 0; i < starPosMainX.length; i++) {
        if (starPosMainX[i] < -10 || starPosMainX[i] > canvas.clientWidth + 10 || starPosMainY[i] < -10 || starPosMainY[i] > canvas.clientHeight + 10) {
            continue;
        }

        let scaleMultiplier = Math.sqrt(Math.pow(starPosMainX[i] - canvas.clientWidth * 0.5, 2) + Math.pow(starPosMainY[i] - canvas.clientHeight * 0.5, 2)) * 0.3;

        ctx.beginPath();
        ctx.arc(starPosMainX[i], starPosMainY[i], 0.02 * scaleMultiplier, 0, 2 * Math.PI);
        ctx.fillStyle = "white";

        ctx.shadowColor = "white";
        ctx.shadowBlur = 100;
        ctx.fill();
    }
}

function moveMainPageStars(dt) {
    for (let i = 0; i < starPosMainX.length; i++) {
        if (starPosMainX[i] < -10 || starPosMainX[i] > canvas.clientWidth + 10 || starPosMainY[i] < -10 || starPosMainY[i] > canvas.clientHeight + 10) {
            continue;
        }

        let direction = normalize(starDirMainX[i], starDirMainY[i]);
        starPosMainX[i] += direction.x * starSpeedMainPage * dt;
        starPosMainY[i] += direction.y * starSpeedMainPage * dt;

    }


}



//#endregion

//#region solarSystem

let planetScalingFactor = 0;
function loadSolarSystem() {
    isSolarSystem = true;
    mainPageTransition = false;
}

function rotatePlanets(dt) {
    for (var i = 0; i < Planets.length; i++) {
        let planetRotatedCoords = rotatePoint(Planets[i].xPos, Planets[i].yPos, canvas.clientWidth / 2, canvas.clientHeight / 2, Planets[i].rotateSpeed * dt);
        Planets[i].xPos = planetRotatedCoords.x;
        Planets[i].yPos = planetRotatedCoords.y;
    }
}

function renderPlanets(dt) {
    if (!isSolarSystem) { return; }

    if (planetScalingFactor < 1) {
        planetScalingFactor += dt * 2.5;
    }
    else if (planetScalingFactor > 1) {
        planetScalingFactor = 1;
    }

    for (var i = 0; i < Planets.length; i++) {
        let planetFromCenterX = Planets[i].xPos - canvas.clientWidth * 0.5;
        let planetFromCenterY = Planets[i].yPos - canvas.clientHeight * 0.5;
        
        ctx.beginPath();
        ctx.arc(Planets[i].xPos + (planetFromCenterX * planetScalingFactor), Planets[i].yPos + (planetFromCenterY * planetScalingFactor), Planets[i].size * planetScalingFactor, 0, 2 * Math.PI);
        ctx.fillStyle = Planets[i].hexColor;
        if (Planets[i].glow == true) {
            ctx.shadowColor = Planets[i].hexColor;
            ctx.shadowBlur = Planets[i].glowValue;
        }
        ctx.fill();

        for (var j = 0; j < Planets[i].ringCount; j++) {
            ctx.beginPath();
            ctx.arc(Planets[i].xPos + (planetFromCenterX * planetScalingFactor), Planets[i].yPos + (planetFromCenterY * planetScalingFactor), Planets[i].size * planetScalingFactor + ((j + 1) * Planets[i].ringSpacing), 0, 2 * Math.PI);
            ctx.strokeStyle = Planets[i].ringColor;
            ctx.lineWidth = Planets[i].ringSize;
            ctx.stroke();
        }
    }
}

//#endregion



let lastUpdate = performance.now();
let deltaTime = 0;

function run() {
    init();

    let currentTime = performance.now();
    deltaTime = (currentTime - lastUpdate) / 1000; // This calculates dt in seconds
    lastUpdate = currentTime;

    update(deltaTime);
    render(deltaTime);

    requestAnimationFrame(run);
}

function init() {
    if (hasRunInit == true) { return; }
    console.log("Init has executed!");

    setCanvasDimensions();
    generateStars();
    generatePlanetParameters();
    hasRunInit = true;
}

function update(dt) {
    whileLoadingTransition();
    rotateStars(dt);

    generateMainPageStars(dt);
    moveMainPageStars(dt);
    rotatePlanets(dt);
    scale += scaleSpeed * dt;
}

function render(dt) {
    setCanvasDimensions();

    ctx.save();
    ctx.translate(canvas.clientWidth / 2, canvas.clientHeight / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.clientWidth / 2, -canvas.clientHeight / 2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    renderStars();
    renderMainPageStars();
    renderPlanets(dt);
    ctx.restore();
}

// Add the resize event listener to regenerate stars when the window size changes
window.addEventListener("resize", () => {
    setCanvasDimensions();
    generateStars();
    generatePlanetParameters();
});

run();
