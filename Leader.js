class Leader {
	constructor() {
		this.name = 'You';
		this.hand1 = {};
		this.hand2 = {};
		this.age = 18;
		this.ageRate = 1/100;
		this.fullness = 50;
		this.fullnessRate = -1;
		this.inventory = {};
		this.eating = false;
		this.skills = {
			building: 0,
			enlightenment: 0,
			lumbering: 0,
			mining: 0,
			science: 0,
			survivalism: 0,
		};
	}
	// isHandFree(n) {
	// 	const handKeys = Object.keys(this[`hand${n}`]);
	// 	return (handKeys.length === 0);
	// }
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
		this.skills.enlightenment += 10;
	}
	experiment() {
		this.skills.science += 10;
	}
	forage() {
		// let hand;
		// if (this.isHandFree(1) || typeof this.hand1.food === 'number') {
		// 	hand = this.hand1;
		// } else if (this.isHandFree(1) || typeof this.hand1.food === 'number') {
		// 	hand = this.hand2;
		// }
		// if (!hand) { return false; }
		// hand.food = (hand.food || 0) + 1;
		this.give('food', 55);
		this.skills.survivalism += 55;
	}
	gatherWood() {
		this.give('wood', 55);
		this.skills.lumbering += 55;
	}
	chopWood() {
		this.give('wood', 2);
		this.skills.lumbering += 55;
	}
	mineStone() {
		this.give('stone', 55);
		this.skills.mining += 55;
	}
	mineOre() {
		this.give('ore', 55);
		this.skills.mining += 55;
	}
	build(what) {
		this.skills.building += 1;
	}
	give(what, amount) {
		this.inventory[what] = (this.inventory[what] || 0) + amount;
	}
	drop(what, where, maxAmount = 100) {
		if (this.inventory[what] <= 0) { return false; }
		const amount = Math.min(maxAmount, this.inventory[what]);
		where.give(what, amount);
		this.inventory[what] -= amount;
	}
	dropCollection(stuff, where) {
		const keys = Object.keys(stuff);
		keys.forEach((key) => {
			this.drop(key, where, stuff[key]);
		});
	}
	checkInventory(stuff) {
		let count = 0;
		const keys = Object.keys(stuff);
		keys.forEach((key) => {
			if (this.inventory[key] >= stuff[key]) {
				count++;
			}
		});
		return (count >= keys.length);
	}
	getInventoryTotal() {
		const keys = Object.keys(this.inventory);
		return keys.reduce((sum, val) => { return sum + this.inventory[val]; }, 0);
	}
}

export default Leader;