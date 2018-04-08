var gameScreen;
var output;
var gameLoop;
var car;
var bg1, bg2;

var cones = new Array();
var finish = new Array();

var currentCount = 0;

var gameTimer;
var leftArrowDown = false;
var rightArrowDown = false;
var upArrowDown = false;
var downArrowDown = false;

const BG_SPEED = 10;
const BG_SPEED2 = 15;
const BG_SPEED3 = 20;
const GS_WIDTH = 1050;
const GS_HEIGHT = 600;
const GS_WIDTH2 = 450;
const GS_HEIGHT2 = 600;


		function introVideo(){
			document.getElementById('firstButton').style.display = 'none';
			document.getElementById('Intro').style.display = 'block';
			document.getElementById('sndIntro').play();
			document.getElementById('sndIntro').volume = 0.4;
			sndBackground.loop = true;
		}
		
		function startButton(){
		document.getElementById('firstButton').style.display = 'block';

	}
			
		function level1(){
				document.getElementById('btnContinue').style.display = 'none';
				document.getElementById('introScreen').style.display = 'none';
				document.getElementById('Intro').style.display = 'none';
				document.getElementById('btnDeath').style.display = 'none';
				gameScreen = document.getElementById('gameScreen');
				gameScreen.style.width = GS_WIDTH + 'px';
				gameScreen.style.height = GS_HEIGHT + 'px';

				bg1 = document.createElement('IMG');
				bg1.className = 'gameObject';
				bg1.src = 'streetside.png';
				bg1.style.width = '1050px';
				bg1.style.height = '600px';
				bg1.style.left = '0px';
				bg1.style.top = '0px';
				gameScreen.appendChild(bg1);

				bg2 = document.createElement('IMG');
				bg2.className = 'gameObject';
				bg2.src = 'streetside.png';
				bg2.style.width = '1050px';
				bg2.style.height = '600px';
				bg2.style.left = '1050px';
				bg2.style.top = '0px';
				gameScreen.appendChild(bg2);


				output = document.getElementById('output');

				car = document.createElement('IMG');
				car.src = 'thecar.gif';
				car.className = 'gameObject';
				car.style.width = '68px';
				car.style.height = '68px';
				car.style.top = '275px';
				car.style.left = '68px';

				gameScreen.appendChild(car);

				for(var i=0; i<10; i++){
					var cone = new Image();
					cone.className = 'gameObject';
					cone.style.width = '64px';
					cone.style.height = '64px';
					cone.src = 'coneside.gif';
					gameScreen.appendChild(cone);
					placeCone(cone);
					cones[i] = cone;
				}


				for(var i=0; i<1; i++){
					var finishLine = new Image();
					finishLine.className = 'gameObject';
					finishLine.style.width = '250px';
					finishLine.style.height = '600px';
					finishLine.src = 'finish.gif';
					gameScreen.appendChild(finishLine);
					placeFinishLine(finishLine);
					finish[i] = finishLine;
					
					
				}

				gameTimer = setInterval(gameloop, 50);

			}

			function level2(){
				gameScreen.innerHTML = '';
				document.getElementById('introScreen').style.display = 'none';
				document.getElementById('btnContinue').style.display = 'none';
				document.getElementById('btnDeath2').style.display = 'none';
				gameScreen2 = document.getElementById('gameScreen2');
				gameScreen2.style.width = GS_WIDTH2 + 'px';
				gameScreen2.style.height = GS_HEIGHT2 + 'px';


				bg1 = document.createElement('IMG');
				bg1.className = 'gameObject';
				bg1.src = 'streetvert.jpg';
				bg1.style.width = '450px';
				bg1.style.height = '1422px';
				bg1.style.left = '0px';
				bg1.style.top = '0px';
				gameScreen2.appendChild(bg1);

				bg2 = document.createElement('IMG');
				bg2.className = 'gameObject';
				bg2.src = 'streetvert.jpg';
				bg2.style.width = '450px';
				bg2.style.height = '1422px';
				bg2.style.left = '0px';
				bg2.style.top = '-1422px';
				gameScreen2.appendChild(bg2);

				output = document.getElementById('output');

				car = document.createElement('IMG');
				car.src = 'car.gif';
				car.className = 'gameObject';
				car.style.width = '68px';
				car.style.height = '68px';
				car.style.top = '500px';
				car.style.left = '366px';

				gameScreen2.appendChild(car);

				for(var i=0; i<10; i++){
					var cone = new Image();
					cone.className = 'gameObject';
					cone.style.width = '64px';
					cone.style.height = '64px';
					cone.src = 'cone.gif';
					gameScreen2.appendChild(cone);
					placeCone2(cone);
					cones[i] = cone;
				}


				var finishLine = new Image();
				finishLine.className = 'gameObject';
				finishLine.style.width = '450px';
				finishLine.style.height = '200px';
				finishLine.src = 'finishvert.gif';
				gameScreen2.appendChild(finishLine);
				placeFinishLine2(finishLine);
				finish[1] = finishLine;

				
				gameTimer = setInterval(gameloop2, 50);

			}



			function level3(){
				gameScreen2.innerHTML = '';
				document.getElementById('introScreen').style.display = 'none';
				document.getElementById('btnContinue2').style.display = 'none';
				document.getElementById('btnDeath3').style.display = 'none';
				gameScreen = document.getElementById('gameScreen');
				gameScreen.style.width = GS_WIDTH + 'px';
				gameScreen.style.height = GS_HEIGHT + 'px';

				bg1 = document.createElement('IMG');
				bg1.className = 'gameObject';
				bg1.src = 'streetside.png';
				bg1.style.width = '1050px';
				bg1.style.height = '600px';
				bg1.style.left = '0px';
				bg1.style.top = '0px';
				gameScreen.appendChild(bg1);

				bg2 = document.createElement('IMG');
				bg2.className = 'gameObject';
				bg2.src = 'streetside.png';
				bg2.style.width = '1050px';
				bg2.style.height = '600px';
				bg2.style.left = '-1050px';
				bg2.style.top = '0px';
				gameScreen.appendChild(bg2);

				output = document.getElementById('output');

				car = document.createElement('IMG');
				car.src = 'thecar.gif';
				car.className = 'gameObject';
				car.style.width = '68px';
				car.style.height = '68px';
				car.style.top = '275px';
				car.style.left = '68px';

				gameScreen.appendChild(car);

				for(var i=0; i<10; i++){
					var cone = new Image();
					cone.className = 'gameObject';
					cone.style.width = '64px';
					cone.style.height = '64px';
					cone.src = 'coneside.gif';
					gameScreen.appendChild(cone);
					placeCone(cone);
					cones[i] = cone;
				}


				for(var i=0; i<1; i++){
					var finishLine = new Image();
					finishLine.className = 'gameObject';
					finishLine.style.width = '250px';
					finishLine.style.height = '600px';
					finishLine.src = 'finalfinish.gif';
					gameScreen.appendChild(finishLine);
					placeFinishLine(finishLine);
					finish[i] = finishLine;
				}

				
				gameTimer = setInterval(gameloop3, 50);

			}




			function placeFinishLine(e){
				e.speed = Math.floor(Math.random()*10) + 5;

				e.style.top = '0px';

				var newX = Math.floor(Math.random()*600) + 3500;
				e.style.left = newX + 'px';
			}


			function placeFinishLine2(e){
				e.speed = Math.floor(Math.random()*10) + 5;

				e.style.left = '0px';

				var newY = Math.floor(Math.random()*600) - 4000;
				e.style.top = newY + 'px';
			}

			function placeFinishLine3(e){
				e.speed = Math.floor(Math.random()*10) + 5;

				var maxY = GS_HEIGHT - parseInt(e.style.height);
				var newY = Math.floor(Math.random()*maxY);
				e.style.top = newY + 'px';

				var newX = Math.floor(Math.random()*600) + 5000;
				e.style.left = newX + 'px';
			}




			function placeCone(c){
				c.speed = Math.floor(Math.random()*10) + 6;

				var maxY = GS_HEIGHT - parseInt(c.style.height);
				var newY = Math.floor(Math.random()*maxY);
				c.style.top = newY + 'px';

				var newX = Math.floor(Math.random()*600) + 950;
				c.style.left = newX + 'px';
			}


			function placeCone2(c){
				c.speed = Math.floor(Math.random()*10) + 10;

				var maxX = GS_WIDTH2 - parseInt(c.style.width);
				var newX = Math.floor(Math.random()*maxX);
				c.style.left = newX + 'px';
	

				var newY = Math.floor(Math.random()*600) - 1000;
				c.style.top = newY + 'px';
			}


			function placeCone3(c){
				c.speed = Math.floor(Math.random()*20) + 15;

				var maxY = GS_HEIGHT - parseInt(c.style.height);
				var newY = Math.floor(Math.random()*maxY);
				c.style.top = newY + 'px';

				var newX = Math.floor(Math.random()*600) + 950;
				c.style.left = newX + 'px';
			}





			function explode(obj){
				var explosion = document.createElement('IMG');
				explosion.src = 'explosion.gif?x=' + Date.now();
				explosion.className = 'gameObject';
				explosion.style.width = obj.style.width;
				explosion.style.height = obj.style.height;
				explosion.style.left = obj.style.left;
				explosion.style.top = obj.style.top;
				gameScreen.appendChild(explosion);
			}



			function gameloop(){
					
				document.getElementById('sndDriving').play();
				document.getElementById('sndDriving').volume = 0.4;
				sndBackground.loop = true;

				var bg1X = parseInt(bg1.style.left) - BG_SPEED;
				bg1.style.left = bg1X + 'px';
				var bg2X = parseInt(bg2.style.left) - BG_SPEED;
				bg2.style.left = bg2X + 'px';

				if( bg1X < -1 * GS_WIDTH ){
					bg1.style.left = parseInt(bg2.style.left) + GS_WIDTH + 'px';
				}

				if( bg2X < -1 * GS_WIDTH ){
					bg2.style.left = parseInt(bg1.style.left) + GS_WIDTH + 'px';
				}

				if(upArrowDown){
					var newY = parseInt(car.style.top);
					if(newY > 0) car.style.top = newY - 20 + 'px';
					else car.style.top = '0px';
				}

				if(downArrowDown){
					var newY = parseInt(car.style.top);
					var maxY = GS_HEIGHT - parseInt(car.style.width);
					if(newY <  maxY) car.style.top = newY + 20 + 'px';
					else car.style.top = maxY + 'px';
				}


				if(leftArrowDown){
					var newX = parseInt(car.style.left);
					if(newX > 0) car.style.left = newX - 20 + 'px';
					else car.style.left = '0px';
				}

				if(rightArrowDown){
					var newX = parseInt(car.style.left);
					var maxX = GS_WIDTH - parseInt(car.style.width);
					if(newX <  maxX) car.style.left = newX + 20 + 'px';
					else car.style.left = maxX + 'px';
				}

				
				for(var i=0; i<cones.length; i++){
					var newX = parseInt(cones[i].style.left);
					if(newX <-5) placeCone(cones[i]);
					else cones[i].style.left = newX - cones[i].speed + 'px';


					if( hittest(cones[i], car) ){
						explode(car);
						explode(cones[i]);
						car.style.top = '-1000px';
						placeCone(cones[i]);
						document.getElementById('btnDeath').style.display = 'block';
						clearInterval(gameTimer);
					}
				}

				var cf = 0;
				var newX = parseInt(finish[cf].style.left);
				finish[cf].style.left = newX - finish[cf].speed + 'px';

				if( hittest(finish[cf], car) ){
					placeFinishLine(finish[cf]);
					clearInterval(gameTimer);
					document.getElementById('btnContinue').style.display = 'block';
				}

			}

			function gameloop2(){
					

				var bgY = parseInt(bg1.style.top) + BG_SPEED2;
				if( bgY > GS_HEIGHT ){
					bg1.style.top = -1 * parseInt(bg1.style.height) + 'px';
				}
				else bg1.style.top = bgY + 'px';

				bgY = parseInt(bg2.style.top) + BG_SPEED2;
				if( bgY > GS_HEIGHT ){
					bg2.style.top = -1 * parseInt(bg2.style.height) + 'px';
				}
				else bg2.style.top = bgY + 'px';

				if(leftArrowDown){
					var newX = parseInt(car.style.left);
					if(newX > 0) car.style.left = newX - 20 + 'px';
					else car.style.left = '0px';
				}

				if(rightArrowDown){
					var newX = parseInt(car.style.left);
					var maxX = GS_WIDTH2 - parseInt(car.style.width);
					if(newX <  maxX) car.style.left = newX + 20 + 'px';
					else car.style.left = maxX + 'px';
				}

				
				//output.innerHTML = b.length;
				for(var i=0; i<cones.length; i++){
					var newY = parseInt(cones[i].style.top);
					if(newY > GS_HEIGHT) placeCone2(cones[i]);
					else cones[i].style.top = newY + cones[i].speed + 'px';


					if( hittest(cones[i], car) ){
						explode(car);
						explode(cones[i]);
						car.style.top = '-1000px';
						placeCone2(cones[i]);
						document.getElementById('btnDeath2').style.display = 'block';
						clearInterval(gameTimer);
					}

				}
				var cf = 1;
				var newY = parseInt(finish[cf].style.top);
				finish[cf].style.top = newY + finish[cf].speed + 'px';

				if( hittest(finish[cf], car) ){
					placeFinishLine(finish[cf]);
					clearInterval(gameTimer);
					document.getElementById('btnContinue2').style.display = 'block';
				}

			}

			function gameloop3(){
					
				document.getElementById('sndDriving').play();
				document.getElementById('sndDriving').volume = 0.4;
				sndBackground.loop = true;

				var bg1X = parseInt(bg1.style.left) - BG_SPEED3;
				bg1.style.left = bg1X + 'px';
				var bg2X = parseInt(bg2.style.left) - BG_SPEED3;
				bg2.style.left = bg2X + 'px';

				if( bg1X < -1 * GS_WIDTH ){
					bg1.style.left = parseInt(bg2.style.left) + GS_WIDTH + 'px';
				}

				if( bg2X < -1 * GS_WIDTH ){
					bg2.style.left = parseInt(bg1.style.left) + GS_WIDTH + 'px';
				}

				if(upArrowDown){
					var newY = parseInt(car.style.top);
					if(newY > 0) car.style.top = newY - 20 + 'px';
					else car.style.top = '0px';
				}

				if(downArrowDown){
					var newY = parseInt(car.style.top);
					var maxY = GS_HEIGHT - parseInt(car.style.width);
					if(newY <  maxY) car.style.top = newY + 20 + 'px';
					else car.style.top = maxY + 'px';
				}


				if(leftArrowDown){
					var newX = parseInt(car.style.left);
					if(newX > 0) car.style.left = newX - 20 + 'px';
					else car.style.left = '0px';
				}

				if(rightArrowDown){
					var newX = parseInt(car.style.left);
					var maxX = GS_WIDTH - parseInt(car.style.width);
					if(newX <  maxX) car.style.left = newX + 20 + 'px';
					else car.style.left = maxX + 'px';
				}

				
				for(var i=0; i<cones.length; i++){
					var newX = parseInt(cones[i].style.left);
					if(newX <-5) placeCone(cones[i]);
					else cones[i].style.left = newX - cones[i].speed + 'px';


					if( hittest(cones[i], car) ){
						explode(car);
						explode(cones[i]);
						car.style.top = '-1000px';
						placeCone(cones[i]);
						document.getElementById('btnDeath').style.display = 'block';
						clearInterval(gameTimer);
					}
				}

				var cf = 0;
				var newX = parseInt(finish[cf].style.left);
				finish[cf].style.left = newX - finish[cf].speed + 'px';

				if( hittest(finish[cf], car) ){
					placeFinishLine(finish[cf]);
					clearInterval(gameTimer);
					alert('YOU WIN!');
				}

			}



			function hittest(a, b){
				var aW = parseInt(a.style.width);
				var aH = parseInt(a.style.height);
				// get center point of object a
				var aX = parseInt(a.style.left) + aW/2;
				var aY = parseInt(a.style.top) + aH/2;
				// get radius of object a (average of height and width / 2)
				var aR = (aW + aH) / 4;

				var bW = parseInt(b.style.width);
				var bH = parseInt(b.style.height);
				// get center point of object a
				var bX = parseInt(b.style.left) + bW/2;
				var bY = parseInt(b.style.top) + bH/2;
				// get radius of object a (average of height and width / 2)
				var bR = (bW + bH) / 4;

				var minDistance = aR + bR;

				var cXs = (aX - bX) * (aX - bX); // change in X squared
				var cYs = (aY - bY) * (aY - bY); //change in Y squared
				var distance = Math.sqrt(cXs + cYs);

				if(distance < minDistance) return true;
				else return false;

			}


			document.addEventListener('keydown', function(event){
			if(event.keyCode==37) leftArrowDown = true;
			if(event.keyCode==39) rightArrowDown = true;
			if(event.keyCode==38) upArrowDown = true;
			if(event.keyCode==40) downArrowDown = true;
			});

			document.addEventListener('keyup', function(event){
			if(event.keyCode==37) leftArrowDown = false;
			if(event.keyCode==39) rightArrowDown = false;
			if(event.keyCode==38) upArrowDown = false;
			if(event.keyCode==40) downArrowDown = false;
			});

