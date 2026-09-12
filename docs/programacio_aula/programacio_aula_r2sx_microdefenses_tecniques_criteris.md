# R2SX. Microdefensa conjunta R1 + R2

## Finalitat de la sessió

Verificar l'assoliment real dels criteris treballats en `R1` i `R2` mitjançant una defensa breu basada en producte, codi, prova i justificació. La sessió tanca la base tècnica inicial, el bloc de formularis, processament d'entrada, estat inicial i primera funcionalitat protegida abans d'obrir el treball arquitectònic de `R3`.

No s'explica teoria sobre criteris. Cada alumne defensa una part real del projecte on un criteri s'ha posat en joc i mostra com ho sap comprovar. `R1` no té una defensa pròpia separada: la seua base tècnica es contrasta ací, quan ja hi ha un primer flux funcional de `R2`.

## Relació amb resultats d'aprenentatge

- `RA2`: codi servidor integrat amb resposta web, variables, operadors, àmbits, directives i processament elemental.
- `RA3`: formularis, recuperació de dades, decisions, arrays, funcions i validació de servidor.
- `RA4`: estat, sessió o cookies, autenticació inicial, control d'accés i prova o depuració del flux.
- `RA1`: base tècnica executable, model client/servidor, decisió tècnica inicial, `README` i landing inicial servida pel backend com a context verificable.

## Criteris d'avaluació que es poden treballar

- `RA2.a` a `RA2.h`: quan la defensa mostra codi servidor integrat, generació de resposta i processament de dades.
- `RA3.a` a `RA3.g`: quan la defensa mostra decisions, funcions, arrays, formularis i recuperació d'entrada.
- `RA4.a` a `RA4.f`: quan la defensa mostra estat, autenticació, operació protegida, prova, incidència o depuració.

El docent no ha d'exigir tots els criteris en una sola defensa. Cada alumne tria `1-2` criteris i els connecta amb una evidència verificable.

## Evidències obligatòries

- `3-5` diapositives o guió equivalent.
- Arrencada del projecte seguint `README` i demostració breu de la landing inicial de `R1`.
- Formulari o entrada amb controls diversos: text, llista, checkbox i fitxer si escau.
- Fragment de codi de recuperació, validació, estat o control d'accés.
- Demo de cas correcte i cas amb error visible.
- Commits o traçabilitat del canvi.
- `AI log` o registre d'ús d'IA.
- Mini justificació tècnica: què s'ha validat al servidor i per què.

## Desenvolupament de la sessió

| Temps | Activitat |
|---|---|
| `0:00-0:10` | Obertura: el docent recorda format, criteris possibles i evidències mínimes. |
| `0:10-2:20` | Defenses de `5-7` minuts amb `2-3` minuts de preguntes de contrast. |
| `2:20-2:45` | Revisió ràpida d'alumnat pendent: repo, `README`, prova i `AI log`. |
| `2:45-3:00` | Acta de checkpoint: acreditat, pendent de correcció o recuperació curta. |

Preguntes útils:

- Per què valides esta dada al servidor i no només al navegador?
- Què passa si el checkbox no arriba en la petició?
- Quina part del tractament d'entrada et va suggerir la IA?
- Com demostraries que l'operació protegida no és accessible sense estat vàlid?

## Paper de la IA

La IA pot haver ajudat a comparar controls, escriure casos de prova, revisar missatges d'error o ordenar la presentació. No pot substituir la comprensió del flux de dades ni la capacitat d'explicar què arriba al servidor i com es valida.

## Instruments d'avaluació

- [Microdefenses tècniques de criteris](../03_avaluacio/microdefenses_tecniques_criteris.md).
- [Rúbrica de defensa tècnica](../03_avaluacio/rubrica_defensa_tecnica.md).
- [Checklist de revisió de repositori](../03_avaluacio/checklist_revisio_repo.md).
- [Plantilla AI log](../03_avaluacio/plantilla_ai_log.md).
- [Acta de checkpoint](../03_avaluacio/plantilla_acta_checkpoint.md).

## Riscos d'ús inadequat de la IA

- Formulari generat per IA sense entendre `name`, `method`, `$_POST` o `$_FILES`.
- Validacions copiades sense saber quin error cobreixen.
- Explicació memoritzada sense poder modificar una condició.
- `AI log` genèric sense indicar què s'ha provat.

## Mesures de control i verificació

- Demanar un reintent amb dada incorrecta.
- Canviar una opció permesa i observar si el servidor ho detecta.
- Revisar un commit concret i preguntar què va canviar.
- Fer explicar la diferència entre estat temporal i persistència.

## Adaptació realista a l'aula

Si el grup és gran, prioritza defensa completa de l'alumnat amb dubtes d'autoria i defensa abreujada de la resta. Qui no acredite comprensió no obri `R3` amb normalitat: tanca abans un flux mínim, documenta prova i repetix contrast curt.

## Seguiment dels pendents

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md) en els trams de revisió i checkpoint d’esta sessió. Identificar els bloquejos abans del treball que en depén, donar ajuda concreta per continuar i comprovar la comprensió. Els microreptes són treball d’aula i no es recuperen individualment; la recuperació correspon al repte complet. Si és una sessió inicial sense treball previ, comprovar el punt de partida. Esta actuació no crea un microrepte propi ni una nota addicional.
