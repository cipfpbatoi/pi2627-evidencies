# Dashboard del professor

El dashboard és una interfície local per llançar la correcció massiva sense navegar per GitHub Actions.

## Configuració

Crea un fitxer `.env` en l'arrel del repositori:

```text
GITHUB_TOKEN=
GITHUB_OWNER=igomis
GITHUB_REPO=dwes-microreptes-autocorreccio
GITHUB_REF=main
GITHUB_CLASSROOM_ORG=batoi-dwes-2026
GITHUB_STUDENT_TEMPLATE=igomis/dwes-microreptes-alumnes
GH_BIN=gh
GH_TOKEN=
DASHBOARD_HOST=127.0.0.1
DASHBOARD_PORT=4173
DASHBOARD_AUTH_REQUIRED=false
DASHBOARD_USER=
DASHBOARD_PASSWORD=
DASHBOARD_DOCS_PROFESSORAT_URL=https://igomis.github.io/reestructuracioModul/professorat/
DASHBOARD_DOCS_ALUMNAT_URL=https://cipfpbatoi.github.io/dwes2627/
```

El `GITHUB_TOKEN` ha de poder executar workflows en `igomis/dwes-microreptes-autocorreccio`. El workflow de GitHub també necessita el secret `CLASSROOM_AUTOGRADE_TOKEN` configurat en el repositori del professor per llegir els repositoris privats d'alumnes i, si cal, publicar-hi resultats.

Per crear, convidar col·laboradors o esborrar repositoris d'alumnes des del dashboard, configura `GH_TOKEN` amb un token del compte docent que tinga permisos sobre l'organització. En tokens clàssics, normalment calen `repo` i `delete_repo`, a més de permisos d'administració en l'organització/repositori. En tokens fine-grained, dona accés a l'organització i permisos de `Administration` en els repositoris afectats. Si GitHub CLI retorna `Not Found (HTTP 404)` en una URL de `collaborators`, comprova primer que el login de l'alumne existeix i després que eixe `GH_TOKEN` pot veure i administrar el repositori privat.

El procés que executa el dashboard també ha de poder escriure en `course/`, perquè la creació de repositoris acaba actualitzant `course/student-repositories.txt` i els fitxers de grup. Si el servidor mostra `EACCES: permission denied, open '/var/www/autocorreccio/course/student-repositories.txt'`, corregeix el propietari o permisos del directori `course/` per a l'usuari del servei abans de reintentar. L'script comprova aquest permís abans de cridar GitHub per evitar repositoris creats però no registrats.

Si la creació del repositori funciona però falla la invitació de l'alumne, el dashboard manté el repositori registrat en `course/student-repositories*.txt` i mostra l'error d'invitació com a avís. Això permet reintentar després de corregir permisos o logins sense duplicar alumnes ni perdre els repositoris ja creats.

Els repositoris processats des del dashboard queden amb `main` com a branca per defecte. Si un repositori ja existia amb una altra branca per defecte, l'script crea `main` des de la branca actual i després actualitza el repositori perquè les correccions ordinàries apunten a `main`.

## Autenticació mínima

En local, l'autenticació està desactivada per defecte si el dashboard escolta només en `127.0.0.1`, `localhost` o `::1`.

Si el dashboard es publica darrere d'un domini, activa com a mínim Basic Auth i fes-lo servir sempre amb HTTPS:

```text
DASHBOARD_HOST=0.0.0.0
DASHBOARD_AUTH_REQUIRED=true
DASHBOARD_USER=professor
DASHBOARD_PASSWORD=canvia-aquesta-contrasenya
DASHBOARD_DOCS_PROFESSORAT_URL=https://el-teu-domini/professorat/
DASHBOARD_DOCS_ALUMNAT_URL=https://el-teu-domini/alumnat/
```

Quan `DASHBOARD_HOST` no és local, el dashboard exigeix usuari i contrasenya excepte si `DASHBOARD_AUTH_REQUIRED=false` s'ha indicat explícitament. No és recomanable desactivar-ho en un servidor públic.

## Enllaços de documentació

El dashboard pot mostrar enllaços externs configurats des de `.env`:

- `DASHBOARD_DOCS_PROFESSORAT_URL`: apareix dins del panell `Programació d'aula` com a accés a la documentació del professorat.
- `DASHBOARD_DOCS_ALUMNAT_URL`: apareix en el menú principal com a accés ràpid a la documentació de l'alumnat.

Si alguna variable queda buida, el seu enllaç no es mostra.

La pantalla `Alumnes` usa `GITHUB_CLASSROOM_ORG` i `GITHUB_STUDENT_TEMPLATE` com a valors per defecte per crear repositoris d'alumnes des d'un CSV. Es poden modificar des del formulari abans d'executar l'script.

Per crear o eliminar repositoris GitHub des del dashboard, el servidor ha de tindre GitHub CLI instal·lat i autenticat amb un compte amb permisos sobre l'organització:

```bash
which gh
gh auth status
```

Si el dashboard corre com a servei i apareix `spawn gh ENOENT`, indica la ruta absoluta en `.env`, per exemple `GH_BIN=/usr/bin/gh`.

El dashboard usa `GITHUB_TOKEN` per cridar l'API de GitHub quan llança workflows en el repositori docent. Per a GitHub CLI, usa l'autenticació guardada amb `gh auth login` o, si defineixes `GH_TOKEN`, eixe token explícit. Això evita que un `GITHUB_TOKEN` amb permisos parcials impedisca crear repositoris des d'una plantilla. No uses el token `CLASSROOM_AUTOGRADE_TOKEN` en `.env`: eixe és un secret d'Actions per al workflow, no el token del dashboard.

## Execució

```bash
npm run dashboard
```

Obri:

```text
http://localhost:4173
```

## Què permet fer

El dashboard està separat en aquestes vistes:

- `Correcció`: previsualització del que es corregirà, llançament de workflows i repositoris seleccionats.
- `Resultats`: últimes notes i visor del resultat complet.
- `Alumnes`: manteniment de nom, repositori i grup.
- `Microreptes`: taula de microreptes, visor de `challenge.json`, `rubric.json`, `prompt.md` i validació de pesos.
- `Programació`: consulta i edició de la programació d'aula per sessions llegida des de la còpia versionada `docs/programacio_aula`.

- Triar `all`, `2DAW-A`, `2DAW-B`, `2DAW-C` o `2DAW-D`.
- Triar un **Alumne concret** per llançar una correcció individual sense editar fitxers ni escriure repositoris a mà.
- Veure els repositoris del fitxer associat o els repositoris puntuals escrits manualment.
- Triar un **Microrepte a corregir** per a una execució puntual, o deixar `Configuració activa` per usar `course/active-challenges.json`.
- Veure abans de llançar la correcció: branca, microrepte resolt, RA avaluat i origen de l'assignació.
- Aplicar el criteri ordinari de branca corregible `main`; les branques alternatives només s'usen en recuperacions o incidències pactades.
- Llançar el workflow massiu en mode `mock` o `openai`.
- Consultar els últims resultats locals guardats en `grades/latest-grades.json`, quan existisca.
- Generar un **Informe classe** per a un grup i microrepte concret des de la vista `Resultats`.
- Obrir un visor del resultat amb nota, confiança, revisió docent, dimensions, punts forts, millores i feedback complet.
- Afegir, editar, filtrar i eliminar alumnes. Si tenen resultats associats, el dashboard mostra un avís i, en confirmar, esborra també eixos resultats. L'esborrat del repositori GitHub és opcional, destructiu i exigeix escriure el nom exacte del repositori.
- Importar alumnes des de `course/student-repositories.txt`.
- Sincronitzar els alumnes mantinguts en la BD cap als fitxers `course/student-repositories*.txt` que usa el workflow massiu.
- Crear repositoris privats d'alumnes des d'un CSV, amb organització, plantilla, prefix, grup per defecte i permisos configurables. La pantalla executa primer una prova sense crear repositoris i permet l'execució real amb confirmació.
- Consultar microreptes per repte, sessió, codi, pes dins del repte, dimensions de rúbrica i criteris que comprova cada dimensió.
- Editar microreptes de forma guiada: títol, resum, objectiu, pes dins del repte, evidències, senyals esperats, regles dures i dimensions de rúbrica.
- Validar abans de guardar que els pesos de la rúbrica sumen `1`; si la validació general falla, es restauren els JSON originals.
- Consultar la programació d'aula real d'un repte agrupada per sessions, amb vista docent renderitzada, edició directa del Markdown font i comentaris docents amb grup i data sobre com ha anat cada sessió.

La font docent principal continua sent `dwes-restructuracio-modul/docs/01_programacio_modul`. La carpeta `docs/programacio_aula` és una còpia sincronitzada dins d'este repositori perquè el dashboard no depenga d'un directori germà local per mostrar la vista `Programació`.
- Obrir ràpidament la pàgina d'Actions del workflow.

El dashboard no substitueix el workflow. Només és una capa més còmoda damunt de GitHub Actions.

## Ampliació global

Consulta [càlcul i validació de l’ampliació](ampliacio-repte.md). Es gestiona només des de l’últim microrepte i suma una sola vegada al repte complet.

## Grup en els comentaris de sessió

En Programació d’aula, cada comentari nou indica el grup (2DAW-A, 2DAW-B, 2DAW-C o 2DAW-D), la data i el text. El grup és obligatori i es mostra al costat de la data en l’historial. Això permet distingir com ha anat la mateixa sessió amb grups diferents.

En reiniciar el dashboard, la base de dades incorpora automàticament el camp `group_name`. Els comentaris anteriors es conserven i apareixen com a «Grup no indicat (comentari anterior)»; no se’ls assigna un grup per defecte.

## Enllaços de la programació d’aula

La sessió seleccionada inclou un enllaç directe a la seua pàgina en la documentació publicada del professorat. Els enllaços Markdown de la vista docent són clicables i s’obrin en una pestanya nova. Els camins relatius es resolen respecte del document original del professorat i els fitxers `.md` es convertixen en les pàgines del lloc web, conservant els fragments. La documentació publicada reflectix l’última publicació del lloc; guardar el Markdown al dashboard no publica eixe lloc automàticament.

## Branques de treball i entregues de l’alumnat

El flux és `microrepte/r2m1 → main`: una branca per treball d’aula i integració directa amb `git merge`, sense branca de repte, PR ni etiquetes en el procediment habitual. Es conserva cada branca de microrepte per consultar-la. La correcció continua llegint `main`, sense afegir criteris ni punts per usar branques.

Consulta la [guia única d’alumnat](https://cipfpbatoi.github.io/dwes2627/04_materials/guia_pujar_treball_autocorreccio.html). El professorat ha de comprovar que l’alumne convidat pot fer push a la branca de treball i a `main`, i que les regles no exigixen una PR per a este procediment. Esta documentació no modifica permisos dels repositoris existents.

## Consolidació del treball d’aula

La programació incorpora retorn, correcció guiada i diagnòstic dins de les tres hores. Consulta el [protocol docent](programacio_aula/retorn_i_consolidacio_microreptes.md). En el comentari de sessió, registra grup, errors comuns, ajustos i ajuda prevista. El seguiment individual es conserva en el registre docent. No s’han afegit estats automàtics, recorreccions ni canvis de notes.

Els microreptes no tenen recuperació individual. La recuperació del repte complet requereix valoració docent global i no substituïx automàticament les notes dels microreptes.

## Publicar fitxes de consolidació

En Programació, selecciona una sessió amb microrepte propi. El bloc «Consolidació» permet editar la fitxa en Markdown, guardar un esborrany i publicar-lo per a tot l’alumnat. No hi ha selecció de grup per a esta publicació.

Les 28 fitxes de R1M1–R5M5 estan preparades en `consolidation-drafts/`, fora de la web d’alumnat. Cada sessió amb microrepte propi carrega el seu model. Els esborranys editats es guarden en `tmp/consolidacio/` del servidor, sobreviuen als reinicis i tenen preferència sobre el model versionat: inclou esta carpeta en les còpies de seguretat i no l’esborres en neteges de temporals. Guardar no publica. Els models versionats poden ser consultables en el repositori docent si és públic; no són un sistema de control d’accés.

«Publicar» guarda el text de l’editor i crea un únic commit en `cipfpbatoi/dwes2627`, branca `master`, amb la pàgina i el seu enllaç en l’índex de consolidació. El menú d’alumnat enllaça eixe índex; només hi apareixen fitxes publicades. No cal clonar la documentació en el servidor del dashboard. Publicar una altra vegada actualitza la mateixa fitxa; si no hi ha canvis, no crea un commit buit.

Cal que `GITHUB_TOKEN` tinga accés a eixe repositori amb **Contents: write**. Es respecten les proteccions de branca; no es força l’actualització si hi ha canvis concurrents. La publicació usa l’API Git de GitHub i conserva la resta de l’arbre del repositori. El workflow existent reconstrueix la web després del commit. El missatge diferencia enviament a GitHub de construcció acabada, amb enllaços a la fitxa i a Actions. Si falla, l’esborrany es conserva i es pot tornar a provar.

La publicació no envia missatges a l’alumnat, no llança autocorreccions i no modifica qualificacions. Els microreptes continuen sent treball d’aula sense recuperació individual.

## Retirar una fitxa de la web

En el bloc de consolidació de la sessió, «Retirar de la web» demana confirmació i elimina la pàgina publicada i el seu enllaç de l’índex en un únic commit. Conserva el model i l’esborrany local; es pot tornar a publicar amb el botó habitual. No cal que l’editor tinga text per retirar una fitxa.

La retirada serà visible quan acabe la construcció de la web; el dashboard enllaça Actions per comprovar-la. L’historial Git conserva les versions anteriors i no es poden retirar còpies que algú ja haja descarregat. Si fallen els permisos o la branca canvia, no es dona la retirada per completada ni es força el push.

Els noms de repositori en Alumnes i les taules de qualificacions són enllaços a GitHub. Permeten obrir el codi i copiar la URL per clonar; no equivalen a una web PHP desplegada.
