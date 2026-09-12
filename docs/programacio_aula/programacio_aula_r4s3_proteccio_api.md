# R4S3. Autenticació i control d'accés de l'API

## Finalitat de la sessió

Esta sessió treballa `R4M3`: adaptar el control d'accés al context d'`API`. No es tracta de repetir el login de `R2`, sinó de demostrar que el servei publicat respon de manera diferent quan la petició està autoritzada, no autoritzada o mal formada.

Al final de la sessió, cada equip ha de poder mostrar un cas autoritzat, un cas denegat i el punt del codi on es comprova l'accés.

## Encaix dins del Repte 4

- **Repte**: `R4. API i serveis reutilitzables`
- **Microrepte**: `R4M3`
- **Sessió**: `R4S3`
- **Duració orientativa**: `3 hores`
- **Focus**: token, capçalera, clau o mecanisme coherent; cas autoritzat; cas denegat; resposta d'error clara
- **No entra encara**: sistema complet d'identitats, permisos avançats o seguretat de producció

## Relació amb RA i criteris de treball

| Element | Concreció en el microrepte |
|---|---|
| `RA7.e` | servei publicat amb accés controlat |
| `RA7.f` | comprovació de cas correcte i cas incorrecte |
| Evidència central | peticions autoritzades i denegades |
| Verificació docent | execució en directe i pregunta sobre on es comprova l'accés |

## Producte esperat

- Mecanisme de control d'accés coherent amb l'stack.
- Cas autoritzat que obté resposta correcta.
- Cas sense credencial o amb credencial incorrecta.
- Error d'API amb codi i missatge coherents.
- Documentació mínima d'ús de la credencial.

## Preparació prèvia del professorat

- Portar exemples de capçalera `Authorization`, token simple o clau d'API.
- Explicar que el mínim és didàctic, no seguretat completa de producció.
- Preparar prova negativa per absència de credencial.

## Seqüència d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:50. Risc d'una API oberta

Discussió breu sobre quins recursos poden ser públics i quins no.

### 0:50-1:10. Modelatge de protecció

El professorat mostra una comprovació mínima i respostes `401`, `403` o equivalents.

### 1:10-1:45. Implementació del control

L'alumnat incorpora el mecanisme triat a l'endpoint o conjunt mínim d'endpoints.

### 1:45-2:15. Prova positiva i negativa

Es prova amb credencial correcta, sense credencial i amb credencial incorrecta.

### 2:15-2:35. Documentació del comportament

S'afegeix al README o document d'API com s'envia la credencial i què passa si falla.

### 2:35-2:50. Checkpoint docent

Demo autoritzada i denegada.

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Triar mecanisme de protecció adequat al nivell.
- Implementar comprovació real.
- Retornar error coherent quan falta o falla la credencial.
- Provar cas autoritzat i denegat.
- Documentar com enviar la credencial.

## Evidències mínimes

| Evidència | Mínim acceptable |
|---|---|
| Control d'accés | no és només decoratiu |
| Cas autoritzat | retorna la resposta esperada |
| Cas denegat | bloqueja l'accés amb codi coherent |
| Documentació | explica com autenticar la petició |
| Demo | mostra els dos comportaments |

## Criteris d'èxit

- La protecció és observable.
- El comportament d'error és coherent.
- L'alumnat sap on i quan es comprova l'accés.
- El mecanisme no contradiu el contracte.

## Què no és suficient

- Posar un token al README però no comprovar-lo.
- Retornar sempre el mateix resultat.
- Fer login web complet si no cal.
- No provar cas denegat.

## Ús de la IA

La IA pot suggerir patrons, però l'alumnat ha de justificar la tria i demostrar que el control funciona.

## Suport i ampliació

Per a suport, usar una clau d'API didàctica i documentada. Com ampliació, separar permisos, rols o scopes simples.

## Checklist de tancament

- [ ] Mecanisme triat i justificat.
- [ ] Cas autoritzat.
- [ ] Cas denegat.
- [ ] Error coherent.
- [ ] Documentació actualitzada.

## Connexió amb el microrepte posterior

`R4M4` consumirà el servei. El consumidor ha de saber enviar credencials i tractar errors.
