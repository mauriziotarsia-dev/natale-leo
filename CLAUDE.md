# natale-leo

Lista dei desideri di Natale della famiglia, da mandare ai parenti su WhatsApp. Pubblicata con GitHub Pages dalla radice del ramo `main`: `https://mauriziotarsia-dev.github.io/natale-leo/`. Creata il 24 novembre 2026.

## Come è fatta

- `index.html` è tutta l'app: stile e script dentro la pagina, niente build e niente dipendenze.
- `foto/` contiene le foto dei regali del volantino, con un pezzo di hash nel nome: un file cambiato va salvato con un nome nuovo, così i telefoni non tengono la versione vecchia.
- `og.jpg` è l'anteprima che WhatsApp mostra sotto il link; `icona.png` è l'icona per la Home.
- `leo.html` è l'ingresso del gioco di Leo: aperta in Safari spiega come aggiungerla alla Home (icona `icona-leo.png`); aperta dalla Home va subito a `index.html#leo`.
- `lib/zxing-0.23.0.min.js` (con `lib/zxing-LICENSE.txt`, Apache 2.0) legge i codici a barre dalle foto; si carica solo quando serve.
- `lib/fonts/`: Fredoka (titoli, pulsanti, prezzi) e Nunito (testo), variabili, solo latino, con le licenze OFL. Niente Google Fonts.
- Stile natalizio: testata rosso velluto con nastro dorato, fiocco e filo di lucine; cartellino regalo bianco col titolo; cartellini rossi per i prezzi; gioco su cielo notturno con neve e abeti.

## Funzioni

- **Categorie** (`categoria` nel database, anche più di una separate da virgola): dinosauri, veicoli, playset, costruzioni, giochi, musica, creativita, peluche, vestiti, altro. Tabella `CATEGORIE` in `index.html`. Filtri nella lista dei parenti, nel gioco e nella classifica.
- **Foto**: ogni regalo ha le foto di Amazon (`foto_extra`, link a `m.media-amazon.com`, non copiate nel repository) seguite dalla foto del volantino (`foto`); si scorrono col dito nelle schede e nel dettaglio. Il gioco usa la prima.
- **Gioco «quale preferisci»** (area genitori, scheda «Gioco con Leo», pulsante 🦖 Leo nella barra, oppure `#leo`): due regali per volta, Leo tocca quello che preferisce. La prima partita su un gruppo è lunga (`PRIMA_MAX` 30 con tutti i regali: ognuno compare almeno una volta), le altre di 16 (`ROUND`); il progresso è una slitta che va verso il regalo. Dopo la prima partita, ogni 6 scelte torna una coppia già vista a lati invertiti. Le scelte stanno nella tabella privata `natale.confronti` (funzioni `natale_g_confronti*`, con il codice dei genitori) e in una coda sul telefono se la rete manca. Classifica con Bradley-Terry pesato: una scelta vale la metà dopo 14 giorni (`EMIVITA_GIORNI`).
- **Regali nuovi**: un regalo con meno di 2 confronti, quando la metà degli altri ne ha almeno 2, è «nuovo»; la figura 🆕 nel gioco lo mette contro regali già in classifica di forza simile, così bastano circa 4 scelte per piazzarlo.
- **Aggiunta regali** dall'area genitori: da foto, da nota o da codice a barre (il numero diventa una ricerca Amazon, `link_stato` `ricerca`).
- Il gioco di Leo (`#leo`) chiede la password del gioco (hash in `impostazioni.leo_hash`, cambiabile dalle Impostazioni dei genitori; vale anche il codice dei genitori). Funzioni `natale_leo_dati` (solo regali visibili: titolo, foto, categoria) e `natale_leo_confronti_salva`. La password resta sul telefono in `natale.leopw`. In modalità Leo la lista non si vede; 🏠 torna alla lista.

## Dati

- Regali, prenotazioni, altri regali, proposte e impostazioni stanno nel progetto Supabase `natale-leo` (ref `smglmkaykgomgehfarqh`), nello schema privato `natale`. Lo schema non è esposto: la pagina passa solo dalle funzioni RPC `natale_*` (SECURITY DEFINER, `search_path` vuoto), che controllano il token del dispositivo o il codice dei genitori.
- La pagina contiene solo l'indirizzo del progetto e la chiave pubblicabile. Il repository è pubblico: niente nomi, messaggi o altri dati della famiglia nei file o nei commit. Titolo, nome del bambino e testi stanno nel database.
- I parenti si riconoscono con nome e un token casuale salvato sul telefono (`natale.token`, `natale.nome` in localStorage); nel database c'è solo l'hash del token.
- L'area genitori è `#genitori` e chiede il codice dei genitori (bcrypt nel database, cambiabile dalle impostazioni dell'area). Il codice non sta nel repository. Dopo 25 tentativi sbagliati in 10 minuti le richieste vengono rifiutate.
- Un progetto Supabase gratuito va in pausa dopo circa una settimana senza richieste: se la pagina smette di caricare i regali, va riattivato dalla dashboard di Supabase.

## Commit

Autore: l'indirizzo noreply di GitHub del genitore, mai la sua email personale.
