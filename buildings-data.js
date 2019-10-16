
const baseBuilding = {	
	name: '',
	emoji: '',
	cost: {},
	input: {},
	output: {},
	housing: 0,
	workers: 0,
	workerType: null,
	unlock: {},
};

const data = [
	{
		name: 'Tent',
		emoji: '🏕',
		cost: {wood: 60},
		housing: 1,
		workers: 0,
		unlock: {'upgraded-tent-builder': true},
	},
	{
		name: 'Hut',
		emoji: '🧱',
		cost: {wood: 120},
		housing: 2,
		unlock: {'upgraded-hut-builder': true},
	},
	{
		name: 'House',
		emoji: '🏠',
		cost: {wood: 200, stone: 100},
		housing: 4,
		unlock: {'upgraded-house-builder': true},
	},
	{
		name: 'Farm',
		emoji: '🌱',
		cost: {food: 50, wood: 100},
		workers: 4,
		workerType: 'farmer',
		output: {food: 1},
		unlock: {'upgraded-farm-builder': true},
	},
	{
		name: 'Mine',
		emoji: '⛰🕳⛏',
		cost: {wood: 500, stone: 500},
		workers: 5,
		workerType: 'miner',
		output: {stone: 0.5, ore: 0.5},
		unlock: {'upgraded-mine-builder': true},
	},
	{
		name: 'Temple',
		emoji: '⛩',
		cost: {wood: 100, stone: 1000, ore: 500},
		workers: 5,
		workerType: 'monk',
		unlock: {'upgraded-temple-builder': true},
	},
	{
		name: 'Academy',
		emoji: '🏫',
		cost: {wood: 1000, stone: 1000, ore: 1000},
		workers: 5,
		workerType: 'academic',
		unlock: {'upgraded-academy-builder': true},
	}
];

export default data.map((building, index) => {
	return Object.assign({ index }, baseBuilding, building);
});
