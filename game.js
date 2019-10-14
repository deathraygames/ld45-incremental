import Dome from './Dome.js';
import Loop from './Loop.js';
import Leader from './Leader.js';
import Location from './Location.js';
import Upgrader from './Upgrader.js';
import upgradeData from './upgrade-data.js';

const loop = new Loop(gameLoop);
const upgrader = new Upgrader(upgradeData);
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
	'donate', 'donate-what', 'take-what',
	'eat', 'farm',
	'tents',
	'huts',
	'houses',
	'farms',
	'temples',
	'pop-total', 'pop-max',
	'pop-hobos',
	'unlocked-upgrades-list',
];
const clickActions = ['eat', 'meditate', 'forage', 'farm', 'gatherWood', 'chopWood', 'mineStone', 'mineOre', 'experiment'];
const clickBuildActions = ['tent', 'hut', 'house', 'farm', 'mine', 'temple', 'academy'];
const clicks = {
	'donate': () => {
		leader.inventory.drop(getDropWhat(), locations[locationIndex], 100);
	},
	'take': () => {
		const location = locations[locationIndex];
		location.inventory.transfer(getTakeWhat(), leader, 100);
	},
	'edit-leader-name': () => {
		leader.name = window.prompt('Edit name', leader.name);
		updateNames();
	},
	'edit-location-name': () => {
		const loc = locations[locationIndex];
		loc.name = window.prompt('Edit name', loc.name);
		updateNames();
	},
};
clickActions.forEach((action) => {
	clicks[action] = function() { leaderAction(action); }
});
clickBuildActions.forEach((what) => {
	clicks[`build-${what}`] = function() { build(what); }
});
const dome = new Dome({ elementNames, clicks, onReady: startGame });
const locations = [];
locations.push(new Location('The dark forest'));
locations.push(new Location('Pine forest'));
locations.push(new Location('Dusty desert'));
let focusedActionTimer = 0;
let secondTimer = 0;
const locationIndex = 0;
const leader = new Leader();

const game = {
	dome,
	loop,
	leader,
	locations,
	upgrader
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
	leader.inventory.dropCollection(reqs, loc);
	const didBuild = loc.build(what);
	if (didBuild) {
		leader.build(what);
	}
	return didBuild;
}

function leaderAction(action) {
	const location = locations[locationIndex];
	dome.getElement(action).focus();
	return leader[action](location);
}

function leaderActionValidated(action) {
	if (clickActions.indexOf(action) === -1) { return; }
	return leaderAction(action);
}

function actionByFocus() {
	const focus = dome.getFocus();
	focus.classList.forEach((className) => { leaderActionValidated(className); });
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

function getTakeWhat() {
	const selector = dome.getElement('take-what');
	return selector[selector.selectedIndex].value || 'food';
}

function gameLoop(deltaT) {
	secondTimer += deltaT;
	focusedActionTimer += deltaT;
	const location = locations[locationIndex];
	const data = { leader, location };

	leader.older(deltaT);
	location.older(deltaT);
	
	if (secondTimer >= 1) {
		secondTimer = 0; // secondTimer -= 1;
		location.rejob();
		upgrader.checkUnlock(data);
		upgrader.setupUnpurchasedList(dome, 'unlocked-upgrades-list', 8);
	}
	if (focusedActionTimer > 1) {
		focusedActionTimer = 0;
		actionByFocus();
	}
	const vm = getDomeViewModel(location);
	checkUnlocks(vm);
	refreshInventory();
	dome.update(vm);
}

function getDomeViewModel(loc) {
	// console.log(leader);
	const vm = {
		'food-value': getNum(leader.inventory.food),
		'wood-value': getNum(leader.inventory.wood),
		'stone-value': getNum(leader.inventory.stone),
		'ore-value': getNum(leader.inventory.ore),

		'age-value': getNum(leader.age),
		'fullness-value': getNum(leader.fullness),
		'fullness-warning': (leader.fullness < 30) ? 'Hungry!' : '',

		'building-value': getNum(leader.skills.building),
		'enlightenment-value': getNum(leader.skills.enlightenment),
		'farming-value': getNum(leader.skills.farming),
		'lumbering-value': getNum(leader.skills.lumbering),
		'mining-value': getNum(leader.skills.mining),
		'science-value': getNum(leader.skills.science),
		'survivalism-value': getNum(leader.skills.survivalism),
		
		'community-food': getNum(loc.inventory.food),
		'community-wood': getNum(loc.inventory.wood),
		'community-stone': getNum(loc.inventory.stone),
		'community-ore': getNum(loc.inventory.ore),
		'private-food': getNum(loc.privateInventory.food),
		'private-wood': getNum(loc.privateInventory.wood),
		'private-stone': getNum(loc.privateInventory.stone),
		'private-ore': getNum(loc.privateInventory.ore),

		'tents': getNum(loc.buildings.tent),
		'huts': getNum(loc.buildings.hut),
		'houses': getNum(loc.buildings.house),
		'farms': getNum(loc.buildings.farm),
		'mines': getNum(loc.buildings.mine),
		'temples': getNum(loc.buildings.temple),
		'academies': getNum(loc.buildings.academy),

		'immigration-rate': getDecimal(loc.immigrationRate),
		'pop-total': getNum(loc.getPopulationTotal()),
		'pop-max': getNum(loc.getMaxPopulation()),
		'pop-hobo': getNum(loc.population.hobo),
		'pop-forager': getNum(loc.population.forager),
		'pop-farmer': getNum(loc.population.farmer),
		'pop-miner': getNum(loc.population.miner),
		'pop-monk': getNum(loc.population.monk),
		'pop-academic': getNum(loc.population.academic),

		'used-space': getNum(loc.getUsedSpace()),
		'free-space': getNum(loc.getFreeSpace()),
	};
	return Object.assign(vm, upgrader.getUpgradedModel());
}

function getNum(n) {
	if (typeof n !== 'number') { return 0; }
	return Math.floor(n).toLocaleString();
}

function getDecimal(n, d = 10) {
	if (typeof n !== 'number') { return 0; }
	return (Math.floor(n * d) / d).toLocaleString();
}

function checkUnlocks(vm) {
	dome.getElements('locked').forEach((elt) => {
		let unlockCount = 0;
		const unlockAttr = elt.getAttribute('data-unlock');
		const fixedUnlockAttr = (unlockAttr) ? unlockAttr.replace(/'/g, "\"") : '{}';
		const unlock = (fixedUnlockAttr) ? JSON.parse(fixedUnlockAttr) : {};
		const unlockKeys = Object.keys(unlock);
		if (unlockKeys.length === 0) { return; } // no way provided on how to unlock
		unlockKeys.forEach((key) => {
			const isNumber = (typeof unlock[key] === 'number');
			// console.log("comparing", vm[key], unlock[key]);
			if (isNumber && vm[key] >= unlock[key] || vm[key] === unlock[key]) {
				unlockCount++;
			}
		});
		if (unlockCount >= unlockKeys.length) {
			unlockElement(elt);
			dome.setElement('locked'); // reset
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
