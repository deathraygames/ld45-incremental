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
	'donate', 'donate-what', 'take-what', 'build-what', 'build',
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
const clicks = {
	'donate': () => {
		leader.inventory.drop(getDropWhat(), locations[locationIndex], 100);
	},
	'take': () => {
		const location = locations[locationIndex];
		location.inventory.transfer(getTakeWhat(), leader, 100);
	},
	'build': () => {
		build(getBuildWhat());
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
[0,1,2,3,4,5,6].forEach((what) => {
	clicks[`build-${what}`] = function() { build(what); }
});
const changes = {
	'build-what': () => { updateBuildingBuildInfo(); }
};
const dome = new Dome({ elementNames, clicks, changes, onReady: startGame });
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
	updateBuildings();
	loop.begin();
}

function build(buildingTypeId) {
	const loc = locations[locationIndex];
	const reqs = loc.getBuildRequirements(buildingTypeId);
	const canBuild = leader.checkInventory(reqs);
	if (!canBuild) { return false; }
	leader.inventory.dropCollection(reqs, loc);
	const didBuild = loc.build(buildingTypeId);
	if (didBuild) {
		leader.build(buildingTypeId);
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

function getLocation() {
	return locations[locationIndex];
}

function getDropWhat() {
	return getSelection('donate-what', 'food');
}

function getTakeWhat() {
	return getSelection('take-what', 'food');
}

function getBuildWhat() {
	return Number.parseInt(getSelection('build-what', 0));
}

function getSelection(eltName, defaultValue) {
	const selector = dome.getElement(eltName);
	if (!selector[selector.selectedIndex] || !selector[selector.selectedIndex].value) {
		return defaultValue;
	}
	return selector[selector.selectedIndex].value;
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
		updateBuildings();
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

		'tents': getNum(loc.buildings[0]),
		'huts': getNum(loc.buildings[1]),
		'houses': getNum(loc.buildings[2]),
		'farms': getNum(loc.buildings[3]),
		'mines': getNum(loc.buildings[4]),
		'temples': getNum(loc.buildings[5]),
		'academies': getNum(loc.buildings[6]),

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
		const unlockAttr = elt.getAttribute('data-unlock');
		const fixedUnlockAttr = (unlockAttr) ? unlockAttr.replace(/'/g, "\"") : '{}';
		const unlock = (fixedUnlockAttr) ? JSON.parse(fixedUnlockAttr) : {};
		const isUnlocked = checkUnlock(unlock, vm);
		if (!isUnlocked) { return; }
		unlockElement(elt);
		dome.setElement('locked'); // reset
	});
}

function checkUnlock(unlock, vm) {
	let unlockCount = 0;
	const unlockKeys = Object.keys(unlock);
	if (unlockKeys.length === 0) { return; } // no way provided on how to unlock
	unlockKeys.forEach((key) => {
		const isNumber = (typeof unlock[key] === 'number');
		// console.log("comparing", vm[key], unlock[key]);
		if (isNumber && vm[key] >= unlock[key] || vm[key] === unlock[key]) {
			unlockCount++;
		}
	});
	return (unlockCount >= unlockKeys.length);	
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

function updateBuildings() {
	const location = locations[locationIndex];
	const html = location.buildingsData.reduce((str, buildingType) => {
		const vm = getDomeViewModel(location); // TODO: remove
		const isUnlocked = checkUnlock(buildingType.unlock, vm);
		if (!isUnlocked) { return str; }
		return str + `<option value="${buildingType.index}">${buildingType.name} ${buildingType.emoji}</option>`;
	}, '');
	dome.update({'build-what': html});
	updateBuildingBuildInfo();
}

function updateBuildingBuildInfo() {
	const buildingTypeId = getBuildWhat();
	const html = getLocation().getBuildDescription(buildingTypeId);
	dome.update({'build-description': html});
}


if (window) { window.g = game; }
export default game;
