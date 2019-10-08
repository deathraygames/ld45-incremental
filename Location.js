class Location {
	constructor(name) {
		this.name = name;
		this.inventory = {};
		this.space = 100;
		this.requirements = {
			tent: {wood: 100},
			hut: {wood: 500},
			house: {wood: 600, stone: 100},
			farm: {food: 50, wood: 100} 
		};
		this.buildings = {};
		this.capacities = {
			tent: 1,
			hut: 2,
			house: 4,
			farm: 4,
		};
		this.population = {
			hobo: 0,
			forager: 0,
			farmer: 0,
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
		this.population.hobo += t * this.immigrationRate;
	}
	work(t) {
		const foodEarned = t * ((this.population.forager * 0.5) + (this.population.farmer * 1));
		const woodEarned = t * ((this.population.forager * 0.5));
		this.give('food', foodEarned);
		this.give('wood', woodEarned);
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
		if (newJob === 'farmer' && this.population.farmer >= this.capacities.farm * this.buildings.farm) {
			return false;
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
}

export default Location;
