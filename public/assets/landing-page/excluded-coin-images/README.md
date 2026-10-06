# Excluded Coin Images

Coin and banknote photos in the landing page design are **placeholder content**.

At runtime, load these from the Coinzy API:

- `GET api/archetypes/fetchAll` — catalogue/category coins
- `GET api/coin/getDetails/{id}` — coin detail images
- Feed posts — Firestore/API feed endpoints

Do not commit coin photography from Figma to the repo.
