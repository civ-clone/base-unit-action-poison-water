import AgentSurvives from '@civ-clone/base-unit-agent/Rules/AgentSurvives';
import City from '@civ-clone/core-city/City';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';
import { EscapeMode } from '@civ-clone/base-unit-agent/lib/escape';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Player from '@civ-clone/core-player/Player';
import PoisonWater from '../PoisonWater';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import WaterPoisoned from '../Rules/WaterPoisoned';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import poisonWaterCriteria from '../lib/criteria';

// A row of tiles, each a neighbour of the next.
class RowTile extends Tile {
  isNeighbourOf(other: Tile): boolean {
    return other !== this && Math.abs(other.x() - this.x()) <= 1;
  }
}

class Spy extends Unit {}
class Diplomat extends Unit {}

const setUp = () => {
  const ruleRegistry = new RuleRegistry(),
    tile = (x: number): Tile =>
      new RowTile(x, 0, new Terrain(), null as unknown as World, ruleRegistry),
    player = new Player(),
    enemy = new Player(),
    from = tile(0),
    to = tile(1),
    cities: City[] = [],
    cityRegistry = {
      getByTile: (on: Tile): City | null =>
        cities.find((city: City): boolean => city.tile() === on) ?? null,
    } as unknown as CityRegistry,
    city = { player: () => enemy, tile: () => to } as unknown as City,
    unit = new Spy(null, player, from, ruleRegistry),
    log: string[] = [];

  cities.push(city);
  unit.moves().set(1);

  ruleRegistry.register(
    new WaterPoisoned(
      new Effect((by: Unit, at: City, action: PoisonWater): void => {
        log.push(
          `poisoned ${by === unit} ${at === city} ${action.city() === city}`
        );
      })
    ),
    new Moved(
      new Effect((moved: Unit, action: UnitAction): void => {
        log.push(`moved ${moved === unit} ${action instanceof PoisonWater}`);
      })
    ),
    new Destroyed(
      new Effect((destroyed: Unit, by: Player | null): void => {
        log.push(
          `destroyed ${destroyed === unit} ${
            by === null ? null : by === enemy ? 'owner' : 'other'
          }`
        );
      })
    )
  );

  return {
    action: new PoisonWater(from, to, unit, city, ruleRegistry),
    city,
    cityRegistry,
    enemy,
    from,
    log,
    player,
    ruleRegistry,
    tile,
    to,
    unit,
  };
};

describe('PoisonWater', (): void => {
  it('runs the `WaterPoisoned` rules, then `Moved`, then uses the Spy up', (): void => {
    const { action, log } = setUp();

    action.perform();

    expect(log).to.deep.equal([
      'poisoned true true true',
      'moved true true',
      'destroyed true null',
    ]);
  });

  it('keeps a Spy that survives, and destroys one that is caught before the mission', (): void => {
    const kept = setUp(),
      caught = setUp(),
      asked: EscapeMode[] = [];

    kept.ruleRegistry.register(
      new AgentSurvives(
        new Effect((unit: Unit, mission: UnitAction, mode: EscapeMode) => {
          asked.push(mode);

          return true;
        })
      )
    );
    caught.ruleRegistry.register(
      new AgentSurvives(new Effect((): boolean => false))
    );
    kept.action.perform();
    caught.action.perform();

    expect(asked).to.deep.equal([-1, 0]);
    expect(kept.log).to.deep.equal([
      'poisoned true true true',
      'moved true true',
    ]);
    expect(caught.log).to.deep.equal(['destroyed true owner']);
  });

  it('rebuilds itself for another unit with the same city', (): void => {
    const { action, city, ruleRegistry, unit } = setUp(),
      other = new Spy(null, unit.player(), unit.tile(), ruleRegistry),
      rebuilt = action.forUnit(other) as unknown as PoisonWater;

    expect(rebuilt).to.instanceOf(PoisonWater);
    expect(rebuilt.unit()).to.equal(other);
    expect(rebuilt.city()).to.equal(city);
  });

  describe('poisonWaterCriteria', (): void => {
    const offered = (
      set: ReturnType<typeof setUp>,
      by: Unit = set.unit,
      to: Tile = set.to
    ): boolean =>
      poisonWaterCriteria(
        { cityRegistry: set.cityRegistry },
        (unit: Unit, city: City): boolean =>
          unit instanceof Spy && city === set.city
      ).every((criterion: Criterion): boolean =>
        criterion.validate(by, to, by.tile())
      );

    it("is offered to a Spy next to another player's city", (): void => {
      expect(offered(setUp())).to.true;
    });

    it('is not offered to another unit, with no moves, away from a city or at its own', (): void => {
      const set = setUp(),
        diplomat = new Diplomat(null, set.player, set.from, set.ruleRegistry),
        own = setUp();

      diplomat.moves().set(1);

      expect(offered(set, diplomat)).to.false;
      expect(offered(set, set.unit, set.tile(-1))).to.false;

      (own.city as unknown as { player: () => Player }).player = () =>
        own.player;

      expect(offered(own)).to.false;

      set.unit.moves().set(0);

      expect(offered(set)).to.false;
    });
  });
});
