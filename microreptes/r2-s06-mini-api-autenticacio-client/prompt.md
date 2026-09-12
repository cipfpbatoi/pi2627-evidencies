# R2M6. Mini API d'autenticació per a client

Revisa si el lliurament exposa l'autenticació de `R2M5` com una mini API consumible des de client.

No valores com a obligatori cap API completa, CRUD, OpenAPI, OAuth, JWT professional, refresh token ni arquitectura pròpia de `R4`. El mínim és:

- `POST /api/login` o equivalent;
- resposta `JSON`;
- `200` en cas correcte;
- `401` en cas incorrecte o no autenticat;
- token simple o mecanisme equivalent;
- ruta protegida que comprova eixe token;
- prova externa amb `curl`, Postman/Insomnia o `fetch`;
- contracte documentat per a DWEC amb URL base, headers, body, exemples `200`/`401`, usuari demo i limitacions conegudes.

Comprova especialment que no es retornen contrasenyes ni hashes, i que el token no és només decoratiu.

Sense contracte mínim consumible per DWEC, recomana no superar el 8 encara que els endpoints funcionen.
