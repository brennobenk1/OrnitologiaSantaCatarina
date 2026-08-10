/* ============================================================
   SINÔNIMOS TAXONÔMICOS — Ornitologia Avançada de Santa Catarina
   ------------------------------------------------------------
   Permite que o usuário digite um nome científico antigo
   (ex.: "Bubulcus ibis") e o site resolva para o nome atualmente
   aceito (ex.: "Ardea ibis"), e vice-versa.

   INSTALAÇÃO: carregue DEPOIS do main.js
       <script src="main.js"></script>
       <script src="sinonimos.js"></script>

   O módulo se instala sozinho: envolve as funções de busca já
   existentes (findBirdFuzzy, findBirdByNormalizedName,
   fuzzySearchCandidates) sem alterá-las.
   ============================================================ */
(function () {
    'use strict';

    /* ------------------------------------------------------------
       1. DICIONÁRIO
       Cada grupo: aceito = nome atualmente válido (IOC/Clements/SACC)
                   sin    = nomes antigos ainda encontrados na literatura
       Só inclui espécies presentes na lista de Santa Catarina.
       ------------------------------------------------------------ */
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

    /* ------------------------------------------------------------
       2. ÍNDICE
       ------------------------------------------------------------ */
    function norm(s) {
        if (!s) return '';
        return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .toLowerCase().replace(/[-\s]+/g, ' ').trim();
    }

    // mapa: qualquer nome normalizado -> { aceito, todos: [...] }
    const MAPA = new Map();
    GRUPOS.forEach(g => {
        const todos = [g.aceito, ...g.sin];
        todos.forEach(n => MAPA.set(norm(n), { aceito: g.aceito, todos: todos }));
    });

    /* ------------------------------------------------------------
       3. RESOLUÇÃO
       Devolve todos os nomes equivalentes ao que foi digitado,
       para que a busca tente cada um contra o BIRD_DATABASE.
       ------------------------------------------------------------ */
    function equivalentes(entrada) {
        const g = MAPA.get(norm(entrada));
        return g ? g.todos : [entrada];
    }

    function nomeAceito(entrada) {
        const g = MAPA.get(norm(entrada));
        return g ? g.aceito : entrada;
    }

    /* ------------------------------------------------------------
       4. INSTALAÇÃO — envolve as funções de busca existentes
       ------------------------------------------------------------ */
    function instalar() {
        if (!window.findBirdFuzzy || !window.BIRD_DATABASE) return false;

        // 4.1 — busca principal: tenta cada nome equivalente
        const _findBirdFuzzy = window.findBirdFuzzy;
        window.findBirdFuzzy = function (input) {
            const direto = _findBirdFuzzy(input);
            if (direto && direto.confident) return direto;

            for (const alt of equivalentes(input)) {
                if (norm(alt) === norm(input)) continue;
                const r = _findBirdFuzzy(alt);
                if (r && r.confident) {
                    r.viaSinonimo = true;
                    r.nomeDigitado = input;
                    r.nomeAceito = nomeAceito(input);
                    return r;
                }
            }
            return direto;
        };

        // 4.2 — a função usada pelo processamento de listas
        window.findBirdByNormalizedName = function (input) {
            const r = window.findBirdFuzzy(input);
            return r ? r.bird : null;
        };
        if (typeof findBirdByNormalizedName !== 'undefined') {
            try { findBirdByNormalizedName = window.findBirdByNormalizedName; } catch (e) {}
        }

        // 4.3 — autocomplete: sugere o nome aceito quando se digita o antigo
        if (window.fuzzySearchCandidates) {
            const _cands = window.fuzzySearchCandidates;
            window.fuzzySearchCandidates = function (normVal, limit) {
                const base = _cands(normVal, limit) || [];
                if (!normVal || normVal.length < 3) return base;

                const extras = [];
                MAPA.forEach((g, chave) => {
                    if (!chave.includes(normVal)) return;
                    if (norm(g.aceito) === chave) return;      // já é o aceito
                    const alvo = window.BIRD_DATABASE.find(b =>
                        g.todos.some(n => norm(n) === norm(b.scientificName)));
                    if (!alvo) return;
                    if (base.some(m => m.scientific === alvo.scientificName)) return;
                    extras.push({
                        text: `<em>${chave}</em> → <strong>${g.aceito}</strong> – ${alvo.commonName}`,
                        normalized: chave,
                        scientific: alvo.scientificName,
                        common: alvo.commonName,
                        nc: norm(alvo.commonName),
                        ns: norm(alvo.scientificName),
                        data: alvo,
                        sinonimo: true
                    });
                });
                return base.concat(extras).slice(0, limit || 10);
            };
        }

        // 4.4 — API pública
        window.SinonimosAves = {
            grupos: GRUPOS,
            equivalentes: equivalentes,
            nomeAceito: nomeAceito,
            ehSinonimo: function (n) {
                const g = MAPA.get(norm(n));
                return !!g && norm(g.aceito) !== norm(n);
            }
        };
        return true;
    }

    if (!instalar()) {
        // main.js ainda não terminou de carregar
        document.addEventListener('DOMContentLoaded', instalar);
        window.addEventListener('load', instalar);
    }
})();
