# R3SX. Microdefenses tècniques de criteris aplicats al projecte

## Finalitat de la sessió

Verificar que el pas a framework, arquitectura o patró, separació de responsabilitats i persistència inicial s'ha entés i aplicat sobre un flux real del projecte. La defensa tanca `R3` i valida que l'alumnat pot explicar el recorregut end-to-end abans d'entrar en serveis, API o control d'accés més complet.

## Relació amb resultats d'aprenentatge

- `RA5`: separació de presentació, lògica, controladors, models, serveis o equivalents.
- `RA6`: connexió a dades, persistència, recuperació, integritat bàsica i verificació.
- `RA8`: framework servidor, vistes o plantilles, formularis i resposta dinàmica renderitzada en servidor.

## Criteris d'avaluació que es poden treballar

- `RA5.a` a `RA5.h`: estructura del framework, rutes, controladors, vistes, serveis i mantenibilitat.
- `RA6.a` a `RA6.g`: model de dades, migracions o mecanisme equivalent, dades inicials reproduïbles, consultes, persistència i errors.
- `RA8.c` a `RA8.g`: ús del framework per generar resposta web i gestionar interaccions.

Cada defensa ha de connectar `1-2` criteris amb un flux concret, no amb una descripció general del framework.

## Evidències obligatòries

- `3-5` diapositives o guió equivalent.
- Diagrama mínim o recorregut ruta-controlador-model/vista o equivalent.
- Fragment de codi rellevant.
- Demo end-to-end amb dades reals.
- Prova de migracions o mecanisme equivalent i reconstrucció de dades quan siga aplicable.
- Commits o traçabilitat.
- `AI log` i mini justificació tècnica.

## Desenvolupament de la sessió

| Temps | Activitat |
|---|---|
| `0:00-0:10` | Obertura: criteri de defensa sobre arquitectura aplicada, no teoria del framework. |
| `0:10-2:20` | Defenses de `5-7` minuts amb `2-3` minuts de contrast. |
| `2:20-2:45` | Revisió de casos amb risc: esquelet sense flux, persistència manual o falta de traçabilitat. |
| `2:45-3:00` | Acta de pas a `R4`: acreditat, correcció o recuperació. |

Preguntes útils:

- On acaba la responsabilitat del controlador i on comença la del model o servei?
- Quina part ve heretada de `R2` i què has canviat en migrar-la?
- Com reconstruïries la base de dades des de zero?
- Què et va suggerir la IA sobre l'estructura i què vas modificar tu?

## Paper de la IA

La IA pot ajudar a comparar patrons, revisar una migració, detectar duplicació o preparar proves. No és acceptable que l'alumne defense una estructura generada que no pot seguir fitxer a fitxer.

## Instruments d'avaluació

- [Microdefenses tècniques de criteris](../03_avaluacio/microdefenses_tecniques_criteris.md).
- [Rúbrica de defensa tècnica](../03_avaluacio/rubrica_defensa_tecnica.md).
- [Checklist de revisió de repositori](../03_avaluacio/checklist_revisio_repo.md).
- [Plantilla AI log](../03_avaluacio/plantilla_ai_log.md).
- [Acta de checkpoint](../03_avaluacio/plantilla_acta_checkpoint.md).

## Riscos d'ús inadequat de la IA

- Projecte de framework generat sense entendre rutes ni cicle de petició.
- Models, migracions o càrrega inicial copiats sense prova de reconstrucció.
- Explicació genèrica de MVC sense mostrar flux propi.
- Persistència carregada manualment i no reproduïble.

## Mesures de control i verificació

- Demanar seguir una petició des de ruta fins a resposta.
- Executar o revisar migracions i dades inicials.
- Preguntar per un error de validació o de dades i com es mostra.
- Obrir un commit de refactorització i demanar-ne la justificació.

## Adaptació realista a l'aula

Quan no càpien totes les defenses, el docent pot revisar primer els fluxos end-to-end i deixar la part comparativa com a guió entregable. La recuperació ha de consistir en fer funcionar i explicar un flux complet, no en afegir més pantalles.

## Seguiment dels pendents

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md) en els trams de revisió i checkpoint d’esta sessió. Identificar els bloquejos abans del treball que en depén, donar ajuda concreta per continuar i comprovar la comprensió. Els microreptes són treball d’aula i no es recuperen individualment; la recuperació correspon al repte complet. Si és una sessió inicial sense treball previ, comprovar el punt de partida. Esta actuació no crea un microrepte propi ni una nota addicional.
