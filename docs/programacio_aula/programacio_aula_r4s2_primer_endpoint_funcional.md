# R4S2. Implementació del primer endpoint funcional

## Finalitat de la sessió

Esta sessió treballa `R4M2`: publicar un primer endpoint real, coherent amb el contracte de `R4S1`, alimentat per dades o lògica real del projecte.

Al final de la sessió, cada equip ha de poder executar una petició, veure una resposta estructurada i explicar d'on ixen les dades o el resultat que retorna el servei.

## Encaix dins del Repte 4

- **Repte**: `R4. API i serveis reutilitzables`
- **Microrepte**: `R4M2`
- **Sessió**: `R4S2`
- **Duració orientativa**: `3 hores`
- **Focus**: endpoint funcional, dades reals, resposta estructurada, coherència amb contracte i demo del cas correcte
- **No entra encara**: consumidor complet, documentació final, col·lecció completa de proves o integració externa

## Relació amb RA i criteris de treball

| Element | Concreció en el microrepte |
|---|---|
| `RA7.d` | implementació del servei segons contracte |
| `RA7.e` | publicació d'un endpoint verificable |
| `RA6.c` | lectura o ús de dades reals ja existents |
| `RA6.d` | coherència entre dada, operació i resposta |
| Evidència central | endpoint funcional amb resposta estructurada |
| Verificació docent | execució en directe i pregunta sobre l'origen de les dades |

## Producte esperat

- Endpoint publicat i accessible.
- Resposta en format coherent amb el contracte.
- Ús de dades reals o acció real del sistema.
- Cas correcte demostrable.
- Commit associat a la implementació.

## Preparació prèvia del professorat

- Portar un exemple d'endpoint complet amb resposta correcta.
- Preparar exemples d'errors habituals: ruta incorrecta, format inconsistent, dades simulades sense justificació.
- Recordar la frontera: no reobrir el model de dades de `R3`.

## Seqüència d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:50. Recuperació del contracte

Cada equip selecciona l'endpoint que implementarà primer.

### 0:50-1:10. Modelatge docent

El professorat mostra ruta, controlador/handler, accés a dades i resposta.

### 1:10-1:50. Implementació guiada

L'alumnat implementa l'endpoint i comprova que respon.

### 1:50-2:15. Coherència contracte-resposta

Es compara la resposta real amb el contracte escrit en `R4S1`.

### 2:15-2:35. Prova i evidència

Cada equip guarda captura, comanda, col·lecció o registre de prova.

### 2:35-2:50. Checkpoint docent

Demo curta de l'endpoint i pregunta sobre l'origen de dades.

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Implementar una ruta o endpoint real.
- Connectar-lo amb dades o lògica del projecte.
- Retornar resposta estructurada.
- Provar el cas correcte.
- Ajustar el contracte si la implementació mostra una incoherència.

## Evidències mínimes

| Evidència | Mínim acceptable |
|---|---|
| Endpoint | respon a una petició real |
| Dades | no són ornamentals ni desconnectades del projecte |
| Resposta | té estructura clara i estable |
| Contracte | coincideix amb el comportament observat |
| Demo | mostra petició i resposta |

## Criteris d'èxit

- El servei respon segons contracte.
- La resposta és consumible per un tercer.
- Les dades o accions són reals.
- L'alumnat pot assenyalar el codi que construeix la resposta.

## Què no és suficient

- Retornar un JSON estàtic sense motiu.
- Fer una ruta que només diu `ok`.
- Canviar el contracte sense documentar-ho.
- No provar l'endpoint fora del navegador si el context ho requereix.

## Ús de la IA

La IA pot donar pistes sobre un intent propi de ruta o serialització; l’alumnat implementa i prova la resposta segons el contracte.

## Suport i ampliació

Per a suport, limitar-se a un endpoint de lectura. Com ampliació, afegir validació d'entrada, filtres o resposta d'error més completa.

## Checklist de tancament

- [ ] Endpoint implementat.
- [ ] Resposta estructurada.
- [ ] Dades reals o acció real.
- [ ] Prova del cas correcte.
- [ ] Contracte actualitzat si cal.

## Connexió amb el microrepte posterior

`R4M3` protegirà el servei. Un endpoint funcional però obert sense control no és suficient quan el recurs és sensible.
