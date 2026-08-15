// ROCKIN RACER - 99-Level Campaign & Vector Engine
var gameScreen;
var gameScreen2;
var gameTimer = null;
var particleTimer = null;
var timeSlowTimer = null;
var isTimeSlowActive = false;
var isPaused = false;
var isGameActive = false;
var car;
var bg1, bg2;

var cones = [];
var powerups = [];
var oilSlicks = [];
var rivalCars = [];
var finish = [];
var particles = [];

// Game Stats & State
var currentLevel = 1;
var score = 0;
var highScore = parseInt(localStorage.getItem('rockinracer_highscore') || '0');
var selectedCar = localStorage.getItem('rockinracer_selectedcar') || 'red';
var nitro = 100;
var hasShield = false;
var isSpinningOut = false;
var isMuted = false;
var shieldAuraEl = null;

// Track Progress Tracking
var stageTotalDistance = 2800;
var stageRemainingDistance = 2800;
var isFinalStretch = false;

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
	red:   { primary: '#ff0055', secondary: '#ffea00', perk: 'BALANCED ACCEL' },
	blue:  { primary: '#00e5ff', secondary: '#0055ff', perk: '+50% NITRO RECHARGE' },
	gold:  { primary: '#ffea00', secondary: '#ffffff', perk: '+25% SCORE MULTIPLIER' },
	cyber: { primary: '#00ff66', secondary: '#00e5ff', perk: 'FREE SHIELD EVERY STAGE' }
};

// Rival Car Color Variants
const RIVAL_VARIANTS = [
	{ primary: '#a855f7', secondary: '#00e5ff', name: 'Cyber Viper' },
	{ primary: '#ff7700', secondary: '#ffff00', name: 'Solar Fury' },
	{ primary: '#e11d48', secondary: '#ffffff', name: 'Speed Demon' }
];

// Web Audio API Synthesizer (Realistic Multi-Layer Audio Engine)
var audioCtx = null;
var isNitroAudioActive = false;

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
		if (type === 'nitro_start' || type === 'nitro') {
			if (isNitroAudioActive) return;
			isNitroAudioActive = true;

			// Layer 1: Twin-Turbo Spool Whistle (1200Hz -> 3800Hz)
			var spoolOsc = ctx.createOscillator();
			var spoolGain = ctx.createGain();
			var spoolFilter = ctx.createBiquadFilter();
			spoolFilter.type = 'bandpass';
			spoolFilter.frequency.setValueAtTime(1400, now);
			spoolFilter.frequency.exponentialRampToValueAtTime(3800, now + 0.28);
			spoolFilter.Q.setValueAtTime(8, now);

			spoolOsc.type = 'sine';
			spoolOsc.frequency.setValueAtTime(1200, now);
			spoolOsc.frequency.exponentialRampToValueAtTime(3600, now + 0.28);

			spoolGain.gain.setValueAtTime(0.35, now);
			spoolGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

			spoolOsc.connect(spoolFilter);
			spoolFilter.connect(spoolGain);
			spoolGain.connect(ctx.destination);
			spoolOsc.start(now);
			spoolOsc.stop(now + 0.35);

			// Layer 2: Nitrous Pressurized Gas Hiss (High-pass noise)
			var bufferSize = Math.floor(ctx.sampleRate * 0.4);
			var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			var data = buffer.getChannelData(0);
			for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

			var hissNode = ctx.createBufferSource();
			hissNode.buffer = buffer;
			var hissFilter = ctx.createBiquadFilter();
			hissFilter.type = 'highpass';
			hissFilter.frequency.setValueAtTime(2600, now);

			var hissGain = ctx.createGain();
			hissGain.gain.setValueAtTime(0.35, now);
			hissGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

			hissNode.connect(hissFilter);
			hissFilter.connect(hissGain);
			hissGain.connect(ctx.destination);
			hissNode.start(now);

			// Layer 3: Combustion Jet Rumble (Low-frequency growl)
			var rumbleOsc = ctx.createOscillator();
			var rumbleGain = ctx.createGain();
			var rumbleFilter = ctx.createBiquadFilter();
			rumbleFilter.type = 'lowpass';
			rumbleFilter.frequency.setValueAtTime(220, now);

			rumbleOsc.type = 'sawtooth';
			rumbleOsc.frequency.setValueAtTime(75, now);
			rumbleOsc.frequency.linearRampToValueAtTime(140, now + 0.3);

			rumbleGain.gain.setValueAtTime(0.4, now);
			rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

			rumbleOsc.connect(rumbleFilter);
			rumbleFilter.connect(rumbleGain);
			rumbleGain.connect(ctx.destination);
			rumbleOsc.start(now);
			rumbleOsc.stop(now + 0.5);

		} else if (type === 'nitro_stop') {
			if (!isNitroAudioActive) return;
			isNitroAudioActive = false;

			// Blow-off Valve Pssshht
			var bufferSize = Math.floor(ctx.sampleRate * 0.25);
			var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			var data = buffer.getChannelData(0);
			for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

			var bovNode = ctx.createBufferSource();
			bovNode.buffer = buffer;
			var bovFilter = ctx.createBiquadFilter();
			bovFilter.type = 'bandpass';
			bovFilter.frequency.setValueAtTime(3200, now);
			bovFilter.frequency.exponentialRampToValueAtTime(1600, now + 0.22);
			bovFilter.Q.setValueAtTime(4, now);

			var bovGain = ctx.createGain();
			bovGain.gain.setValueAtTime(0.35, now);
			bovGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

			bovNode.connect(bovFilter);
			bovFilter.connect(bovGain);
			bovGain.connect(ctx.destination);
			bovNode.start(now);

		} else if (type === 'smash') {
			// Layer 1: Kinetic Body Slam Punch (Fast pitch drop 340Hz -> 75Hz)
			var bodyOsc = ctx.createOscillator();
			var bodyGain = ctx.createGain();
			bodyOsc.type = 'sine';
			bodyOsc.frequency.setValueAtTime(340, now);
			bodyOsc.frequency.exponentialRampToValueAtTime(75, now + 0.15);
			bodyGain.gain.setValueAtTime(0.6, now);
			bodyGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
			bodyOsc.connect(bodyGain);
			bodyGain.connect(ctx.destination);
			bodyOsc.start(now);
			bodyOsc.stop(now + 0.18);

			// Layer 2: High-Speed Tire Screech Squeal (Bandpass sweep)
			var screechOsc = ctx.createOscillator();
			var screechGain = ctx.createGain();
			var screechFilter = ctx.createBiquadFilter();
			screechFilter.type = 'bandpass';
			screechFilter.frequency.setValueAtTime(1100, now);
			screechFilter.frequency.exponentialRampToValueAtTime(600, now + 0.22);
			screechFilter.Q.setValueAtTime(6, now);

			screechOsc.type = 'sawtooth';
			screechOsc.frequency.setValueAtTime(950, now);
			screechOsc.frequency.linearRampToValueAtTime(1350, now + 0.08);
			screechOsc.frequency.exponentialRampToValueAtTime(500, now + 0.22);

			screechGain.gain.setValueAtTime(0.35, now);
			screechGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

			screechOsc.connect(screechFilter);
			screechFilter.connect(screechGain);
			screechGain.connect(ctx.destination);
			screechOsc.start(now);
			screechOsc.stop(now + 0.22);

			// Layer 3: Metallic Crunch Hit
			var bufferSize = Math.floor(ctx.sampleRate * 0.2);
			var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			var data = buffer.getChannelData(0);
			for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

			var hitNode = ctx.createBufferSource();
			hitNode.buffer = buffer;
			var hitFilter = ctx.createBiquadFilter();
			hitFilter.type = 'bandpass';
			hitFilter.frequency.setValueAtTime(1400, now);
			hitFilter.Q.setValueAtTime(4, now);

			var hitGain = ctx.createGain();
			hitGain.gain.setValueAtTime(0.5, now);
			hitGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

			hitNode.connect(hitFilter);
			hitFilter.connect(hitGain);
			hitGain.connect(ctx.destination);
			hitNode.start(now);

		} else if (type === 'crash') {
			// Layer 1: Sub-bass explosion shockwave (140Hz -> 28Hz)
			var subOsc = ctx.createOscillator();
			var subGain = ctx.createGain();
			subOsc.type = 'sine';
			subOsc.frequency.setValueAtTime(140, now);
			subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.45);
			subGain.gain.setValueAtTime(0.65, now);
			subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
			subOsc.connect(subGain);
			subGain.connect(ctx.destination);
			subOsc.start(now);
			subOsc.stop(now + 0.45);

			// Layer 2: Metal Crunch & Deformation (Noise through resonant bandpass)
			var bufferSize = Math.floor(ctx.sampleRate * 0.5);
			var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			var data = buffer.getChannelData(0);
			for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

			var crunchNode = ctx.createBufferSource();
			crunchNode.buffer = buffer;
			var crunchFilter = ctx.createBiquadFilter();
			crunchFilter.type = 'bandpass';
			crunchFilter.frequency.setValueAtTime(450, now);
			crunchFilter.frequency.exponentialRampToValueAtTime(180, now + 0.4);
			crunchFilter.Q.setValueAtTime(3, now);

			var crunchGain = ctx.createGain();
			crunchGain.gain.setValueAtTime(0.7, now);
			crunchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

			crunchNode.connect(crunchFilter);
			crunchFilter.connect(crunchGain);
			crunchGain.connect(ctx.destination);
			crunchNode.start(now);

			// Layer 3: Glass Shatter & Debris (High-frequency noise burst)
			var glassNode = ctx.createBufferSource();
			glassNode.buffer = buffer;
			var glassFilter = ctx.createBiquadFilter();
			glassFilter.type = 'highpass';
			glassFilter.frequency.setValueAtTime(4200, now);

			var glassGain = ctx.createGain();
			glassGain.gain.setValueAtTime(0.45, now);
			glassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

			glassNode.connect(glassFilter);
			glassFilter.connect(glassGain);
			glassGain.connect(ctx.destination);
			glassNode.start(now);

			// Layer 4: Twisted Metal Discord (Beating sawtooth frequencies)
			[180, 195, 230].forEach((f, idx) => {
				var osc = ctx.createOscillator();
				var g = ctx.createGain();
				osc.type = 'sawtooth';
				osc.frequency.setValueAtTime(f, now);
				osc.frequency.exponentialRampToValueAtTime(f * 0.4, now + 0.3);
				g.gain.setValueAtTime(0.25, now);
				g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
				osc.connect(g);
				g.connect(ctx.destination);
				osc.start(now);
				osc.stop(now + 0.3);
			});

		} else if (type === 'win') {
			// Layer 1: High-Speed Doppler Engine Flyby Whoosh
			var bufferSize = Math.floor(ctx.sampleRate * 0.85);
			var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			var data = buffer.getChannelData(0);
			for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

			var whooshNode = ctx.createBufferSource();
			whooshNode.buffer = buffer;
			var whooshFilter = ctx.createBiquadFilter();
			whooshFilter.type = 'bandpass';
			whooshFilter.frequency.setValueAtTime(1200, now);
			whooshFilter.frequency.exponentialRampToValueAtTime(320, now + 0.7);
			whooshFilter.Q.setValueAtTime(3, now);

			var whooshGain = ctx.createGain();
			whooshGain.gain.setValueAtTime(0.05, now);
			whooshGain.gain.linearRampToValueAtTime(0.55, now + 0.25);
			whooshGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

			whooshNode.connect(whooshFilter);
			whooshFilter.connect(whooshGain);
			whooshGain.connect(ctx.destination);
			whooshNode.start(now);

			// Doppler Tone (Engine whine passing by)
			var dopOsc = ctx.createOscillator();
			var dopGain = ctx.createGain();
			dopOsc.type = 'sawtooth';
			dopOsc.frequency.setValueAtTime(720, now);
			dopOsc.frequency.exponentialRampToValueAtTime(240, now + 0.7);
			dopGain.gain.setValueAtTime(0.05, now);
			dopGain.gain.linearRampToValueAtTime(0.35, now + 0.22);
			dopGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
			dopOsc.connect(dopGain);
			dopGain.connect(ctx.destination);
			dopOsc.start(now);
			dopOsc.stop(now + 0.7);

			// Layer 2: Authentic Trackside Checkered Air-Horn Blast (F#4, A#4, C#5)
			[370, 466, 554].forEach(f => {
				var horn = ctx.createOscillator();
				var hornGain = ctx.createGain();
				horn.type = 'sawtooth';
				horn.frequency.setValueAtTime(f, now + 0.2);
				hornGain.gain.setValueAtTime(0.01, now + 0.2);
				hornGain.gain.linearRampToValueAtTime(0.28, now + 0.28);
				hornGain.gain.setValueAtTime(0.25, now + 0.75);
				hornGain.gain.exponentialRampToValueAtTime(0.01, now + 1.05);
				horn.connect(hornGain);
				hornGain.connect(ctx.destination);
				horn.start(now + 0.2);
				horn.stop(now + 1.05);
			});

			// Layer 3: Triumphant Major Brass Victory Fanfare (C5, E5, G5, C6)
			var notes = [
				{ f: 523.25, t: 0.15, d: 0.25 },
				{ f: 659.25, t: 0.35, d: 0.25 },
				{ f: 783.99, t: 0.55, d: 0.3 },
				{ f: 1046.50, t: 0.80, d: 0.65 }
			];
			notes.forEach(n => {
				var osc = ctx.createOscillator();
				var g = ctx.createGain();
				osc.type = 'triangle';
				osc.frequency.setValueAtTime(n.f, now + n.t);
				g.gain.setValueAtTime(0.01, now + n.t);
				g.gain.linearRampToValueAtTime(0.35, now + n.t + 0.04);
				g.gain.exponentialRampToValueAtTime(0.01, now + n.t + n.d);
				osc.connect(g);
				g.connect(ctx.destination);
				osc.start(now + n.t);
				osc.stop(now + n.t + n.d);
			});

		} else if (type === 'pickup') {
			var osc = ctx.createOscillator();
			var gain = ctx.createGain();
			osc.type = 'triangle';
			osc.frequency.setValueAtTime(587, now);
			osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
			gain.gain.setValueAtTime(0.3, now);
			gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
			osc.connect(gain); gain.connect(ctx.destination);
			osc.start(now); osc.stop(now + 0.12);

		} else if (type === 'shield') {
			var osc = ctx.createOscillator();
			var gain = ctx.createGain();
			osc.type = 'sine';
			osc.frequency.setValueAtTime(523, now);
			osc.frequency.exponentialRampToValueAtTime(1046, now + 0.22);
			gain.gain.setValueAtTime(0.35, now);
			gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
			osc.connect(gain); gain.connect(ctx.destination);
			osc.start(now); osc.stop(now + 0.22);

		} else if (type === 'victory_chime') {
			// Rapid triumphant arpeggio chime (C5, E5, G5, B5, C6)
			var chimeNotes = [
				{ f: 523.25, t: 0.00, d: 0.18 },
				{ f: 659.25, t: 0.07, d: 0.18 },
				{ f: 783.99, t: 0.14, d: 0.18 },
				{ f: 987.77, t: 0.21, d: 0.22 },
				{ f: 1046.50, t: 0.28, d: 0.55 }
			];
			chimeNotes.forEach(n => {
				var osc = ctx.createOscillator();
				var g = ctx.createGain();
				osc.type = 'triangle';
				osc.frequency.setValueAtTime(n.f, now + n.t);
				g.gain.setValueAtTime(0.01, now + n.t);
				g.gain.linearRampToValueAtTime(0.35, now + n.t + 0.03);
				g.gain.exponentialRampToValueAtTime(0.01, now + n.t + n.d);
				osc.connect(g);
				g.connect(ctx.destination);
				osc.start(now + n.t);
				osc.stop(now + n.t + n.d);
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
				<circle cx="28" cy="46" r="10" fill="#111" stroke="#444" stroke-width="2"/>
				<circle cx="28" cy="46" r="4" fill="${c.secondary}"/>
				<circle cx="92" cy="46" r="10" fill="#111" stroke="#444" stroke-width="2"/>
				<circle cx="92" cy="46" r="4" fill="${c.secondary}"/>
				<path d="M 8,42 Q 15,24 35,22 L 65,14 Q 85,14 105,30 L 115,38 Q 118,44 110,46 L 10,46 Z" fill="${c.primary}"/>
				<path d="M 40,22 L 62,16 L 80,24 Q 70,22 40,22 Z" fill="#111827" stroke="${c.secondary}" stroke-width="1.5"/>
				<path d="M 10,36 L 112,36" stroke="${c.secondary}" stroke-width="3" stroke-dasharray="8,4"/>
				<path d="M 6,24 L 18,24 L 14,30 L 8,30 Z" fill="#111"/>
				<ellipse cx="112" cy="38" rx="3" ry="2" fill="#ffff00"/>
			</g>
		</svg>`;
	} else {
		return `<svg viewBox="0 0 60 120" width="44" height="88" class="vector-car">
			<g>
				<rect x="10" y="10" width="40" height="100" rx="12" fill="${c.primary}"/>
				<rect x="26" y="10" width="8" height="100" fill="${c.secondary}"/>
				<rect x="14" y="32" width="32" height="24" rx="4" fill="#111827" stroke="${c.secondary}" stroke-width="1.5"/>
				<rect x="16" y="76" width="28" height="16" rx="3" fill="#111827"/>
				<rect x="4" y="20" width="6" height="18" rx="2" fill="#222"/>
				<rect x="50" y="20" width="6" height="18" rx="2" fill="#222"/>
				<rect x="4" y="82" width="6" height="18" rx="2" fill="#222"/>
				<rect x="50" y="82" width="6" height="18" rx="2" fill="#222"/>
				<circle cx="16" cy="14" r="3" fill="#ffff00"/>
				<circle cx="44" cy="14" r="3" fill="#ffff00"/>
			</g>
		</svg>`;
	}
}

function getRivalCarSVG(dir, variantIdx) {
	var v = RIVAL_VARIANTS[variantIdx % RIVAL_VARIANTS.length];
	if (dir === 'side') {
		return `<svg viewBox="0 0 120 60" width="88" height="44" class="vector-car">
			<g>
				<circle cx="28" cy="46" r="10" fill="#0d0d12" stroke="#666" stroke-width="2"/>
				<circle cx="28" cy="46" r="4" fill="${v.secondary}"/>
				<circle cx="92" cy="46" r="10" fill="#0d0d12" stroke="#666" stroke-width="2"/>
				<circle cx="92" cy="46" r="4" fill="${v.secondary}"/>
				<path d="M 8,44 Q 20,26 40,24 L 70,18 Q 90,18 108,32 L 116,40 Q 118,46 110,46 L 10,46 Z" fill="${v.primary}"/>
				<path d="M 45,24 L 68,19 L 84,26 Q 74,24 45,24 Z" fill="#050811" stroke="${v.secondary}" stroke-width="1.5"/>
				<path d="M 12,38 L 110,38" stroke="${v.secondary}" stroke-width="2.5"/>
				<ellipse cx="112" cy="40" rx="3" ry="2" fill="#ff0055"/>
			</g>
		</svg>`;
	} else {
		return `<svg viewBox="0 0 60 120" width="44" height="88" class="vector-car">
			<g>
				<rect x="10" y="10" width="40" height="100" rx="10" fill="${v.primary}"/>
				<rect x="25" y="10" width="10" height="100" fill="${v.secondary}"/>
				<rect x="14" y="32" width="32" height="24" rx="4" fill="#050811" stroke="${v.secondary}" stroke-width="1.5"/>
				<rect x="16" y="76" width="28" height="16" rx="3" fill="#050811"/>
				<rect x="4" y="20" width="6" height="18" rx="2" fill="#111"/>
				<rect x="50" y="20" width="6" height="18" rx="2" fill="#111"/>
				<rect x="4" y="82" width="6" height="18" rx="2" fill="#111"/>
				<rect x="50" y="82" width="6" height="18" rx="2" fill="#111"/>
				<circle cx="16" cy="14" r="3" fill="#ff0055"/>
				<circle cx="44" cy="14" r="3" fill="#ff0055"/>
			</g>
		</svg>`;
	}
}

function getConeSVG(dir) {
	if (dir === 'side') {
		return `<svg viewBox="0 0 60 60" width="52" height="52" class="vector-cone">
			<g>
				<rect x="6" y="50" width="48" height="8" rx="2" fill="#d97706"/>
				<path d="M 12,50 L 26,10 Q 30,4 34,10 L 48,50 Z" fill="#ff5500"/>
				<path d="M 20,32 L 27,15 L 33,15 L 40,32 Z" fill="#ffffff" opacity="0.9"/>
			</g>
		</svg>`;
	} else {
		return `<svg viewBox="0 0 60 60" width="52" height="52" class="vector-cone">
			<g>
				<rect x="8" y="8" width="44" height="44" rx="4" fill="#d97706"/>
				<circle cx="30" cy="30" r="18" fill="#ff5500"/>
				<circle cx="30" cy="30" r="12" fill="#ffffff" opacity="0.9"/>
				<circle cx="30" cy="30" r="6" fill="#ff5500"/>
			</g>
		</svg>`;
	}
}

// 6-Biome Dynamic Level Progression & Procedural Road Engine
const BIOMES = [
	{
		id: 'cyber_metropolis',
		name: 'CYBER METROPOLIS',
		subtitle: '⚡ NEON GRID EXPRESSWAY',
		roadColor: '#0e121a',
		curbTop: '#00e5ff',
		curbBottom: '#ff0055',
		laneDash: '#ffffff',
		centerLine: '#ffea00',
		shoulderColor: '#07090f',
		tileColor: '#131a26',
		glowIntensity: 1.0,
		skyColor: '#06070c'
	},
	{
		id: 'outrun_sunset',
		name: 'OUTRUN SUNSET',
		subtitle: '🌅 GOLDEN HOUR SPEEDWAY',
		roadColor: '#170e24',
		curbTop: '#ff7700',
		curbBottom: '#ff007f',
		laneDash: '#ffea77',
		centerLine: '#ff0055',
		shoulderColor: '#0d0714',
		tileColor: '#241233',
		glowIntensity: 1.1,
		skyColor: '#15051e'
	},
	{
		id: 'tokyo_midnight',
		name: 'TOKYO DRIFT MIDNIGHT',
		subtitle: '🌃 SHUTO HIGH-SPEED BELTWAY',
		roadColor: '#0d1317',
		curbTop: '#00ffaa',
		curbBottom: '#8b5cf6',
		laneDash: '#e0f2fe',
		centerLine: '#00ffaa',
		shoulderColor: '#06090c',
		tileColor: '#101d24',
		glowIntensity: 1.0,
		skyColor: '#040d12'
	},
	{
		id: 'solar_flare',
		name: 'SOLAR FLARE DESERT',
		subtitle: '🔥 SCORCHING CANYON RUNWAY',
		roadColor: '#1c120c',
		curbTop: '#ff3300',
		curbBottom: '#ffaa00',
		laneDash: '#fff7ed',
		centerLine: '#ff3300',
		shoulderColor: '#120a06',
		tileColor: '#29170e',
		glowIntensity: 1.2,
		skyColor: '#170802'
	},
	{
		id: 'neo_matrix',
		name: 'NEO MATRIX GRID',
		subtitle: '⚡ CYBER DRIVE SECTOR',
		roadColor: '#061009',
		curbTop: '#00ff66',
		curbBottom: '#00e5ff',
		laneDash: '#86efac',
		centerLine: '#00ff66',
		shoulderColor: '#030905',
		tileColor: '#0c2113',
		glowIntensity: 1.0,
		skyColor: '#020d05'
	},
	{
		id: 'cosmic_hyperway',
		name: 'COSMIC HYPERWAY',
		subtitle: '🌌 GRAND CHAMPION ORBITWAY',
		roadColor: '#090921',
		curbTop: '#e879f9',
		curbBottom: '#38bdf8',
		laneDash: '#fdf4ff',
		centerLine: '#f43f5e',
		shoulderColor: '#040411',
		tileColor: '#171738',
		glowIntensity: 1.2,
		skyColor: '#050518'
	}
];

var ROAD_TEXTURE_CACHE = {};

function getBiomeForLevel(lvl) {
	var index = Math.floor((lvl - 1) / 5) % BIOMES.length;
	return BIOMES[index];
}

function hexToRgba(hex, alpha) {
	var c = hex.replace('#', '');
	if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
	var num = parseInt(c, 16);
	var r = (num >> 16) & 255;
	var g = (num >> 8) & 255;
	var b = num & 255;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getRoadDataURL(dir, biome) {
	var b = biome || BIOMES[0];
	var key = dir + '_' + b.id;
	if (ROAD_TEXTURE_CACHE[key]) return ROAD_TEXTURE_CACHE[key];

	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');

	if (dir === 'side') {
		canvas.width = 1050;
		canvas.height = 600;

		// 1. Shoulder/Sidewalk Background
		ctx.fillStyle = b.shoulderColor;
		ctx.fillRect(0, 0, 1050, 600);

		// Top & bottom sidewalk paving grid pattern
		ctx.strokeStyle = b.tileColor;
		ctx.lineWidth = 1;
		for (var x = 0; x < 1050; x += 35) {
			ctx.beginPath();
			ctx.moveTo(x, 0); ctx.lineTo(x, 60);
			ctx.moveTo(x, 540); ctx.lineTo(x, 600);
			ctx.stroke();
		}
		for (var y = 0; y <= 60; y += 20) {
			ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1050, y); ctx.stroke();
		}
		for (var y = 540; y <= 600; y += 20) {
			ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1050, y); ctx.stroke();
		}

		// 2. Road Asphalt Surface
		ctx.fillStyle = b.roadColor;
		ctx.fillRect(0, 60, 1050, 480);

		// Aggregate speckle grain
		ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
		for (var i = 0; i < 600; i++) {
			var gx = (i * 37) % 1050;
			var gy = 60 + ((i * 59) % 480);
			ctx.fillRect(gx, gy, 2, 1);
		}

		// Tire Wear Streaks down 4 lanes (lanes mid: 120, 240, 360, 480)
		[120, 240, 360, 480].forEach(midY => {
			var grad = ctx.createLinearGradient(0, midY - 30, 0, midY + 30);
			grad.addColorStop(0, 'rgba(0,0,0,0)');
			grad.addColorStop(0.5, 'rgba(0,0,0,0.22)');
			grad.addColorStop(1, 'rgba(0,0,0,0)');
			ctx.fillStyle = grad;
			ctx.fillRect(0, midY - 30, 1050, 60);
		});

		// 3. Ambient Curb Glow
		var topGlow = ctx.createLinearGradient(0, 60, 0, 115);
		topGlow.addColorStop(0, hexToRgba(b.curbTop, 0.38));
		topGlow.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = topGlow;
		ctx.fillRect(0, 60, 1050, 55);

		var btmGlow = ctx.createLinearGradient(0, 540, 0, 485);
		btmGlow.addColorStop(0, hexToRgba(b.curbBottom, 0.38));
		btmGlow.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = btmGlow;
		ctx.fillRect(0, 485, 1050, 55);

		// 4. Solid Neon Curb Stripes & Light Studs
		ctx.strokeStyle = b.curbTop;
		ctx.lineWidth = 4;
		ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(1050, 60); ctx.stroke();

		ctx.strokeStyle = b.curbBottom;
		ctx.lineWidth = 4;
		ctx.beginPath(); ctx.moveTo(0, 540); ctx.lineTo(1050, 540); ctx.stroke();

		// Curb LED beacons every 105px (exact divisor)
		for (var x = 0; x < 1050; x += 105) {
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(x + 50, 58, 8, 4);
			ctx.fillRect(x + 50, 538, 8, 4);
		}

		// 5. Dashed Lane Lines (105px cycle = dash 60px + gap 45px -> 10 seamless cycles in 1050)
		ctx.strokeStyle = b.laneDash;
		ctx.lineWidth = 2.5;
		ctx.setLineDash([60, 45]);
		ctx.beginPath(); ctx.moveTo(0, 180); ctx.lineTo(1050, 180); ctx.stroke();
		ctx.beginPath(); ctx.moveTo(0, 420); ctx.lineTo(1050, 420); ctx.stroke();

		// 6. Center Double Line & Reflector Studs (y=300)
		ctx.strokeStyle = b.centerLine;
		ctx.lineWidth = 2;
		ctx.setLineDash([60, 45]);
		ctx.beginPath(); ctx.moveTo(0, 297); ctx.lineTo(1050, 297); ctx.stroke();
		ctx.beginPath(); ctx.moveTo(0, 303); ctx.lineTo(1050, 303); ctx.stroke();

		ctx.setLineDash([]);
		for (var x = 0; x < 1050; x += 105) {
			ctx.fillStyle = b.centerLine;
			ctx.beginPath(); ctx.arc(x + 50, 300, 3.5, 0, Math.PI * 2); ctx.fill();
			ctx.fillStyle = '#ffffff';
			ctx.beginPath(); ctx.arc(x + 50, 300, 1.5, 0, Math.PI * 2); ctx.fill();
		}

	} else {
		// Top-Down Vertical Road (450 x 600)
		canvas.width = 450;
		canvas.height = 600;

		// 1. Sidewalk Shoulders
		ctx.fillStyle = b.shoulderColor;
		ctx.fillRect(0, 0, 450, 600);

		ctx.strokeStyle = b.tileColor;
		ctx.lineWidth = 1;
		for (var y = 0; y < 600; y += 30) {
			ctx.beginPath();
			ctx.moveTo(0, y); ctx.lineTo(45, y);
			ctx.moveTo(405, y); ctx.lineTo(450, y);
			ctx.stroke();
		}
		for (var x = 0; x <= 45; x += 15) {
			ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke();
		}
		for (var x = 405; x <= 450; x += 15) {
			ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke();
		}

		// 2. Road Surface
		ctx.fillStyle = b.roadColor;
		ctx.fillRect(45, 0, 360, 600);

		// Speckle grain
		ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
		for (var i = 0; i < 400; i++) {
			var gx = 45 + ((i * 37) % 360);
			var gy = (i * 59) % 600;
			ctx.fillRect(gx, gy, 1, 2);
		}

		// Tire Wear Streaks down 3 lanes (lanes mid: 105, 225, 345)
		[105, 225, 345].forEach(midX => {
			var grad = ctx.createLinearGradient(midX - 25, 0, midX + 25, 0);
			grad.addColorStop(0, 'rgba(0,0,0,0)');
			grad.addColorStop(0.5, 'rgba(0,0,0,0.22)');
			grad.addColorStop(1, 'rgba(0,0,0,0)');
			ctx.fillStyle = grad;
			ctx.fillRect(midX - 25, 0, 50, 600);
		});

		// 3. Ambient Curb Glow
		var leftGlow = ctx.createLinearGradient(45, 0, 100, 0);
		leftGlow.addColorStop(0, hexToRgba(b.curbTop, 0.38));
		leftGlow.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = leftGlow;
		ctx.fillRect(45, 0, 55, 600);

		var rightGlow = ctx.createLinearGradient(405, 0, 350, 0);
		rightGlow.addColorStop(0, hexToRgba(b.curbBottom, 0.38));
		rightGlow.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = rightGlow;
		ctx.fillRect(350, 0, 55, 600);

		// 4. Solid Neon Curbs & Light Studs
		ctx.strokeStyle = b.curbTop;
		ctx.lineWidth = 4;
		ctx.beginPath(); ctx.moveTo(45, 0); ctx.lineTo(45, 600); ctx.stroke();

		ctx.strokeStyle = b.curbBottom;
		ctx.lineWidth = 4;
		ctx.beginPath(); ctx.moveTo(405, 0); ctx.lineTo(405, 600); ctx.stroke();

		for (var y = 0; y < 600; y += 100) {
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(43, y + 45, 4, 10);
			ctx.fillRect(403, y + 45, 4, 10);
		}

		// 5. Vertical Dashed Lane Dividers (100px cycle = dash 60px + gap 40px -> 6 seamless cycles in 600)
		ctx.strokeStyle = b.laneDash;
		ctx.lineWidth = 2.5;
		ctx.setLineDash([60, 40]);
		ctx.beginPath(); ctx.moveTo(165, 0); ctx.lineTo(165, 600); ctx.stroke();
		ctx.beginPath(); ctx.moveTo(285, 0); ctx.lineTo(285, 600); ctx.stroke();

		ctx.setLineDash([]);
		for (var y = 0; y < 600; y += 100) {
			ctx.fillStyle = b.centerLine;
			ctx.beginPath(); ctx.arc(165, y + 50, 3.5, 0, Math.PI * 2); ctx.fill();
			ctx.beginPath(); ctx.arc(285, y + 50, 3.5, 0, Math.PI * 2); ctx.fill();
			ctx.fillStyle = '#ffffff';
			ctx.beginPath(); ctx.arc(165, y + 50, 1.5, 0, Math.PI * 2); ctx.fill();
			ctx.beginPath(); ctx.arc(285, y + 50, 1.5, 0, Math.PI * 2); ctx.fill();
		}
	}

	var dataURL = canvas.toDataURL('image/png');
	ROAD_TEXTURE_CACHE[key] = dataURL;
	return dataURL;
}

// In-World Overhead Racing Gantry & Breakable Checkered Finish Ribbon
function getFinishLineSVG(dir, isBroken, biome) {
	var b = biome || BIOMES[0];
	if (dir === 'side') {
		// Checker strip on road pavement (x: 76 to 106, y: 60 to 540)
		var checkTiles = '';
		for (var row = 0; row < 16; row++) {
			var y = 60 + row * 30;
			for (var col = 0; col < 2; col++) {
				var x = 76 + col * 15;
				var fill = ((row + col) % 2 === 0) ? '#ffffff' : '#111827';
				checkTiles += `<rect x="${x}" y="${y}" width="15" height="30" fill="${fill}"/>`;
			}
		}

		var ribbonSVG = '';
		if (!isBroken) {
			ribbonSVG = `
				<g class="finish-ribbon">
					<rect x="87" y="60" width="8" height="480" fill="#ffea00" stroke="#ff0055" stroke-width="1.5" opacity="0.95"/>
					<line x1="91" y1="60" x2="91" y2="540" stroke="#000" stroke-width="4" stroke-dasharray="8,8"/>
					<rect x="68" y="278" width="46" height="24" rx="4" fill="#ff0055" stroke="#ffff00" stroke-width="2"/>
					<text x="91" y="294" text-anchor="middle" font-family="'Press Start 2P', monospace" font-size="8" fill="#ffffff" font-weight="bold">WIN</text>
				</g>`;
		} else {
			ribbonSVG = `
				<g class="ribbon-broken-top">
					<path d="M 88,60 Q 75,180 48,250" stroke="#ffea00" stroke-width="7" fill="none"/>
					<path d="M 88,60 Q 75,180 48,250" stroke="#000" stroke-width="3" stroke-dasharray="6,6" fill="none"/>
				</g>
				<g class="ribbon-broken-bottom">
					<path d="M 88,540 Q 75,420 48,350" stroke="#ffea00" stroke-width="7" fill="none"/>
					<path d="M 88,540 Q 75,420 48,350" stroke="#000" stroke-width="3" stroke-dasharray="6,6" fill="none"/>
				</g>
				<circle cx="90" cy="300" r="45" fill="url(#finishImpactGlow)" opacity="0.8"/>`;
		}

		return `<svg viewBox="0 0 180 600" width="180" height="600" style="display:block; width:100%; height:100%;">
			<defs>
				<linearGradient id="finishPylonGrad" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0%" stop-color="#0f172a"/>
					<stop offset="50%" stop-color="#1e293b"/>
					<stop offset="100%" stop-color="#090d16"/>
				</linearGradient>
				<radialGradient id="finishImpactGlow" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stop-color="#ffea00" stop-opacity="1"/>
					<stop offset="60%" stop-color="#ff0055" stop-opacity="0.6"/>
					<stop offset="100%" stop-color="#00e5ff" stop-opacity="0"/>
				</radialGradient>
				<filter id="neonFinishGlow" x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation="3" result="glow"/>
					<feMerge>
						<feMergeNode in="glow"/>
						<feMergeNode in="SourceGraphic"/>
					</feMerge>
				</filter>
			</defs>

			<!-- Road Pavement Checkered Band -->
			<rect x="74" y="60" width="34" height="480" fill="#090d16" stroke="#ffea00" stroke-width="2"/>
			${checkTiles}

			<!-- Upper Gantry Pylon -->
			<rect x="62" y="0" width="60" height="62" rx="4" fill="url(#finishPylonGrad)" stroke="${b.curbTop}" stroke-width="2"/>
			<circle cx="74" cy="20" r="6" fill="#ff0055" class="finish-strobe-red"/>
			<circle cx="92" cy="20" r="6" fill="#ffea00" class="finish-strobe-yellow"/>
			<circle cx="110" cy="20" r="6" fill="#00ff66" class="finish-strobe-green"/>

			<!-- Lower Gantry Pylon -->
			<rect x="62" y="538" width="60" height="62" rx="4" fill="url(#finishPylonGrad)" stroke="${b.curbBottom}" stroke-width="2"/>
			<circle cx="74" cy="580" r="6" fill="#00ff66" class="finish-strobe-green"/>
			<circle cx="92" cy="580" r="6" fill="#ffea00" class="finish-strobe-yellow"/>
			<circle cx="110" cy="580" r="6" fill="#ff0055" class="finish-strobe-red"/>

			<!-- Steel Truss Tower Structure -->
			<line x1="72" y1="62" x2="72" y2="538" stroke="#334155" stroke-width="3"/>
			<line x1="112" y1="62" x2="112" y2="538" stroke="#334155" stroke-width="3"/>
			
			<!-- Truss Diagonal Struts -->
			<path d="M 72,62 L 112,100 L 72,140 L 112,180 L 72,220 L 112,260 L 72,300 L 112,340 L 72,380 L 112,420 L 72,460 L 112,500 L 72,538" 
			      stroke="#1e293b" stroke-width="2" fill="none"/>

			<!-- Ribbon Layer -->
			${ribbonSVG}

			<!-- Central Overhead Glowing FINISH Marquee Sign -->
			<g filter="url(#neonFinishGlow)">
				<rect x="25" y="270" width="132" height="38" rx="8" fill="#090d16" stroke="#ffea00" stroke-width="2.5"/>
				<rect x="29" y="274" width="124" height="30" rx="5" fill="#ff0055"/>
				<text x="91" y="295" text-anchor="middle" font-family="'Press Start 2P', monospace" font-size="12" fill="#ffff00" font-weight="bold" letter-spacing="2">FINISH</text>
			</g>
		</svg>`;
	} else {
		// Top-Down Vertical Finish Arch (Width: 450, Height: 180)
		var checkTiles = '';
		for (var col = 0; col < 15; col++) {
			var x = 45 + col * 24;
			for (var row = 0; row < 2; row++) {
				var y = 72 + row * 18;
				var fill = ((row + col) % 2 === 0) ? '#ffffff' : '#111827';
				checkTiles += `<rect x="${x}" y="${y}" width="24" height="18" fill="${fill}"/>`;
			}
		}

		var ribbonSVG = '';
		if (!isBroken) {
			ribbonSVG = `
				<g class="finish-ribbon">
					<rect x="45" y="78" width="360" height="8" fill="#ffea00" stroke="#ff0055" stroke-width="1.5" opacity="0.95"/>
					<line x1="45" y1="82" x2="405" y2="82" stroke="#000" stroke-width="4" stroke-dasharray="8,8"/>
					<rect x="202" y="68" width="46" height="24" rx="4" fill="#ff0055" stroke="#ffff00" stroke-width="2"/>
					<text x="225" y="84" text-anchor="middle" font-family="'Press Start 2P', monospace" font-size="8" fill="#ffffff" font-weight="bold">WIN</text>
				</g>`;
		} else {
			ribbonSVG = `
				<g class="ribbon-broken-left">
					<path d="M 45,82 Q 140,65 190,40" stroke="#ffea00" stroke-width="7" fill="none"/>
					<path d="M 45,82 Q 140,65 190,40" stroke="#000" stroke-width="3" stroke-dasharray="6,6" fill="none"/>
				</g>
				<g class="ribbon-broken-right">
					<path d="M 405,82 Q 310,65 260,40" stroke="#ffea00" stroke-width="7" fill="none"/>
					<path d="M 405,82 Q 310,65 260,40" stroke="#000" stroke-width="3" stroke-dasharray="6,6" fill="none"/>
				</g>
				<circle cx="225" cy="82" r="45" fill="url(#finishImpactGlowV)" opacity="0.8"/>`;
		}

		return `<svg viewBox="0 0 450 180" width="450" height="180" style="display:block; width:100%; height:100%;">
			<defs>
				<radialGradient id="finishImpactGlowV" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stop-color="#ffea00" stop-opacity="1"/>
					<stop offset="60%" stop-color="#ff0055" stop-opacity="0.6"/>
					<stop offset="100%" stop-color="#00e5ff" stop-opacity="0"/>
				</radialGradient>
				<filter id="neonFinishGlowV" x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation="3" result="glow"/>
					<feMerge>
						<feMergeNode in="glow"/>
						<feMergeNode in="SourceGraphic"/>
					</feMerge>
				</filter>
			</defs>

			<!-- Road Checkered Crossing Band -->
			<rect x="45" y="70" width="360" height="40" rx="3" fill="#090d16" stroke="#ffea00" stroke-width="2"/>
			${checkTiles}

			<!-- Left Side Tower Beacon -->
			<rect x="6" y="20" width="38" height="130" rx="4" fill="#0f172a" stroke="${b.curbTop}" stroke-width="2"/>
			<circle cx="25" cy="40" r="7" fill="#ff0055" class="finish-strobe-red"/>
			<circle cx="25" cy="85" r="7" fill="#ffea00" class="finish-strobe-yellow"/>
			<circle cx="25" cy="130" r="7" fill="#00ff66" class="finish-strobe-green"/>

			<!-- Right Side Tower Beacon -->
			<rect x="406" y="20" width="38" height="130" rx="4" fill="#0f172a" stroke="${b.curbBottom}" stroke-width="2"/>
			<circle cx="425" cy="40" r="7" fill="#00ff66" class="finish-strobe-green"/>
			<circle cx="425" cy="85" r="7" fill="#ffea00" class="finish-strobe-yellow"/>
			<circle cx="425" cy="130" r="7" fill="#ff0055" class="finish-strobe-red"/>

			<!-- Overhead Truss Girder Bridge -->
			<rect x="44" y="25" width="362" height="30" rx="4" fill="#090d16" stroke="#00e5ff" stroke-width="2"/>
			
			<!-- Ribbon Layer -->
			${ribbonSVG}

			<!-- Central Illuminated FINISH Header Marquee -->
			<g filter="url(#neonFinishGlowV)">
				<rect x="155" y="16" width="140" height="38" rx="8" fill="#090d16" stroke="#ffff00" stroke-width="2.5"/>
				<rect x="159" y="20" width="132" height="30" rx="5" fill="#ff0055"/>
				<text x="225" y="41" text-anchor="middle" font-family="'Press Start 2P', monospace" font-size="12" fill="#ffff00" font-weight="bold" letter-spacing="2">FINISH</text>
			</g>
		</svg>`;
	}
}

// Intro & Setup
function setupIntro() {
	isGameActive = false;
	isPaused = false;
	if (gameTimer) clearInterval(gameTimer);
	if (timeSlowTimer) clearTimeout(timeSlowTimer);

	var introScr = document.getElementById('introScreen');
	if (introScr) {
		introScr.style.display = 'block';
		introScr.style.backgroundImage = 'url("' + getRoadDataURL('side', BIOMES[0]) + '")';
	}
	if (document.getElementById('titleHeader')) document.getElementById('titleHeader').style.display = 'block';
	if (document.getElementById('titleSub')) document.getElementById('titleSub').style.display = 'block';
	if (document.getElementById('garageContainer')) document.getElementById('garageContainer').style.display = 'flex';
	if (document.getElementById('btnSkipIntro')) document.getElementById('btnSkipIntro').style.display = 'none';
	if (document.getElementById('Intro')) document.getElementById('Intro').style.display = 'none';
	if (document.getElementById('hudBar')) document.getElementById('hudBar').style.display = 'none';
	if (document.getElementById('bulletTimeOverlay')) document.getElementById('bulletTimeOverlay').style.display = 'none';
	if (document.getElementById('instructionsModal')) document.getElementById('instructionsModal').style.display = 'none';
	if (document.getElementById('pauseModal')) document.getElementById('pauseModal').style.display = 'none';
	if (document.getElementById('deathModal')) document.getElementById('deathModal').style.display = 'none';
	if (document.getElementById('winModal')) document.getElementById('winModal').style.display = 'none';
	
	currentLevel = 1;
	score = 0;
	updateScoreDisplay();
	updateLevelDisplay();
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

function updateTrackProgress(distanceRemaining) {
	var total = stageTotalDistance;
	var moved = Math.max(0, total - distanceRemaining);
	var pct = Math.min(100, Math.max(0, (moved / total) * 100));

	var bar = document.getElementById('trackProgressBar');
	var carIcon = document.getElementById('trackCarIcon');
	if (bar) bar.style.width = pct + '%';
	if (carIcon) carIcon.style.left = pct + '%';
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
	if (document.getElementById('titleSub')) document.getElementById('titleSub').style.display = 'none';
	if (document.getElementById('garageContainer')) document.getElementById('garageContainer').style.display = 'none';
	var actionBtns = document.querySelector('.title-action-buttons');
	if (actionBtns) actionBtns.style.display = 'none';
	if (document.getElementById('btnSkipIntro')) document.getElementById('btnSkipIntro').style.display = 'block';
	
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
	if (introScr) introScr.style.backgroundImage = 'url("' + getRoadDataURL('side', BIOMES[0]) + '")';
	var introVid = document.getElementById('Intro');
	if (introVid) { introVid.pause(); introVid.style.display = 'none'; }
	var sndIntro = document.getElementById('sndIntro');
	if (sndIntro) sndIntro.pause();

	if (document.getElementById('titleHeader')) document.getElementById('titleHeader').style.display = 'block';
	if (document.getElementById('titleSub')) document.getElementById('titleSub').style.display = 'block';
	if (document.getElementById('garageContainer')) document.getElementById('garageContainer').style.display = 'flex';
	var actionBtns = document.querySelector('.title-action-buttons');
	if (actionBtns) actionBtns.style.display = 'flex';
	if (document.getElementById('btnSkipIntro')) document.getElementById('btnSkipIntro').style.display = 'none';
}

function openInstructions() {
	if (isGameActive && !isPaused) togglePause();
	var modal = document.getElementById('instructionsModal');
	if (modal) modal.style.display = 'flex';
}

function closeInstructions() {
	var modal = document.getElementById('instructionsModal');
	if (modal) modal.style.display = 'none';
}

function togglePause() {
	if (!isGameActive) return;
	isPaused = !isPaused;
	var pauseModal = document.getElementById('pauseModal');
	var sndDriving = document.getElementById('sndDriving');

	if (isPaused) {
		if (pauseModal) {
			var pauseStats = document.getElementById('pauseStats');
			var b = getBiomeForLevel(currentLevel);
			if (pauseStats) pauseStats.innerHTML = 'STAGE ' + currentLevel + '/99 • ' + b.name + '<br>SCORE: ' + score;
			pauseModal.style.display = 'flex';
		}
		if (sndDriving) sndDriving.pause();
	} else {
		if (pauseModal) pauseModal.style.display = 'none';
		if (sndDriving && !isMuted) sndDriving.play().catch(function(e){});
	}
}

function returnToTitle() {
	if (gameTimer) clearInterval(gameTimer);
	if (timeSlowTimer) clearTimeout(timeSlowTimer);
	isGameActive = false;
	isPaused = false;
	
	if (gameScreen) gameScreen.innerHTML = '';
	if (gameScreen2) gameScreen2.innerHTML = '';
	
	setupIntro();
}

function showStageBanner(lvl) {
	var banner = document.getElementById('stageBanner');
	var bannerText = document.getElementById('stageBannerText');
	var bannerSub = document.getElementById('stageBannerSub');
	if (!banner) return;

	var b = getBiomeForLevel(lvl);
	var isVert = (lvl % 2 === 0);
	if (bannerText) bannerText.innerText = 'STAGE ' + lvl + ' • ' + b.name;
	if (bannerSub) bannerSub.innerText = b.subtitle + (isVert ? ' ⚡ (3-LANE VERTICAL)' : ' ⚡ (4-LANE SPEEDWAY)');

	banner.classList.add('show');
	setTimeout(function() {
		banner.classList.remove('show');
	}, 1500);
}

function showFinalStretchBanner() {
	var banner = document.getElementById('stageBanner');
	var bannerText = document.getElementById('stageBannerText');
	var bannerSub = document.getElementById('stageBannerSub');
	if (!banner) return;

	if (bannerText) bannerText.innerText = '🏁 FINAL STRETCH!';
	if (bannerSub) bannerSub.innerText = 'BREAK THE CHECKERED RIBBON TO WIN!';

	banner.classList.add('show');
	setTimeout(function() {
		banner.classList.remove('show');
	}, 1400);
}

function startCampaign() {
	getAudioCtx();
	currentLevel = 1;
	score = 0;
	startStage(1);
}

// Particle Engine (Explosions, Nitro Fire, Spinout Smoke, Confetti)
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
				ctx.font = 'bold 15px "Press Start 2P", monospace';
				ctx.fillStyle = `rgba(255, 234, 0, ${p.life})`;
				ctx.fillText(p.text, p.x, p.y);
			} else if (p.isConfetti) {
				p.vy += 0.22; // Confetti flutter gravity
				p.angle += p.vAngle;
				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.angle);
				ctx.fillStyle = p.color.replace('ALPHA', p.life);
				ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
				ctx.restore();
			} else {
				ctx.beginPath();
				ctx.arc(p.x, p.y, Math.max(1, p.size * p.life), 0, Math.PI * 2);
				ctx.fillStyle = p.color.replace('ALPHA', p.life);
				ctx.fill();
			}
		}
	}, 30);
}

function spawnConfettiParticles(x, y) {
	var colors = [
		'rgba(255, 234, 0, ALPHA)',  // Gold
		'rgba(0, 229, 255, ALPHA)',  // Cyan
		'rgba(255, 0, 85, ALPHA)',   // Magenta
		'rgba(0, 255, 102, ALPHA)',  // Lime
		'rgba(255, 255, 255, ALPHA)',// White
		'rgba(255, 119, 0, ALPHA)'   // Orange
	];
	for (var i = 0; i < 55; i++) {
		var angle = Math.random() * Math.PI * 2;
		var speed = Math.random() * 12 + 4;
		particles.push({
			x: x, y: y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed - 5, // Initial upward burst
			w: Math.random() * 8 + 5,
			h: Math.random() * 6 + 4,
			angle: Math.random() * Math.PI,
			vAngle: (Math.random() - 0.5) * 0.35,
			life: 1.0,
			decay: Math.random() * 0.02 + 0.015,
			color: colors[Math.floor(Math.random() * colors.length)],
			isConfetti: true
		});
	}
}

function spawnExplosionParticles(x, y) {
	for (var i = 0; i < 30; i++) {
		var angle = Math.random() * Math.PI * 2;
		var speed = Math.random() * 9 + 3;
		particles.push({
			x: x, y: y,
			vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
			size: Math.random() * 6 + 3, life: 1.0, decay: Math.random() * 0.05 + 0.03,
			color: Math.random() > 0.5 ? 'rgba(255, 0, 85, ALPHA)' : 'rgba(255, 234, 0, ALPHA)'
		});
	}
}

function spawnNitroParticles(x, y, dir) {
	var c = CAR_COLORS[selectedCar] ? CAR_COLORS[selectedCar].primary : '#00e5ff';
	for (var i = 0; i < 4; i++) {
		var spread = (Math.random() - 0.5) * 8;
		particles.push({
			x: x, y: y,
			vx: dir === 'left' ? -(Math.random() * 7 + 5) : spread,
			vy: dir === 'down' ? (Math.random() * 7 + 5) : spread,
			size: Math.random() * 5 + 2, life: 1.0, decay: 0.1,
			color: c === '#00e5ff' ? 'rgba(0, 229, 255, ALPHA)' : 'rgba(255, 0, 85, ALPHA)'
		});
	}
}

function spawnSpinoutSmoke(x, y) {
	for (var i = 0; i < 8; i++) {
		particles.push({
			x: x + (Math.random() - 0.5) * 25, y: y + (Math.random() - 0.5) * 25,
			vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
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
		p.style.top = (-600 - (index * 450) - Math.random() * 200) + 'px';
	} else {
		p.speed = baseSpeed;
		var lanes = [50, 160, 270, 380, 490];
		p.style.top = lanes[Math.floor(Math.random() * lanes.length)] + 'px';
		p.style.left = (1500 + (index * 550) + Math.random() * 250) + 'px';
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
	o.style.width = '60px';
	o.style.height = '40px';

	if (isVertical) {
		o.speed = baseSpeed;
		var lanes = [50, 190, 330];
		o.style.left = lanes[Math.floor(Math.random() * lanes.length)] + 'px';
		o.style.top = (-800 - (index * 600) - Math.random() * 200) + 'px';
	} else {
		o.speed = baseSpeed;
		var lanes = [70, 180, 290, 400, 500];
		o.style.top = lanes[Math.floor(Math.random() * lanes.length)] + 'px';
		o.style.left = (1800 + (index * 600) + Math.random() * 250) + 'px';
	}
}

function triggerOilSpinout() {
	if (isSpinningOut || hasShield || (spaceDown && nitro > 0)) return;
	isSpinningOut = true;
	car.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
	car.style.transform = 'rotate(360deg)';
	spawnSpinoutSmoke(parseInt(car.style.left) + 34, parseInt(car.style.top) + 34);

	setTimeout(function() {
		car.style.transition = 'none';
		car.style.transform = 'rotate(0deg)';
		isSpinningOut = false;
	}, 700);
}

// Rival Traffic AI Placement
function placeRivalCarHorizontal(rc, index, baseSpeed) {
	rc.className = 'rivalCar';
	rc.style.width = '88px';
	rc.style.height = '44px';
	var variantIdx = (index + currentLevel) % RIVAL_VARIANTS.length;
	rc.innerHTML = getRivalCarSVG('side', variantIdx);

	var lanes = [45, 155, 265, 375, 485];
	var targetLane = lanes[Math.floor(Math.random() * lanes.length)];
	rc.style.top = targetLane + 'px';
	rc.style.left = (1300 + index * 420 + Math.random() * 300) + 'px';
	
	// Varying speed factor (0.7x to 1.1x)
	rc.speed = baseSpeed * (0.75 + Math.random() * 0.35);
	rc.laneChangeTimer = Math.floor(Math.random() * 60) + 30;
	rc.targetY = targetLane;
}

function placeRivalCarVertical(rc, index, baseSpeed) {
	rc.className = 'rivalCar';
	rc.style.width = '44px';
	rc.style.height = '88px';
	var variantIdx = (index + currentLevel) % RIVAL_VARIANTS.length;
	rc.innerHTML = getRivalCarSVG('top', variantIdx);

	var lanes = [50, 190, 330];
	var targetLane = lanes[Math.floor(Math.random() * lanes.length)];
	rc.style.left = targetLane + 'px';
	rc.style.top = (-500 - index * 420 - Math.random() * 300) + 'px';
	
	rc.speed = baseSpeed * (0.75 + Math.random() * 0.35);
	rc.laneChangeTimer = Math.floor(Math.random() * 60) + 30;
	rc.targetX = targetLane;
}

// Single Progressive Stage Launcher (Levels 1 to 99)
function startStage(lvlNum) {
	currentLevel = Math.max(1, Math.min(99, lvlNum));

	isGameActive = true;
	isPaused = false;
	nitro = 100;
	hasShield = (selectedCar === 'cyber');
	isSpinningOut = false;
	isTimeSlowActive = false;

	if (gameTimer) clearInterval(gameTimer);
	if (timeSlowTimer) clearTimeout(timeSlowTimer);
	cones = []; powerups = []; oilSlicks = []; rivalCars = []; finish = [];

	var deathModal = document.getElementById('deathModal');
	var winModal = document.getElementById('winModal');
	var pauseModal = document.getElementById('pauseModal');
	var instructionsModal = document.getElementById('instructionsModal');
	var bulletOverlay = document.getElementById('bulletTimeOverlay');
	if (deathModal) deathModal.style.display = 'none';
	if (winModal) winModal.style.display = 'none';
	if (pauseModal) pauseModal.style.display = 'none';
	if (instructionsModal) instructionsModal.style.display = 'none';
	if (bulletOverlay) bulletOverlay.style.display = 'none';

	document.getElementById('introScreen').style.display = 'none';
	document.getElementById('hudBar').style.display = 'flex';

	// High-Octane Speed Scaling: starts at 13px/frame + 0.35 per stage
	var isVertical = (currentLevel % 2 === 0);
	var baseSpeed = 13 + (currentLevel * 0.35);
	stageTotalDistance = 2800 + (currentLevel * 220);
	stageRemainingDistance = stageTotalDistance;
	isFinalStretch = false;
	
	var coneCount = Math.min(9, 4 + Math.floor(currentLevel / 6));
	var oilCount = currentLevel >= 2 ? Math.min(4, 1 + Math.floor(currentLevel / 6)) : 0;
	var rivalCount = Math.min(4, 1 + Math.floor(currentLevel / 4));

	var currentBiome = getBiomeForLevel(currentLevel);
	var roadDataURL = getRoadDataURL(isVertical ? 'top' : 'side', currentBiome);

	startParticleLoop();
	showStageBanner(currentLevel);

	if (isVertical) {
		if (gameScreen) gameScreen.innerHTML = '';
		gameScreen2 = document.getElementById('gameScreen2');
		gameScreen2.innerHTML = '';
		gameScreen2.style.width = GS_WIDTH2 + 'px';
		gameScreen2.style.height = GS_HEIGHT2 + 'px';

		bg1 = document.createElement('IMG'); bg1.className = 'bgObject'; bg1.src = roadDataURL;
		bg1.style.width = '450px'; bg1.style.height = '600px'; bg1.style.left = '0px'; bg1.style.top = '0px';
		gameScreen2.appendChild(bg1);

		bg2 = document.createElement('IMG'); bg2.className = 'bgObject'; bg2.src = roadDataURL;
		bg2.style.width = '450px'; bg2.style.height = '600px'; bg2.style.left = '0px'; bg2.style.top = '-600px';
		gameScreen2.appendChild(bg2);

		// Top-Down Player Car (Aspect ratio 44:88)
		car = document.createElement('div');
		car.className = 'playerCar';
		car.style.width = '44px'; car.style.height = '88px'; car.style.top = '480px'; car.style.left = '200px';
		car.innerHTML = getCarSVG('top', selectedCar);
		gameScreen2.appendChild(car);

		shieldAuraEl = null; 
		updateShieldDisplay(); 
		updateScoreDisplay(); 
		updateLevelDisplay(); 
		updateNitroDisplay();
		updateTrackProgress(stageTotalDistance);

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

		for (var i = 0; i < rivalCount; i++) {
			var rCar = document.createElement('div'); gameScreen2.appendChild(rCar);
			placeRivalCarVertical(rCar, i, baseSpeed); rivalCars[i] = rCar;
		}

		for (var i = 0; i < 2; i++) {
			var pup = document.createElement('div'); gameScreen2.appendChild(pup);
			placePowerup(pup, true, i, baseSpeed); powerups[i] = pup;
		}

		finish = [];

		gameTimer = setInterval(function() { gameloopVerticalProgressive(baseSpeed); }, 30);

	} else {
		if (gameScreen2) gameScreen2.innerHTML = '';
		gameScreen = document.getElementById('gameScreen');
		gameScreen.innerHTML = '';
		gameScreen.style.width = GS_WIDTH + 'px';
		gameScreen.style.height = GS_HEIGHT + 'px';

		bg1 = document.createElement('IMG'); bg1.className = 'bgObject'; bg1.src = roadDataURL;
		bg1.style.width = '1050px'; bg1.style.height = '600px'; bg1.style.left = '0px'; bg1.style.top = '0px';
		gameScreen.appendChild(bg1);

		bg2 = document.createElement('IMG'); bg2.className = 'bgObject'; bg2.src = roadDataURL;
		bg2.style.width = '1050px'; bg2.style.height = '600px'; bg2.style.left = '1050px'; bg2.style.top = '0px';
		gameScreen.appendChild(bg2);

		// Side-View Player Car (Aspect ratio 88:44)
		car = document.createElement('div');
		car.className = 'playerCar';
		car.style.width = '88px'; car.style.height = '44px'; car.style.top = '275px'; car.style.left = '68px';
		car.innerHTML = getCarSVG('side', selectedCar);
		gameScreen.appendChild(car);

		shieldAuraEl = null; 
		updateShieldDisplay(); 
		updateScoreDisplay(); 
		updateLevelDisplay(); 
		updateNitroDisplay();
		updateTrackProgress(stageTotalDistance);

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

		for (var i = 0; i < rivalCount; i++) {
			var rCar = document.createElement('div'); gameScreen.appendChild(rCar);
			placeRivalCarHorizontal(rCar, i, baseSpeed); rivalCars[i] = rCar;
		}

		for (var i = 0; i < 2; i++) {
			var pup = document.createElement('div'); gameScreen.appendChild(pup);
			placePowerup(pup, false, i, baseSpeed); powerups[i] = pup;
		}

		finish = [];

		gameTimer = setInterval(function() { gameloopHorizontalProgressive(baseSpeed); }, 30);
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

function explode(obj, soundType) {
	playSynthSound(soundType || 'crash');
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
	if (isNitroAudioActive) playSynthSound('nitro_stop');
	explode(car, 'crash');
	car.style.top = '-1000px';
	if (shieldAuraEl) shieldAuraEl.style.display = 'none';
	clearInterval(gameTimer);
	isGameActive = false;

	if (score > highScore) {
		highScore = score;
		localStorage.setItem('rockinracer_highscore', String(highScore));
		updateHighScoreDisplay();
	}

	var stagesSurvived = currentLevel - 1;
	var statsEl = document.getElementById('deathStats');
	if (statsEl) {
		statsEl.innerHTML = 'STAGES SURVIVED: ' + stagesSurvived + ' / 99<br>FINAL RUN SCORE: ' + score + '<br>ALL-TIME BEST: ' + highScore;
	}
	var modal = document.getElementById('deathModal');
	if (modal) modal.style.display = 'flex';
}

function handleStageClear() {
	if (isNitroAudioActive) playSynthSound('nitro_stop');
	clearInterval(gameTimer);
	isGameActive = false;
	playSynthSound('win');
	
	var mult = selectedCar === 'gold' ? 1.25 : 1.0;
	var bonus = Math.round((1000 + (currentLevel * 100)) * mult);
	score += bonus;
	updateScoreDisplay();

	if (score > highScore) {
		highScore = score;
		localStorage.setItem('rockinracer_highscore', String(highScore));
		updateHighScoreDisplay();
	}

	var statsEl = document.getElementById('winStats');
	if (statsEl) {
		statsEl.innerHTML = (currentLevel >= 99 ? '🏆 GRAND CHAMPION! YOU BEAT ALL 99 LEVELS!' : 'LEVEL ' + currentLevel + ' CLEARED!<br>BONUS: +' + bonus) + '<br>TOTAL SCORE: ' + score;
	}
	var modal = document.getElementById('winModal');
	if (modal) modal.style.display = 'flex';
}

function startNewRun() {
	getAudioCtx();
	currentLevel = 1;
	score = 0;
	startStage(1);
}

function restartCurrentLevel() {
	startNewRun();
}

function nextLevel() {
	if (currentLevel < 99) startStage(currentLevel + 1);
	else setupIntro();
}

// GAMELOOPS
function gameloopHorizontalProgressive(baseSpeed) {
	if (isPaused || !isGameActive) return;

	var sndDriving = document.getElementById('sndDriving');
	if (sndDriving) { sndDriving.volume = 0.4; sndDriving.muted = isMuted; sndDriving.play().catch(function(e){}); }

	var curSpeedMult = 1;
	var isBoosting = (spaceDown && nitro > 0);
	var rechargeRate = selectedCar === 'blue' ? 0.22 : 0.14;

	if (isBoosting) {
		curSpeedMult = 1.75;
		nitro = Math.max(0, nitro - 1.8);
		updateNitroDisplay();
		if (!isNitroAudioActive) playSynthSound('nitro_start');
		spawnNitroParticles(parseInt(car.style.left), parseInt(car.style.top) + 22, 'left');
	} else {
		if (isNitroAudioActive) playSynthSound('nitro_stop');
		if (nitro < 100) {
			nitro = Math.min(100, nitro + rechargeRate);
			updateNitroDisplay();
		}
	}

	var timeSlowMult = isTimeSlowActive ? 0.4 : 1.0;
	var mult = selectedCar === 'gold' ? 1.25 : 1.0;
	score += Math.round(2 * mult);
	updateScoreDisplay();

	var bgSpeed = baseSpeed * curSpeedMult;
	var bg1X = parseInt(bg1.style.left) - bgSpeed; bg1.style.left = bg1X + 'px';
	var bg2X = parseInt(bg2.style.left) - bgSpeed; bg2.style.left = bg2X + 'px';
	if (bg1X < -1 * GS_WIDTH) bg1.style.left = parseInt(bg2.style.left) + GS_WIDTH + 'px';
	if (bg2X < -1 * GS_WIDTH) bg2.style.left = parseInt(bg1.style.left) + GS_WIDTH + 'px';

	if (!isSpinningOut) {
		var step = (baseSpeed * 1.5) * (isBoosting ? 1.4 : 1.0);
		if (upArrowDown) car.style.top = Math.max(10, parseInt(car.style.top) - step) + 'px';
		if (downArrowDown) car.style.top = Math.min(GS_HEIGHT - 54, parseInt(car.style.top) + step) + 'px';
		if (leftArrowDown) car.style.left = Math.max(10, parseInt(car.style.left) - step) + 'px';
		if (rightArrowDown) car.style.left = Math.min(GS_WIDTH - 98, parseInt(car.style.left) + step) + 'px';
	}

	updateShieldDisplay();

	// Powerups
	for (var i = 0; i < powerups.length; i++) {
		var pup = powerups[i];
		var newX = parseInt(pup.style.left) - (pup.speed * curSpeedMult * timeSlowMult);
		if (newX < -60) {
			if (!isFinalStretch) placePowerup(pup, false, i, baseSpeed);
			else pup.style.left = '-999px';
		} else {
			pup.style.left = newX + 'px';
		}

		if (hittest(pup, car)) { 
			handlePowerupPickup(pup); 
			if (!isFinalStretch) placePowerup(pup, false, i, baseSpeed);
			else pup.style.left = '-999px';
		}
	}

	// Oil Slicks
	for (var i = 0; i < oilSlicks.length; i++) {
		var slick = oilSlicks[i];
		var newX = parseInt(slick.style.left) - (slick.speed * curSpeedMult * timeSlowMult);
		if (newX < -80) {
			if (!isFinalStretch) placeOilSlick(slick, false, i, baseSpeed);
			else slick.style.left = '-999px';
		} else {
			slick.style.left = newX + 'px';
		}

		if (hittest(slick, car)) { 
			if (!isBoosting && !hasShield) triggerOilSpinout(); 
			if (!isFinalStretch) placeOilSlick(slick, false, i, baseSpeed);
			else slick.style.left = '-999px';
		}
	}

	// Rival AI Traffic Cars
	for (var i = 0; i < rivalCars.length; i++) {
		var rc = rivalCars[i];
		var newX = parseInt(rc.style.left) - (rc.speed * curSpeedMult * timeSlowMult);
		
		// Dynamic lane shifting AI
		rc.laneChangeTimer--;
		if (rc.laneChangeTimer <= 0) {
			var lanes = [45, 155, 265, 375, 485];
			rc.targetY = lanes[Math.floor(Math.random() * lanes.length)];
			rc.laneChangeTimer = Math.floor(Math.random() * 80) + 40;
		}
		var curY = parseInt(rc.style.top);
		if (Math.abs(curY - rc.targetY) > 2) {
			rc.style.top = (curY + (rc.targetY > curY ? 3 : -3)) + 'px';
		}

		if (newX < -100) {
			if (!isFinalStretch) placeRivalCarHorizontal(rc, i, baseSpeed);
			else rc.style.left = '-999px';
		} else {
			rc.style.left = newX + 'px';
		}

		if (hittest(rc, car)) {
			if (isBoosting) {
				explode(rc, 'smash');
				score += 300;
				spawnFloatingText(parseInt(rc.style.left), parseInt(rc.style.top), 'SMASH! +300');
				if (!isFinalStretch) placeRivalCarHorizontal(rc, i, baseSpeed);
				else rc.style.left = '-999px';
			} else if (hasShield) {
				hasShield = false;
				updateShieldDisplay();
				explode(rc, 'smash');
				if (!isFinalStretch) placeRivalCarHorizontal(rc, i, baseSpeed);
				else rc.style.left = '-999px';
			} else {
				explode(rc, 'crash');
				if (!isFinalStretch) placeRivalCarHorizontal(rc, i, baseSpeed);
				handleCrash();
			}
		}
	}

	// Cones
	for (var i = 0; i < cones.length; i++) {
		var newX = parseInt(cones[i].style.left) - (cones[i].speed * curSpeedMult * timeSlowMult);
		if (newX < -60) {
			if (!isFinalStretch) placeConeHorizontal(cones[i], i, baseSpeed);
			else cones[i].style.left = '-999px';
		} else {
			cones[i].style.left = newX + 'px';
		}

		if (hittest(cones[i], car)) {
			if (isBoosting) {
				explode(cones[i], 'smash');
				if (!isFinalStretch) placeConeHorizontal(cones[i], i, baseSpeed);
				else cones[i].style.left = '-999px';
			} else if (hasShield) {
				hasShield = false;
				updateShieldDisplay();
				explode(cones[i], 'smash');
				if (!isFinalStretch) placeConeHorizontal(cones[i], i, baseSpeed);
				else cones[i].style.left = '-999px';
			} else {
				explode(cones[i], 'crash');
				if (!isFinalStretch) placeConeHorizontal(cones[i], i, baseSpeed);
				handleCrash();
			}
		}
	}

	// Track Progress & In-World Finish Line Spawning
	var scrollDelta = baseSpeed * curSpeedMult * timeSlowMult;
	if (stageRemainingDistance > 0) {
		stageRemainingDistance -= scrollDelta;
		updateTrackProgress(stageRemainingDistance);
		if (stageRemainingDistance <= 0) {
			stageRemainingDistance = 0;
			isFinalStretch = true;
			showFinalStretchBanner();

			if (!finish[0]) {
				var finishLine = document.createElement('div');
				finishLine.className = 'finishObject';
				finishLine.style.width = '180px';
				finishLine.style.height = '600px';
				finishLine.style.left = (GS_WIDTH + 60) + 'px';
				finishLine.style.top = '0px';
				var b = getBiomeForLevel(currentLevel);
				finishLine.innerHTML = getFinishLineSVG('side', false, b);
				finishLine.isBroken = false;
				gameScreen.appendChild(finishLine);
				finish[0] = finishLine;
			}
		}
	}

	// In-World Finish Arch Approach & Break Physics
	if (isFinalStretch && finish[0]) {
		var curX = parseFloat(finish[0].style.left);
		var newX = curX - (baseSpeed * curSpeedMult * timeSlowMult);
		finish[0].style.left = newX + 'px';

		var carLeft = parseInt(car.style.left);
		if (!finish[0].isBroken && (hittest(finish[0], car) || (newX + 90) <= carLeft + 80)) {
			finish[0].isBroken = true;
			var b = getBiomeForLevel(currentLevel);
			finish[0].innerHTML = getFinishLineSVG('side', true, b);
			spawnConfettiParticles(carLeft + 88, parseInt(car.style.top) + 22);
			playSynthSound('victory_chime');

			setTimeout(function() {
				if (isGameActive) handleStageClear();
			}, 500);
		}
	}
}

function gameloopVerticalProgressive(baseSpeed) {
	if (isPaused || !isGameActive) return;

	var sndDriving = document.getElementById('sndDriving');
	if (sndDriving) { sndDriving.volume = 0.4; sndDriving.muted = isMuted; sndDriving.play().catch(function(e){}); }

	var curSpeedMult = 1;
	var isBoosting = (spaceDown && nitro > 0);
	var rechargeRate = selectedCar === 'blue' ? 0.22 : 0.14;

	if (isBoosting) {
		curSpeedMult = 1.75;
		nitro = Math.max(0, nitro - 1.8);
		updateNitroDisplay();
		if (!isNitroAudioActive) playSynthSound('nitro_start');
		spawnNitroParticles(parseInt(car.style.left) + 22, parseInt(car.style.top) + 88, 'down');
	} else {
		if (isNitroAudioActive) playSynthSound('nitro_stop');
		if (nitro < 100) {
			nitro = Math.min(100, nitro + rechargeRate);
			updateNitroDisplay();
		}
	}

	var timeSlowMult = isTimeSlowActive ? 0.4 : 1.0;
	var mult = selectedCar === 'gold' ? 1.25 : 1.0;
	score += Math.round(2 * mult);
	updateScoreDisplay();

	var bgSpeed = (baseSpeed * 1.5) * curSpeedMult;
	var bg1Y = parseInt(bg1.style.top) + bgSpeed; bg1.style.top = bg1Y + 'px';
	var bg2Y = parseInt(bg2.style.top) + bgSpeed; bg2.style.top = bg2Y + 'px';
	if (bg1Y >= GS_HEIGHT2) bg1.style.top = (parseInt(bg2.style.top) - GS_HEIGHT2) + 'px';
	if (bg2Y >= GS_HEIGHT2) bg2.style.top = (parseInt(bg1.style.top) - GS_HEIGHT2) + 'px';

	if (!isSpinningOut) {
		var step = (baseSpeed * 1.5) * (isBoosting ? 1.4 : 1.0);
		if (leftArrowDown) car.style.left = Math.max(10, parseInt(car.style.left) - step) + 'px';
		if (rightArrowDown) car.style.left = Math.min(GS_WIDTH2 - 54, parseInt(car.style.left) + step) + 'px';
		if (upArrowDown) car.style.top = Math.max(20, parseInt(car.style.top) - (step * 0.9)) + 'px';
		if (downArrowDown) car.style.top = Math.min(GS_HEIGHT2 - 98, parseInt(car.style.top) + (step * 0.9)) + 'px';
	}

	updateShieldDisplay();

	// Powerups
	for (var i = 0; i < powerups.length; i++) {
		var pup = powerups[i];
		var newY = parseInt(pup.style.top) + (pup.speed * curSpeedMult * timeSlowMult);
		if (newY > GS_HEIGHT + 60) {
			if (!isFinalStretch) placePowerup(pup, true, i, baseSpeed);
			else pup.style.top = '9999px';
		} else {
			pup.style.top = newY + 'px';
		}

		if (hittest(pup, car)) { 
			handlePowerupPickup(pup); 
			if (!isFinalStretch) placePowerup(pup, true, i, baseSpeed);
			else pup.style.top = '9999px';
		}
	}

	// Oil Slicks
	for (var i = 0; i < oilSlicks.length; i++) {
		var slick = oilSlicks[i];
		var newY = parseInt(slick.style.top) + (slick.speed * curSpeedMult * timeSlowMult);
		if (newY > GS_HEIGHT + 80) {
			if (!isFinalStretch) placeOilSlick(slick, true, i, baseSpeed);
			else slick.style.top = '9999px';
		} else {
			slick.style.top = newY + 'px';
		}

		if (hittest(slick, car)) { 
			if (!isBoosting && !hasShield) triggerOilSpinout(); 
			if (!isFinalStretch) placeOilSlick(slick, true, i, baseSpeed);
			else slick.style.top = '9999px';
		}
	}

	// Rival AI Traffic Cars
	for (var i = 0; i < rivalCars.length; i++) {
		var rc = rivalCars[i];
		var newY = parseInt(rc.style.top) + (rc.speed * curSpeedMult * timeSlowMult);
		
		// Dynamic lane shifting AI
		rc.laneChangeTimer--;
		if (rc.laneChangeTimer <= 0) {
			var lanes = [50, 190, 330];
			rc.targetX = lanes[Math.floor(Math.random() * lanes.length)];
			rc.laneChangeTimer = Math.floor(Math.random() * 80) + 40;
		}
		var curX = parseInt(rc.style.left);
		if (Math.abs(curX - rc.targetX) > 2) {
			rc.style.left = (curX + (rc.targetX > curX ? 3 : -3)) + 'px';
		}

		if (newY > GS_HEIGHT + 100) {
			if (!isFinalStretch) placeRivalCarVertical(rc, i, baseSpeed);
			else rc.style.top = '9999px';
		} else {
			rc.style.top = newY + 'px';
		}

		if (hittest(rc, car)) {
			if (isBoosting) {
				explode(rc, 'smash');
				score += 300;
				spawnFloatingText(parseInt(rc.style.left), parseInt(rc.style.top), 'SMASH! +300');
				if (!isFinalStretch) placeRivalCarVertical(rc, i, baseSpeed);
				else rc.style.top = '9999px';
			} else if (hasShield) {
				hasShield = false;
				updateShieldDisplay();
				explode(rc, 'smash');
				if (!isFinalStretch) placeRivalCarVertical(rc, i, baseSpeed);
				else rc.style.top = '9999px';
			} else {
				explode(rc, 'crash');
				if (!isFinalStretch) placeRivalCarVertical(rc, i, baseSpeed);
				handleCrash();
			}
		}
	}

	// Cones
	for (var i = 0; i < cones.length; i++) {
		var newY = parseInt(cones[i].style.top) + (cones[i].speed * curSpeedMult * timeSlowMult);
		if (newY > GS_HEIGHT + 60) {
			if (!isFinalStretch) placeConeVertical(cones[i], i, baseSpeed);
			else cones[i].style.top = '9999px';
		} else {
			cones[i].style.top = newY + 'px';
		}

		if (hittest(cones[i], car)) {
			if (isBoosting) {
				explode(cones[i], 'smash');
				if (!isFinalStretch) placeConeVertical(cones[i], i, baseSpeed);
				else cones[i].style.top = '9999px';
			} else if (hasShield) {
				hasShield = false;
				updateShieldDisplay();
				explode(cones[i], 'smash');
				if (!isFinalStretch) placeConeVertical(cones[i], i, baseSpeed);
				else cones[i].style.top = '9999px';
			} else {
				explode(cones[i], 'crash');
				if (!isFinalStretch) placeConeVertical(cones[i], i, baseSpeed);
				handleCrash();
			}
		}
	}

	// Track Progress & In-World Vertical Finish Line Spawning
	var scrollDelta = (baseSpeed * 1.5) * curSpeedMult * timeSlowMult;
	if (stageRemainingDistance > 0) {
		stageRemainingDistance -= scrollDelta;
		updateTrackProgress(stageRemainingDistance);
		if (stageRemainingDistance <= 0) {
			stageRemainingDistance = 0;
			isFinalStretch = true;
			showFinalStretchBanner();

			if (!finish[1]) {
				var finishLine = document.createElement('div');
				finishLine.className = 'finishObject';
				finishLine.style.width = '450px';
				finishLine.style.height = '180px';
				finishLine.style.left = '0px';
				finishLine.style.top = '-200px';
				var b = getBiomeForLevel(currentLevel);
				finishLine.innerHTML = getFinishLineSVG('top', false, b);
				finishLine.isBroken = false;
				gameScreen2.appendChild(finishLine);
				finish[1] = finishLine;
			}
		}
	}

	// In-World Finish Arch Approach & Break Physics
	if (isFinalStretch && finish[1]) {
		var curY = parseFloat(finish[1].style.top);
		var newY = curY + ((baseSpeed * 1.5) * curSpeedMult * timeSlowMult);
		finish[1].style.top = newY + 'px';

		var carTop = parseInt(car.style.top);
		if (!finish[1].isBroken && (hittest(finish[1], car) || (newY + 84) >= carTop)) {
			finish[1].isBroken = true;
			var b = getBiomeForLevel(currentLevel);
			finish[1].innerHTML = getFinishLineSVG('top', true, b);
			spawnConfettiParticles(parseInt(car.style.left) + 22, carTop);
			playSynthSound('victory_chime');

			setTimeout(function() {
				if (isGameActive) handleStageClear();
			}, 500);
		}
	}
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
	if (event.code === 'ArrowLeft' || event.code === 'KeyA') { leftArrowDown = true; event.preventDefault(); }
	if (event.code === 'ArrowRight' || event.code === 'KeyD') { rightArrowDown = true; event.preventDefault(); }
	if (event.code === 'ArrowUp' || event.code === 'KeyW') { upArrowDown = true; event.preventDefault(); }
	if (event.code === 'ArrowDown' || event.code === 'KeyS') { downArrowDown = true; event.preventDefault(); }
	if (event.code === 'Space') { spaceDown = true; event.preventDefault(); }
	if (event.code === 'KeyP' || event.code === 'Escape') { togglePause(); event.preventDefault(); }
	if (event.code === 'KeyM') { toggleMute(); event.preventDefault(); }
});

document.addEventListener('keyup', function(event) {
	if (event.code === 'ArrowLeft' || event.code === 'KeyA') leftArrowDown = false;
	if (event.code === 'ArrowRight' || event.code === 'KeyD') rightArrowDown = false;
	if (event.code === 'ArrowUp' || event.code === 'KeyW') upArrowDown = false;
	if (event.code === 'ArrowDown' || event.code === 'KeyS') downArrowDown = false;
	if (event.code === 'Space') spaceDown = false;
});
