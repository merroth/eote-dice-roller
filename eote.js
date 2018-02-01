var EDice;
(function (EDice) {
    EDice[EDice["boost"] = 0] = "boost";
    EDice[EDice["setback"] = 1] = "setback";
    EDice[EDice["ability"] = 2] = "ability";
    EDice[EDice["difficulty"] = 3] = "difficulty";
    EDice[EDice["proficiency"] = 4] = "proficiency";
    EDice[EDice["challenge"] = 5] = "challenge";
    EDice[EDice["force"] = 6] = "force";
})(EDice || (EDice = {}));
var EOutcome;
(function (EOutcome) {
    EOutcome[EOutcome["success"] = 0] = "success";
    EOutcome[EOutcome["triumph"] = 1] = "triumph";
    EOutcome[EOutcome["advantage"] = 2] = "advantage";
    EOutcome[EOutcome["failure"] = 3] = "failure";
    EOutcome[EOutcome["despair"] = 4] = "despair";
    EOutcome[EOutcome["threat"] = 5] = "threat";
    EOutcome[EOutcome["lightside"] = 6] = "lightside";
    EOutcome[EOutcome["darkside"] = 7] = "darkside";
})(EOutcome || (EOutcome = {}));
function getEnumKeys(obj) {
    return Object.keys(obj)
        .filter(function (d) {
        return parseFloat(d).toString() != d;
    });
}
var EOTEROLL = /** @class */ (function () {
    function EOTEROLL() {
        this.roll();
    }
    EOTEROLL.RollDice = function (dice) {
        switch (dice) {
            case EDice.boost:
            case EDice.setback: return Math.floor(Math.random() * 6 + 1);
            case EDice.ability:
            case EDice.difficulty: return Math.floor(Math.random() * 8 + 1);
            case EDice.proficiency:
            case EDice.challenge:
            case EDice.force: return Math.floor(Math.random() * 12 + 1);
        }
    };
    EOTEROLL.DiceRollToOutcome = function (dice, value) {
        switch (dice) {
            case EDice.boost: return [[], [], [EOutcome.success], [EOutcome.success, EOutcome.advantage], [EOutcome.advantage, EOutcome.advantage], [EOutcome.advantage]][value - 1];
            case EDice.setback: return [[], [], [EOutcome.failure], [EOutcome.failure], [EOutcome.threat], [EOutcome.threat]][value - 1];
            case EDice.ability: return [[], [EOutcome.success], [EOutcome.success], [EOutcome.success, EOutcome.success], [EOutcome.advantage], [EOutcome.advantage], [EOutcome.advantage, EOutcome.success], [EOutcome.advantage, EOutcome.advantage],][value - 1];
            case EDice.difficulty: return [[], [EOutcome.failure], [EOutcome.failure, EOutcome.failure], [EOutcome.threat], [EOutcome.threat], [EOutcome.threat], [EOutcome.threat, EOutcome.threat], [EOutcome.threat, EOutcome.failure],][value - 1];
            case EDice.proficiency: return [[], [EOutcome.success], [EOutcome.success], [EOutcome.success, EOutcome.success], [EOutcome.success, EOutcome.success], [EOutcome.advantage], [EOutcome.advantage, EOutcome.success], [EOutcome.advantage, EOutcome.success], [EOutcome.advantage, EOutcome.success], [EOutcome.advantage, EOutcome.advantage], [EOutcome.advantage, EOutcome.advantage], [EOutcome.triumph],][value - 1];
            case EDice.challenge: return [[], [EOutcome.failure], [EOutcome.failure], [EOutcome.failure, EOutcome.failure], [EOutcome.failure, EOutcome.failure], [EOutcome.threat], [EOutcome.threat], [EOutcome.threat, EOutcome.failure], [EOutcome.threat, EOutcome.failure], [EOutcome.threat, EOutcome.threat], [EOutcome.threat, EOutcome.threat], [EOutcome.despair]][value - 1];
            case EDice.force: return [[EOutcome.darkside], [EOutcome.darkside], [EOutcome.darkside], [EOutcome.darkside], [EOutcome.darkside], [EOutcome.darkside], [EOutcome.darkside, EOutcome.darkside], [EOutcome.lightside], [EOutcome.lightside], [EOutcome.lightside, EOutcome.lightside], [EOutcome.lightside, EOutcome.lightside], [EOutcome.lightside, EOutcome.lightside],][value - 1];
        }
    };
    EOTEROLL.prototype.roll = function () {
        var _this = this;
        this.rolls = [];
        getEnumKeys(EDice)
            .forEach(function (diceKey) {
            while (_this.rolls.filter(function (r) {
                return r.dice == EDice[diceKey];
            }).length < 1000) {
                var r = {
                    dice: EDice[diceKey],
                    value: EOTEROLL.RollDice(EDice[diceKey]),
                    outcome: []
                };
                r.outcome = EOTEROLL.DiceRollToOutcome(EDice[diceKey], r.value);
                _this.rolls.push(r);
            }
        });
        return this;
    };
    EOTEROLL.prototype.calculate = function (throws) {
        if (throws === void 0) { throws = {}; }
        var result = [];
        var _loop_1 = function (key) {
            if (throws.hasOwnProperty(key)) {
                var t = throws[key];
                var list = this_1.rolls.filter(function (r) { return r.dice == EDice[key]; });
                if (list.length > 0) {
                    result = [].concat(result, list.slice(0, t));
                }
            }
        };
        var this_1 = this;
        for (var key in throws) {
            _loop_1(key);
        }
        var success = 0;
        var advantage = 0;
        var triumph = 0;
        var despair = 0;
        var force = 0;
        for (var r = 0; r < result.length; r++) {
            var row = result[r];
            for (var o = 0; o < row.outcome.length; o++) {
                var outcome = row.outcome[o];
                switch (outcome) {
                    case EOutcome.advantage:
                        advantage++;
                        break;
                    case EOutcome.threat:
                        advantage--;
                        break;
                    case EOutcome.triumph: triumph++;
                    case EOutcome.success:
                        success++;
                        break;
                    case EOutcome.despair: despair++;
                    case EOutcome.failure:
                        success--;
                        break;
                    case EOutcome.lightside:
                        force++;
                        break;
                    case EOutcome.darkside:
                        force--;
                        break;
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
        };
    };
    EOTEROLL.prototype.DOM = function () {
        var _this = this;
        var self = this;
        if (this._container !== void 0) {
            if (this._container.parentNode !== null && this._container.parentNode !== void 0) {
                this._container.parentNode.removeChild(this._container);
            }
            return this._container;
        }
        var thrower = {};
        var container = document.createElement("div");
        var output = document.createElement("p");
        output.style.backgroundColor = "gray";
        output.style.padding = "20px";
        function rollToHTML() {
            var roll = self.calculate(thrower);
            output.innerHTML = '';
            output.title = Math.abs(roll.success) + " " + (roll.success >= 0 ? 'successes' : 'failures') +
                "\n" +
                (Math.abs(roll.advantage) + " " + (roll.advantage >= 0 ? 'advantages' : 'threats')) +
                "\n" +
                (Math.abs(roll.triumph) + " triumphs") +
                "\n" +
                (Math.abs(roll.despair) + " despairs") +
                "\n" +
                (roll.result
                    .map(function (row) {
                    return row.outcome
                        .filter(function (d) {
                        return d == EOutcome.darkside;
                    }).length;
                })
                    .reduce(function (p, c) {
                    return p + c;
                }, 0) + " darkside") +
                "\n" +
                (roll.result
                    .map(function (row) {
                    return row.outcome
                        .filter(function (d) {
                        return d == EOutcome.lightside;
                    }).length;
                })
                    .reduce(function (p, c) {
                    return p + c;
                }, 0) + " lightside");
            var success = Math.abs(roll.success);
            var advantage = Math.abs(roll.advantage);
            for (var diceIndex = 0; diceIndex < roll.result.length; diceIndex++) {
                var dice = roll.result[diceIndex];
                for (var o = 0; o < dice.outcome.length; o++) {
                    var outcome = dice.outcome[o];
                    var img = output.appendChild(EOTEROLL.Images[EOutcome[outcome]].cloneNode(true));
                    switch (outcome) {
                        case EOutcome.advantage:
                            if (advantage > 0 && roll.advantage > 0) {
                                advantage--;
                            }
                            else {
                                img.style.opacity = "0.1";
                            }
                            break;
                        case EOutcome.threat:
                            if (advantage > 0 && roll.advantage < 0) {
                                advantage--;
                            }
                            else {
                                img.style.opacity = "0.1";
                            }
                            break;
                        case EOutcome.success:
                            if (success > 0 && roll.success > 0) {
                                success--;
                            }
                            else {
                                img.style.opacity = "0.1";
                            }
                            break;
                        case EOutcome.failure:
                            if (success > 0 && roll.success < 0) {
                                success--;
                            }
                            else {
                                img.style.opacity = "0.1";
                            }
                            break;
                    }
                }
            }
        }
        ['proficiency', 'ability', 'boost', 'challenge', 'difficulty', 'setback', 'force']
            .forEach(function (val, i) {
            var buttonField = container.appendChild(document.createElement("label"));
            buttonField.appendChild(EOTEROLL.Images[val].cloneNode());
            var input = buttonField.appendChild(document.createElement("input"));
            input.value = "";
            input.type = "number";
            input.min = "0";
            input.step = "1";
            buttonField.title = input.placeholder = input.title = val[0].toUpperCase() + val.slice(1);
            thrower[val] = 0;
            input.onchange = input.onkeyup = function () {
                var v = parseFloat(input.value);
                thrower[val] = isNaN(v) ? 0 : v;
                rollToHTML();
            }.bind(_this);
        });
        var buttonField = container.appendChild(document.createElement("label"));
        var rollBtn = buttonField.appendChild(document.createElement("button"));
        rollBtn.textContent = rollBtn.title = "ROLL";
        rollBtn.onclick = function () { self.roll(); rollToHTML(); };
        container.appendChild(output);
        this._container = container;
        return this._container;
    };
    EOTEROLL.Images = (function () {
        var returner = {};
        [
            'boost', 'setback', 'ability', 'difficulty', 'proficiency', 'challenge', 'force',
            'success', 'triumph', 'advantage', 'failure', 'despair', 'threat', 'lightside', 'darkside'
        ]
            .forEach(function (val) {
            var img = document.createElement("img");
            img.src = "http://game2.ca/eote/" + val + ".png";
            img.title = val[0].toUpperCase() + val.slice(1);
            returner[val] = img;
        });
        return returner;
    })();
    return EOTEROLL;
}());
//TEST
var roll = new EOTEROLL();
document.body.appendChild(roll.DOM());
