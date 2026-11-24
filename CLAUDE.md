# natale-leo

Lista dei desideri di Natale della famiglia, da mandare ai parenti su WhatsApp. Pubblicata con GitHub Pages dalla radice del ramo `main`: `https://mauriziotarsia-dev.github.io/natale-leo/`. Creata il 24 novembre 2026.

## Come è fatta

- `index.html` è tutta l'app: stile e script dentro la pagina, niente build e niente dipendenze.
- `foto/` contiene le foto dei regali del volantino, con un pezzo di hash nel nome: un file cambiato va salvato con un nome nuovo, così i telefoni non tengono la versione vecchia.
- `og.jpg` è l'anteprima che WhatsApp mostra sotto il link; `icona.png` è l'icona per la Home.

## Dati

- Regali, prenotazioni, altri regali, proposte e impostazioni stanno nel progetto Supabase `natale-leo` (ref `smglmkaykgomgehfarqh`), nello schema privato `natale`. Lo schema non è esposto: la pagina passa solo dalle funzioni RPC `natale_*` (SECURITY DEFINER, `search_path` vuoto), che controllano il token del dispositivo o il codice dei genitori.
- La pagina contiene solo l'indirizzo del progetto e la chiave pubblicabile. Il repository è pubblico: niente nomi, messaggi o altri dati della famiglia nei file o nei commit. Titolo, nome del bambino e testi stanno nel database.
- I parenti si riconoscono con nome e un token casuale salvato sul telefono (`natale.token`, `natale.nome` in localStorage); nel database c'è solo l'hash del token.
- L'area genitori è `#genitori` e chiede il codice dei genitori (bcrypt nel database, cambiabile dalle impostazioni dell'area). Il codice non sta nel repository. Dopo 25 tentativi sbagliati in 10 minuti le richieste vengono rifiutate.
- Un progetto Supabase gratuito va in pausa dopo circa una settimana senza richieste: se la pagina smette di caricare i regali, va riattivato dalla dashboard di Supabase.

## Commit

Autore: l'indirizzo noreply di GitHub del genitore, mai la sua email personale.
