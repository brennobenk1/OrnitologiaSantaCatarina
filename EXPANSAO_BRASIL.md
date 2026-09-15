# Expansão nacional — de Santa Catarina para o Brasil

## Como instalar

Copie os seis arquivos para a raiz do repositório, substituindo os
existentes. Os arquivos novos são `cbro.js`, `IUCN_TABELA.js` e `iucn.js`; os três já
estão referenciados no `index.html`, na ordem correta:

```html
<script src="cbro.js"></script>     <!-- base de dados (novo) -->
<script src="main.js"></script>
<script src="sinonimos.js"></script>
<script src="IUCN_TABELA.js"></script>  <!-- status IUCN baked (novo) -->
<script src="iucn.js"></script>         <!-- atualizador IUCN (novo) -->
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

### IUCN — feito, com uma auditoria pelo caminho

Você rodou a varredura e mandou o `IUCN_TABELA.js`. Antes de aceitar,
conferi contra os 689 valores que você já tinha curados: **643 bateram
exatamente**, o que é um bom atestado da fonte. Mas a auditoria achou dois
problemas que eu precisava corrigir antes de a tabela entrar.

**Problema 1 — 158 entradas gravadas como `NE`.** O `iucn.js` estava
aceitando `NE` como se fosse uma categoria válida. Não é: quando o GBIF
devolve `NE` é porque não encontrou avaliação para aquele nome. Pior, em
**32 casos isso apagava um status que você já tinha** — *Aburria jacutinga*
ia de EN para NE, *Heteroxolmis dominicanus* de VU para NE, e mais 30 LCs.

A causa é taxonômica: o CBRO adota nomes posteriores ao arranjo do BirdLife.
A Red List conhece *Aburria jacutinga* como *Pipile jacutinga*, e *Ardea
ibis* como *Bubulcus ibis*. Sem tentar o nome antigo, a consulta volta vazia.

Corrigi nos dois lados. O `iucn.js` agora (a) não grava `NE` em hipótese
alguma, (b) só põe na fila espécies que ainda não têm categoria — status
conhecido nunca é rebaixado por consulta vazia — e (c) quando a primeira
tentativa falha, refaz a busca com os nomes de `sinonimos.js` e com o
`nomeCBRO`. Os resolvidos por esse caminho ficam em `window.IUCN_VIA_SINONIMO`.

**Problema 2 — 7 divergências reais.** Nesses a tabela do GBIF e o seu
acervo discordam, e na maioria o valor antigo do site parece ser o errado:

| Espécie | Site | Red List | Comentário |
|---|---|---|---|
| *Pandion haliaetus* | EN | LC | águia-pescadora é LC global |
| *Stercorarius parasiticus* | EN | LC | |
| *Anas acuta* | VU | LC | |
| *Asio flammeus* | NT | LC | |
| *Phylloscartes eximius* | NT | LC | |
| *Cyanocorax caeruleus* | VU | NT | reclassificada |
| *Hydropsalis anomala* | NT | VU | reclassificada |

Adotei o valor da Red List nos sete. Se algum tiver razão de ser diferente na
sua base, é trocar na mão no `IUCN_TABELA.js`.

**Resultado.** O `IUCN_TABELA.js` que está no pacote é a versão auditada:

| | |
|---|---|
| Com status global | **1.836** de 1.972 (93%) |
| — vindas do GBIF | 1.797 |
| — preservadas do seu acervo | 39 |
| Sem status | 136 |

Distribuição: 1.595 LC · 93 NT · 91 VU · 37 EN · 17 CR · 2 EX · 1 EW.

As 136 restantes não são falha da varredura: são táxons que o CBRO separa e
o BirdLife ainda agrupa, então não existe avaliação global sob esse nome.
Concentram-se em Dendrocolaptidae (17), Thamnophilidae (17) e Thraupidae
(13) — exatamente os grupos com mais *splits* amazônicos recentes. Ficam
como `NE`, que aqui é a resposta correta.

### Como o `iucn.js` funciona

A Portaria 1.704/2026 não contém nenhum dado da IUCN. São listas diferentes:
mesmos critérios, escalas diferentes (nacional x global), e divergem com
frequência — *Penelope superciliaris* é LC no ICMBio e NT na IUCN.

O módulo busca as categorias na API pública do GBIF, que espelha a Red List
oficial e não exige chave de acesso.

Um painel aparece no canto inferior esquerdo mostrando a
cobertura atual. Ao clicar em *Completar status IUCN*, ele resolve cada nome
no backbone do GBIF e busca a categoria, seis consultas em paralelo, com o
resultado salvo no navegador conforme avança — dá para parar e retomar.

Terminada a varredura, **Exportar tabela** regenera o `IUCN_TABELA.js`. Ele
já está incluído no `index.html`, antes do `iucn.js`, e tem prioridade sobre
o cache do navegador — o site carrega os status na hora, sem rede.

Quando sair uma versão nova da Red List, rode `IUCN.limpar()` no console e
clique em *Completar status IUCN* de novo. Só que **reaudite antes de
commitar**: exporte, compare com o arquivo atual e olhe as diferenças. Foi
assim que os 32 rebaixamentos apareceram.

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

## Regionalização — o que virou Brasil e o que continua SC

O site inteiro passou a falar do Brasil. **A única coisa que continua sendo
de Santa Catarina é a coluna SC da aba Conservação**, que é o recorte
estadual e faz sentido existir ao lado da lista nacional e da global.

Virou Brasil:

- Cabeçalho, rodapé, título, meta tags e Open Graph
- Relatórios em PDF e TXT: cabeçalhos, rodapés e blocos de metodologia
  (eram "Ornitologia SC" / "ORNITOLOGIA AVANÇADA DE SC")
- Relatório de campo e relatório de mapa
- Modal de consulta de espécies — era "Espécies Registradas em SC", agora
  consulta a Lista de Aves do Brasil inteira, com busca por nome em inglês
- Exemplos do guia que estavam presos ao clima catarinense (a nota de
  sazonalidade agora fala do gradiente equatorial-subtropical do país)
- Bloco de fontes: a referência de conservação citava a lista de 2010 e a
  Portaria 148/2022, ambas superadas

Continua SC:

- Coluna **SC** da tabela de conservação, seu gráfico de pizza e a legenda
- A referência do Consema (2011) na bibliografia
- O cálculo de divergência entre listas, que só faz sentido com as três

### Sensibilidade ecológica passou a usar o ICMBio

A aba Indicadoras calculava o bônus de conservação com o maior valor entre
IUCN e SC — o ICMBio ficava de fora, o que agora seria uma perda grande, já
que é a lista com melhor cobertura nacional. Passou a considerar as três, e a
tabela ganhou a coluna ICMBio. O filtro de grau mínimo também passa a aceitar
espécies que só estão ameaçadas na lista nacional.

## Guia reescrito

O guia ganhou uma seção nova, **🗂️ A base de dados**, logo depois do "Por
onde começar" (já linkada no índice). Ela cobre o que antes não estava
documentado em lugar nenhum:

- O que é a lista do CBRO e o que ela abrange, com os números
- Os códigos de status de ocorrência (BR, VI, VA, En, In, Ex, #)
- Que a busca aceita nome popular, científico **e em inglês**
- Que nomes antigos são reconhecidos via `sinonimos.js`
- **As duas lacunas conhecidas**, ditas abertamente: as 136 espécies sem
  status IUCN e as 1.284 guildas inferidas por família

A seção de conservação foi refeita para explicar por que as três listas
divergem, o que `LC` significa de verdade na coluna ICMBio, e como ler os
selos **ssp.** e **PE**. As categorias EW, EX, RE e NA entraram na legenda.

## Painel de IUCN removido

O `iucn.js` não desenha mais nada na tela e não faz requisição de rede. Ele só
injeta o `IUCN_TABELA.js` na base ao carregar. A varredura continua existindo,
mas agora é operação de manutenção pelo console:

```js
await IUCN.varrer()   // consulta o GBIF só para quem ainda não tem categoria
IUCN.exportar()       // baixa o IUCN_TABELA.js atualizado
```

O arquivo caiu de 15 KB para 8 KB.

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

1. **As 7 divergências IUCN** da tabela acima — decidir se aceita o valor da
   Red List ou mantém o seu.
2. **136 espécies sem status global** — são *splits* que o BirdLife não
   reconhece. Nada a fazer até a Red List incorporar o arranjo do CBRO.
3. **Guilda de 1.284 espécies** — inferida por família, marcada com **fam.**
4. **Filogenia** — a árvore já cobria as 33 ordens brasileiras; não mexi.
5. **`photo_index.json`** — continua só com as fotos de SC. As espécies novas
   não têm imagem associada.
6. **`sinonimos.js`** — cobre bem os táxons de SC. Para o resto do país faltam
   sinônimos amazônicos e do Cerrado.
7. **Textos institucionais** que ainda citem SC em seções que não revisei.
