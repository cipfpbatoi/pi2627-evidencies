# R2S0. Transició al Repte 2

## Finalitat de la sessió

Esta sessió obri `R2` sense crear un microrepte nou. La seua funció és fer la transició des de la base executable de `R1` cap al primer flux funcional amb dades, validació, estat i autenticació.

Com que `R2` es treballa sobre una base comuna en `PHP`, esta sessió dedica temps explícit a una introducció pràctica a `PHP`: sintaxi mínima, barreja controlada de codi `HTML` i `PHP`, variables, condicions i exemples fàcils d'ús dins d'una pàgina generada pel servidor.

## Encaix dins del Repte 2

- **Repte**: `R2. Processament, estat i autenticació`
- **Microrepte**: `Sessió sense microrepte propi`
- **Sessió**: `R2S0`
- **Duració orientativa**: `3 hores`
- **Focus**: lectura de `R1`, introducció pràctica a `PHP`, barreja `HTML/PHP`, formularis, recorregut de dades, errors i abast de `R2`
- **No entra encara**: implementar el primer microrepte complet

## Conceptes a explicar

- Diferència entre punt d'entrada de `R1` i flux funcional de `R2`.
- Què fa `PHP` al servidor abans que el navegador reba l'`HTML`.
- Com s'intercala `PHP` dins d'una pàgina `HTML` sense convertir-la en un fitxer desordenat.
- Sintaxi mínima: variables, concatenació o interpolació simple, `if/else`, arrays bàsics i `foreach` senzill si cal.
- Exemples fàcils: saludar amb una variable, mostrar una llista d'opcions, pintar un missatge condicional i generar una xicoteta taula.
- Recorregut mínim: formulari, petició, servidor, validació, resposta i reintent.
- Per què l'estat, la sessió i l'autenticació no són peces soltes.
- Evidències que s'esperen en `R2`: dades, errors, proves, README i commits.

## Exemples fàcils per modelar

Els exemples han de ser curts i orientats al que després apareixerà en `R2S1`.

```php
<?php
$nom = 'Aina';
?>
<h1>Benvinguda, <?= htmlspecialchars($nom) ?></h1>
```

```php
<?php
$edat = 18;
$missatge = $edat >= 18 ? 'Pot continuar' : "Cal revisar l’edat";
?>
<p><?= htmlspecialchars($missatge) ?></p>
```

```php
<?php
$opcions = ['alta', 'consulta', 'modificacio'];
?>
<ul>
  <?php foreach ($opcions as $opcio): ?>
    <li><?= htmlspecialchars($opcio) ?></li>
  <?php endforeach; ?>
</ul>
```

Punt docent important: `htmlspecialchars` s'introdueix com a hàbit de seguretat i higiene en eixida, sense convertir encara la sessió en una classe completa de seguretat.

## Seqüenciació de la sessió: 3 hores

| Temps | Activitat |
|---|---|
| 0:00–0:15 | Comprovar l’entorn i modelar PHP → HTML, sintaxi mínima i execució. |
| 0:15–1:00 | Exercicis 1–3: execució, fitxa i càlcul; l’alumnat escriu i prova variacions. |
| 1:00–1:45 | Exercicis 4–5: condicions, estils, arrays i bucles. |
| 1:45–1:55 | Pausa i resolució de dubtes comuns. |
| 1:55–2:10 | Exercici 6: depuració guiada d’errors de sintaxi i lògica. |
| 2:10–2:35 | Exercici 7: pàgina dinàmica aplicada al projecte. |
| 2:35–2:50 | Demostracions breus: canviar dades, explicar el resultat i compartir errors. |
| 2:50–3:00 | Situar el mapa de R2 i triar la dada que entrarà per formulari en R2S1. |

## Tasques concretes de l’alumnat

Seguir la [bateria de 7 exercicis de PHP i HTML](https://cipfpbatoi.github.io/dwes2627/04_materials/repte_02/practica_php_html.html), amb resultats esperats i variacions. Conservar els fitxers de pràctica i notes dels errors per a revisió formativa a classe. Esta sessió introductòria no genera lliurament, nota ni autocorrecció pròpia.

## Evidències mínimes

| Evidència | Mínim acceptable |
|---|---|
| Base `R1` | arranca i està documentada |
| Exemple `PHP` | l’alumnat ha escrit, executat i modificat codi amb eixida `HTML` |
| Primer flux | cas d'ús real identificat |
| Comprensió | distingix PHP del servidor i HTML del navegador; explica un error corregit |
| Riscos | punts de bloqueig anotats |

## Checklist de tancament

- [ ] Projecte de `R1` verificat.
- [ ] Sintaxi mínima de `PHP` situada.
- [ ] Barreja `HTML/PHP` practicada per l’alumnat amb variables, condicions i bucles.
- [ ] Primer flux funcional triat.
- [ ] Pàgina de pràctica provada amb dos casos i un error explicat.
- [ ] Preparat per a `R2S1`.

## Relació amb RA, CA i criteris de treball

Prepara els criteris de RA2 relatius a codi embegut, sintaxi, variables, operadors i sentències, que es treballaran en el flux de R2. Es fa observació formativa, sense afegir pesos ni criteris d’autocorrecció als microreptes existents.

## Producte esperat

Fitxers curts de pràctica i una pàgina del domini amb dades fictícies, càlcul, condició i llista. L’alumnat pot executar-la i explicar dos resultats diferents.

## Preparació prèvia del professorat

Comprovar que l’entorn PHP de classe funciona, obrir la bateria i preparar una demostració de petició i resposta. Reservar temps per a errors d’arrancada i tindre disponible el primer exemple per a qui necessite suport.

## Criteris d’èxit

L’alumnat escriu i modifica codi, comprova resultats, diferencia codi servidor i resposta HTML, i explica almenys un error corregit. Usar `htmlspecialchars` per a text variable i separar càlcul de presentació són hàbits inicials.

## Què no és suficient

Mirar una demostració, copiar una solució sense executar-la o mostrar una captura sense poder canviar les dades i explicar el resultat.

## Ús de la IA

Demanar pistes concretes, provar els suggeriments i anotar les consultes reals i la verificació en les notes o el registre habitual `ai.log`. No exigir ni inventar ús d’IA.

## Suport per a l’alumnat amb dificultats

Començar pel fitxer executable de l’exercici 1, introduir un canvi cada vegada i revisar errors al terminal. En parella, alternar escriptura i explicació; prioritzar comprensió i execució abans de la velocitat.

## Ampliació per a l’alumnat més avançat

Recompte d’elements disponibles o extracció d’un càlcul a una funció. És pràctica opcional, sense punts d’ampliació del repte. No s’avancen autenticació, persistència ni frameworks.

## Connexió amb el microrepte posterior

En R2S1/R2M1, algunes dades ara escrites al codi arribaran d’un formulari i necessitaran validació. La pràctica de R2S0 prepara eixe pas i no substituïx el flux real que demana R2M1.

## Seguiment dels pendents

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md) en els trams de revisió i checkpoint d’esta sessió. Identificar els bloquejos abans del treball que en depén, donar ajuda concreta per continuar i comprovar la comprensió. Els microreptes són treball d’aula i no es recuperen individualment; la recuperació correspon al repte complet. Si és una sessió inicial sense treball previ, comprovar el punt de partida. Esta actuació no crea un microrepte propi ni una nota addicional.
