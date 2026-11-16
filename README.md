# base-unit-action-poison-water

The `PoisonWater` unit action: a Spy poisons a city's water supply, with criteria for offering it.

- `PoisonWater`: `new PoisonWater(from, to, unit, city, ruleRegistry?)`. `perform()`, in order:
  1. a caught check (base-unit-agent's `AgentSurvives` with `CAUGHT_CHECK`): a Spy that is caught is destroyed;
  2. the `WaterPoisoned` rules;
  3. `Moved`, then the Spy is used up unless it survives an `ORDINARY` check.

  With no `AgentSurvives` rules the check passes and the Spy is used up.
- `Rules/WaterPoisoned`: `WaterPoisoned(unit, city, action)`. What the poison does is the rule set's (Civ2: the city
  shrinks by 1, or a size-1 city's food box is emptied).
- `lib/criteria`: `poisonWaterCriteria({ cityRegistry }, canPoison)`, in order: a neighbouring tile, moves left, a city
  of another player on `to`, and `canPoison(unit, city)`. A rule set adds its own peace criteria after these.

A library: it has no `main` and registers no rules.
