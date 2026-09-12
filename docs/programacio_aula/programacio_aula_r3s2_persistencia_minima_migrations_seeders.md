# R3S2. Persistencia minima amb migracions, fixtures/seeders o equivalent

## Finalitat de la sessio

Esta sessio converteix la base arrancable de `R3M1` en una aplicacio amb BBDD real i dades reproduïbles. El centre no és dissenyar tot el model final, sinó crear un esquema minim que servisca als `2` fluxos declarats i que es puga reconstruir amb migracions o mecanisme equivalent i amb una càrrega inicial reproduïble.

## Encaix dins del Repte 3

- **Repte**: `R3. Reconstruccio en framework, persistencia real i primers fluxos funcionals`
- **Microrepte**: `R3M2`
- **Sessio**: `R3S2`
- **Duracio orientativa**: `3 hores`
- **Focus**: connexio a BBDD, esquema minim, migracions o equivalent, fixtures/seeders o script de càrrega, lectura real i conjunt de dades usable
- **No entra encara**: model complet de tot el producte, relacions complexes, optimitzacio, API o permisos avançats

## Relacio amb RA i criteris de treball

| Element | Concrecio en el microrepte |
|---|---|
| `RA6.a` | configura connexio a un magatzem de dades real |
| `RA6.b` | defineix estructura inicial de dades |
| `RA6.c` | recupera dades reals des de l'aplicacio |
| `RA6.d` | tracta dades recuperades de manera ordenada |
| `RA6.e` | deixa dades inicials reproduïbles |
| `RA5.f` | connecta persistencia amb estructura del framework |
| Evidencia central | BBDD reconstruïble amb dades que alimenten un flux |

## Producte esperat

- Connexio de BBDD configurada.
- Migracions o mecanisme equivalent executable.
- Fixtures/seeders o script equivalent.
- Dades de prova vinculades als fluxos.
- Lectura real des de l'aplicacio o consola.
- Conjunt de dades preparat per a llistat, detall, filtre o resposta.
- Instruccions per reiniciar BBDD i carregar dades.

## Preparacio previa del professorat

- Preparar exemple de migracio simple o mecanisme equivalent de l'stack.
- Preparar exemple de fixture, seeder o script de càrrega.
- Tindre pauta de model minim: camps necessaris, no inventari complet.
- Preparar comprovacio de reset de BBDD.
- Definir exemples de dades suficients per a llistat/detall.

## Continguts a explicar

- Diferencia entre persistencia real i arrays de prova.
- Relacio entre flux, entitat, esquema, model/capa de dades i càrrega inicial.
- Per que les dades manuals no són evidència suficient.
- Com recuperar un conjunt de dades i preparar-lo per a una resposta.
- Com documentar comandes de migracio i càrrega de dades.

## Sequencia d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:55. Recuperacio de R3M1 i fluxos

Tasques:

- comprovar que el projecte arranca;
- revisar els `2` fluxos declarats;
- identificar entitats o taules minimes;
- descartar camps que no s'usaran.

### 0:55-1:15. Modelatge docent

El professorat mostra:

- una migracio simple o mecanisme equivalent;
- un model o entitat;
- un fixture, seeder o script de càrrega;
- una lectura real;
- reset complet de BBDD.

### 1:15-1:55. Implementacio d'esquema

Tasques:

- configurar connexio;
- crear migracions o mecanisme equivalent;
- executar-les;
- revisar estructura creada;
- registrar decisions de camps.

### 1:55-2:25. Dades inicials i lectura

Tasques:

- crear fixtures/seeders o script equivalent;
- carregar dades;
- recuperar un conjunt de dades;
- preparar-lo per a vista, llistat, filtre, detall o resposta.

### 2:25-2:45. Verificacio i documentacio

Tasques:

- reiniciar BBDD;
- executar migracions i càrrega inicial;
- documentar comandes;
- registrar evidencies i temps.

### 2:45-2:50. Checkpoint

Cada equip mostra:

- migracions o equivalent;
- fixtures/seeders o script equivalent;
- dades carregades;
- lectura real;
- instruccions de reset.

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Definir esquema minim.
- Configurar connexio.
- Crear i executar migracions o mecanisme equivalent.
- Crear fixtures/seeders o script equivalents.
- Recuperar conjunt de dades.
- Preparar eixe conjunt per alimentar un flux.
- Documentar reset i carrega.

## Evidencies minimes

| Evidencia | Minim acceptable |
|---|---|
| BBDD | creada des de migracions o mecanisme equivalent |
| Dades | carregades amb fixtures/seeders o script equivalent |
| Lectura | consulta real que retorna conjunt de dades |
| Us | dades preparades per a un flux |
| Documentacio | comandes de migracio i càrrega de dades |
| Traçabilitat | commits i registre de temps aproximat |

## Criteris d'exit

- La BBDD es pot reconstruir de zero.
- Les taules responen als fluxos triats.
- Les dades no es carreguen manualment.
- La lectura no queda aïllada: alimenta o prepara un flux.
- L'alumnat pot explicar per que ha triat eixos camps.

## Que no és suficient

- Crear taules sense us.
- Fer una BBDD manual fora del repositori.
- Posar dades en arrays.
- No documentar comandes.
- Fer una consulta solta que no arriba a cap flux.

## Us de la IA

La IA pot ajudar amb camps, migracions, fixtures/seeders, scripts de càrrega i errors de connexio. L'alumnat ha de validar que el model respon al seu domini i que la BBDD es pot reconstruir.

## Suport per a alumnat amb dificultats

- Reduir a una entitat principal i dades minimes.
- Donar exemple de migracio equivalent a l'stack.
- Revisar `.env` i serveis de BBDD.
- Proposar `3-5` registres de prova suficients.

## Ampliacio per a alumnat avançat

- Afegir una relacio simple si aporta valor al flux.
- Crear factory o fixture més completa.
- Afegir comprovacio automatica de migracio i càrrega inicial.

## Checklist de tancament

- [ ] Connexio configurada.
- [ ] Migracions executades.
- [ ] Fixtures/seeders o càrrega equivalent funcionen.
- [ ] Hi ha lectura real.
- [ ] Les dades alimenten o preparen un flux.
- [ ] Hi ha instruccions de reset.
- [ ] Hi ha commits i temps aproximat.

## Connexio amb el microrepte posterior

`R3M3` utilitzara esta persistencia per reconstruir un primer cas d'us complet heretat de `R2`. Sense dades reals, el flux quedara com una pantalla o demo ficticia.

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT08. Migracions, seeders i dades de prova](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT08-Migracions-seeders-i-dades-de-prova.pdf)
- **Teoria o material associat**: [Persistència, migracions i seeders](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R3-Persistencia-migracions-i-seeders.pdf)

## Microtaller associat

- **Microtaller**: `MT08. Migracions, seeders i dades de prova`
- **Moment recomanat**: abans de donar per tancada la primera persistència real.
- **Evidència mínima**: migracions executables de zero, dades inicials i instrucció de reproducció.
