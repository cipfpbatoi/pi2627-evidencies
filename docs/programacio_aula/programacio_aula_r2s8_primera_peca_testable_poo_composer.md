# R2S8. Primera peça testable amb POO i Composer

## Finalitat de la sessio

Esta sessio continua el tancament tècnic de `R2` convertint una part xicoteta del flux ja provat en una peça testable. Les funcions, els `include`, el bootstrap de rutes, l'autenticació i la mini API ja han aparegut abans; ací el pas nou és introduir una classe mínima, carregar-la amb Composer i verificar-ne el comportament amb una primera prova unitària.

L'objectiu no és reescriure el projecte ni construir arquitectura MVC. L'objectiu és entendre per què una part de la lògica és més fàcil de provar quan està separada del formulari, de la sessio i de la resposta HTML.

## Encaix dins del Repte 2

- **Repte**: `R2. Processament bàsic, estat, autenticació i primera funcionalitat protegida`
- **Microrepte**: `R2M8`
- **Sessio**: `R2S8`
- **Duracio orientativa**: `3 hores`
- **Focus**: classe mínima del domini o servei, Composer, autoload, prova unitària inicial i comprovació que el flux continua funcionant
- **No entra encara**: MVC complet, ORM, base de dades com a focus, canvi de framework, API externa com a mínim o POO extensa obligatoria

## Relacio amb RA i criteris de treball

| Element | Concrecio en el microrepte |
|---|---|
| `RA3.d` | encapsular una regla o comprovacio en una classe simple |
| `RA3.g` | justificar la separacio de responsabilitats amb llenguatge tècnic bàsic |
| `RA4.f` | prova unitària inicial i prova de no regressio del flux |
| Preparacio cap a `R3` | primer ús de Composer i autoload com a pont cap a arquitectura més formal |
| Evidencia central | classe carregada amb Composer i prova unitària que verifica una regla |
| Verificacio docent | execucio de test, revisio de classe i execucio d'un cas clau del flux |

## Producte esperat

Una peça testable que incloga, com a mínim:

- una zona de lògica ja existent triada a partir de `R2M3`, `R2M4` o `R2M5`;
- una classe simple del domini o servei, per exemple `Usuari`, `Authenticator`, `ValidadorReserva`, `CalculadoraPrioritat`, `ReglaPublicacio` o equivalent;
- `composer.json`;
- autoload configurat amb PSR-4 o alternativa simple justificable;
- ús de `vendor/autoload.php` en el flux o en la prova;
- una prova unitària mínima amb PHPUnit, Pest o script de test equivalent si el centre decideix no instal·lar framework de test;
- execucio documentada de la prova;
- comprovacio que el flux web principal continua funcionant;
- nota breu explicant què s'ha separat, què es pot provar ara i què queda per a `R3`.

## Preparacio previa del professorat

Convé preparar:

- exemple mínim de `composer.json` amb autoload;
- exemple de classe simple en `src/`;
- exemple de test en `tests/`;
- exemple d'instal·lacio o execucio de PHPUnit o Pest si es vol usar;
- alternativa sense dependència externa: script PHP que instància la classe i fa comprovacions simples;
- criteri de tancament: no es valida si la classe només existeix però no es prova.

Exemple orientatiu:

```text
src/
  Authenticator.php
tests/
  AuthenticatorTest.php
composer.json
```

## Seqüencia d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:50. Tria de la peça testable

Tasques:

- revisar les proves de `R2M6`;
- triar una regla o comprovacio estable;
- evitar triar una pantalla completa;
- escriure què entra i què retorna la peça.

Resultat: cada equip té una peça acotada per convertir en classe.

### 0:50-1:15. Modelatge docent

Mostrar:

- classe mínima amb constructor opcional;
- mètode amb retorn clar;
- `composer.json` amb autoload;
- càrrega amb `vendor/autoload.php`;
- prova unitària d'un cas positiu i un cas negatiu.

Resultat: l'alumnat veu que Composer i POO s'usen per fer una peça més testable, no per reescriure-ho tot.

### 1:15-1:45. Creacio de Composer i classe mínima

Tasques:

- crear o revisar `composer.json`;
- configurar autoload;
- crear una classe en `src/`;
- moure o reimplementar una regla xicoteta dins d'un mètode;
- executar `composer dump-autoload` si cal;
- usar la classe des d'una prova o des del flux.

Resultat: la classe es pot carregar amb Composer.

### 1:45-2:15. Primera prova unitària

Tasques:

- crear un test en `tests/`;
- comprovar almenys un cas positiu;
- comprovar almenys un cas negatiu o límit;
- executar la prova;
- guardar o documentar l'eixida.

Resultat: hi ha una prova unitària inicial real.

### 2:15-2:30. No regressio del flux

Tasques:

- repetir un cas clau de `R2M6`;
- comprovar login, estat o regla afectada segons la peça triada;
- corregir regressions si apareixen.

Resultat: la nova classe no trenca el flux web.

### 2:30-2:50. Tancament i pont cap a R3

Tasques:

- explicar què s'ha separat;
- indicar què és unitari i què continua sent prova de flux;
- documentar com executar el test;
- indicar què queda pendent per a `R3`.

Pregunta de checkpoint: quina part del teu backend pots provar ara sense passar pel formulari ni pel navegador?

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Triar una regla o comprovacio del flux ja provat.
- Crear `composer.json`.
- Configurar autoload.
- Crear una classe simple en `src/` o equivalent.
- Escriure una prova unitària mínima.
- Executar la prova.
- Repetir un cas de flux per no regressio.
- Documentar què s'ha separat i com es prova.

## Evidencies minimes

| Evidencia | Minim acceptable |
|---|---|
| Composer | `composer.json` amb autoload o alternativa justificada |
| Classe | classe simple del domini o servei amb mètode útil |
| Test unitari | prova d'almenys un cas positiu i un negatiu/límit |
| Execucio | comanda i resultat de la prova documentats |
| Flux | cas clau de `R2M6` repetit després del canvi |
| Documentacio | explicacio de què queda més testable i què queda per a `R3` |

## Criteris d'exit

- La classe encapsula una regla real del projecte.
- La classe no depén directament de `$_POST`, `$_SESSION`, `$_COOKIE` o HTML.
- Composer carrega la classe o queda justificat un mecanisme equivalent.
- La prova unitària es pot executar.
- La prova comprova comportament, no només que el fitxer existeix.
- El flux complet continua funcionant.
- L'alumnat pot explicar la diferència entre prova de flux i prova unitària.

## Que no és suficient

- Crear una classe buida.
- Fer una classe que només imprimeix HTML.
- Fer Composer però no usar l'autoload.
- Copiar PHPUnit o Pest sense poder executar cap prova.
- Fer només proves de flux i cap prova unitària.
- Reescriure tot el projecte.
- Introduir una API externa com a requisit del mínim.

## Us de la IA

La IA pot ajudar a proposar noms de classe, escriure un `composer.json` mínim o suggerir casos de test. Control: l'alumnat ha d'explicar què prova el test i executar-lo amb dades pròpies.

## Suport per alumnat amb més dificultat

Reduir-ho a una classe amb un mètode pur:

- `CalculadoraPrioritat::calcular($urgencia, $impacte)`;
- `ReglaReserva::estaDisponible($places, $sol·licitades)`;
- `PasswordPolicy::esValida($password)`;
- `ValidadorPublicacio::potPublicar($titol, $cos)`.

Una prova positiva i una negativa són suficients.

## Ampliacio per alumnat avançat

- Usar PHPUnit o Pest amb Composer si no era obligatori en el grup.
- Afegir una llibreria externa menuda via Composer, com `vlucas/phpdotenv` o `ramsey/uuid`, si té sentit en el projecte.
- Crear una segona classe relacionada.
- Preparar un client d'API externa com a tast per a `R4`, només com a ampliacio.
- Afegir més proves unitàries o una prova d'integracio simple.

## Checklist de tancament

- [ ] He triat una regla o comprovacio estable.
- [ ] He creat o ajustat `composer.json`.
- [ ] He configurat autoload.
- [ ] He creat una classe simple.
- [ ] La classe no depén directament del formulari ni de l'HTML.
- [ ] He escrit una prova unitària mínima.
- [ ] He executat la prova.
- [ ] He repetit un cas clau del flux.
- [ ] He documentat com executar el test.
- [ ] He indicat què queda per a `R3`.

## Connexio amb R3

`R3` aprofitarà esta primera peça testable per entrar en arquitectura, persistencia i frameworks amb una idea ja viscuda: separar responsabilitats no és només ordenar fitxers, és poder provar una part del backend de manera directa.
