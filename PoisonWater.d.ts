import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
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
export declare class PoisonWater extends Action {
  protected _city: City;
  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    city: City,
    ruleRegistry?: RuleRegistry
  );
  city(): City;
  forUnit(unit: Unit): Action;
  perform(): void;
}
export default PoisonWater;
