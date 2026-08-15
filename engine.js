// ROCKIN RACER - 99-Level Campaign & Vector Engine
var gameScreen;
var gameScreen2;
var output;
var gameTimer;
var particleTimer;
var timeSlowTimer = null;
var isTimeSlowActive = false;
var car;
var bg1, bg2;

var cones = [];
var powerups = [];
var oilSlicks = [];
var rivalCars = [];
var finish = [];
var particles = [];

// Game Stats & State
var currentLevel = parseInt(localStorage.getItem('rockinracer_currentlevel') || '1');
var score = 0;
var highScore = parseInt(localStorage.getItem('rockinracer_highscore') || '0');
var selectedCar = localStorage.getItem('rockinracer_selectedcar') || 'red';
var nitro = 100;
var hasShield = false;
var isSpinningOut = false;
var isMuted = false;
var shieldAuraEl = null;

// Controls State (WASD & Arrow Keys + Spacebar)
var leftArrowDown = false;
var rightArrowDown = false;
var upArrowDown = false;
var downArrowDown = false;
var spaceDown = false;

const GS_WIDTH = 1050;
const GS_HEIGHT = 600;
const GS_WIDTH2 = 450;
const GS_HEIGHT2 = 600;

// Car Color Schemes
const CAR_COLORS = {
	red:   { primary: '#ff0055', secondary: '#ffea00', perk: 'BALANCED' },
	blue:  { primary: '#00e5ff', secondary: '#0055ff', perk: '+20% NITRO RECHARGE' },
	gold:  { primary: '#ffea00', secondary: '#ffffff', perk: '+25% SCORE BONUS' },
	cyber: { primary: '#00ff66', secondary: '#00e5ff', perk: '+1 SHIELD CHARGE' }
};

// Web Audio API Synthesizer (100% Reliable Sound FX)
var audioCtx = null;
function getAudioCtx() {
	if (!audioCtx) {
		var AudioContextClass = window.AudioContext || window.webkitAudioContext;
		if (AudioContextClass) audioCtx = new AudioContextClass();
	}
	if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
	return audioCtx;
}

function playSynthSound(type) {
	if (isMuted) return;
	var ctx = getAudioCtx();
	if (!ctx) return;

	try {
		var now = ctx.currentTime;
		if (type === 'pickup') {
			var osc = ctx.createOscillator();
			var gain = ctx.createGain();
			osc.type = 'triangle';
			osc.frequency.setValueAtTime(523, now);
			osc.frequency.exponentialRampToValueAtTime(784, now + 0.12);
			gain.gain.setValueAtTime(0.3, now);
			gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
			osc.connect(gain); gain.connect(ctx.destination);
			osc.start(now); osc.stop(now + 0.12);
		} else if (type === 'shield') {
			var osc = ctx.createOscillator();
			var gain = ctx.createGain();
			osc.type = 'sine';
			osc.frequency.setValueAtTime(440, now);
			osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
			gain.gain.setValueAtTime(0.4, now);
			gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
			osc.connect(gain); gain.connect(ctx.destination);
			osc.start(now); osc.stop(now + 0.2);
		} else if (type === 'nitro') {
			var osc = ctx.createOscillator();
			var gain = ctx.createGain();
			osc.type = 'sawtooth';
			osc.frequency.setValueAtTime(220, now);
			osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
			gain.gain.setValueAtTime(0.2, now);
			gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
			osc.connect(gain); gain.connect(ctx.destination);
			osc.start(now); osc.stop(now + 0.15);
		} else if (type === 'crash') {
			var bufferSize = ctx.sampleRate * 0.3;
			var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			var data = buffer.getChannelData(0);
			for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
			var noise = ctx.createBufferSource();
			noise.buffer = buffer;
			var gain = ctx.createGain();
			gain.gain.setValueAtTime(0.5, now);
			gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
			noise.connect(gain); gain.connect(ctx.destination);
			noise.start(now);
		} else if (type === 'win') {
			var freqs = [523, 659, 784, 1046];
			freqs.forEach((f, idx) => {
				var osc = ctx.createOscillator();
				var gain = ctx.createGain();
				osc.type = 'triangle';
				osc.frequency.setValueAtTime(f, now + idx * 0.08);
				gain.gain.setValueAtTime(0.3, now + idx * 0.08);
				gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
				osc.connect(gain); gain.connect(ctx.destination);
				osc.start(now + idx * 0.08); osc.stop(now + idx * 0.08 + 0.2);
			});
		}
	} catch (e) { console.log('Synth sound catch:', e); }
}

// Vector SVG Generators (100% Transparent, No Background Boxes)
function getCarSVG(dir, carType) {
	var c = CAR_COLORS[carType] || CAR_COLORS.red;
	if (dir === 'side') {
		return `<svg viewBox="0 0 120 60" width="88" height="44" class="vector-car">
			<g>
				<!-- Wheels -->
				<circle cx="28" cy="46" r="10" fill="#111" stroke="#444" stroke-width="2"/>
				<circle cx="28" cy="46" r="4" fill="${c.secondary}"/>
				<circle cx="92" cy="46" r="10" fill="#111" stroke="#444" stroke-width="2"/>
				<circle cx="92" cy="46" r="4" fill="${c.secondary}"/>
				<!-- Main Body -->
				<path d="M 8,42 Q 15,24 35,22 L 65,14 Q 85,14 105,30 L 115,38 Q 118,44 110,46 L 10,46 Z" fill="${c.primary}"/>
				<!-- Cabin / Windshield -->
				<path d="M 40,22 L 62,16 L 80,24 Q 70,22 40,22 Z" fill="#111827" stroke="${c.secondary}" stroke-width="1.5"/>
				<!-- Racing Stripe -->
				<path d="M 10,36 L 112,36" stroke="${c.secondary}" stroke-width="3" stroke-dasharray="8,4"/>
				<!-- Spoiler -->
				<path d="M 6,24 L 18,24 L 14,30 L 8,30 Z" fill="#111"/>
				<!-- Headlight -->
				<ellipse cx="112" cy="38" rx="3" ry="2" fill="#ffff00"/>
			</g>
		</svg>`;
	} else {
		return `<svg viewBox="0 0 60 120" width="44" height="88" class="vector-car">
			<g>
				<!-- Main Chassis -->
				<rect x="10" y="10" width="40" height="100" rx="12" fill="${c.primary}"/>
				<!-- Hood Stripes -->
				<rect x="26" y="10" width="8" height="100" fill="${c.secondary}"/>
				<!-- Windshield & Rear Window -->
				<rect x="14" y="32" width="32" height="24" rx="4" fill="#111827" stroke="${c.secondary}" stroke-width="1.5"/>
				<rect x="16" y="76" width="28" height="16" rx="3" fill="#111827"/>
				<!-- Wheels -->
				<rect x="4" y="20" width="6" height="18" rx="2" fill="#222"/>
				<rect x="50" y="20" width="6" height="18" rx="2" fill="#222"/>
				<rect x="4" y="82" width="6" height="18" rx="2" fill="#222"/>
				<rect x="50" y="82" width="6" height="18" rx="2" fill="#222"/>
				<!-- Headlights -->
				<circle cx="16" cy="14" r="3" fill="#ffff00"/>
				<circle cx="44" cy="14" r="3" fill="#ffff00"/>
			</g>
		</svg>`;
	}
}

function getConeSVG(dir) {
	if (dir === 'side') {
		return `<svg viewBox="0 0 60 60" width="52" height="52" class="vector-cone">
			<g>
				<!-- Base Plate -->
				<rect x="6" y="50" width="48" height="8" rx="2" fill="#d97706"/>
				<!-- Cone Body -->
				<path d="M 12,50 L 26,10 Q 30,4 34,10 L 48,50 Z" fill="#ff5500"/>
				<!-- Reflective Stripe -->
				<path d="M 20,32 L 27,15 L 33,15 L 40,32 Z" fill="#ffffff" opacity="0.9"/>
			</g>
		</svg>`;
	} else {
		return `<svg viewBox="0 0 60 60" width="52" height="52" class="vector-cone">
			<g>
				<!-- Square Base -->
				<rect x="8" y="8" width="44" height="44" rx="4" fill="#d97706"/>
				<!-- Concentric Rings -->
				<circle cx="30" cy="30" r="18" fill="#ff5500"/>
				<circle cx="30" cy="30" r="12" fill="#ffffff" opacity="0.9"/>
				<circle cx="30" cy="30" r="6" fill="#ff5500"/>
			</g>
		</svg>`;
	}
}

// Intro & Setup
function setupIntro() {
	var introScr = document.getElementById('introScreen');
	if (introScr) {
		introScr.style.display = 'block';
		introScr.style.backgroundImage = 'url("streetside.jpg")';
	}
	if (document.getElementById('titleHeader')) document.getElementById('titleHeader').style.display = 'block';
	if (document.getElementById('btnWatchIntro')) document.getElementById('btnWatchIntro').style.display = 'block';
	if (document.getElementById('btnSkipIntro')) document.getElementById('btnSkipIntro').style.display = 'none';
	if (document.getElementById('firstButton')) document.getElementById('firstButton').style.display = 'block';
	if (document.getElementById('garageContainer')) document.getElementById('garageContainer').style.display = 'flex';
	if (document.getElementById('Intro')) document.getElementById('Intro').style.display = 'none';
	if (document.getElementById('hudBar')) document.getElementById('hudBar').style.display = 'none';
	if (document.getElementById('bulletTimeOverlay')) document.getElementById('bulletTimeOverlay').style.display = 'none';
	
	renderCarPreviews();
	chooseCar(selectedCar);
	updateHighScoreDisplay();
	
	var sndBg = document.getElementById('sndBackground');
	if (sndBg) sndBg.loop = true;
}

function renderCarPreviews() {
	['red', 'blue', 'gold', 'cyber'].forEach(type => {
		var box = document.getElementById('preview' + type.charAt(0).toUpperCase() + type.slice(1));
		if (box) box.innerHTML = getCarSVG('side', type);
	});
}

function chooseCar(type) {
	selectedCar = type;
	localStorage.setItem('rockinracer_selectedcar', type);

	['Red', 'Blue', 'Gold', 'Cyber'].forEach(t => {
		var card = document.getElementById('carCard' + t);
		if (card) {
			if (t.toLowerCase() === type) card.classList.add('selected');
			else card.classList.remove('selected');
		}
	});
}

function updateHighScoreDisplay() {
	var el = document.getElementById('highScoreVal');
	if (el) el.innerText = String(highScore).padStart(5, '0');
}

function updateScoreDisplay() {
	var el = document.getElementById('scoreVal');
	if (el) el.innerText = String(score).padStart(5, '0');
}

function updateLevelDisplay() {
	var el = document.getElementById('levelVal');
	if (el) el.innerText = 'LEVEL ' + currentLevel + '/99';
}

function updateNitroDisplay() {
	var el = document.getElementById('nitroBar');
	if (el) el.style.width = Math.max(0, Math.min(100, nitro)) + '%';
}

function updateShieldDisplay() {
	var el = document.getElementById('shieldBadge');
	if (el) el.style.display = hasShield ? 'inline-block' : 'none';
	
	if (car && hasShield) {
		if (!shieldAuraEl) {
			shieldAuraEl = document.createElement('div');
			shieldAuraEl.className = 'shield-aura';
			var isVert = (currentLevel % 2 === 0);
			shieldAuraEl.style.width = isVert ? '60px' : '104px';
			shieldAuraEl.style.height = isVert ? '104px' : '60px';
			var parent = isVert ? gameScreen2 : gameScreen;
			if (parent) parent.appendChild(shieldAuraEl);
		}
		var carX = parseInt(car.style.left) - 8;
		var carY = parseInt(car.style.top) - 8;
		shieldAuraEl.style.left = carX + 'px';
		shieldAuraEl.style.top = carY + 'px';
		shieldAuraEl.style.display = 'block';
	} else if (shieldAuraEl) {
		shieldAuraEl.style.display = 'none';
	}
}

function toggleMute() {
	isMuted = !isMuted;
	var btn = document.getElementById('btnMute');
	if (btn) btn.innerText = isMuted ? '🔇' : '🔊';
	
	['sndIntro', 'sndBackground', 'sndDriving'].forEach(id => {
		var audio = document.getElementById(id);
		if (audio) audio.muted = isMuted;
	});
}

function playIntroVideo() {
	getAudioCtx();
	var introScr = document.getElementById('introScreen');
	if (introScr) {
		introScr.style.backgroundImage = 'none';
		introScr.style.backgroundColor = 'transparent';
	}
	if (document.getElementById('titleHeader')) document.getElementById('titleHeader').style.display = 'none';
	if (document.getElementById('btnWatchIntro')) document.getElementById('btnWatchIntro').style.display = 'none';
	if (document.getElementById('btnSkipIntro')) document.getElementById('btnSkipIntro').style.display = 'block';
	if (document.getElementById('garageContainer')) document.getElementById('garageContainer').style.display = 'none';
	if (document.getElementById('firstButton')) document.getElementById('firstButton').style.display = 'none';
	
	var introVid = document.getElementById('Intro');
	if (introVid) {
		introVid.style.display = 'block';
		introVid.currentTime = 0;
		introVid.muted = isMuted;
		introVid.play().catch(function(e) { showBeginButton(); });
	}

	var sndIntro = document.getElementById('sndIntro');
	if (sndIntro) {
		sndIntro.volume = 0.4;
		sndIntro.currentTime = 0;
		sndIntro.muted = isMuted;
		sndIntro.play().catch(function(e){});
	}
}

function introFinished() {
	showBeginButton();
}

function showBeginButton() {
	var introScr = document.getElementById('introScreen');
	if (introScr) introScr.style.backgroundImage = 'url("streetside.jpg")';
	var introVid = document.getElementById('Intro');
	if (introVid) { introVid.pause(); introVid.style.display = 'none'; }
	var sndIntro = document.getElementById('sndIntro');
	if (sndIntro) sndIntro.pause();

	if (document.getElementById('titleHeader')) document.getElementById('titleHeader').style.display = 'block';
	if (document.getElementById('btnWatchIntro')) document.getElementById('btnWatchIntro').style.display = 'none';
	if (document.getElementById('btnSkipIntro')) document.getElementById('btnSkipIntro').style.display = 'none';
	if (document.getElementById('garageContainer')) document.getElementById('garageContainer').style.display = 'flex';
	if (document.getElementById('firstButton')) document.getElementById('firstButton').style.display = 'block';
}

function startCampaign() {
	getAudioCtx();
	currentLevel = 1;
	score = 0;
	startStage(1);
}

// Particle Engine
function startParticleLoop() {
	var canvas = document.getElementById('particleCanvas');
	if (!canvas) return;
	var ctx = canvas.getContext('2d');

	if (particleTimer) clearInterval(particleTimer);
	particleTimer = setInterval(function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (var i = particles.length - 1; i >= 0; i--) {
			var p = particles[i];
			p.x += p.vx;
			p.y += p.vy;
			p.life -= p.decay;

			if (p.life <= 0) {
				particles.splice(i, 1);
				continue;
			}

			if (p.isText) {
				ctx.font = 'bold 16px "Press Start 2P", monospace';
				ctx.fillStyle = `rgba(255, 234, 0, ${p.life})`;
				ctx.fillText(p.text, p.x, p.y);
			} else {
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
				ctx.fillStyle = p.color.replace('ALPHA', p.life);
				ctx.fill();
			}
		}
	}, 30);
}

function spawnExplosionParticles(x, y) {
	for (var i = 0; i < 25; i++) {
		var angle = Math.random() * Math.PI * 2;
		var speed = Math.random() * 8 + 2;
		particles.push({
			x: x, y: y,
			vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
			size: Math.random() * 6 + 3, life: 1.0, decay: Math.random() * 0.05 + 0.03,
			color: Math.random() > 0.5 ? 'rgba(255, 0, 85, ALPHA)' : 'rgba(255, 234, 0, ALPHA)'
		});
	}
}

function spawnNitroParticles(x, y, dir) {
	playSynthSound('nitro');
	var c = CAR_COLORS[selectedCar] ? CAR_COLORS[selectedCar].primary : '#00e5ff';
	for (var i = 0; i < 3; i++) {
		var spread = (Math.random() - 0.5) * 6;
		particles.push({
			x: x, y: y,
			vx: dir === 'left' ? -(Math.random() * 6 + 4) : spread,
			vy: dir === 'down' ? (Math.random() * 6 + 4) : spread,
			size: Math.random() * 5 + 2, life: 1.0, decay: 0.1,
			color: c === '#00e5ff' ? 'rgba(0, 229, 255, ALPHA)' : 'rgba(255, 0, 85, ALPHA)'
		});
	}
}

function spawnSpinoutSmoke(x, y) {
	for (var i = 0; i < 6; i++) {
		particles.push({
			x: x + (Math.random() - 0.5) * 20, y: y + (Math.random() - 0.5) * 20,
			vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3,
			size: Math.random() * 8 + 4, life: 1.0, decay: 0.08,
			color: 'rgba(200, 200, 200, ALPHA)'
		});
	}
}

function spawnFloatingText(x, y, text) {
	particles.push({ x: x, y: y, vx: 0, vy: -1.5, life: 1.0, decay: 0.03, isText: true, text: text });
}

// Power-ups & Hazards Helpers
function placePowerup(p, isVertical, index, baseSpeed) {
	var types = ['powerup-nitro', 'powerup-shield', 'powerup-star', 'powerup-time'];
	var icons = { 'powerup-nitro': '⚡', 'powerup-shield': '🛡️', 'powerup-star': '⭐', 'powerup-time': '⏱️' };
	var type = types[Math.floor(Math.random() * types.length)];
	
	p.type = type;
	p.className = 'powerup ' + type;
	p.innerText = icons[type];
	p.style.width = '42px';
	p.style.height = '42px';

	if (isVertical) {
		p.speed = baseSpeed;
		var lanes = [50, 190, 330];
		p.style.left = lanes[Math.floor(Math.random() * lanes.length)] + 'px';
		p.style.top = (-600 - (index * 400)) + 'px';
	} else {
		p.speed = baseSpeed;
		var lanes = [60, 180, 300, 420];
		p.style.top = lanes[Math.floor(Math.random() * lanes.length)] + 'px';
		p.style.left = (1500 + (index * 450)) + 'px';
	}
}

function handlePowerupPickup(p) {
	if (p.type === 'powerup-nitro') {
		nitro = 100;
		updateNitroDisplay();
		playSynthSound('pickup');
		spawnFloatingText(parseInt(p.style.left), parseInt(p.style.top), 'NITRO 100%!');
	} else if (p.type === 'powerup-shield') {
		hasShield = true;
		updateShieldDisplay();
		playSynthSound('shield');
		spawnFloatingText(parseInt(p.style.left), parseInt(p.style.top), 'SHIELD ON!');
	} else if (p.type === 'powerup-star') {
		var mult = selectedCar === 'gold' ? 1.25 : 1.0;
		score += Math.round(500 * mult);
		updateScoreDisplay();
		playSynthSound('pickup');
		spawnFloatingText(parseInt(p.style.left), parseInt(p.style.top), '+' + Math.round(500 * mult) + '!');
	} else if (p.type === 'powerup-time') {
		triggerTimeSlow();
		playSynthSound('shield');
		spawnFloatingText(parseInt(p.style.left), parseInt(p.style.top), 'BULLET TIME!');
	}
}

function triggerTimeSlow() {
	isTimeSlowActive = true;
	var overlay = document.getElementById('bulletTimeOverlay');
	if (overlay) overlay.style.display = 'block';

	if (timeSlowTimer) clearTimeout(timeSlowTimer);
	timeSlowTimer = setTimeout(function() {
		isTimeSlowActive = false;
		if (overlay) overlay.style.display = 'none';
	}, 4000);
}

function placeOilSlick(o, isVertical, index, baseSpeed) {
	o.className = 'oil-slick';
	o.style.width = '58px';
	o.style.height = '38px';

	if (isVertical) {
		o.speed = baseSpeed;
		var lanes = [50, 190, 330];
		o.style.left = lanes[Math.floor(Math.random() * lanes.length)] + 'px';
		o.style.top = (-800 - (index * 500)) + 'px';
	} else {
		o.speed = baseSpeed;
		var lanes = [80, 200, 320, 440];
		o.style.top = lanes[Math.floor(Math.random() * lanes.length)] + 'px';
		o.style.left = (1800 + (index * 500)) + 'px';
	}
}

function triggerOilSpinout() {
	if (isSpinningOut || hasShield || (spaceDown && nitro > 0)) return;
	isSpinningOut = true;
	car.style.transition = 'transform 0.8s ease';
	car.style.transform = 'rotate(360deg)';
	spawnSpinoutSmoke(parseInt(car.style.left) + 34, parseInt(car.style.top) + 34);

	setTimeout(function() {
		car.style.transition = 'none';
		car.style.transform = 'rotate(0deg)';
		isSpinningOut = false;
	}, 800);
}

// Single Progressive Stage Launcher (Levels 1 to 99)
function startStage(lvlNum) {
	currentLevel = Math.max(1, Math.min(99, lvlNum));
	localStorage.setItem('rockinracer_currentlevel', String(currentLevel));

	nitro = 100;
	hasShield = (selectedCar === 'cyber');
	isSpinningOut = false;
	isTimeSlowActive = false;

	if (gameTimer) clearInterval(gameTimer);
	if (timeSlowTimer) clearTimeout(timeSlowTimer);
	cones = []; powerups = []; oilSlicks = []; rivalCars = []; finish = [];

	var deathModal = document.getElementById('deathModal');
	var winModal = document.getElementById('winModal');
	var bulletOverlay = document.getElementById('bulletTimeOverlay');
	if (deathModal) deathModal.style.display = 'none';
	if (winModal) winModal.style.display = 'none';
	if (bulletOverlay) bulletOverlay.style.display = 'none';

	document.getElementById('introScreen').style.display = 'none';
	document.getElementById('hudBar').style.display = 'flex';

	var isVertical = (currentLevel % 2 === 0);
	var baseSpeed = 8 + (currentLevel * 0.15);
	var targetDistance = 1600 + (currentLevel * 120);
	var coneCount = Math.min(7, 3 + Math.floor(currentLevel / 10));
	var oilCount = currentLevel >= 3 ? Math.min(3, Math.floor(currentLevel / 8)) : 0;

	startParticleLoop();

	if (isVertical) {
		if (gameScreen) gameScreen.innerHTML = '';
		gameScreen2 = document.getElementById('gameScreen2');
		gameScreen2.innerHTML = '';
		gameScreen2.style.width = GS_WIDTH2 + 'px';
		gameScreen2.style.height = GS_HEIGHT2 + 'px';

		bg1 = document.createElement('IMG'); bg1.className = 'bgObject'; bg1.src = 'streetvert.jpg';
		bg1.style.width = '450px'; bg1.style.height = '1422px'; bg1.style.left = '0px'; bg1.style.top = '0px';
		gameScreen2.appendChild(bg1);

		bg2 = document.createElement('IMG'); bg2.className = 'bgObject'; bg2.src = 'streetvert.jpg';
		bg2.style.width = '450px'; bg2.style.height = '1422px'; bg2.style.left = '0px'; bg2.style.top = '-1422px';
		gameScreen2.appendChild(bg2);

		// Top-Down Player Car (Aspect ratio 44:88)
		car = document.createElement('div');
		car.className = 'playerCar';
		car.style.width = '44px'; car.style.height = '88px'; car.style.top = '480px'; car.style.left = '200px';
		car.innerHTML = getCarSVG('top', selectedCar);
		gameScreen2.appendChild(car);

		shieldAuraEl = null; updateShieldDisplay(); updateScoreDisplay(); updateLevelDisplay(); updateNitroDisplay();

		for (var i = 0; i < coneCount; i++) {
			var cone = document.createElement('div');
			cone.className = 'coneObject'; cone.style.width = '52px'; cone.style.height = '52px';
			cone.innerHTML = getConeSVG('top');
			gameScreen2.appendChild(cone);
			placeConeVertical(cone, i, baseSpeed);
			cones[i] = cone;
		}

		for (var i = 0; i < oilCount; i++) {
			var slick = document.createElement('div'); gameScreen2.appendChild(slick);
			placeOilSlick(slick, true, i, baseSpeed); oilSlicks[i] = slick;
		}

		for (var i = 0; i < 2; i++) {
			var pup = document.createElement('div'); gameScreen2.appendChild(pup);
			placePowerup(pup, true, i, baseSpeed); powerups[i] = pup;
		}

		var finishLine = new Image(); finishLine.className = 'finishObject';
		finishLine.style.width = '450px'; finishLine.style.height = '200px'; finishLine.src = 'finishvert.gif';
		gameScreen2.appendChild(finishLine);
		placeFinishLineVertical(finishLine, -targetDistance, baseSpeed);
		finish[1] = finishLine;

		gameTimer = setInterval(function() { gameloopVerticalProgressive(baseSpeed); }, 50);

	} else {
		if (gameScreen2) gameScreen2.innerHTML = '';
		gameScreen = document.getElementById('gameScreen');
		gameScreen.innerHTML = '';
		gameScreen.style.width = GS_WIDTH + 'px';
		gameScreen.style.height = GS_HEIGHT + 'px';

		bg1 = document.createElement('IMG'); bg1.className = 'bgObject'; bg1.src = 'streetside.png';
		bg1.style.width = '1050px'; bg1.style.height = '600px'; bg1.style.left = '0px'; bg1.style.top = '0px';
		gameScreen.appendChild(bg1);

		bg2 = document.createElement('IMG'); bg2.className = 'bgObject'; bg2.src = 'streetside.png';
		bg2.style.width = '1050px'; bg2.style.height = '600px'; bg2.style.left = '1050px'; bg2.style.top = '0px';
		gameScreen.appendChild(bg2);

		// Side-View Player Car (Aspect ratio 88:44)
		car = document.createElement('div');
		car.className = 'playerCar';
		car.style.width = '88px'; car.style.height = '44px'; car.style.top = '275px'; car.style.left = '68px';
		car.innerHTML = getCarSVG('side', selectedCar);
		gameScreen.appendChild(car);

		shieldAuraEl = null; updateShieldDisplay(); updateScoreDisplay(); updateLevelDisplay(); updateNitroDisplay();

		for (var i = 0; i < coneCount; i++) {
			var cone = document.createElement('div');
			cone.className = 'coneObject'; cone.style.width = '52px'; cone.style.height = '52px';
			cone.innerHTML = getConeSVG('side');
			gameScreen.appendChild(cone);
			placeConeHorizontal(cone, i, baseSpeed);
			cones[i] = cone;
		}

		for (var i = 0; i < oilCount; i++) {
			var slick = document.createElement('div'); gameScreen.appendChild(slick);
			placeOilSlick(slick, false, i, baseSpeed); oilSlicks[i] = slick;
		}

		for (var i = 0; i < 2; i++) {
			var pup = document.createElement('div'); gameScreen.appendChild(pup);
			placePowerup(pup, false, i, baseSpeed); powerups[i] = pup;
		}

		var finishLine = new Image(); finishLine.className = 'finishObject';
		finishLine.style.width = '250px'; finishLine.style.height = '600px'; finishLine.src = 'finish.gif';
		gameScreen.appendChild(finishLine);
		placeFinishLineHorizontal(finishLine, targetDistance, baseSpeed);
		finish[0] = finishLine;

		gameTimer = setInterval(function() { gameloopHorizontalProgressive(baseSpeed); }, 50);
	}
}

// Spawning Placement Functions
function placeFinishLineHorizontal(e, distanceX, baseSpeed) {
	e.speed = baseSpeed; e.style.top = '0px'; e.style.left = distanceX + 'px';
}

function placeFinishLineVertical(e, distanceY, baseSpeed) {
	e.speed = baseSpeed; e.style.left = '0px'; e.style.top = distanceY + 'px';
}

function placeConeHorizontal(c, index, baseSpeed) {
	c.speed = baseSpeed;
	var lanes = [40, 150, 260, 370, 480];
	var laneIndex = (index !== undefined) ? (index % lanes.length) : Math.floor(Math.random() * lanes.length);
	c.style.top = lanes[laneIndex] + 'px';
	c.style.left = ((index !== undefined) ? (1100 + index * 260) : (Math.floor(Math.random() * 400) + 1100)) + 'px';
}

function placeConeVertical(c, index, baseSpeed) {
	c.speed = baseSpeed;
	var lanes = [50, 190, 330];
	var laneIndex = (index !== undefined) ? (index % lanes.length) : Math.floor(Math.random() * lanes.length);
	c.style.left = lanes[laneIndex] + 'px';
	c.style.top = ((index !== undefined) ? (-300 - index * 280) : (Math.floor(Math.random() * 400) - 1000)) + 'px';
}

function explode(obj) {
	playSynthSound('crash');
	var explosion = document.createElement('IMG');
	explosion.src = 'explosion.gif?x=' + Date.now();
	explosion.className = 'gameObject';
	explosion.style.width = obj.style.width; explosion.style.height = obj.style.height;
	explosion.style.left = obj.style.left; explosion.style.top = obj.style.top;
	var parent = (currentLevel % 2 === 0) ? gameScreen2 : gameScreen;
	if (parent) parent.appendChild(explosion);
	spawnExplosionParticles(parseInt(obj.style.left) + 26, parseInt(obj.style.top) + 26);
}

function handleCrash() {
	explode(car);
	car.style.top = '-1000px';
	if (shieldAuraEl) shieldAuraEl.style.display = 'none';
	clearInterval(gameTimer);

	if (score > highScore) {
		highScore = score;
		localStorage.setItem('rockinracer_highscore', String(highScore));
		updateHighScoreDisplay();
	}

	var statsEl = document.getElementById('deathStats');
	if (statsEl) {
		statsEl.innerHTML = 'STAGE: LEVEL ' + currentLevel + '/99<br>SCORE: ' + score + '<br>BEST: ' + highScore;
	}
	var modal = document.getElementById('deathModal');
	if (modal) modal.style.display = 'flex';
}

function handleStageClear() {
	clearInterval(gameTimer);
	playSynthSound('win');
	score += 1000;
	updateScoreDisplay();

	if (score > highScore) {
		highScore = score;
		localStorage.setItem('rockinracer_highscore', String(highScore));
		updateHighScoreDisplay();
	}

	var statsEl = document.getElementById('winStats');
	if (statsEl) {
		statsEl.innerHTML = (currentLevel >= 99 ? '🏆 GRAND CHAMPION! YOU BEAT ALL 99 LEVELS!' : 'LEVEL ' + currentLevel + ' CLEARED!') + '<br>TOTAL SCORE: ' + score;
	}
	var modal = document.getElementById('winModal');
	if (modal) modal.style.display = 'flex';
}

function restartCurrentLevel() {
	startStage(currentLevel);
}

function nextLevel() {
	if (currentLevel < 99) startStage(currentLevel + 1);
	else setupIntro();
}

// GAMELOOPS
function gameloopHorizontalProgressive(baseSpeed) {
	var sndDriving = document.getElementById('sndDriving');
	if (sndDriving) { sndDriving.volume = 0.4; sndDriving.muted = isMuted; sndDriving.play().catch(function(e){}); }

	var curSpeedMult = 1;
	var rechargeRate = selectedCar === 'blue' ? 0.5 : 0.3;
	if (spaceDown && nitro > 0) {
		curSpeedMult = 1.8;
		nitro = Math.max(0, nitro - 2.5);
		updateNitroDisplay();
		spawnNitroParticles(parseInt(car.style.left), parseInt(car.style.top) + 22, 'left');
	} else if (nitro < 100) {
		nitro = Math.min(100, nitro + rechargeRate);
		updateNitroDisplay();
	}

	var timeSlowMult = isTimeSlowActive ? 0.4 : 1.0;
	score += 2;
	updateScoreDisplay();

	var bgSpeed = baseSpeed * curSpeedMult;
	var bg1X = parseInt(bg1.style.left) - bgSpeed; bg1.style.left = bg1X + 'px';
	var bg2X = parseInt(bg2.style.left) - bgSpeed; bg2.style.left = bg2X + 'px';
	if (bg1X < -1 * GS_WIDTH) bg1.style.left = parseInt(bg2.style.left) + GS_WIDTH + 'px';
	if (bg2X < -1 * GS_WIDTH) bg2.style.left = parseInt(bg1.style.left) + GS_WIDTH + 'px';

	if (!isSpinningOut) {
		var step = (baseSpeed * 1.8) * curSpeedMult;
		if (upArrowDown) car.style.top = Math.max(0, parseInt(car.style.top) - step) + 'px';
		if (downArrowDown) car.style.top = Math.min(GS_HEIGHT - 44, parseInt(car.style.top) + step) + 'px';
		if (leftArrowDown) car.style.left = Math.max(0, parseInt(car.style.left) - step) + 'px';
		if (rightArrowDown) car.style.left = Math.min(GS_WIDTH - 88, parseInt(car.style.left) + step) + 'px';
	}

	updateShieldDisplay();

	for (var i = 0; i < powerups.length; i++) {
		var pup = powerups[i];
		var newX = parseInt(pup.style.left) - (pup.speed * curSpeedMult * timeSlowMult);
		if (newX < -50) placePowerup(pup, false, i, baseSpeed);
		else pup.style.left = newX + 'px';

		if (hittest(pup, car)) { handlePowerupPickup(pup); placePowerup(pup, false, i, baseSpeed); }
	}

	for (var i = 0; i < oilSlicks.length; i++) {
		var slick = oilSlicks[i];
		var newX = parseInt(slick.style.left) - (slick.speed * curSpeedMult * timeSlowMult);
		if (newX < -50) placeOilSlick(slick, false, i, baseSpeed);
		else slick.style.left = newX + 'px';

		if (hittest(slick, car)) { triggerOilSpinout(); placeOilSlick(slick, false, i, baseSpeed); }
	}

	for (var i = 0; i < cones.length; i++) {
		var newX = parseInt(cones[i].style.left) - (cones[i].speed * curSpeedMult * timeSlowMult);
		if (newX < -50) placeConeHorizontal(cones[i], i, baseSpeed);
		else cones[i].style.left = newX + 'px';

		if (hittest(cones[i], car)) {
			if (hasShield) { hasShield = false; updateShieldDisplay(); explode(cones[i]); placeConeHorizontal(cones[i], i, baseSpeed); }
			else { explode(cones[i]); placeConeHorizontal(cones[i], i, baseSpeed); handleCrash(); }
		}
	}

	var cf = 0;
	var newX = parseInt(finish[cf].style.left) - (finish[cf].speed * curSpeedMult * timeSlowMult);
	finish[cf].style.left = newX + 'px';

	if (hittest(finish[cf], car)) { placeFinishLineHorizontal(finish[cf], 99999, baseSpeed); handleStageClear(); }
}

function gameloopVerticalProgressive(baseSpeed) {
	var curSpeedMult = 1;
	var rechargeRate = selectedCar === 'blue' ? 0.5 : 0.3;
	if (spaceDown && nitro > 0) {
		curSpeedMult = 1.8;
		nitro = Math.max(0, nitro - 2.5);
		updateNitroDisplay();
		spawnNitroParticles(parseInt(car.style.left) + 22, parseInt(car.style.top) + 88, 'down');
	} else if (nitro < 100) {
		nitro = Math.min(100, nitro + rechargeRate);
		updateNitroDisplay();
	}

	var timeSlowMult = isTimeSlowActive ? 0.4 : 1.0;
	score += 2;
	updateScoreDisplay();

	var bgSpeed = (baseSpeed * 1.5) * curSpeedMult;
	var bgY = parseInt(bg1.style.top) + bgSpeed;
	bg1.style.top = (bgY > GS_HEIGHT ? -1 * parseInt(bg1.style.height) : bgY) + 'px';
	bgY = parseInt(bg2.style.top) + bgSpeed;
	bg2.style.top = (bgY > GS_HEIGHT ? -1 * parseInt(bg2.style.height) : bgY) + 'px';

	if (!isSpinningOut) {
		var step = (baseSpeed * 1.8) * curSpeedMult;
		if (leftArrowDown) car.style.left = Math.max(0, parseInt(car.style.left) - step) + 'px';
		if (rightArrowDown) car.style.left = Math.min(GS_WIDTH2 - 44, parseInt(car.style.left) + step) + 'px';
	}

	updateShieldDisplay();

	for (var i = 0; i < powerups.length; i++) {
		var pup = powerups[i];
		var newY = parseInt(pup.style.top) + (pup.speed * curSpeedMult * timeSlowMult);
		if (newY > GS_HEIGHT + 50) placePowerup(pup, true, i, baseSpeed);
		else pup.style.top = newY + 'px';

		if (hittest(pup, car)) { handlePowerupPickup(pup); placePowerup(pup, true, i, baseSpeed); }
	}

	for (var i = 0; i < oilSlicks.length; i++) {
		var slick = oilSlicks[i];
		var newY = parseInt(slick.style.top) + (slick.speed * curSpeedMult * timeSlowMult);
		if (newY > GS_HEIGHT + 50) placeOilSlick(slick, true, i, baseSpeed);
		else slick.style.top = newY + 'px';

		if (hittest(slick, car)) { triggerOilSpinout(); placeOilSlick(slick, true, i, baseSpeed); }
	}

	for (var i = 0; i < cones.length; i++) {
		var newY = parseInt(cones[i].style.top) + (cones[i].speed * curSpeedMult * timeSlowMult);
		if (newY > GS_HEIGHT + 50) placeConeVertical(cones[i], i, baseSpeed);
		else cones[i].style.top = newY + 'px';

		if (hittest(cones[i], car)) {
			if (hasShield) { hasShield = false; updateShieldDisplay(); explode(cones[i]); placeConeVertical(cones[i], i, baseSpeed); }
			else { explode(cones[i]); placeConeVertical(cones[i], i, baseSpeed); handleCrash(); }
		}
	}

	var cf = 1;
	var newY = parseInt(finish[cf].style.top) + (finish[cf].speed * curSpeedMult * timeSlowMult);
	finish[cf].style.top = newY + 'px';

	if (hittest(finish[cf], car)) { placeFinishLineVertical(finish[cf], -99999, baseSpeed); handleStageClear(); }
}

// Axis-Aligned Bounding Box Collision
function hittest(a, b) {
	if (!a || !b) return false;
	var aLeft = parseInt(a.style.left); var aTop = parseInt(a.style.top);
	var aW = parseInt(a.style.width); var aH = parseInt(a.style.height);

	var bLeft = parseInt(b.style.left); var bTop = parseInt(b.style.top);
	var bW = parseInt(b.style.width); var bH = parseInt(b.style.height);

	var pad = 6;
	return (
		aLeft + pad < bLeft + bW - pad &&
		aLeft + aW - pad > bLeft + pad &&
		aTop + pad < bTop + bH - pad &&
		aTop + aH - pad > bTop + pad
	);
}

// Key Controls
document.addEventListener('keydown', function(event) {
	if (event.code === 'ArrowLeft' || event.code === 'KeyA') leftArrowDown = true;
	if (event.code === 'ArrowRight' || event.code === 'KeyD') rightArrowDown = true;
	if (event.code === 'ArrowUp' || event.code === 'KeyW') upArrowDown = true;
	if (event.code === 'ArrowDown' || event.code === 'KeyS') downArrowDown = true;
	if (event.code === 'Space') spaceDown = true;
});

document.addEventListener('keyup', function(event) {
	if (event.code === 'ArrowLeft' || event.code === 'KeyA') leftArrowDown = false;
	if (event.code === 'ArrowRight' || event.code === 'KeyD') rightArrowDown = false;
	if (event.code === 'ArrowUp' || event.code === 'KeyW') upArrowDown = false;
	if (event.code === 'ArrowDown' || event.code === 'KeyS') downArrowDown = false;
	if (event.code === 'Space') spaceDown = false;
});
