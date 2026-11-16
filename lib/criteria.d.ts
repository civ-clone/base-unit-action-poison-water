import City from '@civ-clone/core-city/City';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * The criteria for poisoning the water of the city on `to`, in order: a neighbouring tile, moves left, a city of
 * another player on `to`, and `canPoison(unit, city)` (Civ2: a Spy, and a city above size 1 unless a computer's Spy
 * chooses it). A rule set adds its own peace criteria after these.
 */
export declare const poisonWaterCriteria: (
  {
    cityRegistry,
  }: {
    cityRegistry: CityRegistry;
  },
  canPoison: (unit: Unit, city: City) => boolean
) => Criterion[];
export default poisonWaterCriteria;
