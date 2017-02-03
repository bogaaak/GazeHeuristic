var fontSize = 12;
var bomber, fighter, bSpeed, fSpeed, bSpeedSlider, fSpeedSlider;
var bomberAngle;
var doesOverlap = false;
var playIt = false;
function preload() {
  font = loadFont("assets/Gill Sans MT.ttf");
}
var cHeight, cWidth;
var setTizzyInput;
var startSec;
var diffSec;

function setup() {
  cHeight = 950;
  cWidth = 1200;
  canvas = createCanvas(cWidth, cHeight);
  console.log("Pos of canvas: ", canvas.position());
  headerHeight = canvas.position().y;
  textFont(font);
  var buttonIndent = 100
  // Create object
  var playButton = createButton("Play / Pause");
  playButton.mousePressed(togglePlaying);
  playButton.position(cWidth - buttonIndent, headerHeight + 50);
  var resetButton = createButton("Reset");
  resetButton.mousePressed(resetSketch);
  resetButton.position(cWidth - buttonIndent, headerHeight + 20);

  fSpeedSlider = createSlider(1, 200, 120);
  fSpeedSlider.position(20, headerHeight + 20);
  fCRSlider = createSlider(1, 200, 1);
  fCRSlider.position(20, headerHeight + 50);

  bSpeedSlider = createSlider(1, 200, 80);
  bSpeedSlider.position(20, headerHeight + 80);

  var updateAngleButton = createButton("Update Tizzy Angle (IsoTriangle)");
  updateAngleButton.mousePressed(updateAngle);
  updateAngleButton.position(cWidth/2-30, headerHeight + 20);

  setTizzyInput = createInput('0');
  setTizzyInput.position(cWidth/2-30, headerHeight + 50);
  setTizzyInput.size(30, 23);

  var setTizzyButton = createButton("Update Tizzy Angle (Manually)");
  setTizzyButton.mousePressed(setTizzyAngle);
  setTizzyButton.position(cWidth/2, headerHeight + 50);

  resetSketch();
}

function draw() {
  background(80, 119, 130);
  fill('white');
  text("Fighter speed", 165, 35);
  text("Fighter cycling rate", 165, 65);
  fill('black');
  text("Bomber speed", 165, 95);
  var currentTizzy = round(degrees(fighter.tizzyAngle));
  text("Current Tizzy Angle: " + currentTizzy + "°", cWidth/2-30, 95);
  displayX(bomber, fighter);
  bomber.display();
  fighter.display();
  if (playIt) {
 	if (keyIsDown(78)) {
    	bomber.angle += -0.03;
	}
  	if (keyIsDown(77)) {
    	bomber.angle += +0.03;
  	}
  	bomber.speed = bSpeedSlider.value() / 100;
  	fighter.speed = fSpeedSlider.value() / 100;
  	fCyclingRate = fCRSlider.value();
  	bomber.move();
  	if (frameCount % fCyclingRate === 0) {
  		fighter.adjustDirection(bomber);
  	}
  	fighter.move();
  	doesOverlap = checkOverlap(fighter, bomber);
  	if (doesOverlap) resetSketch();
  }

}

function resetSketch() {
	bSpeed = bSpeedSlider.value() / 100;
	fSpeed = fSpeedSlider.value() / 100;
	bomber = new Aircraft(50, 800, 18/10 * PI, bSpeed, false, color(0, 0, 0));
  	fighter = new Aircraft(50, 120, 0, fSpeed, true, color(255, 255, 255), bomber);
	// bomber = new Aircraft(50, 120, QUARTER_PI, bSpeed, false, color(0, 0, 0));
//   	fighter = new Aircraft(50, 800, 0, fSpeed, true, color(255, 255, 255), bomber);

}


function setTizzyAngle(){
  var newTizzyAngle = radians(setTizzyInput.value());
  fighter.tizzyAngle = newTizzyAngle;
}


function updateAngle() {
   fighter.tizzyAngle = calcTizzyAngle(fighter.x, fighter.y, bomber);
}


function togglePlaying() {
	playIt = !playIt;
	return playIt;
}

function keyPressed() {
    if (keyCode == 32) {
        playIt = !playIt;
    } else if (keyCode == 82) {
    	resetSketch();
    }
}





function displayX(bomber, fighter) {
  if (fighter.tizzyAngle === 0) {
  	stroke("black");
  	// fill('black');
  	line(bomber.x, bomber.y, fighter.x, fighter.y);
  	noStroke();
  } else {
  var p1 = createVector(bomber.x, bomber.y);
  var p3 = createVector(fighter.x, fighter.y);
  var currentAngleBetweenFandB = atan2(fighter.y - bomber.y, fighter.x - bomber.x)
  var bAngle = currentAngleBetweenFandB + fighter.tizzyAngle;
  var p21 = createVector(cos(bAngle), sin(bAngle));
  var p43 = createVector(cos(fighter.angle), sin(fighter.angle));
  var uaNom = p43.x * (p1.y - p3.y) - p43.y * (p1.x - p3.x);
//   var ubNom = p21.x * (p1.y - p3.y) - p21.y * (p1.x - p3.x);
  var den = p43.y * (p21.x) - p43.x * (p21.y);
  if (den === 0) {
  } else {
    var ua = -uaNom / den;
    if (ua < 0) {
    ua = -ua;
    }
  }
//   var ub = ubNom / den;
  var Xx = p1.x + ua*(p21.x)
  var Xy = p1.y + ua*(p21.y)
  stroke("black");
  fill('black');
  line(bomber.x, bomber.y, fighter.x, fighter.y);
  line(bomber.x, bomber.y, Xx, Xy);
  line(fighter.x, fighter.y, Xx, Xy);
  noFill();
  stroke("red");
  if (fighter.tizzyAngle < 0) {
  	arc(fighter.x, fighter.y, 40, 40, currentAngleBetweenFandB + PI, fighter.angle);
  } else {
  	arc(fighter.x, fighter.y, 40, 40, fighter.angle, currentAngleBetweenFandB + PI);
  }
  noStroke();
  fill("yellow");
  textSize(fontSize+2);
  message = "X";
  bounds = font.textBounds(message, 0, 0, fontSize+2);
  xT = Xx - bounds.w / 2;
  yT = Xy + bounds.h / 2;
  text(message, xT, yT);
  textSize(fontSize+2);
  fill("black");
  }
}

function checkOverlap(aircraft1, aircraft2) {
	overallDiameter = aircraft1.diameter/2 + aircraft2.diameter/2;
	distance = dist(aircraft1.x, aircraft1.y, aircraft2.x, aircraft2.y);
	if (distance <= overallDiameter) {
		var doesOverlap = true;
		} else {
		var doesOverlap = false;
		}
	return doesOverlap;
}

// Aircraft class. Stupid use of OOP until now. But seems as if there will be
// only 1 bomber and 1 fighter. No need to do inheritance, etc...
function Aircraft(x, y, angle, speed, isFighter, color, fightingBomber) {
  // this.x = random(width);
//   this.y = random(height);
  this.x = x;
  this.y = y;
  this.isFighter = isFighter;
//   this.diameter = random(10, 30);
  this.diameter = 20;
  this.speed = speed;
  this.angle = angle;
  this.color = color;
  if (this.isFighter) {
  	this.tizzyAngle = calcTizzyAngle(this.x, this.y, fightingBomber);
  } else {
  	this.tizzyAngle = 0;
  }

  this.move = function() {
    this.x += cos(this.angle)*this.speed;
    this.y += sin(this.angle)*this.speed;
  };

  this.display = function() {
    fill(this.color)
    ellipse(this.x, this.y, this.diameter, this.diameter);
    if (this.isFighter) {
        message = "F"
    	bounds = font.textBounds(message, 0, 0, fontSize);
  		xT = this.x - bounds.w / 2;
  		yT = this.y + bounds.h / 2;
    	fill("black");
    	text(message, xT, yT);
    } else {
    	message = "B"
    	bounds = font.textBounds(message, 0, 0, fontSize);
  		xT = this.x - bounds.w / 2;
  		yT = this.y + bounds.h / 2;
    	fill("white");
    	text(message, xT, yT);
    }

  };

  this.adjustDirection = function(bomber) {
  	var dy = bomber.y - this.y;
	var dx = bomber.x - this.x;
	var connectionAngle = atan2(dy, dx);
  	// console.log("Connect " + degrees(connectionAngle));
//   	console.log("Direction " + degrees(connectionAngle - this.tizzyAngle));
  	this.angle = connectionAngle - this.tizzyAngle;
  };

}

// Needed for inital calculation of Tizzy angle
function calcTizzyAngle(x, y, bomber) {
	var dy = y - bomber.y;
	var dx = x - bomber.x;
	var connectionAngle = atan2(dy, dx);
	if (connectionAngle < 0) {
    console.log("Changed from: " + degrees(connectionAngle));
		connectionAngle += 2 *PI;
	}
    console.log("bomber " + degrees(bomber.angle));
    console.log("connectionAngle " + degrees(connectionAngle));
    console.log("bomber - connectionAngle " + degrees(bomber.angle - connectionAngle));
//     tizzyAngleDif = min([abs(tizzyAngle-bomber.angle), abs(tizzyAngle+bomber.angle)]);
	var tizzyAngle = bomber.angle - connectionAngle;
    return tizzyAngle;
}
