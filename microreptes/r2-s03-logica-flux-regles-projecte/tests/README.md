# Proves recomanades

Este microrepte es pot revisar amb proves manuals o amb proves automatitzades simples si el projecte ja les té.

Prova minima recomanada:

1. Executar el flux existent fins al punt on el servidor rep o reutilitza les dades.
2. Enviar un primer cas que active el primer resultat de la regla.
3. Comprovar que la resposta mostra el resultat esperat.
4. Enviar un segon cas que active un resultat diferent.
5. Comprovar que la resposta canvia.
6. Revisar el fitxer de llibreria pròpia on viu la funcio.
7. Revisar el `require_once`, `include_once` o equivalent que carrega eixe fitxer.
8. Revisar el codi de la funcio i l'array o estructura usada.
9. Canviar temporalment una condicio, valor del cataleg o retorn de la funcio i comprovar que l'alumne pot predir l'efecte.

No cal exigir encara proves automatitzades, autenticacio, sessio ni base de dades.
