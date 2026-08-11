/* ============================================================
   SINÔNIMOS TAXONÔMICOS — Ornitologia Avançada de Santa Catarina
   ------------------------------------------------------------
   A base usa os nomes atualmente aceitos. Este módulo faz o site
   continuar aceitando os nomes antigos: corrige para o atual e
   avisa o usuário da mudança.

       digita "Bubulcus ibis"  ->  vira Ardea ibis
                               ->  avisa "táxon alterado"

   INSTALAÇÃO: carregar DEPOIS do main.js
       <script src="main.js"></script>
       <script src="sinonimos.js"></script>

   COMO FUNCIONA
   Toda busca do main.js passa por normalizeForSearch() antes de
   consultar o searchIndex — autocomplete, findBirdFuzzy e
   correcaoAutocomplete inclusive. Trocando essa função, a
   correção vale para todos os caminhos de uma vez.
   getSpeciesInfo() compara string direto, sem normalizar, então
   é tratada à parte.

   O aviso só aparece em ações concluídas (colar lista, buscar,
   abrir ficha) — nunca a cada tecla digitada.
   ============================================================ */
(function () {
    'use strict';

    const GRUPOS = [
        // ---- Correções pendentes na base do site ----
        { aceito: 'Ardea ibis',                  sin: ['Bubulcus ibis', 'Ardeola ibis', 'Egretta ibis'] },
        { aceito: 'Microspizias superciliosus',  sin: ['Accipiter superciliosus', 'Hieraspiza superciliosa'] },
        { aceito: 'Astur bicolor',               sin: ['Accipiter bicolor'] },

        // ---- Anseriformes ----
        { aceito: 'Spatula versicolor',          sin: ['Anas versicolor'] },
        { aceito: 'Spatula platalea',            sin: ['Anas platalea'] },
        { aceito: 'Spatula discors',             sin: ['Anas discors'] },
        { aceito: 'Spatula cyanoptera',          sin: ['Anas cyanoptera'] },
        { aceito: 'Mareca sibilatrix',           sin: ['Anas sibilatrix'] },
        { aceito: 'Sarkidiornis sylvicola',      sin: ['Sarkidiornis melanotos'] },

        // ---- Galliformes ----
        { aceito: 'Aburria jacutinga',           sin: ['Pipile jacutinga', 'Penelope jacutinga'] },
        { aceito: 'Ortalis squamata',            sin: ['Ortalis guttata squamata', 'Ortalis guttata'] },

        // ---- Podicipediformes ----
        { aceito: 'Podicephorus major',          sin: ['Podiceps major'] },

        // ---- Columbiformes ----
        { aceito: 'Patagioenas picazuro',        sin: ['Columba picazuro'] },
        { aceito: 'Patagioenas cayennensis',     sin: ['Columba cayennensis'] },
        { aceito: 'Patagioenas plumbea',         sin: ['Columba plumbea'] },
        { aceito: 'Columbina squammata',         sin: ['Scardafella squammata'] },

        // ---- Cuculiformes ----
        { aceito: 'Micrococcyx cinereus',        sin: ['Coccyzus cinereus', 'Coccycua cinerea'] },

        // ---- Caprimulgiformes ----
        { aceito: 'Antrostomus rufus',           sin: ['Caprimulgus rufus'] },
        { aceito: 'Antrostomus sericocaudatus',  sin: ['Caprimulgus sericocaudatus'] },
        { aceito: 'Hydropsalis parvula',         sin: ['Caprimulgus parvulus'] },
        { aceito: 'Hydropsalis longirostris',    sin: ['Caprimulgus longirostris'] },
        { aceito: 'Hydropsalis anomala',         sin: ['Eleothreptus anomalus'] },
        { aceito: 'Hydropsalis forcipata',       sin: ['Macropsalis forcipata', 'Macropsalis creagra'] },
        { aceito: 'Nyctidromus albicollis',      sin: ['Caprimulgus albicollis'] },

        // ---- Apodiformes / Trochilidae ----
        { aceito: 'Florisuga fusca',             sin: ['Melanotrochilus fuscus'] },
        { aceito: 'Heliodoxa rubricauda',        sin: ['Clytolaema rubricauda'] },
        { aceito: 'Stephanoxis loddigesii',      sin: ['Stephanoxis lalandi'] },
        { aceito: 'Chlorostilbon lucidus',       sin: ['Chlorostilbon aureoventris'] },
        { aceito: 'Chrysuronia versicolor',      sin: ['Amazilia versicolor', 'Agyrtria versicolor'] },
        { aceito: 'Chionomesa fimbriata',        sin: ['Amazilia fimbriata', 'Agyrtria fimbriata'] },
        { aceito: 'Chionomesa lactea',           sin: ['Amazilia lactea', 'Agyrtria lactea'] },
        { aceito: 'Aphantochroa cirrochloris',   sin: ['Campylopterus cirrochloris'] },

        // ---- Gruiformes ----
        { aceito: 'Gallinula galeata',           sin: ['Gallinula chloropus'] },
        { aceito: 'Porphyrio martinica',         sin: ['Porphyrula martinica'] },
        { aceito: 'Porphyrio flavirostris',      sin: ['Porphyrula flavirostris'] },
        { aceito: 'Porphyriops melanops',        sin: ['Gallinula melanops'] },
        { aceito: 'Mustelirallus albicollis',    sin: ['Porzana albicollis', 'Neocrex albicollis'] },
        { aceito: 'Laterallus flaviventer',      sin: ['Porzana flaviventer', 'Hapalocrex flaviventer'] },
        { aceito: 'Laterallus spilopterus',      sin: ['Porzana spiloptera'] },
        { aceito: 'Aramides cajaneus',           sin: ['Aramides cajanea'] },
        { aceito: 'Amaurolimnas concolor',       sin: ['Aramides concolor'] },

        // ---- Charadriiformes ----
        { aceito: 'Numenius hudsonicus',         sin: ['Numenius phaeopus hudsonicus'] },
        { aceito: 'Calidris subruficollis',      sin: ['Tryngites subruficollis'] },
        { aceito: 'Calidris himantopus',         sin: ['Micropalama himantopus'] },
        { aceito: 'Tringa semipalmata',          sin: ['Catoptrophorus semipalmatus'] },
        { aceito: 'Tringa inornata',             sin: ['Catoptrophorus semipalmatus inornatus'] },
        { aceito: 'Actitis macularius',          sin: ['Actitis macularia', 'Tringa macularia'] },
        { aceito: 'Himantopus melanurus',        sin: ['Himantopus mexicanus melanurus'] },
        { aceito: 'Chroicocephalus maculipennis', sin: ['Larus maculipennis'] },
        { aceito: 'Chroicocephalus cirrocephalus', sin: ['Larus cirrocephalus'] },
        { aceito: 'Leucophaeus modestus',        sin: ['Larus modestus'] },
        { aceito: 'Leucophaeus atricilla',       sin: ['Larus atricilla'] },
        { aceito: 'Leucophaeus pipixcan',        sin: ['Larus pipixcan'] },
        { aceito: 'Thalasseus acuflavidus',      sin: ['Sterna eurygnatha', 'Thalasseus eurygnathus', 'Sterna sandvicensis eurygnatha'] },
        { aceito: 'Thalasseus maximus',          sin: ['Sterna maxima'] },
        { aceito: 'Sternula antillarum',         sin: ['Sterna antillarum'] },
        { aceito: 'Sternula superciliaris',      sin: ['Sterna superciliaris'] },
        { aceito: 'Stercorarius chilensis',      sin: ['Catharacta chilensis'] },
        { aceito: 'Stercorarius maccormicki',    sin: ['Catharacta maccormicki'] },
        { aceito: 'Stercorarius antarcticus',    sin: ['Catharacta antarctica', 'Catharacta skua antarctica'] },

        // ---- Procellariiformes ----
        { aceito: 'Ardenna grisea',              sin: ['Puffinus griseus'] },
        { aceito: 'Ardenna gravis',              sin: ['Puffinus gravis'] },
        { aceito: 'Calonectris borealis',        sin: ['Calonectris diomedea borealis', 'Calonectris diomedea'] },
        { aceito: 'Thalassarche melanophris',    sin: ['Diomedea melanophris', 'Thalassarche melanophrys'] },
        { aceito: 'Thalassarche chlororhynchos', sin: ['Diomedea chlororhynchos'] },
        { aceito: 'Thalassarche chrysostoma',    sin: ['Diomedea chrysostoma'] },
        { aceito: 'Procellaria conspicillata',   sin: ['Procellaria aequinoctialis conspicillata'] },

        // ---- Suliformes / Pelecaniformes ----
        { aceito: 'Nannopterum brasilianum',     sin: ['Phalacrocorax brasilianus', 'Phalacrocorax olivaceus'] },
        { aceito: 'Platalea ajaja',              sin: ['Ajaia ajaja'] },
        { aceito: 'Butorides striata',           sin: ['Butorides striatus', 'Ardeola striata'] },
        { aceito: 'Ixobrychus involucris',       sin: ['Botaurus involucris'] },

        // ---- Cathartiformes / Accipitriformes ----
        { aceito: 'Urubitinga urubitinga',       sin: ['Buteogallus urubitinga', 'Hypomorphnus urubitinga'] },
        { aceito: 'Urubitinga coronata',         sin: ['Harpyhaliaetus coronatus', 'Buteogallus coronatus'] },
        { aceito: 'Heterospizias meridionalis',  sin: ['Buteogallus meridionalis', 'Buteo meridionalis'] },
        { aceito: 'Amadonastur lacernulatus',    sin: ['Leucopternis lacernulatus'] },
        { aceito: 'Pseudastur polionotus',       sin: ['Leucopternis polionotus'] },
        { aceito: 'Rupornis magnirostris',       sin: ['Buteo magnirostris'] },
        { aceito: 'Geranoaetus albicaudatus',    sin: ['Buteo albicaudatus'] },
        { aceito: 'Geranoaetus melanoleucus',    sin: ['Buteo melanoleucus', 'Buteo fuscescens'] },
        { aceito: 'Parabuteo leucorrhous',       sin: ['Buteo leucorrhous'] },
        { aceito: 'Spizaetus melanoleucus',      sin: ['Spizastur melanoleucus'] },
        { aceito: 'Chondrohierax uncinatus',     sin: ['Leptodon uncinatus'] },

        // ---- Strigiformes ----
        { aceito: 'Tyto furcata',                sin: ['Tyto alba', 'Tyto alba tuidara'] },
        { aceito: 'Megascops choliba',           sin: ['Otus choliba'] },
        { aceito: 'Megascops atricapilla',       sin: ['Otus atricapillus', 'Megascops atricapillus'] },
        { aceito: 'Megascops sanctaecatarinae',  sin: ['Otus sanctaecatarinae'] },
        { aceito: 'Strix virgata',               sin: ['Ciccaba virgata'] },
        { aceito: 'Strix huhula',                sin: ['Ciccaba huhula'] },
        { aceito: 'Asio clamator',               sin: ['Rhinoptynx clamator', 'Pseudoscops clamator'] },

        // ---- Coraciiformes / Piciformes ----
        { aceito: 'Megaceryle torquata',         sin: ['Ceryle torquata'] },
        { aceito: 'Notharchus swainsoni',        sin: ['Notharchus macrorhynchos swainsoni'] },
        { aceito: 'Malacoptila striata',         sin: ['Malacoptila torquata striata'] },
        { aceito: 'Pteroglossus bailloni',       sin: ['Baillonius bailloni'] },
        { aceito: 'Celeus galeatus',             sin: ['Dryocopus galeatus'] },
        { aceito: 'Piculus aurulentus',          sin: ['Colaptes aurulentus'] },

        // ---- Falconiformes / Psittaciformes ----
        { aceito: 'Caracara plancus',            sin: ['Polyborus plancus'] },
        { aceito: 'Psittacara leucophthalmus',   sin: ['Aratinga leucophthalma', 'Aratinga leucophthalmus'] },
        { aceito: 'Primolius maracana',          sin: ['Ara maracana', 'Propyrrhura maracana'] },
        { aceito: 'Forpus xanthopterygius',      sin: ['Psittacula xanthopterygia'] },

        // ---- Passeriformes: Thamnophilidae e afins ----
        { aceito: 'Rhopias gularis',             sin: ['Myrmotherula gularis'] },
        { aceito: 'Myrmoderus squamosus',        sin: ['Myrmeciza squamosa'] },
        { aceito: 'Formicivora acutirostris',    sin: ['Stymphalornis acutirostris'] },
        { aceito: 'Dysithamnus xanthopterus',    sin: ['Herpsilochmus xanthopterus'] },
        { aceito: 'Cryptopezus nattereri',       sin: ['Hylopezus nattereri', 'Grallaria nattereri'] },
        { aceito: 'Eleoscytalopus indigoticus',  sin: ['Scytalopus indigoticus'] },

        // ---- Furnariidae / Dendrocolaptidae ----
        { aceito: 'Dendrocincla turdina',        sin: ['Dendrocincla fuliginosa turdina'] },
        { aceito: 'Lepidocolaptes falcinellus',  sin: ['Lepidocolaptes squamatus falcinellus'] },
        { aceito: 'Dendroma rufa',               sin: ['Philydor rufum', 'Philydor rufus'] },
        { aceito: 'Anabacerthia lichtensteini',  sin: ['Philydor lichtensteini'] },
        { aceito: 'Anabacerthia amaurotis',      sin: ['Philydor amaurotis', 'Hylocryptus amaurotis'] },
        { aceito: 'Clibanornis dendrocolaptoides', sin: ['Automolus dendrocolaptoides'] },
        { aceito: 'Phacellodomus ferrugineigula', sin: ['Phacellodomus erythrophthalmus', 'Phacellodomus rufifrons ferrugineigula'] },
        { aceito: 'Certhiaxis cinnamomeus',      sin: ['Certhiaxis cinnamomea'] },
        { aceito: 'Limnoctites rectirostris',    sin: ['Limnornis rectirostris'] },

        // ---- Tyrannidae e afins ----
        { aceito: 'Tyranniscus burmeisteri',     sin: ['Phyllomyias burmeisteri', 'Zimmerius burmeisteri'] },
        { aceito: 'Griseotyrannus aurantioatrocristatus', sin: ['Empidonomus aurantioatrocristatus', 'Tyrannus aurantioatrocristatus'] },
        { aceito: 'Nengetus cinereus',           sin: ['Xolmis cinereus'] },
        { aceito: 'Heteroxolmis dominicanus',    sin: ['Xolmis dominicanus', 'Neoxolmis dominicanus'] },
        { aceito: 'Onychorhynchus swainsoni',    sin: ['Onychorhynchus coronatus swainsoni'] },
        { aceito: 'Ramphotrigon megacephalum',   sin: ['Ramphotrigon megacephala'] },
        { aceito: 'Conopias trivirgatus',        sin: ['Conopias trivirgata'] },
        { aceito: 'Pyrocephalus rubinus',        sin: ['Pyrocephalus rubinus rubinus'] },
        { aceito: 'Lessonia rufa',               sin: ['Lessonia rufa rufa'] },
        { aceito: 'Hemitriccus kaempferi',       sin: ['Idioptilon kaempferi'] },
        { aceito: 'Poecilotriccus plumbeiceps',  sin: ['Todirostrum plumbeiceps'] },

        // ---- Vireonidae / Hirundinidae / Troglodytidae ----
        { aceito: 'Vireo chivi',                 sin: ['Vireo olivaceus', 'Vireo olivaceus chivi'] },
        { aceito: 'Pygochelidon cyanoleuca',     sin: ['Notiochelidon cyanoleuca', 'Atticora cyanoleuca'] },
        { aceito: 'Tachycineta leucopyga',       sin: ['Tachycineta meyeni', 'Iridoprocne leucopyga'] },
        { aceito: 'Petrochelidon pyrrhonota',    sin: ['Hirundo pyrrhonota'] },
        { aceito: 'Troglodytes musculus',        sin: ['Troglodytes aedon', 'Troglodytes aedon musculus'] },
        { aceito: 'Cantorchilus longirostris',   sin: ['Thryothorus longirostris'] },

        // ---- Turdidae / Motacillidae / Fringillidae ----
        { aceito: 'Catharus swainsoni',          sin: ['Catharus ustulatus', 'Catharus ustulatus swainsoni'] },
        { aceito: 'Anthus chii',                 sin: ['Anthus lutescens'] },
        { aceito: 'Spinus magellanicus',         sin: ['Carduelis magellanica'] },
        { aceito: 'Cyanophonia cyanocephala',    sin: ['Euphonia cyanocephala', 'Tanagra cyanocephala'] },

        // ---- Icteridae ----
        { aceito: 'Leistes superciliaris',       sin: ['Sturnella superciliaris', 'Trupialis superciliaris'] },
        { aceito: 'Icterus pyrrhopterus',        sin: ['Icterus cayanensis', 'Icterus cayanensis pyrrhopterus'] },
        { aceito: 'Molothrus oryzivorus',        sin: ['Scaphidura oryzivora', 'Psomocolax oryzivorus'] },
        { aceito: 'Chrysomus ruficapillus',      sin: ['Agelaius ruficapillus'] },
        { aceito: 'Agelasticus thilius',         sin: ['Agelaius thilius'] },
        { aceito: 'Xanthopsar flavus',           sin: ['Agelaius flavus'] },
        { aceito: 'Agelaioides badius',          sin: ['Molothrus badius'] },

        // ---- Parulidae ----
        { aceito: 'Setophaga pitiayumi',         sin: ['Parula pitiayumi'] },
        { aceito: 'Setophaga cerulea',           sin: ['Dendroica cerulea'] },
        { aceito: 'Setophaga striata',           sin: ['Dendroica striata'] },
        { aceito: 'Myiothlypis leucoblephara',   sin: ['Basileuterus leucoblepharus', 'Phaeothlypis leucoblephara'] },
        { aceito: 'Myiothlypis rivularis',       sin: ['Basileuterus rivularis', 'Phaeothlypis rivularis'] },

        // ---- Cardinalidae / Thraupidae ----
        { aceito: 'Cyanoloxia brissonii',        sin: ['Cyanocompsa brissonii', 'Passerina brissonii'] },
        { aceito: 'Cyanoloxia glaucocaerulea',   sin: ['Cyanocompsa glaucocaerulea'] },
        { aceito: 'Saltator fuliginosus',        sin: ['Pitylus fuliginosus'] },
        { aceito: 'Asemospiza fuliginosa',       sin: ['Tiaris fuliginosus', 'Tiaris fuliginosa'] },
        { aceito: 'Loriotus cristatus',          sin: ['Tachyphonus cristatus'] },
        { aceito: 'Rauenia bonariensis',         sin: ['Thraupis bonariensis', 'Pipraeidea bonariensis'] },
        { aceito: 'Stilpnia preciosa',           sin: ['Tangara preciosa'] },
        { aceito: 'Stilpnia peruviana',          sin: ['Tangara peruviana'] },
        { aceito: 'Thraupis ornata',             sin: ['Tangara ornata'] },
        { aceito: 'Thraupis cyanoptera',         sin: ['Tangara cyanoptera'] },
        { aceito: 'Castanozoster thoracicus',    sin: ['Poospiza thoracica'] },
        { aceito: 'Microspingus cabanisi',       sin: ['Poospiza cabanisi', 'Poospiza lateralis cabanisi', 'Poospiza lateralis'] },
        { aceito: 'Rhopospina fruticeti',        sin: ['Phrygilus fruticeti'] },
        { aceito: 'Sporophila angolensis',       sin: ['Oryzoborus angolensis'] },
        { aceito: 'Sporophila beltoni',          sin: ['Sporophila plumbea beltoni'] },
        { aceito: 'Sporophila pileata',          sin: ['Sporophila plumbea pileata'] },
        { aceito: 'Schistochlamys ruficapillus', sin: ['Schistochlamys ruficapilla'] },
        { aceito: 'Cissopis leverianus',         sin: ['Cissopis leveriana'] },
        { aceito: 'Thlypopsis pyrrhocoma',       sin: ['Hemithraupis pyrrhocoma', 'Pyrrhocoma ruficeps'] },
        { aceito: 'Emberizoides ypiranganus',    sin: ['Emberizoides herbicola ypiranganus'] }
    ];
    /* Notas exibidas no aviso. Sem entrada aqui, usa texto genérico. */
    const NOTAS = {
        'Ardea ibis':
            'Bubulcus foi incorporado a Ardea (Hruska et al. 2023; SACC prop. 1049, 2025). ' +
            'O CBRO ainda não adotou a mudança.',
        'Microspizias superciliosus':
            'Gênero Microspizias erigido por Sangster et al. (2021). ' +
            'Hieraspiza é sinônimo, não adotado pelas listas principais.',
        'Astur bicolor':
            'Transferida de Accipiter para Astur (Catanach et al. 2024) — Accipiter era parafilético.'
    };

    /* ------------------------------------------------------------
       2. ÍNDICE
       ------------------------------------------------------------ */
    function norm(s) {
        if (!s) return '';
        return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .toLowerCase().replace(/[-\s]+/g, ' ').trim();
    }

    const MAPA = new Map();
    GRUPOS.forEach(function (g) {
        const todos = [g.aceito].concat(g.sin);
        todos.forEach(function (n) { MAPA.set(norm(n), { aceito: g.aceito, todos: todos }); });
    });

    function nomeAceito(e) { const g = MAPA.get(norm(e)); return g ? g.aceito : e; }
    function equivalentes(e) { const g = MAPA.get(norm(e)); return g ? g.todos : [e]; }

    /* ------------------------------------------------------------
       3. AVISO NA TELA
       Acumula as trocas de uma mesma ação (colar uma lista inteira
       gera um aviso só) e monta um cartão no canto da tela.
       ------------------------------------------------------------ */
    let pendentes = [];
    let timer = null;
    const jaAvisado = new Set();

    function caixa() {
        let c = document.getElementById('sinonimos-avisos');
        if (c) return c;
        c = document.createElement('div');
        c.id = 'sinonimos-avisos';
        c.setAttribute('role', 'status');
        c.setAttribute('aria-live', 'polite');
        c.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;' +
            'display:flex;flex-direction:column;gap:10px;max-width:min(380px,calc(100vw - 40px));';
        document.body.appendChild(c);
        return c;
    }

    function desenha(trocas) {
        const c = caixa();
        const card = document.createElement('div');
        card.style.cssText =
            'background:var(--surface,#fff);color:var(--text,#1b2a20);' +
            'border:1px solid var(--border,#c8dace);border-left:4px solid var(--green-deep,#2E7D32);' +
            'border-radius:var(--radius-sm,6px);box-shadow:var(--shadow-mid,0 4px 24px rgba(20,64,42,.12));' +
            'padding:12px 14px;font-size:13px;line-height:1.5;opacity:0;transform:translateY(8px);' +
            'transition:opacity .25s ease,transform .25s ease;';

        const titulo = document.createElement('div');
        titulo.style.cssText = 'font-weight:600;margin-bottom:6px;color:var(--green-deep,#2E7D32);';
        titulo.textContent = trocas.length === 1
            ? 'Táxon atualizado'
            : 'Táxons atualizados (' + trocas.length + ')';
        card.appendChild(titulo);

        trocas.forEach(function (t) {
            const li = document.createElement('div');
            li.style.cssText = 'margin-bottom:4px;';
            const de = document.createElement('em');
            de.textContent = t.de;
            de.style.cssText = 'opacity:.7;text-decoration:line-through;';
            const para = document.createElement('strong');
            para.textContent = t.para;
            li.appendChild(de);
            li.appendChild(document.createTextNode(' → '));
            li.appendChild(para);
            card.appendChild(li);

            if (trocas.length === 1 && NOTAS[t.para]) {
                const nota = document.createElement('div');
                nota.style.cssText = 'margin-top:6px;font-size:12px;opacity:.75;';
                nota.textContent = NOTAS[t.para];
                card.appendChild(nota);
            }
        });

        const fechar = document.createElement('button');
        fechar.textContent = '×';
        fechar.setAttribute('aria-label', 'Fechar aviso');
        fechar.style.cssText = 'position:absolute;top:6px;right:10px;background:none;border:none;' +
            'font-size:18px;line-height:1;cursor:pointer;color:inherit;opacity:.5;';
        card.style.position = 'relative';
        fechar.onclick = function () { some(card); };
        card.appendChild(fechar);

        c.appendChild(card);
        requestAnimationFrame(function () { card.style.opacity = '1'; card.style.transform = 'none'; });
        setTimeout(function () { some(card); }, 9000);
    }

    function some(card) {
        if (!card || !card.parentNode) return;
        card.style.opacity = '0';
        card.style.transform = 'translateY(8px)';
        setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 300);
    }

    function avisar(de, para) {
        if (norm(de) === norm(para)) return;
        const chave = norm(de) + '>' + norm(para);
        if (jaAvisado.has(chave)) return;      // não repete na mesma sessão
        jaAvisado.add(chave);
        pendentes.push({ de: de, para: para });
        clearTimeout(timer);
        timer = setTimeout(function () {       // agrupa as trocas da mesma ação
            const lote = pendentes.slice(0, 8);
            const resto = pendentes.length - lote.length;
            pendentes = [];
            if (!document.body) return;
            desenha(lote);
            if (resto > 0) desenha([{ de: '+ ' + resto + ' outros', para: 'ver tabela' }]);
        }, 60);
    }

    /* ------------------------------------------------------------
       4. INSTALAÇÃO
       ------------------------------------------------------------ */
    let instalado = false;

    function instalar() {
        if (instalado) return true;
        if (!window.BIRD_DATABASE || !window.BIRD_DATABASE.length) return false;
        if (typeof window.normalizeForSearch !== 'function') return false;

        const porNome = new Map();
        window.BIRD_DATABASE.forEach(function (b) { porNome.set(norm(b.scientificName), b); });

        // sinônimo digitado -> nome que existe no banco
        const TRADUZ = new Map();
        MAPA.forEach(function (g, chave) {
            for (let i = 0; i < g.todos.length; i++) {
                const alvo = porNome.get(norm(g.todos[i]));
                if (alvo) {
                    if (norm(alvo.scientificName) !== chave) TRADUZ.set(chave, alvo.scientificName);
                    break;
                }
            }
        });

        function nomeDoBanco(e) { return TRADUZ.get(norm(e)) || null; }

        // 4.1 — gargalo de toda busca
        const _normalize = window.normalizeForSearch;
        window.normalizeForSearch = function (str) {
            const alvo = nomeDoBanco(str);
            return _normalize(alvo !== null ? alvo : str);
        };
        try { normalizeForSearch = window.normalizeForSearch; } catch (e) {}

        // 4.2 — getSpeciesInfo não normaliza; trata à parte
        if (typeof window.getSpeciesInfo === 'function') {
            const _info = window.getSpeciesInfo;
            window.getSpeciesInfo = function (nome) {
                const alvo = nomeDoBanco(nome);
                if (alvo !== null) { avisar(nome.trim(), alvo); return _info(alvo); }
                return _info(nome);
            };
            try { getSpeciesInfo = window.getSpeciesInfo; } catch (e) {}
        }

        // 4.3 — pontos onde a ação se conclui: aqui o aviso é disparado
        if (typeof window.findBirdFuzzy === 'function') {
            const _fuzzy = window.findBirdFuzzy;
            window.findBirdFuzzy = function (input) {
                const alvo = nomeDoBanco(input);
                const r = _fuzzy(input);
                if (alvo !== null && r && r.bird && norm(r.bird.scientificName) === norm(alvo)) {
                    avisar(String(input).trim(), alvo);
                    r.corrigido = { de: String(input).trim(), para: alvo };
                }
                return r;
            };
            try { findBirdFuzzy = window.findBirdFuzzy; } catch (e) {}
        }
        if (typeof window.findBirdByNormalizedName === 'function') {
            const _byName = window.findBirdByNormalizedName;
            window.findBirdByNormalizedName = function (input) {
                const alvo = nomeDoBanco(input);
                if (alvo !== null) avisar(String(input).trim(), alvo);
                return _byName(input);
            };
            try { findBirdByNormalizedName = window.findBirdByNormalizedName; } catch (e) {}
        }

        // 4.4 — autocomplete com nome antigo parcial ("Bubulcus i")
        if (typeof window.fuzzySearchCandidates === 'function') {
            const _cands = window.fuzzySearchCandidates;
            window.fuzzySearchCandidates = function (normVal, limit) {
                const base = _cands(normVal, limit) || [];
                if (!normVal || normVal.length < 3) return base;
                const vistos = new Set(base.map(function (m) { return m.scientific; }));
                const extras = [];
                TRADUZ.forEach(function (nomeBanco, chave) {
                    if (chave.indexOf(normVal) !== 0) return;
                    if (vistos.has(nomeBanco)) return;
                    const b = porNome.get(norm(nomeBanco));
                    if (!b) return;
                    vistos.add(nomeBanco);
                    extras.push({
                        text: chave + ' → ' + b.scientificName + ' – ' + b.commonName,
                        normalized: chave, scientific: b.scientificName, common: b.commonName,
                        nc: norm(b.commonName), ns: norm(b.scientificName),
                        data: b, sinonimo: true
                    });
                });
                return extras.length ? base.concat(extras).slice(0, limit || 10) : base;
            };
            try { fuzzySearchCandidates = window.fuzzySearchCandidates; } catch (e) {}
        }

        window.SinonimosAves = {
            grupos: GRUPOS,
            notas: NOTAS,
            nomeAceito: nomeAceito,
            equivalentes: equivalentes,
            nomeDoBanco: nomeDoBanco,
            ehSinonimo: function (n) { return nomeDoBanco(n) !== null; },
            avisar: avisar
        };

        instalado = true;
        return true;
    }

    if (!instalar()) {
        document.addEventListener('DOMContentLoaded', instalar);
        window.addEventListener('load', instalar);
        let tentativas = 0;
        const t = setInterval(function () {
            if (instalar() || ++tentativas > 40) clearInterval(t);
        }, 100);
    }
})();
