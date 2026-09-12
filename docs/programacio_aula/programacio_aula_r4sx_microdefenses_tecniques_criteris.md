# R4SX. Microdefenses tècniques de criteris aplicats al projecte

## Finalitat de la sessió

Verificar que el servei web o API del projecte és usable, està protegit quan toca i pot ser consumit o provat per una altra peça. La sessió tanca `R4` i contrasta contracte, autenticació, autorització, control d'accés, seguretat bàsica i documentació amb evidència real.

## Relació amb resultats d'aprenentatge

- `RA7`: serveis web, contracte, desenvolupament, verificació, consum i documentació.
- `RA6`: recuperació o publicació de dades reals quan el servei les exposa.
- `RA4`: autenticació, autorització o control d'accés quan el servei queda protegit.

## Criteris d'avaluació que es poden treballar

- `RA7.a` a `RA7.h`: caracterització del servei, endpoints, codis d'estat, consum, prova i documentació.
- `RA6.c`, `RA6.d`, `RA6.g`: dades reals recuperades, publicades i verificades.
- `RA4.d`, `RA4.e`, `RA4.f`: autenticació, protecció d'operacions i prova o depuració quan siguen part del servei.

## Evidències obligatòries

- `3-5` diapositives o guió equivalent.
- Contracte mínim: endpoint, mètode, entrada, resposta i errors.
- Demo amb petició correcta i petició denegada o errònia.
- Fragment de codi d'endpoint, middleware, política, validador o consumidor.
- Col·lecció de proves, captura reproduïble o documentació usable.
- Commits o traçabilitat.
- `AI log` i mini justificació tècnica.

## Desenvolupament de la sessió

| Temps | Activitat |
|---|---|
| `0:00-0:10` | Obertura: el docent fixa que es defensa un servei verificable, no una llista d'URLs. |
| `0:10-2:20` | Defenses de `5-7` minuts amb `2-3` minuts de contrast. |
| `2:20-2:45` | Revisió de riscos: API sense dades reals, protecció fictícia o documentació no reproduïble. |
| `2:45-3:00` | Acta de pas a `R5`: acreditat, correcció o recuperació. |

Preguntes útils:

- Quin contracte ha de respectar un consumidor extern?
- Com diferencies autenticació d'autorització en el teu flux?
- Què passa si la petició arriba sense token, sessió o permís?
- Quina prova demostra que el servei no només funciona en el cas feliç?

## Paper de la IA

La IA pot ajudar a preparar una col·lecció de proves, revisar codis d'estat, comparar opcions de protecció o redactar documentació. No pot substituir la verificació del contracte ni la comprensió de qui pot accedir a cada operació.

## Instruments d'avaluació

- [Microdefenses tècniques de criteris](../03_avaluacio/microdefenses_tecniques_criteris.md).
- [Rúbrica de defensa tècnica](../03_avaluacio/rubrica_defensa_tecnica.md).
- [Checklist de revisió de repositori](../03_avaluacio/checklist_revisio_repo.md).
- [Plantilla AI log](../03_avaluacio/plantilla_ai_log.md).
- [Acta de checkpoint](../03_avaluacio/plantilla_acta_checkpoint.md).

## Riscos d'ús inadequat de la IA

- Endpoints generats sense coherència de contracte.
- Respostes d'error copiades sense comprovar codis d'estat.
- Protecció aparent, però sense cas denegat verificat.
- Documentació redactada per IA que no coincideix amb la resposta real.

## Mesures de control i verificació

- Executar una petició triada pel docent.
- Canviar credencial, rol o paràmetre i revisar la resposta.
- Comparar documentació amb resposta real.
- Fer explicar on es comprova el permís o la validació.

## Adaptació realista a l'aula

Si el temps és curt, cada alumne defensa un endpoint crític i una prova negativa. El contracte complet pot quedar com a evidència escrita, però el docent ha de veure almenys una execució real i una pregunta individual de control.

## Seguiment dels pendents

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md) en els trams de revisió i checkpoint d’esta sessió. Identificar els bloquejos abans del treball que en depén, donar ajuda concreta per continuar i comprovar la comprensió. Els microreptes són treball d’aula i no es recuperen individualment; la recuperació correspon al repte complet. Si és una sessió inicial sense treball previ, comprovar el punt de partida. Esta actuació no crea un microrepte propi ni una nota addicional.
