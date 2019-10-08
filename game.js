import Dome from './Dome.js';
import Loop from './Loop.js';
import Leader from './Leader.js';
import Location from './Location.js';

const loop = new Loop(gameLoop);
const elementNames = [
	// 'meditate', 'forage',
	'leader-name',
	'inventory-list', 'nothing',
	'locked',
	'age-value',
	'building-value', 'enlightenment-value', 'lumbering-value', 'science-value', 'survivalism-value',
	'food-value', 'wood-value', 'stone-value', 'ore-value',
	'fullness-value', 'fullness-warning',
	'location-name', 'space-free', 'space-used',
	'donate', 'donate-what',
	'eat', 'farm',
	'tents',
	'huts',
	'houses',
	'farms',
	'temples',
	'pop-total',
	'pop-hobos',
];
const clicks = {
	'eat': () => { leader.eat(); },
	'meditate':  () => { leader.meditate(locations[locationIndex]); },
	'forage':  () => { leader.forage(locations[locationIndex]); },
	'farm': () => { leader.farm(locations[locationIndex]); },
	'gather-wood': () => { leader.gatherWood(locations[locationIndex]); },
	'chop-wood': () => { leader.chopWood(locations[locationIndex]); },
	'mine-stone': () => { leader.mineStone(locations[locationIndex]); },
	'mine-ore': () => { leader.mineOre(locations[locationIndex]); },
	'experiment': () => { leader.experiment(locations[locationIndex]); },
	'donate': () => { leader.drop(getDropWhat(), locations[locationIndex]); },
	'edit-leader-name': () => {
		leader.name = window.prompt('Edit name', leader.name);
		updateNames();
	},
	'edit-location-name': () => {
		const loc = locations[locationIndex];
		loc.name = window.prompt('Edit name', loc.name);
		updateNames();
	},
	'build-tent': () => { build('tent'); },
	'build-hut': () => { build('hut'); },
	'build-house': () => { build('house'); },
	'build-farm': () => { build('farm'); },
};
const dome = new Dome({ elementNames, clicks, onReady: startGame });
const locations = [];
locations.push(new Location('The dark forest'));
locations.push(new Location('Pine forest'));
locations.push(new Location('Dusty desert'));
let tRunning = 0;
const locationIndex = 0;
const leader = new Leader();

const game = {
	dome,
	leader,
	locations
};

function startGame() {
	updateNames();
	loop.begin();
}

function build(what) {
	const loc = locations[locationIndex];
	const reqs = loc.getBuildRequirements(what);
	const canBuild = leader.checkInventory(reqs);
	if (!canBuild) { return false; }
	leader.dropCollection(reqs, loc);
	const didBuild = loc.build(what);
	if (didBuild) {
		leader.build(what);
	}
	return didBuild;
}

function refreshInventory() {
	const total = leader.getInventoryTotal();
	if (total) {
		lockElement(dome.getElement('nothing'));
		unlockElement(dome.getElement('inventory-list'));
	} else {
		lockElement(dome.getElement('inventory-list'));
		unlockElement(dome.getElement('nothing'));
	}
	const key = getDropWhat();
	dome.getElement('donate').disabled = (leader.inventory[key] > 0) ? false : true;
}

function getDropWhat() {
	const selector = dome.getElement('donate-what');
	return selector[selector.selectedIndex].value || 'food';
}

function gameLoop(deltaT) {
	tRunning += deltaT;
	const loc = locations[locationIndex];
	// console.log('ding');
	leader.older(deltaT);
	loc.older(deltaT);
	if (tRunning >= 1) {
		tRunning -= 1;
		loc.rejob();
	}
	const vm = getDomeViewModel(loc);
	checkUnlocks(vm);
	refreshInventory();
	dome.update(vm);
}

function getDomeViewModel(loc) {
	// console.log(leader);
	return {
		'food-value': getNum(leader.inventory.food),
		'wood-value': getNum(leader.inventory.wood),
		'stone-value': getNum(leader.inventory.stone),
		'ore-value': getNum(leader.inventory.ore),

		'age-value': getNum(leader.age),
		'fullness-value': getNum(leader.fullness),
		'fullness-warning': (leader.fullness < 30) ? 'Hungry!' : '',

		'building-value': getNum(leader.skills.building),
		'enlightenment-value': getNum(leader.skills.enlightenment),
		'lumbering-value': getNum(leader.skills.lumbering),
		'mining-value': getNum(leader.skills.mining),
		'science-value': getNum(leader.skills.science),
		'survivalism-value': getNum(leader.skills.survivalism),
		
		'community-food': getNum(loc.inventory.food),
		'community-wood': getNum(loc.inventory.wood),
		'community-stone': getNum(loc.inventory.stone),
		'community-ore': getNum(loc.inventory.ore),

		'tents': getNum(loc.buildings.tent),
		'huts': getNum(loc.buildings.hut),
		'houses': getNum(loc.buildings.house),
		'farms': getNum(loc.buildings.farm),
		'temples': getNum(loc.buildings.temple),

		'pop-total': getNum(loc.getPopulationTotal()),
		'pop-hobo': getNum(loc.population.hobo),
		'pop-forager': getNum(loc.population.forager),
		'pop-farmer': getNum(loc.population.farmer),
	};
}

function getNum(n) {
	if (typeof n !== 'number') { return 0; }
	return Math.floor(n).toLocaleString();
}

function checkUnlocks(vm) {
	dome.getElements('locked').forEach((elt) => {
		let unlockCount = 0;
		const unlockAttr = elt.getAttribute('data-unlock');
		const fixedUnlockAttr = (unlockAttr) ? unlockAttr.replace(/'/g, "\"") : '{}';
		const unlock = (fixedUnlockAttr) ? JSON.parse(fixedUnlockAttr) : {};
		const unlockKeys = Object.keys(unlock);
		unlockKeys.forEach((key) => {
			// console.log("comparing", vm[key], unlock[key]);
			if (vm[key] >= unlock[key]) {
				unlockCount++;
			}
		});
		if (unlockCount >= unlockKeys.length) {
			unlockElement(elt);
			dome.setElement('locked');
		}
	});
}

function unlockElement(elt) {
	elt.classList.remove('locked');
	elt.classList.add('unlocked');
}

function lockElement(elt) {
	elt.classList.remove('unlocked');
	elt.classList.add('locked');
}

function updateNames() {
	const loc = locations[locationIndex];
	dome.update({
		'leader-name': leader.name,
		'location-name': loc.name,
	});
}


if (window) { window.g = game; }
export default game;
