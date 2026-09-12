# R5S1. Selecció de font externa i disseny de la integració

## Finalitat de la sessió

Esta sessió obri el `Repte 5` i treballa el microrepte `R5M1`. L'objectiu és triar una font externa, servei o repositori heterogeni que aporte valor real al producte i deixar dissenyat el flux híbrid abans d'implementar-lo.

Al final de la sessió, cada equip ha de poder explicar què integra, per què ho integra, quin contracte extern utilitza, quines dades necessita, quines descarta i quin risc tècnic assumix.

## Encaix dins del Repte 5

- **Repte**: `R5. Integració híbrida i tancament`
- **Microrepte**: `R5M1`
- **Sessió**: `R5S1`
- **Duració orientativa**: `3 hores`
- **Focus**: font externa, valor de producte, contracte, mapa inicial, riscos i límits
- **No entra encara**: implementar el connector complet, transformar dades, automatitzar fluxos o preparar la defensa final

## Relació amb RA i criteris de treball

| Element | Concreció en el microrepte |
|---|---|
| `RA9.a` | identificació de fonts externes o repositoris heterogenis útils |
| `RA9.b` | selecció justificada segons valor, viabilitat i risc |
| `RA7.a` | lectura inicial del contracte si la font és un servei web |
| Evidència central | comparativa curta i mapa inicial d'integració |
| Verificació docent | pregunta oral sobre valor real, dependència externa i dades necessàries |

## Producte esperat

Un document curt de disseny d'integració que incloga:

- necessitat del producte que es vol millorar;
- dues o tres fonts candidates, encara que una quede descartada ràpidament;
- font triada i justificació;
- format, contracte o mecanisme d'accés;
- dades que entren, dades que es descarten i resultat esperat;
- riscos: claus, límits, errors, qualitat de dades, permisos o dependència externa;
- mapa inicial del flux híbrid.

## Preparació prèvia del professorat

- Portar dos exemples contrastats: una integració útil i una integració ornamental.
- Preparar una plantilla de mapa d'integració amb entrada, transformació, eixida i error.
- Tindre a mà criteris per descartar fonts massa fràgils, opaques o sense valor de producte.
- Recordar que `R5` acredita principalment `RA9`.

## Seqüència d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:50. Entrada a R5 i canvi de centre

El professorat explica que `R4` publicava serveis i `R5` integra fonts externes o fluxos híbrids. La pregunta no és "quina API puc cridar?", sinó "quina informació o servei extern millora el meu producte?".

### 0:50-1:10. Modelatge d'una integració acceptable

Es mostra un exemple amb font externa, contracte, dades rebudes, transformació mínima, ús dins del producte i cas d'error.

### 1:10-1:40. Exploració guiada de fonts

L'alumnat localitza fonts candidates i comprova si tenen documentació, accés viable, límits i dades útils.

### 1:40-2:10. Comparativa i decisió

Cada equip compara opcions, descarta les no viables i tria una font principal.

### 2:10-2:35. Mapa inicial del flux híbrid

Es dibuixa el recorregut: entrada, crida externa, transformació, integració en producte, resposta visible i error previst.

### 2:35-2:50. Checkpoint docent

Cada equip defensa la tria i rep validació, reducció d'abast o canvi de font.

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Comparar fonts candidates.
- Llegir la documentació mínima de la font triada.
- Definir quines dades s'utilitzaran i per a què.
- Dibuixar el mapa inicial del flux.
- Registrar riscos, decisions i dubtes.

## Evidències mínimes

| Evidència | Mínim acceptable |
|---|---|
| Comparativa | almenys dues opcions amb motiu de tria o descart |
| Font triada | aporta valor real al producte |
| Contracte extern | identifica accés, format i dades principals |
| Mapa inicial | mostra entrada, transformació, eixida i error |
| Riscos | inclou límits, permisos, errors o qualitat de dades |

## Criteris d'èxit

- La font no és ornamental.
- El flux es pot implementar en el temps disponible.
- El producte guanya una funcionalitat o informació nova.
- L'alumnat pot explicar què ve de fora i què farà el sistema propi.

## Què no és suficient

- Triar una API perquè és fàcil o vistosa.
- No comprovar si hi ha documentació o accés real.
- Fer un mapa sense error ni límit extern.
- Delegar la selecció en IA sense validar-la.

## Ús de la IA

La IA pot ajudar a buscar alternatives, comparar formats o detectar riscos, però la decisió ha d'estar validada contra documentació real i necessitats del producte. Les propostes rellevants acceptades o descartades s'han de registrar.

## Suport i ampliació

Per a suport, limitar la integració a una font pública senzilla amb resposta llegible. Com ampliació, comparar dues fonts o dissenyar una estratègia de cache, reintent o fallback.

## Checklist de tancament

- [ ] Font externa triada i justificada.
- [ ] Comparativa de fonts.
- [ ] Contracte o mecanisme d'accés identificat.
- [ ] Mapa inicial del flux híbrid.
- [ ] Riscos i límits anotats.
- [ ] Validació docent del pas a implementació.

## Connexió amb el microrepte posterior

`R5M2` implementarà la connexió real amb la font triada. Si la font no està validada o el flux és ambigu, la implementació quedarà reduïda a una prova aïllada sense valor de producte.

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT12. Triar una integració amb valor](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT12-Triar-una-integracio-amb-valor.pdf)
- **Teoria o material associat**: [Integració externa i flux híbrid](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R5-Integracio-externa-i-flux-hibrid.pdf)

## Microtaller associat

- **Microtaller**: `MT12. Triar una integració amb valor`
- **Moment recomanat**: abans de validar la font externa o automatització triada.
- **Evidència mínima**: mapa de valor, frontera entre sistemes i primer risc identificat.
