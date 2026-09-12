# Instruccions del repositori d'evidències del Projecte Intermodular

Este repositori conté l'aplicatiu docent que recopila i comprova evidències dels repositoris de projectes de 2n DAW.

## Principis

- La unitat analitzada és un projecte amb identificador i nom, no una persona.
- Cada execució revisa un punt de control i una referència Git immutable.
- L'aplicatiu no gestiona parelles, custòdies ni permisos dels repositoris.
- L'aplicatiu genera comprovacions i evidències candidates; no atribuïx qualificacions individuals.
- El professorat contrasta els resultats i trasllada a Aules les evidències o qualificacions que corresponguen.
- Els punts de control formatius han de produir `qualification: null`.
- No s'han d'inferir autoria ni assoliment a partir del nombre de commits o línies.

## Coordinació

Qualsevol canvi en l'estructura esperada ha de revisar també `../pi2627-plantilla-projecte`, `../pi2627` i `../pi2627-professorat`.

Cal preservar els scripts antics de DWES mentre dure la migració. Les ordres noves del PI viuen en `scripts/pi/` i la configuració en `pi/`.

## Verificació

Després de canviar el nucli PI, cal executar `npm run validate:pi` i `npm run test:pi`. També cal executar `npm test` si s'ha tocat codi compartit o legacy. Feu staging selectiu i no inclogueu canvis previs o aliens.
