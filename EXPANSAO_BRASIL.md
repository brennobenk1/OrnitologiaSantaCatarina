# Expansão nacional — de Santa Catarina para o Brasil

## Como instalar

Copie os cinco arquivos para a raiz do repositório, substituindo os
existentes. Os arquivos novos são `cbro.js` e `iucn.js`; ambos já estão referenciados
no `index.html`, na ordem correta:

```html
<script src="cbro.js"></script>     <!-- base de dados (novo) -->
<script src="main.js"></script>
<script src="sinonimos.js"></script>
<script src="iucn.js"></script>     <!-- status global IUCN (novo) -->
```

`cbro.js` **precisa** vir antes do `main.js`. Se faltar, o `main.js` lança um
erro explícito em vez de carregar pela metade.

---

## O que mudou

| | Antes | Depois |
|---|---|---|
| Espécies | 689 | **1.972** |
| Subespécies | — | **1.998** |
| Ordens | 26 | **33** |
| Famílias | 71 | **102** |
| Gêneros mapeados | 453 | **733** |
| Autoria e ano | 688 | **1.969** |
| Guilda trófica | 688 | **1.972** |
| Nome em inglês | — | **1.971** |
| Endêmicas do Brasil | — | **293** |
| `main.js` | 872 KB | 622 KB |

A busca agora aceita também o nome em inglês (`Rufous-bellied Thrush` encontra
o sabiá-laranjeira).

---

## Fontes

**Taxonomia** — PACHECO, J. F. *et al.* Annotated checklist of the birds of
Brazil by the Brazilian Ornithological Records Committee, 2ª ed.
*Ornithology Research*, 29(2), 2021. DOI: 10.1007/s43388-021-00058-x

**ICMBio** — BRASIL. MMA. *Portaria MMA nº 1.704, de 16 de junho de 2026*.
Lista Nacional Oficial das Espécies da Fauna Ameaçadas de Extinção. DOU
17/06/2026, Ed. 111-B, Seção 1 - Extra B, p. 15. Substitui a Portaria MMA
nº 148/2022.

**Santa Catarina** — Consema, 2011 (dados preservados do site original).

---

## Status de conservação

### ICMBio — completo e atualizado

Extraí os Anexos I e II da Portaria 1.704/2026 e apliquei a todas as 1.972
espécies:

| Categoria | Espécies |
|---|---|
| CR — Criticamente em Perigo | 25 |
| EN — Em Perigo | 59 |
| VU — Vulnerável | 109 |
| EW — Extinta na Natureza | 1 (*Pauxi mitu*) |
| EX — Extinta | 3 |
| RE — Regionalmente Extinta | 3 |
| LC | 1.772 |

Quatro espécies carregam `possivelmenteExtinta: true`, correspondendo à
categoria **CR (PE)** da portaria: *Paraclaravis geoffroyi*,
*Calyptura cristata*, *Myrmotherula fluminensis* e *Cyanopsitta spixii*.

### Subespécies ameaçadas — o caso *Pulsatrix perspicillata*

Você apontou que *Pulsatrix perspicillata* apareceu como LC. Vale explicar o
que está acontecendo, porque a resposta não é simplesmente trocar para CR.

A portaria, no item 292, lista **_Pulsatrix perspicillata pulsatrix_** — a
subespécie nominal, da Mata Atlântica — como CR. A espécie
*Pulsatrix perspicillata* **não** está listada: ela ocorre da Amazônia ao
Sudeste e é comum em boa parte dessa área. Marcá-la como CR diria que o
murucututu inteiro está criticamente ameaçado no Brasil, o que não é o que a
norma diz.

Só que deixar a célula como um `LC` seco também está errado — a informação
some da tela. **Isso era o defeito de verdade, e foi corrigido:** a coluna
ICMBio agora mostra `LC` seguido de um selo vermelho **ssp. CR**, e o tooltip
lista exatamente quais subespécies estão no Anexo I e em qual categoria.

São 40 espécies nessa situação. Alguns exemplos:

| Espécie | ICMBio | Selo | Subespécies listadas |
|---|---|---|---|
| *Pulsatrix perspicillata* | LC | ssp. CR | *pulsatrix* = CR |
| *Sclerurus caudacutus* | LC | ssp. CR | *caligineus* = CR · *umbretta* = CR |
| *Neomorphus geoffroyi* | LC | ssp. CR | *amazonicus* = VU · *dulcis* = EN · *geoffroyi* = CR (PE) |
| *Penelope superciliaris* | LC | ssp. EN | *alagoensis* = EN |
| *Thamnophilus caerulescens* | LC | ssp. VU | *cearensis* = VU · *pernambucensis* = VU |

As quatro espécies em categoria **CR (PE)** (*Cyanopsitta spixii*,
*Paraclaravis geoffroyi*, *Calyptura cristata*, *Myrmotherula fluminensis*)
ganharam um selo preto **PE** ao lado do CR.

Se mesmo assim você preferir que a espécie herde a pior categoria das
subespécies, é uma linha em `main.js` — me avisa que eu troco.

**Leia `LC` com cuidado.** A portaria lista apenas táxons ameaçados. `LC` aqui
significa "não consta na Lista Nacional Oficial", não uma avaliação formal de
Pouco Preocupante — essas ficam na plataforma SALVE do ICMBio. Essa já era a
convenção da sua base original, então mantive.

A portaria também lista 47 táxons apenas em nível de **subespécie**. Nesses
casos a espécie não recebe a categoria (seria inflar o status); o dado fica no
campo `sspAmeacadas`. Exemplo: *Penelope superciliaris* tem `icmbio: "LC"` e
`sspAmeacadas: { "Penelope superciliaris alagoensis": "EN" }`. São 40 espécies
nessa situação.

Um único táxon da portaria não existe no CBRO 2021: **_Platyrinchus
niveigularis_**, descrito depois da publicação da lista. Ele ficou de fora da
base e precisa ser acrescentado à mão quando sair uma edição nova do CBRO.

### Santa Catarina — preservado

Os 689 registros que você já tinha estão intactos. As 1.283 espécies novas
receberam `sc: "NA"` (sem ocorrência registrada em SC). Adicionei `NA`,
`EW`, `EX` e `RE` às paletas, às ordenações e ao cálculo de divergência entre
listas, para que `NA` não seja contado como discordância.

### IUCN — `iucn.js`

A Portaria 1.704/2026 não contém nenhum dado da IUCN. São listas diferentes:
mesmos critérios, escalas diferentes (nacional x global), e divergem com
frequência — *Penelope superciliaris* é LC no ICMBio e NT na IUCN.

Procurei uma base bulk da Red List que eu pudesse embutir e não achei
nenhuma aberta e atual. Digitar 1.283 categorias de memória produziria
dezenas de erros silenciosos numa base científica, então fiz outra coisa:
**`iucn.js`**, um módulo que busca as categorias na API pública do GBIF, que
espelha a Red List oficial e não exige chave de acesso.

Como funciona: um painel aparece no canto inferior esquerdo mostrando a
cobertura atual. Ao clicar em *Completar status IUCN*, ele resolve cada nome
no backbone do GBIF e busca a categoria, seis consultas em paralelo, com o
resultado salvo no navegador conforme avança — dá para parar e retomar.

Terminada a varredura, **Exportar tabela** gera um `IUCN_TABELA.js` com todas
as categorias. Commite esse arquivo e inclua antes do `iucn.js`:

```html
<script src="IUCN_TABELA.js"></script>
<script src="iucn.js"></script>
```

A partir daí o site carrega os status na hora, sem rede, e a tabela tem
prioridade sobre o cache local. Quando sair uma versão nova da Red List,
basta apagar o cache (`IUCN.limpar()` no console) e rodar de novo.

Os 689 valores que você já tinha continuam intactos e servem de conferência:
se o GBIF divergir de algum deles, vale investigar antes de aceitar.

A varredura leva alguns minutos. Espécies sem avaliação na Red List ficam
listadas em `window.IUCN_FALHAS` depois que termina.

---

## Guilda trófica

As 688 atribuições que você curou estão preservadas e marcadas
`fonte: "especie"`. As outras 1.284 receberam inferência no nível de
**família** (102 famílias), marcada `fonte: "familia"`.

Na tabela de guildas essas aparecem com um selo tracejado **fam.** ao lado da
guilda. É um dado aproximado — *Trochilidae* inteira como "Nectarívoro"
funciona, mas *Furnariidae* e *Tyrannidae* têm variação interna grande e
merecem revisão espécie a espécie.

---

## Taxonomia

Ordem e família do seu site batiam **100%** com o CBRO — nada mudou aí.

Subfamília divergia em 34 gêneros. Adotei o CBRO. As mudanças mais visíveis:

| Gênero | Antes | Agora (CBRO 2021) |
|---|---|---|
| *Buteo*, *Rupornis*, *Geranoaetus*, *Urubitinga*, *Parabuteo*, *Pseudastur*, *Heterospizias*, *Geranospiza*, *Amadonastur* | Buteoninae | Accipitrininae |
| *Accipiter*, *Astur*, *Circus* | Accipitrinae | Accipitrininae |
| *Spizaetus* | Aquilinae | Accipitrininae |
| *Harpagus*, *Microspizias* | Harpaginae | Accipitrininae |
| *Ictinia*, *Rostrhamus* | Milvinae | Accipitrininae |
| *Oxyura*, *Nomonyx*, *Heteronetta* | Oxyurinae | Anatinae |
| *Coccyzus*, *Piaya*, *Micrococcyx* | Coccyzinae | Cuculinae |
| *Calidris* | Calidridinae | Arenariinae |
| *Phalaropus* | Phalaropodinae | Tringinae |
| *Chiroxiphia* | Piprinae | Ilicurinae |
| *Chlorophanes* | Dacninae | Hemithraupinae |
| *Phylloscartes* | Rhynchocyclinae | Pipromorphinae |
| *Merulaxis* | Rhinocryptinae | Scytalopodinae |
| *Lipaugus* | Cephalopterinae | Cotinginae |
| *Phibalura* | Cotinginae | Phytotominae |
| *Calliphlox*, *Heliomaster* | Lesbiinae | Trochilinae |
| *Lophornis* | Trochilinae | Lesbiinae |

Onde o CBRO **não** reconhece subfamília (79 famílias, como Tinamidae e
Cracidae), preservei a classificação que você já usava — nada foi perdido.

### Nomes

O CBRO 2021 é anterior a alguns nomes que você adotou. Mantive os seus como
canônicos, para o `sinonimos.js` continuar funcionando, e guardei o nome do
CBRO no campo `nomeCBRO`:

- *Ardea ibis* ← Bubulcus ibis
- *Astur bicolor* ← Accipiter bicolor
- *Microspizias superciliosus* ← Hieraspiza superciliosa
- *Ramphocelus bresilius* ← Ramphocelus bresilia

*Serinus canaria* não consta na Lista Primária do CBRO. Mantive, com nota no
registro.

---

## Estrutura de `cbro.js`

```js
window.CBRO_DATA = {
  versao, doi, abrangencia, fonteICMBio,
  LEGENDA_STATUS,          // BR, VI, VA, En, Ex, In, #, S/N/E/W
  especies,                // 1.972 registros
  subespecies,             // 1.998 registros
  subespeciesPorEspecie,   // índice
  guildas, guildaFamilia, descritores,
  ordemMap, familiaMap, subfamiliaMap,
  conservationData,        // formato histórico do main.js
  totais
}
```

Campos novos em `speciesInfo` e `BIRD_DATABASE`: `ingles`, `genero`,
`autoria`, `ano`, `status` (CBRO), `endemica`, `extinta`, `introduzida`,
`cbroId`, `nomeCBRO`, `subespecies`, `sspAmeacadas`, `possivelmenteExtinta`.

---

## Outras alterações

- `main.js`: os quatro blocos estáticos viraram referências ao módulo, daí a
  queda de 250 KB. Nenhuma das 20 ferramentas foi tocada.
- A tabela de guildas fazia `conservationData.find()` dentro de um `map` —
  com 1.972 espécies isso virava ~3,9 milhões de comparações por render.
  Troquei por um índice montado uma vez.
- `index.html`: título, meta tags, Open Graph, `<h1>`, placeholder do
  importador, legendas de conservação e referências bibliográficas.
- `style.css`: classes `.status-EW`, `.status-EX`, `.status-RE`,
  `.status-NA`, o selo `.guild-source-familia` e os selos `.ssp-flag` e
  `.pe-flag` da coluna ICMBio.

---

## O que revisar antes de publicar

1. **IUCN** — rodar a varredura do `iucn.js` uma vez e commitar o
   `IUCN_TABELA.js` gerado.
2. **Guilda de 1.284 espécies** — inferida por família, marcada com **fam.**
3. **Filogenia** — a árvore já cobria as 33 ordens brasileiras; não mexi.
4. **`photo_index.json`** — continua só com as fotos de SC. As espécies novas
   não têm imagem associada.
5. **`sinonimos.js`** — cobre bem os táxons de SC. Para o resto do país faltam
   sinônimos amazônicos e do Cerrado.
6. **Textos institucionais** que ainda citem SC em seções que não revisei.
