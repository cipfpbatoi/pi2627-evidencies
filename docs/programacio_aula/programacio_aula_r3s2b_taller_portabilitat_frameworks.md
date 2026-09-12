# R3S2B. Taller obligatori de portabilitat entre frameworks

## Finalitat de la sessio

Esta peça fa de pont entre `R3M2` i `R3M3`. L'alumnat ja hauria de tindre un projecte en framework arrancable i una persistencia minima. Abans de construir el primer flux fort, cal comprovar que entén les equivalencies entre stacks i que no està seguint una recepta concreta de `Laravel`, `Symfony` o `NestJS` sense poder defensar-la.

No és un microrepte nou ni genera una nota separada, però sí que forma part de la programació d'aula base. Es programa com una sessió de `3` hores entre `R3S2` i `R3S3` perquè l'alumnat consolide la portabilitat abans de construir el primer flux fort en framework.

## Encaix dins del Repte 3

- **Repte**: `R3. Reconstruccio en framework, persistencia real i primers fluxos funcionals`
- **Microrepte associat**: reforç de `R3M1` i `R3M2`, preparacio de `R3M3`
- **Sessio**: `R3S2B`
- **Tipus**: taller obligatori de reforç, sense microrepte propi
- **Duracio orientativa**: `3 hores`
- **Focus**: equivalencies entre frameworks, reconstruccio de dades, recorregut peticio -> resposta i qualitat de l'evidencia
- **No entra encara**: implementar funcionalitat nova gran, obrir API, canviar de framework sense justificacio o reescriure el projecte

## Encaix temporal recomanat

| Format | Moment | Ús recomanat |
|---|---|---|
| Sessió obligatòria | `R3S2B`, després de `R3S2` i abans de `R3S3` | contrastar stacks, fer mini auditories i preparar el primer flux complet |

## Relacio amb RA i criteris de treball

| Element | Concrecio en el taller |
|---|---|
| `RA5` | identifica peces equivalents del framework i separa responsabilitats |
| `RA6` | verifica persistencia reconstruïble i dades inicials reproduïbles |
| `RA8` | prepara un flux server-rendered o resposta visible amb dades reals |
| Evidencia central | taula d'equivalencies i auditoria curta del projecte propi |

## Producte esperat

- Taula d'equivalencies del seu stack respecte a un altre stack.
- Auditoria del seu projecte `R3`: què compleix, què falta i què no saben explicar encara.
- Prova o guio de reconstruccio de BBDD i càrrega inicial.
- Descripcio del recorregut d'un flux: peticio -> ruta -> controlador -> capa de dades -> vista/resposta.
- Microtasca registrada en issue, README o backlog per corregir el risc principal detectat.

## Preparacio previa del professorat

- Portar una taula buida d'equivalencies.
- Preparar un exemple molt simple de flux comu: llistat o detall d'un recurs.
- Tindre una comparativa mínima entre `Laravel`, `Symfony` i `NestJS`.
- Preparar preguntes de defensa curta.
- Decidir si la mini defensa es fa en grup o individualment.

## Continguts a explicar

- El criteri del repte no és el nom de l'eina, sinó la responsabilitat que cobreix.
- `migrations`, `Doctrine migrations`, `Prisma migrations`, `TypeORM migrations` o mecanismes equivalents poden cobrir la mateixa necessitat.
- `seeders`, `fixtures` o scripts de càrrega poden cobrir la mateixa necessitat.
- Un flux en framework ha de poder seguir-se des de la peticio fins a la resposta.
- Una evidència tècnica ha de ser reproduïble, no només una captura.

## Sequencia d'aula de 3 hores

### 0:00-0:25. Cas d'us comu i criteri del taller

El professorat presenta un cas senzill aplicable a qualsevol stack:

- ruta `/items` o equivalent;
- controlador;
- lectura de BBDD;
- resposta visible amb dades reals;
- validacio o error minim.

Missatge clau: el nom de les carpetes pot canviar, però les responsabilitats han d'estar cobertes.

### 0:25-1:05. Mapa d'equivalencies

Cada grup completa una taula com esta:

| Necessitat comuna | En el meu stack | En un altre stack | Evidencia al meu projecte |
|---|---|---|---|
| Ruta |  |  |  |
| Controlador |  |  |  |
| Servei o capa de dades |  |  |  |
| Model, entitat o schema |  |  |  |
| Migracio o equivalent |  |  |  |
| Fixtures/seeders o script |  |  |  |
| Vista, plantilla o resposta |  |  |  |
| Prova o checklist |  |  |  |

El professorat revisa especialment que no hi haja respostes genèriques com “ho fa el framework”.

### 1:05-1:50. Auditoria del projecte propi

Cada grup revisa el repositori i marca:

- què ja pot demostrar;
- què només està començat;
- quina peça no sabria explicar una persona del grup;
- com es reconstrueix la BBDD;
- com es carreguen les dades inicials;
- quin conjunt de dades alimentarà el primer flux;
- quin flux serà server-rendered o resposta visible amb dades reals.

Resultat: una nota curta en `README`, issue o backlog.

### 1:50-2:25. Preparacio de mini defensa

Cada grup prepara una defensa de `3-4` minuts amb este guio:

- Hem triat este stack perquè...
- En el nostre stack, la ruta és...
- El controlador coordina...
- La capa de dades viu en...
- La BBDD es reconstrueix amb...
- Les dades inicials es carreguen amb...
- El primer flux recorrerà...
- El risc principal que hem detectat és...

### 2:25-2:50. Mini defenses i preguntes

El professorat fa preguntes curtes:

- On està exactament la ruta?
- Quina comanda reconstrueix la BBDD?
- Com sé que les dades no són manuals?
- Quina peça equivaldria a un `seeder` si no uses Laravel?
- Quin fitxer tocaries si canviara la validacio?
- Com arriba la dada a la vista o resposta?

### 2:50-3:00. Tancament i microtasca

Cada grup deixa una microtasca concreta:

- completar una instruccio del README;
- corregir una càrrega inicial;
- separar una responsabilitat massa barrejada;
- documentar el recorregut del flux;
- preparar una prova o checklist reproduïble.

## Tasques concretes de l'alumnat

- Completar la taula d'equivalencies.
- Revisar el seu projecte amb criteri de reconstruccio.
- Preparar una mini defensa tècnica.
- Registrar un risc i una microtasca de correccio.

## Evidencies minimes

| Evidencia | Minim acceptable |
|---|---|
| Taula | equivalencies del seu stack i un altre stack |
| Auditoria | nota curta amb què compleix i què falta |
| Reconstruccio | comandes o passos per BBDD i càrrega inicial |
| Flux | recorregut peticio -> resposta explicat |
| Traçabilitat | microtasca registrada |

## Criteris d'exit

- L'alumnat pot explicar el seu stack sense dependre d'un tutorial.
- Les equivalencies entre frameworks queden clares.
- La persistencia és reproduïble.
- El primer flux de `R3M3` queda millor acotat.
- El professorat detecta a temps riscos abans del desenvolupament fort.

## Que no és suficient

- Dir “això ho fa Laravel/Symfony/NestJS” sense localitzar fitxers o comandes.
- Fer una taula copiada d'internet sense evidència al projecte.
- Mostrar captures sense reconstruccio.
- Canviar de framework durant el taller sense criteri.
- Convertir el taller en una classe magistral sense auditoria del projecte propi.

## Us de la IA

La IA pot ajudar a comparar noms i convencions entre frameworks, però l'alumnat ha de contrastar-ho amb el seu repositori real. Si usa IA per completar la taula, ha de revisar cada fila i corregir el que no encaixe amb el seu projecte.

## Suport per a alumnat amb dificultats

- Donar una taula mig completada amb una columna d'exemple.
- Reduir la defensa a `4` peces: ruta, controlador, dades i resposta.
- Permetre que el primer flux siga un llistat simple si la persistencia encara és fràgil.
- Revisar conjuntament les comandes de BBDD.

## Ampliacio per a alumnat avançat

- Comparar el seu stack amb els dos altres stacks.
- Afegir una prova automatitzada mínima de reconstruccio o lectura.
- Documentar una decisio tècnica breu sobre per què eixe stack encaixa amb el domini.

## Checklist de tancament

- [ ] Taula d'equivalencies completada.
- [ ] Auditoria del projecte registrada.
- [ ] Reconstruccio de BBDD i càrrega inicial explicades.
- [ ] Recorregut del primer flux preparat.
- [ ] Microtasca de correccio registrada.

## Connexio amb el microrepte posterior

`R3M3` ha d'usar esta auditoria per construir el primer cas d'us complet. Si el taller detecta que la persistencia o les responsabilitats no són defensables, cal corregir-ho abans d'afegir més funcionalitat.

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT16. Portabilitat entre frameworks](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT16-Portabilitat-entre-frameworks.pdf)
- **Teoria o material associat**: [Framework MVC i responsabilitats](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R3-Framework-MVC-i-responsabilitats.pdf) i [Persistència, migracions i seeders](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R3-Persistencia-migracions-i-seeders.pdf)

## Microtaller associat

- **Microtaller**: `MT16. Portabilitat entre frameworks`
- **Moment recomanat**: durant el taller de portabilitat, abans de comparar implementacions concretes.
- **Evidència mínima**: taula d'equivalències entre peces de framework i responsabilitats del mateix flux.

## Seguiment dels pendents

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md) en els trams de revisió i checkpoint d’esta sessió. Identificar els bloquejos abans del treball que en depén, donar ajuda concreta per continuar i comprovar la comprensió. Els microreptes són treball d’aula i no es recuperen individualment; la recuperació correspon al repte complet. Si és una sessió inicial sense treball previ, comprovar el punt de partida. Esta actuació no crea un microrepte propi ni una nota addicional.
