# R4S5. Documentació i prova del servei

## Finalitat de la sessió

Esta sessió treballa `R4M5` i tanca el `Repte 4`. L'objectiu és deixar el servei documentat, provat i defensable perquè una altra persona puga entendre el contracte, executar els casos principals i preparar el pas a `R5`.

Al final de la sessió, cada equip ha de poder contrastar documentació, prova, codi i comportament real del servei.

## Encaix dins del Repte 4

- **Repte**: `R4. API i serveis reutilitzables`
- **Microrepte**: `R4M5`
- **Sessió**: `R4S5`
- **Duració orientativa**: `3 hores`
- **Focus**: documentació d'endpoints, exemples, proves, incidències, correccions i mini defensa tècnica
- **No entra encara**: integració externa completa, orquestració híbrida o ampliacions de `R5`

## Relació amb RA i criteris de treball

| Element | Concreció en el microrepte |
|---|---|
| `RA7.f` | prova explícita del servei |
| `RA7.h` | documentació usable per tercers |
| `RA6.g` | registre d'incidències i coherència amb dades reals |
| Evidència central | documentació i registre de proves del servei |
| Verificació docent | contrast entre documentació, demo i codi |

## Producte esperat

- Documentació d'endpoints.
- Exemples de request i response.
- Requisits d'autenticació.
- Casos de prova mínims.
- Errors principals.
- Incidències i correccions.
- Mini defensa tècnica de contracte i consum.

## Preparació prèvia del professorat

- Preparar checklist de documentació d'API.
- Portar exemple de documentació que sí coincideix amb el servei real.
- Preparar preguntes de defensa sobre contracte, autenticació, consum i errors.

## Seqüència d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:50. Revisió del paquet R4

Cada equip situa contracte, endpoint, protecció i consumidor.

### 0:50-1:15. Modelatge de documentació usable

El professorat mostra una documentació curta però executable.

### 1:15-1:55. Documentació i proves

L'alumnat actualitza README, document d'API, col·lecció o registre de proves.

### 1:55-2:20. Contrast documentació-comportament

Un altre equip intenta executar un cas documentat.

### 2:20-2:40. Incidències i correccions

Es registren discrepàncies i correccions aplicades.

### 2:40-2:50. Mini defensa i pas a R5

Cada equip defensa contracte, prova i possible integració futura.

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Documentar endpoints, autenticació i errors.
- Afegir exemples de request/response.
- Registrar proves positives i negatives.
- Corregir incoherències entre documentació i codi.
- Identificar quin servei pot alimentar `R5`.

## Evidències mínimes

| Evidència | Mínim acceptable |
|---|---|
| Documentació | permet consumir almenys el flux principal |
| Proves | inclou cas correcte i cas d'error |
| Incidències | registra problemes i correccions |
| Defensa | connecta contracte, codi i resposta real |
| Pas a R5 | identifica possible ús del servei en integració |

## Criteris d'èxit

- La documentació coincideix amb el servei real.
- Les proves són reproduïbles.
- El consumidor confirma que l'API és usable.
- L'alumnat pot defensar decisions i límits.

## Què no és suficient

- Documentació embellida que no executa.
- Captures sense instruccions.
- No registrar incidències.
- Tancar R4 sense cas d'error.

## Ús de la IA

La IA pot ajudar a polir documentació i generar casos de prova, però tot s'ha de contrastar amb execució real.

## Suport i ampliació

Per a suport, documentar un endpoint crític complet. Com ampliació, millorar OpenAPI, col·lecció automatitzada, mocks o contract tests simples.

## Checklist de tancament

- [ ] Documentació d'endpoints.
- [ ] Exemples de request/response.
- [ ] Cas correcte i error.
- [ ] Incidències i correccions.
- [ ] Mini defensa.
- [ ] Possible pas a `R5`.

## Connexió amb el repte posterior

`R5` reutilitzarà l'experiència d'interoperabilitat de `R4`, però canviarà el centre: ja no serà publicar una API pròpia, sinó integrar fonts externes o fluxos híbrids amb valor real.

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT11. Provar i documentar una API](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT11-Documentar-i-comprovar-una-API.pdf)
- **Teoria o material associat**: [Protecció, consum i documentació d'API](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R4-Proteccio-consum-i-documentacio-dAPI.pdf)

## Microtaller associat

- **Microtaller**: `MT11. Provar i documentar una API`
- **Moment recomanat**: abans de tancar `R4` i passar a integració.
- **Evidència mínima**: peticions reproduïbles, un cas d'error i documentació alineada amb el comportament real.

## Registre de l’ampliació global al final de R4

En R4M5 es recull una única proposta d’ampliació del repte (0–1), amb declaració `docs/r4-ampliacio.md`. En la presentació el professorat comprova mínims, demo i comprensió, valida els punts i deixa observació. El programa calcula `0,9 × mitjana ponderada del nucli + ampliació validada`; no suma en les dimensions del microrepte ni en cada RA. Pendent de revisió no és zero.
