
export default [
	{
		key: 'teeth',
		name: 'This food looks edible',
		requires: {
			'leader.inventory.food': 1
		}
	},
	{
		key: 'location',
		name: 'Where am I?',
		requires: {
			'leader.skills.enlightenment': 20
		}
	},
	{
		key: 'nirvana',
		name: 'Nirvana',
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
		name: 'Singularity',
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
