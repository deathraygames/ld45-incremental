import Inventory from './Inventory.js';
import buildingsData from './buildings-data.js';

console.log(buildingsData);

class Location {
	constructor(name) {
		this.name = name;
		this.inventory = new Inventory();
		this.privateInventory = new Inventory();
		this.space = 1000;
		this.buildings = [];
		this.buildingsData = buildingsData;
		this.population = {
			hobo: 0,
			forager: 0,
			farmer: 0,
			miner: 0,
			monk: 0,
			academic: 0,
		};
		this.eatRate = 0.6;
		this.baseImmigrationRate = 0.1;
		this.immigrationRate = this.baseImmigrationRate;
	}
	build(buildingTypeId, amount = 1) {
		if (this.getFreeSpace() <= 0) { return false; }
		const consumedAll = this.inventory.consumeCollection(this.getBuildRequirements(buildingTypeId));
		if (!consumedAll) { return false; }
		this.buildings[buildingTypeId] = (this.buildings[buildingTypeId] || 0) + amount;
		return true;
	}
	getBuildRequirements(buildingTypeId) {
		return buildingsData[buildingTypeId].cost;
	}
	getBuildDescription(buildingTypeId) {
		const {cost} = buildingsData[buildingTypeId];
		return JSON.stringify(cost)
			.replace(/\./g, ' ')
			.replace(/["{}]/g, '')
			.replace(/,/g, ', ').replace(/:/g, ': ');
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
		const maxWorkers = this.getMaxWorkers(newJob);
		const currentWorkers = this.population[newJob] || 0;
		if (currentWorkers >= maxWorkers) { return false; }
		this.rejobFromTo(oldJob, newJob);
	}
	rejobFromTo(fromJob, toJob) {
		this.population[toJob] += 1;
		this.population[fromJob] -= 1;		
	}
	getMaxWorkers(job) {
		if (job === 'hobo') {
			return this.getFreeSpace() * 10;
		}
		if (job === 'forager') {
			return this.getFreeSpace();
		}
		const potentialWorkPlaces = this.getBuildingTypesByWorkerType(job);
		if (potentialWorkPlaces.length === 0) { return false; }
		const maxWorkers = potentialWorkPlaces.reduce((sum, bt) => {
			const n = this.buildings[bt.index];
			return sum + ((n || 0) * (bt.workers || 0));
		}, 0);
		return maxWorkers;
	}
	getBuildingTypesByWorkerType(workerType) {
		return this.buildingsData.filter((buildingType) => {
			return buildingType.workerType === workerType;
		});
	}
	getPopulationTotal() {
		const keys = Object.keys(this.population);
		const n = keys.reduce((sum, val) => { return sum + this.population[val]; }, 0);
		return Math.floor(n);
	}
	getMaxPopulation() { // aka. housing capacity
		return this.buildings.reduce((sum, n, index) => {
			if (!n) { return sum; }
			const buildingType = this.buildingsData[index];
			return sum + (n * buildingType.housing);
		}, 0);
	}
	getUsedSpace() {
		return this.buildings.reduce((sum, n) => { return sum + (n || 0); }, 0);
	}
	getFreeSpace() {
		return this.space - this.getUsedSpace();
	}
}

export default Location;
