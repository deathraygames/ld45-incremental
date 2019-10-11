
export default [
	{
		key: 'teeth',
		name: '👅 This food looks edible',
		requires: {
			'leader.inventory.food': 1
		}
	},
	{
		key: 'skills',
		name: '👁 Who am I?',
		requires: {
			'leader.skills.survivalism': 20
		}
	},
	{
		key: 'focus',
		name: '☕️ I can stop and think',
		requires: { 'leader.fullness': 80 }
	},
	{
		key: 'gather-wood',
		name: '🌲 There\'s wood here too',
		requires: {
			'leader.skills.survivalism': 50
		}
	},
	{
		key: 'drop',
		name: '🤲 Why am I carrying all of this?',
		requires: {
			'leader.skills.survivalism': 100
		}
	},
	{
		key: 'axe',
		name: '✊ ...and my axe!',
		requires: {
			'leader.skills.lumbering': 100
		}
	},
	{
		key: 'location',
		name: '🧭 Where am I?',
		requires: {
			'leader.skills.enlightenment': 20
		}
	},
	{
		key: 'pickaxe',
		name: '⛏ Three stone on two sticks',
		requires: {
			'leader.skills.lumbering': 300
		}
	},
	{
		key: 'ore-mining',
		name: '🕯 Shiney bits in the stone',
		requires: {
			'leader.skills.mining': 100
		}
	},
	{
		key: 'time',
		name: '🌒 Sun up, moon up, repeat',
		requires: {	'leader.skills.enlightenment': 50 }
	},
	{
		key: 'science',
		name: '💫 Do this, thing happens...',
		requires: {	'leader.skills.enlightenment': 100 }
	},
	{
		key: 'tent-builder',
		name: '🌿 Sticks together for a roof',
		requires: {	'leader.skills.lumbering': 50, 'leader.skills.science': 20 }
	},
	{
		key: 'hut-builder',
		name: '🔨 Some more wood keeps the rain out',
		requires: {	'leader.skills.building': 20, 'leader.skills.science': 20 }
	},
	{
		key: 'farm-builder',
		name: '🌱 I wonder what happens if I plant this seed',
		requires: {	'leader.skills.building': 10, 'leader.skills.science': 30 }
	},
	{
		key: 'house-builder',
		name: '🛠 I can build a house!',
		requires: {	'leader.skills.building': 100, 'leader.skills.science': 100 }
	},
	{
		key: 'mine-builder',
		name: '💎 Dig deeper',
		requires: {	'leader.skills.building': 200, 'leader.skills.mining': 500 }
	},
	{
		key: 'temple-builder',
		name: '🧿 The Path',
		requires: {	'leader.skills.building': 200, 'leader.skills.enlightenment': 500 }
	},
	{
		key: 'academy-builder',
		name: '⚗️ Together we accumulate knowledge',
		requires: {	'leader.skills.building': 200, 'leader.skills.enlightenment': 500, 'leader.skills.science': 500 }
	},
	{
		key: 'nirvana',
		name: '💮 Nirvana',
		show: {
			'leader.skills.enlightenment': 10000,
			'upgraded-teeth': true
		},
		requires: {
			'leader.skills.enlightenment': 1000000,
			// 'upgraded-teeth': true
		}
	},
	{
		key: 'singularity',
		name: '🤖 Singularity',
		show: {
			'leader.skills.science': 10000,
			'upgraded-teeth': true
		},
		requires: {
			'leader.skills.science': 1000000,
			// 'upgraded-teeth': true
		}
	}
];
