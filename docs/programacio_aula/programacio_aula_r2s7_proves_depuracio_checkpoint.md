# R2S7. Proves, depuracio i checkpoint tecnic

## Finalitat de la sessio

Esta sessio comprova el flux complet de `R2`: entrada, validacio, reintent, guardat funcional, regla del projecte, estat i operacio protegida. El focus és provar, depurar, documentar i deixar una demo reproduïble abans de crear la primera peça testable amb POO i Composer.

L'objectiu no és afegir funcionalitats noves, sinó demostrar que el que ja existeix funciona amb casos positius, negatius i d'invalidacio.

En este punt encara no es demanen proves unitàries ni `PHPUnit` com a mínim. Sense classes ni separacio forta de responsabilitats, forçar unit testing seria prematur. El que sí s'introdueix és una **prova automàtica lleugera de flux**, de caixa negra, que comprove una resposta observable del sistema amb una eina simple.

## Encaix dins del Repte 2

- **Repte**: `R2. Processament bàsic, estat, autenticació i primera funcionalitat protegida`
- **Microrepte**: `R2M7`
- **Sessio**: `R2S7`
- **Duracio orientativa**: `3 hores`
- **Focus**: checklist de proves, primera prova automàtica lleugera de flux, depuracio, documentacio i demo reproduïble
- **No entra encara**: proves unitàries obligatòries, `PHPUnit` com a mínim, mocks, refactoritzacio profunda, noves pantalles grans o migracio a framework

## Relacio amb RA i criteris de treball

| Element | Concrecio en el microrepte |
|---|---|
| `RA4.f` | prova, depuracio i documentacio del comportament real |
| Prova manual | taula de proves executada amb resultats reals |
| Prova automàtica lleugera | script, comanda o col·leccio que comprove almenys un cas observable del flux |
| Evidencia central | taula de proves, prova automàtica simple i README actualitzat |
| Verificacio docent | execucio d'un cas triat pel professorat i execucio o revisio de la prova automàtica |

## Producte esperat

Una bateria mínima de proves amb:

- cas vàlid;
- cas invàlid per validacio;
- reintent amb dades conservades;
- regla del projecte amb dos resultats;
- estat recuperat i invalidat;
- accés no autenticat denegat;
- accés autenticat permés;
- logout o invalidacio i nou intent denegat;
- almenys una prova automàtica lleugera de flux, per exemple `curl`, script `.sh`, script PHP senzill o col·leccio de peticions documentada;
- incidencies detectades o confirmacio explícita que no n'hi ha;
- README o guia de reproduccio actualitzada.

La prova automàtica pot ser molt simple. Per exemple:

```bash
curl -i http://localhost:8000/protegida.php
```

o, si cal provar sessio:

```bash
curl -c cookies.txt -d "email=a@a.com&password=secret" http://localhost:8000/login.php
curl -b cookies.txt http://localhost:8000/protegida.php
```

El criteri no és tindre una suite formal, sinó començar a convertir una comprovacio manual repetitiva en una comprovacio executable.

## Preparacio previa del professorat

Convé preparar:

- plantilla de taula amb entrada, passos, resultat esperat, resultat real i incidencia;
- exemple d'ús de navegador, terminal, logs, `curl` o eina equivalent;
- exemple de script `tests/flux-r2.sh` o `tests/check-protegida.sh`;
- exemple de comprovacio automàtica simple: codi HTTP, text esperat o redireccio;
- criteri de prioritzacio d'incidencies bloquejants;
- recordatori que primer es reprodueix l'error i després es corregeix.

## Seqüencia d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:55. Bateria mínima comuna

Presentar la bateria i els camps de registre.

Resultat: cada equip té una taula o checklist preparada.

### 0:55-1:15. Modelatge de registre, depuracio i prova automàtica mínima

Mostrar com anotar:

- entrada;
- passos;
- resultat esperat;
- resultat real;
- incidencia;
- correccio i nova prova.

Mostrar també una prova automàtica mínima:

- una comanda `curl`;
- un script curt en `tests/`;
- una comprovacio de text, codi HTTP o redireccio;
- ús de cookies si es prova login o accés protegit.

Resultat: l'alumnat sap què vol dir provar de manera reproduïble.

### 1:15-1:45. Execucio de proves manuals

Tasques:

- executar els casos mínims;
- registrar resultat real;
- marcar bloquejos;
- capturar o descriure evidencies si cal.

Resultat: hi ha una primera bateria executada.

### 1:45-2:00. Primera prova automàtica lleugera

Tasques:

- triar un cas observable i estable;
- escriure una comanda o script simple;
- comprovar una resposta esperada;
- documentar com executar-lo;
- evitar convertir-ho en una suite complexa.

Resultat: hi ha almenys una comprovacio executable del flux.

### 2:00-2:20. Depuracio guiada

Tasques:

- corregir primer errors que trenquen el flux;
- repetir el cas fallit;
- deixar constancia de la correccio;
- no obrir funcionalitats noves.

Resultat: els bloquejos principals queden resolts o documentats.

### 2:20-2:35. Documentacio mínima

Tasques:

- actualitzar `README`;
- afegir usuaris de prova;
- indicar operacio protegida;
- indicar com provocar error, cas correcte i denegacio;
- indicar com executar la prova automàtica lleugera;
- marcar una regla o comprovació candidata a convertir-se en classe testable en `R2M7`.

Resultat: la demo és reproduïble.

### 2:35-2:50. Checkpoint tecnic

El professorat tria un cas de la taula i demana executar-lo.

També pot demanar executar o llegir la prova automàtica lleugera.

Pregunta: quins casos demostren que el flux complet és reproduïble amb errors, estat i permisos controlats, i quin cas has començat a automatitzar?

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Preparar checklist o taula de proves.
- Executar casos positius i negatius.
- Crear almenys una prova automàtica lleugera de flux.
- Registrar incidencies.
- Depurar bloquejos.
- Repetir proves fallides.
- Actualitzar README.
- Marcar una regla o comprovació candidata per a `R2M7`.

## Evidencies minimes

| Evidencia | Minim acceptable |
|---|---|
| Taula | casos amb entrada, passos i resultats |
| Prova automàtica | script, comanda o col·leccio que execute almenys un cas observable |
| Cas vàlid | flux accepta dades correctes |
| Cas invàlid | error interpretable i correccio |
| Estat | recuperacio i invalidacio provades |
| Auth | cas no autenticat i autenticat |
| Incidencies | errors registrats o absencia explícita |
| README | demo reproduïble |

## Criteris d'exit

- No es prova només el camí feliç.
- La documentacio permet repetir la demo.
- Hi ha almenys una comprovacio executable del flux.
- La prova automàtica és de caixa negra o flux, no unitària.
- Els casos registrats coincideixen amb el comportament real.
- Els errors bloquejants estan corregits o identificats.
- Hi ha una regla o comprovació concreta candidata a classe testable.

## Que no és suficient

- Llista de proves sense executar.
- Dir que hi ha prova automàtica però no indicar com executar-la.
- Confondre este mínim amb proves unitàries obligatòries.
- Captures sense passos.
- README desactualitzat.
- Corregir sense reproduir.
- Afegir funcionalitats noves en lloc de tancar el flux.

## Us de la IA

La IA pot ajudar a generar casos addicionals, interpretar errors o proposar una comanda `curl`. Control: la bateria mínima comuna ha d'estar executada, els resultats han de ser reals i la prova automàtica ha de poder executar-se o revisar-se.

## Suport per alumnat amb més dificultat

Reduir a cinc casos manuals: vàlid, invàlid, estat invalidat, no autenticat i autenticat. Per a la part automàtica, una sola comanda `curl` contra una ruta protegida o una resposta d'error és suficient.

## Ampliacio per alumnat avançat

- Més proves automatitzades simples.
- Script amb diverses peticions i cookies.
- Col·leccio de peticions.
- Logs o captures comparatives.
- Matriu d'incidencies prioritzades.

## Checklist de tancament

- [ ] He executat cas vàlid.
- [ ] He executat cas invàlid.
- [ ] He provat reintent.
- [ ] He provat estat i invalidacio.
- [ ] He provat accés denegat.
- [ ] He provat accés permés.
- [ ] He creat almenys una prova automàtica lleugera de flux.
- [ ] He documentat com executar-la.
- [ ] He registrat incidencies.
- [ ] He actualitzat README.
- [ ] He triat una regla o comprovació candidata a classe testable.

## Connexio amb R2M7

`R2M7` parteix d'un flux provat. La pregunta de pas és:

Quina regla o comprovació del flux funciona ja i es podria provar millor si la convertim en una classe simple?

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT06. Debugging i prova curta](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT06-Debugging-i-prova-curta.pdf)
- **Teoria o material associat**: [Proves, depuració i checkpoint](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R2-Proves-depuracio-i-checkpoint.pdf)

## Microtaller associat

- **Microtaller**: `MT06. Debugging i prova curta`
- **Moment recomanat**: abans del checkpoint de tancament de `R2`.
- **Evidència mínima**: una prova curta reproduïble i una correcció o limitació registrada.
