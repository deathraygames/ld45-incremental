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
		this.population = {
			hobo: 0
		};
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
		if (this.inventory.food > 0) {
			this.inventory.food -= t * this.getPopulationTotal();
		}
		if (this.inventory.food > 100) {
			this.immigration(t);
		}
	}
	immigration(t) {
		this.population.hobo += (t / 10);
	}
	getPopulationTotal() {
		const keys = Object.keys(this.population);
		const n = keys.reduce((sum, val) => { return sum + this.population[val]; }, 0);
		return Math.floor(n);
	}
}

export default Location;
