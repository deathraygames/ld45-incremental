
const LOCKED = 0;
const UNLOCKED = 1;
const PURCHASED = 2;

class Upgrader {
	constructor(list = []) {
		this.upgrades = list;
		this.statuses = [];
		this.setup();
		console.log(this.upgrades, this.statuses);
	}
	setup() {
		this.setupUpgrades(this.upgrades);
		this.setupStatuses(this.statuses, this.upgrades);
		// TODO: other things?
	}
	setupUpgrades(upgrades) { // mutates upgrades
		upgrades.forEach((upgrade, i) => {
			upgrade.index = i;
			if (!upgrade.requires) {
				upgrade.requiresKeys = [];
				return;
			}
			const keys = Object.keys(upgrade.requires);
			upgrade.requiresKeys = keys.map((key) => { return key.split('.'); });
		});
	}
	setupStatuses(statuses, upgrades) { // mutates statues
		statuses.length = 0;
		upgrades.forEach((upgrade) => {
			statuses.push((upgrade.unlocked) ? UNLOCKED : LOCKED);
		});
	}
	get(data = {}, pathArray = [], defaultValue = undefined) {
		const pathLen = pathArray.length;
		let result = data;
		for(let i = 0; i < pathLen; i++) {
			const pathKey = pathArray[i];
			result = result[pathKey];
			// console.log('    ', pathKey, result);
			if (result === undefined) {
				return defaultValue;
			}
		}
		return result;
	}
	checkUnlock(data) {
		const unlockData = Object.assign(this.getUpgradedModel(), data);
		this.upgrades.forEach((upgrade, i) => {
			if (!this.isLockedByIndex(i)) { return; }
			if (!upgrade.requires || !upgrade.requiresKeys) { return; }
			if (this.canUpgradeUnlock(upgrade, unlockData)) {
				console.log('Unlocking', upgrade, this);
				this.unlockByIndex(i);
			}
		});
	}
	isUnlockedByIndex(i) {
		return (this.statuses[i] === UNLOCKED);
	}
	isLockedByIndex(i) {
		return (this.statuses[i] === LOCKED);
	}
	isPurchasedByIndex(i) {
		return (this.statuses[i] === PURCHASED);
	}
	unlockByIndex(i) {
		this.statuses[i] = UNLOCKED;
	}
	purchaseByIndex(i) {
		this.statuses[i] = PURCHASED;
	}
	canUpgradeUnlock(upgrade, data) {
		const unlockNum = this.getUpgradeUnlockNum(upgrade, data);
		return (unlockNum >= upgrade.requiresKeys.length);
	}
	getUpgradeUnlockNum(upgrade, data) {
		let unlockNum = 0;
		upgrade.requiresKeys.forEach((keys) => {
			const reqKey = keys.join('.');
			const requiredValue = upgrade.requires[reqKey];
			const isRequiredNumber = (typeof requiredValue === 'number');
			const currentDefault = (isRequiredNumber) ? 0 : undefined;
			const currentValue = this.get(data, keys, currentDefault);
			// console.log('comparing current', currentValue, data, keys, '\nto', requiredValue, upgrade, reqKey);
			if (isRequiredNumber) {
				if (currentValue >= requiredValue) {
					unlockNum++;
				}
			} else if (currentValue === requiredValue) {
				unlockNum++;
			}
		});
		return unlockNum	
	}
	getUnpurchased(limit = 5) {
		let found = 0;
		const arr = [];
		for(let i = 0; i < this.statuses.length; i++) {
			if (!this.isPurchasedByIndex(i)) {
				const upgrade = this.upgrades[i];
				found++;
				arr.push(upgrade);
				if (found >= limit) { return arr; }
			}
		}
		return arr;
	}
	setupUnpurchasedList(dome, eltName, limit) {
		const up = this;
		this.updateUnpurchasedList(dome, eltName, limit);
		dome.setClick(eltName, function (evt) {
			const i = evt.target.getAttribute('data-upgradeindex');
			up.purchaseByIndex(i);
			up.updateUnpurchasedList(dome, eltName, limit);
			console.log('purchased', i);
		});
	}
	updateUnpurchasedList(dome, eltName, limit) {
		const unpurchased = this.getUnpurchased(limit);
		dome.updateElement(eltName, this.getHtmlList(unpurchased));
	}

	getHtmlList(upgrades) {
		let html = '';
		upgrades.forEach((upgrade) => {
			const i = upgrade.index;
			const statusClass = this.getStatusClass(i);
			const locked = this.isLockedByIndex(i);
			const disabled = (!this.canAfford(upgrade) || locked) ? 'disabled' : '';
			const descriptionHtml = (upgrade.description) ? `<dd>${upgrade.description}</dd>` : '';
			const costHtml = (upgrade.cost) ? `<dd>${upgrade.cost}</dd>` : '';
			const unlockTitle = (locked) ? this.getUnlockRequiresCost(upgrade) : '';
			html += (
				`<div class="upgrade">
					<dt>
						<button type="button"
							class="upgrade-${i} ${statusClass}" ${disabled}
							data-upgradeindex="${i}"
							title="${unlockTitle}"
						>${upgrade.name}</button>
					</dt>
					${descriptionHtml}
					${costHtml}
				</div>`
			);
		});
		return html;
	}
	canAfford() {
		return true; // TODO
	}
	getStatusClass(i) {
		const prefix = 'upgrade-status-';
		if (this.isLockedByIndex(i)) {
			return prefix + 'locked';
		}
		if (this.isPurchasedByIndex(i)) {
			return prefix + 'purchased';
		}
		if (this.isUnlockedByIndex(i)) {
			return prefix + 'unlocked';
		}
	}
	getUnlockRequiresCost(upgrade) {
		return 'Unlock with ' + JSON.stringify(upgrade.requires)
			.replace(/\./g, ' ')
			.replace(/["{}]/g, '')
			.replace(',', ', ').replace(':', ': ');
	}
	getClassName(upgrade) {
		return (upgrade.key || upgrade.name).replace(/ /g, '-').toLowerCase();
	}
	getUpgradedModel() {
		const m = {};
		this.upgrades.forEach((upgrade, i) => {
			m['upgraded-' + this.getClassName(upgrade)] = this.isPurchasedByIndex(i);
		});
		return m;
	}
}
export default Upgrader;
