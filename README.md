# mimo · pré-cadastro

Landing page de pré-lançamento do app **mimo** ("manda um áudio. ganha um diário."), pensada primeiro pro iPhone e responsiva.

- Mascote animada e interativa (segue o dedo, reage ao toque, pode ser arrastada, dorme)
- Pré-cadastro com login do Google
- Final animado: o convite entra num envelope, a mascote sai voando com ele e aparece o agradecimento com os brindes

## Rodar localmente

```bash
python3 -m http.server 5180
```

Depois abra http://localhost:5180.

## Ligar o login de verdade

O login com Google ainda é simulado. Troque o corpo da função `salvarPreCadastro` em `app.js` pela chamada real (ex.: `supabase.auth.signInWithOAuth({ provider: 'google' })`).
