# Programació d'aula operativa en 2 avaluacions

## Finalitat del document

Convertir la planificació del mòdul en una programació d'aula usable en context real, traduint la seqüència de fases i reptes a blocs docents amb activitats, evidències, instruments i punts de control recognoscibles.

Este document no substituïx [pla_implantacio_docent.md](pla_implantacio_docent.md), [calendaritzacio_orientativa_aula.md](calendaritzacio_orientativa_aula.md), [calendaritzacio_per_avaluacions.md](calendaritzacio_per_avaluacions.md) ni [matriu_evidencies_i_instruments_per_fase.md](../03_avaluacio/matriu_evidencies_i_instruments_per_fase.md). La seua funció és baixar eixa arquitectura docent a una seqüència d'aula operativa per a un curs on el projecte base del mòdul es desenvolupa i es tanca dins de les dues primeres avaluacions lectives.

Esta implantació s'ha calibrat sobre un escenari orientatiu d'unes `20` setmanes amb `6` hores setmanals, és a dir, unes `120` hores lectives aproximades concentrades en les dues primeres avaluacions.

## Criteris generals d'ús

- està pensat per a contextos on la 3a avaluació no és el període central de desenvolupament del projecte perquè l'alumnat està en empresa o `FCT`
- la referència temporal de treball és `Avaluació 1 = 10 setmanes / 60 hores aproximades` i `Avaluació 2 = 10 setmanes / 60 hores aproximades`
- Git i GitHub es tracten com a metodologia de treball, traçabilitat i repàs de criteris professionals, no com a iniciació bàsica
- cada bloc d'aula ha de produir evidències observables de producte i de procés
- els materials comuns continuen actius durant tot el recorregut, encara que s'activen amb més intensitat al començament
- `R2` es resol sobre una base comuna en `PHP`
- els itineraris `Laravel`, `Symfony` i `NestJS` no definixen blocs diferents; s'utilitzen com a suport de stack a partir de `R3`
- el pas d'un bloc a un altre ha de dependre d'evidències mínimes verificables, no només del calendari
- `API`, integració i defensa final han de quedar resoltes dins de la segona avaluació lectiva ordinària

## Estructura global de la programació d'aula

| Bloc | Avaluació | Fase o repte associat | Propòsit operatiu | Producte parcial esperat |
|---|---|---|---|---|
| **Bloc 1** | Avaluació 1 | Fase 0 | posar en marxa el marc de treball, evidències i criteris comuns | repositori usable, primer `README`, criteri de traçabilitat assumit |
| **Bloc 2** | Avaluació 1 | Fase 1 / Repte 1 | concretar domini, base comuna en `PHP` i primer esquelet defensable del producte | base tècnica executable i primera decisió tècnica documentada |
| **Bloc 3** | Avaluació 1 | Fase 2 / Repte 2 | construir la base funcional del producte amb auth, sessions o estat equivalent sobre base comuna en `PHP`, codi servidor integrat amb marques i resposta generada en servidor | flux funcional mínim real i verificable amb tractament de dades i document resultant |
| **Bloc 4** | Avaluació 1 | inici de Fase 3 / Repte 3 | obrir la reconstrucció en framework abans del canvi d'avaluació | projecte base en framework arrancable, Docker, persistència inicial i primera resposta dinàmica |
| **Bloc 5** | Avaluació 2 | tancament de Fase 3 / Repte 3 | consolidar base real en framework, persistència, primers fluxos verificables i renderitzat servidor | aplicació en framework amb BBDD, càrrega inicial reproduïble, 2 casos d'ús funcionals i almenys 1 cas server-rendered |
| **Bloc 6** | Avaluació 2 | Fase 4 / Repte 4 | publicar i provar l'API del producte | API documentada i comprovada |
| **Bloc 7** | Avaluació 2 | Fase 5 / Repte 5 i defensa final | integrar, tancar i defensar el producte del curs | producte final complet, integrat i defensable |

## Seqüència operativa per blocs d'aula

### Bloc 1. Arrancada i marc comú

Objectiu docent:

- establir criteris comuns de treball, evidència i ús verificable de la IA

Repte o fase associada:

- `Fase 0`

Activitats d'aula:

- presentar el projecte base del curs, els dominis admesos i la lògica del treball per reptes
- revisar criteris de repositori, commits, `README`, nota tècnica de decisió, proves i `AI log`
- comprovar que cada equip partix d'una base prèvia usable en Git/GitHub i la reorienta a criteri professional

Materials activats:

- materials comuns del mòdul
- sistema d'evidències
- projecte base i enunciat base del projecte del curs

Evidències esperades:

- repositori creat i organització mínima recognoscible
- primer `README`
- primers commits amb sentit
- criteri explícit d'ús verificable de la IA

Instrument principal:

- `checklist_revisio_repo.md`

Punt crític de seguiment:

- verificar que Git/GitHub s'està usant com a metodologia de treball i traçabilitat, no com a simple dipòsit d'arxius

### Bloc 2. Kickoff tècnic i decisió de producte

Objectiu docent:

- passar del marc comú a una base tècnica executable amb domini, base comuna en `PHP` i encàrrec clar

Repte o fase associada:

- `Fase 1` / `Repte 1`

Activitats d'aula:

- seleccionar domini i concretar casos d'ús inicials
- preparar l'entorn funcional del backend
- deixar documentada la primera decisió d'arquitectura o organització tècnica

Materials activats:

- fitxa del Repte 1
- enunciat base del projecte
- materials comuns
- model metodològic del pas de la base comuna en `PHP` als itineraris posteriors

Evidències esperades:

- entorn funcional
- decisió de domini i base comuna assumida
- nota tècnica de decisió inicial o registre equivalent
- traça de primers artefactes tècnics estables

Instrument principal:

- `rubrica_base_reptes.md`

Punt crític de seguiment:

- evitar que el kickoff quede reduït a infraestructura buida o a esquelet de framework sense producte recognoscible

### Bloc 3. Base funcional del producte

Objectiu docent:

- construir la primera funcionalitat real del producte amb usuaris, autenticació, validacions mínimes i codi servidor integrat amb llenguatge de marques

Repte o fase associada:

- `Fase 2` / `Repte 2` (`RA2`, `RA3`, `RA4`)

Activitats d'aula:

- implementar registre, login, logout o mecanisme equivalent d'estat
- integrar codi servidor amb `HTML` o plantilla equivalent per generar el document resultant
- usar variables, operadors, sentències simples, directives i àmbits dins del flux funcional
- passar dades de formularis al codi servidor i comprovar com modifiquen la resposta generada
- aplicar accés protegit, validacions i tractament mínim d'errors
- introduir primeres proves i actualitzar documentació operativa

Materials activats:

- materials del Repte 2
- materials comuns
- suport inicial de la base comuna en `PHP` per a bootstrap i auth

Evidències esperades:

- flux funcional d'usuari executable
- codi servidor integrat amb llenguatge de marques o plantilla
- ús visible de variables, operadors, sentències simples, directives i àmbits
- document o resposta generada pel servidor a partir de les dades rebudes
- estat o sessió equivalent funcionals
- validacions i errors mínims controlats
- `README` actualitzat i proves bàsiques

Instrument principal:

- `rubrica_base_reptes.md`

Punt crític de seguiment:

- comprovar que la funcionalitat és real i reproduïble, no una demo puntual o una seqüència només preparada per a presentar

### Bloc 4. Entrada a framework i persistència real

Objectiu docent:

- obrir `R3` abans del canvi d'avaluació perquè la base funcional de `R2` es convertisca en una base real en framework

Repte o fase associada:

- inici de `Fase 3` / `Repte 3`

Activitats d'aula:

- triar o confirmar l'stack de framework i preparar el projecte base
- comparar breument l'stack triat amb una altra opció viable i justificar la decisió
- identificar quins avantatges aporta separar ruta, controlador, vista o resposta i model respecte a la base de `R2`
- posar en marxa Docker, `.env` i rutes mínimes
- començar el model de dades inicial amb BBDD real
- crear migracions o equivalent i càrrega inicial reproduïble
- recuperar un conjunt de dades real i preparar-lo perquè alimente un llistat, detall, filtre o resposta
- declarar els `2` casos d'ús de `R3`, indicant quin ve de `R2`

Materials activats:

- materials del Repte 3
- [planificació d'aula del Repte 3](planificacio_aula_r3_mvc_i_persistencia.md)
- materials comuns
- itinerari triat com a suport directe de capes i persistència

Evidències esperades:

- projecte en framework arrancable
- nota comparativa curta de stack i esquema abans/després de responsabilitats
- Docker funcional i configuració mínima documentada
- primeres rutes reals
- BBDD connectada amb migracions o equivalent i dades inicials reproduïbles
- consulta o lectura d'un conjunt de dades usable en un flux funcional
- abast dels `2` casos d'ús definit i registrat

Instrument principal:

- `rubrica_base_reptes.md`

Punt crític de seguiment:

- no tancar la primera avaluació amb només un esquelet de framework o una persistència manual no reproduïble

### Bloc 5. Tancament de base en framework i fluxos verificables

Objectiu docent:

- consolidar el backend com a aplicació en framework persistent, mantenible, amb resposta dinàmica renderitzada en servidor i preparada per exposar-se com a API

Repte o fase associada:

- tancament de `Fase 3` / `Repte 3` (`RA5`, `RA6`, `RA8`)

Activitats d'aula:

- completar els `2` casos d'ús end-to-end
- assegurar que almenys `1` cas d'ús és migrat de `R2`
- assegurar que almenys `1` cas d'ús és server-rendered amb vista o plantilla i resposta `HTML` generada pel framework
- reforçar rutes, controladors, vistes o respostes, models i serveis o equivalents
- processar formularis, filtres, detalls o interaccions perquè el contingut generat canvie segons dades, paràmetres o estat
- comprovar validació, errors bàsics i proves mínimes
- verificar que migracions o equivalent i càrrega inicial reconstrueixen la BBDD i les dades de demostració

Materials activats:

- materials del Repte 3
- [planificació d'aula del Repte 3](planificacio_aula_r3_mvc_i_persistencia.md)
- materials comuns
- itineraris `Laravel`, `Symfony` i `NestJS` com a suport principal de stack

Evidències esperades:

- aplicació en framework operativa
- BBDD creada per migracions o equivalent
- dades inicials reproduïbles amb fixtures/seeders o script equivalent
- `2` casos d'ús funcionals de punta a punta
- almenys `1` cas d'ús amb vista o plantilla server-rendered i resposta `HTML` verificable
- validació i errors mínims
- proves mínimes i documentació tècnica curta
- backlog o mapa del que quedaria per migrar de `R2`

Instrument principal:

- `rubrica_base_reptes.md`

Punt crític de seguiment:

- no passar a `R4` si només hi ha discurs arquitectònic, un únic flux o una BBDD que no es pot reconstruir de zero

### Bloc 6. Publicació i consum d'API

Objectiu docent:

- exposar el producte com a API usable, documentada i comprovada

Repte o fase associada:

- `Fase 4` / `Repte 4`

Activitats d'aula:

- definir contracte API mínim usable
- implementar endpoints principals i criteris de resposta
- documentar l'API i provar-ne el consum

Materials activats:

- materials del Repte 4
- materials comuns
- itineraris reutilitzats per aplicar auth, validació i estructura en context d'API

Evidències esperades:

- endpoints principals publicats
- documentació d'API coherent amb el comportament real
- col·lecció de proves o peticions verificades
- `README` actualitzat amb ús i proves

Instrument principal:

- `rubrica_base_reptes.md`

Punt crític de seguiment:

- assegurar que contracte, proves, documentació i implementació real de l'API no divergisquen

### Bloc 7. Integració híbrida, tancament i defensa

Objectiu docent:

- completar el producte amb una integració externa o automatització funcional i preparar-ne la defensa final

Repte o fase associada:

- `Fase 5` / `Repte 5` i defensa final

Activitats d'aula:

- integrar el backend amb servei extern, `n8n` o flux híbrid equivalent
- provar el flux de punta a punta i revisar gestió mínima d'errors
- tancar documentació, evidències i defensa tècnica

Materials activats:

- materials del Repte 5
- materials comuns
- reutilització final dels itineraris per al tancament tècnic

Evidències esperades:

- flux híbrid complet i verificable
- prova de punta a punta
- documentació final, `AI log` si aplica i defensa tècnica coherent
- producte final usable, integrable i explicable

Instrument principal:

- `rubrica_defensa_tecnica.md`

Punt crític de seguiment:

- evitar tancaments ornamentals sense valor funcional real o sense capacitat de justificació tècnica davant revisió docent

## Materials activats en cada bloc

| Bloc | Materials prioritaris |
|---|---|
| **Bloc 1** | materials comuns, sistema d'evidències, enunciat base del projecte |
| **Bloc 2** | fitxa del Repte 1, materials comuns, base comuna del curs |
| **Bloc 3** | materials del Repte 2, materials comuns, base comuna en `PHP` |
| **Bloc 4** | materials del Repte 3, [planificació d'aula del Repte 3](planificacio_aula_r3_mvc_i_persistencia.md), materials comuns, itinerari triat |
| **Bloc 5** | materials del Repte 3, [planificació d'aula del Repte 3](planificacio_aula_r3_mvc_i_persistencia.md), materials comuns, itineraris com a suport principal |
| **Bloc 6** | materials del Repte 4, materials comuns, itineraris reutilitzats en context d'API |
| **Bloc 7** | materials del Repte 5, materials comuns, reutilització final dels itineraris |

## Evidències i productes parcials

| Bloc | Evidència clau | Producte parcial |
|---|---|---|
| **Bloc 1** | repositori usable i primer `README` | base de treball compartida |
| **Bloc 2** | entorn funcional i decisió tècnica inicial | esquelet de producte defensable |
| **Bloc 3** | flux funcional d'autenticació i validacions mínimes | nucli de `R2` complet |
| **Bloc 4** | framework arrancable, Docker, BBDD inicial, migracions o equivalent i càrrega inicial reproduïble | entrada efectiva a `R3` |
| **Bloc 5** | base en framework amb `2` casos d'ús, persistència reproduïble i proves mínimes | backend preparat per a `R4` |
| **Bloc 6** | API publicada, documentada i provada | producte exposat com a servei usable |
| **Bloc 7** | integració funcional, defensa i documentació final | producte complet del curs |

## Instruments d'avaluació en ús real

- `checklist_revisio_repo.md` per al control inicial de traçabilitat, repositori i documentació mínima
- `rubrica_base_reptes.md` com a instrument principal de seguiment en els blocs de construcció i consolidació
- checklists específiques dels Reptes `2`, `3`, `4` i `5` com a instrument de contrast operatiu
- `rubrica_defensa_tecnica.md` com a instrument principal de tancament del curs
- `plantilla_ai_log.md` i `sistema_evidencies.md` com a suports transversals de verificació

Lectura docent:

- els instruments no substituïxen la lectura professional del repositori, les proves ni la documentació
- el pes de l'avaluació recau en allò que l'alumnat pot demostrar, explicar, provar i defensar

## Punts de control docent

- al final del **Bloc 1**: comprovar criteri de traçabilitat i ús professional del repositori
- al final del **Bloc 3**: comprovar que `R2` deixa una base funcional real i no una simulació
- al final del **Bloc 4**: comprovar que l'entrada a `R3` és real abans del canvi d'avaluació
- al final del **Bloc 5**: comprovar que el backend té base en framework reproduïble, BBDD reconstruïble i `2` fluxos funcionals abans de publicar API
- al final del **Bloc 6**: comprovar coherència entre contracte API, proves i documentació
- al final del **Bloc 7**: comprovar valor real de la integració, autoria verificable i defensa tècnica

## Adaptacions realistes

- si el centre disposa de menys hores lectives, es poden compactar els blocs `1-2` o `4-5`, però no s'hauria d'eliminar cap punt de control nuclear
- si un grup arriba dèbil al final del **Bloc 3**, convé reforçar `R2` i l'entrada a `R3` abans de moure el calendari
- si hi ha molta heterogeneïtat tècnica, els itineraris s'han d'usar com a suport diferenciat sense fragmentar la seqüència comuna
- si el centre treballa per unitats més curtes, cada bloc pot dividir-se en sessions menors mantenint la mateixa lògica de producte
- si l'ús de la IA augmenta, cal intensificar la revisió d'`AI log`, proves i preguntes de contrast, no relaxar-les
- si la càrrega real del centre s'allunya de les `120` hores aproximades, s'ha de reajustar la densitat dels blocs sense moure el tancament del projecte fora de la segona avaluació

## Paper de la tercera avaluació

La tercera avaluació no s'ha de plantejar com a espai central de desenvolupament del projecte del mòdul. En este model:

- el producte base del curs ha de quedar completat dins de les dues primeres avaluacions
- la tercera avaluació només pot assumir seguiment residual, connexió amb empresa o `FCT`, reflexió de transferència o ajustos puntuals si el centre ho necessita
- no s'han de reservar per a este període ni `R4`, ni `R5`, ni la defensa final

## Resultat esperat al final de la segona avaluació

En tancar la segona avaluació, l'alumnat hauria d'haver completat un producte del curs que siga:

- funcional en el domini triat
- autenticat, persistent i estructurat
- exposat com a API documentada i provada
- connectat a una integració externa o flux híbrid amb valor real
- documentat, rastrejable i defensable
- comparable en qualsevol dels itineraris autoritzats

## Definition of done del document

Este document es considera completat quan:

- convertix la calendarització per avaluacions en una programació d'aula usable per blocs operatius
- manté la seqüència central del projecte dins de les dues primeres avaluacions lectives
- indica per a cada bloc objectiu docent, fase o repte associat, activitats d'aula, materials activats, evidències esperades, instrument principal i punt crític de seguiment
- deixa explícit que Git/GitHub es treballa com a metodologia de traçabilitat i repàs professional, no com a iniciació bàsica
- integra treball per reptes, projecte base, itineraris, evidències autèntiques i IA verificable
- deixa clar el paper no central de la tercera avaluació
