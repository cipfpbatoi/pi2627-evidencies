# R3S7. Tancament tecnic

## Finalitat de la sessio

Esta sessio tanca `R3` deixant el projecte en framework documentat, reproduïble i preparat per entrar a `R4`. El resultat no ha de vendre una migracio total, sinó explicar amb precisio què s'ha reconstruït, com s'arranca, com es regeneren dades, quins dos fluxos funcionen i què queda pendent.

## Encaix dins del Repte 3

- **Repte**: `R3. Reconstruccio en framework, persistencia real i primers fluxos funcionals`
- **Microrepte**: `R3M7`
- **Sessio**: `R3S7`
- **Duracio orientativa**: `3 hores`
- **Focus**: README, demo, decisions, backlog, reproduïbilitat i pas a `R4`
- **No entra encara**: desenvolupar API, integrar serveis externs o obrir noves funcionalitats grans

## Relacio amb RA i criteris de treball

| Element | Concrecio en el microrepte |
|---|---|
| `RA5.f` | documenta estructura i decisions de framework |
| `RA5.g` | explica mantenibilitat i responsabilitats |
| `RA6.g` | documenta persistencia, migracions o equivalent, càrrega inicial i dades |
| Evidencia central | projecte reproduïble i defensable amb backlog cap a `R4` |

## Producte esperat

- `README` tecnic actualitzat.
- Instruccions d'arrencada.
- Instruccions de BBDD, migracions/fixtures/seeders o mecanisme equivalent.
- Resum dels `2` casos d'us.
- Decisions tecniques breus.
- Demo curta preparada.
- Backlog del que queda per migrar.
- Identificacio de possible recurs o endpoint per a `R4`.

## Preparacio previa del professorat

- Preparar plantilla de README de tancament.
- Preparar guio de demo de 5 minuts.
- Preparar preguntes de defensa sobre arquitectura i persistencia.
- Preparar criteri de pas a `R4`: base persistent, reproduïble i defensable.

## Continguts a explicar

- Diferencia entre documentacio real i relat embellit.
- Com escriure instruccions reproduïbles.
- Com explicar decisions sense fer un informe llarg.
- Com construir backlog honest.
- Com triar què podria exposar-se com a API en `R4`.

## Sequencia d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:55. Revisio de base

Tasques:

- arrancar projecte des de zero o simular-ho;
- revisar comandes de BBDD;
- comprovar dos fluxos;
- detectar buits del README.

### 0:55-1:15. Modelatge de tancament

El professorat mostra:

- README minim viable;
- demo curta;
- registre de decisions;
- backlog cap a `R4`.

### 1:15-1:55. Documentacio tecnica

Tasques:

- actualitzar README;
- documentar Docker i `.env`;
- documentar migracions i càrrega inicial;
- descriure dos fluxos;
- indicar proves o checklist.

### 1:55-2:20. Decisions i backlog

Tasques:

- escriure decisions tecniques principals;
- explicar què s'ha migrat i què no;
- deixar backlog;
- identificar possible recurs/endpoint de `R4`.

### 2:20-2:45. Demo i defensa

Tasques:

- preparar demo curta;
- assajar recorregut de peticio;
- preparar resposta sobre BBDD i responsabilitats;
- registrar IA si ha ajudat en documentacio.

### 2:45-2:50. Checkpoint

Cada equip mostra:

- README;
- arrencada o instruccions;
- dos fluxos;
- migracions/fixtures/seeders o mecanisme equivalent;
- backlog cap a `R4`.

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Actualitzar README.
- Documentar arrencada.
- Documentar BBDD.
- Resumir dos casos d'us.
- Registrar decisions.
- Preparar demo.
- Fer backlog de migracio.
- Proposar base per a `R4`.

## Evidencies minimes

| Evidencia | Minim acceptable |
|---|---|
| README | permet arrancar i entendre el projecte |
| BBDD | migracions o equivalent i càrrega inicial documentades |
| Fluxos | dos casos d'us descrits i demostrables |
| Decisions | registre breu i concret |
| Backlog | què queda fora i per què |
| Traçabilitat | commits finals i temps aproximat |

## Criteris d'exit

- Una altra persona pot arrancar el projecte.
- El README coincideix amb el codi real.
- Els dos fluxos són demostrables.
- Queda clar què s'ha migrat i què no.
- El pas a `R4` està justificat.

## Que no és suficient

- README generic.
- Captures sense instruccions reproduïbles.
- Ocultar que només s'han migrat parts.
- No documentar BBDD.
- No saber explicar decisions.

## Us de la IA

La IA pot ajudar a ordenar README, demo o backlog. L'alumnat ha de verificar que cada instruccio correspon al projecte real i registrar l'ús rellevant.

## Suport per a alumnat amb dificultats

- Donar plantilla de README.
- Reduir demo als dos fluxos obligatoris.
- Fer checklist guiada d'arrencada.
- Ajudar a formular backlog honest.

## Ampliacio per a alumnat avançat

- Afegir script de setup.
- Afegir prova automatica de smoke.
- Documentar proposta inicial d'endpoint per a `R4`.

## Checklist de tancament

- [ ] README actualitzat.
- [ ] Arrencada documentada.
- [ ] BBDD documentada.
- [ ] Dos fluxos descrits.
- [ ] Demo preparada.
- [ ] Decisions registrades.
- [ ] Backlog cap a `R4`.
- [ ] Commits i temps aproximat.

## Connexio amb el microrepte posterior

Després de `R3M7`, l'equip pot entrar a `R4`: contracte d'API i exposicio de funcionalitats. Si `R3` no queda reproduïble, `R4` començara sobre una base fragil.

## Registre de l’ampliació global al final de R3

En R3M7 es recull una única proposta d’ampliació del repte (0–1), amb declaració `docs/r3-ampliacio.md`. En la presentació el professorat comprova mínims, demo i comprensió, valida els punts i deixa observació. El programa calcula `0,9 × mitjana ponderada del nucli + ampliació validada`; no suma en les dimensions del microrepte ni en cada RA. Pendent de revisió no és zero.
