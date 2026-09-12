# Prompt base del corrector

Avalua `r2-s05-autenticacio-funcionalitat-protegida` només amb evidencies del repositori.

Comprova que hi ha registre o alta mínima d'usuari, encara que siga amb un array, fitxer o estructura equivalent del projecte. La contrasenya ha d'estar guardada amb hash, per exemple `password_hash` o mecanisme equivalent, i el login ha de verificar-la amb `password_verify` o equivalent.

Comprova que hi ha login o mecanisme equivalent, usuari autenticat guardat en sessio o equivalent, logout i una operacio real del domini protegida. Han d'existir cas no autenticat denegat, cas de credencial incorrecta i cas autenticat permés.

No exigisques rols avançats, registre públic complet, recuperacio de contrasenya, OAuth, JWT, base de dades ni arquitectura MVC. Penalitza contrasenyes guardades en clar, comparacio directa amb literals de contrasenya, pantalles de login decoratives, proteccio només visual, absencia de cas denegat o operacions protegides que no tenen valor dins del projecte.

Marca revisio docent si no es pot determinar on es bloqueja l'operacio.
