# My website as Freelancer

## Card game

### Price rules

Applied on card effects. These rules are used to calculate the price of a card. 

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
- recycle = 1 energy

For the price rules of [upgrades.tsx](./src/data/upgrades.tsx), we just need to add a time parameter for the calculation 
over a period with all statistics set to average. But it's the same!

- game days average = 10
- 1 period = 10 days
- upgrade cumul average = 2
- energy average = 10
- reputation average = 5
- upgrade count average = 3
- card cost average = 3
- hand size average = 4
- discard size average = 10
- deck size average = 10
- action card called in period = 10 (logic.)
- total card called in period = 20
- for infinite cumul, we just double the period