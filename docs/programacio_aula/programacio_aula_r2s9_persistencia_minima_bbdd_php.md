# R2S9. Persistencia minima amb BBDD en PHP

## Finalitat de la sessio

Esta sessio tanca el nucli de `R2` introduint una persistencia real, però molt acotada, amb `PHP` pur. Fins ara el projecte podia conservar dades en arrays, fitxers, sessio o estructures provisionals. Ara una part significativa del flux ha de quedar guardada en una base de dades i poder recuperar-se després.

L'objectiu no és construir encara una arquitectura de `R3`, ni usar `ORM`, ni obrir migracions formals. L'objectiu és entendre el recorregut mínim: configuracio de connexio, taula, `INSERT`, `SELECT`, consultes preparades, tractament d'errors i instruccions de reproduccio.

## Encaix dins del Repte 2

- **Repte**: `R2. Processament bàsic, estat, autenticació i primera funcionalitat protegida`
- **Microrepte**: `R2M9`
- **Sessio**: `R2S9`
- **Duracio orientativa**: `3 hores`
- **Focus**: persistencia mínima amb `PDO`, una taula útil, una alta i una consulta vinculades al flux existent
- **No entra encara**: ORM, migracions o equivalent, dades inicials reproduïbles pròpies de framework, repositoris complexos, administracio completa de BBDD o reescriptura arquitectonica

## Relacio amb RA i criteris de treball

| Element | Concrecio en el microrepte |
|---|---|
| `RA3` | reutilitzar dades validades del flux i convertir-les en una operacio coherent |
| `RA4` | mantindre la coherencia amb sessio, autenticacio o operacio protegida ja creada |
| Introduccio a `RA6` | primer accés real a BBDD des de `PHP` amb connexio, consultes preparades i recuperacio de dades |
| Preparacio cap a `R3` | entendre la persistencia abans de migracions o equivalent, càrrega inicial reproduïble i ORM |
| Evidencia central | alta i lectura de dades reals en BBDD, reproduïbles des del projecte |
| Verificacio docent | execucio d'una insercio, consulta posterior i revisio de configuracio sense secrets |

## Producte esperat

Una persistencia mínima que incloga, com a mínim:

- una taula relacionada amb el domini del projecte;
- un script SQL, instruccions de creacio o mecanisme reproduïble equivalent;
- configuracio de connexio separada del codi principal;
- cap secret real pujat al repositori;
- connexio amb `PDO` o mecanisme equivalent justificat;
- almenys una operacio d'alta amb dades ja validades pel flux;
- almenys una operacio de lectura, llistat o detall;
- consultes preparades quan hi haja dades d'usuari;
- tractament bàsic d'errors de connexio o consulta;
- prova manual documentada o script simple que demostre alta i lectura;
- nota breu explicant què queda pendent per a `R3`.

## Preparacio previa del professorat

Convé preparar:

- exemple mínim de connexio `PDO` amb `SQLite` o `MySQL`;
- exemple de `config/database.php` o `.env.example` sense secrets;
- exemple de `schema.sql`;
- criteri clar sobre quin motor s'usarà al grup;
- recordatori de consultes preparades;
- exemple d'error habitual: credencial incorrecta, taula inexistent o columna mal escrita;
- criteri de tancament: no es valida com a BBDD si només hi ha un array o un fitxer de text.

Exemple orientatiu:

```text
config/
  database.php
database/
  schema.sql
src/
  Connexio.php
public/
  crear.php
  llistar.php
```

## Seqüencia d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:50. Tria de la dada que mereix persistir

Tasques:

- revisar què s'estava guardant provisionalment en `R2`;
- triar una dada útil del domini, no una prova artificial;
- decidir quins camps mínims necessita la taula;
- identificar des de quin formulari o accio protegida arribarà la dada.

Resultat: cada equip sap què guardarà i per què.

### 0:50-1:15. Modelatge docent de connexio i taula

Mostrar:

- estructura mínima de carpetes;
- fitxer de configuracio sense secrets reals;
- connexio `PDO`;
- `schema.sql`;
- diferència entre valor fix i valor que ve de l'usuari;
- per què cal consulta preparada.

Resultat: l'alumnat veu el flux complet abans de copiar codi.

### 1:15-1:40. Creacio de la taula i connexio

Tasques:

- crear la taula o documentar com crear-la;
- configurar la connexio;
- comprovar error de connexio de manera controlada;
- deixar instruccions en `README`.

Resultat: el projecte pot connectar amb la BBDD i la taula existix.

### 1:40-2:10. Alta amb dades del flux

Tasques:

- reutilitzar dades validades del formulari o de l'accio protegida;
- inserir-les amb consulta preparada;
- evitar concatenar dades d'usuari dins de l'SQL;
- mostrar confirmacio o error interpretable.

Resultat: una dada real del projecte queda guardada en BBDD.

### 2:10-2:30. Lectura i verificacio

Tasques:

- crear un llistat, detall o consulta mínima;
- comprovar que es recupera la dada acabada d'inserir;
- provar cas d'error o taula buida;
- documentar el cas provat.

Resultat: el projecte no només escriu, també recupera informació persistent.

### 2:30-2:50. Tancament i pont cap a R3

Tasques:

- explicar què ha canviat respecte a arrays, fitxers o sessio;
- indicar què falta per a una persistencia professional;
- anotar què es podria convertir en migracio, seeder, model o repositori en `R3`;
- deixar commit i evidència de prova.

Pregunta de checkpoint: quina dada del teu projecte sobreviu ara a tancar la sessio o reiniciar el navegador?

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Triar una dada significativa del projecte.
- Crear o documentar la taula mínima.
- Separar la configuracio de connexio.
- Evitar secrets reals al repositori.
- Crear una connexio `PDO` o equivalent justificat.
- Fer una alta amb dades validades.
- Fer una lectura posterior.
- Usar consultes preparades quan entren dades d'usuari.
- Documentar com reproduir la BBDD.
- Explicar què queda per a `R3`.

## Evidencies minimes

| Evidencia | Minim acceptable |
|---|---|
| Taula | taula o script SQL relacionat amb el domini |
| Configuracio | connexio separada i sense secrets reals |
| Alta | `INSERT` funcional amb dades del flux |
| Lectura | `SELECT` funcional que mostra dades persistides |
| Seguretat bàsica | consulta preparada en dades d'usuari |
| Reproduccio | instruccions per crear taula i provar alta/lectura |
| Pont a `R3` | nota sobre què es professionalitzarà després |

## Criteris d'exit

- La dada persistida té sentit dins del projecte.
- La BBDD no substituïx l'autenticacio ni la validacio: les complementa.
- La connexio no està duplicada en molts fitxers.
- Les credencials reals no estan pujades al repositori.
- Les consultes amb dades externes són preparades.
- Es pot demostrar alta i lectura.
- El projecte continua funcionant després d'afegir la BBDD.
- L'alumnat sap explicar la diferència entre sessio, cookie, fitxer provisional i BBDD.

## Que no és suficient

- Fer només un `schema.sql` sense usar-lo.
- Guardar en un array i dir-li base de dades.
- Fer un `INSERT` amb valors fixos que no venen del flux.
- Fer només connexio sense alta ni lectura.
- Concatenar directament dades d'usuari en una consulta.
- Pujar contrasenyes reals o dades sensibles.
- Introduir un ORM o framework sense entendre el mínim.

## Us de la IA

La IA pot ajudar a escriure un exemple de `PDO`, revisar un `schema.sql` o proposar una consulta preparada. Control: l'alumnat ha d'adaptar noms de taula i camps al seu projecte, executar el cas i explicar què passa si la taula no existix o la connexio falla.

## Suport per alumnat amb més dificultat

Reduir-ho a `SQLite` i una taula molt simple:

- `id`;
- `titol` o `nom`;
- `estat` o `tipus`;
- `created_at`.

Una alta i un llistat són suficients si estan connectats al flux real.

## Ampliacio per alumnat avançat

- Afegir una segona consulta filtrada.
- Relacionar la dada amb l'usuari autenticat.
- Afegir una prova automàtica simple de persistencia amb BBDD temporal.
- Usar `.env` amb `vlucas/phpdotenv` si ja s'ha introduït Composer.
- Preparar un `seed.sql` inicial per a `R3`.

## Checklist de tancament

- [ ] He triat una dada significativa del projecte.
- [ ] He creat o documentat la taula.
- [ ] He separat la configuracio de connexio.
- [ ] No he pujat secrets reals.
- [ ] He fet una alta amb dades validades.
- [ ] He fet una lectura posterior.
- [ ] He usat consulta preparada quan entren dades d'usuari.
- [ ] He documentat com reproduir la BBDD.
- [ ] He comprovat que el flux continua funcionant.
- [ ] He explicat què queda per a `R3`.

## Connexio amb R3

`R3` convertirà esta persistencia mínima en una persistencia més professional: migracions o equivalent, càrrega inicial reproduïble, models, validacions més ordenades i proves més sòlides. La idea important és que l'alumnat arribe a `R3` sabent ja què significa guardar i recuperar dades reals des del backend.

## Registre de l’ampliació global al final de R2

En R2M9 es recull una única proposta d’ampliació del repte (0–1), amb declaració `docs/r2-ampliacio.md`. En la presentació el professorat comprova mínims, demo i comprensió, valida els punts i deixa observació. El programa calcula `0,9 × mitjana ponderada del nucli + ampliació validada`; no suma en les dimensions del microrepte ni en cada RA. Pendent de revisió no és zero.
