
var		gameState=0;
var		score;
const		xResolution=8;
const		yResolution=18;


var		canvasWidth;  // absolute value is 320 (=40*8)
var		canvasHeight; // absolute value is 468 (=26*18)

var		realWidth;
var 		realHeight;

var		fontsize=16;

var		lineHeight=18;
var		columnWidth=10;
var		man = 
		  [ " .)",
		    "/|/",
		    "/  ",
		    "\\o/",
		    "_|_",
		    "   ",
		    "_O_",
		    " | ",
		    "/ \\",
		    " 0 ",
		    "/|\\",
		    "/ )",
		    "_o_",
		    "_| ",
		    "  \\" ];
var		manUpdateInterval=300;
var		earthMoveInterval=300;
var		keySpeed1=300;
var		keySpeed2=100;
var		manId=0;
var		initialManX;
var		manX;
var		manY;       // normalized
var		manYup;
var		manW=columnWidth*3+1; //=31 absolute
var		maxManX;
var		manH=lineHeight*3+3;  // absolute value
var 		canvasElement;
var 		ctx;


var		debugCounter=0;
var		debugArea;

var		counter=0;
var		timerArray=new Array();
var		earthTimerArray= new Array();

var		leftWallWidth;


var		minHoleWidth;   // normalized value. absolute value is 6*8=48
var		additionalWidth; // normalized value. 
var		holeDirection = 1;   /* if 1 go right 
             	( left wall width will increase), if 0, go left (left wall width will decrease) */
var		holeWidth = new Array(canvasHeight);
var		earthHeight; 
var		earthY;

var		highScore;
	       
var jQT=new $.jQTouch({
    icon: 'mifith.png',
    statusBar: 'black-translucent'
});



$(document).ready(function() {
    gameState=0;
    var		i;
    var		flag=0;
    highScore=0;
    for (i=0; i < localStorage.length; i++) {
	if (localStorage.key(i) == "highScore") {
	    highScore=localStorage.highScore;
	}
    }
    canvasWidth=Math.floor($('html').prop('clientWidth')/xResolution); // was 40
    canvasHeight=Math.floor($('html').prop('clientHeight')/yResolution); // was 26

    leftWallWidth=new Array(canvasHeight);

    earthHeight = canvasHeight - 1;
    maxManX=canvasWidth-4;
    initializeCss();
    registerEvent();

});


function initializeCss() {

    var		x,y;
    realWidth = canvasWidth*xResolution;
    realHeight = canvasHeight*yResolution;

//    $('#textCanvas').css('width', realWidth);
//    $('#textCanvas').css('height', realHeight);

    $('#main').append('<canvas id="textCanvas" width=' + realWidth + ' height=' + realHeight + ' ></canvas>');
    initialManX=Math.floor(canvasWidth/2 -3);

    manY = canvasHeight-8;
    manYup=manY-1;

    y= 5;
    x= realWidth  - 150;
    $('#highScore').css('top', y + 'px');
    $('#highScore').css('left', x + 'px');

    y = 30;
    x = realWidth-150;
    $('#score').css('top', y+'px');
    $('#score').css('left', x+'px');

    y = Math.floor( 250*realHeight/548);
    x = Math.floor( (realWidth-78)/2);
    $('#startButton').css('top', y+'px');
    $('#startButton').css('left', x+'px');

    y = Math.floor( 178*realHeight/548);
    x = Math.floor( (realWidth-60)/2);
    $('#message').css('top', y+'px');
    $('#message').css('left', x+'px');

    y = Math.floor( 128*realHeight/548);
    x = Math.floor( (realWidth-198)/2);
    $('#gameOver').css('top', y+'px');
    $('#gameOver').css('left', x+'px');




}



function registerEvent() {
    debugArea=document.getElementById("footer");
    canvasElement = document.getElementById("textCanvas");
    ctx = canvasElement.getContext('2d');
    ctx.font = "" + fontsize + "px 'Courier'";
 
    canvasElement.addEventListener("contextmenu", function(e){ e.preventDefault();}, false);
    $('#textCanvas').mousedown(click);
    $('#textCanvas').bind('touchstart',click);
    $('#main').bind('pageAnimationStart', printHighScore);
}

function startGame() {
    $('#startButton').toggleClass('hide');
    if (gameState==2)
    $('#gameOver').addClass('hide');
    $('#message').addClass('hide');
    minHoleWidth=8;
    additionalWidth=5;

    ctx.clearRect(0,0,realWidth, realHeight);
    manX = initialManX;
    earthY = earthHeight;
    leftWallWidth[earthHeight] =Math.floor( (canvasWidth-minHoleWidth-additionalWidth)/2);
    holeWidth[earthHeight] = minHoleWidth+additionalWidth;
    if (getRandom(10)<5) holeDirection=-1;
    else holeDirection=1;
    setTimeout("updateManPos()", manUpdateInterval);
    setTimeout("earthMove()", earthMoveInterval);
    gameState=1;
    score=0;
    printHighScore();

}

function gameOver() {
    if (score>highScore) {
	highScore=score;
	localStorage.highScore=highScore;
	printMessage("やったね。High Score!!");
	$('#message').toggleClass('hide');
    } else if (score> highScore*0.9) {
	printMessage("おしい！  もう少しで最高点。");
	$('#message').toggleClass('hide');
    }

    gameState=2;
    $('#startButton').toggleClass('hide'); 
    $('#gameOver').toggleClass('hide'); 
}
////"<font size=20px>" + "</font>"
function printMessage(msg) {
    var i;
    var len = jstrlen(msg,len,i);
    
    var x = Math.floor( (realWidth-(len*8))/2);

    $('#message').css('left', x+'px');

    $('#message').html( msg );
}

function jstrlen(str, len, i) {
    len = 0;
    str = escape(str);
    for (i=0; i< str.length; i++, len++) {
	if (str.charAt(i) == "%") {
	    if (str.charAt(++i)=="u") {
		i+=3;
		len++;
	    }
	    i++;
	}
    }
    return len;
}



function stopGame() {
    gameState=0;
}

function getRandom(maxNum) {
    return Math.floor(Math.random() * maxNum );
}




// normalized version of clear rectangle
//  x, y --> normalized value
//  w, h --> absolute value
function myClearRect(x, y, w, h) {
    ctx.clearRect(x*xResolution-1, y*yResolution, w, h);
}

function dispMan() {
    var		y=manY;
//    myClearRect(manX,manYup,manW,manH);
    ctx.fillText(man[manId],manX*xResolution, y*yResolution);
    y++;
    ctx.fillText(man[manId+1],manX*xResolution, y*yResolution);
    y++;
    ctx.fillText(man[manId+2],manX*xResolution, y*yResolution);
}

function ifTouch() {
    var		y;
    var		rc=0;
    for ( y=manY; y<manY+3; y++) {
	if (earthY>y) {
	    rc=0;
	    break;
	}
	if (manX < leftWallWidth[y] ) rc= 1;
	if (manX+3> leftWallWidth[y]+holeWidth[y] ) rc= 1;
    }
    if (rc==1) drawEarth();
    return rc;
}

function updateManPos() {
    dispMan();
    manId = manId + 3;
    if (manId == 15) manId=0;
    if (gameState==1)
    setTimeout("updateManPos()", manUpdateInterval);

}


function click(e) {
    e.preventDefault();

    if (gameState!=1) return;
    var xClicked = e.clientX;

    if  (xClicked>0) {
	manMove(xClicked);
	return;
    }

    var	t=e.touches[0];
    manMove(t.pageX);
}

function manMove(x) {
    var		criteria1=manX*xResolution;
    var		criteria2=criteria1+(3*xResolution);
    if (x<criteria1) goLeft();
    else if ( x>criteria2) goRight();
}

function clearAllTimeout() {
    var  lastTimer=timerArray.pop();
    while (lastTimer) {
	clearTimeout(lastTimer);
	lastTimer=timerArray.pop();
    }
}


function unclick(e) {

    e.preventDefault();
}


function goRight() {
    if (manX < maxManX ) {
	myClearRect(manX,manYup,manW,manH);
	manX++;
	dispMan();
    }
    if (ifTouch() ) gameOver();

}

function goLeft() {
    if (manX>0) {
	myClearRect(manX,manYup,manW,manH);
	manX--;
	dispMan();
    }
    if (ifTouch() ) gameOver();
}




function nextDirection() {
    var		ransuu=getRandom(30);
    var		oldHoleDirection=holeDirection;
    if (leftWallWidth[earthHeight] == 0 ) {
	if (ransuu<25) return 1;
	return 0;
    }

    if (leftWallWidth[earthHeight]== canvasWidth-holeWidth[earthHeight] ) {
	if (ransuu<25) return -1;
       	return 0;
    }
    if (leftWallWidth[earthHeight] < 4) {
	if (ransuu<25) return 1;
	return 0;
    }
    if (leftWallWidth[earthHeight] > canvasWidth-4-holeWidth[earthHeight] ) {
	if (ransuu<25)  return -1;
	return 0;
    } 
    if (oldHoleDirection == 0) {
	if (ransuu<12) return -1;
	if (ransuu<25) return 1;
	return 0;
    }
    if (ransuu<26) {
	return oldHoleDirection;
    } 
    return -1 * oldHoleDirection;
}

 
function nextLeftWallWidth() {
    holeDirection=nextDirection();
//    debugPrint("hole direction : " + holeDirection);
    return leftWallWidth[earthHeight]+holeDirection;
}

function nextHoleWidth() {
    var		ransuu=getRandom(100);
    if ((ransuu>98)&&(additionalWidth<8)) additionalWidth++;
    if ((ransuu<4)&&(additionalWidth>0)) additionalWidth--;
    return minHoleWidth+additionalWidth;
}



function drawHorizontalLine(startX, endX, yy) {
    var 	x0,y0, width,height;
    x0 = startX * xResolution;
    width = (endX-startX) * xResolution;
    y0 = yy * yResolution;
    height =  yResolution ;
//    ctx.rect(x0,y0,width,height) ;
    ctx.fillStyle="brown";
    ctx.fillRect(x0,y0,width,height) ;
    ctx.fillStyle="black";
}
function drawHole(startX, width, y) {
    var x0,y0,w,h;
    x0=startX*xResolution;
    y0= y*yResolution;
    w = width*xResolution;
    h = yResolution;
//    debugPrint("clearRect: "+x0 + ", "+y0+", "+w+", "+h+", ");
    ctx.clearRect( x0, y0, w, h);
}

function drawEarth() {
    for	( i=earthY; i<=earthHeight; i++) {
	drawHorizontalLine(0, leftWallWidth[i], i);

	drawHorizontalLine(leftWallWidth[i]+holeWidth[i],canvasWidth, i);
    }
 }

function earthMove() {
    var		i;
    if (gameState==2) return;
    if (earthY>0) earthY--;
    for ( i=earthY; i<earthHeight; i++ ) {
	leftWallWidth[i] = leftWallWidth[i+1];
	holeWidth[i]     = holeWidth[i+1];
    }
    leftWallWidth[earthHeight] = nextLeftWallWidth();
    holeWidth[earthHeight] = nextHoleWidth();
    ctx.clearRect(0,0,canvasWidth*xResolution, canvasHeight*yResolution);
    dispMan();
    drawEarth();
   
    if (ifTouch() ) {
	gameOver();
    } else {

	setTimeout("earthMove()", earthMoveInterval);
	score++;
	changeSpeed(score);
	printScore();
    }
}

function changeSpeed(score) {
    if (score>1000) earthMoveInterval=140;
    else if (score>600) earthMoveInterval=160;
    else if (score>500) earthMoveInterval=180; 
    else if (score>400) earthMoveInterval=200;
    else if (score>300) earthMoveInterval=250;
}

    
//<font size=10> + "</font>"
function printScore() {
    $('#score').html("Your Score : " +score);
//    $('#score').val(score);
}

function printHighScore() {
    $('#highScore').html("High Score : " +highScore);
//    $('#score').val(score);
}

function debugPrint(msg) {
    debugArea.innerHTML = msg;
}


