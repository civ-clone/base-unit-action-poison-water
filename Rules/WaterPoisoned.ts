import City from '@civ-clone/core-city/City';
import type PoisonWater from '../PoisonWater';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '@civ-clone/core-unit/Unit';

/** Processed when a Spy (`Unit`) poisons `City`'s water supply, by the `PoisonWater` action: what that does is the rule set's. */
export class WaterPoisoned extends Rule<[Unit, City, PoisonWater], void> {}

export default WaterPoisoned;
