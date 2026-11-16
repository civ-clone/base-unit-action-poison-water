"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoisonWater = void 0;
const escape_1 = require("@civ-clone/base-unit-agent/lib/escape");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Action_1 = require("@civ-clone/core-unit/Action");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const WaterPoisoned_1 = require("./Rules/WaterPoisoned");
const mission_1 = require("@civ-clone/base-unit-agent/lib/mission");
/**
 * A Spy poisons `city()`'s water supply. What that does to the city is up to the `WaterPoisoned` rules (Civ2: the city
 * shrinks by 1, or a size-1 city's food box is emptied).
 *
 * `perform()`, in order:
 * 1. the Spy must survive a caught check (base-unit-agent's `AgentSurvives` with `CAUGHT_CHECK`), or it is destroyed;
 * 2. the `WaterPoisoned` rules;
 * 3. `Moved`, then the Spy is used up unless it survives an `ORDINARY` check (Civ2 escapes ordinarily or hard, on a
 *    coin flip: its rule draws that itself). With no `AgentSurvives` rules, the check passes and the Spy is used up.
 */
class PoisonWater extends Action_1.default {
    constructor(from, to, unit, city, ruleRegistry = RuleRegistry_1.instance) {
        super(from, to, unit, ruleRegistry);
        this._city = city;
    }
    city() {
        return this._city;
    }
    // `Action.forUnit` rebuilds an action from `(from, to, unit, ruleRegistry)`, which would put the `RuleRegistry` where
    // the `City` goes.
    // Typed as `Action`: a subclass with a member of its own isn't assignable to it (civ-clone/web-renderer#21).
    forUnit(unit) {
        return new PoisonWater(this.from(), this.to(), unit, this._city, this.ruleRegistry());
    }
    perform() {
        const unit = this.unit(), mission = this, ruleRegistry = this.ruleRegistry();
        if (!(0, mission_1.agentSurvives)(unit, mission, escape_1.CAUGHT_CHECK, ruleRegistry)) {
            ruleRegistry.process(Moved_1.default, unit, mission);
            unit.destroy();
            return;
        }
        ruleRegistry.process(WaterPoisoned_1.default, unit, this._city, this);
        ruleRegistry.process(Moved_1.default, unit, mission);
        if (!(0, mission_1.agentSurvives)(unit, mission, escape_1.ORDINARY, ruleRegistry)) {
            unit.destroy();
        }
    }
}
exports.PoisonWater = PoisonWater;
exports.default = PoisonWater;
//# sourceMappingURL=PoisonWater.js.map