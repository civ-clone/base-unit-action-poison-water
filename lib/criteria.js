"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poisonWaterCriteria = void 0;
const Action_1 = require("@civ-clone/core-unit/Rules/Action");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
/**
 * The criteria for poisoning the water of the city on `to`, in order: a neighbouring tile, moves left, a city of
 * another player on `to`, and `canPoison(unit, city)` (Civ2: a Spy, and a city above size 1 unless a computer's Spy
 * chooses it). A rule set adds its own peace criteria after these.
 */
const poisonWaterCriteria = ({ cityRegistry }, canPoison) => [
    Action_1.isNeighbouringTile,
    Action_1.hasMovesLeft,
    new Criterion_1.default((unit, to) => {
        const city = cityRegistry.getByTile(to);
        return city !== null && city.player() !== unit.player();
    }),
    new Criterion_1.default((unit, to) => canPoison(unit, cityRegistry.getByTile(to))),
];
exports.poisonWaterCriteria = poisonWaterCriteria;
exports.default = exports.poisonWaterCriteria;
//# sourceMappingURL=criteria.js.map