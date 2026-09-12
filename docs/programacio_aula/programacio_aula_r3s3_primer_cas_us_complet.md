# R3S3. Primer cas d'us complet

## Finalitat de la sessio

Esta sessio migra o reconstrueix en el framework un primer flux real heretat de `R2`. El criteri central és demostrar que la nova arquitectura no és només instal·lacio i BBDD, sinó un recorregut end-to-end amb ruta, controlador o equivalent, capa de dades, vista o resposta, BBDD real, validacio minima i error controlat.

## Encaix dins del Repte 3

- **Repte**: `R3. Reconstruccio en framework, persistencia real i primers fluxos funcionals`
- **Microrepte**: `R3M3`
- **Sessio**: `R3S3`
- **Duracio orientativa**: `3 hores`
- **Focus**: primer cas d'us heretat de `R2`, end-to-end, dades reals, resposta server-rendered o equivalent
- **No entra encara**: segon flux, API, autenticacio avançada, refactoritzacio completa o migracio total

## Relacio amb RA i criteris de treball

| Element | Concrecio en el microrepte |
|---|---|
| `RA5.e` | usa rutes/controladors o equivalents del framework |
| `RA5.f` | separa responsabilitats entre entrada, coordinacio, dades i presentacio |
| `RA5.g` | manté el flux explicable i mantenible |
| `RA6.c` | recupera dades reals de BBDD |
| `RA6.d` | tracta dades dins del flux |
| `RA6.f` | verifica el comportament amb dades persistents |
| `RA8.d`, `RA8.e`, `RA8.f`, `RA8.g` | genera resposta HTML dinàmica i processa interaccio quan escau |
| Evidencia central | flux heretat de `R2` funcionant en framework |

## Producte esperat

- Identificacio del flux de `R2`.
- Ruta funcional.
- Controlador o equivalent.
- Model, servei o capa de dades.
- Vista, plantilla o resposta generada.
- Dades reals de BBDD.
- Interaccio o formulari processat quan escau.
- Validacio minima i error controlat.
- Prova del cas positiu.

## Preparacio previa del professorat

- Preparar mapa de recorregut de peticio en l'stack majoritari.
- Tindre exemple de controlador que no continga tota la logica.
- Portar exemple de dades passades a vista.
- Preparar pauta per triar un flux de `R2` massa gran i retallar-lo.

## Continguts a explicar

- Que significa end-to-end en framework.
- Diferencia entre pantalla estatica i flux funcional.
- Com passen les dades de BBDD a controlador i vista.
- Com validar minimament i controlar un error.
- Com comprovar que el flux ve realment de `R2`.

## Sequencia d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:55. Tria del flux heretat

Tasques:

- identificar el flux de `R2`;
- escriure què feia abans;
- acotar què es migrara ara;
- confirmar quines dades de BBDD necessita.

### 0:55-1:15. Modelatge docent

El professorat mostra:

- ruta;
- controlador;
- consulta o servei;
- vista amb dades;
- cas positiu i error simple.

### 1:15-1:55. Implementacio del recorregut

Tasques:

- crear ruta;
- crear controlador o equivalent;
- connectar model/servei;
- recuperar dades reals;
- passar dades a la resposta.

### 1:55-2:25. Vista, interaccio i error

Tasques:

- crear vista/plantilla o resposta HTML;
- processar formulari o parametre si aplica;
- afegir validacio minima;
- controlar un error observable.

### 2:25-2:45. Prova i traçabilitat

Tasques:

- provar cas positiu;
- provocar error;
- documentar recorregut;
- registrar commits i temps aproximat;
- registrar les pistes i l’ajuda real d’IA, o declarar que no s’ha usat.

### 2:45-2:50. Checkpoint

Cada equip mostra:

- flux executat;
- punt equivalent en `R2`;
- ruta/controlador;
- dades reals;
- resposta generada;
- error controlat.

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Triar un flux de `R2`.
- Crear ruta i controlador.
- Connectar model/servei/capa de dades.
- Llegir dades reals.
- Generar resposta visible.
- Afegir validacio minima si hi ha entrada.
- Provar cas positiu i error.
- Documentar recorregut.

## Evidencies minimes

| Evidencia | Minim acceptable |
|---|---|
| Flux heretat | identificat i acotat |
| Ruta | executable |
| Controlador | coordina sense concentrar-ho tot |
| Dades | provenen de BBDD |
| Resposta | vista/plantilla o HTML generat |
| Verificacio | cas positiu i error minim |
| Traçabilitat | commits i registre de temps aproximat |

## Criteris d'exit

- El flux funciona de punta a punta.
- Les dades no són simulades.
- Les responsabilitats són recognoscibles.
- L'alumnat pot explicar el recorregut de la peticio.
- El flux manté relacio clara amb `R2`.

## Que no és suficient

- Fer una pantalla nova sense relacio amb `R2`.
- Mostrar dades fixes.
- Posar tota la logica en una ruta.
- No provar error.
- Duplicar codi sense entendre'l.

## Us de la IA

La IA pot explicar responsabilitats i donar pistes sobre un intent propi, sense implementar ruta, controlador, servei ni validació. L’alumnat implementa i contrasta el flux real de `R2`.

## Suport per a alumnat amb dificultats

- Reduir el flux a llistat o detall.
- Donar plantilla de controlador.
- Permetre error minim simple.
- Revisar en grup el recorregut de la peticio.

## Ampliacio per a alumnat avançat

- Afegir validacio més fina.
- Extraure servei si el controlador creix.
- Afegir prova automatica del flux.

## Checklist de tancament

- [ ] Flux de `R2` identificat.
- [ ] Ruta funcional.
- [ ] Controlador o equivalent.
- [ ] Dades reals de BBDD.
- [ ] Resposta generada.
- [ ] Cas positiu comprovat.
- [ ] Error controlat.
- [ ] Commits i temps aproximat.

## Connexio amb el microrepte posterior

`R3M4` afegira un segon flux o ampliacio funcional. El primer flux ha de quedar estable perquè el segon no siga una duplicacio buida ni trenque la base.

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT09. On pose la lògica](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT09-On-pose-la-logica.pdf)
- **Teoria o material associat**: [Rutes, controladors, vistes i flux end-to-end](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R3-Rutes-controladors-vistes-i-flux-end-to-end.pdf)

## Microtaller associat

- **Microtaller**: `MT09. On pose la lògica`
- **Moment recomanat**: quan el primer cas d'ús comença a acumular regles en controlador, servei o model.
- **Evidència mínima**: decisió documentada sobre on queda una regla de negoci i prova del flux.

