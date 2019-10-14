import Inventory from "./Inventory.js";

// const buildingData = [
// 	{
// 		key: '',
// 		requires: {},
// 		capacity: 0,
// 		worker: ''
// 	}
// ];

class Location {
	constructor(name) {
		this.name = name;
		this.inventory = new Inventory();
		this.privateInventory = new Inventory();
		this.space = 1000;
		this.requirements = {
			tent: {wood: 60},
			hut: {wood: 100},
			house: {wood: 200, stone: 100},
			farm: {food: 50, wood: 100},
			mine: {wood: 500, stone: 500},
			temple: {wood: 100, stone: 1000, ore: 500},
			academy: {wood: 1000, stone: 1000, ore: 1000},
		};
		this.buildings = {};
		this.capacities = {
			tent: 1,
			hut: 2,
			house: 4,
			farm: 4,
			mine: 5,
			temple: 5,
			academy: 5,
		};
		this.population = {
			hobo: 0,
			forager: 0,
			farmer: 0,
			miner: 0,
			monk: 0,
			academic: 0,
		};
		this.jobBuildingMapping = {
			hobo: null,
			forager: null,
			farmer: 'farm',
			miner: 'mine',
			monk: 'temple',
			academic: 'academy',
		};
		this.eatRate = 0.6;
		this.baseImmigrationRate = 0.1;
		this.immigrationRate = this.baseImmigrationRate;
	}
	build(what, amount = 1) {
		if (this.getFreeSpace() <= 0) { return false; }
		const consumedAll = this.inventory.consumeCollection(this.getBuildRequirements(what));
		if (!consumedAll) { return false; }
		this.buildings[what] = (this.buildings[what] || 0) + amount;
		return true;
	}
	getBuildRequirements(what) {
		return this.requirements[what];
	}
	older(t) {
		const pop = this.getPopulationTotal();
		let foodWanted =  t * this.eatRate * pop;
		if (this.privateInventory.food > 0) {
			const privateFoodEaten = Math.min(this.privateInventory.food, foodWanted);
			this.privateInventory.consume('food', privateFoodEaten);
			foodWanted -= privateFoodEaten;
		}
		if (this.inventory.food > 0) {
			const communityFoodEaten = Math.min(this.inventory.food, foodWanted);
			this.inventory.consume('food', communityFoodEaten);
			foodWanted -= communityFoodEaten;
		}
		// TODO: if food wanted is still positive then starvation
		this.immigration(t, pop);
		this.work(t);
	}
	getImmigrationRate(pop = this.getPopulationTotal()) {
		if (this.inventory.food < 100 || this.inventory.food < (pop * 50)) {
			return 0;
		}
		if (pop >= this.getMaxPopulation()) {
			return 0;
		}
		return this.baseImmigrationRate;
	}
	immigration(t, pop) {
		this.immigrationRate = this.getImmigrationRate(pop);
		this.population.hobo += t * this.immigrationRate;
	}
	getResourceRates(t) {
		const rates = {
			food: t * ((this.population.forager * 0.5) + (this.population.farmer * 1)),
			wood: t * ((this.population.forager * 0.5)),
			stone: t * ((this.population.miner * 0.5)),
			ore: t * ((this.population.miner * 0.5)),
		};
		return rates;
	}
	getTaxRate() {
		return 0.1;
	}
	work(t) {
		const rates = this.getResourceRates(t);
		const tax = this.getTaxRate();
		const privateMultiplier = 1 - tax;
		this.privateInventory.give('food', rates.food * privateMultiplier);
		this.privateInventory.give('wood', rates.wood * privateMultiplier);
		this.privateInventory.give('stone', rates.stone * privateMultiplier);
		this.privateInventory.give('ore', rates.ore * privateMultiplier);
		this.inventory.give('food', rates.food * tax);
		this.inventory.give('wood', rates.wood * tax);
		this.inventory.give('stone', rates.stone * tax);
		this.inventory.give('ore', rates.ore * tax);
	}
	getRandomJob() {
		const jobs = Object.keys(this.population);
		const i = Math.ceil(Math.random() * jobs.length) - 1;
		return jobs[i];
	}
	rejob() {
		let oldJob;
		if (this.population.hobo >= 1) {
			oldJob = 'hobo';
		} else {
			oldJob = this.getRandomJob();
			if (this.population[oldJob] < 1) { oldJob = null; }
		}
		if (!oldJob) { return false; }

		const newJob = this.getRandomJob();
		const workBuilding = this.jobBuildingMapping[newJob];
		if (workBuilding) {
			const maxWorkers = (this.capacities[workBuilding] || 0) * (this.buildings[workBuilding] || 0);
			// console.log(workBuilding, maxWorkers);
			if (this.population[newJob] >= maxWorkers) { return false; }
		}
		this.rejobFromTo(oldJob, newJob);
	}
	rejobFromTo(fromJob, toJob) {
		this.population[toJob] += 1;
		this.population[fromJob] -= 1;		
	}
	getPopulationTotal() {
		const keys = Object.keys(this.population);
		const n = keys.reduce((sum, val) => { return sum + this.population[val]; }, 0);
		return Math.floor(n);
	}
	getMaxPopulation() {
		let housingCapacity = 0;
		const buildingsKeys = Object.keys(this.buildings);
		buildingsKeys.forEach((key) => {
			housingCapacity += (this.buildings[key] * this.capacities[key]);
		});
		return housingCapacity;
	}
	getUsedSpace() {
		const buildingsKeys = Object.keys(this.buildings);
		return buildingsKeys.reduce((acc, key) => { return acc + (this.buildings[key] || 0); }, 0);
	}
	getFreeSpace() {
		return this.space - this.getUsedSpace();
	}
}

export default Location;
