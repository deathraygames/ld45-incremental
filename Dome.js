// D.O.M.E. = document object model elements
class Dome {
	constructor({elementNames, clicks, changes, onReady, document}) {
		this.elements = {};
		this.elementNames = elementNames || [];
		this.clicks = clicks || {};
		this.changes = changes || {};
		this.onReady = onReady || (() => {});
		this.elementNames = this.elementNames.concat(Object.keys(clicks));
		this.doc = (document) ? document : window.document;
		this.doc.addEventListener('DOMContentLoaded', () => { this.setup(); });
	}
	$(selector) {
		return this.doc.querySelectorAll(selector);
	}
	setup() {
		console.log('Setup', this);
		this.setElements(this.elementNames);
		this.setClicks(this.clicks);
		this.setChanges(this.changes);
		this.onReady();
	}
	setElements(names) {
		const nameArr = names || this.elementNames;
		nameArr.forEach((name) => { this.setElement(name); });
	}
	setElement(name) {
		this.elements[name] = this.doc.querySelectorAll('.' + name);
		// console.log('Setting element', name, this.elements[name]);
	}
	setClicks(clicks) {
		const keys = Object.keys(clicks);
		keys.forEach((key) => { this.setClick(key, this.clicks[key]); });
	}
	setClick(key, fn) {
		const elts = this.elements[key];
		if (!elts) { return false; }
		elts.forEach((elt) => {
			elt.onclick = fn;
		});
	}
	setChanges(changes = {}) {
		Object.keys(changes).forEach((key) => { this.setChange(key, this.changes[key]); });
	}
	setChange(key, fn) {
		const elts = this.getElements(key);
		if (!elts) { return false; }
		elts.forEach((elt) => { elt.onchange = fn; });
	}
	getElements(name, tryToFix = true) {
		const elts = this.elements[name];
		if (!elts) {
			console.warn('No elements named', name);
			if (!tryToFix) { return false; }
			this.setElement(name);
			return this.getElements(name, false);

		}
		return elts;
	}
	getElement(name) {
		return this.getElements(name)[0];
	}
	getFocus() {
		return this.doc.activeElement;
	}
	update(data) {
		const keys = Object.keys(data);
		keys.forEach((key) => {
			const elts = this.getElements(key);
			if (!elts) { return; }
			elts.forEach((elt) => {
				if (elt.innerHTML === data[key]) { return; }
				elt.innerHTML = data[key];
			});
		});
	}
	updateElement(name, html) {
		const elt = this.getElement(name);
		if (elt.innerHTML === html) { return; }
		elt.innerHTML = html;
		return elt;
	}
}
export default Dome;
