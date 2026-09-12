# R3S1. Arrencada del nou projecte

## Finalitat de la sessio

Esta sessio obri `R3` i transforma el projecte funcional de `R2` en una base nova en framework. L'objectiu no és migrar tota l'aplicacio, sinó deixar un projecte arrancable, reproduïble i amb una primera ruta real que permeta començar a treballar arquitectura, persistencia i fluxos en les sessions següents.

Al final de la sessio, cada equip ha de tindre stack triat, comparativa curta, Docker o entorn equivalent, `.env.example`, ruta inicial funcional i abast dels `2` casos d'us que desenvolupara en `R3`.

## Encaix dins del Repte 3

- **Repte**: `R3. Reconstruccio en framework, persistencia real i primers fluxos funcionals`
- **Microrepte**: `R3M1`
- **Sessio**: `R3S1`
- **Duracio orientativa**: `3 hores`
- **Focus**: decisio de stack, arrencada reproduïble, Docker, configuracio minima, ruta inicial i delimitacio de fluxos
- **No entra encara**: model de dades complet, migracio total de `R2`, autenticacio avançada, API, desplegament o refactoritzacio profunda

## Relacio amb RA i criteris de treball

| Element | Concrecio en el microrepte |
|---|---|
| `RA5.a` | identifica avantatges de separar responsabilitats en framework |
| `RA5.b` | compara opcions de framework i justifica la tria |
| `RA5.c` | reconeix estructura inicial del framework triat |
| `RA5.d` | prepara una base tecnica reproduïble |
| `RA5.e` | crea una primera ruta o resposta gestionada pel framework |
| `RA8.c` | genera una primera resposta web des del framework |
| Evidencia central | projecte arrancable amb ruta inicial i abast de `2` fluxos |

## Producte esperat

- Projecte base en `Laravel`, `Symfony`, `NestJS` o via excepcional autoritzada.
- Docker, `compose.yaml` o mecanisme equivalent documentat.
- `.env.example` o instruccions de configuracio.
- Ruta inicial, vista minima o `healthcheck`.
- Comparativa curta amb almenys una alternativa.
- Esquema abans/despres entre `R2` i la nova estructura.
- Issue principal de `R3` amb microtasques.
- Declaracio dels `2` casos d'us, indicant quin ve de `R2` i quin sera server-rendered.

## Preparacio previa del professorat

- Tindre una demo curta d'arrencada de l'stack majoritari.
- Portar un exemple de `.env.example` sense secrets.
- Preparar una comparativa curta `Laravel` / `Symfony` / `NestJS`.
- Tindre una plantilla d'issue de `R3`.
- Preparar exemples de casos d'us massa grans i com retallar-los.
- Definir criteri de bloqueig: sense projecte arrancable no es valida `R3M1`.

## Continguts a explicar

- Diferencia entre base funcional de `R2` i reconstruccio acotada de `R3`.
- Que significa separar ruta, controlador, vista/resposta i model o equivalents.
- Per que Docker i `.env.example` formen part de la reproduïbilitat.
- Com decidir `2` fluxos viables sense prometre migrar tot el producte.
- Com registrar temps, commits i decisions inicials.

## Sequencia d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:55. Obertura de R3 i abast

El professorat recorda que `R3` parteix de `R2`, pero no el reescriu sencer.

Tasques:

- revisar quin flux de `R2` es conservara com a referencia;
- decidir quins `2` casos d'us entren en `R3`;
- marcar quin cas sera server-rendered;
- obrir issue principal de `R3`.

### 0:55-1:15. Tria i justificacio de stack

El professorat modela una comparativa curta.

Tasques:

- triar stack;
- comparar-lo amb una alternativa;
- escriure un avantatge concret de separacio de responsabilitats;
- fer esquema abans/despres respecte a `R2`.

### 1:15-1:55. Arrencada tecnica

L'alumnat crea o estabilitza el projecte base.

Tasques:

- inicialitzar projecte;
- preparar Docker o entorn equivalent;
- configurar variables minimes;
- crear `.env.example`;
- verificar arrencada.

### 1:55-2:20. Primera ruta

L'alumnat crea una ruta o vista minima.

Tasques:

- crear ruta inicial, controlador o equivalent;
- generar una resposta visible;
- comprovar-ho des del navegador o terminal;
- registrar com executar-ho.

### 2:20-2:40. Traçabilitat

Tasques:

- fer commits d'inici i arrencada;
- documentar temps aproximat;
- deixar issue amb microtasques;
- registrar ajuda d'IA si ha afectat arrencada o decisio.

### 2:40-2:50. Checkpoint

Cada equip mostra:

- aplicacio arrancada;
- ruta inicial;
- `.env.example`;
- comparativa curta;
- `2` casos d'us declarats.

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Triar stack i justificar-lo.
- Comparar-lo amb una alternativa.
- Crear projecte base.
- Preparar Docker o entorn equivalent reproduïble.
- Configurar `.env.example`.
- Crear ruta inicial.
- Obrir issue de `R3`.
- Declarar els `2` casos d'us.
- Fer almenys commits d'inici, arrencada i tancament.

## Evidencies minimes

| Evidencia | Minim acceptable |
|---|---|
| Arrencada | el projecte arranca amb instruccions |
| Ruta inicial | resposta visible generada pel framework |
| Configuracio | `.env.example` o instruccions sense secrets |
| Comparativa | stack triat comparat amb una alternativa |
| Abast | `2` casos d'us declarats i acotats |
| Traçabilitat | commits i registre de temps aproximat |

## Criteris d'exit

- El projecte arranca en un entorn reproduïble.
- El framework no queda com a carpeta buida.
- La tria tecnica esta justificada.
- L'abast de `R3` és viable.
- Una altra persona pot seguir les instruccions d'arrencada.

## Que no és suficient

- Instal·lar dependències sense poder arrancar.
- Copiar una comparativa generica de frameworks.
- No declarar els fluxos.
- Guardar secrets reals en `.env.example`.
- Dir que es migrara tota l'aplicacio.

## Us de la IA

La IA pot ajudar amb errors d'instal·lacio, Docker, comparativa i passos d'arrencada. L'alumnat ha de verificar l'execucio real i documentar que ha acceptat, modificat o rebutjat.

## Suport per a alumnat amb dificultats

- Oferir plantilla de `compose.yaml`.
- Permetre començar amb ruta `healthcheck`.
- Reduir els fluxos a un llistat i un detall.
- Revisar variables d'entorn en parella.

## Ampliacio per a alumnat avançat

- Afegir comprovacio automatica d'arrencada.
- Documentar dues formes d'execucio.
- Preparar primer controlador real sense avançar persistencia.

## Checklist de tancament

- [ ] Projecte arranca.
- [ ] Hi ha ruta inicial visible.
- [ ] Hi ha `.env.example` o instruccions.
- [ ] Hi ha comparativa curta.
- [ ] Hi ha issue de `R3`.
- [ ] Hi ha `2` casos d'us acotats.
- [ ] Hi ha commits i temps aproximat.

## Connexio amb el microrepte posterior

`R3M2` necessita esta base per crear BBDD real, migracions o mecanisme equivalent, càrrega inicial reproduïble i primera lectura de dades. Si `R3M1` no arranca, la persistencia quedara desconnectada.

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT07. Migrar un cas d'ús a framework](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT07-Migrar-un-cas-dus-a-framework.pdf)
- **Teoria o material associat**: [Docker, entorn i arrencada reproduïble](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R3-Docker-entorn-i-arrencada-reproduible.pdf) i [Framework MVC i responsabilitats](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R3-Framework-MVC-i-responsabilitats.pdf)

## Microtaller associat

- **Microtaller**: `MT07. Migrar un cas d'ús a framework`
- **Moment recomanat**: quan s'inicia el projecte en framework i cal decidir què continua de `R2`.
- **Evidència mínima**: mapa entre flux antic en PHP base i flux nou en framework.
