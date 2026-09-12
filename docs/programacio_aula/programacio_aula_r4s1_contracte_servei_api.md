# R4S1. Disseny del contracte del servei

## Finalitat de la sessió

Esta sessió obri el `Repte 4` i treballa el microrepte `R4M1`. L'objectiu és decidir quina funcionalitat real del projecte es convertirà en servei web i deixar un contracte mínim que puga implementar-se, provar-se i consumir-se.

Al final de la sessió, cada equip ha de poder explicar quin recurs exposa, per què té valor com a `API`, quins endpoints formen el contracte i quins casos d'error s'han de preveure.

## Encaix dins del Repte 4

- **Repte**: `R4. API i serveis reutilitzables`
- **Microrepte**: `R4M1`
- **Sessió**: `R4S1`
- **Duració orientativa**: `3 hores`
- **Focus**: recurs publicable, mapa d'endpoints, request/response, codis d'estat, errors i valor funcional del servei
- **No entra encara**: implementar tots els endpoints, afegir consum complet, documentació final o integració externa de `R5`

## Relació amb RA i criteris de treball

| Element | Concreció en el microrepte |
|---|---|
| `RA7.a` | reconeixement del paper d'un servei web reusable |
| `RA7.b` | identificació d'estil, protocol, recursos i format de dades |
| `RA7.c` | justificació del contracte del servei |
| `RA7.d` | disseny inicial de l'exposició del servei |
| Evidència central | contracte inicial del servei amb mapa d'endpoints i exemples de resposta |
| Verificació docent | pregunta oral sobre per què eixe recurs s'exposa i no un altre |

## Producte esperat

Un document curt de contracte d'`API` que incloga:

- recurs o cas d'ús que s'exposa;
- mapa inicial d'endpoints;
- taula de peticions i respostes;
- codis d'estat mínims;
- errors previsibles;
- autenticació prevista si el recurs és sensible;
- justificació del valor de publicar eixa funcionalitat.

## Preparació prèvia del professorat

- Portar un exemple de contracte senzill amb `GET`, `POST` o equivalent.
- Preparar exemples de resposta correcta i d'error.
- Tindre a mà la guia de contracte i disseny d'`API`.
- Definir el criteri de tancament: no s'implementa sense contracte mínim.

## Seqüència d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:50. Entrada a R4 i frontera amb R3

El professorat recorda que `R4` no reobre la persistència de `R3`: reutilitza una funcionalitat real i la converteix en servei.

### 0:50-1:10. Modelatge de contracte

Es mostra un recurs, endpoints, exemples de `request`, `response`, codis d'estat i errors.

### 1:10-1:45. Tria del recurs publicable

L'alumnat identifica quina part del producte té sentit exposar i descarta opcions ornamentals.

### 1:45-2:15. Redacció del contracte

Cada equip prepara mapa d'endpoints i taula mínima de peticions/respostes.

### 2:15-2:35. Contrast per parelles

Una altra persona intenta entendre com consumiria l'`API` només amb el contracte.

### 2:35-2:50. Checkpoint docent

Cada equip defensa el recurs triat i un endpoint crític.

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Triar recurs o cas d'ús real del projecte.
- Escriure mapa d'endpoints.
- Definir request, response i errors mínims.
- Indicar dades reals que alimentarien el servei.
- Registrar dubtes i decisions al README, issue o document d'API.

## Evidències mínimes

| Evidència | Mínim acceptable |
|---|---|
| Recurs publicable | prové d'una funcionalitat real del projecte |
| Mapa d'endpoints | té rutes i verbs o accions coherents |
| Contracte | inclou request, response i errors |
| Codis d'estat | diferencien cas correcte i cas incorrecte |
| Justificació | explica valor de servei reusable |

## Criteris d'èxit

- El contracte es pot entendre sense mirar el codi.
- Els endpoints tenen sentit de domini.
- Hi ha almenys un cas correcte i un cas d'error.
- L'alumnat pot explicar què consumirà un tercer.

## Què no és suficient

- Llistar rutes sense request/response.
- Exposar dades de prova sense relació amb el producte.
- Fer documentació que no es podrà implementar.
- Copiar un contracte generat per IA sense adaptar-lo.

## Ús de la IA

La IA pot proposar estructura d'endpoints o exemples de resposta, però l'alumnat ha de validar-los contra el producte real i registrar decisions rellevants.

## Suport i ampliació

Per a suport, reduir el contracte a `1` recurs i `2` endpoints. Com ampliació, afegir esquema OpenAPI, paginació o model d'errors més complet.

## Checklist de tancament

- [ ] Recurs triat i justificat.
- [ ] Mapa d'endpoints.
- [ ] Taula request/response.
- [ ] Errors i codis d'estat mínims.
- [ ] Pregunta oral superada.

## Connexió amb el microrepte posterior

`R4M2` implementarà el primer endpoint funcional del contracte. Si el contracte és ambigu, la implementació quedarà desconnectada del valor de servei.

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT10. Dissenyar endpoint abans de programar](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT10-Dissenyar-endpoint-abans-de-programar.pdf)
- **Teoria o material associat**: [Contracte d'API, HTTP i respostes](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R4-Contracte-dAPI-HTTP-i-respostes.pdf)

## Microtaller associat

- **Microtaller**: `MT10. Dissenyar endpoint abans de programar`
- **Moment recomanat**: abans d'implementar el primer endpoint del repte.
- **Evidència mínima**: contracte d'endpoint amb mètode, URL, request, response i errors previstos.
