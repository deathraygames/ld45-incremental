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
		this.inventory = {};
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
		this.immigrationRate = 0.1;
	}
	give(what, amount) {
		this.inventory[what] = (this.inventory[what] || 0) + amount;
	}
	consume(what, amount = 1) {
		const quantity = this.inventory[what] || 0;
		if (quantity < amount) { return false; }
		this.inventory[what] = quantity - amount;
		return true;
	}
	consumeCollection(stuff) {
		const keys = Object.keys(stuff);
		let count = 0;
		keys.forEach((key) => {
			const consumed = this.consume(key, stuff[key]);
			count += (consumed) ? 1 : 0;
		});
		return (count >= keys.length);
	}
	build(what, amount = 1) {
		if (this.getFreeSpace() <= 0) { return false; }
		const consumedAll = this.consumeCollection(this.getBuildRequirements(what));
		if (!consumedAll) { return false; }
		this.buildings[what] = (this.buildings[what] || 0) + amount;
		return true;
	}
	getBuildRequirements(what) {
		return this.requirements[what];
	}
	older(t) {
		const pop = this.getPopulationTotal();
		if (this.inventory.food > 0) {
			this.inventory.food -= t * this.eatRate * pop;
		}
		if (this.inventory.food > 100 && this.inventory.food > (pop * 50)) {
			this.immigration(t);
		}
		this.work(t);
	}
	immigration(t) {
		if (this.getPopulationTotal() >= this.getMaxPopulation()) { return false; }
		this.population.hobo += t * this.immigrationRate;
	}
	work(t) {
		const foodEarned = t * ((this.population.forager * 0.5) + (this.population.farmer * 1));
		const woodEarned = t * ((this.population.forager * 0.5));
		const stoneEarned = t * ((this.population.miner * 0.5));
		const oreEarned = t * ((this.population.miner * 0.5));
		this.give('food', foodEarned);
		this.give('wood', woodEarned);
		this.give('stone', stoneEarned);
		this.give('ore', oreEarned);
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
