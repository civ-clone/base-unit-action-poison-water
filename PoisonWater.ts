import { CAUGHT_CHECK, ORDINARY } from '@civ-clone/base-unit-agent/lib/escape';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import WaterPoisoned from './Rules/WaterPoisoned';
import {
  agentSurvives,
  loseAgent,
  missionMode,
} from '@civ-clone/base-unit-agent/lib/mission';

/**
 * A Spy poisons `city()`'s water supply. What that does to the city is up to the `WaterPoisoned` rules (Civ2: the city
 * shrinks by 1, or a size-1 city's food box is emptied).
 *
 * `perform()`, in order:
 * 1. `MissionMode` resolves the escape mode (default `ORDINARY`; Civ2 draws 0 or 1); then the Spy must survive a
 *    caught check (base-unit-agent's `AgentSurvives` with `CAUGHT_CHECK`): one that is caught goes to `AgentLost` and
 *    is destroyed by the city's owner;
 * 2. the `WaterPoisoned` rules;
 * 3. `Moved`, then the Spy is used up (`AgentLost`, then destroyed) unless it survives `AgentSurvives` with the
 *    resolved mode. With no `AgentSurvives` rules, the check passes and the Spy is used up.
 */
export class PoisonWater extends Action {
  protected _city: City;

  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    city: City,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ) {
    super(from, to, unit, ruleRegistry);

    this._city = city;
  }

  city(): City {
    return this._city;
  }

  // `Action.forUnit` rebuilds an action from `(from, to, unit, ruleRegistry)`, which would put the `RuleRegistry` where
  // the `City` goes.
  // Typed as `Action`: a subclass with a member of its own isn't assignable to it (civ-clone/web-renderer#21).
  forUnit(unit: Unit): Action {
    return new PoisonWater(
      this.from(),
      this.to(),
      unit,
      this._city,
      this.ruleRegistry()
    ) as unknown as Action;
  }

  perform(): void {
    const unit = this.unit(),
      mission = this as unknown as Action,
      ruleRegistry = this.ruleRegistry();

    const mode = missionMode(unit, mission, ORDINARY, ruleRegistry);

    if (
      !agentSurvives(unit, mission, CAUGHT_CHECK, ruleRegistry, undefined, mode)
    ) {
      loseAgent(
        unit,
        this._city,
        mission,
        true,
        ruleRegistry,
        this._city.player()
      );

      return;
    }

    ruleRegistry.process(WaterPoisoned, unit, this._city, this);

    ruleRegistry.process(Moved, unit, mission);

    if (!agentSurvives(unit, mission, mode, ruleRegistry)) {
      loseAgent(unit, this._city, mission, false, ruleRegistry);
    }
  }
}

export default PoisonWater;
