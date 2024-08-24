# My website as Freelancer

## Card game

# Price rules

Applied on [effects.ts](./src/data/effects.ts). These rules are used to calculate the price of a card.

- 1 energy = 5M$ (exchange rate: x5)
- 1 reputation = 10 energy (exchange rate: x10)
- easy specific condition = -1 energy
- hard specific condition = -2 energy
- draw = 1 energy
- specific draw = 2 energy
- discard = -2 energy
- discard all = -4 energy
- discard specific = -1 energy
- discard all specific = -3 energy
- send to deck = -1 energy
- send all to deck = 0 energy
- middle effect = 4 energy