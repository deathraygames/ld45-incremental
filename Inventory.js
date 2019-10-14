class Inventory {
	constructor() {
		this._keys = [];
	}
	addKey(key) {
		if (this._keys.indexOf(key) > -1) { return; }
		this._keys.push(key);
	}
	give(what, amount) {
		this.addKey(what);
		this[what] = (this[what] || 0) + amount;
	}
	consume(what, amount = 1) {
		const quantity = this[what] || 0;
		if (quantity < amount) { return false; }
		this[what] = quantity - amount;
		return true;
	}
	consumeCollection(stuff = {}) {
		const keys = Object.keys(stuff);
		let count = 0;
		keys.forEach((key) => {
			const consumed = this.consume(key, stuff[key]);
			count += (consumed) ? 1 : 0;
		});
		return (count >= keys.length);
	}
	transfer(what, where, amount) {
		return this.drop(what, where, amount);
	}
	drop(what, where, maxAmount = 100) {
		if (this[what] <= 0) { return false; }
		const amount = Math.min(maxAmount, this[what]);
		if (where.give) {
			where.give(what, amount);
		} else if (where.inventory) {
			where.inventory.give(what, amount);
		} else {
			console.warning('Cannot give to', where);
			return false;
		}
		this[what] -= amount;
	}
	dropCollection(stuff, where) {
		const keys = Object.keys(stuff);
		keys.forEach((key) => {
			this.drop(key, where, stuff[key]);
		});
	}
	check(stuff = {}) {
		let count = 0;
		const keys = Object.keys(stuff);
		keys.forEach((key) => {
			if (this[key] >= stuff[key]) {
				count++;
			}
		});
		return (count >= keys.length);
	}
	getTotal() {
		return this._keys.reduce((sum, val) => { return sum + this[val]; }, 0);
	}
}

export default Inventory;
