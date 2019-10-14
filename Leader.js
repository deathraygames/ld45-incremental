import Inventory from './Inventory.js';

class Leader {
	constructor() {
		this.name = 'You';
		// this.hand1 = null;
		// this.hand2 = null;
		this.age = 18;
		this.ageRate = 1/100;
		this.fullness = 50;
		this.fullnessRate = -0.5;
		this.inventory = new Inventory();
		this.eating = false;
		this.skills = {
			building: 0,
			enlightenment: 0,
			farming: 0,
			lumbering: 0,
			mining: 0,
			science: 0,
			survivalism: 0,
		};
		this.base = (window.location.hostname === '127.0.0.1') ? 40 : 2; // TODO: reduce to 1 for harder difficulty
	}
	older(t) {
		this.age += (this.ageRate * t);
		if (this.fullness < 30) {
			this.eating = true;
		}
		if (this.inventory.food >= 1 && this.eating) {
			this.inventory.food -= 1;
			this.fullness += 1;
			if (this.fullness >= 100) {
				this.fullness = 100;
				this.eating = false;
			}
		} else {
			this.fullness += (this.fullnessRate * t);
			if (this.fullness < 0) { this.fullness = 0; }
			this.eating = false;
		}
	}
	eat() {
		this.eating = true;
	}
	meditate() {
		this.skills.enlightenment += this.base;
	}
	experiment() {
		this.skills.science += this.base;
	}
	forage() {
		this.inventory.give('food', this.base);
		this.skills.survivalism += this.base;
	}
	farm() {
		this.inventory.give('food', 2 * this.base);
		this.skills.farming += this.base;
	}
	gatherWood() {
		this.inventory.give('wood', this.base);
		this.skills.lumbering += this.base;
	}
	chopWood() {
		this.inventory.give('wood', 2 * this.base);
		this.skills.lumbering += this.base;
	}
	mineStone() {
		this.inventory.give('stone', this.base);
		this.skills.mining += this.base;
	}
	mineOre() {
		this.inventory.give('ore', this.base);
		this.skills.mining += this.base;
	}
	build(what) {
		this.skills.building += this.base;
	}
	checkInventory(stuff) {
		return this.inventory.check(stuff);
	}
	getInventoryTotal() {
		return this.inventory.getTotal();
	}
}

export default Leader;
