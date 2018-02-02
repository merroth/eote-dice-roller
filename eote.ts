enum EDice {
	boost,
	setback,
	ability,
	difficulty,
	proficiency,
	challenge,
	force,
}
interface IThrow {
	boost?: number,
	setback?: number,
	ability?: number,
	difficulty?: number,
	proficiency?: number,
	challenge?: number,
	force?: number,
}
enum EOutcome {
	success,
	triumph,
	advantage,
	failure,
	despair,
	threat,
	lightside,
	darkside,
}
interface IRoll {
	dice: EDice,
	value: number,
	outcome: EOutcome[]
}
interface IRollCalc {
	result: IRoll[],
	success: number,
	advantage: number,
	triumph: number,
	despair: number,
	force: number
}
function getEnumKeys(obj) {
	return Object.keys(obj)
		.filter((d) => {
			return parseFloat(d).toString() != d
		})
}
class EOTEROLL {
	private rolls: IRoll[]
	static Images = (function () {
		let returner = {};
		[
			'boost', 'setback', 'ability', 'difficulty', 'proficiency', 'challenge', 'force',
			'success', 'triumph', 'advantage', 'failure', 'despair', 'threat', 'lightside', 'darkside'
		]
			.forEach((val) => {
				let img = document.createElement("img")
				img.src = `http://game2.ca/eote/${val}.png`;
				img.title = val[0].toUpperCase() + val.slice(1);
				returner[val] = img.src;
			})
		return returner;
	})()
	static RollDice(dice: EDice) {
		switch (dice) {
			case EDice.boost:
			case EDice.setback: return Math.floor(Math.random() * 6 + 1);
			case EDice.ability:
			case EDice.difficulty: return Math.floor(Math.random() * 8 + 1);
			case EDice.proficiency:
			case EDice.challenge:
			case EDice.force: return Math.floor(Math.random() * 12 + 1);
		}

	}
	static DiceRollToOutcomeLists = {
		boost: [[], [], [EOutcome.success], [EOutcome.success, EOutcome.advantage], [EOutcome.advantage, EOutcome.advantage], [EOutcome.advantage]],
		setback: [[], [], [EOutcome.failure], [EOutcome.failure], [EOutcome.threat], [EOutcome.threat]],
		ability: [[], [EOutcome.success], [EOutcome.success], [EOutcome.success, EOutcome.success], [EOutcome.advantage], [EOutcome.advantage], [EOutcome.advantage, EOutcome.success], [EOutcome.advantage, EOutcome.advantage],],
		difficulty: [[], [EOutcome.failure], [EOutcome.failure, EOutcome.failure], [EOutcome.threat], [EOutcome.threat], [EOutcome.threat], [EOutcome.threat, EOutcome.threat], [EOutcome.threat, EOutcome.failure],],
		proficiency: [[], [EOutcome.success], [EOutcome.success], [EOutcome.success, EOutcome.success], [EOutcome.success, EOutcome.success], [EOutcome.advantage], [EOutcome.advantage, EOutcome.success], [EOutcome.advantage, EOutcome.success], [EOutcome.advantage, EOutcome.success], [EOutcome.advantage, EOutcome.advantage], [EOutcome.advantage, EOutcome.advantage], [EOutcome.triumph],],
		challenge: [[], [EOutcome.failure], [EOutcome.failure], [EOutcome.failure, EOutcome.failure], [EOutcome.failure, EOutcome.failure], [EOutcome.threat], [EOutcome.threat], [EOutcome.threat, EOutcome.failure], [EOutcome.threat, EOutcome.failure], [EOutcome.threat, EOutcome.threat], [EOutcome.threat, EOutcome.threat], [EOutcome.despair]],
		force: [[EOutcome.darkside], [EOutcome.darkside], [EOutcome.darkside], [EOutcome.darkside], [EOutcome.darkside], [EOutcome.darkside], [EOutcome.darkside, EOutcome.darkside], [EOutcome.lightside], [EOutcome.lightside], [EOutcome.lightside, EOutcome.lightside], [EOutcome.lightside, EOutcome.lightside], [EOutcome.lightside, EOutcome.lightside],],
	}
	static DiceRollToOutcome(dice: EDice, value: number) {
		return this.DiceRollToOutcomeLists[EDice[dice]][value - 1];
	}
	constructor() {
		this.roll()
	}
	public roll() {
		this.rolls = [];
		getEnumKeys(EDice)
			.forEach(diceKey => {
				while (
					this.rolls.filter((r) => {
						return r.dice == EDice[diceKey]
					}).length < 10
				) {
					let r: IRoll = {
						dice: EDice[diceKey],
						value: EOTEROLL.RollDice(EDice[diceKey]),
						outcome: [],
					}
					r.outcome = EOTEROLL.DiceRollToOutcome(EDice[diceKey], r.value)
					this.rolls.push(r);
				}
			})

		return this;
	}
	public calculate(throws: IThrow = {}): IRollCalc {
		var result: IRoll[] = []
		for (let key in throws) {
			if (throws.hasOwnProperty(key)) {
				let t = throws[key];
				let list = this.rolls.filter((r) => { return r.dice == EDice[key] });
				if (list.length > 0) {
					result = [].concat(result, list.slice(0, t))
				}
			}
		}
		var success = 0;
		var advantage = 0;
		var triumph = 0;
		var despair = 0;
		var force = 0;

		for (let r = 0; r < result.length; r++) {
			let row = result[r];
			for (let o = 0; o < row.outcome.length; o++) {
				let outcome = row.outcome[o];
				switch (outcome) {
					case EOutcome.advantage: advantage++; break;
					case EOutcome.threat: advantage--; break;
					case EOutcome.triumph: triumph++;
					case EOutcome.success: success++; break;
					case EOutcome.despair: despair++;
					case EOutcome.failure: success--; break;
					case EOutcome.lightside: force++; break;
					case EOutcome.darkside: force--; break;
				}
			}
		}

		return {
			result: result,
			success: success,
			advantage: advantage,
			triumph: triumph,
			despair: despair,
			force: force
		}
	}
	private _container: HTMLDivElement

	public DOM() {
		var self = this;
		if (this._container !== void 0) {
			if (this._container.parentNode !== null && this._container.parentNode !== void 0) {
				this._container.parentNode.removeChild(this._container);
			}
			return this._container;
		}

		var thrower: IThrow = {};

		var container = document.createElement("div");
		var output = document.createElement("p");
		output.style.backgroundColor = "gray"
		output.style.padding = "20px"


		function rollToHTML() {
			var roll: IRollCalc = self.calculate(thrower);


			var html = '';

			output.title = `${Math.abs(roll.success)} ${roll.success >= 0 ? 'successes' : 'failures'}` +
				"\n" +
				`${Math.abs(roll.advantage)} ${roll.advantage >= 0 ? 'advantages' : 'threats'}` +
				"\n" +
				`${Math.abs(roll.triumph)} triumphs` +
				"\n" +
				`${Math.abs(roll.despair)} despairs` +
				"\n" +
				`${roll.result
					.map((row) => {
						return row.outcome
							.filter((d) => {
								return d == EOutcome.darkside
							}).length
					})
					.reduce((p, c) => {
						return p + c;
					}, 0)} darkside` +
				"\n" +
				`${roll.result
					.map((row) => {
						return row.outcome
							.filter((d) => {
								return d == EOutcome.lightside
							}).length
					})
					.reduce((p, c) => {
						return p + c;
					}, 0)} lightside`


			var success = Math.abs(roll.success)
			var advantage = Math.abs(roll.advantage)

			for (let diceIndex = 0; diceIndex < roll.result.length; diceIndex++) {
				let dice = roll.result[diceIndex];
				for (let o = 0; o < dice.outcome.length; o++) {
					let outcome = dice.outcome[o];
					let img = `<img src="${EOTEROLL.Images[EOutcome[outcome]]}" title="${EOutcome[outcome]}" `

					switch (outcome) {
						case EOutcome.advantage:
							if (advantage > 0 && roll.advantage > 0) { advantage--; } else { img += ` style="opacity: 0.1;"` }
							break;
						case EOutcome.threat:
							if (advantage > 0 && roll.advantage < 0) { advantage--; } else { img += ` style="opacity: 0.1;"` }
							break;

						case EOutcome.success:
							if (success > 0 && roll.success > 0) { success--; } else { img += ` style="opacity: 0.1;"` }
							break;
						case EOutcome.failure:
							if (success > 0 && roll.success < 0) { success--; } else { img += ` style="opacity: 0.1;"` }
							break;
					}

					html += img + ' />';
				}
			}

			output.innerHTML = html;
		}

		['proficiency', 'ability', 'boost', 'challenge', 'difficulty', 'setback', 'force']
			.forEach((val, i) => {
				let buttonField = container.appendChild(document.createElement("label"))
				buttonField.appendChild(document.createElement("img")).src = EOTEROLL.Images[val];

				let input = buttonField.appendChild(document.createElement("input"));
				input.value = "";
				input.type = "number";
				input.min = "0";
				input.step = "1";
				input.name = val;
				buttonField.title = input.placeholder = input.title = val[0].toUpperCase() + val.slice(1);
				thrower[val] = 0

				input.onchange = input.onkeyup = function () {
					let v = parseFloat(input.value)
					thrower[val] = isNaN(v) ? 0 : v;

					rollToHTML();

				}.bind(this)

			})
		let buttonField = container.appendChild(document.createElement("label"))
		let rollBtn = buttonField.appendChild(document.createElement("button"));
		rollBtn.textContent = rollBtn.title = "ROLL"
		rollBtn.onclick = () => {
			self.roll();
			rollToHTML()
		}

		container.appendChild(output)

		this._container = container;
		return this._container;
	}
}

//TEST
var roll = new EOTEROLL()

document.body.appendChild(roll.DOM());

