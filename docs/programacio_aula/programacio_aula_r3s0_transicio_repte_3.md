# R3S0. Transició al Repte 3

## Finalitat de la sessió

Esta sessió obri `R3` sense crear un microrepte nou. La seua funció és fer el pas des del projecte `PHP` funcional de `R2` cap a una estructura en framework amb capes, persistència i fluxos més mantenibles.

## Encaix dins del Repte 3

- **Repte**: `R3. Framework, arquitectura i persistència`
- **Microrepte**: `Sessió sense microrepte propi`
- **Sessió**: `R3S0`
- **Duració orientativa**: `3 hores`
- **Focus**: canvi d'escala, framework, MVC o equivalent, persistència i migració d'un flux de `R2`
- **No entra encara**: crear tota l'aplicació en framework

## Conceptes a explicar

- Per què es passa de `PHP` base a framework.
- Diferència entre ruta, controlador, model, vista/resposta i servei.
- Què significa persistència reproduïble: migracions/fixtures/seeders i `.env`.
- Com triar quin flux de `R2` es migrarà primer.

## Seqüència d'aula de 3 hores

### 0:00-0:35. Lectura crítica de R2

Identificar què funciona, què està massa acoblat i què cal migrar.

### 0:35-1:15. Mapa d'arquitectura

El professorat modela el recorregut petició -> ruta -> controlador -> model/servei -> vista/resposta.

### 1:15-1:55. Decisió de stack i flux inicial

L'alumnat confirma framework o itinerari i tria el primer flux que reconstruirà.

### 1:55-2:35. Preparació de persistència

Es concreta entitat principal, dades inicials i criteri de reconstrucció de BBDD.

### 2:35-3:00. Checkpoint de pas

Validació de stack, flux i model de dades mínim abans de `R3S1`.

## Evidències mínimes

| Evidència | Mínim acceptable |
|---|---|
| Flux de `R2` | triat per migrar |
| Stack | decisió justificada |
| Mapa de capes | ruta, controlador, dades i resposta |
| Persistència | entitat inicial i dades previstes |

## Checklist de tancament

- [ ] Flux inicial triat.
- [ ] Stack confirmat.
- [ ] Mapa de capes preparat.
- [ ] Entitat inicial identificada.

## Seguiment dels pendents

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md) en els trams de revisió i checkpoint d’esta sessió. Identificar els bloquejos abans del treball que en depén, donar ajuda concreta per continuar i comprovar la comprensió. Els microreptes són treball d’aula i no es recuperen individualment; la recuperació correspon al repte complet. Si és una sessió inicial sense treball previ, comprovar el punt de partida. Esta actuació no crea un microrepte propi ni una nota addicional.
