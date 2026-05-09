# NBT Reader (.dat -> JSON)

Projeto web estatico para converter arquivos `.dat` do Minecraft (NBT) em JSON no navegador.

## Funcionalidades

- Upload de arquivo `.dat`/`.nbt`
- Leitura com `FileReader` como `ArrayBuffer`
- Tentativa de descompressao GZIP com `pako`
- Parsing NBT com `nbtify`
- Tratamento de `BigInt` para serializacao JSON
- Saida formatada com 2 espacos de indentacao
- Botao para copiar o JSON

## Tecnologias e CDNs

- Pako (GZIP): https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js
- NBT parser (browser): https://cdn.jsdelivr.net/npm/nbtify@2.2.0/+esm

## Como usar localmente

1. Baixe/clone este repositorio.
2. Abra o arquivo `index.html` no navegador (ou sirva via HTTP estatico).
3. Selecione um arquivo `.dat`.
4. Clique em **Converter para JSON**.
5. Use **Copiar JSON** para copiar o resultado.

## Publicar no GitHub Pages

1. Envie os arquivos para um repositorio no GitHub.
2. No GitHub, acesse **Settings > Pages**.
3. Em **Build and deployment**, selecione:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (ou sua branch principal), pasta `/ (root)`
4. Salve as configuracoes e aguarde a publicacao.
5. A URL final sera algo como:
   - `https://SEU_USUARIO.github.io/SEU_REPOSITORIO/`

## Estrutura

- `index.html` - Estrutura principal da pagina
- `style.css` - Estilizacao dark mode responsiva
- `app.js` - Leitura de arquivo, GZIP, parsing NBT e copia
- `.gitignore` - Ignora arquivos temporarios comuns

## Observacoes

- Alguns arquivos `.dat` podem nao estar em GZIP. Nesse caso, o parser tenta ler o conteudo original.
- Valores `BigInt` sao convertidos para string com sufixo `n` para manter precisao no JSON.
