import {
  hasMovesLeft,
  isNeighbouringTile,
} from '@civ-clone/core-unit/Rules/Action';
import City from '@civ-clone/core-city/City';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * The criteria for poisoning the water of the city on `to`, in order: a neighbouring tile, moves left, a city of
 * another player on `to`, and `canPoison(unit, city)` (Civ2: a Spy, and a city above size 1 unless a computer's Spy
 * chooses it). A rule set adds its own peace criteria after these.
 */
export const poisonWaterCriteria = (
  { cityRegistry }: { cityRegistry: CityRegistry },
  canPoison: (unit: Unit, city: City) => boolean
): Criterion[] => [
  isNeighbouringTile,
  hasMovesLeft,
  new Criterion((unit: Unit, to: Tile): boolean => {
    const city = cityRegistry.getByTile(to);

    return city !== null && city.player() !== unit.player();
  }),
  new Criterion((unit: Unit, to: Tile): boolean =>
    canPoison(unit, cityRegistry.getByTile(to) as City)
  ),
];

export default poisonWaterCriteria;
