# Proves recomanades

1. Revisar `composer.json` i comprovar que l'autoload apunta a la carpeta de classes.
2. Executar `composer dump-autoload` si cal.
3. Executar la prova unitària documentada.
4. Revisar que la classe prova una regla real i no depén de `$_POST`, `$_SESSION`, `$_COOKIE` ni HTML.
5. Executar un cas clau de `R2M7` per comprovar que login, estat i operacio protegida continuen funcionant.
6. Revisar la nota de pendents per a `R3`.
