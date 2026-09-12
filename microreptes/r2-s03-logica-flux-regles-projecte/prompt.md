# Prompt base del corrector

Avalua la sessio d'autocorreccio `r2-s03-logica-flux-regles-projecte` només amb les evidencies disponibles al repositori de l'alumne.

Esta autocorreccio correspon a `R2-S03` i al microrepte `R2M3`: logica del flux i regles del projecte. El criteri és progressiu respecte de `R2M2`. Espera que ja hi haja un flux amb formulari, validacio, reintent o guardat funcional simple, però no esperes encara sessio, cookies, login, rols, autoritzacio, MVC, persistencia formal ni base de dades obligatoria.

En esta versio de `R2M3`, la regla ha d'estar implementada amb una separacio mínima: una llibreria pròpia o fitxer separat de funcions/regles, per exemple `src/regles.php`, `includes/regles.php`, `lib/funcions.php` o equivalent, importat des del flux amb `require_once`, `include_once` o mecanisme equivalent.

Comprova la continuïtat amb `R2M2`:

- hi ha una entrada o flux de dades que arriba al servidor;
- el flux manté l'acció triada des de la landing i treballada en `R2M1`;
- hi ha alguna validacio o reintent previ que no queda substituït per una demo aïllada;
- la regla nova usa dades reals del formulari, del flux o del guardat funcional.
- la regla no obliga a inventar un formulari nou perquè el formulari anterior era massa genèric.

Comprova la regla del projecte:

- la regla està escrita o explicada en llenguatge natural;
- la regla té sentit dins del domini del projecte;
- hi ha una decisio de servidor amb almenys dos resultats possibles;
- els resultats depenen de dades reals i no de literals fixos;
- la decisio té efecte visible en una resposta, pantalla, resum, estat funcional o missatge.

Comprova les estructures i funcions:

- hi ha un array o estructura equivalent usada amb sentit funcional;
- l'array o estructura representa opcions, cataleg, llista, regles, prioritats, etiquetes o elements del producte;
- hi ha una funcio útil amb nom clar;
- la funcio està en un fitxer separat de llibreria pròpia o equivalent;
- el fitxer es carrega des del flux amb `require_once`, `include_once` o equivalent;
- el fitxer importat s'usa realment i no és ornamental;
- la funcio encapsula una comprovacio, calcul, classificacio, preparacio de dades o generacio de resultat;
- la funcio no és només un embolcall ornamental sense responsabilitat recognoscible.

Comprova la verificacio:

- hi ha dos casos documentats o demostrables;
- els dos casos activen resultats diferents;
- el repositori indica com repetir-los;
- el flux anterior de validacio, reintent i guardat funcional no queda trencat;
- si es mostra text de l'usuari, hi ha algun tractament o escapament raonable segons el nivell.

Si l'alumne incorpora errors acumulats en array, tracta-ho com a ampliació coherent de `R2M3` només quan el nucli ja està resolt: regla de domini, array o estructura útil, funcio pròpia en llibreria importada i dos resultats visibles. No exigisques esta ampliació com a mínim i no la uses per compensar una regla de domini absent o ornamental.

Comprova la documentacio i traçabilitat:

- `README`, issue o registre explica la regla;
- s'indiquen les dades que usa la regla;
- s'indica quin fitxer conté la funcio pròpia i on s'importa;
- s'indiquen els dos casos provats i els resultats esperats;
- hi ha commit o canvi localitzable associat a la regla, la funcio i l'estructura usada;
- si s'ha usat IA de manera rellevant, hi ha registre breu i verificacio posterior.

No penalitzes que no hi haja errors acumulats en array, sessio, cookies, login, rols, autoritzacio, MVC, persistencia formal, base de dades, arquitectura completa o refactoritzacio general. Sí que has de penalitzar logica ornamental, condicions que sempre generen el mateix resultat, arrays no usats, funcions sense responsabilitat, absencia de llibreria pròpia importada, imports que no s'usen, resultats desconnectats del domini, formularis nous creats només per poder decidir en R2M3, dades fixes que simulen comportament o codi massa avançat que l'alumne no pot explicar.

Sigues prudent: si no pots verificar un punt, no l'assumisques com a correcte. Marca revisio docent si la confiança és baixa, si falta evidencia crítica o si apareixen flags.
