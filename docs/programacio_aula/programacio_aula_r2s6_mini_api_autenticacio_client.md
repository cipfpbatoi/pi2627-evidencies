# R2S6. Mini API d'autenticacio per a client

## Finalitat de la sessio

Esta sessio crea un pont explícit amb `Desenvolupament Web en Entorn Client`: el backend que ja autentica en web ha d'oferir una porta mínima perquè un client extern puga autenticar-se i consultar una ruta protegida.

No es tracta de construir encara una API REST completa. El mínim és un contracte molt xicotet, estable i consumible: `POST /api/login` i `GET /api/me` o equivalent, amb resposta `JSON`, codis HTTP coherents i un mecanisme senzill de token o sessio API.

## Encaix dins del Repte 2

- **Repte**: `R2. Processament bàsic, estat, autenticació i primera funcionalitat protegida`
- **Microrepte**: `R2M6`
- **Sessio**: `R2S6`
- **Duracio orientativa**: `3 hores`
- **Focus**: contracte mínim d'autenticació consumible des de client, resposta `JSON`, `200`/`401`, prova amb `curl`, Postman/Insomnia o `fetch`
- **No entra encara**: API completa, CRUD, OpenAPI, refresh tokens, OAuth, JWT professional, rols complexos, documentacio extensa d'API o arquitectura pròpia de `R4`

## Relacio amb RA i criteris de treball

| Element | Concrecio en el microrepte |
|---|---|
| `RA4.d` | reutilitzar l'autenticació creada en `R2M5` |
| `RA4.e` | protegir una ruta consumible des d'un client extern |
| Preparacio cap a DWEC | permetre que el client practique `fetch` autenticat sense esperar a `R4` |
| Preparacio cap a `R4` | primer contracte `JSON`, codis HTTP i capçalera `Authorization` |
| Evidencia central | login API i ruta protegida provats amb una eina externa |
| Verificacio docent | execucio de `POST /api/login`, còpia del token i execucio de `GET /api/me` o equivalent |

## Producte esperat

Una mini API d'autenticació que incloga, com a mínim:

- endpoint `POST /api/login` o equivalent;
- lectura de credencials en `JSON` o formulari, però resposta sempre en `JSON`;
- validació contra el sistema d'usuaris ja creat en `R2M5`;
- resposta correcta amb codi `200` i token simple o identificador equivalent;
- resposta incorrecta amb codi `401` i missatge `JSON`;
- endpoint protegit `GET /api/me`, `GET /api/protected` o equivalent;
- lectura del token en `Authorization: Bearer ...` o mecanisme documentat;
- resposta protegida amb dades mínimes de l'usuari o del domini;
- prova documentada amb `curl`, Postman/Insomnia o `fetch`;
- indicació clara de què queda per a una API professional en `R4`.

## Preparacio previa del professorat

Convé preparar:

- exemple mínim de resposta `JSON` en `PHP`;
- exemple de lectura de `php://input`;
- exemple de `http_response_code(401)`;
- exemple de capçalera `Authorization`;
- un token simple acceptable per a l'exercici, per exemple token guardat en sessio, array temporal o fitxer provisional;
- criteri clar: no exigir JWT professional ni seguretat de produccio.

Exemple orientatiu:

```text
public/
  api/
    login.php
    me.php
src/
  auth.php
```

## Seqüencia d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:50. Del login web al login consumible

Tasques:

- revisar què valida ja `R2M5`;
- identificar usuari vàlid i usuari invàlid;
- decidir quina informació mínima pot tornar l'API;
- acordar el contracte amb DWEC.

Resultat: cada equip sap què ha de respondre el backend.

### 0:50-1:15. Modelatge docent de `JSON` i codis HTTP

Mostrar:

- `Content-Type: application/json`;
- `json_encode`;
- `http_response_code(200)`;
- `http_response_code(401)`;
- lectura de dades d'entrada;
- diferència entre HTML per navegador i JSON per client.

Resultat: l'alumnat entén que no està fent una pantalla nova, sinó una resposta per a un altre programa.

### 1:15-1:40. Endpoint `POST /api/login`

Tasques:

- crear l'endpoint;
- reusar la validació d'usuari de `R2M5`;
- retornar `JSON`;
- generar o recuperar un token simple;
- provar credencial correcta i incorrecta.

Resultat: el client pot demanar autenticació i rebre una resposta interpretable.

### 1:40-2:10. Endpoint protegit

Tasques:

- crear `GET /api/me` o equivalent;
- llegir token de `Authorization`;
- retornar `401` si falta o no és vàlid;
- retornar dades mínimes si és correcte;
- no exposar contrasenyes ni hashes.

Resultat: hi ha una ruta protegida consumible des de client.

### 2:10-2:30. Prova des de fora del navegador

Tasques:

- provar amb `curl`, Postman/Insomnia o `fetch`;
- guardar exemple de petició i resposta;
- comprovar `200` i `401`;
- si cal, habilitar CORS mínim per al client local.

Resultat: DWEC pot consumir el contracte bàsic.

### 2:30-2:50. Tancament i límits

Tasques:

- documentar endpoints, mètodes, headers i respostes;
- indicar què és provisional;
- indicar què es farà millor en `R4`;
- deixar un commit clar.

Pregunta de checkpoint: què ha de fer el client quan rep `401`?

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Reutilitzar l'autenticació de `R2M5`.
- Crear `POST /api/login`.
- Retornar `JSON` i codis HTTP coherents.
- Crear una ruta protegida.
- Llegir un token o mecanisme equivalent.
- Provar cas correcte i cas incorrecte.
- Documentar el contracte perquè DWEC el puga consumir.

## Evidencies minimes

| Evidencia | Minim acceptable |
|---|---|
| Login API | endpoint que valida credencials i retorna `JSON` |
| Ruta protegida | endpoint que requerix token o mecanisme equivalent |
| Codis HTTP | `200` en cas correcte i `401` en cas no autoritzat |
| Seguretat bàsica | no retorna contrasenyes ni hashes |
| Prova externa | `curl`, Postman/Insomnia o `fetch` documentat |
| Contracte | mètode, URL, entrada, headers i resposta descrits |

## Criteris d'exit

- La mini API reutilitza l'autenticació existent.
- La resposta és `JSON`, no HTML disfressat.
- El client pot distingir cas autoritzat i no autoritzat.
- La ruta protegida no respon dades sensibles.
- El contracte és prou estable perquè DWEC puga consumir-lo.
- L'alumnat sap explicar què queda fora fins a `R4`.

## Que no és suficient

- Fer una pàgina HTML de login nova.
- Retornar sempre `200`.
- Retornar contrasenyes o hashes.
- Fer només `POST /api/login` sense ruta protegida.
- Crear un token que no es comprova mai.
- Obrir una API completa fora d'escala.

## Us de la IA

La IA pot ajudar a escriure exemples de `json_encode`, llegir `Authorization` o preparar comandos `curl`. Control: l'alumnat ha d'executar els dos casos, explicar el contracte i demostrar què passa amb token incorrecte.

## Suport per alumnat amb més dificultat

Acceptar un token molt simple i temporal, sempre que:

- no siga la contrasenya;
- es comprove en la ruta protegida;
- quede documentat que és provisional.

## Ampliacio per alumnat avançat

- Consumir la mini API amb un `fetch` real des d'una pàgina de DWEC.
- Afegir `POST /api/logout`.
- Afegir expiració simple del token.
- Afegir una resposta d'error més estructurada.
- Preparar un esborrany de contracte que es reprendrà en `R4`.

## Checklist de tancament

- [ ] Tinc `POST /api/login`.
- [ ] Torne `JSON`.
- [ ] Torne `200` si les credencials són correctes.
- [ ] Torne `401` si són incorrectes.
- [ ] Tinc una ruta protegida.
- [ ] La ruta protegida comprova token o mecanisme equivalent.
- [ ] No expose contrasenyes ni hashes.
- [ ] He provat des de `curl`, Postman/Insomnia o `fetch`.
- [ ] He documentat el contracte per a DWEC.
- [ ] He indicat què queda per a `R4`.

## Connexio amb DWEC i R4

DWEC pot començar a practicar consum autenticat amb `fetch` sense esperar a `R4`. En `R4` esta porta mínima es convertirà en una API més formal: contracte, endpoints, protecció més sòlida, documentació i consum complet del servei.

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT05. Auth mínima defensable](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT05-Auth-minima-defensable.pdf)
- **Teoria o material associat**: [JSON, codis HTTP i autenticació mínima per a client](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R2-JSON-codis-HTTP-i-autenticacio-minima-per-a-client.pdf)

## Microtaller associat

- **Microtaller**: `MT05. Auth mínima defensable`
- **Moment recomanat**: quan la mini API d'autenticació ja retorna token o resposta equivalent i cal demostrar accés correcte i denegat.
- **Evidència mínima**: endpoint d'autenticació o ruta protegida amb cas permés, cas denegat i dades demo documentades.
