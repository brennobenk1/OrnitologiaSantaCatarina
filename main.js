/* ============================================================
   ANALYTICS / HEAD INIT
   ============================================================ */
    (async function(){
      var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwUpawmV_X1Bn8VgF30gP2GMjlSE7gH-CdFT-wwxtdbJblW4IoyNs6uTaIM2KY-9iEb/exec";
      if (!SCRIPT_URL || SCRIPT_URL === "COLE_A_URL_AQUI") return; // segurança: só sai se não configurado
      var ua = navigator.userAgent;
      var getOS = function(u){ return /Windows/.test(u)?"Windows":/iPhone|iPad/.test(u)?"iOS":/Mac/.test(u)?"macOS":/Android/.test(u)?"Android":/Linux/.test(u)?"Linux":"Outro"; };
      var getBr = function(u){ return /Edg/.test(u)?"Edge":/OPR|Opera/.test(u)?"Opera":/Chrome/.test(u)?"Chrome":/Firefox/.test(u)?"Firefox":/Safari/.test(u)?"Safari":"Outro"; };
      var getDv = function(u){ return /Mobi|Android|iPhone|iPad/.test(u)?"Mobile":"Desktop"; };
      var cidade = "", pais = "";
      try {
        var g = await fetch("https://ip-api.com/json/?fields=city,country&lang=pt-BR");
        var j = await g.json();
        cidade = j.city || ""; pais = j.country || "";
      } catch(e) {}
      var dados = {
        timestamp:   new Date().toISOString(),
        os:          getOS(ua),
        browser:     getBr(ua),
        dispositivo: getDv(ua),
        tela:        screen.width + "x" + screen.height,
        idioma:      navigator.language || "",
        cidade:      cidade,
        pais:        pais
      };
      try {
        await fetch(SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(dados)
        });
      } catch(e) {}
    })();


/* ============================================================
   MAIN APPLICATION SCRIPT
   ============================================================ */
        // ==================== BANCO DE DADOS ORNITOLÓGICO COMPLETO ====================
        // A partir da hierarquia fornecida, construímos um mapa de espécies para seus dados taxonômicos.
        // Para simplificar, usaremos o conservationData como base e adicionaremos subfamília quando disponível.
        // Vamos construir um dicionário speciesInfo com chave = nome científico, valor = {ordem, familia, subfamilia, nomePopular}
        
        const speciesInfo = {};
        
        // Função para normalizar nome (remover hífens, acentos etc.) para busca
        function normalizeString(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[-\s]+/g, ' ');
}

// Função auxiliar para encontrar espécie por nome normalizado (delega ao motor principal)
function findBirdByNormalizedName(input) {
    const norm = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[-\s]+/g, ' ').trim();
    const exact = BIRD_DATABASE.find(b => {
        const ns = b.scientificName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[-\s]+/g,' ').trim();
        const nc = b.commonName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[-\s]+/g,' ').trim();
        return ns === norm || nc === norm;
    });
    if (exact) return exact;
    // Fallback: substring no nome popular ou científico
    return BIRD_DATABASE.find(b => {
        const ns = b.scientificName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[-\s]+/g,' ').trim();
        const nc = b.commonName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[-\s]+/g,' ').trim();
        return nc.includes(norm) || ns.includes(norm);
    }) || null;
}
        
        // Dados de conservação já existentes (vamos reutilizar)
        const conservationData = [
            { especie: "Rhea americana", nomePopular: "ema", sc: "EW", icmbio: "LC", iucn: "NT" },
            { especie: "Tinamus solitarius", nomePopular: "macuco", sc: "VU", icmbio: "LC", iucn: "NT" },
            { especie: "Crypturellus obsoletus", nomePopular: "inhambuguaçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Crypturellus noctivagus", nomePopular: "jaó-do-sul", sc: "EN", icmbio: "LC", iucn: "NT" },
            { especie: "Crypturellus parvirostris", nomePopular: "inhambu-chororó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Crypturellus tataupa", nomePopular: "inhambu-chintã", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Rhynchotus rufescens", nomePopular: "perdiz", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nothura maculosa", nomePopular: "codorna-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anhima cornuta", nomePopular: "anhuma", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chauna torquata", nomePopular: "tachã", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dendrocygna bicolor", nomePopular: "marreca-caneleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dendrocygna viduata", nomePopular: "irerê", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dendrocygna autumnalis", nomePopular: "marreca-cabocla", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Coscoroba coscoroba", nomePopular: "capororoca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cairina moschata", nomePopular: "pato-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sarkidiornis sylvicola", nomePopular: "pato-de-crista", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Callonetta leucophrys", nomePopular: "marreca-de-coleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Amazonetta brasiliensis", nomePopular: "marreca-ananaí", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spatula versicolor", nomePopular: "marreca-cricri", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spatula platalea", nomePopular: "marreca-colhereira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spatula discors", nomePopular: "marreca-de-asa-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spatula cyanoptera", nomePopular: "marreca-colorada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mareca sibilatrix", nomePopular: "marreca-oveira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anas bahamensis", nomePopular: "marreca-toicinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anas acuta", nomePopular: "arrabio", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Anas georgica", nomePopular: "marreca-parda", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anas flavirostris", nomePopular: "marreca-pardinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Netta erythrophthalma", nomePopular: "paturi-preta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Netta peposaca", nomePopular: "marrecão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heteronetta atricapilla", nomePopular: "marreca-de-cabeça-preta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nomonyx dominicus", nomePopular: "marreca-caucau", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Oxyura vittata", nomePopular: "marreca-rabo-de-espinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Penelope superciliaris", nomePopular: "jacupemba", sc: "VU", icmbio: "LC", iucn: "NT" },
            { especie: "Penelope obscura", nomePopular: "jacuguaçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aburria jacutinga", nomePopular: "jacutinga", sc: "CR", icmbio: "EN", iucn: "EN" },
            { especie: "Ortalis squamata", nomePopular: "aracuã-escamoso", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Odontophorus capueira", nomePopular: "uru", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phoenicoparrus andinus", nomePopular: "flamingo-dos-andes", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Rollandia rolland", nomePopular: "mergulhão-de-orelha-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tachybaptus dominicus", nomePopular: "mergulhão-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Podilymbus podiceps", nomePopular: "mergulhão-caçador", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Podicephorus major", nomePopular: "mergulhão-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Columba livia", nomePopular: "pombo-doméstico", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Patagioenas picazuro", nomePopular: "pomba-asa-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Patagioenas cayennensis", nomePopular: "pomba-galega", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Patagioenas plumbea", nomePopular: "pomba-amargosa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Geotrygon montana", nomePopular: "pariri", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leptotila verreauxi", nomePopular: "juriti-pupu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leptotila rufaxilla", nomePopular: "juriti-de-testa-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Zenaida auriculata", nomePopular: "avoante", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Claravis pretiosa", nomePopular: "pararu-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Columbina talpacoti", nomePopular: "rolinha-roxa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Columbina squammata", nomePopular: "rolinha-fogo-apagou", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Columbina picui", nomePopular: "rolinha-picuí", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Guira guira", nomePopular: "anu-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Crotophaga major", nomePopular: "anu-coroca", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Crotophaga ani", nomePopular: "anu-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tapera naevia", nomePopular: "saci", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dromococcyx phasianellus", nomePopular: "peixe-frito", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dromococcyx pavoninus", nomePopular: "peixe-frito-pavonino", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Micrococcyx cinereus", nomePopular: "papa-lagarta-cinzento", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Piaya cayana", nomePopular: "alma-de-gato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Coccyzus melacoryphus", nomePopular: "papa-lagarta-acanelado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Coccyzus americanus", nomePopular: "papa-lagarta-de-asa-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Coccyzus euleri", nomePopular: "papa-lagarta-de-euler", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Coccyzus erythropthalmus", nomePopular: "papa-lagarta-de-bico-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nyctibius griseus", nomePopular: "urutau", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Antrostomus rufus", nomePopular: "joão-corta-pau", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Antrostomus sericocaudatus", nomePopular: "bacurau-rabo-de-seda", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lurocalis semitorquatus", nomePopular: "tuju", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nyctidromus albicollis", nomePopular: "bacurau", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hydropsalis parvula", nomePopular: "bacurau-chintã", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hydropsalis anomala", nomePopular: "curiango-do-banhado", sc: "EN", icmbio: "LC", iucn: "NT" },
            { especie: "Hydropsalis longirostris", nomePopular: "bacurau-da-telha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hydropsalis torquata", nomePopular: "bacurau-tesoura", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hydropsalis forcipata", nomePopular: "bacurau-tesourão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Podager nacunda", nomePopular: "corucão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chordeiles minor", nomePopular: "bacurau-norte-americano", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cypseloides fumigatus", nomePopular: "taperuçu-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cypseloides senex", nomePopular: "taperuçu-velho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Streptoprocne zonaris", nomePopular: "taperuçu-de-coleira-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Streptoprocne biscutata", nomePopular: "taperuçu-de-coleira-falha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chaetura cinereiventris", nomePopular: "andorinhão-de-sobre-cinzento", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chaetura meridionalis", nomePopular: "andorinhão-do-temporal", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Panyptila cayennensis", nomePopular: "andorinhão-estofador", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Florisuga fusca", nomePopular: "beija-flor-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphodon naevius", nomePopular: "beija-flor-rajado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phaethornis squalidus", nomePopular: "rabo-branco-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phaethornis pretrei", nomePopular: "rabo-branco-acanelado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phaethornis eurynome", nomePopular: "rabo-branco-de-garganta-rajada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Colibri serrirostris", nomePopular: "beija-flor-de-orelha-violeta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anthracothorax nigricollis", nomePopular: "beija-flor-de-veste-preta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lophornis magnificus", nomePopular: "topetinho-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lophornis chalybeus", nomePopular: "topetinho-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heliodoxa rubricauda", nomePopular: "beija-flor-rubi", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heliomaster furcifer", nomePopular: "bico-reto-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Calliphlox amethystina", nomePopular: "estrelinha-ametista", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chlorostilbon lucidus", nomePopular: "besourinho-de-bico-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stephanoxis loddigesii", nomePopular: "beija-flor-de-topete-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thalurania glaucopis", nomePopular: "beija-flor-de-fronte-violeta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Eupetomena macroura", nomePopular: "beija-flor-tesoura", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aphantochroa cirrochloris", nomePopular: "beija-flor-cinza", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chrysuronia versicolor", nomePopular: "beija-flor-de-banda-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leucochloris albicollis", nomePopular: "beija-flor-de-papo-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chionomesa fimbriata", nomePopular: "beija-flor-de-garganta-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chionomesa lactea", nomePopular: "beija-flor-de-peito-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hylocharis chrysura", nomePopular: "beija-flor-dourado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aramus guarauna", nomePopular: "carão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Rallus longirostris", nomePopular: "saracura-matraca", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Porphyrio martinica", nomePopular: "frango-d'água-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Porphyrio flavirostris", nomePopular: "frango-d'água-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Laterallus flaviventer", nomePopular: "sanã-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Laterallus melanophaius", nomePopular: "sanã-parda", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Laterallus exilis", nomePopular: "sanã-do-capim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Laterallus spilopterus", nomePopular: "sanã-cinza", sc: "LC", icmbio: "EN", iucn: "NT" },
            { especie: "Laterallus leucopyrrhus", nomePopular: "sanã-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mustelirallus albicollis", nomePopular: "sanã-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Neocrex erythrops", nomePopular: "turu-turu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pardirallus maculatus", nomePopular: "saracura-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pardirallus nigricans", nomePopular: "saracura-sanã", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pardirallus sanguinolentus", nomePopular: "saracura-do-banhado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Amaurolimnas concolor", nomePopular: "saracura-lisa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aramides ypecaha", nomePopular: "saracuruçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aramides cajaneus", nomePopular: "saracura-três-potes", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aramides saracura", nomePopular: "saracura-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Porphyriops melanops", nomePopular: "galinha-d'água-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Gallinula galeata", nomePopular: "galinha-d'água", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fulica rufifrons", nomePopular: "carqueja-de-escudo-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fulica armillata", nomePopular: "carqueja-de-bico-manchado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fulica leucoptera", nomePopular: "carqueja-de-bico-amarelo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heliornis fulica", nomePopular: "picaparra", sc: "CR", icmbio: "LC", iucn: "LC" },
            { especie: "Pluvialis dominica", nomePopular: "batuiruçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pluvialis squatarola", nomePopular: "batuiruçu-de-axila-preta", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Oreopholus ruficollis", nomePopular: "batuíra-de-papo-ferrugíneo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Vanellus chilensis", nomePopular: "quero-quero", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Charadrius modestus", nomePopular: "batuíra-de-peito-tijolo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Charadrius semipalmatus", nomePopular: "batuíra-de-bando", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Charadrius collaris", nomePopular: "batuíra-de-coleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Charadrius falklandicus", nomePopular: "batuíra-de-coleira-dupla", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Haematopus palliatus", nomePopular: "piru-piru", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Himantopus melanurus", nomePopular: "pernilongo-de-costas-brancas", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chionis albus", nomePopular: "pomba-antártica", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Bartramia longicauda", nomePopular: "maçarico-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Numenius hudsonicus", nomePopular: "maçarico-de-bico-torto", sc: "LC", icmbio: "VU", iucn: "LC" },
            { especie: "Limosa haemastica", nomePopular: "maçarico-de-bico-virado", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Arenaria interpres", nomePopular: "vira-pedras", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Calidris canutus", nomePopular: "maçarico-de-papo-vermelho", sc: "LC", icmbio: "VU", iucn: "NT" },
            { especie: "Calidris himantopus", nomePopular: "maçarico-pernilongo", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Calidris alba", nomePopular: "maçarico-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Calidris bairdii", nomePopular: "maçarico-de-bico-fino", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Calidris minutilla", nomePopular: "maçariquinho", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Calidris fuscicollis", nomePopular: "maçarico-de-sobre-branco", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Calidris subruficollis", nomePopular: "maçarico-acanelado", sc: "LC", icmbio: "VU", iucn: "VU" },
            { especie: "Calidris melanotos", nomePopular: "maçarico-de-colete", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Calidris pusilla", nomePopular: "maçarico-rasteirinho", sc: "LC", icmbio: "EN", iucn: "NT" },
            { especie: "Limnodromus griseus", nomePopular: "maçarico-de-costas-brancas", sc: "LC", icmbio: "EN", iucn: "VU" },
            { especie: "Gallinago undulata", nomePopular: "narcejão", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Gallinago paraguaiae", nomePopular: "narceja", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phalaropus tricolor", nomePopular: "pisa-n'água", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phalaropus fulicarius", nomePopular: "pisa-n'água-de-bico-grosso", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Actitis macularius", nomePopular: "maçarico-pintado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tringa solitaria", nomePopular: "maçarico-solitário", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tringa melanoleuca", nomePopular: "maçarico-grande-de-perna-amarela", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Tringa inornata", nomePopular: "maçarico-grande-de-asa-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tringa semipalmata", nomePopular: "maçarico-de-asa-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tringa flavipes", nomePopular: "maçarico-de-perna-amarela", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Thinocorus rumicivorus", nomePopular: "agachadeira-mirim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Jacana jacana", nomePopular: "jaçanã", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nycticryphes semicollaris", nomePopular: "narceja-de-bico-torto", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Stercorarius chilensis", nomePopular: "mandrião-chileno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stercorarius maccormicki", nomePopular: "mandrião-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stercorarius antarcticus", nomePopular: "mandrião-antártico", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stercorarius pomarinus", nomePopular: "mandrião-pomarino", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stercorarius parasiticus", nomePopular: "mandrião-parasítico", sc: "LC", icmbio: "LC", iucn: "EN" },
            { especie: "Stercorarius longicaudus", nomePopular: "mandrião-de-cauda-comprida", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chroicocephalus maculipennis", nomePopular: "gaivota-maria-velha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chroicocephalus cirrocephalus", nomePopular: "gaivota-de-cabeça-cinza", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leucophaeus modestus", nomePopular: "gaivota-cinzenta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leucophaeus atricilla", nomePopular: "gaivota-alegre", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leucophaeus pipixcan", nomePopular: "gaivota-de-franklin", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Larus atlanticus", nomePopular: "gaivota-de-rabo-preto", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Larus dominicanus", nomePopular: "gaivotão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anous stolidus", nomePopular: "trinta-réis-escuro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Rynchops niger", nomePopular: "talha-mar", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sternula antillarum", nomePopular: "trinta-réis-miúdo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sternula superciliaris", nomePopular: "trinta-réis-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phaetusa simplex", nomePopular: "trinta-réis-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sterna hirundo", nomePopular: "trinta-réis-boreal", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sterna hirundinacea", nomePopular: "trinta-réis-de-bico-vermelho", sc: "LC", icmbio: "VU", iucn: "LC" },
            { especie: "Sterna trudeaui", nomePopular: "trinta-réis-de-coroa-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thalasseus acuflavidus", nomePopular: "trinta-réis-de-bando", sc: "LC", icmbio: "VU", iucn: "LC" },
            { especie: "Thalasseus maximus", nomePopular: "trinta-réis-real", sc: "VU", icmbio: "EN", iucn: "LC" },
            { especie: "Spheniscus magellanicus", nomePopular: "pinguim-de-magalhães", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Diomedea exulans", nomePopular: "albatroz-errante", sc: "VU", icmbio: "CR", iucn: "VU" },
            { especie: "Diomedea dabbenena", nomePopular: "albatroz-de-tristão", sc: "CR", icmbio: "CR", iucn: "CR" },
            { especie: "Thalassarche chlororhynchos", nomePopular: "albatroz-de-nariz-amarelo", sc: "EN", icmbio: "EN", iucn: "EN" },
            { especie: "Thalassarche melanophris", nomePopular: "albatroz-de-sobrancelha", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Thalassarche chrysostoma", nomePopular: "albatroz-de-cabeça-cinza", sc: "VU", icmbio: "LC", iucn: "EN" },
            { especie: "Oceanites oceanicus", nomePopular: "alma-de-mestre", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Macronectes giganteus", nomePopular: "petrel-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Macronectes halli", nomePopular: "petrel-grande-do-norte", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fulmarus glacialoides", nomePopular: "pardelão-prateado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Daption capense", nomePopular: "pomba-do-cabo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pterodroma mollis", nomePopular: "grazina-delicada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pterodroma incerta", nomePopular: "grazina-de-barriga-branca", sc: "EN", icmbio: "EN", iucn: "EN" },
            { especie: "Procellaria aequinoctialis", nomePopular: "pardela-preta", sc: "VU", icmbio: "VU", iucn: "VU" },
            { especie: "Procellaria conspicillata", nomePopular: "pardela-de-óculos", sc: "VU", icmbio: "VU", iucn: "VU" },
            { especie: "Calonectris borealis", nomePopular: "cagarra-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ardenna grisea", nomePopular: "pardela-escura", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Ardenna gravis", nomePopular: "pardela-de-barrete", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Puffinus puffinus", nomePopular: "pardela-sombria", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ciconia maguari", nomePopular: "maguari", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Jabiru mycteria", nomePopular: "tuiuiú", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mycteria americana", nomePopular: "cabeça-seca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fregata magnificens", nomePopular: "fragata", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Morus serrator", nomePopular: "atobá-australiano", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sula leucogaster", nomePopular: "atobá-pardo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anhinga anhinga", nomePopular: "biguatinga", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nannopterum brasilianum", nomePopular: "biguá", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tigrisoma lineatum", nomePopular: "socó-boi", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tigrisoma fasciatum", nomePopular: "socó-jararaca", sc: "CR", icmbio: "VU", iucn: "LC" },
            { especie: "Cochlearius cochlearius", nomePopular: "arapapá", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Botaurus pinnatus", nomePopular: "socó-boi-baio", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ixobrychus exilis", nomePopular: "socoí-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ixobrychus involucris", nomePopular: "socoí-amarelo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nycticorax nycticorax", nomePopular: "socó-dorminhoco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nyctanassa violacea", nomePopular: "savacu-de-coroa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Butorides striata", nomePopular: "socozinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Bubulcus ibis", nomePopular: "garça-vaqueira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ardea cocoi", nomePopular: "garça-moura", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ardea alba", nomePopular: "garça-branca-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Syrigma sibilatrix", nomePopular: "maria-faceira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pilherodius pileatus", nomePopular: "garça-real", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Egretta thula", nomePopular: "garça-branca-pequena", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Egretta caerulea", nomePopular: "garça-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Eudocimus ruber", nomePopular: "guará", sc: "CR", icmbio: "LC", iucn: "LC" },
            { especie: "Plegadis chihi", nomePopular: "caraúna", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mesembrinibis cayennensis", nomePopular: "coró-coró", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phimosus infuscatus", nomePopular: "tapicuru", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Theristicus caerulescens", nomePopular: "curicaca-real", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Theristicus caudatus", nomePopular: "curicaca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Platalea ajaja", nomePopular: "colhereiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sarcoramphus papa", nomePopular: "urubu-rei", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Coragyps atratus", nomePopular: "urubu-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cathartes aura", nomePopular: "urubu-de-cabeça-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cathartes burrovianus", nomePopular: "urubu-de-cabeça-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pandion haliaetus", nomePopular: "águia-pescadora", sc: "LC", icmbio: "LC", iucn: "EN" },
            { especie: "Elanus leucurus", nomePopular: "gavião-peneira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chondrohierax uncinatus", nomePopular: "gavião-caracoleiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leptodon cayanensis", nomePopular: "gavião-gato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elanoides forficatus", nomePopular: "gavião-tesoura", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spizaetus tyrannus", nomePopular: "gavião-pega-macaco", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Spizaetus melanoleucus", nomePopular: "gavião-pato", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Spizaetus ornatus", nomePopular: "gavião-de-penacho", sc: "CR", icmbio: "LC", iucn: "NT" },
            { especie: "Rostrhamus sociabilis", nomePopular: "gavião-caramujeiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Harpagus diodon", nomePopular: "gavião-bombachinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ictinia plumbea", nomePopular: "sovi", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Circus cinereus", nomePopular: "gavião-cinza", sc: "LC", icmbio: "VU", iucn: "LC" },
            { especie: "Circus buffoni", nomePopular: "gavião-do-banhado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hieraspiza superciliosa", nomePopular: "tauató-passarinho", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Accipiter poliogaster", nomePopular: "tauató-pintado", sc: "CR", icmbio: "LC", iucn: "NT" },
            { especie: "Accipiter striatus", nomePopular: "tauató-miúdo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Accipiter bicolor", nomePopular: "gavião-bombachinha-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Geranospiza caerulescens", nomePopular: "gavião-pernilongo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heterospizias meridionalis", nomePopular: "gavião-caboclo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Amadonastur lacernulatus", nomePopular: "gavião-pombo-pequeno", sc: "VU", icmbio: "VU", iucn: "VU" },
            { especie: "Urubitinga urubitinga", nomePopular: "gavião-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Urubitinga coronata", nomePopular: "águia-cinzenta", sc: "CR", icmbio: "EN", iucn: "EN" },
            { especie: "Rupornis magnirostris", nomePopular: "gavião-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Parabuteo unicinctus", nomePopular: "gavião-asa-de-telha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Parabuteo leucorrhous", nomePopular: "gavião-de-sobre-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Geranoaetus albicaudatus", nomePopular: "gavião-de-rabo-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Geranoaetus melanoleucus", nomePopular: "águia-serrana", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Pseudastur polionotus", nomePopular: "gavião-pombo-grande", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Buteo platypterus", nomePopular: "gavião-de-asa-larga", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Buteo brachyurus", nomePopular: "gavião-de-cauda-curta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Buteo swainsoni", nomePopular: "gavião-papa-gafanhoto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Buteo albonotatus", nomePopular: "gavião-urubu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tyto furcata", nomePopular: "suindara", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Megascops choliba", nomePopular: "corujinha-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Megascops sanctaecatarinae", nomePopular: "corujinha-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Megascops atricapilla", nomePopular: "corujinha-sapo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pulsatrix koeniswaldiana", nomePopular: "murucututu-de-barriga-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Bubo virginianus", nomePopular: "jacurutu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Strix hylophila", nomePopular: "coruja-listrada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Strix virgata", nomePopular: "coruja-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Strix huhula", nomePopular: "coruja-preta", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Glaucidium minutissimum", nomePopular: "caburé-miudinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Glaucidium brasilianum", nomePopular: "caburé", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Athene cunicularia", nomePopular: "coruja-buraqueira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aegolius harrisii", nomePopular: "caburé-acanelado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Asio clamator", nomePopular: "coruja-orelhuda", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Asio stygius", nomePopular: "mocho-diabo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Asio flammeus", nomePopular: "mocho-dos-banhados", sc: "VU", icmbio: "LC", iucn: "NT" },
            { especie: "Trogon viridis", nomePopular: "surucuá-de-barriga-amarela", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Trogon surrucura", nomePopular: "surucuá-variado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Trogon chrysochloros", nomePopular: "surucuá-dourado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Baryphthengus ruficapillus", nomePopular: "juruva", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Megaceryle torquata", nomePopular: "martim-pescador-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chloroceryle amazona", nomePopular: "martim-pescador-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chloroceryle aenea", nomePopular: "martim-pescador-miúdo", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Chloroceryle americana", nomePopular: "martim-pescador-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chloroceryle inda", nomePopular: "martim-pescador-da-mata", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Nonnula rubecula", nomePopular: "macuru", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Malacoptila striata", nomePopular: "barbudo-rajado", sc: "LC", icmbio: "VU", iucn: "LC" },
            { especie: "Notharchus swainsoni", nomePopular: "macuru-de-barriga-castanha", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Nystalus chacuru", nomePopular: "joão-bobo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphastos toco", nomePopular: "tucanuçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphastos vitellinus", nomePopular: "tucano-de-bico-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphastos dicolorus", nomePopular: "tucano-de-bico-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Selenidera maculirostris", nomePopular: "araçari-poca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pteroglossus bailloni", nomePopular: "araçari-banana", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Pteroglossus castanotis", nomePopular: "araçari-castanho", sc: "CR", icmbio: "LC", iucn: "LC" },
            { especie: "Picumnus temminckii", nomePopular: "picapauzinho-de-coleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Picumnus nebulosus", nomePopular: "picapauzinho-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Melanerpes candidus", nomePopular: "pica-pau-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Melanerpes flavifrons", nomePopular: "benedito-de-testa-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Veniliornis spilogaster", nomePopular: "pica-pau-verde-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Campephilus robustus", nomePopular: "pica-pau-rei", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dryocopus lineatus", nomePopular: "pica-pau-de-banda-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Celeus galeatus", nomePopular: "pica-pau-de-cara-canela", sc: "VU", icmbio: "EN", iucn: "VU" },
            { especie: "Celeus flavescens", nomePopular: "pica-pau-de-cabeça-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Piculus flavigula", nomePopular: "pica-pau-bufador", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Piculus aurulentus", nomePopular: "pica-pau-dourado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Colaptes melanochloros", nomePopular: "pica-pau-verde-barrado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Colaptes campestris", nomePopular: "pica-pau-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cariama cristata", nomePopular: "seriema", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Herpetotheres cachinnans", nomePopular: "acauã", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Micrastur ruficollis", nomePopular: "falcão-caburé", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Micrastur semitorquatus", nomePopular: "falcão-relógio", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Caracara plancus", nomePopular: "carcará", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Milvago chimachima", nomePopular: "carrapateiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Milvago chimango", nomePopular: "chimango", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Falco sparverius", nomePopular: "quiriquiri", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Falco rufigularis", nomePopular: "cauré", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Falco femoralis", nomePopular: "falcão-de-coleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Falco peregrinus", nomePopular: "falcão-peregrino", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Touit melanonotus", nomePopular: "apuim-de-costas-pretas", sc: "CR", icmbio: "VU", iucn: "NT" },
            { especie: "Myiopsitta monachus", nomePopular: "caturrita", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Brotogeris tirica", nomePopular: "periquito-rico", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Brotogeris chiriri", nomePopular: "periquito-de-encontro-amarelo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pionopsitta pileata", nomePopular: "cuiú-cuiú", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Triclaria malachitacea", nomePopular: "sabiá-cica", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Pionus maximiliani", nomePopular: "maitaca-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Amazona vinacea", nomePopular: "papagaio-de-peito-roxo", sc: "EN", icmbio: "VU", iucn: "EN" },
            { especie: "Amazona pretrei", nomePopular: "papagaio-charão", sc: "EN", icmbio: "VU", iucn: "VU" },
            { especie: "Amazona aestiva", nomePopular: "papagaio-verdadeiro", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Forpus xanthopterygius", nomePopular: "tuim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pyrrhura frontalis", nomePopular: "tiriba-de-testa-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Primolius maracana", nomePopular: "maracanã", sc: "CR", icmbio: "LC", iucn: "LC" },
            { especie: "Psittacara leucophthalmus", nomePopular: "periquitão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Terenura maculata", nomePopular: "zidedê", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myrmotherula unicolor", nomePopular: "choquinha-cinzenta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Formicivora acutirostris", nomePopular: "bicudinho-do-brejo", sc: "CR", icmbio: "VU", iucn: "NT" },
            { especie: "Rhopias gularis", nomePopular: "choquinha-de-garganta-pintada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dysithamnus stictothorax", nomePopular: "choquinha-de-peito-pintado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dysithamnus mentalis", nomePopular: "choquinha-lisa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dysithamnus xanthopterus", nomePopular: "choquinha-de-asa-ferrugem", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Herpsilochmus rufimarginatus", nomePopular: "chorozinho-de-asa-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thamnophilus doliatus", nomePopular: "choca-barrada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thamnophilus ruficapillus", nomePopular: "choca-de-chapéu-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thamnophilus caerulescens", nomePopular: "choca-da-mata", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hypoedaleus guttatus", nomePopular: "chocão-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Batara cinerea", nomePopular: "matracão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mackenziaena leachii", nomePopular: "borralhara-assobiadora", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mackenziaena severa", nomePopular: "borralhara", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Biatas nigropectus", nomePopular: "papo-branco", sc: "VU", icmbio: "LC", iucn: "VU" },
            { especie: "Myrmoderus squamosus", nomePopular: "papa-formiga-de-grota", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pyriglena leucoptera", nomePopular: "papa-taoca-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Drymophila ferruginea", nomePopular: "dituí", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Drymophila rubricollis", nomePopular: "choquinha-dublê", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Drymophila ochropyga", nomePopular: "choquinha-de-dorso-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Drymophila malura", nomePopular: "choquinha-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Drymophila squamata", nomePopular: "pintadinho", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Conopophaga melanops", nomePopular: "cuspidor-de-máscara-preta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Conopophaga lineata", nomePopular: "chupa-dente", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Grallaria varia", nomePopular: "tovacuçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cryptopezus nattereri", nomePopular: "pinto-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Psilorhamphus guttatus", nomePopular: "tapaculo-pintado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Merulaxis ater", nomePopular: "entufado", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Eleoscytalopus indigoticus", nomePopular: "macuquinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Scytalopus iraiensis", nomePopular: "tapaculo-da-várzea", sc: "EN", icmbio: "EN", iucn: "VU" },
            { especie: "Scytalopus pachecoi", nomePopular: "tapaculo-ferreirinho", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Scytalopus speluncae", nomePopular: "tapaculo-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Formicarius colma", nomePopular: "galinha-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chamaeza campanisona", nomePopular: "tovaca-campainha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chamaeza ruficauda", nomePopular: "tovaca-de-rabo-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sclerurus scansor", nomePopular: "vira-folha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Geositta cunicularia", nomePopular: "curriqueiro", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Sittasomus griseicapillus", nomePopular: "arapaçu-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dendrocincla turdina", nomePopular: "arapaçu-liso", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dendrocolaptes platyrostris", nomePopular: "arapaçu-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xiphocolaptes albicollis", nomePopular: "arapaçu-de-garganta-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xiphorhynchus fuscus", nomePopular: "arapaçu-rajado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Campylorhamphus falcularius", nomePopular: "arapaçu-de-bico-torto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lepidocolaptes angustirostris", nomePopular: "arapaçu-de-cerrado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lepidocolaptes falcinellus", nomePopular: "arapaçu-escamoso-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xenops minutus", nomePopular: "bico-virado-miúdo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xenops rutilans", nomePopular: "bico-virado-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Furnarius figulus", nomePopular: "casaca-de-couro-da-lama", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Furnarius rufus", nomePopular: "joão-de-barro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lochmias nematura", nomePopular: "joão-porca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phleocryptes melanops", nomePopular: "bate-bico", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Limnornis curvirostris", nomePopular: "joão-da-palha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cinclodes pabsti", nomePopular: "pedreiro", sc: "VU", icmbio: "LC", iucn: "NT" },
            { especie: "Cinclodes fuscus", nomePopular: "pedreiro-dos-andes", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anabazenops fuscus", nomePopular: "trepador-coleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cichlocolaptes leucophrus", nomePopular: "trepador-sobrancelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heliobletus contaminatus", nomePopular: "trepadorzinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Philydor atricapillus", nomePopular: "limpa-folha-coroado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anabacerthia amaurotis", nomePopular: "limpa-folha-miúdo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anabacerthia lichtensteini", nomePopular: "limpa-folha-ocráceo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Syndactyla rufosuperciliata", nomePopular: "trepador-quiete", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dendroma rufa", nomePopular: "limpa-folha-de-testa-baia", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Clibanornis dendrocolaptoides", nomePopular: "cisqueiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Automolus leucophthalmus", nomePopular: "barranqueiro-de-olho-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leptasthenura striolata", nomePopular: "grimpeirinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leptasthenura setaria", nomePopular: "grimpeiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phacellodomus striaticollis", nomePopular: "tio-tio", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Phacellodomus ferrugineigula", nomePopular: "joão-botina-do-brejo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anumbius annumbi", nomePopular: "cochicho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Limnoctites rectirostris", nomePopular: "arredio-do-gravatá", sc: "CR", icmbio: "LC", iucn: "NT" },
            { especie: "Cranioleuca obsoleta", nomePopular: "arredio-oliváceo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cranioleuca pallida", nomePopular: "arredio-pálido", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spartonoica maluroides", nomePopular: "boininha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Certhiaxis cinnamomeus", nomePopular: "curutié", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Schoeniophylax phryganophilus", nomePopular: "bichoita", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Synallaxis cinerascens", nomePopular: "pi-puí", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Synallaxis ruficapilla", nomePopular: "pichororé", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Synallaxis spixi", nomePopular: "joão-teneném", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Synallaxis albescens", nomePopular: "uí-pi", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Synallaxis frontalis", nomePopular: "petrim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ilicura militaris", nomePopular: "tangarazinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chiroxiphia caudata", nomePopular: "tangará", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Manacus manacus", nomePopular: "rendeira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Carpornis cucullata", nomePopular: "corocoxó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phibalura flavirostris", nomePopular: "tesourinha-da-mata", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Pyroderus scutatus", nomePopular: "pavó", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Lipaugus lanioides", nomePopular: "tropeiro-da-serra", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Procnias nudicollis", nomePopular: "araponga", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Schiffornis virescens", nomePopular: "flautim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tityra inquisitor", nomePopular: "anambé-branco-de-bochecha-parda", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tityra cayana", nomePopular: "anambé-branco-de-rabo-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tityra semifasciata", nomePopular: "anambé-branco-de-máscara-negra", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pachyramphus viridis", nomePopular: "caneleiro-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pachyramphus castaneus", nomePopular: "caneleiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pachyramphus polychopterus", nomePopular: "caneleiro-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pachyramphus marginatus", nomePopular: "caneleiro-bordado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pachyramphus validus", nomePopular: "caneleiro-de-chapéu-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Oxyruncus cristatus", nomePopular: "araponga-do-horto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Onychorhynchus swainsoni", nomePopular: "maria-leque-do-sudeste", sc: "CR", icmbio: "VU", iucn: "VU" },
            { especie: "Myiobius barbatus", nomePopular: "assanhadinho", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Myiobius atricaudus", nomePopular: "assanhadinho-de-cauda-preta", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Piprites chloris", nomePopular: "papinho-amarelo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Piprites pileata", nomePopular: "caneleirinho-de-chapéu-preto", sc: "EN", icmbio: "LC", iucn: "NT" },
            { especie: "Platyrinchus mystaceus", nomePopular: "patinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Platyrinchus leucoryphus", nomePopular: "patinho-de-asa-castanha", sc: "VU", icmbio: "VU", iucn: "VU" },
            { especie: "Tachuris rubrigastra", nomePopular: "papa-piri", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Mionectes rufiventris", nomePopular: "abre-asa-de-cabeça-cinza", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leptopogon amaurocephalus", nomePopular: "cabeçudo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Corythopis delalandi", nomePopular: "estalador", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Phylloscartes eximius", nomePopular: "barbudinho", sc: "CR", icmbio: "LC", iucn: "NT" },
            { especie: "Phylloscartes ventralis", nomePopular: "borboletinha-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phylloscartes kronei", nomePopular: "maria-da-restinga", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phylloscartes oustaleti", nomePopular: "papa-moscas-de-olheiras", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Phylloscartes difficilis", nomePopular: "estalinho", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Phylloscartes sylviolus", nomePopular: "maria-pequena", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Tolmomyias sulphurescens", nomePopular: "bico-chato-de-orelha-preta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Todirostrum poliocephalum", nomePopular: "teque-teque", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Todirostrum cinereum", nomePopular: "ferreirinho-relógio", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Poecilotriccus plumbeiceps", nomePopular: "tororó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiornis auricularis", nomePopular: "miudinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hemitriccus diops", nomePopular: "olho-falso", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Hemitriccus obsoletus", nomePopular: "catraca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hemitriccus orbitatus", nomePopular: "tiririzinho-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hemitriccus nidipendulus", nomePopular: "tachuri-campainha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hemitriccus kaempferi", nomePopular: "maria-catarinense", sc: "VU", icmbio: "VU", iucn: "VU" },
            { especie: "Hirundinea ferruginea", nomePopular: "gibão-de-couro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Euscarthmus meloryphus", nomePopular: "barulhento", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tyranniscus burmeisteri", nomePopular: "piolhinho-chiador", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Camptostoma obsoletum", nomePopular: "risadinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elaenia flavogaster", nomePopular: "guaracava-de-barriga-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elaenia spectabilis", nomePopular: "guaracava-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elaenia chilensis", nomePopular: "guaracava-de-crista-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elaenia parvirostris", nomePopular: "tuque-pium", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elaenia mesoleuca", nomePopular: "tuque", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elaenia obscura", nomePopular: "tucão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiopagis caniceps", nomePopular: "guaracava-cinzenta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiopagis viridicata", nomePopular: "guaracava-de-crista-alaranjada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Capsiempis flaveola", nomePopular: "marianinha-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phyllomyias virescens", nomePopular: "piolhinho-verdoso", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phyllomyias fasciatus", nomePopular: "piolhinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phyllomyias griseocapilla", nomePopular: "piolhinho-serrano", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Culicivora caudacuta", nomePopular: "papa-moscas-do-campo", sc: "CR", icmbio: "LC", iucn: "LC" },
            { especie: "Polystictus pectoralis", nomePopular: "papa-moscas-canela", sc: "CR", icmbio: "LC", iucn: "NT" },
            { especie: "Pseudocolopteryx sclateri", nomePopular: "tricolino", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pseudocolopteryx acutipennis", nomePopular: "tricolino-oliváceo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pseudocolopteryx flaviventris", nomePopular: "amarelinho-do-junco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Serpophaga nigricans", nomePopular: "joão-pobre", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Serpophaga subcristata", nomePopular: "alegrinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Serpophaga griseicapilla", nomePopular: "alegrinho-trinador", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Attila phoenicurus", nomePopular: "capitão-castanho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Attila rufus", nomePopular: "capitão-de-saíra", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Legatus leucophaius", nomePopular: "bem-te-vi-pirata", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphotrigon megacephalum", nomePopular: "maria-cabeçuda", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiarchus swainsoni", nomePopular: "irré", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiarchus ferox", nomePopular: "maria-cavaleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sirystes sibilator", nomePopular: "gritador", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pitangus sulphuratus", nomePopular: "bem-te-vi", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Machetornis rixosa", nomePopular: "suiriri-cavaleiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiodynastes maculatus", nomePopular: "bem-te-vi-rajado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Megarynchus pitangua", nomePopular: "neinei", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiozetetes similis", nomePopular: "bentevizinho-de-penacho-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tyrannus albogularis", nomePopular: "suiriri-de-garganta-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tyrannus melancholicus", nomePopular: "suiriri", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tyrannus savana", nomePopular: "tesourinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tyrannus tyrannus", nomePopular: "suiriri-valente", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Griseotyrannus aurantioatrocristatus", nomePopular: "peitica-de-chapéu-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Empidonomus varius", nomePopular: "peitica", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Conopias trivirgatus", nomePopular: "bem-te-vi-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Colonia colonus", nomePopular: "viuvinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Arundinicola leucocephala", nomePopular: "freirinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fluvicola albiventer", nomePopular: "lavadeira-de-cara-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fluvicola nengeta", nomePopular: "lavadeira-mascarada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pyrocephalus rubinus", nomePopular: "príncipe", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Muscipipra vetula", nomePopular: "tesoura-cinzenta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Gubernetes yetapa", nomePopular: "tesoura-do-brejo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heteroxolmis dominicanus", nomePopular: "noivinha-de-rabo-preto", sc: "EN", icmbio: "VU", iucn: "VU" },
            { especie: "Myiophobus fasciatus", nomePopular: "filipe", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cnemotriccus fuscatus", nomePopular: "guaracavuçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lathrotriccus euleri", nomePopular: "enferrujado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Contopus cinereus", nomePopular: "papa-moscas-cinzento", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Satrapa icterophrys", nomePopular: "suiriri-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lessonia rufa", nomePopular: "colegial", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hymenops perspicillatus", nomePopular: "viuvinha-de-óculos", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Knipolegus lophotes", nomePopular: "maria-preta-de-penacho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Knipolegus nigerrimus", nomePopular: "maria-preta-de-garganta-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Knipolegus cyanirostris", nomePopular: "maria-preta-de-bico-azulado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xolmis irupero", nomePopular: "noivinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xolmis velatus", nomePopular: "noivinha-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nengetus cinereus", nomePopular: "primavera", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyclarhis gujanensis", nomePopular: "pitiguari", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hylophilus poicilotis", nomePopular: "verdinho-coroado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Vireo chivi", nomePopular: "juruviara", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyanocorax caeruleus", nomePopular: "gralha-azul", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Cyanocorax cristatellus", nomePopular: "gralha-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyanocorax chrysops", nomePopular: "gralha-picaça", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pygochelidon cyanoleuca", nomePopular: "andorinha-pequena-de-casa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Alopochelidon fucata", nomePopular: "andorinha-morena", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stelgidopteryx ruficollis", nomePopular: "andorinha-serradora", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Progne tapera", nomePopular: "andorinha-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Progne subis", nomePopular: "andorinha-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Progne chalybea", nomePopular: "andorinha-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Progne elegans", nomePopular: "andorinha-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tachycineta albiventer", nomePopular: "andorinha-do-rio", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tachycineta leucorrhoa", nomePopular: "andorinha-de-sobre-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tachycineta leucopyga", nomePopular: "andorinha-chilena", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Riparia riparia", nomePopular: "andorinha-do-barranco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hirundo rustica", nomePopular: "andorinha-de-bando", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Petrochelidon pyrrhonota", nomePopular: "andorinha-de-dorso-acanelado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Troglodytes musculus", nomePopular: "corruíra", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cistothorus platensis", nomePopular: "corruíra-do-campo", sc: "CR", icmbio: "LC", iucn: "LC" },
            { especie: "Campylorhynchus turdinus", nomePopular: "catatau", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cantorchilus longirostris", nomePopular: "garrinchão-de-bico-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphocaenus melanurus", nomePopular: "chirito", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Polioptila dumicola", nomePopular: "balança-rabo-de-máscara", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Polioptila lactea", nomePopular: "balança-rabo-leitoso", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Catharus fuscescens", nomePopular: "sabiazinho-norte-americano", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Catharus swainsoni", nomePopular: "sabiazinho-de-óculos", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Turdus flavipes", nomePopular: "sabiá-una", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Turdus leucomelas", nomePopular: "sabiá-barranco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Turdus rufiventris", nomePopular: "sabiá-laranjeira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Turdus amaurochalinus", nomePopular: "sabiá-poca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Turdus subalaris", nomePopular: "sabiá-ferreiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Turdus albicollis", nomePopular: "sabiá-coleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mimus saturninus", nomePopular: "sabiá-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mimus triurus", nomePopular: "calhandra-de-três-rabos", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sturnus vulgaris", nomePopular: "estorninho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Estrilda astrild", nomePopular: "bico-de-lacre", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Passer domesticus", nomePopular: "pardal", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anthus chii", nomePopular: "caminheiro-zumbidor", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anthus correndera", nomePopular: "caminheiro-de-espora", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anthus nattereri", nomePopular: "caminheiro-dourado", sc: "EN", icmbio: "VU", iucn: "VU" },
            { especie: "Anthus hellmayri", nomePopular: "caminheiro-de-barriga-acanelada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spinus magellanicus", nomePopular: "pintassilgo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyanophonia cyanocephala", nomePopular: "gaturamo-rei", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chlorophonia cyanea", nomePopular: "gaturamo-bandeira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Euphonia chlorotica", nomePopular: "fim-fim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Euphonia chalybea", nomePopular: "cais-cais", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Euphonia violacea", nomePopular: "gaturamo-verdadeiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Euphonia pectoralis", nomePopular: "ferro-velho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ammodramus humeralis", nomePopular: "tico-tico-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Arremon semitorquatus", nomePopular: "tico-tico-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Zonotrichia capensis", nomePopular: "tico-tico", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leistes superciliaris", nomePopular: "polícia-inglesa-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cacicus chrysopterus", nomePopular: "tecelão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cacicus haemorrhous", nomePopular: "guaxe", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Icterus pyrrhopterus", nomePopular: "encontro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Icterus galbula", nomePopular: "corrupião-de-baltimore", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Molothrus rufoaxillaris", nomePopular: "chupim-azeviche", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Molothrus oryzivorus", nomePopular: "iraúna-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Molothrus bonariensis", nomePopular: "chupim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Amblyramphus holosericeus", nomePopular: "cardeal-do-banhado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Gnorimopsar chopi", nomePopular: "pássaro-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Agelaioides badius", nomePopular: "asa-de-telha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Agelasticus thilius", nomePopular: "sargento", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chrysomus ruficapillus", nomePopular: "garibaldi", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xanthopsar flavus", nomePopular: "veste-amarela", sc: "CR", icmbio: "VU", iucn: "EN" },
            { especie: "Pseudoleistes guirahuro", nomePopular: "chupim-do-brejo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pseudoleistes virescens", nomePopular: "dragão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Geothlypis aequinoctialis", nomePopular: "pia-cobra", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Setophaga cerulea", nomePopular: "mariquita-azul", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Setophaga pitiayumi", nomePopular: "mariquita", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Setophaga striata", nomePopular: "mariquita-de-perna-clara", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Myiothlypis leucoblephara", nomePopular: "pula-pula-assobiador", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiothlypis rivularis", nomePopular: "pula-pula-ribeirinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Basileuterus culicivorus", nomePopular: "pula-pula", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Orthogonys chloricterus", nomePopular: "catirumbava", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Piranga flava", nomePopular: "sanhaço-de-fogo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Habia rubica", nomePopular: "tiê-de-bando", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Amaurospiza moesta", nomePopular: "negrinho-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyanoloxia glaucocaerulea", nomePopular: "azulinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyanoloxia brissonii", nomePopular: "azulão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Orchesticus abeillei", nomePopular: "sanhaço-pardo", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Nemosia pileata", nomePopular: "saíra-de-chapéu-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Embernagra platensis", nomePopular: "sabiá-do-banhado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Emberizoides herbicola", nomePopular: "canário-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Emberizoides ypiranganus", nomePopular: "canário-do-brejo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Rhopospina fruticeti", nomePopular: "canário-andino-negro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Serinus canaria", nomePopular: "canário-doméstico", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chlorophanes spiza", nomePopular: "saí-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hemithraupis guira", nomePopular: "saíra-de-papo-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hemithraupis ruficapilla", nomePopular: "saíra-ferrugem", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tersina viridis", nomePopular: "saí-andorinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyanerpes cyaneus", nomePopular: "saíra-beija-flor", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dacnis nigripes", nomePopular: "saí-de-pernas-pretas", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Dacnis cayana", nomePopular: "saí-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Saltator similis", nomePopular: "trinca-ferro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Saltator maxillosus", nomePopular: "bico-grosso", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Saltator fuliginosus", nomePopular: "bico-de-pimenta", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Coereba flaveola", nomePopular: "cambacica", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Asemospiza fuliginosa", nomePopular: "cigarra-preta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Volatinia jacarina", nomePopular: "tiziu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Trichothraupis melanops", nomePopular: "tiê-de-topete", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Loriotus cristatus", nomePopular: "tiê-galo", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Tachyphonus coronatus", nomePopular: "tiê-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphocelus bresilia", nomePopular: "tiê-sangue", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphocelus carbo", nomePopular: "pipira-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sporophila lineola", nomePopular: "bigodinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sporophila frontalis", nomePopular: "pixoxó", sc: "VU", icmbio: "VU", iucn: "VU" },
            { especie: "Sporophila falcirostris", nomePopular: "cigarrinha-do-sul", sc: "EN", icmbio: "VU", iucn: "VU" },
            { especie: "Sporophila beltoni", nomePopular: "patativa-tropeira", sc: "LC", icmbio: "VU", iucn: "VU" },
            { especie: "Sporophila collaris", nomePopular: "coleiro-do-brejo", sc: "LC", icmbio: "VU", iucn: "LC" },
            { especie: "Sporophila caerulescens", nomePopular: "coleirinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sporophila leucoptera", nomePopular: "chorão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sporophila pileata", nomePopular: "caboclinho-coroado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sporophila hypoxantha", nomePopular: "caboclinho-de-barriga-vermelha", sc: "VU", icmbio: "VU", iucn: "LC" },
            { especie: "Sporophila ruficollis", nomePopular: "caboclinho-de-papo-escuro", sc: "LC", icmbio: "VU", iucn: "NT" },
            { especie: "Sporophila palustris", nomePopular: "caboclinho-de-papo-branco", sc: "LC", icmbio: "VU", iucn: "EN" },
            { especie: "Sporophila cinnamomea", nomePopular: "caboclinho-de-chapéu-cinzento", sc: "CR", icmbio: "VU", iucn: "VU" },
            { especie: "Sporophila melanogaster", nomePopular: "caboclinho-de-barriga-preta", sc: "VU", icmbio: "VU", iucn: "NT" },
            { especie: "Sporophila angolensis", nomePopular: "curió", sc: "CR", icmbio: "VU", iucn: "LC" },
            { especie: "Poospiza nigrorufa", nomePopular: "quem-te-vestiu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thlypopsis sordida", nomePopular: "saí-canário", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thlypopsis pyrrhocoma", nomePopular: "cabecinha-castanha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Castanozoster thoracicus", nomePopular: "peito-pinhão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Donacospiza albifrons", nomePopular: "tico-tico-do-banhado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Microspingus cabanisi", nomePopular: "quete-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Conirostrum speciosum", nomePopular: "figuinha-de-rabo-castanho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Conirostrum bicolor", nomePopular: "figuinha-do-mangue", sc: "VU", icmbio: "LC", iucn: "NT" },
            { especie: "Sicalis citrina", nomePopular: "canário-rasteiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sicalis flaveola", nomePopular: "canário-da-terra", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sicalis luteola", nomePopular: "tipio", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Haplospiza unicolor", nomePopular: "cigarra-bambu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pipraeidea melanonota", nomePopular: "saíra-viúva", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Rauenia bonariensis", nomePopular: "sanhaço-papa-laranja", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stephanophorus diadematus", nomePopular: "sanhaço-frade", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cissopis leverianus", nomePopular: "tietinga", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Schistochlamys ruficapillus", nomePopular: "bico-de-veludo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Paroaria coronata", nomePopular: "cardeal", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thraupis sayaca", nomePopular: "sanhaço-cinzento", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thraupis cyanoptera", nomePopular: "sanhaço-de-encontro-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thraupis palmarum", nomePopular: "sanhaço-do-coqueiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thraupis ornata", nomePopular: "sanhaço-de-encontro-amarelo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stilpnia peruviana", nomePopular: "saíra-sapucaia", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Stilpnia preciosa", nomePopular: "saíra-preciosa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tangara seledon", nomePopular: "saíra-sete-cores", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tangara cyanocephala", nomePopular: "saíra-militar", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tangara desmaresti", nomePopular: "saíra-lagarta", sc: "LC", icmbio: "LC", iucn: "LC" }
        ];

        // Construir speciesInfo e BIRD_DATABASE
        conservationData.forEach(item => {
            const nomeCientifico = item.especie;
            const nomePopular = item.nomePopular;
            // Determinar ordem e família baseado no gênero (mapa simples)
            const genus = nomeCientifico.split(' ')[0];
            // Mapa de ordens e famílias (simplificado, mas suficiente para a maioria)
            const ordemMap = {
                "Rhea": "Rheiformes", "Tinamus": "Tinamiformes", "Crypturellus": "Tinamiformes",
                "Rhynchotus": "Tinamiformes", "Nothura": "Tinamiformes", "Taoniscus": "Tinamiformes",
                "Anhima": "Anseriformes", "Chauna": "Anseriformes", "Dendrocygna": "Anseriformes",
                "Coscoroba": "Anseriformes", "Cairina": "Anseriformes", "Sarkidiornis": "Anseriformes",
                "Callonetta": "Anseriformes", "Amazonetta": "Anseriformes", "Spatula": "Anseriformes",
                "Mareca": "Anseriformes", "Anas": "Anseriformes", "Netta": "Anseriformes",
                "Heteronetta": "Anseriformes", "Nomonyx": "Anseriformes", "Oxyura": "Anseriformes",
                "Penelope": "Galliformes", "Aburria": "Galliformes", "Ortalis": "Galliformes",
                "Odontophorus": "Galliformes", "Colinus": "Galliformes", "Phoenicopterus": "Phoenicopteriformes",
                "Phoenicoparrus": "Phoenicopteriformes", "Rollandia": "Podicipediformes", "Tachybaptus": "Podicipediformes",
                "Podilymbus": "Podicipediformes", "Podicephorus": "Podicipediformes", "Podiceps": "Podicipediformes",
                "Aptenodytes": "Sphenisciformes", "Spheniscus": "Sphenisciformes", "Diomedea": "Procellariiformes",
                "Thalassarche": "Procellariiformes", "Oceanites": "Procellariiformes", "Macronectes": "Procellariiformes",
                "Fulmarus": "Procellariiformes", "Daption": "Procellariiformes", "Pterodroma": "Procellariiformes",
                "Procellaria": "Procellariiformes", "Calonectris": "Procellariiformes", "Ardenna": "Procellariiformes",
                "Puffinus": "Procellariiformes", "Phaethon": "Phaethontiformes", "Ciconia": "Ciconiiformes",
                "Jabiru": "Ciconiiformes", "Mycteria": "Ciconiiformes", "Fregata": "Suliformes",
                "Morus": "Suliformes", "Sula": "Suliformes", "Anhinga": "Suliformes", "Nannopterum": "Suliformes",
                "Tigrisoma": "Pelecaniformes", "Cochlearius": "Pelecaniformes", "Botaurus": "Pelecaniformes",
                "Ixobrychus": "Pelecaniformes", "Nycticorax": "Pelecaniformes", "Nyctanassa": "Pelecaniformes",
                "Butorides": "Pelecaniformes", "Bubulcus": "Pelecaniformes", "Ardea": "Pelecaniformes",
                "Syrigma": "Pelecaniformes", "Pilherodius": "Pelecaniformes", "Egretta": "Pelecaniformes",
                "Eudocimus": "Pelecaniformes", "Plegadis": "Pelecaniformes", "Mesembrinibis": "Pelecaniformes",
                "Phimosus": "Pelecaniformes", "Theristicus": "Pelecaniformes", "Platalea": "Pelecaniformes",
                "Sarcoramphus": "Cathartiformes", "Coragyps": "Cathartiformes", "Cathartes": "Cathartiformes",
                "Pandion": "Accipitriformes", "Elanus": "Accipitriformes", "Chondrohierax": "Accipitriformes",
                "Leptodon": "Accipitriformes", "Elanoides": "Accipitriformes", "Spizaetus": "Accipitriformes",
                "Rostrhamus": "Accipitriformes", "Harpagus": "Accipitriformes", "Ictinia": "Accipitriformes",
                "Circus": "Accipitriformes", "Hieraspiza": "Accipitriformes", "Accipiter": "Accipitriformes",
                "Geranospiza": "Accipitriformes", "Heterospizias": "Accipitriformes", "Amadonastur": "Accipitriformes",
                "Urubitinga": "Accipitriformes", "Rupornis": "Accipitriformes", "Parabuteo": "Accipitriformes",
                "Geranoaetus": "Accipitriformes", "Pseudastur": "Accipitriformes", "Buteo": "Accipitriformes",
                "Eurypyga": "Eurypygiformes", "Aramus": "Gruiformes", "Rallus": "Gruiformes",
                "Porphyrio": "Gruiformes", "Laterallus": "Gruiformes", "Mustelirallus": "Gruiformes",
                "Neocrex": "Gruiformes", "Pardirallus": "Gruiformes", "Amaurolimnas": "Gruiformes",
                "Aramides": "Gruiformes", "Porphyriops": "Gruiformes", "Gallinula": "Gruiformes",
                "Fulica": "Gruiformes", "Coturnicops": "Gruiformes", "Heliornis": "Gruiformes",
                "Pluvialis": "Charadriiformes", "Oreopholus": "Charadriiformes", "Vanellus": "Charadriiformes",
                "Charadrius": "Charadriiformes", "Haematopus": "Charadriiformes", "Himantopus": "Charadriiformes",
                "Chionis": "Charadriiformes", "Bartramia": "Charadriiformes", "Numenius": "Charadriiformes",
                "Limosa": "Charadriiformes", "Arenaria": "Charadriiformes", "Calidris": "Charadriiformes",
                "Limnodromus": "Charadriiformes", "Gallinago": "Charadriiformes", "Phalaropus": "Charadriiformes",
                "Actitis": "Charadriiformes", "Tringa": "Charadriiformes", "Thinocorus": "Charadriiformes",
                "Jacana": "Charadriiformes", "Nycticryphes": "Charadriiformes", "Stercorarius": "Charadriiformes",
                "Chroicocephalus": "Charadriiformes", "Leucophaeus": "Charadriiformes", "Larus": "Charadriiformes",
                "Anous": "Charadriiformes", "Rynchops": "Charadriiformes", "Sternula": "Charadriiformes",
                "Phaetusa": "Charadriiformes", "Sterna": "Charadriiformes", "Thalasseus": "Charadriiformes",
                "Columba": "Columbiformes", "Patagioenas": "Columbiformes", "Geotrygon": "Columbiformes",
                "Leptotila": "Columbiformes", "Zenaida": "Columbiformes", "Claravis": "Columbiformes",
                "Columbina": "Columbiformes", "Opisthocomus": "Opisthocomiformes", "Guira": "Cuculiformes",
                "Crotophaga": "Cuculiformes", "Tapera": "Cuculiformes", "Dromococcyx": "Cuculiformes",
                "Neomorphus": "Cuculiformes", "Micrococcyx": "Cuculiformes", "Piaya": "Cuculiformes",
                "Coccyzus": "Cuculiformes", "Tyto": "Strigiformes", "Megascops": "Strigiformes",
                "Pulsatrix": "Strigiformes", "Bubo": "Strigiformes", "Strix": "Strigiformes",
                "Glaucidium": "Strigiformes", "Athene": "Strigiformes", "Aegolius": "Strigiformes",
                "Asio": "Strigiformes", "Steatornis": "Steatornithiformes", "Nyctibius": "Nyctibiiformes",
                "Antrostomus": "Caprimulgiformes", "Lurocalis": "Caprimulgiformes", "Nyctidromus": "Caprimulgiformes",
                "Hydropsalis": "Caprimulgiformes", "Podager": "Caprimulgiformes", "Chordeiles": "Caprimulgiformes",
                "Cypseloides": "Apodiformes", "Streptoprocne": "Apodiformes", "Chaetura": "Apodiformes",
                "Panyptila": "Apodiformes", "Florisuga": "Apodiformes", "Ramphodon": "Apodiformes",
                "Phaethornis": "Apodiformes", "Colibri": "Apodiformes", "Heliothryx": "Apodiformes",
                "Anthracothorax": "Apodiformes", "Lophornis": "Apodiformes", "Heliodoxa": "Apodiformes",
                "Heliomaster": "Apodiformes", "Calliphlox": "Apodiformes", "Chlorostilbon": "Apodiformes",
                "Stephanoxis": "Apodiformes", "Thalurania": "Apodiformes", "Eupetomena": "Apodiformes",
                "Aphantochroa": "Apodiformes", "Chrysuronia": "Apodiformes", "Leucochloris": "Apodiformes",
                "Chionomesa": "Apodiformes", "Hylocharis": "Apodiformes", "Augastes": "Apodiformes",
                "Trogon": "Trogoniformes", "Megaceryle": "Coraciiformes", "Chloroceryle": "Coraciiformes",
                "Baryphthengus": "Coraciiformes", "Nonnula": "Galbuliformes", "Malacoptila": "Galbuliformes",
                "Notharchus": "Galbuliformes", "Nystalus": "Galbuliformes", "Ramphastos": "Piciformes",
                "Selenidera": "Piciformes", "Pteroglossus": "Piciformes", "Picumnus": "Piciformes",
                "Melanerpes": "Piciformes", "Veniliornis": "Piciformes", "Campephilus": "Piciformes",
                "Dryocopus": "Piciformes", "Celeus": "Piciformes", "Piculus": "Piciformes",
                "Colaptes": "Piciformes", "Cariama": "Cariamiformes", "Herpetotheres": "Falconiformes",
                "Micrastur": "Falconiformes", "Caracara": "Falconiformes", "Milvago": "Falconiformes",
                "Falco": "Falconiformes", "Touit": "Psittaciformes", "Myiopsitta": "Psittaciformes",
                "Brotogeris": "Psittaciformes", "Pionopsitta": "Psittaciformes", "Triclaria": "Psittaciformes",
                "Pionus": "Psittaciformes", "Amazona": "Psittaciformes", "Forpus": "Psittaciformes",
                "Pyrrhura": "Psittaciformes", "Primolius": "Psittaciformes", "Psittacara": "Psittaciformes",
                "Pyrilia": "Psittaciformes",
                // Passeriformes — listados explicitamente (antes caíam no fallback silencioso)
                "Terenura": "Passeriformes", "Myrmotherula": "Passeriformes", "Formicivora": "Passeriformes",
                "Rhopias": "Passeriformes", "Dysithamnus": "Passeriformes", "Herpsilochmus": "Passeriformes",
                "Thamnophilus": "Passeriformes", "Hypoedaleus": "Passeriformes", "Batara": "Passeriformes",
                "Mackenziaena": "Passeriformes", "Biatas": "Passeriformes", "Myrmoderus": "Passeriformes",
                "Pyriglena": "Passeriformes", "Drymophila": "Passeriformes", "Conopophaga": "Passeriformes",
                "Grallaria": "Passeriformes", "Cryptopezus": "Passeriformes", "Psilorhamphus": "Passeriformes",
                "Merulaxis": "Passeriformes", "Eleoscytalopus": "Passeriformes", "Scytalopus": "Passeriformes",
                "Formicarius": "Passeriformes", "Chamaeza": "Passeriformes", "Sclerurus": "Passeriformes",
                "Geositta": "Passeriformes", "Sittasomus": "Passeriformes", "Dendrocincla": "Passeriformes",
                "Dendrocolaptes": "Passeriformes", "Xiphocolaptes": "Passeriformes", "Xiphorhynchus": "Passeriformes",
                "Campylorhamphus": "Passeriformes", "Lepidocolaptes": "Passeriformes", "Xenops": "Passeriformes",
                "Furnarius": "Passeriformes", "Lochmias": "Passeriformes", "Phleocryptes": "Passeriformes",
                "Limnornis": "Passeriformes", "Cinclodes": "Passeriformes", "Anabazenops": "Passeriformes",
                "Cichlocolaptes": "Passeriformes", "Heliobletus": "Passeriformes", "Philydor": "Passeriformes",
                "Anabacerthia": "Passeriformes", "Syndactyla": "Passeriformes", "Dendroma": "Passeriformes",
                "Clibanornis": "Passeriformes", "Automolus": "Passeriformes", "Leptasthenura": "Passeriformes",
                "Phacellodomus": "Passeriformes", "Anumbius": "Passeriformes", "Limnoctites": "Passeriformes",
                "Cranioleuca": "Passeriformes", "Spartonoica": "Passeriformes", "Certhiaxis": "Passeriformes",
                "Schoeniophylax": "Passeriformes", "Synallaxis": "Passeriformes", "Ilicura": "Passeriformes",
                "Chiroxiphia": "Passeriformes", "Manacus": "Passeriformes", "Carpornis": "Passeriformes",
                "Pyroderus": "Passeriformes", "Lipaugus": "Passeriformes", "Procnias": "Passeriformes",
                "Phibalura": "Passeriformes", "Cotinga": "Passeriformes", "Schiffornis": "Passeriformes",
                "Tityra": "Passeriformes", "Pachyramphus": "Passeriformes", "Oxyruncus": "Passeriformes",
                "Onychorhynchus": "Passeriformes", "Myiobius": "Passeriformes", "Piprites": "Passeriformes",
                "Platyrinchus": "Passeriformes", "Tachuris": "Passeriformes", "Mionectes": "Passeriformes",
                "Leptopogon": "Passeriformes", "Corythopis": "Passeriformes", "Phylloscartes": "Passeriformes",
                "Tolmomyias": "Passeriformes", "Todirostrum": "Passeriformes", "Poecilotriccus": "Passeriformes",
                "Myiornis": "Passeriformes", "Hemitriccus": "Passeriformes", "Hirundinea": "Passeriformes",
                "Euscarthmus": "Passeriformes", "Tyranniscus": "Passeriformes", "Camptostoma": "Passeriformes",
                "Elaenia": "Passeriformes", "Myiopagis": "Passeriformes", "Capsiempis": "Passeriformes",
                "Phyllomyias": "Passeriformes", "Culicivora": "Passeriformes", "Polystictus": "Passeriformes",
                "Pseudocolopteryx": "Passeriformes", "Serpophaga": "Passeriformes", "Attila": "Passeriformes",
                "Legatus": "Passeriformes", "Ramphotrigon": "Passeriformes", "Myiarchus": "Passeriformes",
                "Sirystes": "Passeriformes", "Pitangus": "Passeriformes", "Machetornis": "Passeriformes",
                "Myiodynastes": "Passeriformes", "Megarynchus": "Passeriformes", "Myiozetetes": "Passeriformes",
                "Tyrannus": "Passeriformes", "Griseotyrannus": "Passeriformes", "Empidonomus": "Passeriformes",
                "Conopias": "Passeriformes", "Colonia": "Passeriformes", "Arundinicola": "Passeriformes",
                "Fluvicola": "Passeriformes", "Pyrocephalus": "Passeriformes", "Muscipipra": "Passeriformes",
                "Gubernetes": "Passeriformes", "Heteroxolmis": "Passeriformes", "Myiophobus": "Passeriformes",
                "Cnemotriccus": "Passeriformes", "Lathrotriccus": "Passeriformes", "Contopus": "Passeriformes",
                "Satrapa": "Passeriformes", "Lessonia": "Passeriformes", "Hymenops": "Passeriformes",
                "Knipolegus": "Passeriformes", "Xolmis": "Passeriformes", "Nengetus": "Passeriformes",
                "Cyclarhis": "Passeriformes", "Hylophilus": "Passeriformes", "Vireo": "Passeriformes",
                "Cyanocorax": "Passeriformes", "Pygochelidon": "Passeriformes", "Alopochelidon": "Passeriformes",
                "Stelgidopteryx": "Passeriformes", "Progne": "Passeriformes", "Tachycineta": "Passeriformes",
                "Riparia": "Passeriformes", "Hirundo": "Passeriformes", "Petrochelidon": "Passeriformes",
                "Troglodytes": "Passeriformes", "Cistothorus": "Passeriformes", "Campylorhynchus": "Passeriformes",
                "Cantorchilus": "Passeriformes", "Ramphocaenus": "Passeriformes", "Polioptila": "Passeriformes",
                "Catharus": "Passeriformes", "Turdus": "Passeriformes", "Mimus": "Passeriformes",
                "Sturnus": "Passeriformes", "Estrilda": "Passeriformes", "Passer": "Passeriformes",
                "Anthus": "Passeriformes", "Spinus": "Passeriformes", "Serinus": "Passeriformes", "Cyanophonia": "Passeriformes",
                "Chlorophonia": "Passeriformes", "Euphonia": "Passeriformes", "Ammodramus": "Passeriformes",
                "Arremon": "Passeriformes", "Zonotrichia": "Passeriformes", "Leistes": "Passeriformes",
                "Cacicus": "Passeriformes", "Psarocolius": "Passeriformes", "Icterus": "Passeriformes",
                "Molothrus": "Passeriformes", "Amblyramphus": "Passeriformes", "Gnorimopsar": "Passeriformes",
                "Agelaioides": "Passeriformes", "Agelasticus": "Passeriformes", "Chrysomus": "Passeriformes",
                "Xanthopsar": "Passeriformes", "Pseudoleistes": "Passeriformes", "Geothlypis": "Passeriformes",
                "Setophaga": "Passeriformes", "Myiothlypis": "Passeriformes", "Basileuterus": "Passeriformes",
                "Orthogonys": "Passeriformes", "Piranga": "Passeriformes", "Habia": "Passeriformes",
                "Amaurospiza": "Passeriformes", "Cyanoloxia": "Passeriformes", "Orchesticus": "Passeriformes",
                "Nemosia": "Passeriformes", "Embernagra": "Passeriformes", "Emberizoides": "Passeriformes",
                "Rhopospina": "Passeriformes", "Hemithraupis": "Passeriformes", "Tersina": "Passeriformes",
                "Cyanerpes": "Passeriformes", "Dacnis": "Passeriformes", "Saltator": "Passeriformes",
                "Coereba": "Passeriformes", "Asemospiza": "Passeriformes", "Volatinia": "Passeriformes",
                "Trichothraupis": "Passeriformes", "Loriotus": "Passeriformes", "Coryphospingus": "Passeriformes",
                "Tachyphonus": "Passeriformes", "Ramphocelus": "Passeriformes", "Sporophila": "Passeriformes",
                "Poospiza": "Passeriformes", "Thlypopsis": "Passeriformes", "Castanozoster": "Passeriformes",
                "Donacospiza": "Passeriformes", "Microspingus": "Passeriformes", "Conirostrum": "Passeriformes",
                "Sicalis": "Passeriformes", "Haplospiza": "Passeriformes", "Pipraeidea": "Passeriformes",
                "Rauenia": "Passeriformes", "Stephanophorus": "Passeriformes", "Cissopis": "Passeriformes",
                "Schistochlamys": "Passeriformes", "Paroaria": "Passeriformes", "Thraupis": "Passeriformes",
                "Stilpnia": "Passeriformes", "Tangara": "Passeriformes", "Chlorophanes": "Passeriformes"
            };

            //GÊNERO PARA FAMÍLIA
            const familiaMap = {
"Rhea": "Rheidae",
"Tinamus": "Tinamidae",
"Crypturellus": "Tinamidae",
"Rhynchotus": "Tinamidae",
"Nothura": "Tinamidae",
"Taoniscus": "Tinamidae",
"Anhima": "Anhimidae",
"Chauna": "Anhimidae",
"Dendrocygna": "Anatidae",
"Coscoroba": "Anatidae",
"Cairina": "Anatidae",
"Sarkidiornis": "Anatidae",
"Callonetta": "Anatidae",
"Amazonetta": "Anatidae",
"Spatula": "Anatidae",
"Mareca": "Anatidae",
"Anas": "Anatidae",
"Netta": "Anatidae",
"Heteronetta": "Anatidae",
"Nomonyx": "Anatidae",
"Oxyura": "Anatidae",
"Penelope": "Cracidae",
"Aburria": "Cracidae",
"Ortalis": "Cracidae",
"Odontophorus": "Odontophoridae",
"Colinus": "Odontophoridae",
"Rollandia": "Podicipedidae",
"Tachybaptus": "Podicipedidae",
"Podilymbus": "Podicipedidae",
"Podicephorus": "Podicipedidae",
"Podiceps": "Podicipedidae",
"Phoenicopterus": "Phoenicopteridae",
"Phoenicoparrus": "Phoenicopteridae",
"Aptenodytes": "Spheniscidae",
"Spheniscus": "Spheniscidae",
"Diomedea": "Diomedeidae",
"Thalassarche": "Diomedeidae",
"Oceanites": "Oceanitidae",
"Macronectes": "Procellariidae",
"Fulmarus": "Procellariidae",
"Daption": "Procellariidae",
"Pterodroma": "Procellariidae",
"Procellaria": "Procellariidae",
"Calonectris": "Procellariidae",
"Ardenna": "Procellariidae",
"Puffinus": "Procellariidae",
"Phaethon": "Phaethontidae",
"Ciconia": "Ciconiidae",
"Jabiru": "Ciconiidae",
"Mycteria": "Ciconiidae",
"Fregata": "Fregatidae",
"Morus": "Sulidae",
"Sula": "Sulidae",
"Anhinga": "Anhingidae",
"Nannopterum": "Phalacrocoracidae",
"Tigrisoma": "Ardeidae",
"Cochlearius": "Ardeidae",
"Botaurus": "Ardeidae",
"Ixobrychus": "Ardeidae",
"Nycticorax": "Ardeidae",
"Nyctanassa": "Ardeidae",
"Butorides": "Ardeidae",
"Bubulcus": "Ardeidae",
"Ardea": "Ardeidae",
"Syrigma": "Ardeidae",
"Pilherodius": "Ardeidae",
"Egretta": "Ardeidae",
"Eudocimus": "Threskiornithidae",
"Plegadis": "Threskiornithidae",
"Mesembrinibis": "Threskiornithidae",
"Phimosus": "Threskiornithidae",
"Theristicus": "Threskiornithidae",
"Platalea": "Threskiornithidae",
"Sarcoramphus": "Cathartidae",
"Coragyps": "Cathartidae",
"Cathartes": "Cathartidae",
"Pandion": "Pandionidae",
"Elanus": "Accipitridae",
"Chondrohierax": "Accipitridae",
"Leptodon": "Accipitridae",
"Elanoides": "Accipitridae",
"Spizaetus": "Accipitridae",
"Rostrhamus": "Accipitridae",
"Harpagus": "Accipitridae",
"Ictinia": "Accipitridae",
"Circus": "Accipitridae",
"Hieraspiza": "Accipitridae",
"Accipiter": "Accipitridae",
"Geranospiza": "Accipitridae",
"Heterospizias": "Accipitridae",
"Amadonastur": "Accipitridae",
"Urubitinga": "Accipitridae",
"Rupornis": "Accipitridae",
"Parabuteo": "Accipitridae",
"Geranoaetus": "Accipitridae",
"Pseudastur": "Accipitridae",
"Buteo": "Accipitridae",
"Eurypyga": "Eurypygidae",
"Aramus": "Aramidae",
"Rallus": "Rallidae",
"Porphyrio": "Rallidae",
"Laterallus": "Rallidae",
"Mustelirallus": "Rallidae",
"Neocrex": "Rallidae",
"Pardirallus": "Rallidae",
"Amaurolimnas": "Rallidae",
"Aramides": "Rallidae",
"Porphyriops": "Rallidae",
"Gallinula": "Rallidae",
"Fulica": "Rallidae",
"Coturnicops": "Rallidae",
"Heliornis": "Heliornithidae",
"Pluvialis": "Charadriidae",
"Oreopholus": "Charadriidae",
"Vanellus": "Charadriidae",
"Charadrius": "Charadriidae",
"Haematopus": "Haematopodidae",
"Himantopus": "Recurvirostridae",
"Chionis": "Chionidae",
"Bartramia": "Scolopacidae",
"Numenius": "Scolopacidae",
"Limosa": "Scolopacidae",
"Arenaria": "Scolopacidae",
"Calidris": "Scolopacidae",
"Limnodromus": "Scolopacidae",
"Gallinago": "Scolopacidae",
"Phalaropus": "Scolopacidae",
"Actitis": "Scolopacidae",
"Tringa": "Scolopacidae",
"Thinocorus": "Thinocoridae",
"Jacana": "Jacanidae",
"Nycticryphes": "Rostratulidae",
"Stercorarius": "Stercorariidae",
"Chroicocephalus": "Laridae",
"Leucophaeus": "Laridae",
"Larus": "Laridae",
"Sternula": "Laridae",
"Phaetusa": "Laridae",
"Sterna": "Laridae",
"Thalasseus": "Laridae",
"Rynchops": "Laridae",
"Anous": "Laridae",
"Columba": "Columbidae",
"Patagioenas": "Columbidae",
"Geotrygon": "Columbidae",
"Leptotila": "Columbidae",
"Zenaida": "Columbidae",
"Claravis": "Columbidae",
"Columbina": "Columbidae",
"Opisthocomus": "Opisthocomidae",
"Guira": "Cuculidae",
"Crotophaga": "Cuculidae",
"Tapera": "Cuculidae",
"Dromococcyx": "Cuculidae",
"Neomorphus": "Cuculidae",
"Micrococcyx": "Cuculidae",
"Piaya": "Cuculidae",
"Coccyzus": "Cuculidae",
"Tyto": "Tytonidae",
"Megascops": "Strigidae",
"Pulsatrix": "Strigidae",
"Bubo": "Strigidae",
"Strix": "Strigidae",
"Glaucidium": "Strigidae",
"Athene": "Strigidae",
"Aegolius": "Strigidae",
"Asio": "Strigidae",
"Steatornis": "Steatornithidae",
"Nyctibius": "Nyctibiidae",
"Antrostomus": "Caprimulgidae",
"Lurocalis": "Caprimulgidae",
"Nyctidromus": "Caprimulgidae",
"Hydropsalis": "Caprimulgidae",
"Podager": "Caprimulgidae",
"Chordeiles": "Caprimulgidae",
"Cypseloides": "Apodidae",
"Streptoprocne": "Apodidae",
"Chaetura": "Apodidae",
"Panyptila": "Apodidae",
"Florisuga": "Trochilidae",
"Ramphodon": "Trochilidae",
"Phaethornis": "Trochilidae",
"Colibri": "Trochilidae",
"Heliothryx": "Trochilidae",
"Anthracothorax": "Trochilidae",
"Lophornis": "Trochilidae",
"Heliodoxa": "Trochilidae",
"Heliomaster": "Trochilidae",
"Calliphlox": "Trochilidae",
"Chlorostilbon": "Trochilidae",
"Stephanoxis": "Trochilidae",
"Thalurania": "Trochilidae",
"Eupetomena": "Trochilidae",
"Aphantochroa": "Trochilidae",
"Chrysuronia": "Trochilidae",
"Leucochloris": "Trochilidae",
"Chionomesa": "Trochilidae",
"Hylocharis": "Trochilidae",
"Augastes": "Trochilidae",
"Trogon": "Trogonidae",
"Megaceryle": "Alcedinidae",
"Chloroceryle": "Alcedinidae",
"Baryphthengus": "Momotidae",
"Nonnula": "Bucconidae",
"Malacoptila": "Bucconidae",
"Notharchus": "Bucconidae",
"Nystalus": "Bucconidae",
"Ramphastos": "Ramphastidae",
"Selenidera": "Ramphastidae",
"Pteroglossus": "Ramphastidae",
"Picumnus": "Picidae",
"Melanerpes": "Picidae",
"Veniliornis": "Picidae",
"Campephilus": "Picidae",
"Dryocopus": "Picidae",
"Celeus": "Picidae",
"Piculus": "Picidae",
"Colaptes": "Picidae",
"Cariama": "Cariamidae",
"Herpetotheres": "Falconidae",
"Micrastur": "Falconidae",
"Caracara": "Falconidae",
"Milvago": "Falconidae",
"Falco": "Falconidae",
"Touit": "Psittacidae",
"Myiopsitta": "Psittacidae",
"Brotogeris": "Psittacidae",
"Pionopsitta": "Psittacidae",
"Triclaria": "Psittacidae",
"Pionus": "Psittacidae",
"Amazona": "Psittacidae",
"Forpus": "Psittacidae",
"Pyrrhura": "Psittacidae",
"Primolius": "Psittacidae",
"Psittacara": "Psittacidae",
"Pyrilia": "Psittacidae",
"Terenura": "Thamnophilidae",
"Myrmotherula": "Thamnophilidae",
"Formicivora": "Thamnophilidae",
"Rhopias": "Thamnophilidae",
"Dysithamnus": "Thamnophilidae",
"Herpsilochmus": "Thamnophilidae",
"Thamnophilus": "Thamnophilidae",
"Hypoedaleus": "Thamnophilidae",
"Batara": "Thamnophilidae",
"Mackenziaena": "Thamnophilidae",
"Biatas": "Thamnophilidae",
"Myrmoderus": "Thamnophilidae",
"Pyriglena": "Thamnophilidae",
"Drymophila": "Thamnophilidae",
"Conopophaga": "Conopophagidae",
"Grallaria": "Grallariidae",
"Cryptopezus": "Grallariidae",
"Psilorhamphus": "Rhinocryptidae",
"Merulaxis": "Rhinocryptidae",
"Eleoscytalopus": "Rhinocryptidae",
"Scytalopus": "Rhinocryptidae",
"Formicarius": "Formicariidae",
"Chamaeza": "Formicariidae",
"Sclerurus": "Scleruridae",
"Geositta": "Scleruridae",
"Sittasomus": "Dendrocolaptidae",
"Dendrocincla": "Dendrocolaptidae",
"Dendrocolaptes": "Dendrocolaptidae",
"Xiphocolaptes": "Dendrocolaptidae",
"Xiphorhynchus": "Dendrocolaptidae",
"Campylorhamphus": "Dendrocolaptidae",
"Lepidocolaptes": "Dendrocolaptidae",
"Xenops": "Xenopidae",
"Furnarius": "Furnariidae",
"Lochmias": "Furnariidae",
"Phleocryptes": "Furnariidae",
"Limnornis": "Furnariidae",
"Cinclodes": "Furnariidae",
"Anabazenops": "Furnariidae",
"Cichlocolaptes": "Furnariidae",
"Heliobletus": "Furnariidae",
"Philydor": "Furnariidae",
"Anabacerthia": "Furnariidae",
"Syndactyla": "Furnariidae",
"Dendroma": "Furnariidae",
"Clibanornis": "Furnariidae",
"Automolus": "Furnariidae",
"Leptasthenura": "Furnariidae",
"Phacellodomus": "Furnariidae",
"Anumbius": "Furnariidae",
"Limnoctites": "Furnariidae",
"Cranioleuca": "Furnariidae",
"Spartonoica": "Furnariidae",
"Certhiaxis": "Furnariidae",
"Schoeniophylax": "Furnariidae",
"Synallaxis": "Furnariidae",
"Ilicura": "Pipridae",
"Chiroxiphia": "Pipridae",
"Manacus": "Pipridae",
"Carpornis": "Cotingidae",
"Pyroderus": "Cotingidae",
"Lipaugus": "Cotingidae",
"Procnias": "Cotingidae",
"Phibalura": "Cotingidae",
"Cotinga": "Cotingidae",
"Schiffornis": "Tityridae",
"Tityra": "Tityridae",
"Pachyramphus": "Tityridae",
"Oxyruncus": "Oxyruncidae",
"Onychorhynchus": "Onychorhynchidae",
"Myiobius": "Onychorhynchidae",
"Piprites": "Pipritidae",
"Platyrinchus": "Platyrinchidae",
"Tachuris": "Tachurisidae",
"Mionectes": "Rhynchocyclidae",
"Leptopogon": "Rhynchocyclidae",
"Corythopis": "Rhynchocyclidae",
"Phylloscartes": "Rhynchocyclidae",
"Tolmomyias": "Rhynchocyclidae",
"Todirostrum": "Rhynchocyclidae",
"Poecilotriccus": "Rhynchocyclidae",
"Myiornis": "Rhynchocyclidae",
"Hemitriccus": "Rhynchocyclidae",
"Hirundinea": "Tyrannidae",
"Euscarthmus": "Tyrannidae",
"Tyranniscus": "Tyrannidae",
"Camptostoma": "Tyrannidae",
"Elaenia": "Tyrannidae",
"Myiopagis": "Tyrannidae",
"Capsiempis": "Tyrannidae",
"Phyllomyias": "Tyrannidae",
"Culicivora": "Tyrannidae",
"Polystictus": "Tyrannidae",
"Pseudocolopteryx": "Tyrannidae",
"Serpophaga": "Tyrannidae",
"Attila": "Tyrannidae",
"Legatus": "Tyrannidae",
"Ramphotrigon": "Tyrannidae",
"Myiarchus": "Tyrannidae",
"Sirystes": "Tyrannidae",
"Pitangus": "Tyrannidae",
"Machetornis": "Tyrannidae",
"Myiodynastes": "Tyrannidae",
"Megarynchus": "Tyrannidae",
"Myiozetetes": "Tyrannidae",
"Tyrannus": "Tyrannidae",
"Griseotyrannus": "Tyrannidae",
"Empidonomus": "Tyrannidae",
"Conopias": "Tyrannidae",
"Colonia": "Tyrannidae",
"Arundinicola": "Tyrannidae",
"Fluvicola": "Tyrannidae",
"Pyrocephalus": "Tyrannidae",
"Muscipipra": "Tyrannidae",
"Gubernetes": "Tyrannidae",
"Heteroxolmis": "Tyrannidae",
"Myiophobus": "Tyrannidae",
"Cnemotriccus": "Tyrannidae",
"Lathrotriccus": "Tyrannidae",
"Contopus": "Tyrannidae",
"Satrapa": "Tyrannidae",
"Lessonia": "Tyrannidae",
"Hymenops": "Tyrannidae",
"Knipolegus": "Tyrannidae",
"Xolmis": "Tyrannidae",
"Nengetus": "Tyrannidae",
"Cyclarhis": "Vireonidae",
"Hylophilus": "Vireonidae",
"Vireo": "Vireonidae",
"Cyanocorax": "Corvidae",
"Pygochelidon": "Hirundinidae",
"Alopochelidon": "Hirundinidae",
"Stelgidopteryx": "Hirundinidae",
"Progne": "Hirundinidae",
"Tachycineta": "Hirundinidae",
"Riparia": "Hirundinidae",
"Hirundo": "Hirundinidae",
"Petrochelidon": "Hirundinidae",
"Troglodytes": "Troglodytidae",
"Cistothorus": "Troglodytidae",
"Campylorhynchus": "Troglodytidae",
"Cantorchilus": "Troglodytidae",
"Ramphocaenus": "Polioptilidae",
"Polioptila": "Polioptilidae",
"Catharus": "Turdidae",
"Turdus": "Turdidae",
"Mimus": "Mimidae",
"Sturnus": "Sturnidae",
"Estrilda": "Estrildidae",
"Passer": "Passeridae",
"Anthus": "Motacillidae",
"Spinus": "Fringillidae",
"Serinus": "Fringillidae",
"Cyanophonia": "Fringillidae",
"Chlorophonia": "Fringillidae",
"Euphonia": "Fringillidae",
"Ammodramus": "Passerellidae",
"Arremon": "Passerellidae",
"Zonotrichia": "Passerellidae",
"Leistes": "Icteridae",
"Cacicus": "Icteridae",
"Psarocolius": "Icteridae",
"Icterus": "Icteridae",
"Molothrus": "Icteridae",
"Amblyramphus": "Icteridae",
"Gnorimopsar": "Icteridae",
"Agelaioides": "Icteridae",
"Agelasticus": "Icteridae",
"Chrysomus": "Icteridae",
"Xanthopsar": "Icteridae",
"Pseudoleistes": "Icteridae",
"Geothlypis": "Parulidae",
"Setophaga": "Parulidae",
"Myiothlypis": "Parulidae",
"Basileuterus": "Parulidae",
"Orthogonys": "Mitrospingidae",
"Piranga": "Cardinalidae",
"Habia": "Cardinalidae",
"Amaurospiza": "Cardinalidae",
"Cyanoloxia": "Cardinalidae",
"Orchesticus": "Thraupidae",
"Nemosia": "Thraupidae",
"Embernagra": "Thraupidae",
"Emberizoides": "Thraupidae",
"Rhopospina": "Thraupidae",
"Hemithraupis": "Thraupidae",
"Tersina": "Thraupidae",
"Cyanerpes": "Thraupidae",
"Dacnis": "Thraupidae",
"Saltator": "Thraupidae",
"Coereba": "Thraupidae",
"Asemospiza": "Thraupidae",
"Volatinia": "Thraupidae",
"Trichothraupis": "Thraupidae",
"Loriotus": "Thraupidae",
"Coryphospingus": "Thraupidae",
"Tachyphonus": "Thraupidae",
"Ramphocelus": "Thraupidae",
"Sporophila": "Thraupidae",
"Poospiza": "Thraupidae",
"Thlypopsis": "Thraupidae",
"Castanozoster": "Thraupidae",
"Donacospiza": "Thraupidae",
"Microspingus": "Thraupidae",
"Conirostrum": "Thraupidae",
"Sicalis": "Thraupidae",
"Haplospiza": "Thraupidae",
"Pipraeidea": "Thraupidae",
"Rauenia": "Thraupidae",
"Stephanophorus": "Thraupidae",
"Cissopis": "Thraupidae",
"Schistochlamys": "Thraupidae",
"Paroaria": "Thraupidae",
"Thraupis": "Thraupidae",
"Stilpnia": "Thraupidae",
"Tangara": "Thraupidae",
"Chlorophanes": "Thraupidae",
            };
            const ordem = ordemMap[genus] || "Passeriformes";
            const familia = familiaMap[genus] || "Desconhecida";
            // Para subfamília, podemos tentar inferir de nomes conhecidos
            let subfamilia = "";
            if (familia === "Accipitridae") {
                if (genus === "Elanus") subfamilia = "Elaninae";
                else if (["Chondrohierax", "Leptodon", "Elanoides"].includes(genus)) subfamilia = "Gypaetinae";
                else if (["Spizaetus", "Rostrhamus", "Harpagus", "Ictinia", "Circus", "Hieraspiza", "Accipiter", "Geranospiza", "Heterospizias", "Amadonastur", "Urubitinga", "Rupornis", "Parabuteo", "Geranoaetus", "Pseudastur", "Buteo"].includes(genus)) subfamilia = "Accipitrinae";
            } else if (familia === "Anatidae") {
                if (genus === "Dendrocygna") subfamilia = "Dendrocygninae";
                else if (genus === "Coscoroba") subfamilia = "Anserinae";
                else subfamilia = "Anatinae";
            } else if (familia === "Cuculidae") {
                if (genus === "Guira" || genus === "Crotophaga") subfamilia = "Crotophaginae";
                else if (genus === "Tapera" || genus === "Dromococcyx") subfamilia = "Taperinae";
                else if (genus === "Neomorphus") subfamilia = "Neomorphinae";
                else subfamilia = "Cuculinae";
            } else if (familia === "Falconidae") {
                if (genus === "Herpetotheres" || genus === "Micrastur") subfamilia = "Herpetotherinae";
                else if (genus === "Caracara" || genus === "Milvago") subfamilia = "Caracarinae";
                else if (genus === "Falco") subfamilia = "Falconinae";
            } else if (familia === "Psittacidae") {
                subfamilia = "Arinae";
            } else if (familia === "Thamnophilidae") {
                if (genus === "Terenura") subfamilia = "Euchrepomidinae";
                else subfamilia = "Thamnophilinae";
            } else if (familia === "Rhinocryptidae") {
                if (genus === "Psilorhamphus" || genus === "Merulaxis") subfamilia = "Rhinocryptinae";
                else if (genus === "Eleoscytalopus" || genus === "Scytalopus") subfamilia = "Scytalopodinae";
            } else if (familia === "Dendrocolaptidae") {
                if (genus === "Sittasomus" || genus === "Dendrocincla") subfamilia = "Sittasominae";
                else subfamilia = "Dendrocolaptinae";
            } else if (familia === "Furnariidae") {
                if (genus === "Furnarius" || genus === "Lochmias" || genus === "Phleocryptes" || genus === "Limnornis" || genus === "Cinclodes") subfamilia = "Furnariinae";
                else if (genus === "Anabazenops" || genus === "Cichlocolaptes" || genus === "Heliobletus" || genus === "Philydor" || genus === "Anabacerthia" || genus === "Syndactyla" || genus === "Dendroma" || genus === "Clibanornis" || genus === "Automolus") subfamilia = "Philydorinae";
                else if (genus === "Leptasthenura" || genus === "Phacellodomus" || genus === "Anumbius" || genus === "Limnoctites" || genus === "Cranioleuca" || genus === "Spartonoica" || genus === "Certhiaxis" || genus === "Schoeniophylax" || genus === "Synallaxis") subfamilia = "Synallaxiinae";
            } else if (familia === "Pipridae") {
                if (genus === "Ilicura") subfamilia = "Ilicurinae";
                else if (genus === "Chiroxiphia" || genus === "Manacus") subfamilia = "Piprinae";
            } else if (familia === "Cotingidae") {
                if (genus === "Carpornis") subfamilia = "Rupicolinae";
                else if (genus === "Pyroderus" || genus === "Lipaugus") subfamilia = "Cephalopterinae";
                else if (genus === "Procnias" || genus === "Phibalura" || genus === "Cotinga") subfamilia = "Cotinginae";
            } else if (familia === "Tityridae") {
                if (genus === "Schiffornis") subfamilia = "Schiffornithinae";
                else if (genus === "Tityra" || genus === "Pachyramphus") subfamilia = "Tityrinae";
            } else if (familia === "Rhynchocyclidae") {
                if (genus === "Mionectes" || genus === "Leptopogon" || genus === "Corythopis") subfamilia = "Pipromorphinae";
                else if (genus === "Phylloscartes" || genus === "Tolmomyias") subfamilia = "Rhynchocyclinae";
                else if (genus === "Todirostrum" || genus === "Poecilotriccus" || genus === "Myiornis" || genus === "Hemitriccus") subfamilia = "Todirostrinae";
            } else if (familia === "Tyrannidae") {
                if (genus === "Hirundinea") subfamilia = "Hirundineinae";
                else if (["Euscarthmus", "Tyranniscus", "Camptostoma", "Elaenia", "Myiopagis", "Capsiempis", "Phyllomyias", "Culicivora", "Polystictus", "Pseudocolopteryx", "Serpophaga"].includes(genus)) subfamilia = "Elaeniinae";
                else if (["Attila", "Legatus", "Ramphotrigon", "Myiarchus", "Sirystes", "Pitangus", "Machetornis", "Myiodynastes", "Megarynchus", "Myiozetetes", "Tyrannus", "Griseotyrannus", "Empidonomus", "Conopias"].includes(genus)) subfamilia = "Tyranninae";
                else if (["Colonia", "Arundinicola", "Fluvicola", "Pyrocephalus", "Muscipipra", "Gubernetes", "Heteroxolmis", "Myiophobus", "Cnemotriccus", "Lathrotriccus", "Contopus", "Satrapa", "Lessonia", "Hymenops", "Knipolegus", "Xolmis", "Nengetus"].includes(genus)) subfamilia = "Fluvicolinae";
            } else if (familia === "Fringillidae") {
                if (genus === "Spinus") subfamilia = "Carduelinae";
                else if (genus === "Cyanophonia" || genus === "Chlorophonia" || genus === "Euphonia") subfamilia = "Euphoniinae";
            } else if (familia === "Icteridae") {
                if (genus === "Leistes") subfamilia = "Sturnellinae";
                else if (genus === "Cacicus" || genus === "Psarocolius") subfamilia = "Cacicinae";
                else if (genus === "Icterus") subfamilia = "Icterinae";
                else if (["Molothrus", "Amblyramphus", "Gnorimopsar", "Agelaioides", "Agelasticus", "Chrysomus", "Xanthopsar", "Pseudoleistes"].includes(genus)) subfamilia = "Agelaiinae";
            } else if (familia === "Thraupidae") {
                if (genus === "Orchesticus") subfamilia = "Orchesticinae";
                else if (genus === "Nemosia") subfamilia = "Nemosiinae";
                else if (genus === "Embernagra" || genus === "Emberizoides") subfamilia = "Emberizoidinae";
                else if (genus === "Rhopospina") subfamilia = "Porphyrospizinae";
                else if (genus === "Hemithraupis") subfamilia = "Hemithraupinae";
                else if (["Tersina", "Cyanerpes", "Dacnis"].includes(genus)) subfamilia = "Dacninae";
                else if (genus === "Saltator") subfamilia = "Saltatorinae";
                else if (genus === "Coereba" || genus === "Asemospiza") subfamilia = "Coerebinae";
                else if (["Volatinia", "Trichothraupis", "Loriotus", "Coryphospingus", "Tachyphonus", "Ramphocelus"].includes(genus)) subfamilia = "Tachyphoninae";
                else if (genus === "Sporophila") subfamilia = "Sporophilinae";
                else if (["Poospiza", "Thlypopsis", "Castanozoster", "Donacospiza", "Microspingus"].includes(genus)) subfamilia = "Poospizinae";
                else if (["Conirostrum", "Sicalis", "Haplospiza"].includes(genus)) subfamilia = "Diglossinae";
                else if (["Pipraeidea", "Rauenia", "Stephanophorus", "Cissopis", "Schistochlamys", "Paroaria", "Thraupis", "Stilpnia", "Tangara", "Chlorophanes"].includes(genus)) subfamilia = "Thraupinae";
            }
            speciesInfo[nomeCientifico] = {
                ordem: ordem,
                familia: familia,
                subfamilia: subfamilia,
                nomePopular: nomePopular,
                sc: item.sc,
                icmbio: item.icmbio,
                iucn: item.iucn
            };
        });

        // Construir BIRD_DATABASE a partir de speciesInfo
        // CORRIGIDO: exposto globalmente via window para ser acessível em outros <script>
        window.BIRD_DATABASE = [];
        const BIRD_DATABASE = window.BIRD_DATABASE;
        for (let [sciName, info] of Object.entries(speciesInfo)) {
            BIRD_DATABASE.push({
                scientificName: sciName,
                commonName: info.nomePopular,
                ordem: info.ordem,
                familia: info.familia,
                subfamilia: info.subfamilia,
                filo: "Chordata",
                classe: "Aves"
            });
        }

        // ==================== FILOGENIA ATUALIZADA (COM TODOS OS TÁXONS) ====================
        const avesPhylogeny = {
            name: "AVES",
            taxonLevel: "classe",
            children: [
                {
                    name: "Palaeognathae",
                    children: [
                        { name: "Struthioniformes", taxonLevel: "ordem" },
                        { name: "Rheiformes", taxonLevel: "ordem" },
                        { name: "Tinamiformes", taxonLevel: "ordem" }
                    ]
                },
                {
                    name: "Neognathae",
                    children: [
                        {
                            name: "Galloanserae",
                            children: [
                                { name: "Galliformes", taxonLevel: "ordem" },
                                { name: "Anseriformes", taxonLevel: "ordem" }
                            ]
                        },
                        {
                            name: "Neoaves",
                            children: [
                                {
                                    name: "Strisores",
                                    children: [
                                        { name: "Caprimulgiformes", taxonLevel: "ordem" },
                                        { name: "Apodiformes", taxonLevel: "ordem" }
                                    ]
                                },
                                {
                                    name: "Columbaves",
                                    children: [
                                        {
                                            name: "Otidimorphae",
                                            children: [
                                                { name: "Musophagiformes", taxonLevel: "ordem" },
                                                { name: "Otidiformes", taxonLevel: "ordem" },
                                                { name: "Cuculiformes", taxonLevel: "ordem" },
                                                { name: "Opisthocomiformes", taxonLevel: "ordem" } // Hoatzin — Prum 2015
                                            ]
                                        },
                                        {
                                            name: "Columbimorphae",
                                            children: [
                                                { name: "Columbiformes", taxonLevel: "ordem" },
                                                { name: "Pterocliformes", taxonLevel: "ordem" },
                                                { name: "Mesitornithiformes", taxonLevel: "ordem" }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    name: "Gruimorphae",
                                    children: [
                                        { name: "Gruiformes", taxonLevel: "ordem" },
                                        { name: "Charadriiformes", taxonLevel: "ordem" }
                                    ]
                                },
                                {
                                    name: "Aequorlitornithes",
                                    children: [
                                        { name: "Eurypygiformes", taxonLevel: "ordem" },   // Prum 2015 — Aequorlitornithes
                                        { name: "Phaethontiformes", taxonLevel: "ordem" }, // Prum 2015 — Aequorlitornithes
                                        { name: "Podicipediformes", taxonLevel: "ordem" },
                                        { name: "Phoenicopteriformes", taxonLevel: "ordem" },
                                        { name: "Pelecaniformes", taxonLevel: "ordem" },
                                        { name: "Ciconiiformes", taxonLevel: "ordem" },
                                        { name: "Suliformes", taxonLevel: "ordem" },
                                        { name: "Procellariiformes", taxonLevel: "ordem" },
                                        { name: "Sphenisciformes", taxonLevel: "ordem" }
                                    ]
                                },
                                {
                                    name: "Accipitrimorphae",
                                    children: [
                                        { name: "Cathartiformes", taxonLevel: "ordem" },
                                        { name: "Accipitriformes", taxonLevel: "ordem" }
                                    ]
                                },
                                {
                                    name: "Falconimorphae",
                                    children: [
                                        { name: "Falconiformes", taxonLevel: "ordem" }
                                    ]
                                },
                                {
                                    name: "Telluraves",
                                    children: [
                                        { name: "Strigiformes", taxonLevel: "ordem" },
                                        { name: "Steatornithiformes", taxonLevel: "ordem" },
                                        { name: "Nyctibiiformes", taxonLevel: "ordem" },
                                        {
                                            name: "Coraciimorphae",
                                            children: [
                                                { name: "Coraciiformes", taxonLevel: "ordem" },
                                                { name: "Piciformes", taxonLevel: "ordem" },
                                                { name: "Trogoniformes", taxonLevel: "ordem" },
                                                { name: "Galbuliformes", taxonLevel: "ordem" }
                                            ]
                                        },
                                        {
                                            name: "Psittacopasserae",
                                            children: [
                                                { name: "Psittaciformes", taxonLevel: "ordem" },
                                                { name: "Passeriformes", taxonLevel: "ordem" }
                                            ]
                                        },
                                        { name: "Cariamiformes", taxonLevel: "ordem" }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };
        // Expõe a filogenia globalmente para uso no relatório
        window.avesPhylogeny = avesPhylogeny;

        // ==================== VARIÁVEIS GLOBAIS ====================
        let debugLogs = [];
        let currentTreeType = 'hierarchical';
        let currentTreeData = null;
        let currentMode = 'basic';
        let genealogicalZoom = null;
        let showPopularNames = false; // false = só nome científico; true = com nome popular
        let genealogicalSvg = null;
        let genealogicalViewMode = 'full'; // 'full' ou 'user'
        let treeUpdateTimer = null;
        const columnsConfig = [
    { id: 'filo', label: 'Filo', selected: true, color: '#3498db' },
    { id: 'classe', label: 'Classe', selected: true, color: '#2ecc71' },
    { id: 'ordem', label: 'Ordem', selected: true, color: '#9b59b6' },
    { id: 'familia', label: 'Família', selected: true, color: '#e74c3c' },
    { id: 'subfamilia', label: 'Subfamília', selected: true, color: '#1abc9c' },
    { id: 'genero', label: 'Gênero', selected: true, color: '#f39c12' },   // NOVO
    { id: 'especie', label: 'Espécie', selected: true, color: '#e67e22' }  // NOVO
];

        // Registrar o plugin de datalabels
    Chart.register(ChartDataLabels);    

// Função para buscar informações da espécie no banco de dados (para comparação)
function getSpeciesInfo(speciesName) {
    const match = BIRD_DATABASE.find(b => b.scientificName.toLowerCase() === speciesName.toLowerCase());
    if (match) {
        return {
            popular: match.commonName,
            nome: match.scientificName
        };
    }
    // Se não encontrar, retorna o nome científico como popular e o nome como está
    return {
        popular: speciesName,
        nome: speciesName
    };
}
        // Gráficos de status de conservação
        let chartScPie, chartIcmbioPie, chartIucnPie;
        // Paleta de cores inspirada na natureza (20 cores)
const natureColors = [
    '#2E7D32', '#558B2F', '#6A994E', '#A7C957', '#F2E8CF',
    '#BC6C25', '#A47148', '#8B5A2B', '#5F3A1C', '#283618',
    '#3D5A80', '#98C1D9', '#E0FAFF', '#E9C46A', '#F4A261',
    '#E76F51', '#D4A373', '#B5838D', '#6D6875', '#52796F'
];

// Gera cor determinística em tons naturais a partir de uma string
function getNaturalColorFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    const saturation = 40 + (Math.abs(hash * 2) % 30); // 40-70%
    const lightness = 50 + (Math.abs(hash * 3) % 20);  // 50-70%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function generateColorMap(categories) {
    const colorMap = {};
    categories.forEach((cat, index) => {
        if (index < natureColors.length) {
            colorMap[cat] = natureColors[index];
        } else {
            colorMap[cat] = getNaturalColorFromString(cat);
        }
    });
    return colorMap;
}

function generateColorMap(categories) {
    const colorMap = {};
    categories.forEach((cat, index) => {
        if (index < natureColors.length) {
            colorMap[cat] = natureColors[index];
        } else {
            colorMap[cat] = getNaturalColorFromString(cat);
        }
    });
    return colorMap;
}
        let currentConservationSort = 'alpha';
        // Variáveis para os gráficos de conservação (Ordens e Famílias)
        let chartOrdemBar, chartOrdemPie, chartFamiliaBar, chartFamiliaPie;

        // Elementos DOM
        const tableBody = document.getElementById('table-body');
        const addRowBtn = document.getElementById('add-row');
        const treeDisplay = document.getElementById('tree-display');
        const importDataTextarea = document.getElementById('import-data');
        const processImportBtn = document.getElementById('process-import');
        const importExampleBtn = document.getElementById('import-example');
        const clearImportBtn = document.getElementById('clear-import');
        const lineCountSpan = document.getElementById('line-count');
        const columnCountSpan = document.getElementById('column-count');
        const treeTypeButtons = document.querySelectorAll('.tree-type-btn');
        const downloadImageBtn = document.getElementById('download-image');
        const treeContainer = document.getElementById('tree-container');
        const debugVisualizerBtn = document.getElementById('debug-visualizer');

        // ==================== FUNÇÕES DE DEBUG ====================
        function logDebug(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            debugLogs.push({ timestamp, message, type });
            console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
            updateDebugPanel();
        }
        function updateDebugPanel() {
            const debugContent = document.getElementById('debug-content');
            if (debugContent) {
                let html = '';
                debugLogs.forEach(log => {
                    html += `<div class="debug-${log.type}">[${log.timestamp}] ${log.message}</div>`;
                });
                debugContent.innerHTML = html;
                debugContent.scrollTop = debugContent.scrollHeight;
            }
        }
        function toggleDebugPanel() {
            const debugPanel = document.getElementById('debug-panel');
            if (!debugPanel) return;
            debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
            if (debugPanel.style.display === 'block') updateDebugPanel();
        }
        if (debugVisualizerBtn) debugVisualizerBtn.addEventListener('click', toggleDebugPanel);

        const modeBasic = document.getElementById('mode-basic');
        const modeAdvanced = document.getElementById('mode-advanced');
        const instructionsDiv = document.getElementById('instructions-text');
        const taxoWarningsDiv = document.getElementById('taxo-warnings-container');
        const conservationTableBody = document.getElementById('conservation-table-body');
        const loadConservationBtn = document.getElementById('load-conservation-data');
        const toggleTableBtn = document.getElementById('toggle-conservation-table');
        const conservationContainer = document.getElementById('conservation-table-container');
        const genealogicalViewSelector = document.getElementById('genealogical-view-selector');
        const viewFullBtn = document.getElementById('view-full');
        const viewUserBtn = document.getElementById('view-user');
        const querySpeciesBtn = document.getElementById('query-species-btn');
        const queryModal = document.getElementById('query-modal');
        const closeQueryModal = document.getElementById('close-query-modal');
        const querySearch = document.getElementById('query-search');
        const queryTableBody = document.getElementById('query-table-body');
        const clearDataBtn = document.getElementById('clear-data');
        const moreInfoBtn = document.getElementById('more-info-btn');
        const closeMoreInfo = document.getElementById('close-more-info');
        const moreInfoModal = document.getElementById('more-info-modal');
        const moreInfoTable = document.getElementById('more-info-table');

        // ==================== FUNÇÕES DE DEBUG ====================
        function logDebug(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            debugLogs.push({ timestamp, message, type });
            console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
            updateDebugPanel();
        }
        function updateDebugPanel() {
            const debugContent = document.getElementById('debug-content');
            if (debugContent) {
                let html = '';
                debugLogs.forEach(log => {
                    html += `<div class="debug-${log.type}">[${log.timestamp}] ${log.message}</div>`;
                });
                debugContent.innerHTML = html;
                debugContent.scrollTop = debugContent.scrollHeight;
            }
        }
        function toggleDebugPanel() {
            const debugPanel = document.getElementById('debug-panel');
            debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
            if (debugPanel.style.display === 'block') updateDebugPanel();
        }
        debugVisualizerBtn.addEventListener('click', toggleDebugPanel);

        // ==================== INICIALIZAÇÃO DOS COMPONENTES ====================
        function initTreeTypeSelector() {
            treeTypeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    treeTypeButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentTreeType = btn.dataset.type;
                    if (currentTreeType === 'genealogical') {
                        genealogicalViewSelector.style.display = 'flex';
                    } else {
                        genealogicalViewSelector.style.display = 'none';
                    }
                    scheduleTreeUpdate();
                });
            });
        }

        // Modal de fontes (mantido para compatibilidade; fontes agora na aba Configurações)
        const showSourcesBtn = document.getElementById('show-sources');
        const sourcesModal   = document.getElementById('sources-modal');
        const closeModalButtons = document.querySelectorAll('.close-modal');
        if (showSourcesBtn && sourcesModal) showSourcesBtn.addEventListener('click', () => sourcesModal.style.display = 'block');
        closeModalButtons.forEach(btn => btn.addEventListener('click', () => { if (sourcesModal) sourcesModal.style.display = 'none'; }));
        window.addEventListener('click', (event) => {
            if (sourcesModal && event.target === sourcesModal) sourcesModal.style.display = 'none';
        });

        // Botões de visualização Filogenética
        viewFullBtn.addEventListener('click', () => {
            viewFullBtn.classList.add('active');
            viewUserBtn.classList.remove('active');
            genealogicalViewMode = 'full';
            scheduleTreeUpdate();
        });
        viewUserBtn.addEventListener('click', () => {
            viewUserBtn.classList.add('active');
            viewFullBtn.classList.remove('active');
            genealogicalViewMode = 'user';
            scheduleTreeUpdate();
        });

        // Fechar modal de comparação
        document.getElementById('close-compare-modal') &&
        document.getElementById('close-compare-modal').addEventListener('click', () => {
        document.getElementById('compare-modal').style.display = 'none';
        });

        // ==================== INSTRUÇÕES DINÂMICAS ====================
        function updateInstructions() {
            if (currentMode === 'basic') {
                instructionsDiv.innerHTML = `
                    <p><strong>Instruções de Importação (Modo Básico):</strong></p>
                    <ul>
                        <li>Digite o nome científico ou popular da espécie no campo "Gênero/Espécie".</li>
                        <li>Enquanto digita, sugestões aparecerão automaticamente.</li>
                        <li>Use as setas ↑ ↓ e a tecla TAB para completar.</li>
                        <li>Os campos taxonômicos (Filo, Classe, Ordem, Família, Subfamília) serão preenchidos automaticamente.</li>
                        <li>Você também pode colar uma lista de nomes científicos (um por linha) na área de importação.</li>
                    </ul>
                `;
            } else {
                instructionsDiv.innerHTML = `
                    <p><strong>Instruções de Importação (Modo Avançado):</strong></p>
                    <ul>
                        <li>Cole dados tabulares copiados de Excel, Google Sheets ou arquivos de texto.</li>
                        <li>Os dados devem conter colunas na ordem: Filo, Classe, Ordem, Família, Subfamília, Gênero/Espécie.</li>
                        <li>Separadores aceitos: tabulação (recomendado), vírgula ou espaço.</li>
                    </ul>
                `;
            }
        }

        // ==================== MODO BÁSICO/AVANÇADO ====================
        function setMode(mode) {
            currentMode = mode;
            const table = document.getElementById('taxonomy-table');
            if (mode === 'basic') {
                table.classList.add('basic-mode');
                modeBasic.classList.add('active');
                modeAdvanced.classList.remove('active');
            } else {
                table.classList.remove('basic-mode');
                modeAdvanced.classList.add('active');
                modeBasic.classList.remove('active');
            }
            updateInstructions();
            logDebug(`Modo alterado para: ${mode}`);
        }
        modeBasic.addEventListener('click', () => setMode('basic'));
        modeAdvanced.addEventListener('click', () => setMode('advanced'));

        // ==================== FUNÇÕES DA TABELA ====================
        function addTableRow(data = { filo: "", classe: "", ordem: "", familia: "", subfamilia: "", generoEspecie: "" }) {
            const row = document.createElement('tr');
            const fields = ['filo', 'classe', 'ordem', 'familia', 'subfamilia', 'generoEspecie'];
            fields.forEach(field => {
                const cell = document.createElement('td');
                if (field !== 'generoEspecie') cell.classList.add('taxo-col');
                else cell.classList.add('species-col');
                const input = document.createElement('input');
                input.type = "text";
                input.placeholder = `Digite ${field}`;
                input.value = data[field] || "";
                input.dataset.field = field;
                if (field === 'generoEspecie' && currentMode === 'basic') {
                    input.addEventListener('input', handleAutocomplete);
                    input.addEventListener('keydown', handleAutocompleteKeydown);
                    input.addEventListener('blur', () => setTimeout(() => hideAutocomplete(), 200));
                }
                input.addEventListener('input', scheduleTreeUpdate);
                cell.appendChild(input);
                row.appendChild(cell);
            });
            const actionsCell = document.createElement('td');
            const removeBtn = document.createElement('button');
            removeBtn.textContent = "Remover";
            removeBtn.classList.add('delete-btn');
            removeBtn.addEventListener('click', () => {
                row.remove();
                updateImportStats();
                scheduleTreeUpdate();
                logDebug('Linha removida');
            });
            actionsCell.appendChild(removeBtn);
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
            updateImportStats();
            scheduleTreeUpdate();
        }

        function updateImportStats() {
            const rows = tableBody.querySelectorAll('tr');
            lineCountSpan.textContent = `${rows.length} linhas na tabela`;
        }

        // ==================== AUTOCOMPLETE ====================
        let autocompleteDiv = null;
        let currentInput = null;
        let selectedSuggestionIndex = -1;

        // Stopwords de nomes populares de aves (preposições/artigos que variam)
        const _STOP = new Set(['de','do','da','dos','das','o','a','os','as','e','em','no','na','nos','nas','um','uma']);

        function normalizeForSearch(str) {
            if (!str) return '';
            return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[-\s]+/g, ' ').trim();
        }

        // Normalização fonética leve para erros comuns em nomes populares de aves
        function phoneticNorm(str) {
            return str
                // vogais finais confundidas: u→o, i→e em terminações
                .replace(/u\b/g, 'o')          // senhaçu → senhaço, sabiú → sabio
                .replace(/([aeiou])s\b/g, '$1') // plural opcional: tucanos → tucano
                // consoantes comuns confundidas
                .replace(/ss/g, 's')
                .replace(/rr/g, 'r')
                .replace(/nh/g, 'n')            // sanhaco→sanaco (permite achar via Lev)
                .replace(/lh/g, 'l')
                .replace(/ch/g, 'x')
                .replace(/qu/g, 'k')
                .replace(/c([ei])/g, 's$1')    // cegonha→segonha
                .replace(/ç/g, 's')
                .replace(/x/g, 's')
                .replace(/ph/g, 'f')
                .replace(/y/g, 'i')
                .replace(/w/g, 'v')
                // vogais confundidas
                .replace(/ae/g, 'e')
                .replace(/oe/g, 'e')
                .replace(/ao/g, 'a')
                .replace(/(\w)\1+/g, '$1');    // letras dobradas → simples
        }

        // Remove stopwords de uma string já normalizada
        function stripStops(norm) {
            return norm.split(' ').filter(w => w && !_STOP.has(w)).join(' ');
        }

        function buildSearchIndex() {
            const index = [];
            BIRD_DATABASE.forEach(b => {
                const nc  = normalizeForSearch(b.commonName);
                const ns  = normalizeForSearch(b.scientificName);
                index.push({
                    text: `${b.scientificName} – ${b.commonName}`,
                    normalized: normalizeForSearch(b.scientificName + ' ' + b.commonName),
                    scientific: b.scientificName,
                    common: b.commonName,
                    nc,
                    ns,
                    ncStripped: stripStops(nc),    // sem artigos/preposições
                    ncPhonetic: phoneticNorm(stripStops(nc)), // fonético
                    data: b
                });
            });
            return index;
        }
        const searchIndex = buildSearchIndex();

        // ── Levenshtein ──────────────────────────────────────────────────────────
        function levenshtein(a, b) {
            const m = a.length, n = b.length;
            const dp = Array.from({length: m+1}, (_, i) => [i, ...Array(n).fill(0)]);
            for (let j = 0; j <= n; j++) dp[0][j] = j;
            for (let i = 1; i <= m; i++)
                for (let j = 1; j <= n; j++)
                    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]
                        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
            return dp[m][n];
        }
        function maxErrors(len) {
            if (len <= 4) return 0;
            if (len <= 7) return 1;
            if (len <= 11) return 2;
            return 3;
        }
        function fuzzyWordMatch(a, b) {
            if (a === b) return true;
            return levenshtein(a, b) <= maxErrors(Math.max(a.length, b.length));
        }
        function allWordsFuzzy(normInput, normTarget) {
            const iw = normInput.split(' ').filter(Boolean);
            const tw = normTarget.split(' ').filter(Boolean);
            return iw.every(i => tw.some(t => fuzzyWordMatch(i, t) || t.startsWith(i) || i.startsWith(t)));
        }

        // ── Scoring de relevância (menor = melhor) ───────────────────────────────
        // 0: match exato (qualquer nome)
        // 1: nome popular começa com o termo
        // 2: nome científico começa com o termo
        // 3: palavra do nome popular começa com o termo
        // 4: termo aparece em qualquer posição do nome popular
        // 5: termo aparece em qualquer posição do nome científico
        // 5.5: match exato após remover stopwords (do/de/da…)
        // 5.8: match exato fonético
        // 6: fuzzy por palavras
        // 6.5: fuzzy por palavras sem stopwords
        // 6.8: fuzzy fonético
        // 7+: Levenshtein
        function scoreCandidate(item, norm) {
            const { nc, ns, ncStripped, ncPhonetic } = item;
            if (nc === norm || ns === norm) return { score: 0, pos: 0 };
            if (nc.startsWith(norm))  return { score: 1, pos: 0 };
            if (ns.startsWith(norm))  return { score: 2, pos: 0 };
            // Palavra do nome popular que começa com o termo
            const popWord = nc.split(' ').findIndex(w => w.startsWith(norm));
            if (popWord !== -1) return { score: 3, pos: popWord };
            // Substring em nome popular
            const idxC = nc.indexOf(norm);
            if (idxC !== -1) return { score: 4, pos: idxC };
            // Substring em nome científico
            const idxS = ns.indexOf(norm);
            if (idxS !== -1) return { score: 5, pos: idxS };

            // ── Sem stopwords ──────────────────────────────────────────────────
            const normStripped = stripStops(norm);
            if (normStripped && ncStripped) {
                if (ncStripped === normStripped) return { score: 5.5, pos: 0 };
                if (ncStripped.startsWith(normStripped)) return { score: 5.6, pos: 0 };
                if (ncStripped.indexOf(normStripped) !== -1) return { score: 5.7, pos: ncStripped.indexOf(normStripped) };
                if (allWordsFuzzy(normStripped, ncStripped)) return { score: 6.5, pos: 0 };
            }

            // ── Fonético ───────────────────────────────────────────────────────
            const normPhonetic = phoneticNorm(normStripped || norm);
            if (normPhonetic && ncPhonetic) {
                if (ncPhonetic === normPhonetic) return { score: 5.8, pos: 0 };
                if (allWordsFuzzy(normPhonetic, ncPhonetic)) return { score: 6.8, pos: 0 };
            }

            // Fuzzy por palavras (aceita pequenos erros)
            if (allWordsFuzzy(norm, nc) || allWordsFuzzy(norm, ns)) return { score: 6, pos: 0 };
            // Levenshtein completo (último recurso)
            const dist = Math.min(levenshtein(norm, nc), levenshtein(norm, ns));
            const thr = maxErrors(Math.max(norm.length, Math.min(nc.length, ns.length)));
            if (dist <= thr) return { score: 7 + dist, pos: 0 };
            return null;
        }

        // ── Candidatos ranqueados para autocomplete ──────────────────────────────
        function fuzzySearchCandidates(norm, limit = 10) {
            if (!norm || norm.length < 2) return [];
            const results = [];
            searchIndex.forEach(item => {
                const r = scoreCandidate(item, norm);
                if (r) results.push({ item, score: r.score, pos: r.pos });
            });
            results.sort((a, b) => a.score !== b.score ? a.score - b.score : a.pos - b.pos);
            const seen = new Set();
            return results.filter(r => {
                if (seen.has(r.item.scientific)) return false;
                seen.add(r.item.scientific);
                return true;
            }).slice(0, limit).map(r => r.item);
        }

        // ── findBirdFuzzy: motor usado no processamento de importação ────────────
        // Retorna { bird, isFuzzy, score, confident }
        // confident = true → match seguro (score <= 5, palavra exata encontrada)
        // confident = false → match duvidoso (score 6+), deve ir para correção
        function findBirdFuzzy(input) {
            const norm = normalizeForSearch(input);
            if (!norm) return null;

            // Extra: também testa cada palavra isolada do input contra nomes populares
            // Isso resolve "reindera" → "rendeira" melhor que word-prefix "rei"→"urubu-rei"
            let best = null;
            let bestScore = Infinity;

            searchIndex.forEach(item => {
                let r = scoreCandidate(item, norm);

                // Penalidade: se o input é uma única palavra e apenas uma sub-palavra do
                // nome popular começa com ela (score 3), mas o tamanho é muito diferente,
                // aumentar o score para evitar falsos positivos curtos ("rei" → "urubu-rei")
                if (r && r.score === 3) {
                    const inputWords = norm.split(' ');
                    if (inputWords.length === 1) {
                        // verifica se a palavra do input é muito mais curta que a palavra que acertou
                        const matchWord = item.nc.split(' ').find(w => w.startsWith(norm));
                        if (matchWord && norm.length < matchWord.length * 0.7) {
                            r = { score: 8, pos: r.pos }; // penalizar match parcial curto
                        }
                    }
                }

                if (r && r.score < bestScore) { bestScore = r.score; best = item; }
            });

            if (!best) return null;

            // confident = match exato, prefixo, substring clara, ou via stopwords/fonético (scores 0–6.8)
            // score 7+ = Levenshtein puro → incerto, vai para correção
            const confident = bestScore < 7;
            return { bird: best.data, isFuzzy: bestScore > 0, score: bestScore, confident };
        }
        // CORRIGIDO: exposto globalmente para ser acessível em outros <script>
        window.findBirdFuzzy = findBirdFuzzy;
        window.normalizeForSearch = normalizeForSearch;
        window.fuzzySearchCandidates = fuzzySearchCandidates;

        function findBirdByNormalizedName(input) {
            const result = findBirdFuzzy(input);
            return result ? result.bird : null;
        }
        function handleAutocomplete(e) {
            if (currentMode !== 'basic') return;
            const input = e.target;
            const val = input.value.trim();
            hideAutocomplete();
            if (val.length < 2) return;

            const normVal = normalizeForSearch(val);
            const matches = fuzzySearchCandidates(normVal, 10);

            if (matches.length === 0) return;

            const rect = input.getBoundingClientRect();
            autocompleteDiv = document.createElement('div');
            autocompleteDiv.className = 'autocomplete-suggestions';
            autocompleteDiv.style.position = 'absolute';
            autocompleteDiv.style.left = rect.left + 'px';
            autocompleteDiv.style.top = (rect.bottom + window.scrollY) + 'px';
            autocompleteDiv.style.width = rect.width + 'px';

            matches.forEach((match, idx) => {
                const sugg = document.createElement('div');
                sugg.className = 'autocomplete-suggestion';
                sugg.innerHTML = match.text;
                sugg.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    fillAutocomplete(input, match);
                });
                autocompleteDiv.appendChild(sugg);
            });
            document.body.appendChild(autocompleteDiv);
            currentInput = input;
            selectedSuggestionIndex = -1;
        }

        function handleAutocompleteKeydown(e) {
            if (!autocompleteDiv) return;
            const suggestions = autocompleteDiv.children;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
                updateSuggestionSelection(suggestions);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
                updateSuggestionSelection(suggestions);
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                    e.preventDefault();
                    suggestions[selectedSuggestionIndex].click();
                }
            }
        }

        function updateSuggestionSelection(suggestions) {
            Array.from(suggestions).forEach((s, i) => {
                if (i === selectedSuggestionIndex) s.classList.add('selected');
                else s.classList.remove('selected');
            });
        }

        function fillAutocomplete(input, match) {
            input.value = match.scientific;
            const row = input.closest('tr');
            const inputs = row.querySelectorAll('input');
            inputs.forEach(inp => {
                if (inp.dataset.field === 'filo') inp.value = match.data.filo;
                if (inp.dataset.field === 'classe') inp.value = match.data.classe;
                if (inp.dataset.field === 'ordem') inp.value = match.data.ordem;
                if (inp.dataset.field === 'familia') inp.value = match.data.familia;
                if (inp.dataset.field === 'subfamilia') inp.value = match.data.subfamilia || '';
            });
            hideAutocomplete();
            scheduleTreeUpdate();
        }

        function hideAutocomplete() {
            if (autocompleteDiv) {
                autocompleteDiv.remove();
                autocompleteDiv = null;
                currentInput = null;
            }
        }

        // ==================== AUTOCOMPLETE PARA TEXTAREA ====================
        // ==================== AUTOCOMPLETE PARA TEXTAREA PRINCIPAL ====================
let textareaAutocompleteDiv = document.getElementById('import-autocomplete');
let textareaTimeout;

function getCurrentLine(textarea) {
    const cursorPos = textarea.selectionStart;
    const text = textarea.value;
    const lines = text.split('\n');
    let charCount = 0;
    for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1; // +1 para o \n
        if (charCount > cursorPos) {
            return { line: lines[i], lineIndex: i, start: charCount - lines[i].length - 1 };
        }
    }
    return { line: lines[lines.length-1] || '', lineIndex: lines.length-1, start: text.length - lines[lines.length-1].length };
}

function generateColorMap(categories) {
    const colorMap = {};
    categories.forEach((cat, index) => {
        // Gerar cor HSL baseada no hash da string
        let hash = 0;
        for (let i = 0; i < cat.length; i++) {
            hash = cat.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        // Saturação e luminosidade fixas para cores vibrantes
        colorMap[cat] = `hsl(${hue}, 70%, 50%)`;
    });
    return colorMap;
}

function renderAllCharts(rows) {
    renderConservationPieCharts(rows);
    renderDistributionCharts(rows);
}

function renderConservationPieCharts(rows) {
    // Destroi gráficos antigos
    if (chartScPie) chartScPie.destroy();
    if (chartIcmbioPie) chartIcmbioPie.destroy();
    if (chartIucnPie) chartIucnPie.destroy();

    if (!rows || rows.length === 0) {
        ['scPieChart', 'icmbioPieChart', 'iucnPieChart'].forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });
        return;
    }

    // Contagens para SC
    const scCount = {};
    rows.forEach(r => { const status = r.sc || 'NE'; scCount[status] = (scCount[status] || 0) + 1; });

    // Contagens para ICMBio
    const icmbioCount = {};
    rows.forEach(r => { const status = r.icmbio || 'NE'; icmbioCount[status] = (icmbioCount[status] || 0) + 1; });

    // Contagens para IUCN
    const iucnCount = {};
    rows.forEach(r => { const status = r.iucn || 'NE'; iucnCount[status] = (iucnCount[status] || 0) + 1; });

    // Ordem das categorias (para manter consistência)
    const statusOrder = ['LC', 'NT', 'VU', 'EN', 'CR', 'DD', 'NE'];
    const statusColors = {
        'LC': '#27ae60', 'NT': '#f39c12', 'VU': '#e67e22', 'EN': '#e74c3c',
        'CR': '#c0392b', 'DD': '#7f8c8d', 'NE': '#95a5a6'
    };

    // Função auxiliar para criar dataset ordenado
    function prepareData(countMap) {
        const labels = [];
        const data = [];
        statusOrder.forEach(code => {
            if (countMap[code]) {
                labels.push(code);
                data.push(countMap[code]);
            }
        });
        return { labels, data };
    }

    // SC
    const scData = prepareData(scCount);
    const ctxSc = document.getElementById('scPieChart').getContext('2d');
    chartScPie = new Chart(ctxSc, {
        type: 'pie',
        data: {
            labels: scData.labels.map((l, i) => `${l} (${scData.data[i]})`),
            datasets: [{
                data: scData.data,
                backgroundColor: scData.labels.map(code => statusColors[code]),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: getPieChartOptions()
    });

    // ICMBio
    const icmbioData = prepareData(icmbioCount);
    const ctxIcmbio = document.getElementById('icmbioPieChart').getContext('2d');
    chartIcmbioPie = new Chart(ctxIcmbio, {
        type: 'pie',
        data: {
            labels: icmbioData.labels.map((l, i) => `${l} (${icmbioData.data[i]})`),
            datasets: [{
                data: icmbioData.data,
                backgroundColor: icmbioData.labels.map(code => statusColors[code]),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: getPieChartOptions()
    });

    // IUCN
    const iucnData = prepareData(iucnCount);
    const ctxIucn = document.getElementById('iucnPieChart').getContext('2d');
    chartIucnPie = new Chart(ctxIucn, {
        type: 'pie',
        data: {
            labels: iucnData.labels.map((l, i) => `${l} (${iucnData.data[i]})`),
            datasets: [{
                data: iucnData.data,
                backgroundColor: iucnData.labels.map(code => statusColors[code]),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: getPieChartOptions()
    });
}

// Opções comuns para gráficos de pizza (com datalabels)
function getPieChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio || 2, // força alta resolução
        plugins: {
            datalabels: {
                color: 'white',
                font: { weight: 'bold', size: 14 }, // fonte maior
                formatter: (value, context) => {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return `${percentage}%`;
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };
}

function showTextareaAutocomplete() {
    const textarea = importDataTextarea;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ') + 1;
    const currentWord = textBeforeCursor.substring(lastSpaceIndex).trim();

    if (currentWord.length < 2) {
        textareaAutocompleteDiv.style.display = 'none';
        return;
    }

    const normalizedWord = normalizeForSearch(currentWord);
    const matches = fuzzySearchCandidates(normalizedWord, 10);

    if (matches.length === 0) {
        textareaAutocompleteDiv.style.display = 'none';
        return;
    }

    const rect = textarea.getBoundingClientRect();
    textareaAutocompleteDiv.style.position = 'absolute';
    textareaAutocompleteDiv.style.left = rect.left + 'px';
    textareaAutocompleteDiv.style.top = (rect.bottom + window.scrollY) + 'px';
    textareaAutocompleteDiv.style.width = rect.width + 'px';
    textareaAutocompleteDiv.innerHTML = '';

    matches.forEach(match => {
        const sugg = document.createElement('div');
        sugg.className = 'autocomplete-suggestion';
        sugg.innerHTML = match.text;
        sugg.addEventListener('mousedown', (e) => {
            e.preventDefault();
            insertIntoTextarea(match.scientific, currentWord);
            textareaAutocompleteDiv.style.display = 'none';
        });
        textareaAutocompleteDiv.appendChild(sugg);
    });
    textareaAutocompleteDiv.style.display = 'block';
}

function insertIntoTextarea(replacement) {
    const textarea = importDataTextarea;
    const cursorPos = textarea.selectionStart;
    const { start } = getCurrentLine(textarea); // posição inicial da linha
    const text = textarea.value;
    const before = text.substring(0, start);      // texto antes da linha
    const after = text.substring(cursorPos);      // texto depois do cursor
    // Constrói o novo texto: mantém o antes, insere a sugestão, e mantém o depois
    const newText = before + replacement + after;
    textarea.value = newText;
    // Posiciona o cursor após a sugestão
    textarea.selectionStart = textarea.selectionEnd = start + replacement.length;
    textarea.focus();
    updateImportTextareaStats();
}

// Eventos
importDataTextarea.addEventListener('input', () => {
    clearTimeout(textareaTimeout);
    textareaTimeout = setTimeout(showTextareaAutocomplete, 300);
});

importDataTextarea.addEventListener('blur', () => {
    setTimeout(() => { textareaAutocompleteDiv.style.display = 'none'; }, 200);
});

importDataTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && textareaAutocompleteDiv.style.display === 'block') {
        e.preventDefault();
        const firstSuggestion = textareaAutocompleteDiv.querySelector('.autocomplete-suggestion');
        if (firstSuggestion) firstSuggestion.click();
    }
});

document.addEventListener('click', (e) => {
    if (e.target !== importDataTextarea && !textareaAutocompleteDiv.contains(e.target)) {
        textareaAutocompleteDiv.style.display = 'none';
    }
});

// ==================== AUTOCOMPLETE PARA AVISTAMENTOS ====================
(function() {
    // Genérico: liga autocomplete a qualquer textarea de avistamentos
    function setupAvistAutocomplete(textareaId, autocompleteId, getLinePart) {
        const textarea = document.getElementById(textareaId);
        const acDiv    = document.getElementById(autocompleteId);
        if (!textarea || !acDiv) return;

        let acTimeout;
        let acSelected = -1;

        function getCurrentLinePart() {
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const lines = textBefore.split('\n');
            const line = lines[lines.length - 1];
            return getLinePart(line); // extrai a parte que é o nome da espécie
        }

        function getLineStart() {
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const lastNl = textBefore.lastIndexOf('\n');
            return lastNl + 1;
        }

        function show() {
            const part = getCurrentLinePart();
            if (!part || part.length < 2) { acDiv.style.display = 'none'; return; }
            const norm = normalizeForSearch(part);
            const matches = fuzzySearchCandidates(norm, 10);
            if (!matches.length) { acDiv.style.display = 'none'; return; }

            const rect = textarea.getBoundingClientRect();
            acDiv.style.position = 'absolute';
            acDiv.style.left  = rect.left + 'px';
            acDiv.style.top   = (rect.bottom + window.scrollY) + 'px';
            acDiv.style.width = rect.width + 'px';
            acDiv.innerHTML = '';

            matches.forEach((match, idx) => {
                const sugg = document.createElement('div');
                sugg.className = 'autocomplete-suggestion';
                sugg.innerHTML = match.text;
                sugg.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    insertAvistSuggestion(match.scientific, part);
                    acDiv.style.display = 'none';
                });
                acDiv.appendChild(sugg);
            });
            acDiv.style.display = 'block';
            acSelected = -1;
        }

        function insertAvistSuggestion(scientific, currentPart) {
            const cursorPos = textarea.selectionStart;
            const text = textarea.value;
            const lineStart = getLineStart();
            const lineEnd   = cursorPos;
            // Substituir apenas a parte do nome (getLinePart devolve o que foi digitado após a data)
            const before = text.substring(0, lineEnd - currentPart.length);
            const after  = text.substring(lineEnd);
            const newText = before + scientific + after;
            textarea.value = newText;
            const newPos = before.length + scientific.length;
            textarea.selectionStart = textarea.selectionEnd = newPos;
            textarea.focus();
        }

        textarea.addEventListener('input', () => {
            clearTimeout(acTimeout);
            acTimeout = setTimeout(show, 280);
        });

        textarea.addEventListener('blur', () => {
            setTimeout(() => { acDiv.style.display = 'none'; }, 200);
        });

        textarea.addEventListener('keydown', (e) => {
            if (acDiv.style.display !== 'block') return;
            const suggestions = acDiv.querySelectorAll('.autocomplete-suggestion');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                acSelected = Math.min(acSelected + 1, suggestions.length - 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                acSelected = Math.max(acSelected - 1, -1);
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                if (acSelected >= 0 && suggestions[acSelected]) {
                    e.preventDefault();
                    suggestions[acSelected].click();
                    return;
                }
                // Tab sem seleção: usa a primeira sugestão
                if (e.key === 'Tab' && suggestions[0]) {
                    e.preventDefault();
                    suggestions[0].click();
                    return;
                }
            } else if (e.key === 'Escape') {
                acDiv.style.display = 'none';
                return;
            }
            // Atualiza destaque
            suggestions.forEach((s, i) => {
                if (i === acSelected) s.classList.add('selected');
                else s.classList.remove('selected');
            });
        });

        document.addEventListener('click', (e) => {
            if (e.target !== textarea && !acDiv.contains(e.target)) {
                acDiv.style.display = 'none';
            }
        });
    }

    // Modo unificado data+hora: extrai nome (após data e hora opcionais)
    setupAvistAutocomplete('avist-date-input', 'avist-date-autocomplete', (line) => {
        // Remove prefixo DD/MM/AAAA HH:MM ou DD/MM/AAAA se existir
        const dtMatch = line.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\s+\d{2}:\d{2}\s+(.*)$/);
        if (dtMatch) return dtMatch[1].trim();
        const dMatch = line.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\s+(.*)$/);
        return dMatch ? dMatch[1].trim() : line.trim();
    });
})();

        // ==================== PROCESSAMENTO DE IMPORTAÇÃO ====================
        function processImportedData() {
    const text = importDataTextarea.value.trim();
    if (!text) { alert("Cole dados primeiro."); return; }
    const lines = text.split('\n').filter(l => l.trim() !== '');

    // Contadores para o painel de feedback
    const exactFound   = [];  // { name, commonName }
    const fuzzyFixed   = [];  // { typed, name, commonName }
    const notFound     = [];  // string

    lines.forEach(line => {
        // Tenta separar por tabulação (formato avançado)
        let columns = line.split('\t').map(s => s.trim());
        
        // Se não tiver 6 colunas, tenta por vírgula
        if (columns.length !== 6) {
            columns = line.split(',').map(s => s.trim());
        }
        
        // Se ainda não tiver 6 colunas, considera como uma única coluna (modo básico)
        if (columns.length !== 6) {
            const especie = line.trim();
            const result = findBirdFuzzy(especie);
            if (result) {
                const match = result.bird;
                addTableRow({
                    filo: match.filo,
                    classe: match.classe,
                    ordem: match.ordem,
                    familia: match.familia,
                    subfamilia: match.subfamilia || '',
                    generoEspecie: match.scientificName
                });
                if (result.isFuzzy) {
                    fuzzyFixed.push({ typed: especie, name: match.scientificName, commonName: match.commonName });
                } else {
                    exactFound.push({ name: match.scientificName, commonName: match.commonName });
                }
            } else {
                addTableRow({ generoEspecie: especie });
                notFound.push(especie);
            }
        } else {
            // Modo avançado: tem 6 colunas
            if (columns.length > 6) {
                const extra = columns.slice(5).join(" ");
                columns = columns.slice(0,5).concat(extra);
            }
            addTableRow({
                filo: columns[0],
                classe: columns[1],
                ordem: columns[2],
                familia: columns[3],
                subfamilia: columns[4],
                generoEspecie: columns[5]
            });
            exactFound.push({ name: columns[5], commonName: '' });
        }
    });
    
    importDataTextarea.value = "";
    updateImportTextareaStats();
    showImportFeedback(exactFound, fuzzyFixed, notFound);

    // Recalcula indicadoras automaticamente após importar novas espécies
    setTimeout(() => { if (typeof runIndicadoras === 'function') runIndicadoras(); }, 150);

    // Sincroniza automaticamente a Lista 1 da aba Comparar com as espécies importadas
    const allSpecies = [...exactFound.map(f => f.name), ...fuzzyFixed.map(f => f.name)];
    if (allSpecies.length > 0) {
        const firstList = document.querySelector('#compare-section .list-item[data-list-index="0"]');
        if (firstList) {
            const textarea = firstList.querySelector('.compare-import');
            const tbody = firstList.querySelector('.list-body');
            if (textarea && tbody) {
                textarea.value = allSpecies.join('\n');
                if (typeof processList === 'function') processList(textarea, tbody);
            }
        }
    }
}

function showImportFeedback(exactFound, fuzzyFixed, notFound) {
    const div = document.getElementById('import-feedback');
    if (!div) return;
    div.innerHTML = '';
    div.style.display = 'block';

    const total = exactFound.length + fuzzyFixed.length + notFound.length;

    // Bloco verde: encontrados exatamente
    if (exactFound.length > 0) {
        const block = document.createElement('div');
        block.className = 'import-feedback-block import-feedback-ok';
        let html = `<strong>✅ ${exactFound.length} espécie${exactFound.length > 1 ? 's' : ''} identificada${exactFound.length > 1 ? 's' : ''} com sucesso</strong> de ${total} linha${total > 1 ? 's' : ''}.<br>`;
        html += `<div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:4px;">`;
        exactFound.forEach(f => {
            html += `<span style="background:rgba(255,255,255,0.55); border-radius:10px; padding:2px 8px; font-size:13px;">
                <em>${escapeHtml(f.name)}</em>${f.commonName ? ` <small style="color:#3a6e3a;">(${escapeHtml(f.commonName)})</small>` : ''}
            </span>`;
        });
        html += `</div>`;
        block.innerHTML = html;
        div.appendChild(block);
    }

    // Bloco amarelo: corrigidos automaticamente
    if (fuzzyFixed.length > 0) {
        const block = document.createElement('div');
        block.className = 'import-feedback-block import-feedback-fuzzy';
        let html = `<strong>✏️ ${fuzzyFixed.length} nome${fuzzyFixed.length > 1 ? 's' : ''} corrigido${fuzzyFixed.length > 1 ? 's' : ''} automaticamente:</strong><br>`;
        fuzzyFixed.forEach(f => {
            html += `<div class="fuzzy-item">
                <span class="typed">${escapeHtml(f.typed)}</span>
                <span class="arrow">→</span>
                <span class="corrected">${escapeHtml(f.name)}</span>
                <small style="color:#a07840;">(${escapeHtml(f.commonName)})</small>
            </div>`;
        });
        block.innerHTML = html;
        div.appendChild(block);
    }

    // Bloco vermelho: não encontrados
    if (notFound.length > 0) {
        const block = document.createElement('div');
        block.className = 'import-feedback-block import-feedback-notfound';
        let html = `<strong>❌ ${notFound.length} nome${notFound.length > 1 ? 's' : ''} não encontrado${notFound.length > 1 ? 's' : ''} no banco de dados:</strong><br>`;
        notFound.forEach(n => { html += `<code>${escapeHtml(n)}</code> `; });
        html += `<br><small style="opacity:0.8; margin-top:4px; display:block;">Verifique a grafia ou use o autocomplete para encontrar o nome correto.</small>`;
        block.innerHTML = html;
        div.appendChild(block);
    }

    // Auto-ocultar após 12s se não houver erros
    if (notFound.length === 0 && fuzzyFixed.length === 0) {
        setTimeout(() => { div.style.display = 'none'; }, 8000);
    }
}

function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

        document.addEventListener('DOMContentLoaded', function() {
    // ── Utilitário: fecha todos os modais principais ─────────────────────
    function closeAllMainModals() {
        ['help-modal', 'config-modal', 'download-charts-modal'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    }

    // Abrir modal de ajuda (toggle)
    const helpBtn = document.getElementById('help-button');
    const helpBtnFixed = document.getElementById('help-button-fixed');
    const helpModal = document.getElementById('help-modal');
    const closeHelp = document.getElementById('close-help-modal');

    const toggleHelp = () => {
        if (!helpModal) return;
        const isOpen = helpModal.style.display === 'block';
        closeAllMainModals();
        if (!isOpen) helpModal.style.display = 'block';
    };
    const closeHelpFn = () => { if (helpModal) helpModal.style.display = 'none'; };

    if (helpBtn) helpBtn.addEventListener('click', toggleHelp);
    if (helpBtnFixed) helpBtnFixed.addEventListener('click', toggleHelp);
    if (closeHelp) closeHelp.addEventListener('click', closeHelpFn);

    window.addEventListener('click', (event) => {
        if (event.target === helpModal) closeHelpFn();
    });

    // Abrir modal configurações
    const settingsOpenBtn = document.getElementById('settings-open-btn');
    const configModal = document.getElementById('config-modal');
    const closeConfigBtn = document.getElementById('close-config-modal');

    if (settingsOpenBtn) settingsOpenBtn.addEventListener('click', () => {
        if (!configModal) return;
        const isOpen = configModal.style.display === 'block';
        closeAllMainModals();
        if (!isOpen) configModal.style.display = 'block';
    });
    if (closeConfigBtn) closeConfigBtn.addEventListener('click', () => { if (configModal) configModal.style.display = 'none'; });
    window.addEventListener('click', (event) => {
        if (event.target === configModal) configModal.style.display = 'none';
    });

    // ── Modal Download Gráficos ──
    // All charts in the platform
    const DOWNLOAD_CHARTS_DEF = [
        // 📋 Cálculo de Avistamentos
        { label: '📋 Cálculo — Frequência por espécie (barras)',  canvasIds: ['calculo-bar-chart'] },
        { label: '📋 Cálculo — Proporção (pizza)',                canvasIds: ['calculo-pie-chart'] },
        { label: '📋 Cálculo — Registros por data',              canvasIds: ['calculo-date-chart'] },
        // 🕐 Picos de Horários
        { label: '🕐 Picos de Horários',                         canvasIds: ['picosHorariosChart'] },
        // 🛡️ Conservação
        { label: '🛡️ Conservação — Status SC (pizza)',           canvasIds: ['scPieChart'] },
        { label: '🛡️ Conservação — Status ICMBio (pizza)',       canvasIds: ['icmbioPieChart'] },
        { label: '🛡️ Conservação — Status IUCN (pizza)',         canvasIds: ['iucnPieChart'] },
        // 📊 Distribuição Taxonômica
        { label: '📊 Distribuição — Ordens (barras)',             canvasIds: ['ordemBarChart'] },
        { label: '📊 Distribuição — Ordens (pizza)',              canvasIds: ['ordemPieChart'] },
        { label: '📊 Distribuição — Famílias (barras)',           canvasIds: ['familiaBarChart'] },
        { label: '📊 Distribuição — Famílias (pizza)',            canvasIds: ['familiaPieChart'] },
        // 📈 Curva do Coletor e Estimadores
        { label: '📈 Curvas — Curva do Coletor',                 canvasIds: ['collectorChart'] },
        { label: '📈 Curvas — Chao2',                            canvasIds: ['chaoChart'] },
        { label: '📈 Curvas — Jackknife 1ª ordem',               canvasIds: ['jack1Chart'] },
        { label: '📈 Curvas — Jackknife 2ª ordem',               canvasIds: ['jack2Chart'] },
        { label: '📈 Curvas — Bootstrap',                        canvasIds: ['bootstrapChart'] },
        { label: '📈 Curvas — Todos os estimadores',             canvasIds: ['combinedEstimatorChart'] },
        // 🔀 Comparar Listas
        { label: '🔀 Comparar — Contagem por lista (barras)',     canvasIds: ['countChart'] },
        { label: '🔀 Comparar — Similaridade Jaccard',           canvasIds: ['similarityChart'] },
        { label: '🔀 Comparar — Espécies únicas (pizza)',         canvasIds: ['uniqueChart'] },
        // 🍽️ Guilda
        { label: '🍽️ Guilda — Por Guilda Alimentar',             canvasIds: ['guild-pie-guilda'] },
        { label: '🍽️ Guilda — Por Habitat',                      canvasIds: ['guild-pie-habitat'] },
        // 📉 Rarefação
        { label: '📉 Rarefação',                                  canvasIds: ['rarefChart'] },
        // 📅 Sazonalidade
        { label: '📅 Sazonalidade — Barras mensais',              canvasIds: ['sazonChart'] },
        { label: '📅 Sazonalidade — Distribuição por estação',    canvasIds: ['sazonEstacaoChart'] },
        // 🌸 Fenologia
        { label: '🌸 Fenologia',                                  canvasIds: ['fenolChart'] },
        // 🔄 Turnover
        { label: '🔄 Turnover Temporal',                          canvasIds: ['turnoverChart'] },
        // ⚠️ Indicadoras
        { label: '⚠️ Espécies Indicadoras',                       canvasIds: ['indicadorasChart'] },
        // 📊 Rank-Abundância
        { label: '📊 Rank-Abundância (Whittaker)',                canvasIds: ['rankabundChart'] },
        // 🔗 Co-ocorrência
        { label: '🔗 Co-ocorrência — Pares mais frequentes',      canvasIds: ['cooc-pairs-bar-chart'] },
    ];

    // Verifica se o gráfico foi gerado usando Chart.js registry (funciona mesmo com display:none)
    function canvasHasData(canvasId) {
        const c = document.getElementById(canvasId);
        if (!c) return false;
        if (typeof Chart !== 'undefined') {
            try {
                const inst = Chart.getChart(c);
                if (inst && inst.data && inst.data.datasets && inst.data.datasets.some(ds => ds.data && ds.data.length > 0)) return true;
            } catch(e) {}
            // fallback: percorre todas instâncias
            try {
                for (const ch of Object.values(Chart.instances || {})) {
                    if (ch.canvas === c && ch.data && ch.data.datasets && ch.data.datasets.some(ds => ds.data && ds.data.length > 0)) return true;
                }
            } catch(e) {}
        }
        return false;
    }

    // ── Pasta de destino selecionada via File System Access API ──
    let _dlFolderHandle = null;

    // Renderiza um gráfico Chart.js em alta resolução
    // Estratégia: nova instância num canvas offscreen MAIOR com padding generoso,
    // depois recorta só a área pintada — legenda nunca é cortada.
    async function renderChartHQ(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        if (typeof Chart === 'undefined') return null;
        const inst = Chart.getChart(canvas);
        if (!inst) return null;

        // ── Tipo e dimensões base ────────────────────────────────────────────────
        const chartType  = (inst.config?.type || 'bar').toLowerCase();
        const isCircular = ['pie', 'doughnut', 'polararea'].includes(chartType);

        // Canvas interno generoso — Chart.js usa isso para calcular tudo
        const outW = isCircular ? 2800 : 4000;
        const outH = isCircular ? 2800 : 2200;

        // Padding ao redor do gráfico (evita corte de legenda/labels nas bordas)
        const PAD = Math.round(outW * 0.045); // ~4.5% de cada lado

        const offCanvas = document.createElement('canvas');
        offCanvas.width  = outW;
        offCanvas.height = outH;
        offCanvas.style.cssText = 'position:fixed;left:-99999px;top:-99999px;width:' + outW + 'px;height:' + outH + 'px;';
        document.body.appendChild(offCanvas);

        let offChart = null;
        try {
            const origConfig = inst.config;
            const cloned = JSON.parse(JSON.stringify({
                type:    origConfig.type,
                data:    origConfig.data,
                options: origConfig.options || {}
            }));

            // Sem responsividade — tamanho fixo
            cloned.options.responsive          = false;
            cloned.options.maintainAspectRatio = false;
            cloned.options.animation           = false;

            // Padding interno amplo — garante que nada seja cortado
            cloned.options.layout = {
                padding: {
                    top:    PAD,
                    bottom: PAD,
                    left:   PAD,
                    right:  PAD
                }
            };

            // Escala de fonte relativa ao canvas de saída
            const fontScale = isCircular ? (outW / 700) : (outW / 1100);

            if (!cloned.options.plugins) cloned.options.plugins = {};
            const pl = cloned.options.plugins;

            // Legenda — sempre visível, fonte grande, sem corte
            if (!pl.legend) pl.legend = {};
            pl.legend.display = true;
            pl.legend.position = pl.legend.position || 'top';
            if (!pl.legend.labels) pl.legend.labels = {};
            pl.legend.labels.font     = { size: Math.round(20 * fontScale) };
            pl.legend.labels.boxWidth = Math.round(28 * fontScale);
            pl.legend.labels.padding  = Math.round(22 * fontScale);
            // Garante que a legenda nunca seja truncada — sem maxItems
            delete pl.legend.maxHeight;
            delete pl.legend.maxWidth;

            // Título
            if (pl.title?.display) {
                if (!pl.title.font) pl.title.font = {};
                pl.title.font.size = Math.round(26 * fontScale);
                pl.title.padding   = { top: PAD / 2, bottom: PAD / 2 };
            }

            // Datalabels
            if (pl.datalabels) {
                if (!pl.datalabels.font) pl.datalabels.font = {};
                pl.datalabels.font.size = Math.round(16 * fontScale);
                pl.datalabels.clamp     = true;  // mantém dentro do canvas
            }

            // Eixos — fontes grandes e sem truncamento
            if (cloned.options.scales) {
                Object.values(cloned.options.scales).forEach(axis => {
                    if (!axis) return;
                    if (!axis.ticks) axis.ticks = {};
                    if (!axis.ticks.font) axis.ticks.font = {};
                    axis.ticks.font.size  = Math.round(17 * fontScale);
                    axis.ticks.maxRotation = 45;
                    axis.ticks.autoSkip    = false; // mostra todos os labels
                    if (axis.title) {
                        if (!axis.title.font) axis.title.font = {};
                        axis.title.font.size = Math.round(20 * fontScale);
                    }
                });
            }

            // ── Cria nova instância ──────────────────────────────────────────────
            offChart = new Chart(offCanvas, cloned);
            await new Promise(r => setTimeout(r, 400));

            // ── Exporta com fundo branco ─────────────────────────────────────────
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width  = outW;
            finalCanvas.height = outH;
            const ctx = finalCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, outW, outH);
            ctx.drawImage(offCanvas, 0, 0);

            return finalCanvas.toDataURL('image/png', 1.0);

        } catch(e) {
            console.warn('renderChartHQ error:', e);
            return null;
        } finally {
            if (offChart) { try { offChart.destroy(); } catch(_) {} }
            if (offCanvas.parentNode) offCanvas.parentNode.removeChild(offCanvas);
        }
    }

    // Salva dataUrl como arquivo — usa pasta selecionada se disponível, senão link <a>
    async function saveFile(filename, dataUrl) {
        const blob = await (await fetch(dataUrl)).blob();
        if (_dlFolderHandle) {
            try {
                const fh = await _dlFolderHandle.getFileHandle(filename, { create: true });
                const wr = await fh.createWritable();
                await wr.write(blob);
                await wr.close();
                return true;
            } catch(e) { console.warn('Folder write error:', e); }
        }
        // Fallback: download via link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        return true;
    }

    function buildDownloadList() {
        const el = document.getElementById('download-charts-list');
        if (!el) return;
        let anyHasData = false;
        const rows = DOWNLOAD_CHARTS_DEF.map((def, i) => {
            const hasData = def.canvasIds.some(id => canvasHasData(id));
            if (hasData) anyHasData = true;
            const statusBadge = hasData
                ? `<span style="margin-left:auto;font-size:11px;background:#d4f0dc;color:#1e6b35;border-radius:10px;padding:2px 9px;font-weight:600;">✓ Gerado</span>`
                : `<span style="margin-left:auto;font-size:11px;background:#f0e0e0;color:#922b21;border-radius:10px;padding:2px 9px;">Sem dados</span>`;
            return `<label style="display:flex;align-items:center;gap:10px;padding:9px 14px;background:var(--${hasData ? 'green-mist' : 'surface'});border:1px solid var(--border-light);border-radius:var(--radius-sm);cursor:${hasData ? 'pointer' : 'not-allowed'};font-size:13px;opacity:${hasData ? 1 : 0.5};">
                <input type="checkbox" id="dl-chk-${i}" ${hasData ? 'checked' : 'disabled'} style="width:15px;height:15px;cursor:${hasData ? 'pointer' : 'not-allowed'};accent-color:var(--green-base);">
                <span>${def.label}</span>
                ${statusBadge}
            </label>`;
        });
        if (!anyHasData) {
            el.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted);font-size:14px;">
                <div style="font-size:36px;margin-bottom:12px;">📊</div>
                Nenhum gráfico foi gerado ainda.<br>
                <span style="font-size:12.5px;">Navegue pelas abas, importe dados e gere os gráficos para poder exportá-los.</span>
            </div>`;
        } else {
            el.innerHTML = rows.join('');
        }
    }

    window.downloadChartsSelectAll = function(val) {
        DOWNLOAD_CHARTS_DEF.forEach((def, i) => {
            const chk = document.getElementById(`dl-chk-${i}`);
            if (chk && !chk.disabled) chk.checked = val;
        });
    };

    const dlBtn = document.getElementById('download-charts-btn');
    const dlModal = document.getElementById('download-charts-modal');
    const closeDlModal = document.getElementById('close-download-charts-modal');

    if (dlBtn) dlBtn.addEventListener('click', () => {
        buildDownloadList();
        const isOpen = dlModal && dlModal.style.display === 'block';
        closeAllMainModals();
        if (dlModal && !isOpen) dlModal.style.display = 'block';
    });
    if (closeDlModal) closeDlModal.addEventListener('click', () => { if (dlModal) dlModal.style.display = 'none'; });
    window.addEventListener('click', e => { if (e.target === dlModal) dlModal.style.display = 'none'; });

    // Botão escolher pasta
    document.getElementById('dl-pick-folder')?.addEventListener('click', async () => {
        const fallbackEl = document.getElementById('dl-folder-fallback');
        const nameEl = document.getElementById('dl-folder-name');
        if (!('showDirectoryPicker' in window)) {
            if (fallbackEl) fallbackEl.style.display = 'block';
            if (nameEl) nameEl.textContent = 'Salvando na pasta Downloads padrão';
            return;
        }
        try {
            _dlFolderHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            if (nameEl) {
                nameEl.textContent = `📂 ${_dlFolderHandle.name}`;
                nameEl.style.color = 'var(--green-deep)';
                nameEl.style.fontStyle = 'normal';
                nameEl.style.fontWeight = '600';
            }
            if (fallbackEl) fallbackEl.style.display = 'none';
        } catch(e) {
            if (e.name !== 'AbortError') {
                if (fallbackEl) fallbackEl.style.display = 'block';
            }
        }
    });

    document.getElementById('download-charts-go')?.addEventListener('click', async () => {
        const status = document.getElementById('download-charts-status');
        const selected = DOWNLOAD_CHARTS_DEF.filter((_, i) => {
            const chk = document.getElementById(`dl-chk-${i}`);
            return chk && chk.checked && !chk.disabled;
        });
        if (!selected.length) { if (status) status.textContent = '⚠️ Nenhum gráfico selecionado com dados.'; return; }

        const prefix = (document.getElementById('dl-prefix')?.value?.trim() || 'ornitologia').replace(/[^\wÀ-ÿ\-_]/g, '') || 'ornitologia';
        let done = 0, skipped = 0;
        if (status) status.innerHTML = '⏳ Renderizando em alta resolução… <span id="dl-progress"></span>';

        for (let di = 0; di < selected.length; di++) {
            const def = selected[di];
            const prog = document.getElementById('dl-progress');
            if (prog) prog.textContent = `(${di+1}/${selected.length}) ${def.label.replace(/[^a-zA-ZÀ-ÿ\s]/g,'').trim()}`;
            for (const cid of def.canvasIds) {
                if (!canvasHasData(cid)) { skipped++; continue; }
                try {
                    const dataUrl = await renderChartHQ(cid);
                    if (!dataUrl) { skipped++; continue; }
                    const safeName = def.label.replace(/[^\wÀ-ÿ\s\-–]/g,'').trim().replace(/\s+/g,'_');
                    await saveFile(`${prefix}_${safeName}.png`, dataUrl);
                    done++;
                } catch(e) { skipped++; console.warn('Export error:', e); }
                await new Promise(r => setTimeout(r, 200));
            }
        }
        const folderInfo = _dlFolderHandle ? ` na pasta "${_dlFolderHandle.name}"` : ' na pasta Downloads';
        if (status) status.textContent = `✅ ${done} gráfico(s) exportado(s) em alta resolução (proporção original preservada — mín. 2400px)${folderInfo}${skipped ? ` · ${skipped} pulados` : ''}.`;
    });

    // Abrir automaticamente ao carregar a página
    if (helpModal) {
        setTimeout(() => { helpModal.style.display = 'block'; }, 400);
    }
});

/* ═══════════════════════════════════════════════════════════════
   TEMA CLARO / ESCURO
   setTheme(mode) — chamado pelos onclick dos botões em Configurações
═══════════════════════════════════════════════════════════════ */
(function () {
    function applyTheme(mode) {
        if (mode === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        try { localStorage.setItem('ornitologia_theme', mode); } catch(_) {}
    }

    window.setTheme = function(mode) { applyTheme(mode); };

    // Restaura tema salvo ao carregar
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const saved = localStorage.getItem('ornitologia_theme');
            if (saved) applyTheme(saved);
        } catch(_) {}
    });
})();

/* ═══════════════════════════════════════════════════════════════
   EXPORTAR / IMPORTAR SESSÃO
   Salva e restaura: tabela de espécies, avistamentos e listas de comparação.
═══════════════════════════════════════════════════════════════ */
(function () {

    // ── Coleta todos os dados da sessão atual ───────────────────────────────
    function collectSession() {
        const session = { version: 2, ts: Date.now() };

        // 1. Tabela de espécies (modo básico / avançado)
        const tableRows = [];
        document.querySelectorAll('#table-body tr').forEach(row => {
            const rowData = {};
            row.querySelectorAll('input[data-field]').forEach(inp => {
                rowData[inp.dataset.field] = inp.value;
            });
            if (Object.keys(rowData).length) tableRows.push(rowData);
        });
        session.tableRows = tableRows;

        // 2. Textarea de importação
        const importTA = document.getElementById('import-data');
        session.importText = importTA ? importTA.value : '';

        // 3. Avistamentos
        session.avistamentos = window.AVISTAMENTOS ? [...window.AVISTAMENTOS] : [];

        // 4. Listas de comparação
        const listsData = [];
        document.querySelectorAll('#lists-container .list-item').forEach((listDiv, i) => {
            const legendInput = listDiv.querySelector('.list-legend');
            const textarea    = listDiv.querySelector('.compare-import');
            const tbody       = listDiv.querySelector('.list-body');
            const processed   = [];
            if (tbody) tbody.querySelectorAll('tr td:first-child').forEach(td => processed.push(td.textContent.trim()));
            listsData.push({
                legend:    legendInput ? legendInput.value : `Lista ${i + 1}`,
                textarea:  textarea   ? textarea.value   : '',
                processed: processed
            });
        });
        session.compareLists = listsData;

        // 5. Tema atual
        session.theme = document.documentElement.getAttribute('data-theme') || 'light';

        return session;
    }

    // ── Restaura sessão a partir de um objeto JSON ──────────────────────────
    function restoreSession(session) {
        const feedback = document.getElementById('session-import-feedback');
        function showFeedback(msg, ok) {
            if (!feedback) return;
            feedback.style.display = 'block';
            feedback.style.background = ok ? '#d4f0dc' : '#fde8d0';
            feedback.style.color      = ok ? '#1e6b35' : '#922b21';
            feedback.style.border     = ok ? '1px solid #a0d8b0' : '1px solid #f5b7a0';
            feedback.textContent = msg;
        }

        try {
            // Tema
            if (session.theme && window.setTheme) window.setTheme(session.theme);

            // Tabela de espécies — limpa e recria
            const tableBody = document.getElementById('table-body');
            if (tableBody && session.tableRows && session.tableRows.length) {
                tableBody.innerHTML = '';
                session.tableRows.forEach(rowData => {
                    if (typeof addTableRow === 'function') {
                        addTableRow(rowData);
                    } else {
                        // fallback manual
                        const row = document.createElement('tr');
                        ['filo','classe','ordem','familia','subfamilia','generoEspecie'].forEach(field => {
                            const td  = document.createElement('td');
                            const inp = document.createElement('input');
                            inp.type = 'text'; inp.value = rowData[field] || ''; inp.dataset.field = field;
                            td.appendChild(inp); row.appendChild(td);
                        });
                        tableBody.appendChild(row);
                    }
                });
            }

            // Textarea de importação
            const importTA = document.getElementById('import-data');
            if (importTA && session.importText !== undefined) importTA.value = session.importText;

            // Avistamentos
            if (session.avistamentos && Array.isArray(session.avistamentos)) {
                window.AVISTAMENTOS = session.avistamentos;
                if (typeof buildAvistaTable === 'function') buildAvistaTable();
            }

            // Listas de comparação
            if (session.compareLists && session.compareLists.length) {
                const container = document.getElementById('lists-container');
                if (container) {
                    // Remove listas existentes (mantém pelo menos 1)
                    const existing = container.querySelectorAll('.list-item');
                    existing.forEach((el, i) => { if (i > 0) el.remove(); });

                    session.compareLists.forEach((listData, i) => {
                        let listEl;
                        if (i === 0) {
                            listEl = container.querySelector('.list-item');
                        } else {
                            // Simula clique no botão "Adicionar Lista"
                            const addBtn = document.getElementById('add-list-btn');
                            if (addBtn) addBtn.click();
                            const items = container.querySelectorAll('.list-item');
                            listEl = items[items.length - 1];
                        }
                        if (!listEl) return;
                        const legendInp = listEl.querySelector('.list-legend');
                        const ta        = listEl.querySelector('.compare-import');
                        if (legendInp) legendInp.value = listData.legend;
                        if (ta)        ta.value        = listData.textarea;

                        // Restaura linhas processadas
                        const tbody = listEl.querySelector('.list-body');
                        if (tbody && listData.processed && listData.processed.length) {
                            tbody.innerHTML = '';
                            listData.processed.forEach(sp => {
                                const tr = document.createElement('tr');
                                const td = document.createElement('td');
                                td.textContent = sp;
                                tr.appendChild(td); tbody.appendChild(tr);
                            });
                        }
                    });
                }
            }

            showFeedback(`✅ Sessão restaurada com sucesso! (${session.tableRows?.length || 0} espécies, ${session.avistamentos?.length || 0} avistamentos, ${session.compareLists?.length || 0} lista(s))`, true);
        } catch(e) {
            console.error('Erro ao restaurar sessão:', e);
            showFeedback('❌ Erro ao restaurar sessão: ' + e.message, false);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {

        // ── Botão Exportar Sessão ──────────────────────────────────────────
        const exportBtn = document.getElementById('session-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                try {
                    const session = collectSession();
                    const json    = JSON.stringify(session, null, 2);
                    const blob    = new Blob([json], { type: 'application/json' });
                    const url     = URL.createObjectURL(blob);
                    const a       = document.createElement('a');
                    const date    = new Date().toISOString().slice(0, 10);
                    a.href        = url;
                    a.download    = `ornitologia_sessao_${date}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 2000);
                } catch(e) {
                    alert('Erro ao exportar sessão: ' + e.message);
                }
            });
        }

        // ── Input de importação de sessão ──────────────────────────────────
        const importFile = document.getElementById('session-import-file');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const session = JSON.parse(ev.target.result);
                        if (!session || typeof session !== 'object') throw new Error('Arquivo inválido.');
                        restoreSession(session);
                    } catch(err) {
                        const fb = document.getElementById('session-import-feedback');
                        if (fb) {
                            fb.style.display = 'block';
                            fb.style.background = '#fde8d0';
                            fb.style.color = '#922b21';
                            fb.textContent = '❌ Arquivo inválido ou corrompido: ' + err.message;
                        }
                    }
                };
                reader.readAsText(file);
                importFile.value = ''; // permite reimportar o mesmo arquivo
            });
        }
    });
})();

// ══════════════════════════════════════════════════════════════
//  RELATÓRIO PRELIMINAR
// ══════════════════════════════════════════════════════════════
(function() {

    function gerarRelatorio() {
        const linhas = [];
        const agora  = new Date();
        const dataStr = agora.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
        const horaStr = agora.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });

        linhas.push('═══════════════════════════════════════════════════════════');
        linhas.push('   RELATÓRIO PRELIMINAR — ORNITOLOGIA AVANÇADA DE SC');
        linhas.push('═══════════════════════════════════════════════════════════');
        linhas.push('Gerado em: ' + dataStr + ' às ' + horaStr);
        linhas.push('');

        // ── Coletar dados da tabela ──────────────────────────────────────────
        const tableBody = document.querySelector('#phylo-table tbody') ||
                          document.querySelector('table tbody');
        const rows = tableBody ? Array.from(tableBody.querySelectorAll('tr')) : [];
        const speciesSet   = new Set();
        const genusSet     = new Set();
        const familySet    = new Set();
        const orderSet     = new Set();

        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            const rowData = {};
            inputs.forEach(inp => { if (inp.dataset.field) rowData[inp.dataset.field] = inp.value.trim(); });
            if (rowData.generoEspecie) {
                speciesSet.add(rowData.generoEspecie);
                const partes = rowData.generoEspecie.trim().split(' ');
                if (partes[0]) genusSet.add(partes[0]);
            }
            if (rowData.familia && rowData.familia !== 'Não informado') familySet.add(rowData.familia);
            if (rowData.ordem   && rowData.ordem   !== 'Não informado') orderSet.add(rowData.ordem);
        });

        linhas.push('───────────────────────────────────────────────────────────');
        linhas.push('  1. DIVERSIDADE TAXONÔMICA');
        linhas.push('───────────────────────────────────────────────────────────');
        if (speciesSet.size === 0) {
            linhas.push('  Nenhuma espécie importada ainda.');
        } else {
            linhas.push('  Número de espécies   : ' + speciesSet.size);
            linhas.push('  Número de gêneros    : ' + genusSet.size);
            linhas.push('  Número de famílias   : ' + familySet.size);
            linhas.push('  Número de ordens     : ' + orderSet.size);
            linhas.push('');
            linhas.push('  Espécies registradas:');
            Array.from(speciesSet).sort().forEach(sp => linhas.push('    • ' + sp));
            if (familySet.size > 0) {
                linhas.push('');
                linhas.push('  Famílias representadas:');
                Array.from(familySet).sort().forEach(f => linhas.push('    • ' + f));
            }
            if (orderSet.size > 0) {
                linhas.push('');
                linhas.push('  Ordens representadas:');
                Array.from(orderSet).sort().forEach(o => linhas.push('    • ' + o));
            }
        }
        linhas.push('');

        // ── Conservação ──────────────────────────────────────────────────────
        if (speciesSet.size > 0 && typeof conservationData !== 'undefined') {
            const specsArr = Array.from(speciesSet);
            const statusOrder = { CR:0, EN:1, VU:2, NT:3, LC:4, EW:5, EX:6, NE:7, DD:8 };

            function contarStatus(fonte) {
                const counts = {};
                specsArr.forEach(sp => {
                    const rec = conservationData.find(c =>
                        c.especie.toLowerCase() === sp.toLowerCase());
                    const st = rec ? (rec[fonte] || 'NE') : 'NE';
                    counts[st] = (counts[st] || 0) + 1;
                });
                return counts;
            }

            function sortedEntries(counts) {
                return Object.entries(counts).sort((a,b) => {
                    const oa = statusOrder[a[0]] !== undefined ? statusOrder[a[0]] : 99;
                    const ob = statusOrder[b[0]] !== undefined ? statusOrder[b[0]] : 99;
                    return oa - ob;
                });
            }

            const scCounts     = contarStatus('sc');
            const icmbioCounts = contarStatus('icmbio');
            const iucnCounts   = contarStatus('iucn');

            linhas.push('───────────────────────────────────────────────────────────');
            linhas.push('  2. STATUS DE CONSERVAÇÃO');
            linhas.push('───────────────────────────────────────────────────────────');
            linhas.push('  (CR=Criticamente Em Perigo | EN=Em Perigo | VU=Vulnerável');
            linhas.push('   NT=Quase Ameaçada | LC=Menos Preocupante | EW=Extinta na Natureza | NE=Não Avaliada)');
            linhas.push('');

            linhas.push('  ▸ SC — Santa Catarina:');
            sortedEntries(scCounts).forEach(([k,v]) => linhas.push('       ' + k + ': ' + v + ' espécie(s)'));

            linhas.push('');
            linhas.push('  ▸ ICMBio — Lista Nacional:');
            sortedEntries(icmbioCounts).forEach(([k,v]) => linhas.push('       ' + k + ': ' + v + ' espécie(s)'));

            linhas.push('');
            linhas.push('  ▸ IUCN — Lista Vermelha Global:');
            sortedEntries(iucnCounts).forEach(([k,v]) => linhas.push('       ' + k + ': ' + v + ' espécie(s)'));

            // Espécies ameaçadas (CR/EN/VU em qualquer fonte)
            const ameacados = ['CR','EN','VU'];
            const todasAmeacadasSet = new Set();
            specsArr.forEach(sp => {
                const r = conservationData.find(c => c.especie.toLowerCase() === sp.toLowerCase());
                if (r && (ameacados.includes(r.sc) || ameacados.includes(r.icmbio) || ameacados.includes(r.iucn))) {
                    todasAmeacadasSet.add(sp);
                }
            });
            if (todasAmeacadasSet.size > 0) {
                linhas.push('');
                linhas.push('  ⚠ Espécies ameaçadas (CR/EN/VU em qualquer lista):');
                Array.from(todasAmeacadasSet).sort().forEach(sp => {
                    const r = conservationData.find(c => c.especie.toLowerCase() === sp.toLowerCase());
                    const sc   = r ? r.sc    : 'NE';
                    const icm  = r ? r.icmbio: 'NE';
                    const iucn = r ? r.iucn  : 'NE';
                    linhas.push('    • ' + sp + '  [SC: ' + sc + ' | ICMBio: ' + icm + ' | IUCN: ' + iucn + ']');
                });
            }
            linhas.push('');
        }

        // ── Guildas ──────────────────────────────────────────────────────────
        if (speciesSet.size > 0 && typeof GUILDA_DB !== 'undefined') {
            const guildCounts   = {};
            const habitatCounts = {};
            speciesSet.forEach(sp => {
                const g = GUILDA_DB[sp];
                if (g) {
                    guildCounts[g.guilda]    = (guildCounts[g.guilda]    || 0) + 1;
                    habitatCounts[g.habitat] = (habitatCounts[g.habitat] || 0) + 1;
                }
            });
            if (Object.keys(guildCounts).length > 0) {
                linhas.push('───────────────────────────────────────────────────────────');
                linhas.push('  3. GUILDAS ALIMENTARES E HABITATS');
                linhas.push('───────────────────────────────────────────────────────────');
                linhas.push('  Guildas alimentares:');
                Object.entries(guildCounts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) =>
                    linhas.push('    • ' + k + ': ' + v + ' espécie(s)'));
                linhas.push('');
                linhas.push('  Habitats predominantes:');
                Object.entries(habitatCounts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) =>
                    linhas.push('    • ' + k + ': ' + v + ' espécie(s)'));
                linhas.push('');
            }
        }

        // ── Avistamentos ─────────────────────────────────────────────────────
        const av = window.AVISTAMENTOS || [];
        if (av.length > 0) {
            const avSpecies = new Set(av.map(a => a.scientificName || a.inputName).filter(Boolean));
            const avDates   = av.map(a => a.date).filter(Boolean).sort();
            linhas.push('───────────────────────────────────────────────────────────');
            linhas.push('  4. AVISTAMENTOS REGISTRADOS');
            linhas.push('───────────────────────────────────────────────────────────');
            linhas.push('  Total de registros      : ' + av.length);
            linhas.push('  Espécies distintas      : ' + avSpecies.size);
            if (avDates.length > 0) {
                linhas.push('  Período dos registros   : ' + avDates[0] + ' → ' + avDates[avDates.length - 1]);
            }
            const spCount = {};
            av.forEach(a => {
                const nm = a.scientificName || a.inputName || '?';
                spCount[nm] = (spCount[nm] || 0) + 1;
            });
            linhas.push('');
            linhas.push('  Frequência por espécie (top 20):');
            Object.entries(spCount).sort((a,b) => b[1]-a[1]).slice(0,20).forEach(([k,v]) =>
                linhas.push('    • ' + k + ': ' + v + ' registro(s)'));
            linhas.push('');
        }

        // ── Estimadores de riqueza (busca elementos na página) ───────────────
        const estimSelectors = [
            '#estimadores-result', '#estimator-result',
            '#chao-result', '#chao2-result', '#richness-result'
        ];
        let estimText = '';
        for (const sel of estimSelectors) {
            const el = document.querySelector(sel);
            if (el && el.textContent.trim()) { estimText = el.textContent.trim(); break; }
        }
        if (estimText) {
            linhas.push('───────────────────────────────────────────────────────────');
            linhas.push('  5. ESTIMATIVAS DE RIQUEZA');
            linhas.push('───────────────────────────────────────────────────────────');
            estimText.split('\n').forEach(l => linhas.push('  ' + l));
            linhas.push('');
        }

        // ── Árvore Filogenética ──────────────────────────────────────────
        if (speciesSet.size > 0) {
            // Organizar por Ordem > Família > Gênero a partir da tabela,
            // usando BIRD_DATABASE como fallback quando campos estão vazios.
            const treeMap = {}; // { ordem: { familia: { genero: count } } }
            rows.forEach(function(row) {
                const inputs = row.querySelectorAll('input');
                const d = {};
                inputs.forEach(function(inp) { if (inp.dataset.field) d[inp.dataset.field] = inp.value.trim(); });
                if (!d.generoEspecie) return;
                const genus = d.generoEspecie.trim().split(' ')[0] || 'sp.';

                let ordem   = (d.ordem   && d.ordem   !== 'Não informado') ? d.ordem   : '';
                let familia = (d.familia && d.familia !== 'Não informado') ? d.familia : '';

                // Fallback: buscar no BIRD_DATABASE pelo gênero
                if ((!ordem || !familia) && window.BIRD_DATABASE) {
                    const match = window.BIRD_DATABASE.find(function(b) {
                        return b.scientificName && b.scientificName.split(' ')[0] === genus;
                    });
                    if (match) {
                        if (!ordem)   ordem   = match.ordem   || '';
                        if (!familia) familia = match.familia || '';
                    }
                }

                if (!ordem)   ordem   = 'Ordem não identificada';
                if (!familia) familia = 'Família não identificada';

                if (!treeMap[ordem]) treeMap[ordem] = {};
                if (!treeMap[ordem][familia]) treeMap[ordem][familia] = {};
                treeMap[ordem][familia][genus] = (treeMap[ordem][familia][genus] || 0) + 1;
            });

            const ordensPresentes = new Set(Object.keys(treeMap));

            if (ordensPresentes.size > 0) {
                linhas.push('───────────────────────────────────────────────────────────');
                linhas.push('  6. ÁRVORE FILOGENÉTICA — TAXA REPRESENTADOS');
                linhas.push('───────────────────────────────────────────────────────────');
                linhas.push('  Apresenta apenas os taxa adicionados à análise.');
                linhas.push('  Clados intermediários mostrados quando têm representantes.');
                linhas.push('  Nível gênero/espécie exibido como contagem (N spp.).');
                linhas.push('');

                // ── renderizar ordens dentro de cada nó da filogenia ──────
                function renderOrdem(ordem, prefix, bar) {
                    const familiasArr = Object.keys(treeMap[ordem]).sort();
                    linhas.push(prefix + ' Ordem: ' + ordem);
                    familiasArr.forEach(function(familia, fi) {
                        const isLastFam = fi === familiasArr.length - 1;
                        const prefFam   = bar + (isLastFam ? '└─' : '├─');
                        const barFam    = bar + (isLastFam ? '   ' : '│  ');
                        const totalFam  = Object.values(treeMap[ordem][familia]).reduce(function(a,b){ return a+b; }, 0);
                        const nGen      = Object.keys(treeMap[ordem][familia]).length;
                        linhas.push(prefFam + ' Família: ' + familia +
                            '  [' + nGen + ' gênero(s), ' + totalFam + ' spp.]');
                        const generosArr = Object.keys(treeMap[ordem][familia]).sort();
                        generosArr.forEach(function(genero, gi) {
                            const isLastGen = gi === generosArr.length - 1;
                            const prefGen   = barFam + (isLastGen ? '└─' : '├─');
                            linhas.push(prefGen + ' ' + genero + ' (' + treeMap[ordem][familia][genero] + ' spp.)');
                        });
                    });
                }

                // ── travessia recursiva da filogenia ──────────────────────
                // Retorna lista de ordens presentes na sub-árvore deste nó
                function ordensNoNode(node) {
                    if (node.taxonLevel === 'ordem') {
                        return ordensPresentes.has(node.name) ? [node.name] : [];
                    }
                    if (!node.children) return [];
                    const resultado = [];
                    node.children.forEach(function(c) {
                        ordensNoNode(c).forEach(function(o) { resultado.push(o); });
                    });
                    return resultado;
                }

                function renderNode(node, indent, isLast) {
                    const prefix = indent + (isLast ? '└─' : '├─');
                    const bar    = indent + (isLast ? '   ' : '│  ');

                    if (node.taxonLevel === 'ordem') {
                        if (ordensPresentes.has(node.name)) {
                            renderOrdem(node.name, prefix, bar);
                            linhas.push('');
                        }
                        return;
                    }

                    // Nó intermediário (clado): só mostra se tem ordens presentes
                    const filhos = (node.children || []).filter(function(c) {
                        return ordensNoNode(c).length > 0;
                    });
                    if (filhos.length === 0) return;

                    linhas.push(prefix + ' [' + node.name + ']');
                    filhos.forEach(function(filho, i) {
                        renderNode(filho, bar, i === filhos.length - 1);
                    });
                }

                // Ponto de entrada: percorre a raiz da filogenia
                const phylo = window.avesPhylogeny;
                if (phylo && phylo.children) {
                    // Filtra clados de topo com representantes
                    const tops = phylo.children.filter(function(c) {
                        return ordensNoNode(c).length > 0;
                    });
                    tops.forEach(function(top, i) {
                        renderNode(top, '  ', i === tops.length - 1);
                    });
                } else {
                    // Fallback simples caso avesPhylogeny não esteja disponível
                    const ordensArr = Array.from(ordensPresentes).sort();
                    ordensArr.forEach(function(ordem, oi) {
                        const isLast = oi === ordensArr.length - 1;
                        renderOrdem(ordem, '  ' + (isLast ? '└─' : '├─'), '  ' + (isLast ? '   ' : '│  '));
                        linhas.push('');
                    });
                }

                // Ordens não identificadas ficam no final
                if (treeMap['Ordem não identificada']) {
                    renderOrdem('Ordem não identificada', '  └─', '     ');
                    linhas.push('');
                }
            }
        }

        linhas.push('═══════════════════════════════════════════════════════════');
        linhas.push('  Relatório gerado por Ornitologia Avançada de SC');
        linhas.push('  https://brennobenk.github.io/OrnitologiaSantaCatarina/');
        linhas.push('═══════════════════════════════════════════════════════════');

        return linhas.join('\n');
    }

    function abrirModalRelatorio() {
        const modal   = document.getElementById('report-modal');
        const preview = document.getElementById('report-preview');
        if (!modal || !preview) return;
        const texto = gerarRelatorio();
        preview.textContent = texto;
        ['help-modal','config-modal','download-charts-modal'].forEach(id => {
            const m = document.getElementById(id);
            if (m) m.style.display = 'none';
        });
        modal.style.display = 'block';
    }

    document.addEventListener('DOMContentLoaded', function() {
        const btn = document.getElementById('report-btn');
        if (btn) btn.addEventListener('click', abrirModalRelatorio);

        const closeBtn = document.getElementById('close-report-modal');
        if (closeBtn) closeBtn.addEventListener('click', function() {
            document.getElementById('report-modal').style.display = 'none';
        });

        window.addEventListener('click', function(e) {
            const modal = document.getElementById('report-modal');
            if (modal && e.target === modal) modal.style.display = 'none';
        });

        const dlBtn = document.getElementById('report-download-btn');
        if (dlBtn) dlBtn.addEventListener('click', function() {
            const preview = document.getElementById('report-preview');
            const texto = preview ? preview.textContent : '';
            if (!texto) return;
            const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            const data = new Date().toISOString().slice(0,10);
            a.href     = url;
            a.download = 'relatorio_ornitologia_' + data + '.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 2000);
        });
    });

})();

        function loadExampleData() {
    // Número de espécies a sortear (entre 5 e 10)
    const numExamples = Math.floor(Math.random() * 6) + 5; // 5 a 10
    // Embaralhar o banco de dados e pegar os primeiros numExamples
    const shuffled = [...BIRD_DATABASE].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numExamples).map(b => b.scientificName);
    
    if (currentMode === 'basic') {
        importDataTextarea.value = selected.join('\n');
    } else {
        // Modo avançado: precisa de mais colunas. Vamos construir linhas completas.
        const lines = selected.map(sciName => {
            const bird = BIRD_DATABASE.find(b => b.scientificName === sciName);
            return `${bird.filo}\t${bird.classe}\t${bird.ordem}\t${bird.familia}\t${bird.subfamilia || ''}\t${bird.scientificName}`;
        });
        importDataTextarea.value = lines.join('\n');
    }
    updateImportTextareaStats();
}

        function updateImportTextareaStats() {
            const text = importDataTextarea.value.trim();
            if (!text) {
                lineCountSpan.textContent = "0 linhas detectadas";
                columnCountSpan.textContent = ", 0 colunas por linha";
                return;
            }
            const lines = text.split('\n').filter(l => l.trim() !== '');
            lineCountSpan.textContent = `${lines.length} linhas detectadas`;
            if (lines.length > 0) {
                if (currentMode === 'basic') {
                    columnCountSpan.textContent = ", 1 coluna por linha";
                } else {
                    const cols = lines[0].split('\t').length;
                    columnCountSpan.textContent = `, ${cols} colunas por linha`;
                }
            }
        }

        // ==================== FUNÇÕES DE CONSTRUÇÃO DA ÁRVORE ====================
        function collectTableData() {
    const rows = tableBody.querySelectorAll('tr');
    const data = [];
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const rowData = {};
        
        // Primeiro, coleta os valores dos inputs
        inputs.forEach(inp => {
            if (inp.dataset.field) {
                rowData[inp.dataset.field] = inp.value.trim();
            }
        });

        // Agora, se existir generoEspecie, extrai gênero e espécie
        if (rowData.generoEspecie) {
            const nomeCompleto = rowData.generoEspecie.trim();
            const partes = nomeCompleto.split(' ');
            if (partes.length >= 1) {
                rowData.genero = partes[0]; // Primeira palavra = gênero
            }
            if (partes.length >= 2) {
                // O resto é a espécie (pode ter mais de uma palavra, ex: "leucomelas" ou "albicollis")
                rowData.especie = partes.slice(1).join(' ');
            } else {
                rowData.especie = ''; // Se não houver espécie, deixa vazio
            }
        }

        // Só adiciona se tiver generoEspecie (para não incluir linhas vazias)
        if (rowData.generoEspecie) data.push(rowData);
    });
    return data;
}

        function getSelectedColumns() {
            return columnsConfig.filter(col => col.selected).map(col => col.id);
        }

        function buildHierarchicalTree(data) {
            const selectedColumns = getSelectedColumns();
            if (selectedColumns.length === 0) return {};
            const tree = {};
            data.forEach(item => {
                let currentLevel = tree;
                selectedColumns.forEach((col, idx) => {
                    const value = item[col] || 'Não informado';
                    if (idx === selectedColumns.length - 1) {
                        if (!currentLevel[value]) currentLevel[value] = [];
                        if (value && !currentLevel[value].includes(value)) currentLevel[value].push(value);
                    } else {
                        if (!currentLevel[value]) currentLevel[value] = {};
                        currentLevel = currentLevel[value];
                    }
                });
            });
            return tree;
        }

        function renderHierarchicalTree(tree) {
            const selectedColumns = getSelectedColumns();
            if (selectedColumns.length === 0) return '<p style="color:#e74c3c;">Nenhuma coluna selecionada.</p>';
            if (Object.keys(tree).length === 0) return '<p style="color:#e74c3c;">Nenhum dado.</p>';
            let html = '<div class="hierarchical-tree">';
            function renderNode(node, depth, colIdx) {
                if (colIdx >= selectedColumns.length) return '';
                const colId = selectedColumns[colIdx];
                const colConf = columnsConfig.find(c => c.id === colId);
                const label = colConf ? colConf.label : colId;
                const color = colConf ? colConf.color : '#95a5a6';
                let nodeHtml = '';
                Object.keys(node).forEach(key => {
                    const val = node[key];
                    const isLast = colIdx === selectedColumns.length - 1;
                    nodeHtml += `<div class="node ${colId}" style="margin-left:${depth*20}px; border-left-color:${color} !important;">`;
                    nodeHtml += `<div class="node-content"><div class="node-title">${label}: ${key}</div>`;
                    if (isLast && Array.isArray(val) && val.length) {
                        const itemsHtml = val.map(v => {
    let displayName = v;
    if (showPopularNames && speciesInfo[v]) {
        displayName = `${v} (${speciesInfo[v].nomePopular})`;
    }
    return `<span>${displayName}</span>`;
}).join('');
nodeHtml += '<div class="node-items">' + itemsHtml + '</div>';
                    } else if (!isLast) {
                        nodeHtml += renderNode(val, depth+1, colIdx+1);
                    }
                    nodeHtml += '</div></div>';
                });
                return nodeHtml;
            }
            html += renderNode(tree, 0, 0);
            html += '</div>';
            return html;
        }

        // Função para podar a árvore, removendo nós sem filhos (exceto a raiz)
        function pruneTree(node) {
    // 1. Se for uma espécie (folha), mantém
    if (node.taxonLevel === 'generoEspecie') {
        return node;
    }

    // 2. Se não tem filhos, é um nó vazio (ordem, família, etc.) → remove
    if (!node.children || node.children.length === 0) {
        return null;
    }

    // 3. Poda os filhos recursivamente
    const newChildren = [];
    node.children.forEach(child => {
        const prunedChild = pruneTree(child);
        if (prunedChild) {
            newChildren.push(prunedChild);
        }
    });

    // 4. Se após podar os filhos, nenhum restou, e o nó não é especial (raiz ou classe), remove
    if (newChildren.length === 0) {
        // Mantém apenas nós de alto nível (raiz e classe "AVES") mesmo vazios? 
        // No modo "apenas adicionados", queremos remover tudo que não leva a uma espécie.
        // Então, mesmo a classe "AVES" se ficar vazia, deve ser removida? 
        // Mas se a classe "AVES" ficar vazia, significa que não há aves, então a árvore inteira deve sumir.
        // No entanto, podemos ter outros organismos. Vamos simplificar: removemos qualquer nó sem filhos,
        // exceto a raiz principal ("Organismos") que deve sempre existir.
        if (node.taxonLevel === 'root') {
            return { ...node, children: [] }; // raiz mantida mesmo vazia
        }
        return null; // qualquer outro nó sem filhos é removido
    }

// 5. Retorna o nó com os filhos podados
    return { ...node, children: newChildren };
}

function pruneTree(node) {
    // Mantém nós de espécie (novo formato) e também o antigo generoEspecie para compatibilidade
    if (node.taxonLevel === 'especie' || node.taxonLevel === 'generoEspecie') {
        return node;
    }
    if (!node.children || node.children.length === 0) {
        return null;
    }
    const newChildren = [];
    node.children.forEach(child => {
        const prunedChild = pruneTree(child);
        if (prunedChild) {
            newChildren.push(prunedChild);
        }
    });
    if (newChildren.length === 0) {
        if (node.taxonLevel === 'root') {
            return { ...node, children: [] };
        }
        return null;
    }
    return { ...node, children: newChildren };
}

function buildGenealogicalTree(data) {
    if (data.length === 0) return { name: "Nenhum dado", children: [] };
    const avesData = data.filter(item => item.classe && item.classe.toLowerCase() === "aves");
    const otherData = data.filter(item => item.classe && item.classe.toLowerCase() !== "aves");
    const root = { name: "Chordata", taxonLevel: "root", children: [] };

    if (avesData.length > 0) {
        const avesTree = JSON.parse(JSON.stringify(avesPhylogeny));
        avesData.forEach(item => {
            const ordem = item.ordem || '';
            const familia = item.familia || '';
            const subfamilia = item.subfamilia || '';
            // Usa os campos separados: genero e especie (extraídos em collectTableData)
            const genero = item.genero || '';
            const especie = item.especie || '';
            if (!ordem) return;

            // Função auxiliar para encontrar nó por nome (case-insensitive)
            function findNodeByName(node, targetName, level) {
                if (node.name.trim().toLowerCase() === targetName.trim().toLowerCase() && node.taxonLevel === level) {
                    return node;
                }
                if (node.children) {
                    for (let child of node.children) {
                        let found = findNodeByName(child, targetName, level);
                        if (found) return found;
                    }
                }
                return null;
            }

            // Tenta encontrar a ordem na árvore
            let ordemNode = findNodeByName(avesTree, ordem, "ordem");
            if (!ordemNode) {
                console.warn(`Ordem "${ordem}" não encontrada na filogenia. Criando nó temporário.`);
                if (!avesTree.children) avesTree.children = [];
                ordemNode = { name: ordem, taxonLevel: "ordem", children: [] };
                avesTree.children.push(ordemNode);
            }

            // Agora adiciona família/subfamília/gênero/espécie
            if (!ordemNode.children) ordemNode.children = [];
            let famNode = ordemNode.children.find(n => n.name.trim().toLowerCase() === familia.trim().toLowerCase() && n.taxonLevel === "familia");
            if (!famNode && familia) {
                famNode = { name: familia, taxonLevel: "familia", children: [] };
                ordemNode.children.push(famNode);
            }

            if (familia && subfamilia) {
                if (!famNode.children) famNode.children = [];
                let subNode = famNode.children.find(n => n.name.trim().toLowerCase() === subfamilia.trim().toLowerCase() && n.taxonLevel === "subfamilia");
                if (!subNode) {
                    subNode = { name: subfamilia, taxonLevel: "subfamilia", children: [] };
                    famNode.children.push(subNode);
                }
                // Agora adiciona gênero
                if (genero) {
                    if (!subNode.children) subNode.children = [];
                    let genNode = subNode.children.find(n => n.name.trim().toLowerCase() === genero.trim().toLowerCase() && n.taxonLevel === "genero");
                    if (!genNode) {
                        genNode = { name: genero, taxonLevel: "genero", children: [] };
                        subNode.children.push(genNode);
                    }
                    // Adiciona a espécie sob o gênero
                    if (especie && !genNode.children.find(n => n.name === especie)) {
    genNode.children.push({ 
        name: especie,                      // epíteto (para exibição)
        taxonLevel: "especie" 
    });
}
                }
            } else if (familia) {
                if (!famNode.children) famNode.children = [];
                if (genero) {
                    let genNode = famNode.children.find(n => n.name.trim().toLowerCase() === genero.trim().toLowerCase() && n.taxonLevel === "genero");
                    if (!genNode) {
                        genNode = { name: genero, taxonLevel: "genero", children: [] };
                        famNode.children.push(genNode);
                    }
                    if (especie && !genNode.children.find(n => n.name === especie)) {
    genNode.children.push({ 
        name: especie,                      // epíteto (para exibição)
        fullScientificName: item.generoEspecie, // nome completo (para busca)
        taxonLevel: "especie" 
    });
}
                }
            }
        });
        root.children.push(avesTree);
    }

    if (otherData.length > 0) {
        const outrosNode = { name: "Outros Organismos", taxonLevel: "outros", children: [] };
        otherData.forEach(item => {
            const classe = item.classe || '';
            const ordem = item.ordem || '';
            const especie = item.generoEspecie || ''; // Para outros, mantém o campo original
            if (!classe) return;
            let classeNode = outrosNode.children.find(n => n.name.trim().toLowerCase() === classe.trim().toLowerCase() && n.taxonLevel === "classe");
            if (!classeNode) {
                classeNode = { name: classe, taxonLevel: "classe", children: [] };
                outrosNode.children.push(classeNode);
            }
            if (ordem) {
                let ordemNode = classeNode.children.find(n => n.name.trim().toLowerCase() === ordem.trim().toLowerCase() && n.taxonLevel === "ordem");
                if (!ordemNode) {
                    ordemNode = { name: ordem, taxonLevel: "ordem", children: [] };
                    classeNode.children.push(ordemNode);
                }
                if (especie && !ordemNode.children.find(n => n.name === especie)) {
                    ordemNode.children.push({ name: especie, taxonLevel: "generoEspecie" });
                }
            }
        });
        root.children.push(outrosNode);
    }
    return root;
}

function renderGenealogicalTree(treeData) {
    try {
        treeDisplay.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'genealogical-tree';
        container.id = 'd3-tree-container';
        treeDisplay.appendChild(container);

        const width = 1600, height = 1000;
        const svg = d3.select('#d3-tree-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('id', 'genealogical-svg')
            .style('background-color', '#f5f7e9')
            .style('cursor', 'grab');

        const g = svg.append('g').attr('transform', 'translate(150,80)');
        const zoom = d3.zoom().scaleExtent([0.2,3]).on('zoom', (e) => g.attr('transform', e.transform));
        svg.call(zoom);
        genealogicalZoom = zoom;
        genealogicalSvg = svg;

        const tree = d3.tree().nodeSize([70, 240]);
        const root = d3.hierarchy(treeData);
        const treeDataHierarchy = tree(root);
        treeDataHierarchy.descendants().forEach(d => { d.x = d.x - (root.height * 70 / 2); });

        // Links sempre curvos
        g.selectAll('.link')
            .data(treeDataHierarchy.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x))
            .style('fill', 'none').style('stroke', '#95a5a6').style('stroke-width', '2px');

        const node = g.selectAll('.node')
            .data(treeDataHierarchy.descendants())
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.y},${d.x})`);

        function getNodeColor(d) {
            const level = d.data.taxonLevel;
            const cfg = columnsConfig.find(c => c.id === level);
            return cfg ? cfg.color : '#95a5a6';
        }

        node.append('circle')
            .attr('r', d => d.children ? 8 : 6)
            .style('fill', getNodeColor)
            .style('stroke', '#fff')
            .style('stroke-width', '2px')
            .style('cursor', 'pointer');

        node.append('text')
    .attr('dy', d => d.children ? -15 : 18)
    .attr('dx', d => d.children ? -10 : 10)
    .style('text-anchor', d => d.children ? 'end' : 'start')
    .style('font-size', '13px')
    .style('font-weight', d => d.depth===0 ? 'bold' : 'normal')
    .style('fill', '#2c3e2f')
    .style('paint-order', 'stroke')
    .style('stroke', 'white').style('stroke-width', '2px')
    .text(d => {
    // Se for um nó de espécie
    if (d.data.taxonLevel === 'especie') {
        // Reconstrói o nome científico completo: gênero (pai) + epíteto (atual)
        const genero = d.parent ? d.parent.data.name : '';
        const nomeCientifico = genero ? `${genero} ${d.data.name}` : d.data.name;

        if (showPopularNames && speciesInfo[nomeCientifico]) {
            // Exibe: epíteto (nome popular)
            return `${d.data.name} (${speciesInfo[nomeCientifico].nomePopular})`;
        }
        // Se não houver nome popular ou o interruptor estiver desligado, mostra só o epíteto
        return d.data.name;
    }
    // Para outros níveis (gênero, família, ordem...), mostra o nome normal
    return d.data.name;
})

        const zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';
        zoomControls.innerHTML = '<button class="zoom-btn" id="zoom-in">+</button><button class="zoom-btn" id="zoom-out">−</button>';
        container.appendChild(zoomControls);
        document.getElementById('zoom-in').addEventListener('click', () => {
            svg.transition().duration(300).call(zoom.scaleBy, 1.2);
        });
        document.getElementById('zoom-out').addEventListener('click', () => {
            svg.transition().duration(300).call(zoom.scaleBy, 0.8);
        });

        const taxonLevels = new Set();
        treeDataHierarchy.descendants().forEach(d => {
            if (d.data.taxonLevel && !['root','outros'].includes(d.data.taxonLevel)) taxonLevels.add(d.data.taxonLevel);
        });
        updateLegend(taxonLevels);
        logDebug('Árvore Filogenética renderizada');
    } catch (error) {
        logDebug(`Erro na árvore Filogenética: ${error.message}`, 'error');
        treeDisplay.innerHTML = `<p style="color:#e74c3c;">Erro ao gerar árvore: ${error.message}</p>`;
    }
}

function updateLegend(taxonLevelsPresent) {
    const legendDiv = document.querySelector('.legend');
    if (!legendDiv) return;
    const levelLabels = { 
        filo: 'Filo', 
        classe: 'Classe', 
        ordem: 'Ordem', 
        familia: 'Família', 
        subfamilia: 'Subfamília', 
        genero: 'Gênero', 
        especie: 'Espécie',
        generoEspecie: 'Gênero/Espécie' // mantido para compatibilidade
    };
    let html = '';
    // Inclui todos os níveis possíveis, mas só mostra se estiverem presentes
    ['filo','classe','ordem','familia','subfamilia','genero','especie','generoEspecie'].forEach(level => {
        if (taxonLevelsPresent.has(level)) {
            const cfg = columnsConfig.find(c => c.id === level);
            html += `<div class="legend-item"><div class="legend-color" style="background:${cfg ? cfg.color : '#95a5a6'};"></div><span>${levelLabels[level] || level}</span></div>`;
        }
    });
    legendDiv.innerHTML = html || '<p>Nenhum nível</p>';
}

function showTreeLoading() {
    let loadingDiv = document.getElementById('tree-loading');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'tree-loading';
        loadingDiv.className = 'tree-loading';
        loadingDiv.innerHTML = '<div class="spinner"></div><p>Gerando árvore...</p>';
        document.getElementById('tree-container').appendChild(loadingDiv);
    }
    loadingDiv.style.display = 'flex';
}
function hideTreeLoading() {
    const loadingDiv = document.getElementById('tree-loading');
    if (loadingDiv) loadingDiv.style.display = 'none';
}

function generateTree() {
    const data = collectTableData();
    console.log('Dados coletados:', data);
    showTreeLoading();
    setTimeout(() => {
        try {
            const data = collectTableData();
            const selected = getSelectedColumns();
            if (data.length === 0) { 
                treeDisplay.innerHTML = '<p style="text-align: center; color: #7f8c8d; margin-top: 150px;">Adicione dados para visualizar a árvore.</p>';
                hideTreeLoading();
                return; 
            }
            if (selected.length === 0) { 
                treeDisplay.innerHTML = '<p style="color:#e74c3c;">Selecione colunas.</p>';
                hideTreeLoading();
                return; 
            }
            currentTreeData = { data, selected, type: currentTreeType };
            if (currentTreeType === 'hierarchical') {
                const tree = buildHierarchicalTree(data);
                treeDisplay.innerHTML = renderHierarchicalTree(tree);
            } else {
                let tree = buildGenealogicalTree(data);
                if (genealogicalViewMode === 'user') {
                    tree = pruneTree(tree);
                }
                renderGenealogicalTree(tree);
            }
            checkTaxonomicWarnings();
            // Atualizar tabela de conservação
renderConservationTableFromInput(currentConservationSort);
        } catch (error) {
            logDebug(`Erro em generateTree: ${error.message}`, 'error');
            treeDisplay.innerHTML = `<p style="color:#e74c3c;">Erro: ${error.message}</p>`;
        }
        
        hideTreeLoading();
    }, 100);
    
}

function renderDistributionCharts(rows) {
    if (chartOrdemBar) chartOrdemBar.destroy();
    if (chartOrdemPie) chartOrdemPie.destroy();
    if (chartFamiliaBar) chartFamiliaBar.destroy();
    if (chartFamiliaPie) chartFamiliaPie.destroy();

    if (!rows || rows.length === 0) {
        ['ordemBarChart', 'ordemPieChart', 'familiaBarChart', 'familiaPieChart'].forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });
        return;
    }

    // Contagem de ordens
    const ordemCount = {};
    rows.forEach(r => { const ordem = r.ordem || 'Desconhecida'; ordemCount[ordem] = (ordemCount[ordem] || 0) + 1; });
    const sortedOrdens = Object.entries(ordemCount).sort((a, b) => b[1] - a[1]);
    const ordensLabels = sortedOrdens.map(([nome]) => nome);
    const ordensData = sortedOrdens.map(([, count]) => count);

    // Contagem de famílias
    const familiaCount = {};
    rows.forEach(r => { const familia = r.familia || 'Desconhecida'; familiaCount[familia] = (familiaCount[familia] || 0) + 1; });
    const sortedFamilias = Object.entries(familiaCount).sort((a, b) => b[1] - a[1]);
    const familiasLabels = sortedFamilias.map(([nome]) => nome);
    const familiasData = sortedFamilias.map(([, count]) => count);

    // Gerar mapas de cores consistentes
    const ordemColorMap = generateColorMap(ordensLabels);
const familiaColorMap = generateColorMap(familiasLabels);

    // Gráfico de barras - Ordens
    const ctxOrdemBar = document.getElementById('ordemBarChart').getContext('2d');
    chartOrdemBar = new Chart(ctxOrdemBar, {
        type: 'bar',
        data: {
            labels: ordensLabels,
            datasets: [{
                label: 'Número de espécies',
                data: ordensData,
                backgroundColor: ordensLabels.map(cat => ordemColorMap[cat]),
                borderColor: '#2d5a2d',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, stepSize: 1, title: { display: true, text: 'Espécies' } } },
            plugins: {
                datalabels: {
                    anchor: 'center',
                    align: 'center',
                    color: 'white',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value) => value
                }
            }
        }
    });

    // Gráfico de pizza - Ordens
    const ctxOrdemPie = document.getElementById('ordemPieChart').getContext('2d');
    chartOrdemPie = new Chart(ctxOrdemPie, {
        type: 'pie',
        data: {
            labels: ordensLabels.map((label, i) => `${label} (${ordensData[i]})`),
            datasets: [{
                data: ordensData,
                backgroundColor: ordensLabels.map(cat => ordemColorMap[cat]),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: getPieChartOptions() // reutiliza a mesma função
    });

    // Gráfico de barras - Famílias
    const ctxFamiliaBar = document.getElementById('familiaBarChart').getContext('2d');
    chartFamiliaBar = new Chart(ctxFamiliaBar, {
        type: 'bar',
        data: {
            labels: familiasLabels,
            datasets: [{
                label: 'Número de espécies',
                data: familiasData,
                backgroundColor: familiasLabels.map(cat => familiaColorMap[cat]),
                borderColor: '#2d5a2d',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, stepSize: 1, title: { display: true, text: 'Espécies' } } },
            plugins: {
                datalabels: {
                    anchor: 'center',
                    align: 'center',
                    color: 'white',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value) => value
                }
            }
        }
    });

    // Gráfico de pizza - Famílias
    const ctxFamiliaPie = document.getElementById('familiaPieChart').getContext('2d');
    chartFamiliaPie = new Chart(ctxFamiliaPie, {
        type: 'pie',
        data: {
            labels: familiasLabels.map((label, i) => `${label} (${familiasData[i]})`),
            datasets: [{
                data: familiasData,
                backgroundColor: familiasLabels.map(cat => familiaColorMap[cat]),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: getPieChartOptions()
    });
}

function scheduleTreeUpdate() {
    if (treeUpdateTimer) clearTimeout(treeUpdateTimer);
    treeUpdateTimer = setTimeout(generateTree, 500);
}

        // ==================== AVISOS DE CORREÇÃO TAXONÔMICA ====================
        function checkTaxonomicWarnings() {
            const data = collectTableData();
            let warnings = [];
            data.forEach(item => {
                const especie = item.generoEspecie;
                const match = BIRD_DATABASE.find(b => b.scientificName.toLowerCase() === especie.toLowerCase());
                if (match) {
                    if (item.filo && item.filo !== match.filo) warnings.push(`Espécie <span>${especie}</span>: Filo "${item.filo}" ≠ correto "${match.filo}"`);
                    if (item.classe && item.classe !== match.classe) warnings.push(`Espécie <span>${especie}</span>: Classe "${item.classe}" ≠ correta "${match.classe}"`);
                    if (item.ordem && item.ordem !== match.ordem) warnings.push(`Espécie <span>${especie}</span>: Ordem "${item.ordem}" ≠ correta "${match.ordem}"`);
                    if (item.familia && item.familia !== match.familia) warnings.push(`Espécie <span>${especie}</span>: Família "${item.familia}" ≠ correta "${match.familia}"`);
                    if (item.subfamilia && item.subfamilia !== match.subfamilia && match.subfamilia) warnings.push(`Espécie <span>${especie}</span>: Subfamília "${item.subfamilia}" ≠ correta "${match.subfamilia}"`);
                }
            });
            if (warnings.length) {
                taxoWarningsDiv.style.display = 'block';
                taxoWarningsDiv.innerHTML = '<strong>Avisos de correção:</strong><br>' + warnings.join('<br>');
            } else {
                taxoWarningsDiv.style.display = 'none';
            }
        }

        // ==================== TABELA DE CONSERVAÇÃO ====================
        function renderConservationTableFromInput(sortMode = 'alpha') {
    // Garantir que o container da tabela de conservação esteja visível
    const container = document.getElementById('conservation-table-container');
    if (container) container.style.display = 'block';

    const data = collectTableData();
    const especies = data.map(item => item.generoEspecie).filter(e => e && e.trim() !== "");
    const especiesUnicas = [...new Set(especies)];
    conservationTableBody.innerHTML = '';

    const rows = [];
    especiesUnicas.forEach(especie => {
        const info = speciesInfo[especie];
        if (info) {
            rows.push({
                ordem: info.ordem,
                familia: info.familia,
                subfamilia: info.subfamilia || '',
                scientific: especie,
                common: info.nomePopular,
                sc: info.sc,
                icmbio: info.icmbio,
                iucn: info.iucn
            });
        } else {
            rows.push({ ordem: '---', familia: '---', subfamilia: '---', scientific: especie, common: '---', sc: 'NE', icmbio: 'NE', iucn: 'NE' });
        }
    });

    // Ordenação
    if (sortMode === 'alpha') {
        rows.sort((a,b) => a.scientific.localeCompare(b.scientific));
    } else if (sortMode === 'conserv_asc') {
        const w = { 'LC':1, 'NT':2, 'VU':3, 'EN':4, 'CR':5, 'DD':0, 'NE':0 };
        rows.sort((a,b) => (w[a.iucn]||0) - (w[b.iucn]||0));
    } else if (sortMode === 'conserv_desc') {
        const w = { 'LC':1, 'NT':2, 'VU':3, 'EN':4, 'CR':5, 'DD':0, 'NE':0 };
        rows.sort((a,b) => (w[b.iucn]||0) - (w[a.iucn]||0));
    }

    rows.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.ordem}</td><td>${r.familia}</td><td>${r.subfamilia}</td><td>${r.scientific}</td><td>${r.common}</td><td class="status-sc status-${r.sc}">${r.sc}</td><td class="status-icmbio status-${r.icmbio}">${r.icmbio}</td><td class="status-iucn status-${r.iucn}">${r.iucn}</td>`;
        conservationTableBody.appendChild(tr);
    });
renderAllCharts(rows);
}

        // ==================== MAIS INFORMAÇÕES (WIKIAVES) ====================
        function openMoreInfoModal() {
            const data = collectTableData();
            const especies = data.map(item => item.generoEspecie).filter(e => e && e.trim() !== "");
            const especiesUnicas = [...new Set(especies)];
            moreInfoTable.innerHTML = '';
            let html = '<table class="conservation-table"><tr><th>#</th><th>Nome Popular</th><th>Link WikiAves</th></tr>';
            especiesUnicas.forEach((esp, idx) => {
                const info = speciesInfo[esp];
                const common = info ? info.nomePopular : '---';
                const link = info ? `https://www.wikiaves.com.br/wiki/${info.nomePopular.replace(/ /g, '-').toLowerCase()}` : '#';
                html += `<tr><td>${idx+1}</td><td>${common}</td><td><a href="${link}" target="_blank">${link}</a></td></tr>`;
            });
            html += '</table>';
            moreInfoTable.innerHTML = html;
            moreInfoModal.style.display = 'block';
        }

        // ==================== EXPORTAR CSV ====================
        function exportCSV() {
            const rows = [];
            const headers = ['Ordem', 'Família', 'Subfamília', 'Nome científico', 'Nome Popular', 'SC', 'ICMBio', 'IUCN'];
            rows.push(headers.join(','));

            const data = collectTableData();
            const especies = data.map(item => item.generoEspecie).filter(e => e && e.trim() !== "");
            const especiesUnicas = [...new Set(especies)];

            especiesUnicas.forEach(especie => {
                const info = speciesInfo[especie];
                if (info) {
                    const row = [
                        info.ordem,
                        info.familia,
                        info.subfamilia || '',
                        especie,
                        info.nomePopular,
                        info.sc,
                        info.icmbio,
                        info.iucn
                    ];
                    rows.push(row.map(cell => `"${cell}"`).join(','));
                } else {
                    rows.push(`"---","---","---","${especie}","---","NE","NE","NE"`);
                }
            });

            const csvContent = rows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'conservacao.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }


        // Copiar tabela taxonômica para área de transferência
document.getElementById('copy-taxonomy-table').addEventListener('click', copyTaxonomyTable);

function copyTaxonomyTable() {
    const table = document.getElementById('taxonomy-table');
    const isBasicMode = table.classList.contains('basic-mode');
    const rows = [];
    
    // --- Cabeçalhos ---
    const headers = [];
    if (isBasicMode) {
        // Modo básico: apenas o cabeçalho da coluna "Gênero/Espécie"
        const speciesTh = table.querySelector('th.species-col');
        if (speciesTh) {
            headers.push(speciesTh.textContent.trim());
        }
    } else {
        // Modo avançado: todos os cabeçalhos, exceto o último (Ações)
        const headerCells = table.querySelectorAll('thead th');
        for (let i = 0; i < headerCells.length - 1; i++) {
            headers.push(headerCells[i].textContent.trim());
        }
    }
    rows.push(headers.join('\t'));

    // --- Linhas de dados ---
    const bodyRows = table.querySelectorAll('tbody tr');
    bodyRows.forEach(tr => {
        const rowData = [];
        if (isBasicMode) {
            // Pega apenas a célula da espécie
            const speciesCell = tr.querySelector('td.species-col');
            if (speciesCell) {
                const input = speciesCell.querySelector('input');
                rowData.push(input ? input.value : speciesCell.textContent.trim());
            }
        } else {
            // Pega todas as células de dados (ignora a última, que é o botão)
            const cells = tr.querySelectorAll('td');
            for (let i = 0; i < cells.length - 1; i++) {
                const input = cells[i].querySelector('input');
                rowData.push(input ? input.value : cells[i].textContent.trim());
            }
        }
        rows.push(rowData.join('\t'));
    });

    const textToCopy = rows.join('\n');

    // Copia para a área de transferência
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Tabela copiada para a área de transferência!');
        }).catch(() => {
            fallbackCopy(textToCopy);
        });
    } else {
        fallbackCopy(textToCopy);
    }
}

// Copiar tabela de conservação
document.getElementById('copy-conservation-table').addEventListener('click', copyConservationTable);

function copyConservationTable() {
    const table = document.querySelector('.conservation-table');
    if (!table) return;
    const rows = [];
    
    // Cabeçalhos
    const headers = [];
    const headerCells = table.querySelectorAll('thead th');
    headerCells.forEach(th => headers.push(th.textContent.trim()));
    rows.push(headers.join('\t'));
    
    // Linhas de dados
    const bodyRows = table.querySelectorAll('tbody tr');
    bodyRows.forEach(tr => {
        const cells = tr.querySelectorAll('td');
        const rowData = [];
        cells.forEach(td => rowData.push(td.textContent.trim()));
        rows.push(rowData.join('\t'));
    });
    
    const textToCopy = rows.join('\n');
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Tabela de conservação copiada!');
        }).catch(() => {
            fallbackCopy(textToCopy);
        });
    } else {
        fallbackCopy(textToCopy);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert('Tabela copiada!');
    } catch (err) {
        alert('Erro ao copiar: ' + err);
    }
    document.body.removeChild(textarea);
}

        // ==================== MODAL DE CONSULTA ====================
        function openQueryModal() {
            renderQueryTable('');
            queryModal.style.display = 'block';
        }

        function renderQueryTable(filter) {
            const normFilter = normalizeForSearch(filter);
            const filtered = BIRD_DATABASE.filter(item => 
                normalizeForSearch(item.scientificName + ' ' + item.commonName).includes(normFilter)
            );
            filtered.sort((a,b) => a.scientificName.localeCompare(b.scientificName));
            let html = '';
            filtered.forEach(item => {
                const wikiLink = `https://www.wikiaves.com.br/wiki/${item.commonName.replace(/ /g, '-').toLowerCase()}`;
                html += `<tr onclick="addSpeciesFromQuery('${item.scientificName}')">`;
                html += `<td>${item.ordem}</td>`;
                html += `<td>${item.familia}</td>`;
                html += `<td>${item.subfamilia || ''}</td>`;
                html += `<td>${item.scientificName}</td>`;
                html += `<td>${item.commonName}</td>`;
                html += `<td><a href="${wikiLink}" target="_blank" class="query-link" onclick="event.stopPropagation();">Link</a></td>`;
                html += `</tr>`;
            });
            queryTableBody.innerHTML = html;
        }

        window.addSpeciesFromQuery = function(sciName) {
            const match = BIRD_DATABASE.find(b => b.scientificName === sciName);
            if (match) {
                addTableRow({
                    filo: match.filo,
                    classe: match.classe,
                    ordem: match.ordem,
                    familia: match.familia,
                    subfamilia: match.subfamilia || '',
                    generoEspecie: match.scientificName
                });
            }
            queryModal.style.display = 'none';
        };

        querySearch.addEventListener('input', (e) => {
            renderQueryTable(e.target.value);
        });

        querySpeciesBtn.addEventListener('click', openQueryModal);
        closeQueryModal.addEventListener('click', () => queryModal.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target === queryModal) queryModal.style.display = 'none';
        });

        // ==================== EVENT LISTENERS ====================
        processImportBtn.addEventListener('click', processImportedData);
        window.processImportedData = processImportedData; // expõe globalmente
        importExampleBtn.addEventListener('click', loadExampleData);
        clearImportBtn.addEventListener('click', () => { importDataTextarea.value = ""; updateImportTextareaStats(); });
        importDataTextarea.addEventListener('input', updateImportTextareaStats);
        addRowBtn.addEventListener('click', () => addTableRow());
        clearDataBtn.addEventListener('click', () => {
            if (confirm("Limpar tabela?")) {
                tableBody.innerHTML = "";
                updateImportStats();
                scheduleTreeUpdate();
            }
        });

        // Tabela de conservação renderiza automaticamente quando a aba é aberta (botões removidos)
        // loadConservationBtn e toggleTableBtn foram removidos da UI
        document.getElementById('sort-alpha').addEventListener('click', () => {
    currentConservationSort = 'alpha';
    renderConservationTableFromInput('alpha');
});

document.getElementById('sort-conserv-asc').addEventListener('click', () => {
    currentConservationSort = 'conserv_asc';
    renderConservationTableFromInput('conserv_asc');
});

document.getElementById('sort-conserv-desc').addEventListener('click', () => {
    currentConservationSort = 'conserv_desc';
    renderConservationTableFromInput('conserv_desc');
});
        moreInfoBtn.addEventListener('click', openMoreInfoModal);
        closeMoreInfo.addEventListener('click', () => {
            moreInfoModal.style.display = 'none';
        });
        document.getElementById('export-csv').addEventListener('click', exportCSV);

        // Download da imagem PNG de alta qualidade (corrigido - sem cortes e com qualidade preservada)
downloadImageBtn.addEventListener('click', downloadPNG);

function downloadPNG() {
    const treeElement = document.getElementById('tree-display');
    
    if (!treeElement || treeElement.innerText.includes("será exibida aqui") || 
        treeElement.innerText.includes("Nenhum dado") || 
        treeElement.innerText.includes("Nenhuma coluna")) {
        alert("Gere uma árvore válida primeiro.");
        return;
    }

    if (currentTreeType === 'genealogical') {
        const svg = document.getElementById('genealogical-svg');
        if (!svg) { alert("SVG não encontrado."); return; }

        // Clona o SVG para não modificar o original
        const svgClone = svg.cloneNode(true);
        const gClone = svgClone.querySelector('g');
        if (gClone) gClone.removeAttribute('transform');

        // Aplica estilos computados inline
        const allElements = svgClone.querySelectorAll('*');
        allElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            if (styles.fill && styles.fill !== 'none') el.style.fill = styles.fill;
            if (styles.stroke) el.style.stroke = styles.stroke;
            if (styles.strokeWidth) el.style.strokeWidth = styles.strokeWidth;
            if (styles.fontSize) el.style.fontSize = styles.fontSize;
            if (styles.fontFamily) el.style.fontFamily = styles.fontFamily;
            if (styles.fontWeight) el.style.fontWeight = styles.fontWeight;
        });

        // Calcula a bounding box de todos os elementos
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.appendChild(svgClone);
        document.body.appendChild(tempDiv);
        
        const bbox = svgClone.getBBox();
        document.body.removeChild(tempDiv);

        // Padding dinâmico: 10% da largura/altura, mínimo 100px
        const padding = Math.max(100, bbox.width * 0.1, bbox.height * 0.1);
        const viewBoxWidth = bbox.width + padding * 2;
        const viewBoxHeight = bbox.height + padding * 2;
        
        // Mantém o SVG em tamanho original para renderização de alta qualidade
        // Mas podemos limitar o tamanho do canvas final para evitar arquivos enormes
        const MAX_CANVAS_SIZE = 20000; // pixels máximos no canvas (mantém qualidade)
        
        let canvasWidth = viewBoxWidth;
        let canvasHeight = viewBoxHeight;
        
        // Se a árvore for muito grande, reduzimos o canvas proporcionalmente
        // mas mantemos uma resolução ainda alta (ex: 300 DPI equivalente)
        if (canvasWidth > MAX_CANVAS_SIZE || canvasHeight > MAX_CANVAS_SIZE) {
            const scale = Math.min(MAX_CANVAS_SIZE / canvasWidth, MAX_CANVAS_SIZE / canvasHeight);
            canvasWidth = Math.floor(canvasWidth * scale);
            canvasHeight = Math.floor(canvasHeight * scale);
            console.log(`Reduzindo canvas para ${canvasWidth}x${canvasHeight} (escala ${scale.toFixed(2)})`);
        }
        
        svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${viewBoxWidth} ${viewBoxHeight}`);
        svgClone.setAttribute('width', canvasWidth);
        svgClone.setAttribute('height', canvasHeight);

        // Converte para string e cria imagem
        const svgString = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f5f7e9';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

            // Usa compressão PNG com nível de compressão médio (não afeta a qualidade visual)
            canvas.toBlob((blob) => {
                const link = document.createElement('a');
                link.download = `arvore_genealogica_${new Date().toISOString().slice(0,10)}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            }, 'image/png'); // sem parâmetro de qualidade = compressão padrão sem perdas

            URL.revokeObjectURL(url);
        };
        img.src = url;
    } else {
        // Árvore hierárquica
        const originalOverflow = treeContainer.style.overflow;
        treeContainer.style.overflow = 'visible';
        setTimeout(() => {
            html2canvas(treeElement, {
                scale: 2, // escala um pouco menor para evitar arquivos enormes
                backgroundColor: '#f8fafc',
                logging: false,
                width: treeElement.scrollWidth,
                height: treeElement.scrollHeight,
                allowTaint: false
            }).then(canvas => {
                treeContainer.style.overflow = originalOverflow;
                
                // Comprime sem perder qualidade
                canvas.toBlob((blob) => {
                    const link = document.createElement('a');
                    link.download = `arvore_hierarquica_${new Date().toISOString().slice(0,10)}.png`;
                    link.href = URL.createObjectURL(blob);
                    link.click();
                }, 'image/png');
            }).catch(error => {
                treeContainer.style.overflow = originalOverflow;
                alert("Erro ao gerar imagem: " + error.message);
            });
        }, 100);
    }
}

document.getElementById('download-html').addEventListener('click', exportHTML);

function exportHTML() {
    const treeElement = document.getElementById('tree-display');
    
    if (!treeElement || treeElement.innerText.includes("será exibida aqui") || 
        treeElement.innerText.includes("Nenhum dado") || 
        treeElement.innerText.includes("Nenhuma coluna")) {
        alert("Gere uma árvore válida primeiro antes de exportar o HTML.");
        return;
    }

    if (currentTreeType === 'genealogical') {
        const svg = document.getElementById('genealogical-svg');
        if (!svg) { alert("SVG da árvore Filogenética não encontrado."); return; }

        // Clona o SVG
        const svgClone = svg.cloneNode(true);
        
        // Remove transform do grupo principal
        const mainGroup = svgClone.querySelector('g');
        if (mainGroup) {
            mainGroup.removeAttribute('transform');
        }

        // Cria um novo grupo interno para zoom/pan
        const innerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        innerGroup.setAttribute('id', 'tree-group');
        
        // Move todo o conteúdo para o innerGroup
        if (mainGroup) {
            while (mainGroup.firstChild) {
                innerGroup.appendChild(mainGroup.firstChild);
            }
            mainGroup.appendChild(innerGroup);
        } else {
            const newMainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            while (svgClone.firstChild) {
                newMainGroup.appendChild(svgClone.firstChild);
            }
            svgClone.appendChild(newMainGroup);
            newMainGroup.appendChild(innerGroup);
        }

        // Adiciona IDs a todos os textos (para busca)
        const textElements = svgClone.querySelectorAll('text');
        textElements.forEach((text, index) => {
            const content = text.textContent.trim();
            let id = content.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
            if (!id) id = `node-${index}`;
            text.setAttribute('id', id);
        });

        // Calcula a bounding box
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.appendChild(svgClone);
        document.body.appendChild(tempDiv);
        const bbox = svgClone.getBBox();
        document.body.removeChild(tempDiv);

        const padding = 200; // padding grande para evitar cortes
        svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding*2} ${bbox.height + padding*2}`);
        svgClone.setAttribute('width', bbox.width + padding*2);
        svgClone.setAttribute('height', bbox.height + padding*2);

        // Serializa o banco de dados (opcional, pode ser removido se não for usado)
        const birdDBJSON = JSON.stringify(BIRD_DATABASE);

        // HTML completo com todas as funcionalidades
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Árvore Filogenética</title>
    <style>
        body { margin: 0; background: #f5f7e9; font-family: 'Segoe UI', sans-serif; overflow: hidden; }
        #container {
            width: 100vw;
            height: 100vh;
            overflow: auto;
            cursor: grab;
            position: relative;
        }
        #container:active { cursor: grabbing; }
        svg { display: block; margin: 0; }
        #search-box {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: white;
            border: 2px solid #3b8c3b;
            border-radius: 30px;
            padding: 8px 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }
        #search-input {
            border: none;
            outline: none;
            padding: 5px;
            font-size: 14px;
            width: 200px;
            background: transparent;
        }
        #search-btn {
            background: #3b8c3b;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 5px 15px;
            cursor: pointer;
            font-weight: bold;
        }
        #search-btn:hover { background: #2d6e2d; }
        #clear-btn {
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 5px 10px;
            cursor: pointer;
            font-size: 12px;
            margin-left: 5px;
        }
        #clear-btn:hover { background: #c0392b; }
        #results {
            position: fixed;
            top: 80px;
            left: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-height: 200px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
            min-width: 250px;
        }
        .result-item {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        }
        .result-item:hover { background-color: #e5f0da; }
        .result-item strong { color: #2d5a2d; }
        #zoom-controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 10px;
            background: white;
            border-radius: 30px;
            padding: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .zoom-btn {
            background: #3b8c3b;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .zoom-btn:hover { background: #2d6e2d; }
        .search-highlight {
            transition: opacity 0.2s;
        }
    </style>
</head>
<body>
    <div id="search-box">
        <span>🔍</span>
        <input type="text" id="search-input" placeholder="Buscar espécie (nome ou popular)...">
        <button id="search-btn">Buscar</button>
        <button id="clear-btn" style="display:none;">✕</button>
    </div>
    <div id="results"></div>
    <div id="zoom-controls">
        <button class="zoom-btn" id="home-btn" title="Centralizar">🏠</button>
        <button class="zoom-btn" id="zoom-in">+</button>
        <button class="zoom-btn" id="zoom-out">−</button>
    </div>
    <div id="container">
        ${svgClone.outerHTML}
    </div>

    <script>
        
        
        // ========== VARIÁVEIS GLOBAIS ==========
        const container = document.getElementById('container');
        const svg = document.querySelector('svg');
        const treeGroup = document.getElementById('tree-group');
        let currentZoom = 1;

        // ========== FUNÇÃO AUXILIAR: NORMALIZA STRING ==========
        function normalize(str) {
            return str.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().trim().replace(/\\s+/g, ' ');
        }

        // ========== BUSCA TEXTUAL (CTRL+F VISUAL) ==========
        function search(query) {
            if (!query) return;
            const normalizedQuery = normalize(query);

            const texts = Array.from(document.querySelectorAll('text'));
            const matches = [];

            texts.forEach(text => {
                const content = text.textContent.trim();
                if (normalize(content).includes(normalizedQuery)) {
                    matches.push({
                        element: text,
                        name: content
                    });
                }
            });

            if (matches.length === 0) {
                alert('Nenhuma espécie encontrada com esse nome.');
                return;
            }

            if (matches.length > 1) {
                const resultsDiv = document.getElementById('results');
                resultsDiv.innerHTML = '';
                matches.slice(0, 10).forEach(match => {
                    const div = document.createElement('div');
                    div.className = 'result-item';
                    div.textContent = match.name;
                    div.onclick = function() {
                        goToElement(match.element);
                        resultsDiv.style.display = 'none';
                        document.getElementById('search-input').value = match.name;
                    };
                    resultsDiv.appendChild(div);
                });
                resultsDiv.style.display = 'block';
                return;
            }

            // Resultado único
            goToElement(matches[0].element);
        }

        function goToElement(element) {
            const bbox = element.getBBox();
            const point = svg.createSVGPoint();
            point.x = bbox.x + bbox.width / 2;
            point.y = bbox.y + bbox.height / 2;

            const targetZoom = 0.5; // Zoom reduzido
            currentZoom = targetZoom;
            treeGroup.style.transition = 'transform 0.5s ease';
            treeGroup.style.transform = 'scale(' + targetZoom + ')';

            const onTransitionEnd = function() {
                treeGroup.removeEventListener('transitionend', onTransitionEnd);
                const screenPoint = point.matrixTransform(element.getScreenCTM());
                const containerRect = container.getBoundingClientRect();
                container.scrollTo({
                    left: Math.max(0, screenPoint.x - containerRect.width / 2),
                    top: Math.max(0, screenPoint.y - containerRect.height / 2),
                    behavior: 'smooth'
                });
            };
            treeGroup.addEventListener('transitionend', onTransitionEnd, { once: true });

            // Destaque com retângulo verde piscante (10 vezes)
            const oldRect = document.querySelector('.search-highlight');
            if (oldRect) oldRect.remove();

            const svgNS = "http://www.w3.org/2000/svg";
            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", bbox.x - 5);
            rect.setAttribute("y", bbox.y - 5);
            rect.setAttribute("width", bbox.width + 10);
            rect.setAttribute("height", bbox.height + 10);
            rect.setAttribute("fill", "none");
            rect.setAttribute("stroke", "#2ecc71");
            rect.setAttribute("stroke-width", "3");
            rect.setAttribute("stroke-dasharray", "5,3");
            rect.setAttribute("rx", "5");
            rect.setAttribute("ry", "5");
            rect.setAttribute("class", "search-highlight");
            rect.style.opacity = "1";

            const parent = element.parentNode;
            parent.appendChild(rect);

            let blinkCount = 0;
            const blinkInterval = setInterval(function() {
                if (blinkCount >= 20) {
                    clearInterval(blinkInterval);
                    rect.remove();
                    return;
                }
                rect.style.opacity = rect.style.opacity === "1" ? "0" : "1";
                blinkCount++;
            }, 150);
        }

        // ========== FUNÇÃO PARA CENTRALIZAR (BOTÃO CASA) ==========
        function resetView() {
            currentZoom = 1;
            treeGroup.style.transition = 'transform 0.5s ease';
            treeGroup.style.transform = 'scale(1)';
            container.scrollTo({
                left: 0,
                top: 0,
                behavior: 'smooth'
            });
            const oldRect = document.querySelector('.search-highlight');
            if (oldRect) oldRect.remove();
        }

        // ========== CONTROLES DE ZOOM ==========
        document.getElementById('zoom-in').addEventListener('click', function() {
            currentZoom = Math.min(currentZoom + 0.2, 3);
            treeGroup.style.transition = 'transform 0.2s';
            treeGroup.style.transform = 'scale(' + currentZoom + ')';
        });

        document.getElementById('zoom-out').addEventListener('click', function() {
            currentZoom = Math.max(currentZoom - 0.2, 0.5);
            treeGroup.style.transition = 'transform 0.2s';
            treeGroup.style.transform = 'scale(' + currentZoom + ')';
        });

        document.getElementById('home-btn').addEventListener('click', resetView);

        // ========== EVENTOS DE BUSCA ==========
        document.getElementById('search-btn').addEventListener('click', function() {
            const query = document.getElementById('search-input').value;
            search(query);
        });

        document.getElementById('search-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('search-btn').click();
            }
        });

        document.getElementById('clear-btn').addEventListener('click', function() {
            document.getElementById('search-input').value = '';
            document.getElementById('results').style.display = 'none';
        });

        // Esconder resultados ao clicar fora
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#search-box') && !e.target.closest('#results')) {
                document.getElementById('results').style.display = 'none';
            }
        });

        // Arrastar com o mouse
        (function() {
            let isDragging = false;
            let startX, startY, scrollLeft, scrollTop;

            container.addEventListener('mousedown', function(e) {
                isDragging = true;
                startX = e.pageX - container.offsetLeft;
                startY = e.pageY - container.offsetTop;
                scrollLeft = container.scrollLeft;
                scrollTop = container.scrollTop;
                container.style.cursor = 'grabbing';
            });

            container.addEventListener('mouseleave', function() {
                isDragging = false;
                container.style.cursor = 'grab';
            });

            container.addEventListener('mouseup', function() {
                isDragging = false;
                container.style.cursor = 'grab';
            });

            container.addEventListener('mousemove', function(e) {
                if (!isDragging) return;
                e.preventDefault();
                const x = e.pageX - container.offsetLeft;
                const y = e.pageY - container.offsetTop;
                const walkX = (x - startX) * 1.5;
                const walkY = (y - startY) * 1.5;
                container.scrollLeft = scrollLeft - walkX;
                container.scrollTop = scrollTop - walkY;
            });

            container.addEventListener('dragstart', function(e) { e.preventDefault(); });
        })();
    <\/script>
    

</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `arvore_genealogica_${new Date().toISOString().slice(0,10)}.html`;
        link.click();
        URL.revokeObjectURL(link.href);
    } else {
        // Árvore hierárquica
        const styles = document.querySelectorAll('style');
        let styleText = '';
        styles.forEach(style => styleText += style.innerHTML);
        const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Árvore Hierárquica</title>
<style>${styleText} body { background: #f5f7e9; margin:0; } .tree-container { overflow: auto; width:100vw; height:100vh; }</style>
</head>
<body><div class="tree-container">${treeElement.innerHTML}</div></body>
</html>`;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `arvore_hierarquica_${new Date().toISOString().slice(0,10)}.html`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}

        // ==================== FUNÇÃO ÚNICA PARA COLAPSAR SEÇÕES ====================
        function setupCollapsibleSections() {
            // Apenas o table-header (dentro da aba de importação) permanece colapsável
            const tableHeader    = document.getElementById('table-header');
            const tableContent   = document.getElementById('table-content');
            const tableIndicator = document.getElementById('table-indicator');
            if (tableHeader && tableContent && tableIndicator) {
                tableContent.classList.remove('collapsed');
                tableIndicator.textContent = '−';
                tableHeader.addEventListener('click', function () {
                    tableContent.classList.toggle('collapsed');
                    tableIndicator.textContent = tableContent.classList.contains('collapsed') ? '+' : '−';
                });
            }
        }
        // Alias para não quebrar chamadas antigas que ainda referenciem initCollapsibleSections
        function initCollapsibleSections() { setupCollapsibleSections(); }

        // ===== NAVEGAÇÃO POR ABAS =====
        function setupTabNavigation() {
            const tabs = document.querySelectorAll('#main-tab-nav .tab-btn');
            const sections = document.querySelectorAll('.tab-section');

            tabs.forEach(btn => {
                btn.addEventListener('click', function () {
                    const targetId = this.dataset.tab;

                    // Atualiza botões
                    tabs.forEach(t => t.classList.remove('tab-active'));
                    this.classList.add('tab-active');

                    // Atualiza sections
                    sections.forEach(s => s.classList.remove('tab-active'));
                    const target = document.getElementById(targetId);
                    if (target) target.classList.add('tab-active');

                    // Inicializa o mapa na primeira vez que a aba é aberta
                    if (targetId === 'map-section') {
                        if (!mapInitialized) {
                            initMap();
                            mapInitialized = true;
                            updateSpeciesList();
                        } else if (typeof map !== 'undefined' && map) {
                            setTimeout(() => map.invalidateSize(), 100);
                        }
                    }

                    // Redesenha gráficos de distribuição ao entrar na aba
                    if (targetId === 'distribution-charts-section') {
                        setTimeout(() => {
                            if (chartOrdemBar) chartOrdemBar.resize();
                            if (chartOrdemPie) chartOrdemPie.resize();
                            if (chartFamiliaBar) chartFamiliaBar.resize();
                            if (chartFamiliaPie) chartFamiliaPie.resize();
                        }, 50);
                    }

                    // Renderiza tabela de conservação automaticamente ao entrar na aba
                    if (targetId === 'conservation-section') {
                        const container = document.getElementById('conservation-table-container');
                        if (container) container.style.display = 'block';
                        if (typeof renderConservationTableFromInput === 'function') {
                            renderConservationTableFromInput(typeof currentConservationSort !== 'undefined' ? currentConservationSort : 'alpha');
                        }
                        setTimeout(() => {
                            if (chartScPie) chartScPie.resize();
                            if (chartIcmbioPie) chartIcmbioPie.resize();
                            if (chartIucnPie) chartIucnPie.resize();
                        }, 50);
                    }
                });
            });
        }

        // Inicialização
        updateImportStats();
        initTreeTypeSelector();
        setupCollapsibleSections();
        setupTabNavigation();
        setMode('basic');
        logDebug('Aplicação inicializada com todas as funções e banco de dados completo');

        // ==================== FUNÇÕES DE COMPARAÇÃO DE TABELAS ====================
// ==================== FUNÇÕES DE COMPARAÇÃO DE TABELAS (MÚLTIPLAS LISTAS) ====================
const listsContainer = document.getElementById('lists-container');
const addListBtn = document.getElementById('add-list-btn');
const runComparisonBtn = document.getElementById('run-comparison');
const comparisonBody = document.getElementById('comparison-body');
const comparisonHeader = document.getElementById('comparison-header').querySelector('tr');

let chartBar, chartSimilarity, chartUnique; // Três gráficos
let listCount = 2; // Começa com 2 listas

// Função para buscar informações da espécie no banco de dados (para comparação)
function getSpeciesInfo(speciesName) {
    const match = BIRD_DATABASE.find(b => b.scientificName.toLowerCase() === speciesName.toLowerCase());
    if (match) {
        return {
            popular: match.commonName,
            nome: match.scientificName
        };
    }
    // Se não encontrar, retorna o nome científico como popular e o nome como está
    return {
        popular: speciesName,
        nome: speciesName
    };
}

// Função para criar uma nova lista (retorna o elemento DIV)
function createList(index) {
    const listDiv = document.createElement('div');
    listDiv.className = 'list-item';
    listDiv.setAttribute('data-list-index', index);
    listDiv.style.flex = '1';
    listDiv.style.minWidth = '300px';
    listDiv.style.position = 'relative';

    listDiv.innerHTML = `
        <button class="remove-list-btn" style="position: absolute; top: 5px; right: 5px; background: #e74c3c; color: white; border: none; width: 30px; height: 20px; border-radius: 4px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Remover lista">×</button>
        <h3 style="display: flex; align-items: center; gap: 10px; margin-top: 0;">
            <span class="list-number">${index + 1}</span>
            <input type="text" class="list-legend" placeholder="Legenda da lista" value="Lista ${index + 1}" style="flex: 1; padding: 5px;">
        </h3>
        <textarea class="compare-import" placeholder="Cole os nomes das espécies aqui (um por linha)..." style="width:100%; min-height:150px;"></textarea>
        <div class="autocomplete-suggestions" style="display:none;"></div>
        <div style="margin: 10px 0;">
            <button class="process-list-btn generate-btn">Processar Lista</button>
            <button class="clear-list-btn delete-btn">Limpar</button>
        </div>
        <div class="table-container" style="max-height: 300px; overflow-y: auto;">
            <table class="list-table">
                <thead><tr><th>Espécies na Lista ${index + 1}</th></tr></thead>
                <tbody class="list-body"></tbody>
            </table>
        </div>
    `;
    return listDiv;
}

// Função para gerar cores diferentes para cada barra
function getBarColor(index) {
    const colors = [
        '#3b8c3b', // verde
        '#8e6b3c', // marrom
        '#3498db', // azul
        '#9b59b6', // roxo
        '#e67e22', // laranja
        '#1abc9c', // turquesa
        '#e74c3c', // vermelho
        '#f1c40f', // amarelo
        '#2c3e50', // azul escuro
        '#d35400'  // laranja escuro
    ];
    return colors[index % colors.length];
}

// Adicionar nova lista
addListBtn.addEventListener('click', () => {
    const newList = createList(listCount);
    listsContainer.appendChild(newList);
    listCount++;

    // Aplicar autocomplete ao novo textarea
    const textarea = newList.querySelector('.compare-import');
    const suggestionsDiv = newList.querySelector('.autocomplete-suggestions');
    setupCompareAutocomplete(textarea, suggestionsDiv);
    // Adicionar eventos aos botões
    attachListEvents(newList);
    });

// Função para anexar eventos de processar, limpar e remover a uma lista
function attachListEvents(listDiv) {
    const textarea = listDiv.querySelector('.compare-import');
    const tbody = listDiv.querySelector('.list-body');
    const processBtn = listDiv.querySelector('.process-list-btn');
    const clearBtn = listDiv.querySelector('.clear-list-btn');
    const removeBtn = listDiv.querySelector('.remove-list-btn');
    const legendInput = listDiv.querySelector('.list-legend');

    processBtn.addEventListener('click', () => {
        processList(textarea, tbody);
    });
    clearBtn.addEventListener('click', () => {
    textarea.value = '';
    tbody.innerHTML = '';
    runComparisonBtn.click(); // Atualiza gráficos após limpar
});
    removeBtn.addEventListener('click', () => {
    const lists = document.querySelectorAll('.list-item');
    if (lists.length <= 2) {
        alert('Não é possível remover: é necessário manter pelo menos duas listas.');
        return;
    }
    listDiv.remove();
    reindexLists();
    runComparisonBtn.click(); // Atualiza tudo
});

    // Listener para legenda – atualiza gráficos se já houver dados
    if (legendInput) {
        legendInput.addEventListener('change', () => {
            const lists = getAllListsData();
            if (lists.length >= 2) {
                generateMultiListCharts(lists);
            }
        });
    }

    // Autocomplete
    const suggestionsDiv = listDiv.querySelector('.autocomplete-suggestions');
    setupCompareAutocomplete(textarea, suggestionsDiv);
}

// Função para reindexar as listas após remoção (atualiza números e data-list-index)
function reindexLists() {
    const lists = document.querySelectorAll('.list-item');
    lists.forEach((list, idx) => {
        list.setAttribute('data-list-index', idx);
        const numberSpan = list.querySelector('.list-number');
        if (numberSpan) numberSpan.textContent = idx + 1;
        const legendInput = list.querySelector('.list-legend');
        if (legendInput && !legendInput.value.trim()) {
            legendInput.value = `Lista ${idx + 1}`;
        }
        const th = list.querySelector('.list-table thead th');
        if (th) th.textContent = `Espécies na Lista ${idx + 1}`;
    });
    listCount = lists.length;
}

// Aplicar eventos às listas iniciais (já existentes no HTML)
document.querySelectorAll('.list-item').forEach(listDiv => {
    attachListEvents(listDiv);
    const textarea = listDiv.querySelector('.compare-import');
    const suggestionsDiv = listDiv.querySelector('.autocomplete-suggestions');
    setupCompareAutocomplete(textarea, suggestionsDiv);
});

// Função para obter todas as listas e seus dados (nome e espécies)
function getAllListsData() {
    const lists = [];
    document.querySelectorAll('.list-item').forEach((listDiv, index) => {
        const tbody = listDiv.querySelector('.list-body');
        const species = [];
        tbody.querySelectorAll('tr td:first-child').forEach(td => {
            species.push(td.textContent.trim());
        });
        const legendInput = listDiv.querySelector('.list-legend');
        const legend = legendInput ? legendInput.value.trim() : `Lista ${index + 1}`;
        lists.push({
            index: index,
            species: species,
            name: legend
        });
    });
    return lists;
}

// Executar comparação
runComparisonBtn.addEventListener('click', () => {
    const lists = getAllListsData();
    if (lists.length < 2) {
        alert('É necessário pelo menos duas listas para comparar.');
        return;
    }

    // Construir mapa de todas as espécies únicas
    const allSpeciesSet = new Set();
    lists.forEach(list => {
        list.species.forEach(sp => allSpeciesSet.add(sp));
    });
    const allSpecies = Array.from(allSpeciesSet).sort((a, b) => a.localeCompare(b));

    // Preparar dados para a tabela
        const results = [];
    allSpecies.forEach(sp => {
        const info = getSpeciesInfo(sp);
        const presenteEmTodas = lists.every(list => list.species.includes(sp));
        const row = {
            especie: info.nome,
            popular: info.popular,
            emTodas: presenteEmTodas ? '✅' : '❌'
        };
        lists.forEach(list => {
            row[`list_${list.index}`] = list.species.includes(sp) ? '✅ Presente' : '❌ Ausente';
        });
        results.push(row);
    });

        // Atualizar cabeçalho da tabela
comparisonHeader.innerHTML = '<th>Espécie</th><th>Nome Popular</th>';
lists.forEach(list => {
    const th = document.createElement('th');
    th.textContent = list.name;
    comparisonHeader.appendChild(th);
});
// Adiciona a coluna "Em todas?" por último
const thEmTodas = document.createElement('th');
thEmTodas.textContent = 'Em todas?';
comparisonHeader.appendChild(thEmTodas);
    // Preencher corpo da tabela
        comparisonBody.innerHTML = '';
results.forEach(row => {
    const tr = document.createElement('tr');
    // Colunas fixas: Espécie e Nome Popular
    tr.innerHTML = `<td>${row.especie}</td><td>${row.popular}</td>`;
    
    // Colunas das listas (na ordem em que aparecem)
    lists.forEach(list => {
        const td = document.createElement('td');
        td.textContent = row[`list_${list.index}`];
        tr.appendChild(td);
    });
    
    // Coluna "Em todas?" por último
    const tdEmTodas = document.createElement('td');
    tdEmTodas.textContent = row.emTodas;
    tr.appendChild(tdEmTodas);

    // Marca o tr com atributo para o filtro
    tr.dataset.emtodas = row.emTodas === '✅' ? 'yes' : 'no';
    // Marca quais listas contêm esta espécie (para filtro de únicas)
    const presentLists = lists.filter(list => list.species.includes(row.especie)).map(l => String(l.index));
    tr.dataset.presentlists = presentLists.join(',');
    tr.dataset.uniquefor = presentLists.length === 1 ? presentLists[0] : '';

    comparisonBody.appendChild(tr);
});

    // Popular o select de únicas por lista
    const selUnique = document.getElementById('filter-unique-list');
    if (selUnique) {
        selUnique.innerHTML = '<option value="">🔍 Únicas por lista...</option>';
        lists.forEach(list => {
            const opt = document.createElement('option');
            opt.value = String(list.index);
            opt.textContent = `Únicas de: ${list.name}`;
            selUnique.appendChild(opt);
        });
    }

    // Gerar gráficos
    generateMultiListCharts(lists);

    // Resetar filtro para "Todas" a cada nova comparação
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn-active'));
    document.getElementById('filter-all').classList.add('filter-btn-active');
    applyComparisonFilter('all');
});

// ---- Lógica dos botões de filtro ----
function applyComparisonFilter(filter, uniqueListIndex) {
    const rows = comparisonBody.querySelectorAll('tr');
    rows.forEach(tr => {
        if (filter === 'all') {
            tr.style.display = '';
        } else if (filter === 'present') {
            tr.style.display = tr.dataset.emtodas === 'yes' ? '' : 'none';
        } else if (filter === 'absent') {
            tr.style.display = tr.dataset.emtodas === 'no' ? '' : 'none';
        } else if (filter === 'unique' && uniqueListIndex !== undefined) {
            tr.style.display = tr.dataset.uniquefor === String(uniqueListIndex) ? '' : 'none';
        }
    });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn-active'));
        this.classList.add('filter-btn-active');
        const sel = document.getElementById('filter-unique-list');
        if (sel) sel.value = '';
        applyComparisonFilter(this.dataset.filter);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const selUnique = document.getElementById('filter-unique-list');
    if (selUnique) {
        selUnique.addEventListener('change', function() {
            if (this.value !== '') {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn-active'));
                applyComparisonFilter('unique', this.value);
            } else {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn-active'));
                document.getElementById('filter-all')?.classList.add('filter-btn-active');
                applyComparisonFilter('all');
            }
        });
    }
});

function generateMultiListCharts(lists) {
    const ctxBar = document.getElementById('countChart')?.getContext('2d');
    const ctxSimilarity = document.getElementById('similarityChart')?.getContext('2d');
    const ctxUnique = document.getElementById('uniqueChart')?.getContext('2d');
    
    if (!ctxBar || !ctxSimilarity || !ctxUnique) return;

    if (chartBar) chartBar.destroy();
    if (chartSimilarity) chartSimilarity.destroy();
    if (chartUnique) chartUnique.destroy();

    if (lists.length === 0 || lists.every(list => list.species.length === 0)) {
        ctxBar.clearRect(0, 0, ctxBar.canvas.width, ctxBar.canvas.height);
        ctxSimilarity.clearRect(0, 0, ctxSimilarity.canvas.width, ctxSimilarity.canvas.height);
        ctxUnique.clearRect(0, 0, ctxUnique.canvas.width, ctxUnique.canvas.height);
        document.getElementById('similarity-text').innerHTML = 'Nenhuma espécie para exibir.';
        document.getElementById('unique-text').innerHTML = '';
        return;
    }

    // ---------- GRÁFICO DE BARRAS ----------
    const labels = lists.map(list => list.name);
    const counts = lists.map(list => list.species.length);
    
    function getBarColor(index) {
        const colors = [
            '#3b8c3b', '#8e6b3c', '#3498db', '#9b59b6', '#e67e22',
            '#1abc9c', '#e74c3c', '#f1c40f', '#2c3e50', '#d35400'
        ];
        return colors[index % colors.length];
    }
    const barColors = lists.map((_, i) => getBarColor(i));

    chartBar = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Número de Espécies',
                data: counts,
                backgroundColor: barColors,
                borderColor: '#2d5a2d',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, stepSize: 1 }
            },
            plugins: {
                datalabels: {
                    anchor: 'center',
                    align: 'center',
                    color: 'white',
                    font: { weight: 'bold', size: 12 },
                    formatter: (value) => value // mostra apenas o número
                }
            }
        }
    });

    // ---------- DADOS PARA OS GRÁFICOS DE PIZZA ----------
    const allSpeciesSet = new Set();
    lists.forEach(list => list.species.forEach(sp => allSpeciesSet.add(sp)));
    const allSpecies = Array.from(allSpeciesSet);
    
    const commonInAll = allSpecies.filter(sp => lists.every(list => list.species.includes(sp))).length;
    const notCommonInAll = allSpecies.length - commonInAll;

    const uniqueCounts = lists.map(list => {
        return list.species.filter(sp => lists.filter(l => l.species.includes(sp)).length === 1).length;
    });

    // ---------- GRÁFICO DE SIMILARIDADE (PIZZA) ----------
    chartSimilarity = new Chart(ctxSimilarity, {
        type: 'pie',
        data: {
            labels: [`Similar em todas (${commonInAll})`, `Não similar (${notCommonInAll})`],
            datasets: [{
                data: [commonInAll, notCommonInAll],
                backgroundColor: ['#2ecc71', '#e74c3c'],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                datalabels: {
                    color: 'white',
                    font: { weight: 'bold', size: 12 },
                    formatter: (value, context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${value} (${percentage}%)`;
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    document.getElementById('similarity-text').innerHTML = `Total de espécies: ${allSpecies.length}`;

    // ---------- GRÁFICO DE ESPÉCIES ÚNICAS (PIZZA) ----------
    const uniqueLabels = [];
    const uniqueData = [];
    const uniqueColors = [];
    lists.forEach((list, idx) => {
        if (uniqueCounts[idx] > 0) {
            uniqueLabels.push(list.name);
            uniqueData.push(uniqueCounts[idx]);
            uniqueColors.push(getBarColor(idx));
        }
    });

    if (uniqueData.length === 0) {
        ctxUnique.clearRect(0, 0, ctxUnique.canvas.width, ctxUnique.canvas.height);
        document.getElementById('unique-text').innerHTML = 'Nenhuma espécie única.';
    } else {
        chartUnique = new Chart(ctxUnique, {
            type: 'pie',
            data: {
                labels: uniqueLabels,
                datasets: [{
                    data: uniqueData,
                    backgroundColor: uniqueColors,
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    datalabels: {
                        color: 'white',
                        font: { weight: 'bold', size: 12 },
                        formatter: (value, context) => {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${value} (${percentage}%)`;
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    const totalUnique = uniqueData.reduce((a, b) => a + b, 0);
    document.getElementById('unique-text').innerHTML = `Total de espécies únicas: ${totalUnique}`;
}

// Abrir modal e preencher lista 1 com dados da tabela principal
const compareTablesBtn = document.getElementById('compare-tables-btn');
if (compareTablesBtn) compareTablesBtn.addEventListener('click', () => {
    // Navega para a aba Comparar
    const tabs = document.querySelectorAll('#main-tab-nav .tab-btn');
    const sections = document.querySelectorAll('.tab-section');
    tabs.forEach(t => t.classList.remove('tab-active'));
    sections.forEach(s => s.classList.remove('tab-active'));
    const compareTab = document.querySelector('#main-tab-nav .tab-btn[data-tab="compare-section"]');
    const compareSection = document.getElementById('compare-section');
    if (compareTab) compareTab.classList.add('tab-active');
    if (compareSection) compareSection.classList.add('tab-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const mainData = collectTableData().map(item => item.generoEspecie).filter(Boolean);
    if (mainData.length > 0) {
        const firstList = document.querySelector('.list-item[data-list-index="0"]');
        if (firstList) {
            const textarea = firstList.querySelector('.compare-import');
            const tbody = firstList.querySelector('.list-body');
            if (textarea && tbody) {
                textarea.value = mainData.join('\n');
                processList(textarea, tbody);
            }
        }
    }
});

// Copiar tabela de comparação para área de transferência
document.getElementById('copy-comparison-table').addEventListener('click', copyComparisonTable);

function copyComparisonTable() {
    const rows = [];
    // Cabeçalho: Espécie, Nome Popular, depois as listas, depois "Em todas?"
    const headers = ['Espécie', 'Nome Popular'];
    const lists = getAllListsData();
    lists.forEach(list => headers.push(list.name));
    headers.push('Em todas?');
    rows.push(headers.join('\t')); // usa tabulação
    
    // Dados (a ordem das <td> já reflete a nova estrutura)
    const trs = comparisonBody.querySelectorAll('tr');
    trs.forEach(tr => {
        const tds = tr.querySelectorAll('td');
        const rowData = [];
        tds.forEach(td => rowData.push(td.textContent.trim()));
        rows.push(rowData.join('\t'));
    });
    
    // ... resto igual (cópia para área de transferência)
    
    const textToCopy = rows.join('\n');
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Tabela copiada para a área de transferência!');
        }).catch(() => {
            fallbackCopy(textToCopy);
        });
    } else {
        fallbackCopy(textToCopy);
    }
}

// Exportar CSV da tabela de comparação
document.getElementById('export-comparison-csv').addEventListener('click', exportComparisonCSV);

function exportComparisonCSV() {
    const rows = [];
    // Cabeçalho
    const headers = ['Espécie', 'Nome Popular'];
    const lists = getAllListsData();
    lists.forEach(list => headers.push(list.name));
    headers.push('Em todas?');
    rows.push(headers.map(h => `"${h}"`).join(','));
    
    // Dados
    const trs = comparisonBody.querySelectorAll('tr');
    trs.forEach(tr => {
        const tds = tr.querySelectorAll('td');
        const rowData = [];
        tds.forEach(td => rowData.push(`"${td.textContent.trim().replace(/"/g, '""')}"`));
        rows.push(rowData.join(','));
    });
    
    // ... resto igual (download do CSV)
    
    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'comparacao_especies.csv';
    link.click();
}

// ==================== AUTOCOMPLETE PARA TEXTAREAS DO COMPARADOR ====================
function setupCompareAutocomplete(textarea, suggestionsDiv) {
    let timeout;

    function getCurrentLineForCompare(textarea) {
        const cursorPos = textarea.selectionStart;
        const text = textarea.value;
        const lines = text.split('\n');
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
            charCount += lines[i].length + 1; // +1 para o \n
            if (charCount > cursorPos) {
                return { line: lines[i], lineIndex: i, start: charCount - lines[i].length - 1 };
            }
        }
        return { line: lines[lines.length-1] || '', lineIndex: lines.length-1, start: text.length - lines[lines.length-1].length };
    }

    function showSuggestions() {
        const { start } = getCurrentLineForCompare(textarea);
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(start, cursorPos);
        const currentText = textBeforeCursor.trim();

        if (currentText.length < 2) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        const normalized = normalizeForSearch(currentText);
        const matches = searchIndex.filter(item => item.normalized.includes(normalized)).slice(0, 10);

        if (matches.length === 0) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        const rect = textarea.getBoundingClientRect();
        suggestionsDiv.style.position = 'absolute';
        suggestionsDiv.style.left = rect.left + 'px';
        suggestionsDiv.style.top = (rect.bottom + window.scrollY) + 'px';
        suggestionsDiv.style.width = rect.width + 'px';
        suggestionsDiv.innerHTML = '';

        matches.forEach(match => {
            const sugg = document.createElement('div');
            sugg.className = 'autocomplete-suggestion';
            sugg.innerHTML = match.text;
            sugg.addEventListener('mousedown', (e) => {
                e.preventDefault();
                insertIntoSuggestion(textarea, match.scientific, start, cursorPos);
                suggestionsDiv.style.display = 'none';
            });
            suggestionsDiv.appendChild(sugg);
        });
        suggestionsDiv.style.display = 'block';
    }

    function insertIntoSuggestion(textarea, replacement, lineStart, cursorPos) {
        const text = textarea.value;
        const before = text.substring(0, lineStart);
        const after = text.substring(cursorPos);
        const newText = before + replacement + after;
        textarea.value = newText;
        textarea.selectionStart = textarea.selectionEnd = lineStart + replacement.length;
        textarea.focus();
    }

    textarea.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(showSuggestions, 300);
    });

    textarea.addEventListener('blur', () => {
        setTimeout(() => { suggestionsDiv.style.display = 'none'; }, 200);
    });

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && suggestionsDiv.style.display === 'block') {
            e.preventDefault();
            const firstSuggestion = suggestionsDiv.querySelector('.autocomplete-suggestion');
            if (firstSuggestion) firstSuggestion.click();
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target !== textarea && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });
}

// Função para processar uma lista (adiciona novas espécies às existentes, sem duplicatas)
function processList(textarea, tbody) {
    const text = textarea.value.trim();
    if (!text) return; // se não há texto, não faz nada

    // Obtém as espécies já existentes na tabela (para evitar duplicatas)
    const existingSpecies = new Set();
    tbody.querySelectorAll('tr td:first-child').forEach(td => {
        existingSpecies.add(td.textContent.trim());
    });

    // Processa as linhas do textarea
    const lines = [...new Set(text.split('\n')
        .map(l => l.trim())
        .filter(l => l !== ''))];

    lines.forEach(sp => {
        const trimmed = sp.trim();
        const match = findBirdByNormalizedName(trimmed);
        const speciesName = match ? match.scientificName : trimmed;
        
        // Só adiciona se não existir
        if (!existingSpecies.has(speciesName)) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.textContent = speciesName;
            tr.appendChild(td);
            tbody.appendChild(tr);
            existingSpecies.add(speciesName); // atualiza o set para evitar duplicatas na mesma leva
        }
    });

    // Limpa o textarea após processar (opcional, mas recomendado)
    textarea.value = '';

    // Atualiza a comparação e os gráficos
    runComparisonBtn.click();
}

document.getElementById('toggle-popular-names').addEventListener('click', function() {
    showPopularNames = !showPopularNames; // inverte o estado
    this.classList.toggle('active'); // muda a aparência do botão
    this.innerHTML = showPopularNames ? '🌿 Nomes populares (ON)' : '🌿 Nomes populares (OFF)'; // opcional
    scheduleTreeUpdate(); // recria a árvore com a nova configuração
});

// ==================== SEÇÃO DO MAPA (CORRIGIDA E MELHORADA) ====================
let map, drawnItems, drawControl;
let markersLayer = L.layerGroup(); // camada para todos os marcadores
let currentEditMarker = null; // marcador sendo editado
let editMode = false; // modo de edição de marcadores (arrastar)
let deleteMode = false; // modo de exclusão de marcadores (lixeira)
let polygonEditMode = false; // modo de edição de polígonos
let speciesColors = {}; // mapa: espécie -> cor
let gbifLayer = L.layerGroup();       // camada para os pontos do GBIF
let gbifVisible = false;              // estado do interruptor
let gbifMarkers = [];                 // armazena os marcadores (opcional)
let gbifLoading = false;              // evita múltiplas buscas
let ebirdLayer = L.layerGroup();             // camada para os pontos do eBird
let ebirdVisible = false;                    // estado do interruptor
let ebirdMarkers = [];                       // armazena os marcadores
let ebirdLoading = false;                    // evita múltiplas buscas
let hiddenSpecies = new Set();               // espécies ocultas no mapa
let editAreaActive = false;       // estado do botão editar área
let trashActive = false;          // estado da lixeira (ON = clicar no marker apaga)
let editControl = null;           // controle de edição do Leaflet.draw
let previousView = null;          // guarda centro/zoom antes da exportação

// Função para gerar uma cor única a partir do nome da espécie
function getColorForSpecies(species) {
    if (speciesColors[species]) return speciesColors[species];
    let hash = 0;
    for (let i = 0; i < species.length; i++) {
        hash = species.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    const color = `hsl(${hue}, 70%, 60%)`;
    speciesColors[species] = color;
    return color;
}

// Atualiza a lista de espécies baseada na tabela
function updateSpeciesList() {
    const data = collectTableData();
    const speciesSet = new Set(data.map(item => item.generoEspecie).filter(Boolean));
    const speciesArray = Array.from(speciesSet).sort();
    
    const listDiv = document.getElementById('species-list');
    listDiv.innerHTML = '';
    
    speciesArray.forEach(sp => {
        const color = getColorForSpecies(sp);
        const popular = speciesInfo[sp] ? speciesInfo[sp].nomePopular : '';
        const displayName = popular ? `${sp} (${popular})` : sp;

        const item = document.createElement('div');
        item.className = 'species-item';
        item.setAttribute('data-species', sp);
        item.setAttribute('data-color', color);
        item.setAttribute('draggable', 'true');

        // Lado esquerdo: bolinhas + nome (clicável para flash)
        const left = document.createElement('div');
        left.className = 'species-item-left';
        left.title = `Piscar "${displayName}" no mapa`;

        const colorSpan = document.createElement('span');
        colorSpan.className = 'species-color';
        colorSpan.style.backgroundColor = color;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'species-item-name';
        nameSpan.textContent = displayName;

        left.appendChild(colorSpan);
        left.appendChild(nameSpan);

        // Botão olho (direita)
        const eyeBtn = document.createElement('button');
        eyeBtn.className = 'species-eye-btn' + (hiddenSpecies.has(sp) ? ' hidden' : '');
        eyeBtn.textContent = hiddenSpecies.has(sp) ? '🙈' : '👁️';
        eyeBtn.title = hiddenSpecies.has(sp) ? 'Mostrar no mapa' : 'Ocultar no mapa';

        eyeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSpeciesVisibility(sp, eyeBtn);
        });

        left.addEventListener('click', () => flashSpeciesMarkers(sp));

        item.appendChild(left);
        item.appendChild(eyeBtn);
        
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        
        listDiv.appendChild(item);
    });
}

// Pisca todos os marcadores de uma espécie em amarelo, 2x em 1 segundo
function flashSpeciesMarkers(species) {
    const toFlash = [];

    markersLayer.eachLayer(m => {
        if (m.options.species === species) toFlash.push({ type: 'div', m, origColor: m.options.color });
    });
    [gbifLayer, ebirdLayer].forEach(layer => {
        layer.eachLayer(m => {
            if (m.options.species === species)
                toFlash.push({ type: 'circle', m, origFill: m.options.fillColor, origColor: m.options.color });
        });
    });

    function applyColor(yellow) {
        toFlash.forEach(({ type, m, origColor, origFill }) => {
            if (type === 'circle') {
                m.setStyle({ fillColor: yellow ? '#FFE600' : origFill, color: yellow ? '#FFE600' : (origColor || '#fff') });
            } else {
                const el = m.getElement();
                if (el) {
                    const div = el.querySelector('div');
                    if (div) div.style.backgroundColor = yellow ? '#FFE600' : origColor;
                }
            }
        });
    }

    applyColor(true);
    setTimeout(() => applyColor(false), 220);
    setTimeout(() => applyColor(true),  440);
    setTimeout(() => applyColor(false), 660);
}

// Mostra/oculta todos os marcadores de uma espécie
function toggleSpeciesVisibility(species, eyeBtn) {
    const nowHidden = hiddenSpecies.has(species);
    if (nowHidden) {
        hiddenSpecies.delete(species);
        eyeBtn.textContent = '👁️';
        eyeBtn.title = 'Ocultar no mapa';
        eyeBtn.classList.remove('hidden');
    } else {
        hiddenSpecies.add(species);
        eyeBtn.textContent = '🙈';
        eyeBtn.title = 'Mostrar no mapa';
        eyeBtn.classList.add('hidden');
    }
    const show = nowHidden; // nowHidden=true means we're showing it

    markersLayer.eachLayer(m => {
        if (m.options.species === species) m.setOpacity(show ? 1 : 0);
    });
    [gbifLayer, ebirdLayer].forEach(layer => {
        layer.eachLayer(m => {
            if (m.options.species === species) {
                if (show) {
                    m.setStyle({ opacity: 1, fillOpacity: 0.6 });
                } else {
                    m.setStyle({ opacity: 0, fillOpacity: 0 });
                }
            }
        });
    });
}

// Retorna lista de nomes científicos únicos da tabela
function getUniqueSpeciesFromTable() {
    const data = collectTableData();
    const speciesSet = new Set(data.map(item => item.generoEspecie).filter(Boolean));
    return Array.from(speciesSet);
}

function handleDragStart(e) {
    const item = e.target.closest('.species-item');
    if (!item) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({
        species: item.getAttribute('data-species'),
        color: item.getAttribute('data-color')
    }));
    e.dataTransfer.effectAllowed = 'copy';
}

function handleDragEnd(e) {}

// Inicializa o mapa
function initMap() {
    if (map) return;
    
    map = L.map('map-container').setView([-27.5, -50.5], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    markersLayer.addTo(map);
    
    drawControl = new L.Control.Draw({
        edit: { featureGroup: drawnItems },
        draw: {
            polygon: true,
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false
        }
    });
    map.addControl(drawControl);
    
    // Controle de edição (inicialmente desabilitado)
    editControl = new L.Control.Draw({
        edit: { featureGroup: drawnItems },
        draw: false
    });
    
    // Eventos de desenho
    map.on(L.Draw.Event.CREATED, function (event) {
        drawnItems.addLayer(event.layer);
    });
    
    // Evento de drop no mapa
    map.getContainer().addEventListener('dragover', (e) => e.preventDefault());
    map.getContainer().addEventListener('drop', handleDropOnMap);

    // ---- Rosa dos Ventos (controle Leaflet permanente) ----
    const CompassControl = L.Control.extend({
        options: { position: 'bottomleft' },
        onAdd: function() {
            const div = L.DomUtil.create('div', 'leaflet-compass-rose');
            div.innerHTML = `
            <svg width="70" height="70" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
              <!-- círculo de fundo -->
              <circle cx="35" cy="35" r="33" fill="rgba(255,255,255,0.92)" stroke="#2d5a2d" stroke-width="1.5"/>
              <!-- seta Norte (vermelha) — ponta em y=10, base em y=28 -->
              <polygon points="35,10 30,28 35,25 40,28" fill="#c0392b"/>
              <!-- seta Sul -->
              <polygon points="35,60 30,42 35,45 40,42" fill="#7f8c8d"/>
              <!-- seta Leste -->
              <polygon points="60,35 42,30 45,35 42,40" fill="#555"/>
              <!-- seta Oeste -->
              <polygon points="10,35 28,30 25,35 28,40" fill="#555"/>
              <!-- círculo central -->
              <circle cx="35" cy="35" r="4" fill="#2d5a2d"/>
              <!-- letras fora das setas -->
              <text x="35" y="9" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="bold" fill="#c0392b" font-family="sans-serif">N</text>
              <text x="35" y="63" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="#555" font-family="sans-serif">S</text>
              <text x="62" y="36" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="#555" font-family="sans-serif">E</text>
              <text x="8" y="36" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="#555" font-family="sans-serif">O</text>
            </svg>`;
            L.DomEvent.disableClickPropagation(div);
            return div;
        }
    });
    new CompassControl().addTo(map);
    
    // Botões
    const drawPolygonBtn = document.getElementById('draw-polygon');
    if (drawPolygonBtn) {
        drawPolygonBtn.addEventListener('click', function() {
            new L.Draw.Polygon(map).enable();
        });
    }

    const addAllBtn = document.getElementById('add-all-to-polygon');
    if (addAllBtn) {
        addAllBtn.addEventListener('click', addAllSpeciesToPolygon);
    }

    const clearDrawingsBtn = document.getElementById('clear-drawings');
    if (clearDrawingsBtn) {
        clearDrawingsBtn.addEventListener('click', function() {
            drawnItems.clearLayers();
            markersLayer.clearLayers();
            document.getElementById('map-results').style.display = 'none';
        });
    }

    const shapefileUpload = document.getElementById('shapefile-upload');
    if (shapefileUpload) {
        shapefileUpload.addEventListener('change', handleShapefileUpload);
    }

    const calculateBtn = document.getElementById('calculate-species');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateSpeciesInPolygons);
    }

    const editModeBtn = document.getElementById('edit-mode-btn');
    if (editModeBtn) {
        editModeBtn.addEventListener('click', function() {
            editMode = !editMode;
            this.style.background = editMode ? '#2d5a2d' : '';
            this.textContent = editMode ? '✏️ Edição de ponto (ON)' : '✏️ Edição de ponto (OFF)';
            if (!editMode && currentEditMarker) {
                currentEditMarker.dragging.disable();
                currentEditMarker = null;
            }
        });
    }

    // Botão editar área (toggle)
    const editAreaBtn = document.getElementById('edit-area-btn');
    if (editAreaBtn) {
        editAreaBtn.addEventListener('click', function() {
            editAreaActive = !editAreaActive;
            this.textContent = editAreaActive ? '✏️ Editar área (ON)' : '✏️ Editar área (OFF)';
            this.style.background = editAreaActive ? '#2d5a2d' : '';
            
            if (editAreaActive) {
                map.addControl(editControl);
                // Habilita edição em todas as camadas desenhadas
                drawnItems.eachLayer(function(layer) {
                    if (layer.editing) layer.editing.enable();
                });
            } else {
                map.removeControl(editControl);
                drawnItems.eachLayer(function(layer) {
                    if (layer.editing) layer.editing.disable();
                });
            }
        });
    }

    // Botão lixeira (toggle)
    const trashBtn = document.getElementById('trash-bin');
    if (trashBtn) {
        trashBtn.addEventListener('click', function() {
            trashActive = !trashActive;
            this.textContent = trashActive ? '🗑️ Lixeira (ON)' : '🗑️ Lixeira (OFF)';
            this.style.background = trashActive ? '#c0392b' : '#e74c3c';
        });
    }

    const toggleGBIFBtn = document.getElementById('toggle-gbif');
    if (toggleGBIFBtn) {
        toggleGBIFBtn.addEventListener('click', async function() {
            if (!gbifVisible) {
                if (gbifMarkers.length === 0) {
                    const species = getUniqueSpeciesFromTable();
                    if (species.length === 0) {
                        alert('Não há espécies na tabela para buscar.');
                        return;
                    }
                    this.textContent = '🌍 GBIF (Carregando...aproveite para buscar um café)';
                    await fetchGBIFOccurrences(species);
                    this.textContent = '🌍 GBIF (ON)';
                } else {
                    this.textContent = '🌍 GBIF (ON)';
                }
                if (!map.hasLayer(gbifLayer)) {
                    gbifLayer.addTo(map);
                }
                gbifVisible = true;
                this.style.background = '#2d5a2d';
            } else {
                if (map.hasLayer(gbifLayer)) {
                    map.removeLayer(gbifLayer);
                }
                gbifVisible = false;
                this.textContent = '🌍 GBIF (OFF)';
                this.style.background = '';
            }
        });
    }

    const toggleEBirdBtn = document.getElementById('toggle-ebird');
    if (toggleEBirdBtn) {
        toggleEBirdBtn.addEventListener('click', async function() {
            if (!ebirdVisible) {
                // Só busca se ainda não carregou
                if (ebirdMarkers.length === 0) {
                    const species = getUniqueSpeciesFromTable();
                    if (species.length === 0) {
                        alert('Não há espécies na tabela para buscar.');
                        return;
                    }
                    this.textContent = '🐦 eBird (Carregando...aproveite para buscar um café)';
                    this.disabled = true;
                    await fetchEBirdOccurrences(species);
                    this.disabled = false;
                    if (ebirdMarkers.length === 0) {
                        alert('Nenhum registro eBird encontrado para as espécies da tabela.');
                        this.textContent = '🐦 eBird (OFF)';
                        return;
                    }
                }
                if (!map.hasLayer(ebirdLayer)) ebirdLayer.addTo(map);
                ebirdVisible = true;
                this.textContent = `🐦 eBird (ON — ${ebirdMarkers.length} pts)`;
                this.style.background = '#8b3a0e';
            } else {
                if (map.hasLayer(ebirdLayer)) map.removeLayer(ebirdLayer);
                ebirdVisible = false;
                this.textContent = `🐦 eBird (OFF — ${ebirdMarkers.length} pts cached)`;
                this.style.background = '#d9520e';
            }
        });
    }

    // Botão exportar shapefile
    const exportShapefileBtn = document.getElementById('export-shapefile');
    if (exportShapefileBtn) {
        exportShapefileBtn.addEventListener('click', exportShapefile);
    }
}

function handleDropOnMap(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    
    try {
        const { species, color } = JSON.parse(data);
        const point = map.mouseEventToLatLng(e);
        if (!point) {
            alert('Clique em uma área válida do mapa.');
            return;
        }
        
        const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color || '#3388ff'}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        const marker = L.marker(point, { 
            icon: customIcon, 
            draggable: true,
            species: species, 
            color: color 
        }).addTo(markersLayer);
        marker.dragging.disable();
        
        const popularName = speciesInfo[species] ? speciesInfo[species].nomePopular : '';
        const tooltipText = popularName ? `${species} (${popularName})` : species;
        marker.bindTooltip(tooltipText, { permanent: false, direction: 'top' });
        
        // Clique no marcador
        marker.on('click', function(e) {
            L.DomEvent.stopPropagation(e);
            if (trashActive) {
                markersLayer.removeLayer(this);
                return;
            }
            if (!editMode) return;
            if (currentEditMarker && currentEditMarker !== this) {
                currentEditMarker.dragging.disable();
            }
            currentEditMarker = this;
            this.dragging.enable();
        });
        
        // Evento de fim de arrasto
        marker.on('dragend', function(e) {
            this.dragging.disable();
            currentEditMarker = null;
        });
        
    } catch (err) {
        console.error('Erro ao processar drop:', err);
    }
}

function handleShapefileUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        shp(arrayBuffer).then(function(geojson) {
            let features = [];
            if (Array.isArray(geojson)) {
                geojson.forEach(fc => features = features.concat(fc.features));
            } else {
                features = geojson.features;
            }
            
            features.forEach(feature => {
                if (feature.geometry.type.includes('Polygon')) {
                    const layer = L.geoJSON(feature).getLayers()[0];
                    drawnItems.addLayer(layer);
                }
            });
            
            if (drawnItems.getLayers().length > 0) {
                map.fitBounds(drawnItems.getBounds());
            }
        }).catch(err => {
            alert('Erro ao ler shapefile: ' + err.message);
        });
    };
    reader.readAsArrayBuffer(file);
}

function calculateSpeciesInPolygons() {
    const polygons = drawnItems.getLayers().filter(layer => layer instanceof L.Polygon);
    if (polygons.length === 0) {
        alert('Desenhe ou carregue pelo menos um polígono.');
        return;
    }
    
    const markers = markersLayer.getLayers();
    if (markers.length === 0) {
        alert('Adicione marcadores arrastando aves para o mapa.');
        return;
    }
    
    const results = [];
    polygons.forEach((polygon, idx) => {
        const polyGeoJSON = polygon.toGeoJSON();
        let areaSqMeters = 0;
        try {
            areaSqMeters = turf.area(polyGeoJSON);
        } catch (e) {
            console.warn('Erro ao calcular área:', e);
        }
        
        const speciesInside = new Set();
        const familiesInside = new Set();
        const ordersInside = new Set();
        let pointCount = 0;
        
        markers.forEach(marker => {
            const latlng = marker.getLatLng();
            const point = turf.point([latlng.lng, latlng.lat]);
            if (turf.booleanPointInPolygon(point, polyGeoJSON)) {
                const sciName = marker.options.species;
                speciesInside.add(sciName);
                pointCount++;
                const info = speciesInfo[sciName];
                if (info) {
                    if (info.familia) familiesInside.add(info.familia);
                    if (info.ordem) ordersInside.add(info.ordem);
                }
            }
        });
        
        const speciesList = Array.from(speciesInside).map(sciName => {
            const common = speciesInfo[sciName] ? speciesInfo[sciName].nomePopular : 'Desconhecido';
            return `${sciName} (${common})`;
        }).join(', ');
        
        const pontosPorM2 = pointCount / areaSqMeters;
        const especiesPorM2 = speciesInside.size / areaSqMeters;
        const familiasPorM2 = familiesInside.size / areaSqMeters;
        const ordensPorM2 = ordersInside.size / areaSqMeters;

        // Format small numbers nicely: use scientific notation only if < 0.001
        function fmtDensity(v) {
            if (!isFinite(v) || areaSqMeters === 0) return '—';
            if (v >= 0.01) return v.toFixed(2);
            if (v >= 0.0001) return v.toFixed(6);
            return v.toExponential(2);
        }
        
        results.push({
            index: idx + 1,
            species: speciesList,
            speciesCount: speciesInside.size,
            pointCount: pointCount,
            areaSqMeters: areaSqMeters.toFixed(2),
            pontosPorM2: fmtDensity(pontosPorM2),
            especiesPorM2: fmtDensity(especiesPorM2),
            familiasPorM2: fmtDensity(familiasPorM2),
            ordensPorM2: fmtDensity(ordensPorM2)
        });
    });
    
    const tbody = document.getElementById('map-results-body');
    tbody.innerHTML = '';
    results.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>Área ${r.index}</td>
                        <td style="max-width:300px; overflow-x:auto; white-space:nowrap;">${r.species}</td>
                        <td>${r.speciesCount}</td>
                        <td>${r.pointCount}</td>
                        <td>${r.areaSqMeters}</td>
                        <td>${r.pontosPorM2}</td>
                        <td>${r.especiesPorM2}</td>
                        <td>${r.familiasPorM2}</td>
                        <td>${r.ordensPorM2}</td>`;
        tbody.appendChild(tr);
    });
    document.getElementById('map-results').style.display = 'block';
}

function addAllSpeciesToPolygon() {
    const polygons = drawnItems.getLayers().filter(layer => layer instanceof L.Polygon);
    if (polygons.length === 0) {
        alert('Desenhe ou carregue pelo menos um polígono primeiro.');
        return;
    }

    const polygon = polygons[0];
    const polyGeoJSON = polygon.toGeoJSON();

    let geom = polyGeoJSON.geometry;
    if (geom.type === 'MultiPolygon') {
        geom = {
            type: 'Polygon',
            coordinates: geom.coordinates[0]
        };
    }

    // Calcula o bounding box para gerar pontos
    const bbox = turf.bbox(geom);
    const [minX, minY, maxX, maxY] = bbox;

    const data = collectTableData();
    const speciesSet = new Set(data.map(item => item.generoEspecie).filter(Boolean));
    const speciesArray = Array.from(speciesSet);

    if (speciesArray.length === 0) {
        alert('Não há espécies na tabela para adicionar.');
        return;
    }

    let addedCount = 0;
    speciesArray.forEach(sciName => {
        try {
            let point;
            // Tenta até 500 vezes para garantir que encontre um ponto dentro
            for (let attempt = 0; attempt < 500; attempt++) {
                const lng = minX + Math.random() * (maxX - minX);
                const lat = minY + Math.random() * (maxY - minY);
                const pt = turf.point([lng, lat]);
                if (turf.booleanPointInPolygon(pt, geom)) {
                    point = [lng, lat];
                    break;
                }
            }
            if (!point) {
                console.warn(`Não foi possível gerar ponto para ${sciName} dentro do polígono.`);
                return;
            }

            const latlng = L.latLng(point[1], point[0]);
            const color = getColorForSpecies(sciName);
            const customIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const marker = L.marker(latlng, {
                icon: customIcon,
                draggable: true,
                species: sciName,
                color: color
            }).addTo(markersLayer);
            marker.dragging.disable();

            const popularName = speciesInfo[sciName] ? speciesInfo[sciName].nomePopular : '';
            const tooltipText = popularName ? `${sciName} (${popularName})` : sciName;
            marker.bindTooltip(tooltipText, { permanent: false, direction: 'top' });

            marker.on('click', function(e) {
                L.DomEvent.stopPropagation(e);
                if (trashActive) {
                    markersLayer.removeLayer(this);
                    return;
                }
                if (!editMode) return;
                if (currentEditMarker && currentEditMarker !== this) {
                    currentEditMarker.dragging.disable();
                }
                currentEditMarker = this;
                this.dragging.enable();
            });

            marker.on('dragend', function(e) {
                this.dragging.disable();
                currentEditMarker = null;
            });

            addedCount++;
        } catch (e) {
            console.error('Erro ao gerar ponto para', sciName, e);
        }
    });

    if (addedCount > 0 && !map.hasLayer(markersLayer)) {
        markersLayer.addTo(map);
    }
    alert(`${addedCount} espécies adicionadas ao polígono!`);
}

async function gbifApiFetch(url, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
            if (r.ok) return r.json();
        } catch(e) {
            if (i === retries) throw e;
            await new Promise(res => setTimeout(res, 800 * (i + 1)));
        }
    }
    return null;
}

async function fetchGBIFOccurrences(speciesList) {
    if (gbifLoading) return;
    gbifLoading = true;
    gbifLayer.clearLayers();
    gbifMarkers = [];
    try {
        for (const species of speciesList) {
            try {
                const url = `https://api.gbif.org/v1/occurrence/search?scientificName=${encodeURIComponent(species)}&country=BR&hasCoordinate=true&limit=2000`;
                const data = await gbifApiFetch(url);
                if (data && data.results && data.results.length > 0) {
                    const color = getColorForSpecies(species);
                    data.results.forEach(occ => {
                        if (occ.decimalLatitude && occ.decimalLongitude) {
                            const marker = L.circleMarker([occ.decimalLatitude, occ.decimalLongitude], {
                                radius: 4, color: color, weight: 1, opacity: 1,
                                fillColor: color, fillOpacity: 0.6, species: species
                            }).bindTooltip(`${species} (GBIF)`, { permanent: false });
                            gbifMarkers.push(marker);
                            marker.addTo(gbifLayer);
                        }
                    });
                }
            } catch (e) {
                console.error(`Erro ao buscar ${species} no GBIF:`, e);
            }
        }
    } finally {
        gbifLoading = false;
        console.log(`GBIF: ${gbifMarkers.length} pontos carregados.`);
    }
}

// eBird via GBIF dataset
async function fetchEBirdOccurrences(speciesList) {
    if (ebirdLoading) return;
    ebirdLoading = true;
    const EBIRD_DATASET = '4fa7b334-ce0d-4e88-aaae-2e0c138d049e';
    try {
        for (const species of speciesList) {
            try {
                const url = `https://api.gbif.org/v1/occurrence/search?scientificName=${encodeURIComponent(species)}&datasetKey=${EBIRD_DATASET}&hasCoordinate=true&country=BR&limit=2000`;
                const data = await gbifApiFetch(url);
                if (data && data.results && data.results.length > 0) {
                    const color = getColorForSpecies(species);
                    data.results.forEach(occ => {
                        if (occ.decimalLatitude && occ.decimalLongitude) {
                            const marker = L.circleMarker(
                                [occ.decimalLatitude, occ.decimalLongitude],
                                { radius: 5, color: '#fff', weight: 1.2,
                                  fillColor: color, fillOpacity: 0.85, species: species }
                            ).bindTooltip(`<b>${species}</b><br><small>eBird</small>`, { permanent: false });
                            ebirdMarkers.push(marker);
                            marker.addTo(ebirdLayer);
                        }
                    });
                }
            } catch(e) {
                console.error(`Erro ao buscar ${species} no eBird/GBIF:`, e);
            }
        }
    } finally {
        ebirdLoading = false;
        console.log(`eBird: ${ebirdMarkers.length} pontos carregados.`);
    }
}


// ============================================================
// Exportação de Shapefile implementada manualmente com JSZip
// Suporta Point e Polygon (sem dependência de shp-write)
// ============================================================
function exportShapefile() {
    const polygonFeatures = [];
    drawnItems.eachLayer(layer => {
        if (layer instanceof L.Polygon) polygonFeatures.push(layer.toGeoJSON());
    });

    const pointFeatures = [];
    markersLayer.eachLayer(marker => {
        const latlng = marker.getLatLng();
        const species = marker.options.species || '';
        const popular = (speciesInfo[species] ? speciesInfo[species].nomePopular : '') || '';
        pointFeatures.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [latlng.lng, latlng.lat] },
            properties: { especie: species.substring(0, 10), popular: popular.substring(0, 10) }
        });
    });

    if (polygonFeatures.length === 0 && pointFeatures.length === 0) {
        alert('Não há polígonos ou pontos para exportar.');
        return;
    }

    const zip = new JSZip();

    // ---- escreve pontos ----
    if (pointFeatures.length > 0) {
        const shpPt  = buildPointShp(pointFeatures);
        const dbfPt  = buildDbf(pointFeatures.map(f => f.properties), ['especie','popular']);
        const prj    = 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]';
        zip.file('pontos.shp', shpPt);
        zip.file('pontos.shx', buildShx(shpPt));
        zip.file('pontos.dbf', dbfPt);
        zip.file('pontos.prj', prj);
    }

    // ---- escreve polígonos ----
    if (polygonFeatures.length > 0) {
        const shpPoly = buildPolygonShp(polygonFeatures);
        const dbfPoly = buildDbf(polygonFeatures.map((f,i) => ({ id: i+1 })), ['id']);
        const prj     = 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]';
        zip.file('poligonos.shp', shpPoly);
        zip.file('poligonos.shx', buildShx(shpPoly));
        zip.file('poligonos.dbf', dbfPoly);
        zip.file('poligonos.prj', prj);
    }

    zip.generateAsync({ type: 'blob' }).then(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mapa_aves.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    }).catch(e => {
        console.error('Erro ao gerar ZIP:', e);
        alert('Erro ao gerar ZIP: ' + e.message);
    });
}

/* ---- helpers para shapefile binário ---- */
function writeInt32BE(dv, offset, val) { dv.setInt32(offset, val, false); }
function writeInt32LE(dv, offset, val) { dv.setInt32(offset, val, true); }
function writeFloat64LE(dv, offset, val) { dv.setFloat64(offset, val, true); }

function buildPointShp(features) {
    const SHP_HEADER = 100;
    const RECORD_CONTENT = 20; // 4 type + 8 x + 8 y
    const total = SHP_HEADER + features.length * (8 + RECORD_CONTENT);
    const buf = new ArrayBuffer(total);
    const dv = new DataView(buf);

    // File header
    writeInt32BE(dv, 0, 9994);
    writeInt32BE(dv, 24, total / 2);   // file length in 16-bit words
    writeInt32LE(dv, 28, 1000);        // version
    writeInt32LE(dv, 32, 1);           // shape type: Point

    let xMin=Infinity, yMin=Infinity, xMax=-Infinity, yMax=-Infinity;
    features.forEach(f => {
        const [x, y] = f.geometry.coordinates;
        if (x < xMin) xMin = x; if (x > xMax) xMax = x;
        if (y < yMin) yMin = y; if (y > yMax) yMax = y;
    });
    writeFloat64LE(dv, 36, xMin); writeFloat64LE(dv, 44, yMin);
    writeFloat64LE(dv, 52, xMax); writeFloat64LE(dv, 60, yMax);

    let offset = SHP_HEADER;
    features.forEach((f, i) => {
        const [x, y] = f.geometry.coordinates;
        writeInt32BE(dv, offset, i + 1);             // record number
        writeInt32BE(dv, offset + 4, RECORD_CONTENT / 2); // content length
        writeInt32LE(dv, offset + 8, 1);             // shape type Point
        writeFloat64LE(dv, offset + 12, x);
        writeFloat64LE(dv, offset + 20, y);
        offset += 8 + RECORD_CONTENT;
    });
    return buf;
}

function buildPolygonShp(features) {
    // Calcula tamanho total primeiro
    let totalContentBytes = 0;
    const rings = features.map(f => {
        const geom = f.geometry;
        const coords = geom.type === 'MultiPolygon'
            ? geom.coordinates.flat()
            : geom.coordinates;
        return coords;
    });

    rings.forEach(ringsForFeat => {
        const numParts = ringsForFeat.length;
        const numPoints = ringsForFeat.reduce((s, r) => s + r.length, 0);
        totalContentBytes += 4 + 4*8 + 4 + 4 + numParts*4 + numPoints*16;
    });

    const SHP_HEADER = 100;
    const total = SHP_HEADER + features.length * 8 + totalContentBytes;
    const buf = new ArrayBuffer(total);
    const dv = new DataView(buf);

    writeInt32BE(dv, 0, 9994);
    writeInt32BE(dv, 24, total / 2);
    writeInt32LE(dv, 28, 1000);
    writeInt32LE(dv, 32, 5); // Polygon

    let xMin=Infinity, yMin=Infinity, xMax=-Infinity, yMax=-Infinity;
    rings.forEach(ringsForFeat => ringsForFeat.forEach(ring => ring.forEach(([x,y]) => {
        if (x<xMin)xMin=x; if (x>xMax)xMax=x;
        if (y<yMin)yMin=y; if (y>yMax)yMax=y;
    })));
    writeFloat64LE(dv, 36, xMin); writeFloat64LE(dv, 44, yMin);
    writeFloat64LE(dv, 52, xMax); writeFloat64LE(dv, 60, yMax);

    let offset = SHP_HEADER;
    features.forEach((f, i) => {
        const ringsForFeat = rings[i];
        const numParts = ringsForFeat.length;
        const numPoints = ringsForFeat.reduce((s,r)=>s+r.length,0);
        const contentLen = 4 + 4*8 + 4 + 4 + numParts*4 + numPoints*16;

        writeInt32BE(dv, offset, i+1);
        writeInt32BE(dv, offset+4, contentLen/2);
        offset += 8;

        writeInt32LE(dv, offset, 5); offset += 4; // shape type

        let fxMin=Infinity,fyMin=Infinity,fxMax=-Infinity,fyMax=-Infinity;
        ringsForFeat.forEach(ring=>ring.forEach(([x,y])=>{
            if(x<fxMin)fxMin=x;if(x>fxMax)fxMax=x;
            if(y<fyMin)fyMin=y;if(y>fyMax)fyMax=y;
        }));
        writeFloat64LE(dv, offset, fxMin); offset+=8;
        writeFloat64LE(dv, offset, fyMin); offset+=8;
        writeFloat64LE(dv, offset, fxMax); offset+=8;
        writeFloat64LE(dv, offset, fyMax); offset+=8;

        writeInt32LE(dv, offset, numParts); offset+=4;
        writeInt32LE(dv, offset, numPoints); offset+=4;

        let partStart = 0;
        ringsForFeat.forEach(ring => {
            writeInt32LE(dv, offset, partStart); offset+=4;
            partStart += ring.length;
        });
        ringsForFeat.forEach(ring => ring.forEach(([x,y]) => {
            writeFloat64LE(dv, offset, x); offset+=8;
            writeFloat64LE(dv, offset, y); offset+=8;
        }));
    });
    return buf;
}

function buildShx(shpBuf) {
    const dv = new DataView(shpBuf);
    const n = (dv.byteLength - 100) > 0 ? Math.floor((dv.byteLength - 100) / 1) : 0;
    // Count records by scanning
    const records = [];
    let off = 100;
    while (off < dv.byteLength) {
        const len = dv.getInt32(off+4, false);
        records.push({ offset: off/2, len });
        off += 8 + len*2;
    }
    const shx = new ArrayBuffer(100 + records.length * 8);
    const sdv = new DataView(shx);
    writeInt32BE(sdv, 0, 9994);
    writeInt32BE(sdv, 24, (100 + records.length*8)/2);
    writeInt32LE(sdv, 28, 1000);
    // copy shape type from shp header
    sdv.setInt32(32, dv.getInt32(32, true), true);
    for (let i=36;i<100;i++) sdv.setUint8(i, dv.getUint8(i));

    records.forEach((r,i) => {
        writeInt32BE(sdv, 100+i*8,   r.offset);
        writeInt32BE(sdv, 100+i*8+4, r.len);
    });
    return shx;
}

function buildDbf(rows, fields) {
    const truncField = s => (s+'          ').substring(0,10).replace(/ /g,'_');
    const fieldNames = fields.map(truncField);
    const fieldLen = 80;
    const headerSize = 32 + fields.length*32 + 1;
    const recordSize = 1 + fields.length*fieldLen;
    const total = headerSize + rows.length*recordSize + 1;
    const buf = new ArrayBuffer(total);
    const dv = new DataView(buf);
    const u8 = new Uint8Array(buf);

    dv.setUint8(0, 3); // version
    const now = new Date();
    dv.setUint8(1, now.getFullYear()-1900);
    dv.setUint8(2, now.getMonth()+1);
    dv.setUint8(3, now.getDate());
    dv.setInt32(4, rows.length, true);
    dv.setInt16(8, headerSize, true);
    dv.setInt16(10, recordSize, true);

    fields.forEach((f,i) => {
        const nameBytes = fieldNames[i].padEnd(11,'\0');
        for (let c=0;c<11;c++) u8[32+i*32+c] = nameBytes.charCodeAt(c)&0xFF;
        u8[32+i*32+11] = 67; // 'C' = character
        dv.setUint8(32+i*32+16, fieldLen);
        dv.setUint8(32+i*32+17, 0);
    });
    u8[32+fields.length*32] = 0x0D; // header terminator

    const encoder = new TextEncoder();
    rows.forEach((row, ri) => {
        const recOffset = headerSize + ri*recordSize;
        u8[recOffset] = 0x20; // valid record marker
        fields.forEach((f,fi) => {
            const val = String(row[f] !== undefined && row[f] !== null ? row[f] : '');
            const padded = val.substring(0, fieldLen).padEnd(fieldLen, ' ');
            const bytes = encoder.encode(padded);
            for (let b=0;b<fieldLen;b++) u8[recOffset+1+fi*fieldLen+b] = b < bytes.length ? bytes[b] : 0x20;
        });
    });
    u8[headerSize + rows.length*recordSize] = 0x1A; // EOF
    return buf;
}

// Atualiza a lista de espécies quando a tabela muda
const originalScheduleTreeUpdate = scheduleTreeUpdate;
scheduleTreeUpdate = function() {
    originalScheduleTreeUpdate();
    setTimeout(updateSpeciesList, 100);
};

// Mantém referência a mapContent para o listener de resize abaixo
const mapContent = document.getElementById('map-content');
let mapInitialized = false;
// O mapa será inicializado na primeira vez que o usuário clicar na aba 🗺️ Mapa

// Redesenha gráficos quando a janela for redimensionada (incluindo zoom)
window.addEventListener('resize', () => {
     if (map && !mapContent.classList.contains('collapsed')) {
        map.invalidateSize(); }
    if (chartScPie) chartScPie.resize();
    if (chartIcmbioPie) chartIcmbioPie.resize();
    if (chartIucnPie) chartIucnPie.resize();
    if (chartOrdemBar) chartOrdemBar.resize();
    if (chartOrdemPie) chartOrdemPie.resize();
    if (chartFamiliaBar) chartFamiliaBar.resize();
    if (chartFamiliaPie) chartFamiliaPie.resize();
    if (chartBar) chartBar.resize();
    if (chartSimilarity) chartSimilarity.resize();
    if (chartUnique) chartUnique.resize();
   
});

// ==================== CURVA DO COLETOR (RIQUEZA) ====================
let collectorChart;
let currentCurveMode = 'avg';          // 'avg' ou 'specific'
let currentAvgSubMode = 'interval';    // 'interval' ou 'specificDates'

// Elementos
const curveModeAvg = document.getElementById('curve-mode-avg');
const curveModeSpec = document.getElementById('curve-mode-specific');
const avgPanel = document.getElementById('curve-avg-panel');
const specPanel = document.getElementById('curve-specific-panel');
const avgIntervalBtn = document.getElementById('curve-avg-interval');
const avgSpecificBtn = document.getElementById('curve-avg-specific');
const specificDatesDiv = document.getElementById('curve-specific-dates');
const dateListDiv = document.getElementById('curve-date-list');
const addDateBtn = document.getElementById('curve-add-date');
const loadDatesBtn = document.getElementById('curve-load-dates');
const bulkDatesTextarea = document.getElementById('curve-dates-bulk');
const generateAvgBtn = document.getElementById('curve-generate-avg');
const startMonthInput = document.getElementById('curve-start-month');
const endMonthInput = document.getElementById('curve-end-month');

// Modo específico
const specBulkTextarea = document.getElementById('spec-bulk-data');
const specLoadBulkBtn = document.getElementById('spec-load-bulk');
const specNumbersArea = document.getElementById('spec-numbers-area');
const specPasteArea = document.getElementById('spec-paste-area');
const specNumFields = document.getElementById('spec-num-fields');
const specGenerateFieldsBtn = document.getElementById('spec-generate-fields');
const curveSpecificList = document.getElementById('curve-specific-list');
const generateSpecBtn = document.getElementById('curve-generate-spec');
const radioPaste = document.querySelector('input[value="paste"]');
const radioNumbers = document.querySelector('input[value="numbers"]');

// Estatísticas
const statDays = document.getElementById('stat-days');
const statAvg = document.getElementById('stat-avg');
const statTotal = document.getElementById('stat-total');
const statSeason = document.getElementById('stat-season');
const legendDiv = document.getElementById('curve-legend');

// Alternar modos principais
curveModeAvg.addEventListener('click', () => {
    curveModeAvg.classList.add('active');
    curveModeSpec.classList.remove('active');
    avgPanel.style.display = 'block';
    specPanel.style.display = 'none';
    currentCurveMode = 'avg';
});
curveModeSpec.addEventListener('click', () => {
    curveModeSpec.classList.add('active');
    curveModeAvg.classList.remove('active');
    specPanel.style.display = 'block';
    avgPanel.style.display = 'none';
    currentCurveMode = 'specific';
});

// Alternar submodos dentro do modo Média
avgIntervalBtn.addEventListener('click', () => {
    avgIntervalBtn.classList.add('active');
    avgSpecificBtn.classList.remove('active');
    specificDatesDiv.style.display = 'none';
    currentAvgSubMode = 'interval';
});
avgSpecificBtn.addEventListener('click', () => {
    avgSpecificBtn.classList.add('active');
    avgIntervalBtn.classList.remove('active');
    specificDatesDiv.style.display = 'block';
    currentAvgSubMode = 'specificDates';
});

// Adicionar data na lista de datas específicas (modo média)
addDateBtn.addEventListener('click', () => {
    const newDiv = document.createElement('div');
    newDiv.style.display = 'flex';
    newDiv.style.gap = '10px';
    newDiv.style.alignItems = 'center';
    newDiv.innerHTML = `
        <input type="date" class="curve-date-input" value="2025-01-15">
        <button class="remove-date-btn delete-btn" style="padding:4px 10px;">Remover</button>
    `;
    dateListDiv.appendChild(newDiv);
    newDiv.querySelector('.remove-date-btn').addEventListener('click', () => newDiv.remove());
});

// Carregar datas em massa (colar)
loadDatesBtn.addEventListener('click', () => {
    const text = bulkDatesTextarea.value.trim();
    if (!text) return;
    // Divide por linhas ou vírgulas
    let items = text.split(/\n|,/).map(s => s.trim()).filter(s => s);
    // Limpa lista atual
    dateListDiv.innerHTML = '';
    items.forEach(dateStr => {
        // Tenta validar data (formato YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const newDiv = document.createElement('div');
            newDiv.style.display = 'flex';
            newDiv.style.gap = '10px';
            newDiv.style.alignItems = 'center';
            newDiv.innerHTML = `
                <input type="date" class="curve-date-input" value="${dateStr}">
                <button class="remove-date-btn delete-btn" style="padding:4px 10px;">Remover</button>
            `;
            dateListDiv.appendChild(newDiv);
            newDiv.querySelector('.remove-date-btn').addEventListener('click', () => newDiv.remove());
        } else {
            alert(`Data inválida: ${dateStr}. Use formato AAAA-MM-DD.`);
        }
    });
});

// Alternar entre modos de entrada no painel específico
radioPaste.addEventListener('change', () => {
    specPasteArea.style.display = 'block';
    specNumbersArea.style.display = 'none';
});
radioNumbers.addEventListener('change', () => {
    specPasteArea.style.display = 'none';
    specNumbersArea.style.display = 'block';
});

// Gerar campos a partir do número de campos (modo específico)
specGenerateFieldsBtn.addEventListener('click', () => {
    const num = parseInt(specNumFields.value, 10);
    if (isNaN(num) || num < 1) return;
    curveSpecificList.innerHTML = '';
    for (let i = 1; i <= num; i++) {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.gap = '10px';
        div.style.alignItems = 'center';
        div.innerHTML = `
            <span style="min-width:80px;">${i}º campo</span>
            <input type="number" class="spec-increment" min="0" step="1" value="1" placeholder="Novas spp." style="width:120px;">
            <button class="remove-spec-btn delete-btn" style="padding:4px 10px;">Remover</button>
        `;
        curveSpecificList.appendChild(div);
        div.querySelector('.remove-spec-btn').addEventListener('click', () => div.remove());
    }
});

// Carregar dados em massa no modo específico (formato: data, incremento)
specLoadBulkBtn.addEventListener('click', () => {
    const text = specBulkTextarea.value.trim();
    if (!text) return;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    curveSpecificList.innerHTML = '';
    lines.forEach(line => {
        // Formato esperado: data, incremento (podem ser separados por vírgula ou espaço)
        let parts = line.split(',').map(p => p.trim());
        if (parts.length === 2) {
            const date = parts[0];
            const inc = parseInt(parts[1], 10);
            if (/^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(inc)) {
                const div = document.createElement('div');
                div.style.display = 'flex';
                div.style.gap = '10px';
                div.style.alignItems = 'center';
                div.innerHTML = `
                    <input type="date" class="spec-date" value="${date}">
                    <input type="number" class="spec-increment" min="0" step="1" value="${inc}" placeholder="Novas spp." style="width:120px;">
                    <button class="remove-spec-btn delete-btn" style="padding:4px 10px;">Remover</button>
                `;
                curveSpecificList.appendChild(div);
                div.querySelector('.remove-spec-btn').addEventListener('click', () => div.remove());
            } else {
                alert(`Linha inválida: ${line}`);
            }
        } else {
            alert(`Formato inválido: use "data, incremento" (ex: 2025-01-15, 3)`);
        }
    });
});

// Adicionar linha em branco no modo específico (botão + não implementado, mas pode ser adicionado se desejar)

// Função para obter número total de espécies da tabela principal
function getTotalSpeciesFromTable() {
    const data = collectTableData();
    const speciesSet = new Set(data.map(item => item.generoEspecie).filter(Boolean));
    return speciesSet.size;
}

// Gerar curva modo Média
generateAvgBtn.addEventListener('click', () => {
    const totalSpecies = getTotalSpeciesFromTable();
    if (totalSpecies === 0) {
        alert('Não há espécies na tabela. Importe dados primeiro.');
        return;
        
    }

    let points = []; // array de objetos { label (string), value (acumulado) }
    let labels = [];

    if (currentAvgSubMode === 'interval') {
        // Usar intervalo de meses
        const start = startMonthInput.value; // formato YYYY-MM
        const end = endMonthInput.value;
        if (!start || !end) {
            alert('Selecione as datas inicial e final.');
            return;
        }
        const [startYear, startMonth] = start.split('-').map(Number);
        const [endYear, endMonth] = end.split('-').map(Number);
        const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
        if (totalMonths <= 0) {
            alert('Data final deve ser posterior à inicial.');
            return;
        }

        // Distribuir espécies uniformemente entre os meses
        const increments = [];
        let remaining = totalSpecies;
        for (let i = 0; i < totalMonths; i++) {
            const inc = Math.round(remaining / (totalMonths - i));
            increments.push(inc);
            remaining -= inc;
        }
        // Ajustar o último para garantir soma exata
        increments[increments.length-1] += remaining;

        // Gerar labels (mês/ano)
        let cumulative = 0;
        for (let i = 0; i < totalMonths; i++) {
            const month = startMonth + i;
            const year = startYear + Math.floor((month-1)/12);
            const m = ((month-1) % 12) + 1;
            const label = `${m.toString().padStart(2,'0')}/${year}`;
            cumulative += increments[i];
            points.push({ label, value: cumulative });
        }
    } else {
        // Usar datas específicas
        const dateInputs = document.querySelectorAll('.curve-date-input');
        const dates = Array.from(dateInputs).map(inp => inp.value).filter(v => v);
        if (dates.length === 0) {
            alert('Adicione pelo menos uma data.');
            return;
        }
        dates.sort((a,b) => new Date(a) - new Date(b));

        // Distribuir espécies uniformemente entre as datas
        const increments = [];
        let remaining = totalSpecies;
        for (let i = 0; i < dates.length; i++) {
            const inc = Math.round(remaining / (dates.length - i));
            increments.push(inc);
            remaining -= inc;
        }
        increments[increments.length-1] += remaining;

        let cumulative = 0;
        for (let i = 0; i < dates.length; i++) {
            cumulative += increments[i];
            const [y,m,d] = dates[i].split('-');
            points.push({ label: `${d}/${m}/${y}`, value: cumulative });
        }
    }

    // Gerar gráfico
    renderCurveChart(points, totalSpecies);
    updateCurveStats(points, totalSpecies);
    // Gerar estimadores a partir dos incrementos simulados
const increments = points.map((p, i) => i === 0 ? p.value : p.value - points[i-1].value);
generateAndRenderEstimators(increments, totalSpecies);
});

// Gerar curva modo Específico
generateSpecBtn.addEventListener('click', () => {
    const rows = curveSpecificList.querySelectorAll('div'); // cada div é uma linha
    if (rows.length === 0) {
        alert('Adicione dados de incremento.');
        return;
    }

    const data = [];
    let totalInput = 0;
    rows.forEach(row => {
        const incInput = row.querySelector('.spec-increment');
        if (incInput) {
            const inc = parseInt(incInput.value, 10) || 0;
            totalInput += inc;
            // Se houver campo de data, captura; senão, usa número sequencial
            const dateInput = row.querySelector('.spec-date');
            let label;
            if (dateInput) {
                const d = dateInput.value;
                if (d) {
                    const [y,m,day] = d.split('-');
                    label = `${day}/${m}/${y}`;
                } else {
                    label = `Campo ${data.length+1}`;
                }
            } else {
                // modo apenas números: o span já contém "1º campo", etc.
                const span = row.querySelector('span');
                label = span ? span.textContent : `Campo ${data.length+1}`;
            }
            data.push({ label, inc });
        }
    });

    if (data.length === 0) {
        alert('Preencha os incrementos.');
        return;
    }

    // Acumulado
    let cumulative = 0;
    const points = data.map(item => {
        cumulative += item.inc;
        return { label: item.label, value: cumulative };
    });

    renderCurveChart(points, cumulative);
    updateCurveStats(points, cumulative);
    // Gerar estimadores a partir dos incrementos simulados
const increments = points.map((p, i) => i === 0 ? p.value : p.value - points[i-1].value);
generateAndRenderEstimators(increments, totalSpecies);
});

// Função para renderizar o gráfico com os pontos e a linha de tendência
function renderCurveChart(points, total) {
    const labels = points.map(p => p.label);
    const values = points.map(p => p.value);

    // Calcular linha de tendência (regressão linear simples)
    const n = points.length;
    const x = points.map((_, i) => i);
    const y = values;
    const sumX = x.reduce((a,b)=>a+b,0);
    const sumY = y.reduce((a,b)=>a+b,0);
    const sumXY = x.reduce((a,b,i)=>a+b*y[i],0);
    const sumX2 = x.reduce((a,b)=>a+b*b,0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const trendY = x.map(xi => intercept + slope * xi);

    const ctx = document.getElementById('collectorChart').getContext('2d');
    if (collectorChart) collectorChart.destroy();

    collectorChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Curva de acumulação',
                    data: values,
                    borderColor: '#2ecc71',
                    backgroundColor: '#2ecc71',
                    tension: 0.2,
                    fill: false,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                    datalabels: {
                        align: 'top',
                        offset: 6,
                        color: '#2c3e2f',
                        font: { weight: 'bold', size: 12 },
                        formatter: (value) => value // mostra o valor acumulado
                    }
                },
                {
                    label: 'Linha de tendência',
                    data: trendY,
                    borderColor: '#e67e22',
                    borderDash: [5,5],
                    backgroundColor: 'transparent',
                    tension: 0,
                    fill: false,
                    pointRadius: 0,
                    datalabels: { display: false }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const datasetLabel = context.dataset.label || '';
                            const value = context.raw;
                            return `${datasetLabel}: ${value} espécies`;
                        }
                    }
                },
                datalabels: {
                    display: true // habilitado para o primeiro dataset
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Espécies acumuladas' }
                },
                x: {
                    title: { display: true, text: 'Evento de coleta' }
                }
            }
        }
    });

    updateCurveLegend();
}

// Atualizar estatísticas abaixo do gráfico
function updateCurveStats(points, total) {
    const n = points.length;
    statDays.textContent = n;
    statAvg.textContent = (total / n).toFixed(2);
    statTotal.textContent = total;

    // Extrair mês (0-11) de um label, ou null se sem data
    function extractMonth(label) {
        // dd/mm/yyyy
        const full = label.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (full) return parseInt(full[2], 10) - 1;
        // mm/yyyy
        const mmy = label.match(/^(\d{1,2})\/(\d{4})$/);
        if (mmy) return parseInt(mmy[1], 10) - 1;
        return null; // campo sem data
    }

    // Hemisfério Sul: Dez/Jan/Fev=Verão, Mar-Mai=Outono, Jun-Ago=Inverno, Set-Nov=Primavera
    function monthToSeason(m) {
        if (m === 11 || m === 0 || m === 1) return '☀️ Verão';
        if (m <= 4) return '🍂 Outono';
        if (m <= 7) return '❄️ Inverno';
        return '🌸 Primavera';
    }

    if (n === 0) { statSeason.textContent = '-'; return; }

    // Extrair meses de todos os pontos
    const months = points.map(p => extractMonth(p.label));
    const hasAnyDate = months.some(m => m !== null);

    if (!hasAnyDate) {
        // Curva apenas com números de campo — sem datas, sem estação
        statSeason.textContent = '-';
        return;
    }

    // Montar lista de estações em ordem de aparecimento (com repetições)
    const seasonsList = months.map(m => m !== null ? monthToSeason(m) : null).filter(s => s !== null);
    statSeason.textContent = seasonsList.join(' → ');
}

// Atualizar legenda interativa
function updateCurveLegend() {
    if (!collectorChart) return;
    const datasets = collectorChart.data.datasets;
    legendDiv.innerHTML = '';
    datasets.forEach((ds, i) => {
        const item = document.createElement('div');
        item.className = 'curve-legend-item' + (ds.hidden ? ' curve-legend-hidden' : '');
        item.innerHTML = `
            <span class="curve-legend-color" style="background: ${ds.borderColor};"></span>
            <span>${ds.label}</span>
        `;
        item.addEventListener('click', () => {
            const meta = collectorChart.getDatasetMeta(i);
            meta.hidden = !meta.hidden;
            collectorChart.update();
            item.classList.toggle('curve-legend-hidden');
        });
        legendDiv.appendChild(item);
    });
}

// Seção da curva do coletor agora é gerenciada por setupCollapsibleSections()


    // ==================== GUILDA ALIMENTAR ====================
        const GUILDA_DB = {
            "Rhea americana": { guilda: "Onívoro", habitat: "Campestre", descricao: "Sementes, frutos, insetos, pequenos vertebrados" },
            "Tinamus solitarius": { guilda: "Onívoro", habitat: "Florestal", descricao: "Frutos, sementes, invertebrados do solo" },
            "Crypturellus obsoletus": { guilda: "Onívoro", habitat: "Florestal", descricao: "Frutos, sementes, invertebrados" },
            "Crypturellus noctivagus": { guilda: "Onívoro", habitat: "Florestal", descricao: "Frutos, sementes, invertebrados" },
            "Crypturellus parvirostris": { guilda: "Granívoro/Insetívoro", habitat: "Campestre", descricao: "Sementes e invertebrados" },
            "Crypturellus tataupa": { guilda: "Granívoro/Insetívoro", habitat: "Florestal", descricao: "Sementes e invertebrados" },
            "Rhynchotus rufescens": { guilda: "Onívoro", habitat: "Campestre", descricao: "Sementes, tubérculos, invertebrados" },
            "Nothura maculosa": { guilda: "Granívoro/Insetívoro", habitat: "Campestre", descricao: "Sementes e insetos" },
            "Anhima cornuta": { guilda: "Herbívoro", habitat: "Aquático", descricao: "Plantas aquáticas, algas" },
            "Chauna torquata": { guilda: "Herbívoro", habitat: "Aquático", descricao: "Plantas aquáticas e gramíneas" },
            "Dendrocygna bicolor": { guilda: "Herbívoro/Filtrador", habitat: "Aquático", descricao: "Sementes, grãos e plantas aquáticas" },
            "Dendrocygna viduata": { guilda: "Filtrador/Herbívoro", habitat: "Aquático", descricao: "Plantas aquáticas, invertebrados" },
            "Dendrocygna autumnalis": { guilda: "Herbívoro", habitat: "Aquático", descricao: "Sementes e gramíneas aquáticas" },
            "Coscoroba coscoroba": { guilda: "Herbívoro", habitat: "Aquático", descricao: "Plantas aquáticas, algas" },
            "Cairina moschata": { guilda: "Onívoro", habitat: "Aquático", descricao: "Plantas, invertebrados, pequenos peixes" },
            "Sarkidiornis sylvicola": { guilda: "Onívoro", habitat: "Aquático", descricao: "Plantas aquáticas, grãos, invertebrados" },
            "Callonetta leucophrys": { guilda: "Onívoro", habitat: "Aquático", descricao: "Sementes, invertebrados aquáticos" },
            "Amazonetta brasiliensis": { guilda: "Onívoro", habitat: "Aquático", descricao: "Plantas, sementes, invertebrados" },
            "Spatula versicolor": { guilda: "Filtrador", habitat: "Aquático", descricao: "Invertebrados e plantas aquáticas por filtração" },
            "Spatula platalea": { guilda: "Filtrador", habitat: "Aquático", descricao: "Invertebrados aquáticos por filtração" },
            "Spatula discors": { guilda: "Filtrador", habitat: "Aquático", descricao: "Invertebrados e plantas por filtração" },
            "Spatula cyanoptera": { guilda: "Filtrador", habitat: "Aquático", descricao: "Invertebrados e plantas por filtração" },
            "Mareca sibilatrix": { guilda: "Herbívoro", habitat: "Aquático", descricao: "Gramíneas e plantas aquáticas" },
            "Anas bahamensis": { guilda: "Onívoro", habitat: "Aquático", descricao: "Plantas, sementes, invertebrados" },
            "Anas acuta": { guilda: "Onívoro", habitat: "Aquático", descricao: "Plantas aquáticas e invertebrados" },
            "Anas georgica": { guilda: "Onívoro", habitat: "Aquático", descricao: "Sementes, gramíneas, invertebrados" },
            "Anas flavirostris": { guilda: "Onívoro", habitat: "Aquático", descricao: "Plantas, sementes, invertebrados" },
            "Netta erythrophthalma": { guilda: "Onívoro", habitat: "Aquático", descricao: "Plantas aquáticas e invertebrados" },
            "Netta peposaca": { guilda: "Herbívoro/Filtrador", habitat: "Aquático", descricao: "Plantas aquáticas, sementes" },
            "Heteronetta atricapilla": { guilda: "Onívoro", habitat: "Aquático", descricao: "Invertebrados, plantas aquáticas" },
            "Nomonyx dominicus": { guilda: "Onívoro", habitat: "Aquático", descricao: "Invertebrados e plantas aquáticas" },
            "Oxyura vittata": { guilda: "Insetívoro/Filtrador", habitat: "Aquático", descricao: "Invertebrados aquáticos e sementes" },
            "Penelope superciliaris": { guilda: "Frugívoro/Onívoro", habitat: "Florestal", descricao: "Frutos, folhas, flores, invertebrados" },
            "Penelope obscura": { guilda: "Frugívoro/Onívoro", habitat: "Florestal", descricao: "Frutos, sementes, flores, invertebrados" },
            "Aburria jacutinga": { guilda: "Frugívoro", habitat: "Florestal", descricao: "Frutos, especialmente palmito e figueiras" },
            "Ortalis squamata": { guilda: "Frugívoro/Onívoro", habitat: "Florestal", descricao: "Frutos, sementes, invertebrados" },
            "Odontophorus capueira": { guilda: "Granívoro/Insetívoro", habitat: "Florestal", descricao: "Sementes, frutos caídos, invertebrados" },
            "Phoenicoparrus andinus": { guilda: "Filtrador", habitat: "Aquático", descricao: "Algas, diatomáceas e invertebrados por filtração" },
            "Rollandia rolland": { guilda: "Piscívoro/Insetívoro", habitat: "Aquático", descricao: "Peixes, invertebrados aquáticos" },
            "Tachybaptus dominicus": { guilda: "Piscívoro/Insetívoro", habitat: "Aquático", descricao: "Insetos aquáticos, pequenos peixes" },
            "Podilymbus podiceps": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes, crustáceos, invertebrados" },
            "Podicephorus major": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes e invertebrados aquáticos" },
            "Columba livia": { guilda: "Granívoro", habitat: "Generalista", descricao: "Grãos, sementes e restos humanos" },
            "Patagioenas picazuro": { guilda: "Granívoro/Frugívoro", habitat: "Florestal", descricao: "Sementes, grãos e frutos" },
            "Patagioenas cayennensis": { guilda: "Granívoro/Frugívoro", habitat: "Florestal", descricao: "Frutos e sementes" },
            "Patagioenas plumbea": { guilda: "Frugívoro", habitat: "Florestal", descricao: "Frutos de árvores florestais" },
            "Geotrygon montana": { guilda: "Granívoro/Frugívoro", habitat: "Florestal", descricao: "Sementes e frutos do solo" },
            "Leptotila verreauxi": { guilda: "Granívoro/Frugívoro", habitat: "Florestal", descricao: "Sementes e frutos caídos" },
            "Leptotila rufaxilla": { guilda: "Granívoro/Frugívoro", habitat: "Florestal", descricao: "Sementes e frutos no chão" },
            "Zenaida auriculata": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes e grãos" },
            "Claravis pretiosa": { guilda: "Granívoro", habitat: "Florestal", descricao: "Sementes de bambu e gramíneas" },
            "Columbina talpacoti": { guilda: "Granívoro", habitat: "Generalista", descricao: "Sementes e grãos pequenos" },
            "Columbina squammata": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes e grãos" },
            "Columbina picui": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes e grãos" },
            "Guira guira": { guilda: "Insetívoro/Carnívoro", habitat: "Generalista", descricao: "Insetos, lagartos, anfíbios, pequenos vertebrados" },
            "Crotophaga major": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos, especialmente em ambientes úmidos" },
            "Crotophaga ani": { guilda: "Insetívoro", habitat: "Generalista", descricao: "Insetos, especialmente parasitas de bovinos" },
            "Tapera naevia": { guilda: "Insetívoro", habitat: "Generalista", descricao: "Insetos e lagartas" },
            "Dromococcyx phasianellus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos, aranhas, pequenos lagartos" },
            "Dromococcyx pavoninus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e aranhas" },
            "Micrococcyx cinereus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e lagartas" },
            "Piaya cayana": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Lagartas, gafanhotos, insetos grandes" },
            "Coccyzus melacoryphus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos, lagartas, pequenos lagartos" },
            "Coccyzus americanus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Lagartas, insetos" },
            "Coccyzus euleri": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e lagartas" },
            "Coccyzus erythropthalmus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Lagartas e insetos" },
            "Nyctibius griseus": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos capturados em voo à noite" },
            "Antrostomus rufus": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos em voo noturno" },
            "Antrostomus sericocaudatus": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos em voo noturno" },
            "Lurocalis semitorquatus": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos capturados em voo" },
            "Nyctidromus albicollis": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos em voo noturno" },
            "Hydropsalis parvula": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos em voo noturno" },
            "Hydropsalis anomala": { guilda: "Insetívoro aéreo", habitat: "Aquático", descricao: "Insetos em voo noturno" },
            "Hydropsalis longirostris": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos em voo noturno" },
            "Hydropsalis torquata": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos em voo noturno" },
            "Hydropsalis forcipata": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos em voo noturno" },
            "Podager nacunda": { guilda: "Insetívoro aéreo", habitat: "Campestre", descricao: "Insetos capturados em voo" },
            "Chordeiles minor": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos em voo crepuscular/noturno" },
            "Cypseloides fumigatus": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos minúsculos capturados em voo" },
            "Cypseloides senex": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos capturados em voo" },
            "Streptoprocne zonaris": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos capturados em voo" },
            "Streptoprocne biscutata": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos capturados em voo" },
            "Chaetura cinereiventris": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos capturados em voo" },
            "Chaetura meridionalis": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos capturados em voo" },
            "Panyptila cayennensis": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos capturados em voo" },
            "Florisuga fusca": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral, pequenos insetos e aranhas" },
            "Ramphodon naevius": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e pequenos artrópodes" },
            "Phaethornis squalidus": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar de flores heliconiáceas e aranhas" },
            "Phaethornis pretrei": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e pequenos insetos" },
            "Phaethornis eurynome": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e artrópodes" },
            "Colibri serrirostris": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e pequenos insetos" },
            "Anthracothorax nigricollis": { guilda: "Nectarívoro", habitat: "Generalista", descricao: "Néctar e pequenos insetos" },
            "Lophornis magnificus": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e pequenos artrópodes" },
            "Lophornis chalybeus": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e artrópodes" },
            "Heliodoxa rubricauda": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e pequenos insetos" },
            "Heliomaster furcifer": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e insetos" },
            "Calliphlox amethystina": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e artrópodes minúsculos" },
            "Chlorostilbon lucidus": { guilda: "Nectarívoro", habitat: "Generalista", descricao: "Néctar floral e pequenos insetos" },
            "Stephanoxis loddigesii": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar e artrópodes" },
            "Thalurania glaucopis": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e pequenos insetos" },
            "Eupetomena macroura": { guilda: "Nectarívoro", habitat: "Generalista", descricao: "Néctar floral e artrópodes" },
            "Aphantochroa cirrochloris": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e insetos" },
            "Chrysuronia versicolor": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e artrópodes" },
            "Leucochloris albicollis": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e pequenos insetos" },
            "Chionomesa fimbriata": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e artrópodes" },
            "Chionomesa lactea": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e artrópodes" },
            "Hylocharis chrysura": { guilda: "Nectarívoro", habitat: "Florestal", descricao: "Néctar floral e pequenos insetos" },
            "Aramus guarauna": { guilda: "Malacófago", habitat: "Aquático", descricao: "Especialista em caramujos do gênero Pomacea" },
            "Rallus longirostris": { guilda: "Onívoro", habitat: "Aquático", descricao: "Invertebrados, peixes, plantas aquáticas" },
            "Porphyrio martinica": { guilda: "Onívoro", habitat: "Aquático", descricao: "Plantas aquáticas, sementes, invertebrados" },
            "Porphyrio flavirostris": { guilda: "Onívoro", habitat: "Aquático", descricao: "Plantas aquáticas, sementes, invertebrados" },
            "Laterallus flaviventer": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos e invertebrados aquáticos" },
            "Laterallus melanophaius": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos e invertebrados" },
            "Laterallus exilis": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos e pequenos invertebrados" },
            "Laterallus spilopterus": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos e invertebrados aquáticos" },
            "Laterallus leucopyrrhus": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos e invertebrados" },
            "Mustelirallus albicollis": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos e invertebrados do solo" },
            "Neocrex erythrops": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos e pequenos invertebrados" },
            "Pardirallus maculatus": { guilda: "Onívoro", habitat: "Aquático", descricao: "Insetos, pequenos vertebrados, plantas" },
            "Pardirallus nigricans": { guilda: "Onívoro", habitat: "Aquático", descricao: "Insetos, sementes, plantas aquáticas" },
            "Pardirallus sanguinolentus": { guilda: "Onívoro", habitat: "Aquático", descricao: "Invertebrados, sementes, pequenos vertebrados" },
            "Amaurolimnas concolor": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos e invertebrados" },
            "Aramides ypecaha": { guilda: "Onívoro", habitat: "Aquático", descricao: "Insetos, anfíbios, plantas aquáticas" },
            "Aramides cajaneus": { guilda: "Onívoro", habitat: "Florestal", descricao: "Insetos, caramujos, frutos, sementes" },
            "Aramides saracura": { guilda: "Onívoro", habitat: "Florestal", descricao: "Insetos, caramujos, frutos, sementes" },
            "Porphyriops melanops": { guilda: "Onívoro", habitat: "Aquático", descricao: "Plantas aquáticas, invertebrados" },
            "Gallinula galeata": { guilda: "Onívoro", habitat: "Aquático", descricao: "Plantas, sementes, invertebrados aquáticos" },
            "Fulica rufifrons": { guilda: "Herbívoro/Onívoro", habitat: "Aquático", descricao: "Plantas aquáticas, algas, invertebrados" },
            "Fulica armillata": { guilda: "Herbívoro/Onívoro", habitat: "Aquático", descricao: "Plantas aquáticas e invertebrados" },
            "Fulica leucoptera": { guilda: "Herbívoro/Onívoro", habitat: "Aquático", descricao: "Plantas aquáticas e invertebrados" },
            "Heliornis fulica": { guilda: "Piscívoro/Insetívoro", habitat: "Aquático", descricao: "Peixes, insetos, anfíbios" },
            "Pluvialis dominica": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos, minhocas, invertebrados" },
            "Pluvialis squatarola": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Invertebrados marinhos" },
            "Oreopholus ruficollis": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos e invertebrados do solo" },
            "Vanellus chilensis": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos, minhocas, invertebrados" },
            "Charadrius modestus": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Invertebrados aquáticos e insetos" },
            "Charadrius semipalmatus": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Invertebrados marinhos e insetos" },
            "Charadrius collaris": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Invertebrados aquáticos" },
            "Charadrius falklandicus": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Invertebrados marinhos" },
            "Haematopus palliatus": { guilda: "Carnívoro/Insetívoro", habitat: "Costeiro", descricao: "Moluscos, crustáceos, equinodermas" },
            "Himantopus melanurus": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Invertebrados aquáticos, insetos" },
            "Chionis albus": { guilda: "Onívoro", habitat: "Costeiro", descricao: "Invertebrados, aves, ovos, carniça" },
            "Bartramia longicauda": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos e invertebrados" },
            "Numenius hudsonicus": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Invertebrados marinhos, crustáceos" },
            "Limosa haemastica": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Invertebrados aquáticos" },
            "Arenaria interpres": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Invertebrados sob pedras na costa" },
            "Calidris canutus": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Moluscos, crustáceos, invertebrados marinhos" },
            "Calidris himantopus": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Invertebrados aquáticos" },
            "Calidris alba": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Invertebrados marinhos" },
            "Calidris bairdii": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Invertebrados aquáticos" },
            "Calidris minutilla": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Insetos e invertebrados aquáticos" },
            "Calidris fuscicollis": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Invertebrados aquáticos" },
            "Calidris subruficollis": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos e invertebrados" },
            "Calidris melanotos": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Invertebrados aquáticos e insetos" },
            "Calidris pusilla": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Invertebrados marinhos" },
            "Limnodromus griseus": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Invertebrados aquáticos" },
            "Gallinago undulata": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Minhocas, invertebrados do solo" },
            "Gallinago paraguaiae": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Minhocas, invertebrados do solo" },
            "Phalaropus tricolor": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Invertebrados aquáticos" },
            "Phalaropus fulicarius": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Invertebrados aquáticos" },
            "Actitis macularius": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Invertebrados aquáticos e insetos" },
            "Tringa solitaria": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Invertebrados aquáticos" },
            "Tringa melanoleuca": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos, crustáceos, pequenos peixes" },
            "Tringa inornata": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Invertebrados aquáticos" },
            "Tringa semipalmata": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Invertebrados aquáticos" },
            "Tringa flavipes": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos, crustáceos, invertebrados" },
            "Thinocorus rumicivorus": { guilda: "Granívoro/Insetívoro", habitat: "Campestre", descricao: "Sementes e invertebrados" },
            "Jacana jacana": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos, invertebrados aquáticos" },
            "Nycticryphes semicollaris": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Invertebrados do solo úmido" },
            "Stercorarius chilensis": { guilda: "Cleptoparasita/Onívoro", habitat: "Costeiro", descricao: "Rouba alimento de outras aves, carniça" },
            "Stercorarius maccormicki": { guilda: "Cleptoparasita/Onívoro", habitat: "Costeiro", descricao: "Rouba alimento de outras aves" },
            "Stercorarius antarcticus": { guilda: "Cleptoparasita/Onívoro", habitat: "Costeiro", descricao: "Rouba alimento, ovos, carcaças" },
            "Stercorarius pomarinus": { guilda: "Cleptoparasita/Piscívoro", habitat: "Costeiro", descricao: "Rouba alimento de outras aves" },
            "Stercorarius parasiticus": { guilda: "Cleptoparasita/Onívoro", habitat: "Costeiro", descricao: "Cleptoparasita, rouba alimento" },
            "Stercorarius longicaudus": { guilda: "Cleptoparasita/Insetívoro", habitat: "Costeiro", descricao: "Cleptoparasita, insetos, lemmings" },
            "Chroicocephalus maculipennis": { guilda: "Onívoro", habitat: "Aquático", descricao: "Peixes, invertebrados, restos orgânicos" },
            "Chroicocephalus cirrocephalus": { guilda: "Onívoro", habitat: "Aquático", descricao: "Peixes, invertebrados, restos" },
            "Leucophaeus modestus": { guilda: "Onívoro", habitat: "Costeiro", descricao: "Invertebrados, restos orgânicos" },
            "Leucophaeus atricilla": { guilda: "Onívoro", habitat: "Costeiro", descricao: "Peixes, invertebrados, restos" },
            "Leucophaeus pipixcan": { guilda: "Insetívoro/Onívoro", habitat: "Campestre", descricao: "Insetos em campo, restos orgânicos" },
            "Larus atlanticus": { guilda: "Piscívoro/Onívoro", habitat: "Costeiro", descricao: "Peixes, invertebrados marinhos" },
            "Larus dominicanus": { guilda: "Onívoro", habitat: "Costeiro", descricao: "Peixes, invertebrados, ovos, carniça" },
            "Anous stolidus": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes pequenos e invertebrados marinhos" },
            "Rynchops niger": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes capturados rente à superfície da água" },
            "Sternula antillarum": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes e crustáceos pequenos" },
            "Sternula superciliaris": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes pequenos" },
            "Phaetusa simplex": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes" },
            "Sterna hirundo": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes e invertebrados marinhos" },
            "Sterna hirundinacea": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes pequenos" },
            "Sterna trudeaui": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes e invertebrados" },
            "Thalasseus acuflavidus": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes e invertebrados marinhos" },
            "Thalasseus maximus": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes, especialmente anchovas" },
            "Spheniscus magellanicus": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes, lulas e crustáceos" },
            "Diomedea exulans": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Lulas, peixes, carniça" },
            "Diomedea dabbenena": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Lulas, peixes" },
            "Thalassarche chlororhynchos": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Lulas, peixes, crustáceos" },
            "Thalassarche melanophris": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Lulas, peixes, crustáceos" },
            "Thalassarche chrysostoma": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Lulas e peixes" },
            "Oceanites oceanicus": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Zooplâncton, peixinhos, invertebrados marinhos" },
            "Macronectes giganteus": { guilda: "Detritívoro/Piscívoro", habitat: "Costeiro", descricao: "Carniça de aves marinhas e mamíferos" },
            "Macronectes halli": { guilda: "Detritívoro/Piscívoro", habitat: "Costeiro", descricao: "Carniça e peixes" },
            "Fulmarus glacialoides": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes, lulas, crustáceos" },
            "Daption capense": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes e invertebrados marinhos" },
            "Pterodroma mollis": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Lulas e peixes" },
            "Pterodroma incerta": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Lulas e peixes" },
            "Procellaria aequinoctialis": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Lulas, peixes e crustáceos" },
            "Procellaria conspicillata": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Lulas e peixes" },
            "Calonectris borealis": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes e lulas" },
            "Ardenna grisea": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes, lulas e crustáceos" },
            "Ardenna gravis": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes, lulas, crustáceos" },
            "Puffinus puffinus": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes e invertebrados marinhos" },
            "Ciconia maguari": { guilda: "Carnívoro/Piscívoro", habitat: "Aquático", descricao: "Peixes, anfíbios, roedores, cobras" },
            "Jabiru mycteria": { guilda: "Carnívoro/Piscívoro", habitat: "Aquático", descricao: "Peixes, anfíbios, moluscos, cobras" },
            "Mycteria americana": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes capturados por tato" },
            "Fregata magnificens": { guilda: "Cleptoparasita/Piscívoro", habitat: "Costeiro", descricao: "Rouba peixes de outras aves, peixes" },
            "Morus serrator": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes capturados por mergulho em picada" },
            "Sula leucogaster": { guilda: "Piscívoro", habitat: "Costeiro", descricao: "Peixes capturados por mergulho" },
            "Anhinga anhinga": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes capturados por mergulho" },
            "Nannopterum brasilianum": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes capturados por perseguição" },
            "Tigrisoma lineatum": { guilda: "Piscívoro/Carnívoro", habitat: "Aquático", descricao: "Peixes, anfíbios, cobras, invertebrados" },
            "Tigrisoma fasciatum": { guilda: "Piscívoro/Carnívoro", habitat: "Aquático", descricao: "Peixes e anfíbios" },
            "Cochlearius cochlearius": { guilda: "Piscívoro/Carnívoro", habitat: "Aquático", descricao: "Peixes e invertebrados, caça noturna" },
            "Botaurus pinnatus": { guilda: "Carnívoro/Piscívoro", habitat: "Aquático", descricao: "Anfíbios, insetos, peixes, cobras" },
            "Ixobrychus exilis": { guilda: "Insetívoro/Piscívoro", habitat: "Aquático", descricao: "Insetos, pequenos peixes, anfíbios" },
            "Ixobrychus involucris": { guilda: "Insetívoro/Piscívoro", habitat: "Aquático", descricao: "Insetos, pequenos peixes, anfíbios" },
            "Nycticorax nycticorax": { guilda: "Piscívoro/Carnívoro", habitat: "Aquático", descricao: "Peixes, anfíbios, invertebrados" },
            "Nyctanassa violacea": { guilda: "Onívoro", habitat: "Aquático", descricao: "Crustáceos, peixes, invertebrados" },
            "Butorides striata": { guilda: "Piscívoro/Insetívoro", habitat: "Aquático", descricao: "Peixes, insetos, crustáceos" },
            "Bubulcus ibis": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos e invertebrados, segue gado" },
            "Ardea cocoi": { guilda: "Piscívoro/Carnívoro", habitat: "Aquático", descricao: "Peixes, anfíbios, pequenos mamíferos" },
            "Ardea alba": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes, anfíbios, insetos" },
            "Syrigma sibilatrix": { guilda: "Carnívoro/Insetívoro", habitat: "Campestre", descricao: "Insetos, anfíbios, pequenos vertebrados" },
            "Pilherodius pileatus": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes e anfíbios" },
            "Egretta thula": { guilda: "Piscívoro/Insetívoro", habitat: "Aquático", descricao: "Peixes, insetos, crustáceos" },
            "Egretta caerulea": { guilda: "Piscívoro/Insetívoro", habitat: "Aquático", descricao: "Peixes, crustáceos, insetos" },
            "Eudocimus ruber": { guilda: "Insetívoro/Piscívoro", habitat: "Aquático", descricao: "Caranguejos, insetos, anfíbios" },
            "Plegadis chihi": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos, caramujos, crustáceos" },
            "Mesembrinibis cayennensis": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos, moluscos, anfíbios" },
            "Phimosus infuscatus": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Invertebrados do solo úmido" },
            "Theristicus caerulescens": { guilda: "Carnívoro/Insetívoro", habitat: "Aquático", descricao: "Cobras, anfíbios, insetos grandes" },
            "Theristicus caudatus": { guilda: "Carnívoro/Insetívoro", habitat: "Campestre", descricao: "Cobras, anfíbios, insetos" },
            "Platalea ajaja": { guilda: "Filtrador/Piscívoro", habitat: "Aquático", descricao: "Peixes e invertebrados filtrados" },
            "Sarcoramphus papa": { guilda: "Detritívoro", habitat: "Florestal", descricao: "Carniça, especialista em localizá-la" },
            "Coragyps atratus": { guilda: "Detritívoro", habitat: "Generalista", descricao: "Carniça e restos orgânicos" },
            "Cathartes aura": { guilda: "Detritívoro", habitat: "Generalista", descricao: "Carniça localizada pelo olfato" },
            "Cathartes burrovianus": { guilda: "Detritívoro", habitat: "Campestre", descricao: "Carniça em áreas abertas" },
            "Pandion haliaetus": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes capturados com as garras" },
            "Elanus leucurus": { guilda: "Carnívoro", habitat: "Campestre", descricao: "Roedores, insetos grandes, lagartos" },
            "Chondrohierax uncinatus": { guilda: "Malacófago", habitat: "Florestal", descricao: "Caramujos extraídos com o bico gancho" },
            "Leptodon cayanensis": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Ovos e filhotes de aves, lagartos" },
            "Elanoides forficatus": { guilda: "Insetívoro/Carnívoro", habitat: "Florestal", descricao: "Insetos grandes, lagartos, serpentes" },
            "Spizaetus tyrannus": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Aves, macacos, lagartos, cobras" },
            "Spizaetus melanoleucus": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Aves aquáticas e terrestres" },
            "Spizaetus ornatus": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Aves, lagartos, cobras, mamíferos" },
            "Rostrhamus sociabilis": { guilda: "Malacófago", habitat: "Aquático", descricao: "Especialista em caramujos Pomacea" },
            "Harpagus diodon": { guilda: "Insetívoro/Carnívoro", habitat: "Florestal", descricao: "Insetos grandes, lagartos, morcegos" },
            "Ictinia plumbea": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos capturados em voo" },
            "Circus cinereus": { guilda: "Carnívoro", habitat: "Campestre", descricao: "Roedores, aves pequenas, lagartos" },
            "Circus buffoni": { guilda: "Carnívoro", habitat: "Aquático", descricao: "Aves aquáticas, roedores, anfíbios" },
            "Hieraspiza superciliosa": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Pequenas aves" },
            "Accipiter poliogaster": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Aves de médio porte" },
            "Accipiter striatus": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Pequenas aves" },
            "Accipiter bicolor": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Aves e pequenos mamíferos" },
            "Geranospiza caerulescens": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Lagartos, rãs, ovos em ninhos" },
            "Heterospizias meridionalis": { guilda: "Carnívoro", habitat: "Campestre", descricao: "Cobras, lagartos, roedores" },
            "Urubitinga urubitinga": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Cobras, lagartos, anfíbios" },
            "Urubitinga coronata": { guilda: "Carnívoro", habitat: "Campestre", descricao: "Cobras, tatus, roedores grandes" },
            "Rupornis magnirostris": { guilda: "Carnívoro", habitat: "Generalista", descricao: "Lagartos, insetos, roedores, aves" },
            "Parabuteo unicinctus": { guilda: "Carnívoro", habitat: "Campestre", descricao: "Aves, mamíferos, lagartos" },
            "Parabuteo leucorrhous": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Aves e pequenos mamíferos" },
            "Geranoaetus albicaudatus": { guilda: "Carnívoro", habitat: "Campestre", descricao: "Cobras, lagartos, roedores" },
            "Geranoaetus melanoleucus": { guilda: "Carnívoro", habitat: "Campestre", descricao: "Tatus, roedores, coelhos" },
            "Buteo platypterus": { guilda: "Carnívoro/Insetívoro", habitat: "Florestal", descricao: "Insetos, roedores, lagartos" },
            "Buteo brachyurus": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Lagartos, roedores, aves pequenas" },
            "Buteo swainsoni": { guilda: "Insetívoro/Carnívoro", habitat: "Campestre", descricao: "Gafanhotos, roedores em migração" },
            "Buteo albonotatus": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Roedores, cobras, lagartos" },
            "Tyto furcata": { guilda: "Carnívoro", habitat: "Generalista", descricao: "Roedores, morcegos, insetos" },
            "Megascops choliba": { guilda: "Insetívoro/Carnívoro", habitat: "Florestal", descricao: "Insetos, lagartos, aves pequenas" },
            "Megascops sanctaecatarinae": { guilda: "Insetívoro/Carnívoro", habitat: "Florestal", descricao: "Insetos e pequenos vertebrados" },
            "Megascops atricapilla": { guilda: "Insetívoro/Carnívoro", habitat: "Florestal", descricao: "Insetos e lagartos" },
            "Pulsatrix koeniswaldiana": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Aves, roedores, anfíbios" },
            "Bubo virginianus": { guilda: "Carnívoro", habitat: "Generalista", descricao: "Gambás, roedores, aves, cobras" },
            "Strix hylophila": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Roedores, aves pequenas, anfíbios" },
            "Strix virgata": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Roedores, anfíbios, aves" },
            "Strix huhula": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Roedores, anfíbios, invertebrados" },
            "Glaucidium minutissimum": { guilda: "Insetívoro/Carnívoro", habitat: "Florestal", descricao: "Insetos e pequenos vertebrados" },
            "Glaucidium brasilianum": { guilda: "Insetívoro/Carnívoro", habitat: "Florestal", descricao: "Insetos grandes, lagartos, aves pequenas" },
            "Athene cunicularia": { guilda: "Insetívoro/Carnívoro", habitat: "Campestre", descricao: "Insetos, roedores, lagartos" },
            "Aegolius harrisii": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Roedores e insetos" },
            "Asio clamator": { guilda: "Carnívoro", habitat: "Generalista", descricao: "Roedores, aves pequenas, anfíbios" },
            "Asio stygius": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Roedores, aves, morcegos" },
            "Asio flammeus": { guilda: "Carnívoro", habitat: "Campestre", descricao: "Roedores e aves" },
            "Trogon viridis": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos grandes e frutos" },
            "Trogon surrucura": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Trogon chrysochloros": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Baryphthengus ruficapillus": { guilda: "Insetívoro/Carnívoro", habitat: "Florestal", descricao: "Insetos grandes, lagartos, frutas" },
            "Megaceryle torquata": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes capturados em mergulho" },
            "Chloroceryle amazona": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes" },
            "Chloroceryle aenea": { guilda: "Piscívoro/Insetívoro", habitat: "Aquático", descricao: "Peixinhos e insetos aquáticos" },
            "Chloroceryle americana": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes e insetos aquáticos" },
            "Chloroceryle inda": { guilda: "Piscívoro", habitat: "Aquático", descricao: "Peixes em riachos florestais" },
            "Nonnula rubecula": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e aranhas" },
            "Malacoptila striata": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos grandes, lagartos, artrópodes" },
            "Notharchus swainsoni": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos grandes, lagartos, anfíbios" },
            "Nystalus chacuru": { guilda: "Insetívoro/Carnívoro", habitat: "Campestre", descricao: "Insetos grandes, lagartos, serpentes" },
            "Ramphastos toco": { guilda: "Frugívoro/Onívoro", habitat: "Florestal", descricao: "Frutos, ovos, filhotes de aves, insetos" },
            "Ramphastos vitellinus": { guilda: "Frugívoro/Onívoro", habitat: "Florestal", descricao: "Frutos, ovos, insetos" },
            "Ramphastos dicolorus": { guilda: "Frugívoro/Onívoro", habitat: "Florestal", descricao: "Frutos, ovos, insetos, lagartos" },
            "Selenidera maculirostris": { guilda: "Frugívoro", habitat: "Florestal", descricao: "Frutos de palmeiras e figueiras" },
            "Pteroglossus bailloni": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Pteroglossus castanotis": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Picumnus temminckii": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em galhos finos" },
            "Picumnus nebulosus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e larvas em madeira" },
            "Melanerpes candidus": { guilda: "Onívoro", habitat: "Florestal", descricao: "Insetos, frutos, néctar, mel" },
            "Melanerpes flavifrons": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos, frutos e mel" },
            "Veniliornis spilogaster": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e larvas em madeira" },
            "Campephilus robustus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Larvas de besouro em madeira morta" },
            "Dryocopus lineatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Larvas de besouros em troncos" },
            "Celeus galeatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Formigas, larvas, insetos em madeira" },
            "Celeus flavescens": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos, frutas e mel" },
            "Piculus flavigula": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e larvas em madeira" },
            "Piculus aurulentus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Formigas, cupins, larvas" },
            "Colaptes melanochloros": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Formigas, cupins, larvas" },
            "Colaptes campestris": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Formigas, cupins e larvas no solo" },
            "Cariama cristata": { guilda: "Carnívoro/Insetívoro", habitat: "Campestre", descricao: "Insetos, cobras, lagartos, roedores" },
            "Herpetotheres cachinnans": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Cobras, especialmente serpentes peçonhentas" },
            "Micrastur ruficollis": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Aves pequenas e lagartos" },
            "Micrastur semitorquatus": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Aves de médio porte em clareiras" },
            "Caracara plancus": { guilda: "Onívoro/Detritívoro", habitat: "Generalista", descricao: "Carniça, invertebrados, aves, peixes" },
            "Milvago chimachima": { guilda: "Insetívoro/Onívoro", habitat: "Generalista", descricao: "Insetos, carrapatos, parasitas" },
            "Milvago chimango": { guilda: "Onívoro", habitat: "Generalista", descricao: "Carniça, insetos, frutos, ovos" },
            "Falco sparverius": { guilda: "Insetívoro/Carnívoro", habitat: "Campestre", descricao: "Insetos, lagartos, roedores" },
            "Falco rufigularis": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Andorinhões e morcegos em voo" },
            "Falco femoralis": { guilda: "Carnívoro", habitat: "Campestre", descricao: "Aves em voo, insetos, morcegos" },
            "Falco peregrinus": { guilda: "Carnívoro", habitat: "Generalista", descricao: "Aves em voo rápido" },
            "Touit melanonotus": { guilda: "Frugívoro/Granívoro", habitat: "Florestal", descricao: "Frutos e sementes" },
            "Myiopsitta monachus": { guilda: "Granívoro/Frugívoro", habitat: "Generalista", descricao: "Sementes, grãos, frutos" },
            "Brotogeris tirica": { guilda: "Frugívoro/Granívoro", habitat: "Florestal", descricao: "Frutos, sementes e flores" },
            "Brotogeris chiriri": { guilda: "Frugívoro/Granívoro", habitat: "Florestal", descricao: "Frutos e sementes" },
            "Pionopsitta pileata": { guilda: "Frugívoro/Granívoro", habitat: "Florestal", descricao: "Frutos, sementes, néctar" },
            "Triclaria malachitacea": { guilda: "Frugívoro", habitat: "Florestal", descricao: "Frutos de bromélias e outras plantas" },
            "Pionus maximiliani": { guilda: "Frugívoro/Granívoro", habitat: "Florestal", descricao: "Frutos, sementes, flores" },
            "Amazona vinacea": { guilda: "Frugívoro/Granívoro", habitat: "Florestal", descricao: "Frutos, sementes, flores" },
            "Amazona pretrei": { guilda: "Frugívoro/Granívoro", habitat: "Florestal", descricao: "Sementes de pinheiro e frutos" },
            "Amazona aestiva": { guilda: "Frugívoro/Granívoro", habitat: "Generalista", descricao: "Frutos, sementes, flores" },
            "Forpus xanthopterygius": { guilda: "Granívoro", habitat: "Generalista", descricao: "Sementes e grãos pequenos" },
            "Pyrrhura frontalis": { guilda: "Frugívoro/Granívoro", habitat: "Florestal", descricao: "Frutos, sementes, néctar" },
            "Primolius maracana": { guilda: "Frugívoro/Granívoro", habitat: "Florestal", descricao: "Frutos e sementes" },
            "Psittacara leucophthalmus": { guilda: "Frugívoro/Granívoro", habitat: "Florestal", descricao: "Frutos, sementes, flores" },
            "Terenura maculata": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em bambu e sub-bosque" },
            "Myrmotherula unicolor": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e aranhas no sub-bosque" },
            "Formicivora acutirostris": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em vegetação de brejo" },
            "Rhopias gularis": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e aranhas" },
            "Dysithamnus stictothorax": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e aranhas no sub-bosque" },
            "Dysithamnus mentalis": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Dysithamnus xanthopterus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e aranhas" },
            "Herpsilochmus rufimarginatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel" },
            "Thamnophilus doliatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e aranhas" },
            "Thamnophilus ruficapillus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Thamnophilus caerulescens": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e aranhas no sub-bosque" },
            "Hypoedaleus guttatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no interior florestal" },
            "Batara cinerea": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque denso" },
            "Mackenziaena leachii": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no bambu e sub-bosque" },
            "Mackenziaena severa": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no bambu" },
            "Biatas nigropectus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em bambu" },
            "Myrmoderus squamosus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e formigas no solo" },
            "Pyriglena leucoptera": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos, segue correições de formigas" },
            "Drymophila ferruginea": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em bambu e samambaias" },
            "Drymophila rubricollis": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em bambu" },
            "Drymophila ochropyga": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em bambu" },
            "Drymophila malura": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em bambu e taquara" },
            "Drymophila squamata": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em folhagem densa" },
            "Conopophaga melanops": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e aranhas no chão florestal" },
            "Conopophaga lineata": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e aranhas na serapilheira" },
            "Grallaria varia": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Minhocas, insetos e aranhas na serapilheira" },
            "Cryptopezus nattereri": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e invertebrados no solo" },
            "Psilorhamphus guttatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Merulaxis ater": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos na serapilheira" },
            "Eleoscytalopus indigoticus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em brejeiros e várzeas" },
            "Scytalopus iraiensis": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em banhados" },
            "Scytalopus pachecoi": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no chão florestal" },
            "Scytalopus speluncae": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e artrópodes" },
            "Formicarius colma": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos, segue correições de formigas" },
            "Chamaeza campanisona": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e minhocas no chão" },
            "Chamaeza ruficauda": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos na serapilheira" },
            "Sclerurus scansor": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos na serapilheira" },
            "Geositta cunicularia": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos e invertebrados no solo" },
            "Sittasomus griseicapillus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em troncos e galhos" },
            "Dendrocincla turdina": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos, segue correições" },
            "Dendrocolaptes platyrostris": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em troncos, segue formigas" },
            "Xiphocolaptes albicollis": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e pequenos vertebrados" },
            "Xiphorhynchus fuscus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em cascas e galhos" },
            "Campylorhamphus falcularius": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em bromélias e epífitas" },
            "Lepidocolaptes angustirostris": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em cascas de árvores" },
            "Lepidocolaptes falcinellus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em cascas no sub-bosque" },
            "Xenops minutus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em galhos finos" },
            "Xenops rutilans": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em galhos" },
            "Furnarius figulus": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Invertebrados em barro úmido" },
            "Furnarius rufus": { guilda: "Insetívoro", habitat: "Generalista", descricao: "Insetos e invertebrados no solo" },
            "Lochmias nematura": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos e invertebrados em riachos" },
            "Phleocryptes melanops": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos aquáticos em juncos" },
            "Limnornis curvirostris": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em juncais" },
            "Cinclodes pabsti": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Invertebrados em campos úmidos" },
            "Cinclodes fuscus": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Invertebrados aquáticos e terrestres" },
            "Anabazenops fuscus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em lianas e cipós" },
            "Cichlocolaptes leucophrus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em bambu e lianas" },
            "Heliobletus contaminatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em galhos finos" },
            "Philydor atricapillus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em folhas mortas e bambu" },
            "Anabacerthia amaurotis": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em bambu e folhagem" },
            "Anabacerthia lichtensteini": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em folhagem do sub-bosque" },
            "Syndactyla rufosuperciliata": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em folhas mortas" },
            "Dendroma rufa": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em folhas mortas pendentes" },
            "Clibanornis dendrocolaptoides": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em bromélias e epífitas" },
            "Automolus leucophthalmus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em serapilheira e solo" },
            "Leptasthenura striolata": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em araucárias" },
            "Leptasthenura setaria": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em araucárias" },
            "Phacellodomus striaticollis": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em gramíneas" },
            "Phacellodomus ferrugineigula": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em brejeiros" },
            "Anumbius annumbi": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em arbustais" },
            "Limnoctites rectirostris": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em gravatás" },
            "Cranioleuca obsoleta": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em bambu e cipós" },
            "Cranioleuca pallida": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Spartonoica maluroides": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em campos úmidos" },
            "Certhiaxis cinnamomeus": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em juncos e banhados" },
            "Schoeniophylax phryganophilus": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em arbustais" },
            "Synallaxis cinerascens": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Synallaxis ruficapilla": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque denso" },
            "Synallaxis spixi": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Synallaxis albescens": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em arbustais" },
            "Synallaxis frontalis": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em arbustais e borda" },
            "Ilicura militaris": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos pequenos e insetos" },
            "Chiroxiphia caudata": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Manacus manacus": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos pequenos e insetos" },
            "Carpornis cucullata": { guilda: "Frugívoro", habitat: "Florestal", descricao: "Frutos de lauráceas e outras árvores" },
            "Phibalura flavirostris": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos no dossel" },
            "Pyroderus scutatus": { guilda: "Frugívoro", habitat: "Florestal", descricao: "Frutos do dossel florestal" },
            "Lipaugus lanioides": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Procnias nudicollis": { guilda: "Frugívoro", habitat: "Florestal", descricao: "Frutos de Lauráceas" },
            "Schiffornis virescens": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos pequenos" },
            "Tityra inquisitor": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Tityra cayana": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Tityra semifasciata": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Pachyramphus viridis": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Pachyramphus castaneus": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Pachyramphus polychopterus": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Pachyramphus marginatus": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Pachyramphus validus": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos no dossel" },
            "Oxyruncus cristatus": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Onychorhynchus swainsoni": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos grandes, aranhas" },
            "Myiobius barbatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos capturados em voo" },
            "Myiobius atricaudus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos capturados em voo" },
            "Piprites chloris": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Piprites pileata": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Platyrinchus mystaceus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Platyrinchus leucoryphus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no chão do sub-bosque" },
            "Tachuris rubrigastra": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em juncais" },
            "Mionectes rufiventris": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos no sub-bosque" },
            "Leptopogon amaurocephalus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Corythopis delalandi": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no chão florestal" },
            "Phylloscartes eximius": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Phylloscartes ventralis": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Phylloscartes kronei": { guilda: "Insetívoro", habitat: "Costeiro", descricao: "Insetos na restinga" },
            "Phylloscartes oustaleti": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel" },
            "Phylloscartes difficilis": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em bambu" },
            "Phylloscartes sylviolus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Tolmomyias sulphurescens": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel" },
            "Todirostrum poliocephalum": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Todirostrum cinereum": { guilda: "Insetívoro", habitat: "Generalista", descricao: "Insetos em arbustos" },
            "Poecilotriccus plumbeiceps": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Myiornis auricularis": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Hemitriccus diops": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Hemitriccus obsoletus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em bambu" },
            "Hemitriccus orbitatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Hemitriccus nidipendulus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Hemitriccus kaempferi": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos na restinga e floresta" },
            "Hirundinea ferruginea": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos capturados em voo, poleiros rochosos" },
            "Euscarthmus meloryphus": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em arbustos" },
            "Tyranniscus burmeisteri": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel" },
            "Camptostoma obsoletum": { guilda: "Insetívoro/Frugívoro", habitat: "Generalista", descricao: "Insetos e frutos pequenos" },
            "Elaenia flavogaster": { guilda: "Insetívoro/Frugívoro", habitat: "Generalista", descricao: "Frutos e insetos" },
            "Elaenia spectabilis": { guilda: "Insetívoro/Frugívoro", habitat: "Generalista", descricao: "Frutos e insetos" },
            "Elaenia chilensis": { guilda: "Insetívoro/Frugívoro", habitat: "Generalista", descricao: "Frutos e insetos" },
            "Elaenia parvirostris": { guilda: "Insetívoro/Frugívoro", habitat: "Generalista", descricao: "Frutos e insetos" },
            "Elaenia mesoleuca": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Elaenia obscura": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Myiopagis caniceps": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel" },
            "Myiopagis viridicata": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Capsiempis flaveola": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em brejeiros" },
            "Phyllomyias virescens": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel" },
            "Phyllomyias fasciatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque e borda" },
            "Phyllomyias griseocapilla": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel florestal" },
            "Culicivora caudacuta": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em campos" },
            "Polystictus pectoralis": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em campos úmidos" },
            "Pseudocolopteryx sclateri": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em banhados" },
            "Pseudocolopteryx acutipennis": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em brejeiros" },
            "Pseudocolopteryx flaviventris": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em juncos" },
            "Serpophaga nigricans": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em beiras de rio" },
            "Serpophaga subcristata": { guilda: "Insetívoro", habitat: "Generalista", descricao: "Insetos em arbustos" },
            "Serpophaga griseicapilla": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Attila phoenicurus": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Attila rufus": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Legatus leucophaius": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Frutos e insetos, cleptoparasita" },
            "Ramphotrigon megacephalum": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Myiarchus swainsoni": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Myiarchus ferox": { guilda: "Insetívoro/Frugívoro", habitat: "Generalista", descricao: "Insetos e frutos" },
            "Sirystes sibilator": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel" },
            "Pitangus sulphuratus": { guilda: "Onívoro", habitat: "Generalista", descricao: "Insetos, frutos, anfíbios, peixes, lagartos" },
            "Machetornis rixosa": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos, segue gado e aves grandes" },
            "Myiodynastes maculatus": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Megarynchus pitangua": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos, frutos e anfíbios" },
            "Myiozetetes similis": { guilda: "Insetívoro/Frugívoro", habitat: "Generalista", descricao: "Insetos e frutos" },
            "Tyrannus albogularis": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos capturados em voo" },
            "Tyrannus melancholicus": { guilda: "Insetívoro/Frugívoro", habitat: "Generalista", descricao: "Insetos e frutos" },
            "Tyrannus savana": { guilda: "Insetívoro aéreo", habitat: "Campestre", descricao: "Insetos capturados em voo" },
            "Tyrannus tyrannus": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos e frutos" },
            "Griseotyrannus aurantioatrocristatus": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Empidonomus varius": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Conopias trivirgatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel" },
            "Colonia colonus": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos capturados em voo" },
            "Arundinicola leucocephala": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em bejiros de água" },
            "Fluvicola albiventer": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em beiras d'água" },
            "Fluvicola nengeta": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em beiras d'água" },
            "Pyrocephalus rubinus": { guilda: "Insetívoro aéreo", habitat: "Campestre", descricao: "Insetos capturados em voo" },
            "Muscipipra vetula": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos capturados em voo" },
            "Gubernetes yetapa": { guilda: "Insetívoro aéreo", habitat: "Aquático", descricao: "Insetos capturados em voo sobre banhados" },
            "Heteroxolmis dominicanus": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em campos" },
            "Myiophobus fasciatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Cnemotriccus fuscatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Lathrotriccus euleri": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Contopus cinereus": { guilda: "Insetívoro aéreo", habitat: "Florestal", descricao: "Insetos capturados em voo" },
            "Satrapa icterophrys": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em beiras d'água" },
            "Lessonia rufa": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em beiras de rios" },
            "Hymenops perspicillatus": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em banhados" },
            "Knipolegus lophotes": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em arbustos" },
            "Knipolegus nigerrimus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em borda de floresta" },
            "Knipolegus cyanirostris": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Xolmis irupero": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos no campo" },
            "Xolmis velatus": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em campos" },
            "Nengetus cinereus": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em campos" },
            "Cyclarhis gujanensis": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos, lagartos, frutos" },
            "Hylophilus poicilotis": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel" },
            "Vireo chivi": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Cyanocorax caeruleus": { guilda: "Onívoro", habitat: "Florestal", descricao: "Frutos de araucária, insetos, ovos, vertebrados" },
            "Cyanocorax cristatellus": { guilda: "Onívoro", habitat: "Campestre", descricao: "Insetos, frutos, invertebrados" },
            "Cyanocorax chrysops": { guilda: "Onívoro", habitat: "Florestal", descricao: "Frutos, insetos, ovos" },
            "Pygochelidon cyanoleuca": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos capturados em voo" },
            "Alopochelidon fucata": { guilda: "Insetívoro aéreo", habitat: "Campestre", descricao: "Insetos capturados em voo" },
            "Stelgidopteryx ruficollis": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos capturados em voo" },
            "Progne tapera": { guilda: "Insetívoro aéreo", habitat: "Campestre", descricao: "Insetos capturados em voo" },
            "Progne subis": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos capturados em voo" },
            "Progne chalybea": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos capturados em voo" },
            "Progne elegans": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos capturados em voo" },
            "Tachycineta albiventer": { guilda: "Insetívoro aéreo", habitat: "Aquático", descricao: "Insetos capturados em voo sobre rios" },
            "Tachycineta leucorrhoa": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos capturados em voo" },
            "Tachycineta leucopyga": { guilda: "Insetívoro aéreo", habitat: "Campestre", descricao: "Insetos capturados em voo" },
            "Riparia riparia": { guilda: "Insetívoro aéreo", habitat: "Aquático", descricao: "Insetos capturados em voo" },
            "Hirundo rustica": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos capturados em voo" },
            "Petrochelidon pyrrhonota": { guilda: "Insetívoro aéreo", habitat: "Generalista", descricao: "Insetos capturados em voo" },
            "Troglodytes musculus": { guilda: "Insetívoro", habitat: "Generalista", descricao: "Insetos e aranhas no sub-bosque" },
            "Cistothorus platensis": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em campos úmidos" },
            "Campylorhynchus turdinus": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos, aranhas, frutos" },
            "Cantorchilus longirostris": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos em borda densa" },
            "Ramphocaenus melanurus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e aranhas" },
            "Polioptila dumicola": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e aranhas" },
            "Polioptila lactea": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos e aranhas" },
            "Catharus fuscescens": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Catharus swainsoni": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos, minhocas, frutos" },
            "Turdus flavipes": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e invertebrados" },
            "Turdus leucomelas": { guilda: "Onívoro", habitat: "Generalista", descricao: "Frutos, insetos, minhocas" },
            "Turdus rufiventris": { guilda: "Onívoro", habitat: "Generalista", descricao: "Frutos, insetos, minhocas" },
            "Turdus amaurochalinus": { guilda: "Onívoro", habitat: "Generalista", descricao: "Frutos, insetos, minhocas" },
            "Turdus subalaris": { guilda: "Onívoro", habitat: "Florestal", descricao: "Frutos, insetos, minhocas" },
            "Turdus albicollis": { guilda: "Onívoro", habitat: "Florestal", descricao: "Frutos, insetos, minhocas, lagartos" },
            "Mimus saturninus": { guilda: "Onívoro", habitat: "Campestre", descricao: "Insetos, frutos, pequenos vertebrados" },
            "Mimus triurus": { guilda: "Onívoro", habitat: "Campestre", descricao: "Insetos, frutos, lagartos" },
            "Sturnus vulgaris": { guilda: "Onívoro", habitat: "Generalista", descricao: "Insetos, frutos, grãos, invertebrados" },
            "Estrilda astrild": { guilda: "Granívoro", habitat: "Generalista", descricao: "Sementes de gramíneas" },
            "Passer domesticus": { guilda: "Granívoro/Insetívoro", habitat: "Generalista", descricao: "Sementes, grãos, insetos" },
            "Anthus chii": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos e invertebrados no chão" },
            "Anthus correndera": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos e invertebrados" },
            "Anthus nattereri": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em campos" },
            "Anthus hellmayri": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos e invertebrados" },
            "Spinus magellanicus": { guilda: "Granívoro", habitat: "Florestal", descricao: "Sementes, especialmente de gramíneas e compostas" },
            "Cyanophonia cyanocephala": { guilda: "Frugívoro", habitat: "Florestal", descricao: "Frutos de visco e erva-de-passarinho" },
            "Chlorophonia cyanea": { guilda: "Frugívoro", habitat: "Florestal", descricao: "Frutos de visco e erva-de-passarinho" },
            "Euphonia chlorotica": { guilda: "Frugívoro", habitat: "Florestal", descricao: "Frutos de visco e erva-de-passarinho" },
            "Euphonia chalybea": { guilda: "Frugívoro", habitat: "Florestal", descricao: "Frutos de visco" },
            "Euphonia violacea": { guilda: "Frugívoro", habitat: "Florestal", descricao: "Frutos de visco e outras plantas" },
            "Euphonia pectoralis": { guilda: "Frugívoro", habitat: "Florestal", descricao: "Frutos de visco" },
            "Ammodramus humeralis": { guilda: "Granívoro/Insetívoro", habitat: "Campestre", descricao: "Sementes e insetos no campo" },
            "Arremon semitorquatus": { guilda: "Granívoro/Insetívoro", habitat: "Florestal", descricao: "Sementes e insetos no solo" },
            "Zonotrichia capensis": { guilda: "Granívoro/Insetívoro", habitat: "Generalista", descricao: "Sementes, insetos e frutos" },
            "Leistes superciliaris": { guilda: "Insetívoro/Granívoro", habitat: "Campestre", descricao: "Insetos e sementes" },
            "Cacicus chrysopterus": { guilda: "Onívoro", habitat: "Florestal", descricao: "Insetos, néctar, frutos" },
            "Cacicus haemorrhous": { guilda: "Onívoro", habitat: "Florestal", descricao: "Insetos, néctar, frutos" },
            "Icterus pyrrhopterus": { guilda: "Insetívoro/Nectarívoro", habitat: "Florestal", descricao: "Insetos, néctar e frutos" },
            "Icterus galbula": { guilda: "Insetívoro/Nectarívoro", habitat: "Florestal", descricao: "Insetos, néctar, frutos" },
            "Molothrus rufoaxillaris": { guilda: "Granívoro/Insetívoro", habitat: "Campestre", descricao: "Sementes e insetos, parasita" },
            "Molothrus oryzivorus": { guilda: "Granívoro/Insetívoro", habitat: "Generalista", descricao: "Grãos e insetos, parasita" },
            "Molothrus bonariensis": { guilda: "Granívoro/Insetívoro", habitat: "Generalista", descricao: "Sementes e insetos, parasita" },
            "Amblyramphus holosericeus": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em juncos" },
            "Gnorimopsar chopi": { guilda: "Onívoro", habitat: "Generalista", descricao: "Insetos, frutos, sementes" },
            "Agelaioides badius": { guilda: "Granívoro/Insetívoro", habitat: "Campestre", descricao: "Sementes e insetos" },
            "Agelasticus thilius": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em banhados" },
            "Chrysomus ruficapillus": { guilda: "Insetívoro/Granívoro", habitat: "Aquático", descricao: "Insetos e sementes em banhados" },
            "Xanthopsar flavus": { guilda: "Insetívoro/Granívoro", habitat: "Campestre", descricao: "Insetos e sementes" },
            "Pseudoleistes guirahuro": { guilda: "Insetívoro/Granívoro", habitat: "Aquático", descricao: "Insetos e sementes em banhados" },
            "Pseudoleistes virescens": { guilda: "Insetívoro/Granívoro", habitat: "Aquático", descricao: "Insetos e sementes" },
            "Geothlypis aequinoctialis": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em juncos e banhados" },
            "Setophaga cerulea": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel" },
            "Setophaga pitiayumi": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel" },
            "Setophaga striata": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel" },
            "Myiothlypis leucoblephara": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque e solo" },
            "Myiothlypis rivularis": { guilda: "Insetívoro", habitat: "Aquático", descricao: "Insetos em beiras de riachos" },
            "Basileuterus culicivorus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Orthogonys chloricterus": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos no dossel" },
            "Piranga flava": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Habia rubica": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos, segue correições de formigas" },
            "Amaurospiza moesta": { guilda: "Granívoro", habitat: "Florestal", descricao: "Sementes de bambu" },
            "Cyanoloxia glaucocaerulea": { guilda: "Granívoro", habitat: "Florestal", descricao: "Sementes" },
            "Cyanoloxia brissonii": { guilda: "Granívoro", habitat: "Florestal", descricao: "Sementes e frutos" },
            "Orchesticus abeillei": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Nemosia pileata": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no dossel" },
            "Embernagra platensis": { guilda: "Granívoro/Insetívoro", habitat: "Aquático", descricao: "Sementes e insetos em banhados" },
            "Emberizoides herbicola": { guilda: "Granívoro/Insetívoro", habitat: "Campestre", descricao: "Sementes e insetos" },
            "Emberizoides ypiranganus": { guilda: "Granívoro/Insetívoro", habitat: "Aquático", descricao: "Sementes e insetos" },
            "Rhopospina fruticeti": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes em campos" },
            "Chlorophanes spiza": { guilda: "Nectarívoro/Frugívoro", habitat: "Florestal", descricao: "Néctar, frutos e insetos" },
            "Hemithraupis guira": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Hemithraupis ruficapilla": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Tersina viridis": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos capturados em voo" },
            "Cyanerpes cyaneus": { guilda: "Nectarívoro/Frugívoro", habitat: "Florestal", descricao: "Néctar, frutos e insetos" },
            "Dacnis nigripes": { guilda: "Nectarívoro/Frugívoro", habitat: "Florestal", descricao: "Néctar, frutos e insetos" },
            "Dacnis cayana": { guilda: "Nectarívoro/Frugívoro", habitat: "Florestal", descricao: "Néctar, frutos e insetos" },
            "Saltator similis": { guilda: "Frugívoro/Granívoro", habitat: "Florestal", descricao: "Frutos, sementes e insetos" },
            "Saltator maxillosus": { guilda: "Frugívoro/Granívoro", habitat: "Florestal", descricao: "Frutos e sementes duras" },
            "Saltator fuliginosus": { guilda: "Frugívoro/Granívoro", habitat: "Florestal", descricao: "Frutos e sementes" },
            "Coereba flaveola": { guilda: "Nectarívoro/Frugívoro", habitat: "Generalista", descricao: "Néctar floral e frutos" },
            "Asemospiza fuliginosa": { guilda: "Granívoro", habitat: "Florestal", descricao: "Sementes em borda e interior" },
            "Volatinia jacarina": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes de gramíneas" },
            "Trichothraupis melanops": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos, segue formigas" },
            "Loriotus cristatus": { guilda: "Insetívoro", habitat: "Florestal", descricao: "Insetos no sub-bosque" },
            "Tachyphonus coronatus": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Ramphocelus bresilia": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Ramphocelus carbo": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Sporophila lineola": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes de gramíneas" },
            "Sporophila frontalis": { guilda: "Granívoro", habitat: "Florestal", descricao: "Sementes de bambu" },
            "Sporophila falcirostris": { guilda: "Granívoro", habitat: "Florestal", descricao: "Sementes de bambu" },
            "Sporophila beltoni": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes de gramíneas" },
            "Sporophila collaris": { guilda: "Granívoro", habitat: "Aquático", descricao: "Sementes em banhados" },
            "Sporophila caerulescens": { guilda: "Granívoro", habitat: "Generalista", descricao: "Sementes de gramíneas" },
            "Sporophila leucoptera": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes de gramíneas" },
            "Sporophila pileata": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes de gramíneas" },
            "Sporophila hypoxantha": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes de gramíneas" },
            "Sporophila ruficollis": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes de gramíneas" },
            "Sporophila palustris": { guilda: "Granívoro", habitat: "Aquático", descricao: "Sementes em campos úmidos" },
            "Sporophila cinnamomea": { guilda: "Granívoro", habitat: "Aquático", descricao: "Sementes em campos úmidos" },
            "Sporophila melanogaster": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes de gramíneas" },
            "Sporophila angolensis": { guilda: "Granívoro", habitat: "Generalista", descricao: "Sementes de bambu e outras gramíneas" },
            "Poospiza nigrorufa": { guilda: "Granívoro/Insetívoro", habitat: "Campestre", descricao: "Sementes e insetos" },
            "Thlypopsis sordida": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Thlypopsis pyrrhocoma": { guilda: "Insetívoro/Frugívoro", habitat: "Florestal", descricao: "Insetos e frutos" },
            "Castanozoster thoracicus": { guilda: "Granívoro/Insetívoro", habitat: "Florestal", descricao: "Sementes de bambu e insetos" },
            "Donacospiza albifrons": { guilda: "Granívoro/Insetívoro", habitat: "Aquático", descricao: "Sementes e insetos em banhados" },
            "Microspingus cabanisi": { guilda: "Insetívoro", habitat: "Campestre", descricao: "Insetos em arbustais" },
            "Conirostrum speciosum": { guilda: "Nectarívoro/Insetívoro", habitat: "Florestal", descricao: "Néctar e insetos no dossel" },
            "Conirostrum bicolor": { guilda: "Nectarívoro/Insetívoro", habitat: "Costeiro", descricao: "Néctar e insetos em mangue" },
            "Sicalis citrina": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes de gramíneas" },
            "Sicalis flaveola": { guilda: "Granívoro", habitat: "Generalista", descricao: "Sementes e frutos" },
            "Sicalis luteola": { guilda: "Granívoro", habitat: "Campestre", descricao: "Sementes de gramíneas" },
            "Haplospiza unicolor": { guilda: "Granívoro", habitat: "Florestal", descricao: "Sementes de bambu" },
            "Pipraeidea melanonota": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Rauenia bonariensis": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Stephanophorus diadematus": { guilda: "Frugívoro/Onívoro", habitat: "Florestal", descricao: "Frutos, insetos, néctar" },
            "Cissopis leverianus": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Schistochlamys ruficapillus": { guilda: "Insetívoro/Frugívoro", habitat: "Campestre", descricao: "Insetos e frutos em borda" },
            "Paroaria coronata": { guilda: "Granívoro/Insetívoro", habitat: "Campestre", descricao: "Sementes e insetos" },
            "Thraupis sayaca": { guilda: "Frugívoro/Insetívoro", habitat: "Generalista", descricao: "Frutos, insetos, néctar" },
            "Thraupis cyanoptera": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Thraupis palmarum": { guilda: "Frugívoro/Insetívoro", habitat: "Generalista", descricao: "Frutos de palmeiras e insetos" },
            "Thraupis ornata": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Stilpnia peruviana": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Stilpnia preciosa": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Tangara seledon": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos, insetos e néctar" },
            "Tangara cyanocephala": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos e insetos" },
            "Tangara desmaresti": { guilda: "Frugívoro/Insetívoro", habitat: "Florestal", descricao: "Frutos, insetos e néctar" },
            "Pseudastur polionotus": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Aves, lagartos, pequenos mamíferos" },
            "Amadonastur lacernulatus": { guilda: "Carnívoro", habitat: "Florestal", descricao: "Aves e pequenos mamíferos" },
        };

    function getGuildClass(guilda) {
        if (!guilda) return 'guild-mixed';
        const g = guilda.split('/')[0].trim().replace(/\s+/g, '-');
        return 'guild-' + g;
    }

    function getHabitatClass(h) {
        return 'habitat-' + (h || 'Generalista').trim();
    }

    function buildGuildTable() {
        const search    = (document.getElementById('guild-search')?.value || '').toLowerCase();
        const fGuilda   = document.getElementById('guild-filter-guilda')?.value || '';
        const fHabitat  = document.getElementById('guild-filter-habitat')?.value || '';
        const onlyImp   = document.getElementById('guild-only-imported')?.checked;

        // Get imported species (lê o input dentro de td.species-col)
        const importedSet = new Set();
        document.querySelectorAll('#table-body tr').forEach(tr => {
            const spCell = tr.querySelector('td.species-col');
            if (spCell) {
                const inp = spCell.querySelector('input');
                const val = inp ? inp.value.trim() : spCell.textContent.trim();
                if (val) importedSet.add(val);
            }
        });

        // Build rows from GUILDA_DB
        let rows = Object.entries(GUILDA_DB).map(([especie, info]) => {
            const cons = conservationData.find(c => c.especie === especie);
            return {
                especie,
                nomePopular: cons ? cons.nomePopular : '-',
                guilda: info.guilda,
                habitat: info.habitat,
                descricao: info.descricao,
                inTable: importedSet.has(especie)
            };
        });

        if (onlyImp) rows = rows.filter(r => r.inTable);
        if (fGuilda) rows = rows.filter(r => r.guilda === fGuilda);
        if (fHabitat) rows = rows.filter(r => r.habitat === fHabitat);
        if (search) rows = rows.filter(r =>
            r.especie.toLowerCase().includes(search) ||
            r.nomePopular.toLowerCase().includes(search) ||
            r.guilda.toLowerCase().includes(search) ||
            r.descricao.toLowerCase().includes(search)
        );

        // Sort
        if (_guildSort.col) {
            rows.sort((a, b) => {
                const va = a[_guildSort.col] || '', vb = b[_guildSort.col] || '';
                return _guildSort.asc ? va.localeCompare(vb) : vb.localeCompare(va);
            });
        }

        const tbody = document.getElementById('guild-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        rows.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><em>${r.especie}</em></td>
                <td>${r.nomePopular}</td>
                <td><span class="guild-badge ${getGuildClass(r.guilda)}">${r.guilda}</span></td>
                <td><span class="habitat-badge ${getHabitatClass(r.habitat)}">${r.habitat}</span></td>
                <td style="font-size:13px; color:var(--text-mid);">${r.descricao}</td>
                <td style="text-align:center;">${r.inTable ? '<span class="in-table-yes">✓</span>' : '<span class="in-table-no">—</span>'}</td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('guild-count').textContent = `${rows.length} espécies exibidas`;
        buildGuildStats(rows);
        buildGuildCharts(rows);
    }

    let _guildSort = { col: 'especie', asc: true };
    let _guildChartInstances = {};

    function buildGuildStats(rows) {
        const container = document.getElementById('guild-stats-row');
        if (!container) return;

        const total = rows.length;
        const guildas = {};
        rows.forEach(r => { guildas[r.guilda] = (guildas[r.guilda] || 0) + 1; });
        const topGuilda = Object.entries(guildas).sort((a,b) => b[1]-a[1])[0];
        const inTable   = rows.filter(r => r.inTable).length;
        const habitats  = new Set(rows.map(r => r.habitat)).size;

        container.innerHTML = `
            <div class="guild-stat-card"><div class="stat-num">${total}</div><div class="stat-label">Total de espécies</div></div>
            <div class="guild-stat-card"><div class="stat-num">${Object.keys(guildas).length}</div><div class="stat-label">Guildas distintas</div></div>
            <div class="guild-stat-card"><div class="stat-num">${inTable}</div><div class="stat-label">Importadas</div></div>
            <div class="guild-stat-card"><div class="stat-num">${topGuilda ? topGuilda[1] : 0}</div><div class="stat-label">Guilda mais freq.: ${topGuilda ? topGuilda[0] : '-'}</div></div>
            <div class="guild-stat-card"><div class="stat-num">${habitats}</div><div class="stat-label">Tipos de habitat</div></div>
        `;
    }

    const GUILD_COLORS = {
        'Insetívoro':         '#2a9d5c',
        'Insetívoro aéreo':   '#3490d4',
        'Frugívoro':          '#e07820',
        'Granívoro':          '#c8a010',
        'Nectarívoro':        '#c030a0',
        'Carnívoro':          '#d03030',
        'Piscívoro':          '#2060d0',
        'Onívoro':            '#6040c0',
        'Detritívoro':        '#707060',
        'Filtrador':          '#20a0a0',
        'Herbívoro':          '#50a030',
        'Malacófago':         '#a06030',
        'Cleptoparasita':     '#a030a0',
        'Insetívoro/Frugívoro': '#5a9a40',
        'Frugívoro/Insetívoro': '#c06820',
        'Insetívoro/Carnívoro': '#b03a3a',
        'Frugívoro/Granívoro':  '#d4900a',
        'Frugívoro/Onívoro':    '#7050b0',
        'Insetívoro/Granívoro': '#708020',
        'Granívoro/Insetívoro': '#887020',
        'Piscívoro/Insetívoro': '#3068b8',
        'Carnívoro/Piscívoro':  '#b02828',
        'Onívoro/Detritívoro':  '#806050',
        'Detritívoro/Piscívoro':'#506060',
        'Filtrador/Herbívoro':  '#30b090',
        'Herbívoro/Filtrador':  '#30b090',
        'Herbívoro/Onívoro':    '#608040',
        'Filtrador/Piscívoro':  '#3090a0',
        'Insetívoro/Nectarívoro': '#a040b0',
        'Nectarívoro/Frugívoro':  '#d040b0',
        'Nectarívoro/Insetívoro': '#b030a0',
        'Malacófago/Onívoro':   '#906040',
        'Cleptoparasita/Onívoro':'#904090',
        'Cleptoparasita/Piscívoro':'#782878',
    };

    function buildGuildCharts(rows) {
        const chartsRow = document.getElementById('guild-charts-row');
        if (!chartsRow) return;

        // Destroy existing charts
        Object.values(_guildChartInstances).forEach(c => { try { c.destroy(); } catch(e){} });
        _guildChartInstances = {};
        chartsRow.innerHTML = '';

        // Count by guilda & habitat
        const guildCount = {}, habitatCount = {};
        rows.forEach(r => {
            guildCount[r.guilda]   = (guildCount[r.guilda]   || 0) + 1;
            habitatCount[r.habitat] = (habitatCount[r.habitat] || 0) + 1;
        });

        // Altura fixa do canvas do donut — igual para ambos os gráficos
        const DONUT_H = 300;
        // Altura da legenda HTML calculada pelo maior número de itens (3 itens por linha, 22px/linha)
        const guildItems   = Object.keys(guildCount).length;
        const habitatItems = Object.keys(habitatCount).length;
        const legendLines  = Math.ceil(Math.max(guildItems, habitatItems) / 3);
        const LEGEND_H     = Math.max(legendLines * 22, 44);

        function makeChart(id, title, countObj, palette) {
            const labels = Object.keys(countObj);
            const data   = Object.values(countObj);
            const colors = labels.map(l => palette[l] || '#999');

            // Legenda HTML externa — mesma altura para ambos
            const legendHtml = labels.map((lbl, i) =>
                `<span style="display:inline-flex;align-items:center;gap:4px;margin:2px 6px;font-size:11px;white-space:nowrap;">
                    <span style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${colors[i]};flex-shrink:0;"></span>
                    ${lbl} (${data[i]})
                </span>`
            ).join('');

            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'flex:1 1 0; min-width:280px; background:var(--surface); border:1px solid var(--border-light); border-radius:var(--radius-md); padding:16px; box-shadow:var(--shadow-soft); display:flex; flex-direction:column;';
            wrapper.innerHTML = `
                <h4 style="text-align:center;margin-bottom:10px;color:var(--green-deep);font-size:14px;">${title}</h4>
                <div style="height:${DONUT_H}px;flex-shrink:0;"><canvas id="${id}"></canvas></div>
                <div style="min-height:${LEGEND_H}px;margin-top:10px;text-align:center;line-height:1.6;">${legendHtml}</div>`;
            chartsRow.appendChild(wrapper);

            const ctx = document.getElementById(id);
            if (!ctx) return;
            _guildChartInstances[id] = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{ data, backgroundColor: colors, borderWidth: 1, borderColor: 'white' }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: 8 },
                    plugins: {
                        legend: { display: false },  // legenda via HTML externo
                        tooltip: { callbacks: { label: c => `${c.label}: ${c.raw} (${((c.raw/rows.length)*100).toFixed(1)}%)` } },
                        datalabels: {
                            display: c => c.dataset.data[c.dataIndex] > 0,
                            color: '#ffffff',
                            font: { size: 11, weight: '700' },
                            formatter: (v) => {
                                const pct = (v / rows.length * 100);
                                return pct >= 5 ? v : '';
                            }
                        }
                    }
                }
            });
        }

        const HABITAT_COLORS = {
            'Florestal': '#2a7a40', 'Aquático': '#2060c0', 'Campestre': '#c09020',
            'Costeiro': '#20909a', 'Generalista': '#808080', 'Aéreo': '#3050d0'
        };

        makeChart('guild-pie-guilda',  'Distribuição por Guilda',  guildCount,   GUILD_COLORS);
        makeChart('guild-pie-habitat', 'Distribuição por Habitat', habitatCount, HABITAT_COLORS);
    }

    function setGuildView(mode) {
        const chk = document.getElementById('guild-only-imported');
        const btnImported = document.getElementById('guild-view-imported');
        const btnAll      = document.getElementById('guild-view-all');
        if (mode === 'imported') {
            if (chk) chk.checked = true;
            if (btnImported) { btnImported.style.background = 'var(--green-base)'; btnImported.style.color = 'white'; }
            if (btnAll)      { btnAll.style.background = 'white'; btnAll.style.color = 'var(--green-base)'; }
        } else {
            if (chk) chk.checked = false;
            if (btnAll)      { btnAll.style.background = 'var(--green-base)'; btnAll.style.color = 'white'; }
            if (btnImported) { btnImported.style.background = 'white'; btnImported.style.color = 'var(--green-base)'; }
        }
        buildGuildTable();
    }
    window.setGuildView = setGuildView;

    function initGuildTab() {
        // Populate filter selects
        const guildas  = [...new Set(Object.values(GUILDA_DB).map(v => v.guilda))].sort();
        const habitats = [...new Set(Object.values(GUILDA_DB).map(v => v.habitat))].sort();

        const sg = document.getElementById('guild-filter-guilda');
        guildas.forEach(g => { const o = document.createElement('option'); o.value = g; o.textContent = g; sg.appendChild(o); });

        const sh = document.getElementById('guild-filter-habitat');
        habitats.forEach(h => { const o = document.createElement('option'); o.value = h; o.textContent = h; sh.appendChild(o); });

        // Events
        document.getElementById('guild-search')?.addEventListener('input', buildGuildTable);
        document.getElementById('guild-filter-guilda')?.addEventListener('change', buildGuildTable);
        document.getElementById('guild-filter-habitat')?.addEventListener('change', buildGuildTable);
        document.getElementById('guild-only-imported')?.addEventListener('change', buildGuildTable);

        // Sort
        document.querySelectorAll('#guild-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.sort;
                if (_guildSort.col === col) _guildSort.asc = !_guildSort.asc;
                else { _guildSort.col = col; _guildSort.asc = true; }
                document.querySelectorAll('#guild-table .sort-arrow').forEach(s => s.textContent = '↕');
                th.querySelector('.sort-arrow').textContent = _guildSort.asc ? '↑' : '↓';
                buildGuildTable();
            });
        });

        // Export CSV
        document.getElementById('guild-export-csv')?.addEventListener('click', () => {
            const rows = [...document.querySelectorAll('#guild-table-body tr')];
            const csv = ['Espécie,Nome Popular,Guilda,Habitat,Descrição,Na Tabela'];
            rows.forEach(tr => {
                const cells = [...tr.querySelectorAll('td')].map(td => '"' + td.textContent.trim().replace(/"/g,'""') + '"');
                csv.push(cells.join(','));
            });
            const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'guilda_alimentar_SC.csv'; a.click();
        });

        // Copy
        document.getElementById('guild-copy')?.addEventListener('click', () => {
            const rows = [...document.querySelectorAll('#guild-table-body tr')];
            const text = ['Espécie\tNome Popular\tGuilda\tHabitat\tDescrição\tNa Tabela'];
            rows.forEach(tr => {
                text.push([...tr.querySelectorAll('td')].map(td => td.textContent.trim()).join('\t'));
            });
            navigator.clipboard.writeText(text.join('\n'));
        });

        // Inicia na view correta: importadas se houver, senão todas
        const _guildImpSet = new Set();
        document.querySelectorAll('#table-body tr').forEach(tr => {
            const spCell = tr.querySelector('td.species-col');
            if (spCell) { const inp = spCell.querySelector('input'); const val = inp ? inp.value.trim() : spCell.textContent.trim(); if (val) _guildImpSet.add(val); }
        });
        if (_guildImpSet.size > 0) { setGuildView('imported'); } else { setGuildView('all'); }
    }

    // Hook into tab switching
    const _origTabSwitcher = window._guildTabInitialized;
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.tab === 'guild-section' && !window._guildTabInitialized) {
                    window._guildTabInitialized = true;
                    initGuildTab();
                } else if (btn.dataset.tab === 'guild-section') {
                    buildGuildTable();
                }
            });
        });
    });
    // ==================== FIM GUILDA ALIMENTAR ====================

    // ==================== DESCRITORES ====================
    const DESCRIPTOR_DB = {
        "Rhea americana": { descritor: "Linnaeus", ano: 1758 },
        "Tinamus solitarius": { descritor: "Vieillot", ano: 1819 },
        "Crypturellus obsoletus": { descritor: "Temminck", ano: 1815 },
        "Crypturellus noctivagus": { descritor: "Wied", ano: 1820 },
        "Crypturellus parvirostris": { descritor: "Wagler", ano: 1827 },
        "Crypturellus tataupa": { descritor: "Temminck", ano: 1815 },
        "Rhynchotus rufescens": { descritor: "Temminck", ano: 1815 },
        "Nothura maculosa": { descritor: "Temminck", ano: 1815 },
        "Anhima cornuta": { descritor: "Linnaeus", ano: 1766 },
        "Chauna torquata": { descritor: "Oken", ano: 1816 },
        "Dendrocygna bicolor": { descritor: "Vieillot", ano: 1816 },
        "Dendrocygna viduata": { descritor: "Linnaeus", ano: 1766 },
        "Dendrocygna autumnalis": { descritor: "Linnaeus", ano: 1758 },
        "Coscoroba coscoroba": { descritor: "Molina", ano: 1782 },
        "Cairina moschata": { descritor: "Linnaeus", ano: 1758 },
        "Sarkidiornis sylvicola": { descritor: "Ihering & Ihering", ano: 1907 },
        "Callonetta leucophrys": { descritor: "Vieillot", ano: 1816 },
        "Amazonetta brasiliensis": { descritor: "Gmelin", ano: 1789 },
        "Spatula versicolor": { descritor: "Vieillot", ano: 1816 },
        "Spatula platalea": { descritor: "Vieillot", ano: 1816 },
        "Spatula discors": { descritor: "Linnaeus", ano: 1766 },
        "Spatula cyanoptera": { descritor: "Vieillot", ano: 1816 },
        "Mareca sibilatrix": { descritor: "Poeppig", ano: 1829 },
        "Anas bahamensis": { descritor: "Linnaeus", ano: 1758 },
        "Anas acuta": { descritor: "Linnaeus", ano: 1758 },
        "Anas georgica": { descritor: "Gmelin", ano: 1789 },
        "Anas flavirostris": { descritor: "Vieillot", ano: 1816 },
        "Netta erythrophthalma": { descritor: "Wied", ano: 1832 },
        "Netta peposaca": { descritor: "Vieillot", ano: 1816 },
        "Heteronetta atricapilla": { descritor: "Merrem", ano: 1841 },
        "Nomonyx dominicus": { descritor: "Linnaeus", ano: 1766 },
        "Oxyura vittata": { descritor: "Philippi", ano: 1860 },
        "Penelope superciliaris": { descritor: "Temminck", ano: 1815 },
        "Penelope obscura": { descritor: "Temminck", ano: 1815 },
        "Aburria jacutinga": { descritor: "Spix", ano: 1825 },
        "Ortalis squamata": { descritor: "Lesson", ano: 1829 },
        "Odontophorus capueira": { descritor: "Spix", ano: 1825 },
        "Phoenicoparrus andinus": { descritor: "Philippi", ano: 1854 },
        "Rollandia rolland": { descritor: "Quoy & Gaimard", ano: 1824 },
        "Tachybaptus dominicus": { descritor: "Linnaeus", ano: 1766 },
        "Podilymbus podiceps": { descritor: "Linnaeus", ano: 1758 },
        "Podicephorus major": { descritor: "Boddaert", ano: 1783 },
        "Columba livia": { descritor: "Gmelin", ano: 1789 },
        "Patagioenas picazuro": { descritor: "Temminck", ano: 1813 },
        "Patagioenas cayennensis": { descritor: "Bonnaterre", ano: 1792 },
        "Patagioenas plumbea": { descritor: "Vieillot", ano: 1818 },
        "Geotrygon montana": { descritor: "Linnaeus", ano: 1758 },
        "Leptotila verreauxi": { descritor: "Bonaparte", ano: 1855 },
        "Leptotila rufaxilla": { descritor: "Richard & Bernard", ano: 1792 },
        "Zenaida auriculata": { descritor: "Des Murs", ano: 1847 },
        "Claravis pretiosa": { descritor: "Ferrari-Perez", ano: 1886 },
        "Columbina talpacoti": { descritor: "Temminck", ano: 1811 },
        "Columbina squammata": { descritor: "Lesson", ano: 1831 },
        "Columbina picui": { descritor: "Temminck", ano: 1813 },
        "Guira guira": { descritor: "Gmelin", ano: 1788 },
        "Crotophaga major": { descritor: "Gmelin", ano: 1788 },
        "Crotophaga ani": { descritor: "Linnaeus", ano: 1758 },
        "Tapera naevia": { descritor: "Linnaeus", ano: 1766 },
        "Dromococcyx phasianellus": { descritor: "Spix", ano: 1824 },
        "Dromococcyx pavoninus": { descritor: "Pelzeln", ano: 1870 },
        "Micrococcyx cinereus": { descritor: "Vieillot", ano: 1817 },
        "Piaya cayana": { descritor: "Linnaeus", ano: 1766 },
        "Coccyzus melacoryphus": { descritor: "Vieillot", ano: 1817 },
        "Coccyzus americanus": { descritor: "Linnaeus", ano: 1758 },
        "Coccyzus euleri": { descritor: "Cabanis", ano: 1873 },
        "Coccyzus erythropthalmus": { descritor: "Wilson", ano: 1811 },
        "Nyctibius griseus": { descritor: "Gmelin", ano: 1789 },
        "Antrostomus rufus": { descritor: "Boddaert", ano: 1783 },
        "Antrostomus sericocaudatus": { descritor: "Cassin", ano: 1849 },
        "Lurocalis semitorquatus": { descritor: "Gmelin", ano: 1789 },
        "Nyctidromus albicollis": { descritor: "Gmelin", ano: 1789 },
        "Hydropsalis parvula": { descritor: "Gould", ano: 1837 },
        "Hydropsalis anomala": { descritor: "Gould", ano: 1837 },
        "Hydropsalis longirostris": { descritor: "Bonaparte", ano: 1825 },
        "Hydropsalis torquata": { descritor: "Gmelin", ano: 1789 },
        "Hydropsalis forcipata": { descritor: "Nitzsch", ano: 1840 },
        "Podager nacunda": { descritor: "Vieillot", ano: 1817 },
        "Chordeiles minor": { descritor: "Forster", ano: 1771 },
        "Cypseloides fumigatus": { descritor: "Streubel", ano: 1848 },
        "Cypseloides senex": { descritor: "Temminck", ano: 1826 },
        "Streptoprocne zonaris": { descritor: "Shaw", ano: 1796 },
        "Streptoprocne biscutata": { descritor: "Sclater", ano: 1866 },
        "Chaetura cinereiventris": { descritor: "Sclater", ano: 1865 },
        "Chaetura meridionalis": { descritor: "Hellmayr", ano: 1907 },
        "Panyptila cayennensis": { descritor: "Gmelin", ano: 1789 },
        "Florisuga fusca": { descritor: "Vieillot", ano: 1817 },
        "Ramphodon naevius": { descritor: "Dumont", ano: 1818 },
        "Phaethornis squalidus": { descritor: "Temminck", ano: 1822 },
        "Phaethornis pretrei": { descritor: "Lesson & Delattre", ano: 1839 },
        "Phaethornis eurynome": { descritor: "Lesson", ano: 1832 },
        "Colibri serrirostris": { descritor: "Vieillot", ano: 1816 },
        "Anthracothorax nigricollis": { descritor: "Vieillot", ano: 1817 },
        "Lophornis magnificus": { descritor: "Vieillot", ano: 1817 },
        "Lophornis chalybeus": { descritor: "Vieillot", ano: 1822 },
        "Heliodoxa rubricauda": { descritor: "Boddaert", ano: 1783 },
        "Heliomaster furcifer": { descritor: "Shaw", ano: 1812 },
        "Calliphlox amethystina": { descritor: "Boddaert", ano: 1783 },
        "Chlorostilbon lucidus": { descritor: "Shaw", ano: 1812 },
        "Stephanoxis loddigesii": { descritor: "Gould", ano: 1831 },
        "Thalurania glaucopis": { descritor: "Gmelin", ano: 1788 },
        "Eupetomena macroura": { descritor: "Gmelin", ano: 1788 },
        "Aphantochroa cirrochloris": { descritor: "Vieillot", ano: 1818 },
        "Chrysuronia versicolor": { descritor: "Vieillot", ano: 1818 },
        "Leucochloris albicollis": { descritor: "Vieillot", ano: 1818 },
        "Chionomesa fimbriata": { descritor: "Gmelin", ano: 1788 },
        "Chionomesa lactea": { descritor: "Lesson", ano: 1832 },
        "Hylocharis chrysura": { descritor: "Shaw", ano: 1812 },
        "Aramus guarauna": { descritor: "Linnaeus", ano: 1766 },
        "Rallus longirostris": { descritor: "Boddaert", ano: 1783 },
        "Porphyrio martinica": { descritor: "Linnaeus", ano: 1766 },
        "Porphyrio flavirostris": { descritor: "Gmelin", ano: 1789 },
        "Laterallus flaviventer": { descritor: "Boddaert", ano: 1783 },
        "Laterallus melanophaius": { descritor: "Vieillot", ano: 1819 },
        "Laterallus exilis": { descritor: "Temminck", ano: 1831 },
        "Laterallus spilopterus": { descritor: "Durnford", ano: 1877 },
        "Laterallus leucopyrrhus": { descritor: "Vieillot", ano: 1819 },
        "Mustelirallus albicollis": { descritor: "Vieillot", ano: 1819 },
        "Neocrex erythrops": { descritor: "Sclater", ano: 1867 },
        "Pardirallus maculatus": { descritor: "Boddaert", ano: 1783 },
        "Pardirallus nigricans": { descritor: "Vieillot", ano: 1819 },
        "Pardirallus sanguinolentus": { descritor: "Swainson", ano: 1838 },
        "Amaurolimnas concolor": { descritor: "Gosse", ano: 1847 },
        "Aramides ypecaha": { descritor: "Vieillot", ano: 1819 },
        "Aramides cajaneus": { descritor: "Statius Muller", ano: 1776 },
        "Aramides saracura": { descritor: "Spix", ano: 1825 },
        "Porphyriops melanops": { descritor: "Vieillot", ano: 1819 },
        "Gallinula galeata": { descritor: "Lichtenstein", ano: 1818 },
        "Fulica rufifrons": { descritor: "Philippi & Landbeck", ano: 1861 },
        "Fulica armillata": { descritor: "Vieillot", ano: 1817 },
        "Fulica leucoptera": { descritor: "Vieillot", ano: 1817 },
        "Heliornis fulica": { descritor: "Boddaert", ano: 1783 },
        "Pluvialis dominica": { descritor: "Statius Muller", ano: 1776 },
        "Pluvialis squatarola": { descritor: "Linnaeus", ano: 1758 },
        "Oreopholus ruficollis": { descritor: "Wagler", ano: 1829 },
        "Vanellus chilensis": { descritor: "Molina", ano: 1782 },
        "Charadrius modestus": { descritor: "Lichtenstein", ano: 1823 },
        "Charadrius semipalmatus": { descritor: "Bonaparte", ano: 1825 },
        "Charadrius collaris": { descritor: "Vieillot", ano: 1818 },
        "Charadrius falklandicus": { descritor: "Latham", ano: 1790 },
        "Haematopus palliatus": { descritor: "Temminck", ano: 1820 },
        "Himantopus melanurus": { descritor: "Vieillot", ano: 1817 },
        "Chionis albus": { descritor: "Gmelin", ano: 1789 },
        "Bartramia longicauda": { descritor: "Bechstein", ano: 1812 },
        "Numenius hudsonicus": { descritor: "Latham", ano: 1790 },
        "Limosa haemastica": { descritor: "Linnaeus", ano: 1758 },
        "Arenaria interpres": { descritor: "Linnaeus", ano: 1758 },
        "Calidris canutus": { descritor: "Linnaeus", ano: 1766 },
        "Calidris himantopus": { descritor: "Bonaparte", ano: 1826 },
        "Calidris alba": { descritor: "Pallas", ano: 1764 },
        "Calidris bairdii": { descritor: "Coues", ano: 1861 },
        "Calidris minutilla": { descritor: "Vieillot", ano: 1819 },
        "Calidris fuscicollis": { descritor: "Vieillot", ano: 1819 },
        "Calidris subruficollis": { descritor: "Vieillot", ano: 1819 },
        "Calidris melanotos": { descritor: "Vieillot", ano: 1819 },
        "Calidris pusilla": { descritor: "Linnaeus", ano: 1766 },
        "Limnodromus griseus": { descritor: "Gmelin", ano: 1789 },
        "Gallinago undulata": { descritor: "Boddaert", ano: 1783 },
        "Gallinago paraguaiae": { descritor: "Vieillot", ano: 1816 },
        "Phalaropus tricolor": { descritor: "Vieillot", ano: 1819 },
        "Phalaropus fulicarius": { descritor: "Linnaeus", ano: 1758 },
        "Actitis macularius": { descritor: "Linnaeus", ano: 1766 },
        "Tringa solitaria": { descritor: "Wilson", ano: 1813 },
        "Tringa melanoleuca": { descritor: "Gmelin", ano: 1789 },
        "Tringa inornata": { descritor: "Vieillot", ano: 1816 },
        "Tringa semipalmata": { descritor: "Gmelin", ano: 1789 },
        "Tringa flavipes": { descritor: "Gmelin", ano: 1789 },
        "Thinocorus rumicivorus": { descritor: "Eschscholtz", ano: 1829 },
        "Jacana jacana": { descritor: "Linnaeus", ano: 1766 },
        "Nycticryphes semicollaris": { descritor: "Vieillot", ano: 1816 },
        "Stercorarius chilensis": { descritor: "Bonaparte", ano: 1857 },
        "Stercorarius maccormicki": { descritor: "Saunders", ano: 1893 },
        "Stercorarius antarcticus": { descritor: "Lesson", ano: 1831 },
        "Stercorarius pomarinus": { descritor: "Temminck", ano: 1815 },
        "Stercorarius parasiticus": { descritor: "Linnaeus", ano: 1758 },
        "Stercorarius longicaudus": { descritor: "Vieillot", ano: 1819 },
        "Chroicocephalus maculipennis": { descritor: "Lichtenstein", ano: 1823 },
        "Chroicocephalus cirrocephalus": { descritor: "Vieillot", ano: 1818 },
        "Leucophaeus modestus": { descritor: "Tschudi", ano: 1843 },
        "Leucophaeus atricilla": { descritor: "Linnaeus", ano: 1758 },
        "Leucophaeus pipixcan": { descritor: "Wagler", ano: 1831 },
        "Larus atlanticus": { descritor: "Olrog", ano: 1958 },
        "Larus dominicanus": { descritor: "Lichtenstein", ano: 1823 },
        "Anous stolidus": { descritor: "Linnaeus", ano: 1758 },
        "Rynchops niger": { descritor: "Linnaeus", ano: 1758 },
        "Sternula antillarum": { descritor: "Lesson", ano: 1847 },
        "Sternula superciliaris": { descritor: "Vieillot", ano: 1819 },
        "Phaetusa simplex": { descritor: "Gmelin", ano: 1789 },
        "Sterna hirundo": { descritor: "Linnaeus", ano: 1758 },
        "Sterna hirundinacea": { descritor: "Lesson", ano: 1831 },
        "Sterna trudeaui": { descritor: "Audubon", ano: 1838 },
        "Thalasseus acuflavidus": { descritor: "Cabot", ano: 1847 },
        "Thalasseus maximus": { descritor: "Boddaert", ano: 1783 },
        "Spheniscus magellanicus": { descritor: "Forster", ano: 1781 },
        "Diomedea exulans": { descritor: "Linnaeus", ano: 1758 },
        "Diomedea dabbenena": { descritor: "Mathews", ano: 1929 },
        "Thalassarche chlororhynchos": { descritor: "Gmelin", ano: 1789 },
        "Thalassarche melanophris": { descritor: "Temminck", ano: 1828 },
        "Thalassarche chrysostoma": { descritor: "Forster", ano: 1785 },
        "Oceanites oceanicus": { descritor: "Kuhl", ano: 1820 },
        "Macronectes giganteus": { descritor: "Gmelin", ano: 1789 },
        "Macronectes halli": { descritor: "Mathews", ano: 1912 },
        "Fulmarus glacialoides": { descritor: "Smith", ano: 1840 },
        "Daption capense": { descritor: "Linnaeus", ano: 1758 },
        "Pterodroma mollis": { descritor: "Gould", ano: 1844 },
        "Pterodroma incerta": { descritor: "Schlegel", ano: 1863 },
        "Procellaria aequinoctialis": { descritor: "Linnaeus", ano: 1758 },
        "Procellaria conspicillata": { descritor: "Gould", ano: 1844 },
        "Calonectris borealis": { descritor: "Cory", ano: 1881 },
        "Ardenna grisea": { descritor: "Gmelin", ano: 1789 },
        "Ardenna gravis": { descritor: "O'Reilly", ano: 1818 },
        "Puffinus puffinus": { descritor: "Brünnich", ano: 1764 },
        "Ciconia maguari": { descritor: "Gmelin", ano: 1789 },
        "Jabiru mycteria": { descritor: "Lichtenstein", ano: 1819 },
        "Mycteria americana": { descritor: "Linnaeus", ano: 1758 },
        "Fregata magnificens": { descritor: "Mathews", ano: 1914 },
        "Morus serrator": { descritor: "Gray", ano: 1843 },
        "Sula leucogaster": { descritor: "Boddaert", ano: 1783 },
        "Anhinga anhinga": { descritor: "Linnaeus", ano: 1766 },
        "Nannopterum brasilianum": { descritor: "Gmelin", ano: 1789 },
        "Tigrisoma lineatum": { descritor: "Boddaert", ano: 1783 },
        "Tigrisoma fasciatum": { descritor: "Such", ano: 1825 },
        "Cochlearius cochlearius": { descritor: "Linnaeus", ano: 1766 },
        "Botaurus pinnatus": { descritor: "Wagler", ano: 1829 },
        "Ixobrychus exilis": { descritor: "Gmelin", ano: 1789 },
        "Ixobrychus involucris": { descritor: "Vieillot", ano: 1823 },
        "Nycticorax nycticorax": { descritor: "Linnaeus", ano: 1758 },
        "Nyctanassa violacea": { descritor: "Linnaeus", ano: 1758 },
        "Butorides striata": { descritor: "Linnaeus", ano: 1758 },
        "Bubulcus ibis": { descritor: "Linnaeus", ano: 1758 },
        "Ardea cocoi": { descritor: "Linnaeus", ano: 1766 },
        "Ardea alba": { descritor: "Linnaeus", ano: 1758 },
        "Syrigma sibilatrix": { descritor: "Temminck", ano: 1824 },
        "Pilherodius pileatus": { descritor: "Boddaert", ano: 1783 },
        "Egretta thula": { descritor: "Molina", ano: 1782 },
        "Egretta caerulea": { descritor: "Linnaeus", ano: 1758 },
        "Eudocimus ruber": { descritor: "Linnaeus", ano: 1758 },
        "Plegadis chihi": { descritor: "Vieillot", ano: 1817 },
        "Mesembrinibis cayennensis": { descritor: "Gmelin", ano: 1789 },
        "Phimosus infuscatus": { descritor: "Lichtenstein", ano: 1823 },
        "Theristicus caerulescens": { descritor: "Vieillot", ano: 1817 },
        "Theristicus caudatus": { descritor: "Boddaert", ano: 1783 },
        "Platalea ajaja": { descritor: "Linnaeus", ano: 1758 },
        "Sarcoramphus papa": { descritor: "Linnaeus", ano: 1758 },
        "Coragyps atratus": { descritor: "Bechstein", ano: 1793 },
        "Cathartes aura": { descritor: "Linnaeus", ano: 1758 },
        "Cathartes burrovianus": { descritor: "Cassin", ano: 1845 },
        "Pandion haliaetus": { descritor: "Linnaeus", ano: 1758 },
        "Elanus leucurus": { descritor: "Vieillot", ano: 1818 },
        "Chondrohierax uncinatus": { descritor: "Temminck", ano: 1822 },
        "Leptodon cayanensis": { descritor: "Latham", ano: 1790 },
        "Elanoides forficatus": { descritor: "Linnaeus", ano: 1758 },
        "Spizaetus tyrannus": { descritor: "Wied", ano: 1820 },
        "Spizaetus melanoleucus": { descritor: "Vieillot", ano: 1816 },
        "Spizaetus ornatus": { descritor: "Daudin", ano: 1800 },
        "Rostrhamus sociabilis": { descritor: "Vieillot", ano: 1817 },
        "Harpagus diodon": { descritor: "Temminck", ano: 1823 },
        "Ictinia plumbea": { descritor: "Gmelin", ano: 1788 },
        "Circus cinereus": { descritor: "Vieillot", ano: 1816 },
        "Circus buffoni": { descritor: "Gmelin", ano: 1788 },
        "Hieraspiza superciliosa": { descritor: "Vieillot", ano: 1817 },
        "Accipiter poliogaster": { descritor: "Temminck", ano: 1824 },
        "Accipiter striatus": { descritor: "Vieillot", ano: 1808 },
        "Accipiter bicolor": { descritor: "Vieillot", ano: 1817 },
        "Geranospiza caerulescens": { descritor: "Vieillot", ano: 1817 },
        "Heterospizias meridionalis": { descritor: "Latham", ano: 1790 },
        "Amadonastur lacernulatus": { descritor: "Temminck", ano: 1827 },
        "Urubitinga urubitinga": { descritor: "Gmelin", ano: 1788 },
        "Urubitinga coronata": { descritor: "Vieillot", ano: 1817 },
        "Rupornis magnirostris": { descritor: "Gmelin", ano: 1788 },
        "Parabuteo unicinctus": { descritor: "Temminck", ano: 1824 },
        "Parabuteo leucorrhous": { descritor: "Quoy & Gaimard", ano: 1824 },
        "Geranoaetus albicaudatus": { descritor: "Vieillot", ano: 1816 },
        "Geranoaetus melanoleucus": { descritor: "Vieillot", ano: 1819 },
        "Pseudastur polionotus": { descritor: "Kaup", ano: 1847 },
        "Buteo platypterus": { descritor: "Vieillot", ano: 1823 },
        "Buteo brachyurus": { descritor: "Vieillot", ano: 1816 },
        "Buteo swainsoni": { descritor: "Bonaparte", ano: 1838 },
        "Buteo albonotatus": { descritor: "Kaup", ano: 1847 },
        "Tyto furcata": { descritor: "Temminck", ano: 1827 },
        "Megascops choliba": { descritor: "Vieillot", ano: 1817 },
        "Megascops sanctaecatarinae": { descritor: "Salvin", ano: 1897 },
        "Megascops atricapilla": { descritor: "Temminck", ano: 1822 },
        "Pulsatrix koeniswaldiana": { descritor: "Bertoni & Bertoni", ano: 1901 },
        "Bubo virginianus": { descritor: "Gmelin", ano: 1788 },
        "Strix hylophila": { descritor: "Temminck", ano: 1825 },
        "Strix virgata": { descritor: "Cassin", ano: 1849 },
        "Strix huhula": { descritor: "Daudin", ano: 1800 },
        "Glaucidium minutissimum": { descritor: "Wied", ano: 1830 },
        "Glaucidium brasilianum": { descritor: "Gmelin", ano: 1788 },
        "Athene cunicularia": { descritor: "Molina", ano: 1782 },
        "Aegolius harrisii": { descritor: "Cassin", ano: 1849 },
        "Asio clamator": { descritor: "Vieillot", ano: 1808 },
        "Asio stygius": { descritor: "Wagler", ano: 1832 },
        "Asio flammeus": { descritor: "Pontoppidan", ano: 1763 },
        "Trogon viridis": { descritor: "Linnaeus", ano: 1766 },
        "Trogon surrucura": { descritor: "Vieillot", ano: 1817 },
        "Trogon chrysochloros": { descritor: "Pelzeln", ano: 1856 },
        "Baryphthengus ruficapillus": { descritor: "Vieillot", ano: 1818 },
        "Megaceryle torquata": { descritor: "Linnaeus", ano: 1766 },
        "Chloroceryle amazona": { descritor: "Latham", ano: 1790 },
        "Chloroceryle aenea": { descritor: "Pallas", ano: 1764 },
        "Chloroceryle americana": { descritor: "Gmelin", ano: 1788 },
        "Chloroceryle inda": { descritor: "Linnaeus", ano: 1766 },
        "Nonnula rubecula": { descritor: "Spix", ano: 1824 },
        "Malacoptila striata": { descritor: "Spix", ano: 1824 },
        "Notharchus swainsoni": { descritor: "Gray", ano: 1846 },
        "Nystalus chacuru": { descritor: "Vieillot", ano: 1816 },
        "Ramphastos toco": { descritor: "Statius Muller", ano: 1776 },
        "Ramphastos vitellinus": { descritor: "Lichtenstein", ano: 1823 },
        "Ramphastos dicolorus": { descritor: "Linnaeus", ano: 1766 },
        "Selenidera maculirostris": { descritor: "Lichtenstein", ano: 1823 },
        "Pteroglossus bailloni": { descritor: "Vieillot", ano: 1819 },
        "Pteroglossus castanotis": { descritor: "Gould", ano: 1834 },
        "Picumnus temminckii": { descritor: "Lafresnaye", ano: 1845 },
        "Picumnus nebulosus": { descritor: "Sundevall", ano: 1866 },
        "Melanerpes candidus": { descritor: "Otto", ano: 1796 },
        "Melanerpes flavifrons": { descritor: "Vieillot", ano: 1818 },
        "Veniliornis spilogaster": { descritor: "Wagler", ano: 1827 },
        "Campephilus robustus": { descritor: "Lichtenstein", ano: 1818 },
        "Dryocopus lineatus": { descritor: "Linnaeus", ano: 1766 },
        "Celeus galeatus": { descritor: "Lichtenstein", ano: 1818 },
        "Celeus flavescens": { descritor: "Gmelin", ano: 1788 },
        "Piculus flavigula": { descritor: "Gmelin", ano: 1788 },
        "Piculus aurulentus": { descritor: "Temminck", ano: 1821 },
        "Colaptes melanochloros": { descritor: "Gmelin", ano: 1788 },
        "Colaptes campestris": { descritor: "Vieillot", ano: 1818 },
        "Cariama cristata": { descritor: "Linnaeus", ano: 1766 },
        "Herpetotheres cachinnans": { descritor: "Linnaeus", ano: 1758 },
        "Micrastur ruficollis": { descritor: "Vieillot", ano: 1817 },
        "Micrastur semitorquatus": { descritor: "Vieillot", ano: 1817 },
        "Caracara plancus": { descritor: "Miller", ano: 1777 },
        "Milvago chimachima": { descritor: "Vieillot", ano: 1816 },
        "Milvago chimango": { descritor: "Vieillot", ano: 1816 },
        "Falco sparverius": { descritor: "Linnaeus", ano: 1758 },
        "Falco rufigularis": { descritor: "Daudin", ano: 1800 },
        "Falco femoralis": { descritor: "Temminck", ano: 1822 },
        "Falco peregrinus": { descritor: "Tunstall", ano: 1771 },
        "Touit melanonotus": { descritor: "Wied", ano: 1820 },
        "Myiopsitta monachus": { descritor: "Boddaert", ano: 1783 },
        "Brotogeris tirica": { descritor: "Gmelin", ano: 1788 },
        "Brotogeris chiriri": { descritor: "Vieillot", ano: 1818 },
        "Pionopsitta pileata": { descritor: "Scopoli", ano: 1769 },
        "Triclaria malachitacea": { descritor: "Spix", ano: 1824 },
        "Pionus maximiliani": { descritor: "Kuhl", ano: 1820 },
        "Amazona vinacea": { descritor: "Kuhl", ano: 1820 },
        "Amazona pretrei": { descritor: "Temminck", ano: 1830 },
        "Amazona aestiva": { descritor: "Linnaeus", ano: 1758 },
        "Forpus xanthopterygius": { descritor: "Spix", ano: 1824 },
        "Pyrrhura frontalis": { descritor: "Vieillot", ano: 1817 },
        "Primolius maracana": { descritor: "Vieillot", ano: 1816 },
        "Psittacara leucophthalmus": { descritor: "Statius Muller", ano: 1776 },
        "Terenura maculata": { descritor: "Wied", ano: 1831 },
        "Myrmotherula unicolor": { descritor: "Menetrés", ano: 1835 },
        "Formicivora acutirostris": { descritor: "Wied", ano: 1831 },
        "Rhopias gularis": { descritor: "Spix", ano: 1825 },
        "Dysithamnus stictothorax": { descritor: "Sclater & Salvin", ano: 1880 },
        "Dysithamnus mentalis": { descritor: "Temminck", ano: 1823 },
        "Dysithamnus xanthopterus": { descritor: "Burmeister", ano: 1856 },
        "Herpsilochmus rufimarginatus": { descritor: "Temminck", ano: 1822 },
        "Thamnophilus doliatus": { descritor: "Linnaeus", ano: 1764 },
        "Thamnophilus ruficapillus": { descritor: "Vieillot", ano: 1816 },
        "Thamnophilus caerulescens": { descritor: "Vieillot", ano: 1816 },
        "Hypoedaleus guttatus": { descritor: "Vieillot", ano: 1816 },
        "Batara cinerea": { descritor: "Vieillot", ano: 1819 },
        "Mackenziaena leachii": { descritor: "Such", ano: 1825 },
        "Mackenziaena severa": { descritor: "Lichtenstein", ano: 1823 },
        "Biatas nigropectus": { descritor: "Lafresnaye & d'Orbigny", ano: 1837 },
        "Myrmoderus squamosus": { descritor: "Pelzeln", ano: 1868 },
        "Pyriglena leucoptera": { descritor: "Vieillot", ano: 1818 },
        "Drymophila ferruginea": { descritor: "Temminck", ano: 1822 },
        "Drymophila rubricollis": { descritor: "Bertoni", ano: 1901 },
        "Drymophila ochropyga": { descritor: "Hellmayr", ano: 1906 },
        "Drymophila malura": { descritor: "Temminck & Laugier", ano: 1830 },
        "Drymophila squamata": { descritor: "Lichtenstein", ano: 1823 },
        "Conopophaga melanops": { descritor: "Vieillot", ano: 1818 },
        "Conopophaga lineata": { descritor: "Wied", ano: 1831 },
        "Grallaria varia": { descritor: "Boddaert", ano: 1783 },
        "Cryptopezus nattereri": { descritor: "Hellmayr", ano: 1907 },
        "Psilorhamphus guttatus": { descritor: "Ménétries", ano: 1835 },
        "Merulaxis ater": { descritor: "Lesson", ano: 1830 },
        "Eleoscytalopus indigoticus": { descritor: "Wied", ano: 1831 },
        "Scytalopus iraiensis": { descritor: "Bornschein, Reinert & Pichorim", ano: 1998 },
        "Scytalopus pachecoi": { descritor: "Maurício", ano: 2005 },
        "Scytalopus speluncae": { descritor: "Ménétries", ano: 1835 },
        "Formicarius colma": { descritor: "Boddaert", ano: 1783 },
        "Chamaeza campanisona": { descritor: "Lichtenstein", ano: 1823 },
        "Chamaeza ruficauda": { descritor: "Cabanis & Heine", ano: 1859 },
        "Sclerurus scansor": { descritor: "Ménétries", ano: 1835 },
        "Geositta cunicularia": { descritor: "Vieillot", ano: 1816 },
        "Sittasomus griseicapillus": { descritor: "Vieillot", ano: 1818 },
        "Dendrocincla turdina": { descritor: "Lichtenstein", ano: 1820 },
        "Dendrocolaptes platyrostris": { descritor: "Spix", ano: 1825 },
        "Xiphocolaptes albicollis": { descritor: "Vieillot", ano: 1818 },
        "Xiphorhynchus fuscus": { descritor: "Vieillot", ano: 1818 },
        "Campylorhamphus falcularius": { descritor: "Vieillot", ano: 1822 },
        "Lepidocolaptes angustirostris": { descritor: "Vieillot", ano: 1818 },
        "Lepidocolaptes falcinellus": { descritor: "Cabanis & Heine", ano: 1859 },
        "Xenops minutus": { descritor: "Sparrman", ano: 1788 },
        "Xenops rutilans": { descritor: "Temminck", ano: 1821 },
        "Furnarius figulus": { descritor: "Lichtenstein", ano: 1823 },
        "Furnarius rufus": { descritor: "Gmelin", ano: 1788 },
        "Lochmias nematura": { descritor: "Lichtenstein", ano: 1823 },
        "Phleocryptes melanops": { descritor: "Vieillot", ano: 1817 },
        "Limnornis curvirostris": { descritor: "Gould", ano: 1839 },
        "Cinclodes pabsti": { descritor: "Sick", ano: 1969 },
        "Cinclodes fuscus": { descritor: "Vieillot", ano: 1818 },
        "Anabazenops fuscus": { descritor: "Vieillot", ano: 1816 },
        "Cichlocolaptes leucophrus": { descritor: "Jardine & Selby", ano: 1830 },
        "Heliobletus contaminatus": { descritor: "Berlepsch", ano: 1885 },
        "Philydor atricapillus": { descritor: "Wied", ano: 1821 },
        "Anabacerthia amaurotis": { descritor: "Temminck", ano: 1823 },
        "Anabacerthia lichtensteini": { descritor: "Cabanis & Heine", ano: 1859 },
        "Syndactyla rufosuperciliata": { descritor: "Lafresnaye", ano: 1832 },
        "Dendroma rufa": { descritor: "Lesson", ano: 1830 },
        "Clibanornis dendrocolaptoides": { descritor: "Pelzeln", ano: 1859 },
        "Automolus leucophthalmus": { descritor: "Wied", ano: 1821 },
        "Leptasthenura striolata": { descritor: "Pelzeln", ano: 1856 },
        "Leptasthenura setaria": { descritor: "Temminck", ano: 1824 },
        "Phacellodomus striaticollis": { descritor: "Orbigny & Lafresnaye", ano: 1838 },
        "Phacellodomus ferrugineigula": { descritor: "Pelzeln", ano: 1858 },
        "Anumbius annumbi": { descritor: "Vieillot", ano: 1817 },
        "Limnoctites rectirostris": { descritor: "Gould", ano: 1839 },
        "Cranioleuca obsoleta": { descritor: "Reichenbach", ano: 1853 },
        "Cranioleuca pallida": { descritor: "Wied", ano: 1831 },
        "Spartonoica maluroides": { descritor: "d'Orbigny & Lafresnaye", ano: 1837 },
        "Certhiaxis cinnamomeus": { descritor: "Gmelin", ano: 1788 },
        "Schoeniophylax phryganophilus": { descritor: "Vieillot", ano: 1817 },
        "Synallaxis cinerascens": { descritor: "Temminck", ano: 1823 },
        "Synallaxis ruficapilla": { descritor: "Vieillot", ano: 1819 },
        "Synallaxis spixi": { descritor: "Sclater", ano: 1856 },
        "Synallaxis albescens": { descritor: "Temminck", ano: 1823 },
        "Synallaxis frontalis": { descritor: "Pelzeln", ano: 1859 },
        "Ilicura militaris": { descritor: "Shaw & Nodder", ano: 1809 },
        "Chiroxiphia caudata": { descritor: "Shaw & Nodder", ano: 1793 },
        "Manacus manacus": { descritor: "Linnaeus", ano: 1766 },
        "Carpornis cucullata": { descritor: "Swainson", ano: 1821 },
        "Phibalura flavirostris": { descritor: "Vieillot", ano: 1816 },
        "Pyroderus scutatus": { descritor: "Shaw", ano: 1792 },
        "Lipaugus lanioides": { descritor: "Lesson", ano: 1844 },
        "Procnias nudicollis": { descritor: "Vieillot", ano: 1817 },
        "Schiffornis virescens": { descritor: "Lafresnaye", ano: 1838 },
        "Tityra inquisitor": { descritor: "Lichtenstein", ano: 1823 },
        "Tityra cayana": { descritor: "Linnaeus", ano: 1766 },
        "Tityra semifasciata": { descritor: "Spix", ano: 1825 },
        "Pachyramphus viridis": { descritor: "Vieillot", ano: 1816 },
        "Pachyramphus castaneus": { descritor: "Jardine & Selby", ano: 1827 },
        "Pachyramphus polychopterus": { descritor: "Vieillot", ano: 1818 },
        "Pachyramphus marginatus": { descritor: "Lichtenstein", ano: 1823 },
        "Pachyramphus validus": { descritor: "Lichtenstein", ano: 1823 },
        "Oxyruncus cristatus": { descritor: "Swainson", ano: 1821 },
        "Onychorhynchus swainsoni": { descritor: "Pelzeln", ano: 1868 },
        "Myiobius barbatus": { descritor: "Gmelin", ano: 1789 },
        "Myiobius atricaudus": { descritor: "Lawrence", ano: 1863 },
        "Piprites chloris": { descritor: "Temminck", ano: 1822 },
        "Piprites pileata": { descritor: "Temminck", ano: 1822 },
        "Platyrinchus mystaceus": { descritor: "Vieillot", ano: 1818 },
        "Platyrinchus leucoryphus": { descritor: "Wied", ano: 1831 },
        "Tachuris rubrigastra": { descritor: "Vieillot", ano: 1817 },
        "Mionectes rufiventris": { descritor: "Cabanis", ano: 1846 },
        "Leptopogon amaurocephalus": { descritor: "Tschudi", ano: 1846 },
        "Corythopis delalandi": { descritor: "Lesson", ano: 1830 },
        "Phylloscartes eximius": { descritor: "Temminck", ano: 1822 },
        "Phylloscartes ventralis": { descritor: "Temminck & Laugier", ano: 1828 },
        "Phylloscartes kronei": { descritor: "Willis & Schuchmann", ano: 1993 },
        "Phylloscartes oustaleti": { descritor: "Sclater", ano: 1887 },
        "Phylloscartes difficilis": { descritor: "Ihering & Ihering", ano: 1907 },
        "Phylloscartes sylviolus": { descritor: "Cabanis & Heine", ano: 1859 },
        "Tolmomyias sulphurescens": { descritor: "Spix", ano: 1825 },
        "Todirostrum poliocephalum": { descritor: "Wied", ano: 1831 },
        "Todirostrum cinereum": { descritor: "Linnaeus", ano: 1766 },
        "Poecilotriccus plumbeiceps": { descritor: "Lafresnaye", ano: 1846 },
        "Myiornis auricularis": { descritor: "Vieillot", ano: 1818 },
        "Hemitriccus diops": { descritor: "Temminck", ano: 1822 },
        "Hemitriccus obsoletus": { descritor: "Miranda-Ribeiro", ano: 1906 },
        "Hemitriccus orbitatus": { descritor: "Wied", ano: 1831 },
        "Hemitriccus nidipendulus": { descritor: "Wied", ano: 1831 },
        "Hemitriccus kaempferi": { descritor: "Zimmer", ano: 1953 },
        "Hirundinea ferruginea": { descritor: "Gmelin", ano: 1788 },
        "Euscarthmus meloryphus": { descritor: "Wied", ano: 1831 },
        "Tyranniscus burmeisteri": { descritor: "Cabanis & Heine", ano: 1859 },
        "Camptostoma obsoletum": { descritor: "Temminck", ano: 1824 },
        "Elaenia flavogaster": { descritor: "Thunberg", ano: 1822 },
        "Elaenia spectabilis": { descritor: "Pelzeln", ano: 1868 },
        "Elaenia chilensis": { descritor: "Hellmayr", ano: 1927 },
        "Elaenia parvirostris": { descritor: "Pelzeln", ano: 1868 },
        "Elaenia mesoleuca": { descritor: "Deppe", ano: 1830 },
        "Elaenia obscura": { descritor: "d'Orbigny & Lafresnaye", ano: 1837 },
        "Myiopagis caniceps": { descritor: "Swainson", ano: 1835 },
        "Myiopagis viridicata": { descritor: "Vieillot", ano: 1817 },
        "Capsiempis flaveola": { descritor: "Lichtenstein", ano: 1823 },
        "Phyllomyias virescens": { descritor: "Temminck", ano: 1824 },
        "Phyllomyias fasciatus": { descritor: "Thunberg", ano: 1822 },
        "Phyllomyias griseocapilla": { descritor: "Sclater", ano: 1862 },
        "Culicivora caudacuta": { descritor: "Vieillot", ano: 1818 },
        "Polystictus pectoralis": { descritor: "Vieillot", ano: 1817 },
        "Pseudocolopteryx sclateri": { descritor: "Oustalet", ano: 1892 },
        "Pseudocolopteryx acutipennis": { descritor: "Sclater & Salvin", ano: 1873 },
        "Pseudocolopteryx flaviventris": { descritor: "d'Orbigny & Lafresnaye", ano: 1837 },
        "Serpophaga nigricans": { descritor: "Vieillot", ano: 1817 },
        "Serpophaga subcristata": { descritor: "Vieillot", ano: 1817 },
        "Serpophaga griseicapilla": { descritor: "Straneck", ano: 2007 },
        "Attila phoenicurus": { descritor: "Pelzeln", ano: 1868 },
        "Attila rufus": { descritor: "Vieillot", ano: 1819 },
        "Legatus leucophaius": { descritor: "Vieillot", ano: 1818 },
        "Ramphotrigon megacephalum": { descritor: "Swainson", ano: 1835 },
        "Myiarchus swainsoni": { descritor: "Cabanis & Heine", ano: 1859 },
        "Myiarchus ferox": { descritor: "Gmelin", ano: 1789 },
        "Sirystes sibilator": { descritor: "Vieillot", ano: 1818 },
        "Pitangus sulphuratus": { descritor: "Linnaeus", ano: 1766 },
        "Machetornis rixosa": { descritor: "Vieillot", ano: 1819 },
        "Myiodynastes maculatus": { descritor: "Statius Muller", ano: 1776 },
        "Megarynchus pitangua": { descritor: "Linnaeus", ano: 1766 },
        "Myiozetetes similis": { descritor: "Spix", ano: 1825 },
        "Tyrannus albogularis": { descritor: "Burmeister", ano: 1856 },
        "Tyrannus melancholicus": { descritor: "Vieillot", ano: 1819 },
        "Tyrannus savana": { descritor: "Vieillot", ano: 1808 },
        "Tyrannus tyrannus": { descritor: "Linnaeus", ano: 1758 },
        "Griseotyrannus aurantioatrocristatus": { descritor: "d'Orbigny & Lafresnaye", ano: 1837 },
        "Empidonomus varius": { descritor: "Vieillot", ano: 1818 },
        "Conopias trivirgatus": { descritor: "Wied", ano: 1831 },
        "Colonia colonus": { descritor: "Vieillot", ano: 1818 },
        "Arundinicola leucocephala": { descritor: "Linnaeus", ano: 1764 },
        "Fluvicola albiventer": { descritor: "Spix", ano: 1825 },
        "Fluvicola nengeta": { descritor: "Linnaeus", ano: 1766 },
        "Pyrocephalus rubinus": { descritor: "Boddaert", ano: 1783 },
        "Muscipipra vetula": { descritor: "Lichtenstein", ano: 1823 },
        "Gubernetes yetapa": { descritor: "Vieillot", ano: 1818 },
        "Heteroxolmis dominicanus": { descritor: "Vieillot", ano: 1823 },
        "Myiophobus fasciatus": { descritor: "Statius Muller", ano: 1776 },
        "Cnemotriccus fuscatus": { descritor: "Wied", ano: 1831 },
        "Lathrotriccus euleri": { descritor: "Cabanis", ano: 1868 },
        "Contopus cinereus": { descritor: "Spix", ano: 1825 },
        "Satrapa icterophrys": { descritor: "Vieillot", ano: 1818 },
        "Lessonia rufa": { descritor: "Gmelin", ano: 1789 },
        "Hymenops perspicillatus": { descritor: "Gmelin", ano: 1789 },
        "Knipolegus lophotes": { descritor: "Boie", ano: 1828 },
        "Knipolegus nigerrimus": { descritor: "Vieillot", ano: 1818 },
        "Knipolegus cyanirostris": { descritor: "Vieillot", ano: 1818 },
        "Xolmis irupero": { descritor: "Vieillot", ano: 1823 },
        "Xolmis velatus": { descritor: "Lichtenstein", ano: 1823 },
        "Nengetus cinereus": { descritor: "Vieillot", ano: 1816 },
        "Cyclarhis gujanensis": { descritor: "Gmelin", ano: 1789 },
        "Hylophilus poicilotis": { descritor: "Temminck", ano: 1822 },
        "Vireo chivi": { descritor: "Vieillot", ano: 1817 },
        "Cyanocorax caeruleus": { descritor: "Vieillot", ano: 1818 },
        "Cyanocorax cristatellus": { descritor: "Temminck", ano: 1823 },
        "Cyanocorax chrysops": { descritor: "Vieillot", ano: 1818 },
        "Pygochelidon cyanoleuca": { descritor: "Vieillot", ano: 1817 },
        "Alopochelidon fucata": { descritor: "Temminck", ano: 1822 },
        "Stelgidopteryx ruficollis": { descritor: "Vieillot", ano: 1817 },
        "Progne tapera": { descritor: "Vieillot", ano: 1817 },
        "Progne subis": { descritor: "Linnaeus", ano: 1758 },
        "Progne chalybea": { descritor: "Gmelin", ano: 1789 },
        "Progne elegans": { descritor: "Baird", ano: 1865 },
        "Tachycineta albiventer": { descritor: "Boddaert", ano: 1783 },
        "Tachycineta leucorrhoa": { descritor: "Vieillot", ano: 1817 },
        "Tachycineta leucopyga": { descritor: "Meyen", ano: 1834 },
        "Riparia riparia": { descritor: "Linnaeus", ano: 1758 },
        "Hirundo rustica": { descritor: "Linnaeus", ano: 1758 },
        "Petrochelidon pyrrhonota": { descritor: "Vieillot", ano: 1817 },
        "Troglodytes musculus": { descritor: "Naumann", ano: 1823 },
        "Cistothorus platensis": { descritor: "Latham", ano: 1790 },
        "Campylorhynchus turdinus": { descritor: "Wied", ano: 1821 },
        "Cantorchilus longirostris": { descritor: "Vieillot", ano: 1819 },
        "Ramphocaenus melanurus": { descritor: "Vieillot", ano: 1819 },
        "Polioptila dumicola": { descritor: "Vieillot", ano: 1817 },
        "Polioptila lactea": { descritor: "Sharpe", ano: 1885 },
        "Catharus fuscescens": { descritor: "Stephens", ano: 1817 },
        "Catharus swainsoni": { descritor: "Tschudi", ano: 1845 },
        "Turdus flavipes": { descritor: "Vieillot", ano: 1818 },
        "Turdus leucomelas": { descritor: "Vieillot", ano: 1818 },
        "Turdus rufiventris": { descritor: "Vieillot", ano: 1818 },
        "Turdus amaurochalinus": { descritor: "Cabanis", ano: 1850 },
        "Turdus subalaris": { descritor: "Seebohm", ano: 1887 },
        "Turdus albicollis": { descritor: "Vieillot", ano: 1818 },
        "Mimus saturninus": { descritor: "Lichtenstein", ano: 1823 },
        "Mimus triurus": { descritor: "Vieillot", ano: 1818 },
        "Sturnus vulgaris": { descritor: "Linnaeus", ano: 1758 },
        "Estrilda astrild": { descritor: "Linnaeus", ano: 1758 },
        "Passer domesticus": { descritor: "Linnaeus", ano: 1758 },
        "Anthus chii": { descritor: "Vieillot", ano: 1818 },
        "Anthus correndera": { descritor: "Vieillot", ano: 1818 },
        "Anthus nattereri": { descritor: "Sclater", ano: 1878 },
        "Anthus hellmayri": { descritor: "Hartert", ano: 1909 },
        "Spinus magellanicus": { descritor: "Vieillot", ano: 1805 },
        "Cyanophonia cyanocephala": { descritor: "Wied", ano: 1820 },
        "Chlorophonia cyanea": { descritor: "Thunberg", ano: 1822 },
        "Euphonia chlorotica": { descritor: "Linnaeus", ano: 1766 },
        "Euphonia chalybea": { descritor: "Mikan", ano: 1825 },
        "Euphonia violacea": { descritor: "Linnaeus", ano: 1758 },
        "Euphonia pectoralis": { descritor: "Latham", ano: 1801 },
        "Ammodramus humeralis": { descritor: "Bosc", ano: 1792 },
        "Arremon semitorquatus": { descritor: "Swainson", ano: 1838 },
        "Zonotrichia capensis": { descritor: "Statius Muller", ano: 1776 },
        "Leistes superciliaris": { descritor: "Bonaparte", ano: 1850 },
        "Cacicus chrysopterus": { descritor: "Vigors", ano: 1825 },
        "Cacicus haemorrhous": { descritor: "Linnaeus", ano: 1766 },
        "Icterus pyrrhopterus": { descritor: "Vieillot", ano: 1819 },
        "Icterus galbula": { descritor: "Linnaeus", ano: 1758 },
        "Molothrus rufoaxillaris": { descritor: "Cassin", ano: 1866 },
        "Molothrus oryzivorus": { descritor: "Gmelin", ano: 1788 },
        "Molothrus bonariensis": { descritor: "Gmelin", ano: 1789 },
        "Amblyramphus holosericeus": { descritor: "Scopoli", ano: 1786 },
        "Gnorimopsar chopi": { descritor: "Vieillot", ano: 1819 },
        "Agelaioides badius": { descritor: "Vieillot", ano: 1819 },
        "Agelasticus thilius": { descritor: "Molina", ano: 1782 },
        "Chrysomus ruficapillus": { descritor: "Vieillot", ano: 1819 },
        "Xanthopsar flavus": { descritor: "Gmelin", ano: 1788 },
        "Pseudoleistes guirahuro": { descritor: "Vieillot", ano: 1819 },
        "Pseudoleistes virescens": { descritor: "Vieillot", ano: 1819 },
        "Geothlypis aequinoctialis": { descritor: "Gmelin", ano: 1789 },
        "Setophaga cerulea": { descritor: "Wilson", ano: 1810 },
        "Setophaga pitiayumi": { descritor: "Vieillot", ano: 1817 },
        "Setophaga striata": { descritor: "Forster", ano: 1772 },
        "Myiothlypis leucoblephara": { descritor: "Vieillot", ano: 1817 },
        "Myiothlypis rivularis": { descritor: "Wied", ano: 1821 },
        "Basileuterus culicivorus": { descritor: "Deppe", ano: 1830 },
        "Orthogonys chloricterus": { descritor: "Vieillot", ano: 1819 },
        "Piranga flava": { descritor: "Vieillot", ano: 1822 },
        "Habia rubica": { descritor: "Vieillot", ano: 1817 },
        "Amaurospiza moesta": { descritor: "Hartlaub", ano: 1853 },
        "Cyanoloxia glaucocaerulea": { descritor: "d'Orbigny & Lafresnaye", ano: 1837 },
        "Cyanoloxia brissonii": { descritor: "Lichtenstein", ano: 1823 },
        "Orchesticus abeillei": { descritor: "Lesson", ano: 1839 },
        "Nemosia pileata": { descritor: "Boddaert", ano: 1783 },
        "Embernagra platensis": { descritor: "Gmelin", ano: 1789 },
        "Emberizoides herbicola": { descritor: "Vieillot", ano: 1817 },
        "Emberizoides ypiranganus": { descritor: "Ihering & Ihering", ano: 1907 },
        "Rhopospina fruticeti": { descritor: "Kittlitz", ano: 1833 },
        "Chlorophanes spiza": { descritor: "Linnaeus", ano: 1758 },
        "Hemithraupis guira": { descritor: "Linnaeus", ano: 1766 },
        "Hemithraupis ruficapilla": { descritor: "Vieillot", ano: 1818 },
        "Tersina viridis": { descritor: "Illiger", ano: 1811 },
        "Cyanerpes cyaneus": { descritor: "Linnaeus", ano: 1766 },
        "Dacnis nigripes": { descritor: "Pelzeln", ano: 1856 },
        "Dacnis cayana": { descritor: "Linnaeus", ano: 1766 },
        "Saltator similis": { descritor: "d'Orbigny & Lafresnaye", ano: 1837 },
        "Saltator maxillosus": { descritor: "Cabanis", ano: 1851 },
        "Saltator fuliginosus": { descritor: "Daudin", ano: 1800 },
        "Coereba flaveola": { descritor: "Linnaeus", ano: 1758 },
        "Asemospiza fuliginosa": { descritor: "Lichtenstein", ano: 1823 },
        "Volatinia jacarina": { descritor: "Linnaeus", ano: 1766 },
        "Trichothraupis melanops": { descritor: "Vieillot", ano: 1818 },
        "Loriotus cristatus": { descritor: "Gmelin", ano: 1789 },
        "Tachyphonus coronatus": { descritor: "Vieillot", ano: 1822 },
        "Ramphocelus bresilia": { descritor: "Linnaeus", ano: 1766 },
        "Ramphocelus carbo": { descritor: "Pallas", ano: 1764 },
        "Sporophila lineola": { descritor: "Linnaeus", ano: 1758 },
        "Sporophila frontalis": { descritor: "Verreaux", ano: 1869 },
        "Sporophila falcirostris": { descritor: "Temminck", ano: 1820 },
        "Sporophila beltoni": { descritor: "Repenning & Fontana", ano: 2013 },
        "Sporophila collaris": { descritor: "Boddaert", ano: 1783 },
        "Sporophila caerulescens": { descritor: "Vieillot", ano: 1817 },
        "Sporophila leucoptera": { descritor: "Vieillot", ano: 1817 },
        "Sporophila pileata": { descritor: "Sclater", ano: 1864 },
        "Sporophila hypoxantha": { descritor: "Cabanis", ano: 1851 },
        "Sporophila ruficollis": { descritor: "Cabanis", ano: 1851 },
        "Sporophila palustris": { descritor: "Barrows", ano: 1883 },
        "Sporophila cinnamomea": { descritor: "Lafresnaye", ano: 1839 },
        "Sporophila melanogaster": { descritor: "Pelzeln", ano: 1870 },
        "Sporophila angolensis": { descritor: "Linnaeus", ano: 1766 },
        "Poospiza nigrorufa": { descritor: "d'Orbigny & Lafresnaye", ano: 1837 },
        "Thlypopsis sordida": { descritor: "d'Orbigny & Lafresnaye", ano: 1837 },
        "Thlypopsis pyrrhocoma": { descritor: "Cabanis", ano: 1851 },
        "Castanozoster thoracicus": { descritor: "Nordmann", ano: 1835 },
        "Donacospiza albifrons": { descritor: "Vieillot", ano: 1817 },
        "Microspingus cabanisi": { descritor: "Hellmayr", ano: 1922 },
        "Conirostrum speciosum": { descritor: "Temminck", ano: 1824 },
        "Conirostrum bicolor": { descritor: "Vieillot", ano: 1809 },
        "Sicalis citrina": { descritor: "Pelzeln & Sclater", ano: 1879 },
        "Sicalis flaveola": { descritor: "Linnaeus", ano: 1766 },
        "Sicalis luteola": { descritor: "Sparrman", ano: 1789 },
        "Haplospiza unicolor": { descritor: "Cabanis", ano: 1851 },
        "Pipraeidea melanonota": { descritor: "Vieillot", ano: 1819 },
        "Rauenia bonariensis": { descritor: "Gmelin", ano: 1789 },
        "Stephanophorus diadematus": { descritor: "Temminck", ano: 1823 },
        "Cissopis leverianus": { descritor: "Gmelin", ano: 1788 },
        "Schistochlamys ruficapillus": { descritor: "Vieillot", ano: 1817 },
        "Paroaria coronata": { descritor: "Miller", ano: 1776 },
        "Thraupis sayaca": { descritor: "Linnaeus", ano: 1766 },
        "Thraupis cyanoptera": { descritor: "Vieillot", ano: 1817 },
        "Thraupis palmarum": { descritor: "Wied", ano: 1823 },
        "Thraupis ornata": { descritor: "Sparrman", ano: 1789 },
        "Stilpnia peruviana": { descritor: "Desmarest", ano: 1806 },
        "Stilpnia preciosa": { descritor: "Cabanis", ano: 1851 },
        "Tangara seledon": { descritor: "Statius Muller", ano: 1776 },
        "Tangara cyanocephala": { descritor: "Statius Muller", ano: 1776 },
        "Tangara desmaresti": { descritor: "Vieillot", ano: 1819 },
    };


    let _descSort = { col: 'especie', asc: true };
    let _descViewMode = 'all'; // 'all' | 'imported'

    function setDescView(mode) {
        _descViewMode = mode;
        const btnImp = document.getElementById('desc-view-imported');
        const btnAll = document.getElementById('desc-view-all');
        if (mode === 'imported') {
            if (btnImp) { btnImp.style.background = 'var(--green-base)'; btnImp.style.color = 'white'; }
            if (btnAll) { btnAll.style.background = 'white'; btnAll.style.color = 'var(--green-base)'; }
        } else {
            if (btnAll) { btnAll.style.background = 'var(--green-base)'; btnAll.style.color = 'white'; }
            if (btnImp) { btnImp.style.background = 'white'; btnImp.style.color = 'var(--green-base)'; }
        }
        buildDescTable();
    }
    window.setDescView = setDescView;

    function getDescImportedSet() {
        const s = new Set();
        document.querySelectorAll('#table-body tr').forEach(tr => {
            const spCell = tr.querySelector('td.species-col');
            if (spCell) {
                const inp = spCell.querySelector('input');
                const val = inp ? inp.value.trim() : spCell.textContent.trim();
                if (val) s.add(val);
            }
        });
        return s;
    }

    function buildDescTable() {
        const search   = (document.getElementById('desc-search')?.value || '').toLowerCase();
        const fCentury = document.getElementById('desc-filter-century')?.value || '';
        const fAuthor  = document.getElementById('desc-filter-author')?.value || '';
        const importedSet = getDescImportedSet();

        let rows = Object.entries(DESCRIPTOR_DB).map(([especie, info]) => {
            const cons = conservationData.find(c => c.especie === especie);
            const taxo = speciesInfo[especie] || {};
            return {
                especie,
                nomePopular: cons ? cons.nomePopular : '-',
                descritor: info.descritor,
                ano: info.ano,
                ordem: taxo.ordem || '-',
                familia: taxo.familia || '-',
                inTable: importedSet.has(especie)
            };
        });

        if (_descViewMode === 'imported') rows = rows.filter(r => r.inTable);

        if (fCentury) {
            rows = rows.filter(r => {
                if (fCentury === '18') return r.ano >= 1700 && r.ano <= 1799;
                if (fCentury === '19') return r.ano >= 1800 && r.ano <= 1899;
                if (fCentury === '20') return r.ano >= 1900 && r.ano <= 1999;
                if (fCentury === '21') return r.ano >= 2000;
                return true;
            });
        }
        if (fAuthor) rows = rows.filter(r => r.descritor === fAuthor);
        if (search) rows = rows.filter(r =>
            r.especie.toLowerCase().includes(search) ||
            r.nomePopular.toLowerCase().includes(search) ||
            r.descritor.toLowerCase().includes(search) ||
            String(r.ano).includes(search) ||
            r.ordem.toLowerCase().includes(search) ||
            r.familia.toLowerCase().includes(search)
        );

        if (_descSort.col) {
            rows.sort((a, b) => {
                const va = _descSort.col === 'ano' ? a.ano : (a[_descSort.col] || '');
                const vb = _descSort.col === 'ano' ? b.ano : (b[_descSort.col] || '');
                if (_descSort.col === 'ano') return _descSort.asc ? va - vb : vb - va;
                return _descSort.asc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
            });
        }

        const tbody = document.getElementById('desc-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        rows.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><em>${r.especie}</em></td>
                <td>${r.nomePopular}</td>
                <td style="font-weight:500; color:var(--green-deep);">${r.descritor}</td>
                <td style="text-align:center; font-family:'DM Mono',monospace; font-size:13px;">${r.ano}</td>
                <td style="font-size:13px;">${r.ordem}</td>
                <td style="font-size:13px;">${r.familia}</td>
                <td style="text-align:center;">${r.inTable ? '<span class="in-table-yes">✓</span>' : '<span class="in-table-no">—</span>'}</td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('desc-count').textContent = `${rows.length} espécies exibidas`;
        buildDescStats(rows);
    }

    function buildDescStats(rows) {
        const container = document.getElementById('desc-stats-row');
        if (!container) return;

        const total     = rows.length;
        const imported  = rows.filter(r => r.inTable).length;
        const linnaeus  = rows.filter(r => r.descritor === 'Linnaeus').length;
        const vieillot  = rows.filter(r => r.descritor === 'Vieillot').length;
        const centuries = {};
        rows.forEach(r => {
            const c = Math.floor(r.ano / 100) * 100;
            centuries[c] = (centuries[c] || 0) + 1;
        });
        const topCentury = Object.entries(centuries).sort((a,b) => b[1]-a[1])[0];

        const stats = [
            { label: 'Total exibidas',   value: total,   color: 'var(--green-base)' },
            { label: 'Na tabela',        value: imported, color: 'var(--amber)' },
            { label: 'Descritas por Linnaeus', value: linnaeus, color: '#2060c0' },
            { label: 'Descritas por Vieillot', value: vieillot, color: '#8b2fc9' },
            { label: `Século ${topCentury ? topCentury[0] : '?'}s (mais comum)`, value: topCentury ? topCentury[1] : 0, color: '#1a6b56' },
        ];

        container.innerHTML = stats.map(s => `
            <div style="background:white; border:1px solid var(--border-light); border-radius:var(--radius-md); padding:12px 18px; min-width:160px; box-shadow:var(--shadow-card); display:flex; flex-direction:column; gap:4px;">
                <span style="font-size:22px; font-weight:700; color:${s.color};">${s.value}</span>
                <span style="font-size:12px; color:var(--text-muted);">${s.label}</span>
            </div>
        `).join('');
    }

    function initDescTab() {
        // Populate author filter
        const authors = [...new Set(Object.values(DESCRIPTOR_DB).map(v => v.descritor))].sort();
        const sa = document.getElementById('desc-filter-author');
        if (sa) authors.forEach(a => {
            const o = document.createElement('option'); o.value = a; o.textContent = a; sa.appendChild(o);
        });

        // Search & filters
        document.getElementById('desc-search')?.addEventListener('input', buildDescTable);
        document.getElementById('desc-filter-century')?.addEventListener('change', buildDescTable);
        document.getElementById('desc-filter-author')?.addEventListener('change', buildDescTable);

        // Sort
        document.querySelectorAll('#desc-table th[data-sort-desc]').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.sortDesc;
                if (_descSort.col === col) _descSort.asc = !_descSort.asc;
                else { _descSort.col = col; _descSort.asc = true; }
                document.querySelectorAll('#desc-table .sort-arrow-desc').forEach(s => s.textContent = '↕');
                th.querySelector('.sort-arrow-desc').textContent = _descSort.asc ? '↑' : '↓';
                buildDescTable();
            });
        });

        // Export CSV
        document.getElementById('desc-export-csv')?.addEventListener('click', () => {
            const rows = [...document.querySelectorAll('#desc-table-body tr')];
            const csv = ['Espécie,Nome Popular,Descritor,Ano,Ordem,Família,Na Tabela'];
            rows.forEach(tr => {
                const cells = [...tr.querySelectorAll('td')].map(td => '"' + td.textContent.trim().replace(/"/g,'""') + '"');
                csv.push(cells.join(','));
            });
            const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'descritores_SC.csv'; a.click();
        });

        // Copy
        document.getElementById('desc-copy')?.addEventListener('click', () => {
            const rows = [...document.querySelectorAll('#desc-table-body tr')];
            const text = ['Espécie\tNome Popular\tDescritor\tAno\tOrdem\tFamília\tNa Tabela'];
            rows.forEach(tr => {
                text.push([...tr.querySelectorAll('td')].map(td => td.textContent.trim()).join('\t'));
            });
            navigator.clipboard.writeText(text.join('\n')).then(() => {
                const btn = document.getElementById('desc-copy');
                const orig = btn.textContent;
                btn.textContent = '✅ Copiado!';
                setTimeout(() => btn.textContent = orig, 2000);
            });
        });

        buildDescTable();
        // Inicia na view correta: importadas se houver, senão todas
        const _descImpSet = new Set();
        document.querySelectorAll('#table-body tr').forEach(tr => {
            const spCell = tr.querySelector('td.species-col');
            if (spCell) { const inp = spCell.querySelector('input'); const val = inp ? inp.value.trim() : spCell.textContent.trim(); if (val) _descImpSet.add(val); }
        });
        if (_descImpSet.size > 0) { setDescView('imported'); } else { setDescView('all'); }
    }

    // Hook into tab switching
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.tab === 'descriptor-section' && !window._descTabInitialized) {
                    window._descTabInitialized = true;
                    initDescTab();
                } else if (btn.dataset.tab === 'descriptor-section') {
                    buildDescTable();
                }
            });
        });
    });
    // ==================== FIM DESCRITORES ====================

// ==================== ESTIMADORES DE RIQUEZA ====================
let chaoChart, jack1Chart, jack2Chart, bootstrapChart, combinedChart;

// ==================== ESTIMADORES DE RIQUEZA A PARTIR DA CURVA ====================
function generateAndRenderEstimators(increments, totalSpecies) {
    // increments: array com o número de novas espécies em cada evento
    // totalSpecies: número total de espécies (acumulado final)
    const nEvents = increments.length;
    
    // Simular uma matriz de incidência aleatória que respeite os incrementos
    // Vamos gerar uma lista de espécies (IDs de 0 a totalSpecies-1) e distribuir pelos eventos
    const speciesPerEvent = []; // lista de conjuntos de espécies por evento
    let nextSpeciesId = 0;
    for (let i = 0; i < nEvents; i++) {
        const newSpecies = [];
        for (let j = 0; j < increments[i]; j++) {
            if (nextSpeciesId < totalSpecies) {
                newSpecies.push(nextSpeciesId);
                nextSpeciesId++;
            }
        }
        speciesPerEvent.push(newSpecies);
    }
    
    // Se ainda faltarem espécies (por arredondamento), adiciona no último evento
    if (nextSpeciesId < totalSpecies) {
        const remaining = totalSpecies - nextSpeciesId;
        for (let r = 0; r < remaining; r++) {
            speciesPerEvent[nEvents-1].push(nextSpeciesId + r);
        }
    }

    // Construir matriz de incidência: espécies × eventos (presença/ausência)
    const incidence = Array.from({ length: totalSpecies }, () => Array(nEvents).fill(0));
    speciesPerEvent.forEach((speciesList, eventIdx) => {
        speciesList.forEach(spId => {
            incidence[spId][eventIdx] = 1;
        });
    });

    // Calcular estimadores para cada número de eventos k
    const results = computeEstimatorsFromIncidence(incidence);
    
    // Renderizar gráficos
    renderEstimatorCharts(results, nEvents);
}

function computeEstimatorsFromIncidence(incidence) {
    const nSpecies = incidence.length;
    const nSamples = incidence[0].length;

    // Matriz transposta: amostras × espécies
    const samples = Array.from({ length: nSamples }, (_, i) => incidence.map(row => row[i]));

    let obs = [], chao = [], jack1 = [], jack2 = [], boot = [];

    for (let k = 1; k <= nSamples; k++) {
        const subSamples = samples.slice(0, k);
        
        // Espécies observadas nas primeiras k amostras
        const speciesObs = subSamples.reduce((acc, sample) => {
            sample.forEach((pres, sp) => { if (pres === 1) acc[sp] = 1; });
            return acc;
        }, Array(nSpecies).fill(0));
        const sObs = speciesObs.reduce((sum, v) => sum + v, 0);
        obs.push(sObs);

        // Frequências das espécies nas k amostras
        const freq = Array(nSpecies).fill(0);
        subSamples.forEach(sample => {
            sample.forEach((pres, sp) => { if (pres === 1) freq[sp]++; });
        });

        let q1 = 0, q2 = 0;
        freq.forEach(f => {
            if (f === 1) q1++;
            else if (f === 2) q2++;
        });

        // Chao2 (fórmula bias-corrected: Chao 1984)
        // Chao2_bc = Sobs + (k-1)/k * Q1*(Q1-1) / (2*(Q2+1))
        // Esta fórmula evita extrapolação extrema quando Q2 é muito pequeno
        let chaoVal = sObs;
        if (k > 1 && q1 > 0) {
            chaoVal = sObs + ((k - 1) / k) * (q1 * (q1 - 1)) / (2 * (q2 + 1));
        }
        chao.push(chaoVal);

        // Jackknife 1ª ordem
        let jack1Val = sObs + q1 * (k - 1) / k;
        jack1.push(jack1Val);

        // Jackknife 2ª ordem
        let jack2Val = sObs;
        if (k >= 2) {
            jack2Val = sObs + (q1 * (2*k - 3) / k) - (q2 * (k - 2)*(k - 2) / (k*(k - 1)));
        }
        jack2.push(jack2Val);

        // Bootstrap
        let bootVal = sObs;
        freq.forEach(f => {
            const p = f / k;
            if (p > 0 && p < 1) {
                bootVal += (1 - p) - (1 - p) ** k;
            }
        });
        boot.push(bootVal);
    }

    return { obs, chao, jack1, jack2, boot };
}

function average(arr) {
    return arr.reduce((a,b) => a + b, 0) / arr.length;
}

function computeEstimators(incidence) {
    const nSpecies = incidence.length;
    const nSamples = incidence[0].length;

    // Matriz transposta: amostras × espécies
    const samples = Array.from({ length: nSamples }, (_, i) => incidence.map(row => row[i]));

    // Inicializa acumuladores para cada número de amostras k
    let obs = [];          // espécies observadas acumuladas nas primeiras k amostras
    let chao = [];         // Chao2
    let jack1 = [];        // Jackknife 1ª ordem
    let jack2 = [];        // Jackknife 2ª ordem
    let boot = [];         // Bootstrap (riqueza esperada)

    // Para cada k de 1 a nSamples
    for (let k = 1; k <= nSamples; k++) {
        const subSamples = samples.slice(0, k);
        // Espécies observadas nas k amostras
        const speciesObs = subSamples.reduce((acc, sample) => {
            sample.forEach((pres, sp) => { if (pres === 1) acc[sp] = 1; });
            return acc;
        }, Array(nSpecies).fill(0));
        const sObs = speciesObs.reduce((sum, v) => sum + v, 0);
        obs.push(sObs);

        // Contagem de frequências por espécie nas k amostras
        const freq = Array(nSpecies).fill(0);
        subSamples.forEach(sample => {
            sample.forEach((pres, sp) => { if (pres === 1) freq[sp]++; });
        });

        // Número de espécies que ocorrem em exatamente 1 amostra (únicas) e em exatamente 2 amostras (duplicadas)
        let q1 = 0, q2 = 0;
        freq.forEach(f => {
            if (f === 1) q1++;
            else if (f === 2) q2++;
        });

        // Chao2 (fórmula bias-corrected: Chao 1984)
        // Chao2_bc = Sobs + (k-1)/k * Q1*(Q1-1) / (2*(Q2+1))
        let chaoVal = sObs;
        if (k > 1 && q1 > 0) {
            chaoVal = sObs + ((k - 1) / k) * (q1 * (q1 - 1)) / (2 * (q2 + 1));
        }
        chao.push(chaoVal);

        // Jackknife 1ª ordem
        let jack1Val = sObs + q1 * (k - 1) / k;
        jack1.push(jack1Val);

        // Jackknife 2ª ordem (se k >= 2)
        let jack2Val = sObs;
        if (k >= 2) {
            jack2Val = sObs + (q1 * (2*k - 3) / k) - (q2 * (k - 2)*(k - 2) / (k*(k - 1)));
        }
        jack2.push(jack2Val);

        // Bootstrap (riqueza esperada em k amostras)
        // p_j = proporção de amostras em que a espécie j ocorre nas k amostras
        let bootVal = sObs;
        freq.forEach(f => {
            const p = f / k;
            if (p > 0 && p < 1) {
                bootVal += (1 - p) - (1 - p) ** k;
            }
        });
        boot.push(bootVal);
    }

    return { obs, chao, jack1, jack2, boot };
}

function renderEstimatorCharts(results, nSamples) {
    const labels = Array.from({ length: nSamples }, (_, i) => `Amostra ${i+1}`);

    // Destroi gráficos antigos se existirem
    if (chaoChart) chaoChart.destroy();
    if (jack1Chart) jack1Chart.destroy();
    if (jack2Chart) jack2Chart.destroy();
    if (bootstrapChart) bootstrapChart.destroy();
    if (combinedChart) combinedChart.destroy();

    // Função auxiliar para criar gráfico individual
    function createChart(canvasId, label, data, color) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data.map(v => parseFloat(v.toFixed(2))),
                    borderColor: color,
                    backgroundColor: color + '22',
                    tension: 0.2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: true,
                        formatter: v => Number(v).toFixed(2),
                        font: { size: 9, weight: '600' },
                        color: color,
                        backgroundColor: 'rgba(255,255,255,0.82)',
                        borderRadius: 3,
                        padding: { top: 2, bottom: 2, left: 3, right: 3 },
                        anchor: 'end',
                        align: 'top',
                        offset: 2,
                        clamp: true
                    },
                    tooltip: { callbacks: { label: item => `${label}: ${Number(item.raw).toFixed(2)}` } }
                },
                layout: { padding: { top: 24 } },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Riqueza estimada' }, ticks: { callback: v => Number(v).toFixed(2) } }
                }
            }
        });
    }

    chaoChart = createChart('chaoChart', 'Chao2', results.chao, '#27ae60');
    jack1Chart = createChart('jack1Chart', 'Jackknife 1ª ordem', results.jack1, '#e67e22');
    jack2Chart = createChart('jack2Chart', 'Jackknife 2ª ordem', results.jack2, '#3498db');
    bootstrapChart = createChart('bootstrapChart', 'Bootstrap', results.boot, '#9b59b6');

    // Gráfico combinado
    const ctxCombined = document.getElementById('combinedEstimatorChart').getContext('2d');
    combinedChart = new Chart(ctxCombined, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Observado', data: results.obs.map(v=>parseFloat(v.toFixed(2))), borderColor: '#2c3e50', backgroundColor: 'transparent', tension: 0.2, pointRadius: 3 },
                { label: 'Chao2', data: results.chao.map(v=>parseFloat(v.toFixed(2))), borderColor: '#27ae60', backgroundColor: 'transparent', tension: 0.2, pointRadius: 3 },
                { label: 'Jackknife 1', data: results.jack1.map(v=>parseFloat(v.toFixed(2))), borderColor: '#e67e22', backgroundColor: 'transparent', tension: 0.2, pointRadius: 3 },
                { label: 'Jackknife 2', data: results.jack2.map(v=>parseFloat(v.toFixed(2))), borderColor: '#3498db', backgroundColor: 'transparent', tension: 0.2, pointRadius: 3 },
                { label: 'Bootstrap', data: results.boot.map(v=>parseFloat(v.toFixed(2))), borderColor: '#9b59b6', backgroundColor: 'transparent', tension: 0.2, pointRadius: 3 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
                tooltip: { callbacks: { label: item => `${item.dataset.label}: ${Number(item.raw).toFixed(2)}` } }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Riqueza' }, ticks: { callback: v => Number(v).toFixed(2) } }
            }
        }
    });

    // Análise automática dos estimadores
    const sObs = results.obs[results.obs.length-1];
    const chaoFinal = results.chao[results.chao.length-1];
    const jack1Final = results.jack1[results.jack1.length-1];
    const jack2Final = results.jack2[results.jack2.length-1];
    const bootFinal = results.boot[results.boot.length-1];
    const meanEst = (chaoFinal+jack1Final+jack2Final+bootFinal)/4;
    const completeness = sObs > 0 ? (sObs/meanEst*100).toFixed(1) : '0.0';
    const estimatorTable = document.getElementById('estimator-charts');
    if (estimatorTable) {
        const analysisDiv = document.getElementById('estimator-analysis') || document.createElement('div');
        analysisDiv.id = 'estimator-analysis';
        analysisDiv.style.cssText = 'margin-top:24px;';
        analysisDiv.innerHTML = `
        <div style="background:var(--green-mist);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px 20px;">
            <strong style="color:var(--green-deep);font-size:14px;">📊 Resumo dos Estimadores (última amostra)</strong>
            <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:13px;">
                <thead><tr style="background:rgba(42,125,82,0.12);">
                    <th style="padding:8px;text-align:left;border-bottom:1px solid var(--border);">Estimador</th>
                    <th style="padding:8px;text-align:center;border-bottom:1px solid var(--border);">Riqueza estimada</th>
                    <th style="padding:8px;text-align:center;border-bottom:1px solid var(--border);">Spp. não detectadas*</th>
                </tr></thead>
                <tbody>
                    <tr><td style="padding:7px 8px;border-bottom:1px solid var(--border-light);">Observado (Sobs)</td><td style="padding:7px 8px;text-align:center;font-weight:700;">${sObs.toFixed(2)}</td><td style="padding:7px 8px;text-align:center;">—</td></tr>
                    <tr><td style="padding:7px 8px;border-bottom:1px solid var(--border-light);">Chao2</td><td style="padding:7px 8px;text-align:center;color:#27ae60;font-weight:700;">${chaoFinal.toFixed(2)}</td><td style="padding:7px 8px;text-align:center;">${Math.max(0,chaoFinal-sObs).toFixed(2)}</td></tr>
                    <tr><td style="padding:7px 8px;border-bottom:1px solid var(--border-light);">Jackknife 1ª ordem</td><td style="padding:7px 8px;text-align:center;color:#e67e22;font-weight:700;">${jack1Final.toFixed(2)}</td><td style="padding:7px 8px;text-align:center;">${Math.max(0,jack1Final-sObs).toFixed(2)}</td></tr>
                    <tr><td style="padding:7px 8px;border-bottom:1px solid var(--border-light);">Jackknife 2ª ordem</td><td style="padding:7px 8px;text-align:center;color:#3498db;font-weight:700;">${jack2Final.toFixed(2)}</td><td style="padding:7px 8px;text-align:center;">${Math.max(0,jack2Final-sObs).toFixed(2)}</td></tr>
                    <tr><td style="padding:7px 8px;">Bootstrap</td><td style="padding:7px 8px;text-align:center;color:#9b59b6;font-weight:700;">${bootFinal.toFixed(2)}</td><td style="padding:7px 8px;text-align:center;">${Math.max(0,bootFinal-sObs).toFixed(2)}</td></tr>
                </tbody>
            </table>
            <p style="font-size:11px;color:var(--text-muted);margin-top:6px;">* Diferença entre estimado e observado.</p>
            <div style="margin-top:12px;font-size:13px;line-height:1.8;color:var(--text-mid);">
                <strong>🔬 Análise:</strong>
                Completude amostral estimada (Sobs/média estimadores): <strong>${completeness}%</strong>.<br>
                ${parseFloat(completeness) >= 85 ? '✅ Alta completude — o esforço amostral parece suficiente para detectar a maior parte das espécies.' :
                  parseFloat(completeness) >= 60 ? '🔶 Completude moderada — há espécies não detectadas; aumentar o número de amostras é recomendado.' :
                  '⚠️ Baixa completude — grande parte das espécies estimadas ainda não foi detectada. Esforço amostral insuficiente.'}<br>
                O estimador Chao2 é baseado em singletons/doubletons e tende a ser conservador; Jackknife 2 é geralmente mais preciso com muitas amostras; Bootstrap tende a subestimar levemente.
            </div>
        </div>`;
        if (!document.getElementById('estimator-analysis')) estimatorTable.appendChild(analysisDiv);
    }
}



/* ============================================================
   AVISTAMENTOS
   ============================================================ */
// ==================== AVISTAMENTOS ====================
// Armazenamento global em memória da sessão
window.AVISTAMENTOS = []; // [{id, date, time, inputName, scientificName, commonName}]
let _avistaIdCounter = 0;

function setAvistaMode(mode) { /* mantido por compatibilidade */ }
window.setAvistaMode = setAvistaMode;

function setAvistaSubTab(tab) { /* removido — picos agora é aba própria */ }
window.setAvistaSubTab = setAvistaSubTab;

const _UNCERTAIN_RE = /\b(sp\.|sp\b|cf\.|cf\b|aff\.|aff\b|nr\.\b|\?)/i;

function parseAvistaSimple(raw) {
    // mantido por compatibilidade: trata como linha sem data
    return parseAvistaDatetime(raw);
}

function parseAvistaDate(raw) {
    return parseAvistaDatetime(raw);
}

function parseAvistaDatetime(raw) {
    const entries = [];
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    // Aceita: DD/MM/AAAA HH:MM nome  ou  DD/MM/AAAA nome  ou  só nome
    const dateTimeRe = /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(\d{2}:\d{2})\s+(.+)$/;
    const dateOnlyRe = /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+)$/;

    function makeEntry(namePart, datePart, timePart) {
        const isUncert = _UNCERTAIN_RE.test(namePart);
        const result = (!isUncert && typeof findBirdFuzzy === 'function') ? findBirdFuzzy(namePart) : null;
        const confident = result ? result.confident : false;
        return {
            id: ++_avistaIdCounter,
            date: datePart ? normalizeDate(datePart) : '',
            time: timePart || '',
            inputName: namePart,
            scientificName: (result && confident) ? result.bird.scientificName : namePart,
            commonName:     (result && confident) ? result.bird.commonName     : '',
            suggestedSci:    (!isUncert && result) ? result.bird.scientificName : null,
            suggestedCommon: (!isUncert && result) ? result.bird.commonName     : null,
            confident,
            isUncertain: isUncert
        };
    }

    lines.forEach(line => {
        let m = line.match(dateTimeRe);
        if (m) { entries.push(makeEntry(m[3].trim(), m[1].trim(), m[2].trim())); return; }
        m = line.match(dateOnlyRe);
        if (m) { entries.push(makeEntry(m[2].trim(), m[1].trim(), '')); return; }
        entries.push(makeEntry(line, null, null));
    });
    return entries;
}

function normalizeDate(s) {
    // DD/MM/AAAA or DD-MM-AAAA → AAAA-MM-DD
    const parts = s.split(/[\/\-]/);
    if (parts.length === 3) {
        if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
        if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
    }
    return s;
}

function displayDateBR(iso) {
    if (!iso) return '—';
    const p = iso.split('-');
    if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    return iso;
}

function buildAvistaTable() {
    const search = (document.getElementById('avist-search')?.value || '').toLowerCase();
    const filterDate = document.getElementById('avist-filter-date')?.value || '';
    let rows = AVISTAMENTOS;
    if (filterDate) rows = rows.filter(r => r.date === filterDate);
    if (search) rows = rows.filter(r =>
        r.inputName.toLowerCase().includes(search) ||
        r.scientificName.toLowerCase().includes(search) ||
        r.commonName.toLowerCase().includes(search) ||
        displayDateBR(r.date).includes(search)
    );

    const tbody = document.getElementById('avist-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    rows.forEach((r, idx) => {
        const isRecognized = r.scientificName !== r.inputName;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align:center; color:var(--text-muted); font-size:12px;">${idx + 1}</td>
            <td style="font-family:'DM Mono',monospace; font-size:13px; white-space:nowrap;">${displayDateBR(r.date)}</td>
            <td style="font-family:'DM Mono',monospace; font-size:13px; white-space:nowrap;">${r.time || '—'}</td>
            <td style="font-size:13px;">${r.inputName}</td>
            <td style="font-size:13px;"><em style="color:${isRecognized ? 'var(--green-deep)' : 'var(--text-muted)'};">${r.scientificName}</em></td>
            <td style="font-size:13px; color:var(--text-muted);">${r.commonName || '—'}</td>
            <td style="text-align:center;"><button onclick="removeAvistamento(${r.id})" style="background:#c0392b; color:white; border:none; border-radius:4px; padding:3px 9px; font-size:12px; cursor:pointer;">✕</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('avist-count').textContent = `${rows.length} de ${AVISTAMENTOS.length} avistamentos exibidos`;
    buildAvistaStats();
    updateAvistaDateFilter();
}

function isUncertainRecord(r) {
    const n = (r.inputName || r.scientificName || '').trim();
    return /\bsp\.\b|\bcf\.\b|\?/.test(n);
}

function buildAvistaStats() {
    const container = document.getElementById('avist-stats-row');
    if (!container) return;
    const total = AVISTAMENTOS.length;
    const uniqueSp = new Set(AVISTAMENTOS.filter(r => !isUncertainRecord(r)).map(r => r.scientificName)).size;
    const withDate = AVISTAMENTOS.filter(r => r.date).length;
    const uniqueDates = new Set(AVISTAMENTOS.map(r => r.date).filter(Boolean)).size;
    const withHour = AVISTAMENTOS.filter(r => r.time).length;
    const stats = [
        { label: 'Total de avistamentos', value: total, color: 'var(--green-base)' },
        { label: 'Espécies únicas', value: uniqueSp, color: 'var(--amber)' },
        { label: 'Com data', value: withDate, color: '#2060c0' },
        { label: 'Com hora', value: withHour, color: '#8b2fc9' },
        { label: 'Dias de campo', value: uniqueDates, color: '#c0392b' },
    ];
    container.innerHTML = stats.map(s => `
        <div style="background:white;border:1px solid var(--border-light);border-radius:var(--radius-md);padding:12px 18px;min-width:140px;flex:1;text-align:center;box-shadow:var(--shadow-card);">
            <div style="font-size:24px;font-weight:700;color:${s.color};">${s.value}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${s.label}</div>
        </div>`).join('');
}

function updateAvistaDateFilter() {
    const sel = document.getElementById('avist-filter-date');
    if (!sel) return;
    const current = sel.value;
    const dates = [...new Set(AVISTAMENTOS.map(r => r.date).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">Todas as datas</option>';
    dates.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = displayDateBR(d);
        if (d === current) opt.selected = true;
        sel.appendChild(opt);
    });
}

let _picosChart = null;
function buildPicosHorarios() {
    const withTime = AVISTAMENTOS.filter(r => r.time);
    const el = document.getElementById('picos-stats');
    if (!withTime.length) {
        const ctx = document.getElementById('picosHorariosChart');
        if (ctx) ctx.getContext('2d').clearRect(0,0,ctx.width,ctx.height);
        if (el) el.innerHTML = '<em style="color:var(--text-muted);">Nenhum avistamento com hora registrado. Use o formato DD/MM/AAAA HH:MM nome.</em>';
        return;
    }
    // Contagem por hora (0-23)
    const counts = Array(24).fill(0);
    withTime.forEach(r => {
        const h = parseInt(r.time.split(':')[0]);
        if (!isNaN(h) && h >= 0 && h < 24) counts[h]++;
    });
    const labels = Array.from({length:24}, (_,i) => `${String(i).padStart(2,'0')}:00`);
    const ctx = document.getElementById('picosHorariosChart');
    if (!ctx) return;
    if (_picosChart) _picosChart.destroy();
    // Colors: highlight top 3 hours
    const sorted = [...counts].sort((a,b)=>b-a);
    const top3 = sorted[2];
    const colors = counts.map(v => v >= top3 && v > 0 ? 'rgba(42,125,82,0.85)' : 'rgba(42,125,82,0.4)');
    _picosChart = new Chart(ctx, {
        type:'bar',
        data:{ labels, datasets:[{ label:'Avistamentos', data:counts, backgroundColor:colors, borderColor:'#1d6140', borderWidth:1, borderRadius:3 }] },
        options:{
            responsive:true, maintainAspectRatio:false,
            plugins:{
                legend:{display:false},
                datalabels:{
                    display: ctx => ctx.dataset.data[ctx.dataIndex] > 0,
                    color:'#ffffff',
                    font:{ size:11, weight:'700' },
                    anchor:'center', align:'center',
                    formatter: v => v
                },
                tooltip:{ callbacks:{ label: item => `${item.raw} avistamento(s)` } }
            },
            scales:{
                x:{ title:{display:true,text:'Hora do dia'} },
                y:{ beginAtZero:true, title:{display:true,text:'Nº de avistamentos'}, ticks:{stepSize:1} }
            }
        }
    });
    // Análise
    const peak = counts.indexOf(Math.max(...counts));
    const horasAtivas = counts.filter(v=>v>0).length;
    const manha = counts.slice(5,12).reduce((s,v)=>s+v,0);
    const tarde = counts.slice(12,18).reduce((s,v)=>s+v,0);
    const noite = counts.slice(18,24).reduce((s,v)=>s+v,0) + counts.slice(0,5).reduce((s,v)=>s+v,0);
    const dominant = manha >= tarde && manha >= noite ? 'manhã (05h–11h)' : tarde >= noite ? 'tarde (12h–17h)' : 'noturno/crepuscular';
    if (el) el.innerHTML = `<div style="background:var(--green-mist);border-left:4px solid var(--green-base);border-radius:0 var(--radius-sm) var(--radius-sm) 0;padding:12px 16px;line-height:1.8;">
        <strong>🕐 Análise de Picos de Horários</strong><br>
        Pico máximo: <strong>${labels[peak]}</strong> com <strong>${counts[peak]}</strong> avistamento(s) · 
        Horas ativas: <strong>${horasAtivas}h</strong> de 24 · 
        Período dominante: <strong>${dominant}</strong><br>
        Manhã: <strong>${manha}</strong> reg. · Tarde: <strong>${tarde}</strong> reg. · Noturno/crepuscular: <strong>${noite}</strong> reg.<br>
        <span style="font-size:12px;color:var(--text-muted);">Barras em verde escuro = top 3 horários mais ativos. Total com hora: ${withTime.length} de ${AVISTAMENTOS.length} registros.</span>
    </div>`;
}

function removeAvistamento(id) {
    const idx = AVISTAMENTOS.findIndex(r => r.id === id);
    if (idx >= 0) AVISTAMENTOS.splice(idx, 1);
    buildAvistaTable();
}
window.removeAvistamento = removeAvistamento;

// Função global: retorna avistamentos para as abas de análise
window.getAvistamentos = function() { return AVISTAMENTOS; };

// Exportar CSV
function exportAvistaCSV() {
    const header = 'Data,Hora,Nome inserido,Espécie reconhecida,Nome popular';
    const rows = AVISTAMENTOS.map(r => `"${displayDateBR(r.date)}","${r.time||''}","${r.inputName}","${r.scientificName}","${r.commonName}"`);
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'avistamentos.csv'; a.click();
}

document.addEventListener('DOMContentLoaded', () => {
    // Botão adicionar (modo unificado)
    // ── Core function: process entries, show banner + correction modal ──
    function processAvistaEntries(entries, clearedField) {
        if (!entries.length) { alert('Nenhum dado válido inserido.'); return; }
        const unrecognized = entries.filter(e => !e.confident);
        const confirmed    = entries.filter(e => e.confident);
        AVISTAMENTOS.push(...entries);
        buildAvistaTable();
        if (clearedField) clearedField.value = '';
        const banner = document.getElementById('avist-post-add-banner');
        if (banner) banner.style.display = 'flex';
        if (unrecognized.length > 0) {
            showAvistaCorrecaoModal(unrecognized);
        }
    }

    document.getElementById('avist-date-add')?.addEventListener('click', () => {
        const raw = document.getElementById('avist-date-input').value.trim();
        if (!raw) { alert('Nenhum dado inserido.'); return; }
        processAvistaEntries(parseAvistaDatetime(raw), document.getElementById('avist-date-input'));
    });

    // Post-add banner: send to Importação
    // ── Popup de confirmação de espécies ──────────────────────────
    function openConfirmSpeciesModal(species, onConfirm) {
        const modal   = document.getElementById('confirm-species-modal');
        const listEl  = document.getElementById('confirm-species-list');
        const subtitle= document.getElementById('confirm-species-subtitle');
        if (!modal || !listEl) return;

        // Cria array mutável de espécies
        let items = species.map(s => ({ name: s }));

        function renderList() {
            subtitle.textContent = `${items.length} espécie${items.length !== 1 ? 's' : ''} para importar — edite ou remova antes de confirmar`;
            listEl.innerHTML = '';
            if (items.length === 0) {
                listEl.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:24px;font-size:14px;">Nenhuma espécie na lista.</p>';
                return;
            }
            items.forEach((item, idx) => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:var(--radius-sm);border:1px solid var(--border-light);margin-bottom:6px;background:var(--green-mist);transition:background .15s;';

                // Número
                const num = document.createElement('span');
                num.style.cssText = 'font-size:12px;color:var(--text-muted);width:22px;text-align:right;flex-shrink:0;';
                num.textContent = idx + 1;

                // Coluna central: nome científico (input) + nome popular abaixo
                const nameWrap = document.createElement('div');
                nameWrap.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:2px;min-width:0;';

                // Input de edição (nome científico)
                const inp = document.createElement('input');
                inp.type = 'text';
                inp.value = item.name;
                inp.style.cssText = 'width:100%;padding:5px 8px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:"DM Sans",sans-serif;font-size:13.5px;font-style:italic;background:var(--surface);color:var(--text-dark);';

                // Busca nome popular no BIRD_DATABASE
                function getPopularName(sciName) {
                    if (typeof BIRD_DATABASE === 'undefined') return '';
                    const entry = BIRD_DATABASE.find(b => b.scientificName && b.scientificName.trim().toLowerCase() === sciName.trim().toLowerCase());
                    return entry ? (entry.commonName || '') : '';
                }

                // Span nome popular
                const popularSpan = document.createElement('span');
                popularSpan.style.cssText = 'font-size:12px;color:var(--green-mid);padding-left:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;';
                function updatePopular(sciName) {
                    const pop = getPopularName(sciName);
                    popularSpan.textContent = pop ? '🐦 ' + pop : '';
                    popularSpan.style.display = pop ? '' : 'none';
                }
                updatePopular(item.name);

                inp.addEventListener('input', () => {
                    items[idx].name = inp.value.trim();
                    updatePopular(inp.value.trim());
                });

                nameWrap.appendChild(inp);
                nameWrap.appendChild(popularSpan);

                // Botão lápis (foca no input)
                const editBtn = document.createElement('button');
                editBtn.title = 'Editar';
                editBtn.innerHTML = '✏️';
                editBtn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:15px;padding:2px 4px;flex-shrink:0;opacity:.75;transition:opacity .15s;';
                editBtn.addEventListener('click', () => { inp.focus(); inp.select(); });
                editBtn.addEventListener('mouseover', () => editBtn.style.opacity = '1');
                editBtn.addEventListener('mouseout',  () => editBtn.style.opacity = '.75');

                // Botão X (remove)
                const delBtn = document.createElement('button');
                delBtn.title = 'Remover';
                delBtn.innerHTML = '✕';
                delBtn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:14px;color:#c0392b;padding:2px 5px;flex-shrink:0;opacity:.7;transition:opacity .15s;font-weight:700;';
                delBtn.addEventListener('click', () => { items.splice(idx, 1); renderList(); });
                delBtn.addEventListener('mouseover', () => delBtn.style.opacity = '1');
                delBtn.addEventListener('mouseout',  () => delBtn.style.opacity = '.7');

                row.appendChild(num);
                row.appendChild(nameWrap);
                row.appendChild(editBtn);
                row.appendChild(delBtn);
                listEl.appendChild(row);
            });
        }

        renderList();
        modal.style.display = 'flex';

        // Confirmar
        const okBtn = document.getElementById('confirm-species-ok');
        const cancelBtn = document.getElementById('confirm-species-cancel');
        const closeModal = () => { modal.style.display = 'none'; okBtn.replaceWith(okBtn.cloneNode(true)); cancelBtn.replaceWith(cancelBtn.cloneNode(true)); };

        document.getElementById('confirm-species-ok').addEventListener('click', () => {
            const valid = items.map(i => i.name).filter(s => s.trim());
            if (!valid.length) { alert('A lista está vazia.'); return; }
            closeModal();
            onConfirm(valid);
        });
        document.getElementById('confirm-species-cancel').addEventListener('click', closeModal);
        modal.addEventListener('click', e => { if (e.target === modal) closeModal(); }, { once: true });
    }

    function sendSpeciesToImportAndProcess(species) {
        const ta = document.getElementById('import-data');
        if (ta) ta.value = species.join('\n');
        // Muda para aba de importação
        document.querySelector('.tab-btn[data-tab="import-section"]')?.click();
        // Processa com animação do papagaio
        setTimeout(() => {
            if (typeof window.showParrot === 'function') {
                window.showParrot(() => {
                    if (typeof processImportedData === 'function') processImportedData();
                }, 'Transferindo espécies…');
            } else if (typeof processImportedData === 'function') {
                processImportedData();
            }
        }, 120);
    }

    document.getElementById('avist-send-now-btn')?.addEventListener('click', () => {
        const unique = [...new Set(AVISTAMENTOS.map(r => r.scientificName).filter(s => s))];
        if (!unique.length) { alert('Nenhuma espécie reconhecida.'); return; }
        openConfirmSpeciesModal(unique, (confirmed) => {
            sendSpeciesToImportAndProcess(confirmed);
            document.getElementById('avist-post-add-banner').style.display = 'none';
        });
    });

    // Limpar campos
    document.getElementById('avist-date-clear-input')?.addEventListener('click', () => { document.getElementById('avist-date-input').value = ''; });

    // Limpar todos
    document.getElementById('avist-clear-all')?.addEventListener('click', () => {
        if (!confirm('Limpar todos os avistamentos?')) return;
        AVISTAMENTOS.length = 0;
        document.getElementById('avist-post-add-banner').style.display = 'none';
        buildAvistaTable();
    });

    document.getElementById('avist-export-csv')?.addEventListener('click', exportAvistaCSV);

    document.getElementById('avist-send-to-import')?.addEventListener('click', () => {
        const unique = [...new Set(AVISTAMENTOS.map(r => r.scientificName).filter(s => s))];
        if (!unique.length) { alert('Nenhum avistamento registrado.'); return; }
        openConfirmSpeciesModal(unique, (confirmed) => {
            sendSpeciesToImportAndProcess(confirmed);
        });
    });

    document.getElementById('avist-search')?.addEventListener('input', buildAvistaTable);
    document.getElementById('avist-filter-date')?.addEventListener('change', buildAvistaTable);
    buildAvistaTable();
});

// ==================== CÁLCULO DE AVISTAMENTOS ====================
let _calcBarChart = null, _calcPieChart = null, _calcDateChart = null;
const CHART_PALETTE = ['#2a7d52','#e67e22','#3498db','#9b59b6','#e74c3c','#1abc9c','#f39c12','#2ecc71','#d35400','#1a5276','#6c3483','#117a65','#b7950b','#1f618d','#cb4335','#148f77','#a04000','#2874a6','#7d6608','#0e6655'];

function buildCalculoTab() {
    const av = window.AVISTAMENTOS || [];
    const filterDate = document.getElementById('calculo-filter-date')?.value || '';
    const search = (document.getElementById('calculo-search')?.value || '').toLowerCase();

    // Atualiza o select de datas
    const selDate = document.getElementById('calculo-filter-date');
    if (selDate) {
        const currentVal = selDate.value;
        const dates = [...new Set(av.map(r => r.date).filter(Boolean))].sort();
        selDate.innerHTML = '<option value="">Todas as datas</option>';
        dates.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d; opt.textContent = displayDateBR(d);
            if (d === currentVal) opt.selected = true;
            selDate.appendChild(opt);
        });
    }

    // Filtrar
    let rows = av;
    if (filterDate) rows = rows.filter(r => r.date === filterDate);
    if (search) rows = rows.filter(r =>
        r.scientificName.toLowerCase().includes(search) ||
        r.commonName.toLowerCase().includes(search) ||
        r.inputName.toLowerCase().includes(search)
    );

    const total = rows.length;

    // Agrupar por espécie
    const freq = {};
    rows.forEach(r => {
        const key = r.scientificName;
        if (!freq[key]) freq[key] = { n: 0, common: r.commonName, dates: new Set() };
        freq[key].n++;
        if (r.date) freq[key].dates.add(r.date);
    });
    const sorted = Object.entries(freq).sort((a, b) => b[1].n - a[1].n);

    // Stats cards
    const statsEl = document.getElementById('calculo-stats-row');
    if (statsEl) {
        const uniqueSp = rows.filter(r => !isUncertainRecord(r))
            .reduce((acc, r) => { acc.add(r.scientificName); return acc; }, new Set()).size;
        const uniqueDates = new Set(rows.map(r => r.date).filter(Boolean)).size;
        const maxSp = sorted[0] ? sorted[0][1].n : 0;
        const maxSpObj = sorted[0] ? sorted[0] : null;
        const maxSpName = maxSpObj ? (maxSpObj[1].common && maxSpObj[1].common !== '—' ? maxSpObj[1].common : maxSpObj[0].split(' ').pop()) : '—';
        const cards = [
            { l: 'Total avistamentos', v: total, c: 'var(--green-base)' },
            { l: 'Espécies únicas', v: uniqueSp, c: 'var(--amber)' },
            { l: 'Dias de campo', v: uniqueDates, c: '#2060c0' },
            { l: `Mais frequente`, v: maxSpName, c: '#8b2fc9', small: true },
            { l: `(${maxSp} avistamentos)`, v: '', c: '#8b2fc9', sub: true },
        ];
        statsEl.innerHTML = cards.filter(c => !c.sub).map(s => `
            <div style="background:white;border:1px solid var(--border-light);border-radius:var(--radius-md);padding:12px 18px;min-width:130px;flex:1;text-align:center;box-shadow:var(--shadow-card);">
                <div style="font-size:${s.small?'16px':'24px'};font-weight:700;color:${s.c};">${s.v}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${s.l}</div>
                ${s.small ? `<div style="font-size:11px;color:${s.c};">${maxSp} avistamentos</div>` : ''}
            </div>`).join('');
    }

    // Gráfico de barras (top 20)
    const top20 = sorted.slice(0, 20);
    // Use nome popular if available, else full scientific name
    const barLabels = top20.map(([sp, v]) => v.common && v.common !== '—' ? v.common : sp);
    const barData   = top20.map(([, v]) => v.n);
    const barColors = top20.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length]);

    const ctxBar = document.getElementById('calculo-bar-chart')?.getContext('2d');
    if (ctxBar) {
        if (_calcBarChart) _calcBarChart.destroy();
        _calcBarChart = new Chart(ctxBar, {
            type: 'bar',
            data: { labels: barLabels, datasets: [{ label: 'Avistamentos', data: barData, backgroundColor: barColors, borderRadius: 4, barThickness: 'flex', maxBarThickness: 28 }] },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: {
                        title: (items) => top20[items[0].dataIndex][0],
                        afterTitle: (items) => { const v = top20[items[0].dataIndex][1]; return v.common && v.common !== '—' ? `(${v.common})` : ''; },
                        label: (item) => ` ${item.raw} avistamento(s)`
                    }}
                },
                scales: {
                    x: { title: { display: true, text: 'Frequência' }, beginAtZero: true, grace: '5%' },
                    y: { ticks: { font: { size: 11 }, maxRotation: 0 } }
                },
                layout: { padding: { right: 10 } }
            }
        });
    }

    // Gráfico de pizza
    const ctxPie = document.getElementById('calculo-pie-chart')?.getContext('2d');
    if (ctxPie) {
        if (_calcPieChart) _calcPieChart.destroy();
        const pieTop = sorted.slice(0, 12);
        const outros = sorted.slice(12).reduce((s, [, v]) => s + v.n, 0);
        const pieLabels = pieTop.map(([sp, v]) => {
            const pop = v.common && v.common !== '—' ? ` (${v.common})` : '';
            return sp + pop;
        });
        const pieData   = pieTop.map(([, v]) => v.n);
        if (outros > 0) { pieLabels.push('Outros'); pieData.push(outros); }
        _calcPieChart = new Chart(ctxPie, {
            type: 'doughnut',
            data: { labels: pieLabels, datasets: [{ data: pieData, backgroundColor: [...CHART_PALETTE.slice(0, 12), '#aaa'], borderWidth: 1 }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    datalabels: { color: '#ffffff', font: { weight: 'bold', size: 12 }, formatter: (v, c) => { const t = c.dataset.data.reduce((a,b)=>a+b,0); return t>0&&v>0 ? ((v/t*100).toFixed(1)+'%') : ''; } },
                    legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12, padding: 6 } },
                    tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw} (${(ctx.raw/total*100).toFixed(1)}%)` } }
                }
            }
        });
    }

    // Gráfico por data
    const byDate = {};
    rows.forEach(r => { if (r.date) byDate[r.date] = (byDate[r.date] || 0) + 1; });
    const dateKeys = Object.keys(byDate).sort();
    const dateChartWrap = document.getElementById('calculo-date-chart-wrap');
    if (dateChartWrap) dateChartWrap.style.display = dateKeys.length > 0 ? '' : 'none';
    if (dateKeys.length > 0) {
        const ctxDate = document.getElementById('calculo-date-chart')?.getContext('2d');
        if (ctxDate) {
            if (_calcDateChart) _calcDateChart.destroy();
            _calcDateChart = new Chart(ctxDate, {
                type: 'bar',
                data: { labels: dateKeys.map(d => displayDateBR(d)), datasets: [{ label: 'Avistamentos no dia', data: dateKeys.map(d => byDate[d]), backgroundColor: 'rgba(42,125,82,0.72)', borderColor: '#1d6140', borderWidth: 1, borderRadius: 3 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Avistamentos' } } } }
            });
        }
    }

    // Tabela
    const tbody = document.getElementById('calculo-table-body');
    if (tbody) {
        tbody.innerHTML = '';
        let filtered = sorted;
        if (search) filtered = filtered.filter(([sp, v]) => sp.toLowerCase().includes(search) || v.common.toLowerCase().includes(search));
        filtered.forEach(([sp, v], i) => {
            const pct = total > 0 ? (v.n / total * 100).toFixed(1) : '0.0';
            const barW = total > 0 ? Math.round(v.n / sorted[0][1].n * 100) : 0;
            const datesStr = [...v.dates].sort().map(d => displayDateBR(d)).join(', ') || '—';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center;color:var(--text-muted);font-size:12px;">${i+1}</td>
                <td style="font-size:13px;"><em>${sp}</em></td>
                <td style="font-size:13px;color:var(--text-muted);">${v.common || '—'}</td>
                <td style="text-align:center;font-weight:700;font-size:14px;color:var(--green-base);">${v.n}</td>
                <td style="min-width:120px;">
                    <div style="display:flex;align-items:center;gap:6px;">
                        <div style="flex:1;background:#e8f0eb;border-radius:3px;height:10px;overflow:hidden;">
                            <div style="width:${barW}%;background:${CHART_PALETTE[i%CHART_PALETTE.length]};height:100%;border-radius:3px;"></div>
                        </div>
                        <span style="font-size:12px;font-weight:600;min-width:38px;text-align:right;">${pct}%</span>
                    </div>
                </td>
                <td style="font-size:11px;color:var(--text-muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${datesStr}">${datesStr}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    const countEl = document.getElementById('calculo-count');
    if (countEl) countEl.textContent = `${sorted.length} espécie(s) · ${total} avistamento(s) total`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('calculo-refresh')?.addEventListener('click', buildCalculoTab);
    document.getElementById('calculo-filter-date')?.addEventListener('change', buildCalculoTab);
    document.getElementById('calculo-search')?.addEventListener('input', buildCalculoTab);
    document.getElementById('calculo-export-csv')?.addEventListener('click', () => {
        const av = window.AVISTAMENTOS || [];
        if (!av.length) { alert('Nenhum avistamento registrado.'); return; }
        const freq = {};
        av.forEach(r => { if (!freq[r.scientificName]) freq[r.scientificName] = { n: 0, common: r.commonName, dates: [] }; freq[r.scientificName].n++; if (r.date) freq[r.scientificName].dates.push(r.date); });
        const total = av.length;
        const header = 'Espécie,Nome popular,Frequência absoluta,Frequência relativa (%),Datas';
        const rows = Object.entries(freq).sort((a,b)=>b[1].n-a[1].n).map(([sp,v]) =>
            `"${sp}","${v.common}","${v.n}","${(v.n/total*100).toFixed(1)}","${[...new Set(v.dates)].sort().map(d=>displayDateBR(d)).join(' | ')}"`);
        const blob = new Blob([header+'\n'+rows.join('\n')], {type:'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='calculo_avistamentos.csv'; a.click();
    });

    // Atualiza cálculo ao entrar na aba
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.tab === 'calculo-avist-section') buildCalculoTab();
        });
    });
});

// ==================== RAREFAÇÃO ====================
let rarefChart = null;
const RAREF_COLORS = ['#2a7d52','#e67e22','#3498db','#9b59b6','#e74c3c','#1abc9c','#f39c12'];

function rarefacaoRun() {
    const nInput = parseInt(document.getElementById('raref-n').value) || 10;
    const sTotal = parseInt(document.getElementById('raref-s').value) || 50;
    const areas = document.querySelectorAll('.raref-area-item');
    const datasets = [];
    areas.forEach((el, i) => {
        const name = el.querySelector('.raref-area-name').value || `Área ${i+1}`;
        const nVal = parseInt(el.querySelector('.raref-area-n').value) || nInput;
        const sVal = parseInt(el.querySelector('.raref-area-s').value) || sTotal;
        const curve = [];
        for (let n = 1; n <= nVal; n++) {
            // E[S(n)] = S * (1 - C(N-n, n_total) / C(N, n_total)) approx via formula
            let es = 0;
            for (let j = 1; j <= sVal; j++) {
                // probabilidade de espécie j estar em n amostras
                const freq = Math.max(1, Math.round(nVal / sVal));
                es += 1 - Math.pow(Math.max(0, 1 - freq / nVal), n);
            }
            curve.push(Math.min(es, sVal));
        }
        datasets.push({ label: name, data: curve.map((v,i)=>({x:i+1,y:v})), borderColor: RAREF_COLORS[i%RAREF_COLORS.length], backgroundColor:'transparent', tension:0.3, pointRadius:2, fill:false });
    });
    if (datasets.length === 0) {
        // single curve from form
        const curve = [];
        for (let n = 1; n <= nInput; n++) {
            let es = 0;
            for (let j = 1; j <= sTotal; j++) { const freq = Math.max(1, Math.round(nInput/sTotal)); es += 1 - Math.pow(Math.max(0,1-freq/nInput), n); }
            curve.push(Math.min(es, sTotal));
        }
        datasets.push({ label:'Amostra', data: curve.map((v,i)=>({x:i+1,y:v})), borderColor:'#2a7d52', backgroundColor:'transparent', tension:0.3, pointRadius:3, fill:false });
    }
    const ctx = document.getElementById('rarefChart').getContext('2d');
    if (rarefChart) rarefChart.destroy();
    rarefChart = new Chart(ctx, {
        type:'line', data:{ datasets },
        options:{
            responsive:true, maintainAspectRatio:false,
            scales:{
                x:{ type:'linear', title:{display:true,text:'Nº de amostras'}, ticks:{ callback: v => Number.isInteger(v) ? v : '' } },
                y:{ title:{display:true,text:'Riqueza esperada E[S]'}, beginAtZero:true, ticks:{ callback: v => Number(v).toFixed(2) } }
            },
            plugins:{
                legend:{position:'top'},
                datalabels:{ display: false },
                tooltip:{ callbacks:{ label: item => `${item.dataset.label}: ${Number(item.raw.y ?? item.raw).toFixed(2)}` } }
            }
        }
    });
    // Análise automática
    let analise = `<strong>Áreas comparadas:</strong> ${datasets.length}`;
    if (datasets.length >= 2) {
        const finalVals = datasets.map(d => ({ name: d.label, val: d.data[d.data.length-1]?.y ?? d.data[d.data.length-1] }));
        const maxArea = finalVals.reduce((a,b) => a.val > b.val ? a : b);
        const minArea = finalVals.reduce((a,b) => a.val < b.val ? a : b);
        analise += `<br>📊 Área com maior riqueza estimada ao final: <strong>${maxArea.name}</strong> (${Number(maxArea.val).toFixed(2)} spp)`;
        analise += ` · Menor: <strong>${minArea.name}</strong> (${Number(minArea.val).toFixed(2)} spp).`;
        analise += `<br>As curvas ${datasets.every(d=>{ const last2 = d.data.slice(-3); return last2.length>=2 && Math.abs((last2[last2.length-1]?.y??0)-(last2[0]?.y??0)) < 1; }) ? 'parecem estar estabilizando (assíntota próxima) — o esforço amostral pode ser suficiente.' : 'ainda apresentam tendência de crescimento — recomenda-se aumentar o esforço amostral.'}`;
    }
    document.getElementById('raref-stats').innerHTML = `<div style="background:var(--green-mist);border-left:4px solid var(--green-base);border-radius:0 var(--radius-sm) var(--radius-sm) 0;padding:12px 16px;line-height:1.8;">${analise}</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('raref-run')?.addEventListener('click', rarefacaoRun);

    document.getElementById('raref-import-avist')?.addEventListener('click', () => {
        const av = window.AVISTAMENTOS || [];
        if (!av.length) { alert('Nenhum avistamento registrado. Use a aba 🔭 Avistamentos primeiro.'); return; }
        const byDate = {};
        av.forEach(r => {
            const key = r.date || '_semdata';
            if (!byDate[key]) byDate[key] = new Set();
            byDate[key].add(r.scientificName);
        });
        const sortedDates = Object.keys(byDate).filter(k=>k!=='_semdata').sort();
        const noDate = byDate['_semdata'];
        const list = document.getElementById('raref-areas-list');
        list.innerHTML = ''; // Remove todas as áreas existentes (inclusive Área 1 e Área 2 padrão)
        const allSpSoFar = new Set();
        sortedDates.forEach((date, i) => {
            byDate[date].forEach(s => allSpSoFar.add(s));
            const n = i + 1;
            const s = allSpSoFar.size;
            const div = document.createElement('div');
            div.className = 'raref-area-item';
            div.style.cssText = 'background:var(--green-mist);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;';
            const parts = date.split('-');
            const dateLabel = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
            div.innerHTML = `<input class="raref-area-name" type="text" value="${dateLabel}" style="width:120px;">
                <label style="font-size:12px;">N amostras: <input class="raref-area-n" type="number" min="1" value="${n}" style="width:60px;"></label>
                <label style="font-size:12px;">S riqueza acum.: <input class="raref-area-s" type="number" min="1" value="${s}" style="width:60px;"></label>
                <button class="delete-btn" style="padding:4px 10px;font-size:12px;" onclick="this.closest('.raref-area-item').remove()">✕</button>`;
            list.appendChild(div);
        });
        if (noDate && noDate.size > 0) {
            const div = document.createElement('div');
            div.className = 'raref-area-item';
            div.style.cssText = 'background:var(--green-mist);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;';
            div.innerHTML = `<input class="raref-area-name" type="text" value="Sem data" style="width:120px;">
                <label style="font-size:12px;">N amostras: <input class="raref-area-n" type="number" min="1" value="1" style="width:60px;"></label>
                <label style="font-size:12px;">S riqueza: <input class="raref-area-s" type="number" min="1" value="${noDate.size}" style="width:60px;"></label>
                <button class="delete-btn" style="padding:4px 10px;font-size:12px;" onclick="this.closest('.raref-area-item').remove()">✕</button>`;
            list.appendChild(div);
        }
        const totalSp = [...new Set(av.map(r=>r.scientificName))].length;
        document.getElementById('raref-n').value = sortedDates.length || 1;
        document.getElementById('raref-s').value = totalSp;
        // Calcula rarefação automaticamente após importar
        setTimeout(rarefacaoRun, 80);
    });

    document.getElementById('raref-add-area')?.addEventListener('click', () => {
        const list = document.getElementById('raref-areas-list');
        const idx = list.children.length + 1;
        const div = document.createElement('div');
        div.className = 'raref-area-item';
        div.style.cssText = 'background:var(--green-mist); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px 14px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;';
        div.innerHTML = `<input class="raref-area-name" type="text" value="Área ${idx}" style="width:120px;" placeholder="Nome"> <label style="font-size:12px;">N amostras: <input class="raref-area-n" type="number" min="2" value="10" style="width:60px;"></label> <label style="font-size:12px;">S riqueza: <input class="raref-area-s" type="number" min="1" value="40" style="width:60px;"></label> <button class="delete-btn" style="padding:4px 10px; font-size:12px;" onclick="this.closest('.raref-area-item').remove()">✕</button>`;
        list.appendChild(div);
    });
    // trigger add two default areas
    document.getElementById('raref-add-area')?.click();
    document.getElementById('raref-add-area')?.click();
    const a2 = document.querySelectorAll('.raref-area-item')[1];
    if (a2) { a2.querySelector('.raref-area-name').value = 'Área 2'; a2.querySelector('.raref-area-s').value = '25'; }
});

// ==================== SAZONALIDADE ====================
let sazonChart = null, sazonEstChart = null;
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const ESTACOES = {1:'Verão',2:'Verão',3:'Outono',4:'Outono',5:'Outono',6:'Inverno',7:'Inverno',8:'Inverno',9:'Primavera',10:'Primavera',11:'Primavera',12:'Verão'};

function parseSazonData(raw) {
    const rows = []; raw.split('\n').forEach(line => { const p=line.split(','); if(p.length>=2){const sp=p[0].trim(); const m=parseInt(p[1].trim()); if(sp && m>=1 && m<=12) rows.push({sp,m});} }); return rows;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sazon-import-table')?.addEventListener('click', () => {
        const imported = [];
        document.querySelectorAll('#table-body tr').forEach(tr => {
            const spCell = tr.querySelector('td.species-col');
            if (spCell) { const inp = spCell.querySelector('input'); const val = inp ? inp.value.trim() : spCell.textContent.trim(); if (val) imported.push(val); }
        });
        if (imported.length === 0) { alert('Nenhuma espécie importada na tabela principal.'); return; }
        const lines = imported.map((sp,i)=> `${sp},${(i%12)+1}`).join('\n');
        document.getElementById('sazon-data').value = lines;

    });

    // 🔭 Importar avistamentos → Sazonalidade (usa mês real da data quando disponível)
    document.getElementById('sazon-import-avist')?.addEventListener('click', () => {
        const av = window.AVISTAMENTOS || [];
        if (!av.length) { alert('Nenhum avistamento registrado. Use a aba 🔭 Avistamentos primeiro.'); return; }
        const withDate = av.filter(r => r.date);
        const noDate   = av.filter(r => !r.date);
        const lines = [];
        withDate.forEach(r => {
            const m = parseInt(r.date.split('-')[1]) || 1;
            lines.push(`${r.scientificName},${m}`);
        });
        noDate.forEach((r, i) => { lines.push(`${r.scientificName},${(i % 12) + 1}`); });
        document.getElementById('sazon-data').value = lines.join('\n');
        setTimeout(() => document.getElementById('sazon-run')?.click(), 50);
    });

    // 🔭 Importar avistamentos → Fenologia
    document.getElementById('fenol-import-avist')?.addEventListener('click', () => {
        const av = window.AVISTAMENTOS || [];
        const withDate = av.filter(r => r.date);
        if (!withDate.length) { alert('Nenhum avistamento com data registrado. Use a aba 🔭 Avistamentos (modo com data).'); return; }
        const lines = withDate.map(r => `${r.scientificName},${r.date}`);
        document.getElementById('fenol-data').value = lines.join('\n');
        // Trigger render automatically
        document.getElementById('fenol-run')?.click();
    });

    // 🔭 Importar avistamentos → Turnover (agrupa por data)
    document.getElementById('turnover-import-avist')?.addEventListener('click', () => {
        const av = window.AVISTAMENTOS || [];
        const withDate = av.filter(r => r.date);
        if (!withDate.length) { alert('Nenhum avistamento com data. Use a aba 🔭 Avistamentos (modo com data).'); return; }
        // Agrupa por data
        const byDate = {};
        withDate.forEach(r => { if (!byDate[r.date]) byDate[r.date] = []; byDate[r.date].push(r.scientificName); });
        const sortedDates = Object.keys(byDate).sort();
        // Preenche os períodos existentes e cria novos se necessário
        const container = document.getElementById('turnover-periods-container');
        container.innerHTML = '';
        window._turnPeriodCount = 0; // reset counter
        sortedDates.forEach((date, i) => {
            const div = document.createElement('div');
            div.className = 'turnover-period-item';
            window._turnPeriodCount++;
            div.style.cssText = 'flex:1; min-width:220px; background:var(--green-mist); border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; position:relative;';
            div.innerHTML = `<button onclick="this.closest('.turnover-period-item').remove()" style="position:absolute;top:8px;right:8px;background:#c0392b;color:white;border:none;width:22px;height:22px;border-radius:50%;font-size:13px;cursor:pointer;">×</button>
                <h4 style="margin:0 0 8px; font-size:13.5px; color:var(--green-deep);">${displayDateBR(date)}</h4>
                <input type="text" class="turn-period-name" value="${displayDateBR(date)}" style="width:100%; margin-bottom:8px;">
                <textarea class="turn-period-data" rows="5" style="width:100%;">${byDate[date].join('\n')}</textarea>`;
            container.appendChild(div);
        });
        setTimeout(() => document.getElementById('turnover-run')?.click(), 50);
    });

    // 🔭 Importar avistamentos → Rank-Abundância (conta frequência de cada espécie)
    document.getElementById('rankabund-import-avist')?.addEventListener('click', () => {
        const av = window.AVISTAMENTOS || [];
        if (!av.length) { alert('Nenhum avistamento registrado.'); return; }
        const freq = {};
        av.forEach(r => { freq[r.scientificName] = (freq[r.scientificName] || 0) + 1; });
        const lines = Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([sp,n])=>`${sp},${n}`);
        document.getElementById('rankabund-data').value = lines.join('\n');
        setTimeout(() => document.getElementById('rankabund-run')?.click(), 50);
    });

    // 🔭 Importar avistamentos → Co-ocorrência (cada data = um levantamento)
    document.getElementById('cooc-import-avist')?.addEventListener('click', () => {
        const av = window.AVISTAMENTOS || [];
        const withDate = av.filter(r => r.date);
        const noDate   = av.filter(r => !r.date);
        let text = '';
        if (withDate.length) {
            const byDate = {};
            withDate.forEach(r => { if (!byDate[r.date]) byDate[r.date] = []; byDate[r.date].push(r.scientificName); });
            const sortedDates = Object.keys(byDate).sort();
            text = sortedDates.map(d => `Levantamento ${displayDateBR(d)}:\n${byDate[d].join('\n')}`).join('\n\n');
        }
        if (noDate.length) {
            if (text) text += '\n\n';
            text += `Levantamento (sem data):\n${noDate.map(r=>r.scientificName).join('\n')}`;
        }
        if (!text) { alert('Nenhum avistamento registrado.'); return; }
        document.getElementById('cooc-data').value = text;
        setTimeout(() => document.getElementById('cooc-run')?.click(), 50);
    });

    document.getElementById('sazon-run')?.addEventListener('click', () => {
        const raw = document.getElementById('sazon-data').value.trim();
        if (!raw) { alert('Insira dados de registros.'); return; }

        // Detectar formato: "Espécie, AAAA-MM-DD", "Espécie, AAAA-MM" ou "Espécie, M"
        const SC = {1:'#e74c3c',2:'#e74c3c',3:'#e67e22',4:'#e67e22',5:'#f39c12',6:'#3498db',7:'#2980b9',8:'#3498db',9:'#27ae60',10:'#2ecc71',11:'#1abc9c',12:'#c0392b'};
        const rowsFull = [];
        raw.split('\n').forEach(line => {
            const p = line.split(',');
            if (p.length < 2) return;
            const sp = p[0].trim();
            const dateStr = p[1].trim();
            const fullMatch = dateStr.match(/^(\d{4})-(\d{1,2})/);
            if (fullMatch) {
                rowsFull.push({ sp, year: parseInt(fullMatch[1]), month: parseInt(fullMatch[2]) });
            } else {
                const m = parseInt(dateStr);
                if (m >= 1 && m <= 12) rowsFull.push({ sp, year: 0, month: m });
            }
        });

        if (rowsFull.length === 0) { alert('Formato inválido. Use: Espécie, Mês (1-12) ou Espécie, AAAA-MM'); return; }

        const hasYears = rowsFull.some(r => r.year > 0);
        const ctx = document.getElementById('sazonChart').getContext('2d');
        if (sazonChart) sazonChart.destroy();

        if (hasYears) {
            // Modo timeline: eixo X = AAAA-MM ordenado
            const periodMap = {};
            rowsFull.forEach(r => {
                const key = r.year > 0 ? `${r.year}-${String(r.month).padStart(2,'0')}` : `0000-${String(r.month).padStart(2,'0')}`;
                if (!periodMap[key]) periodMap[key] = { count: 0, species: new Set(), month: r.month };
                periodMap[key].count++;
                periodMap[key].species.add(r.sp);
            });
            const sortedKeys = Object.keys(periodMap).sort();
            const labels = sortedKeys.map(k => {
                const [y, m] = k.split('-');
                return y === '0000' ? MESES[parseInt(m)-1] : `${MESES[parseInt(m)-1]}/${y}`;
            });
            const counts   = sortedKeys.map(k => periodMap[k].count);
            const richness = sortedKeys.map(k => periodMap[k].species.size);
            const bgColors = sortedKeys.map(k => (SC[periodMap[k].month]||'#888') + 'CC');
            const bdColors = sortedKeys.map(k => SC[periodMap[k].month]||'#888');

            sazonChart = new Chart(ctx, {
                type:'bar',
                data:{ labels, datasets:[
                    { label:'Nº de registros', data:counts, backgroundColor:bgColors, borderColor:bdColors, borderWidth:1.5, yAxisID:'y' },
                    { label:'Riqueza de espécies', data:richness, type:'line', borderColor:'#2c3e50', backgroundColor:'transparent', tension:0.3, pointRadius:4, pointBackgroundColor:'#2c3e50', yAxisID:'y2' }
                ]},
                options:{ responsive:true, maintainAspectRatio:false,
                    plugins:{ legend:{position:'top'},
                        datalabels:{
                            display: ctx => ctx.datasetIndex === 0 && ctx.dataset.data[ctx.dataIndex] > 0,
                            color:'#ffffff', font:{size:10, weight:'700'},
                            anchor:'center', align:'center',
                            formatter: v => v
                        },
                        tooltip:{ callbacks:{ afterLabel:(c)=>{ if(c.datasetIndex===0) return `Estação: ${ESTACOES[periodMap[sortedKeys[c.dataIndex]].month]}`; return ''; } } }
                    },
                    scales:{
                        x:{ ticks:{maxRotation:45, font:{size:10}} },
                        y:{title:{display:true,text:'Registros'},beginAtZero:true},
                        y2:{position:'right',title:{display:true,text:'Riqueza'},beginAtZero:true,grid:{drawOnChartArea:false}}
                    }
                }
            });
        } else {
            // Modo mensal acumulado (comportamento original)
            const countByMonth = Array(12).fill(0);
            const spByMonth = Array.from({length:12}, () => new Set());
            rowsFull.forEach(({sp,month:m}) => { countByMonth[m-1]++; spByMonth[m-1].add(sp); });
            const richByMonth = spByMonth.map(s => s.size);
            const SEASON_COLORS = [SC[1],SC[2],SC[3],SC[4],SC[5],SC[6],SC[7],SC[8],SC[9],SC[10],SC[11],SC[12]];
            sazonChart = new Chart(ctx, {
                type:'bar', data:{ labels:MESES, datasets:[
                    { label:'Nº de registros', data:countByMonth, backgroundColor:SEASON_COLORS.map(c=>c+'CC'), borderColor:SEASON_COLORS, borderWidth:1.5, yAxisID:'y' },
                    { label:'Riqueza de espécies', data:richByMonth, type:'line', borderColor:'#2c3e50', backgroundColor:'transparent', tension:0.3, pointRadius:5, pointBackgroundColor:'#2c3e50', yAxisID:'y2' }
                ]},
                options:{ responsive:true, maintainAspectRatio:false,
                    plugins:{ legend:{position:'top'},
                        datalabels:{
                            display: ctx => ctx.datasetIndex === 0 && ctx.dataset.data[ctx.dataIndex] > 0,
                            color:'#ffffff', font:{size:10, weight:'700'},
                            anchor:'center', align:'center',
                            formatter: v => v
                        },
                        tooltip:{ callbacks:{ afterLabel:(c)=>{ if(c.datasetIndex===0) return `Estação: ${ESTACOES[c.dataIndex+1]}`; return ''; } } }
                    },
                    scales:{ y:{title:{display:true,text:'Registros'},beginAtZero:true}, y2:{position:'right',title:{display:true,text:'Riqueza'},beginAtZero:true,grid:{drawOnChartArea:false}} }
                }
            });
        }

        const estCount = {Verão:0, Outono:0, Inverno:0, Primavera:0};
        rowsFull.forEach(({month:m}) => { estCount[ESTACOES[m]]++; });
        const ctx2 = document.getElementById('sazonEstacaoChart').getContext('2d');
        if (sazonEstChart) sazonEstChart.destroy();
        sazonEstChart = new Chart(ctx2, {
            type:'doughnut', data:{ labels:['Verão','Outono','Inverno','Primavera'], datasets:[{ data:[estCount['Verão'],estCount['Outono'],estCount['Inverno'],estCount['Primavera']], backgroundColor:['#e74c3c','#e67e22','#3498db','#27ae60'], borderWidth:1 }] },
            options:{ responsive:true, maintainAspectRatio:false,
                plugins:{ legend:{position:'right'},
                    datalabels:{ color:'#ffffff', font:{weight:'bold',size:12}, formatter:(v,c)=>{ const t=c.dataset.data.reduce((a,b)=>a+b,0); return t>0&&v>0?((v/t*100).toFixed(1)+'%'):''; } },
                    title:{display:true, text:'Distribuição por Estação'} } }
        });
        const richMap = {};
        rowsFull.forEach(r=>{ if(!richMap[r.month])richMap[r.month]=new Set(); richMap[r.month].add(r.sp); });
        const mPico = Object.entries(richMap).sort((a,b)=>b[1].size-a[1].size)[0];
        const totalReg = rowsFull.length;
        const unicas = new Set(rowsFull.map(r=>r.sp)).size;
        const estCounts = {Verão:0,Outono:0,Inverno:0,Primavera:0};
        rowsFull.forEach(({month:m})=>{ estCounts[ESTACOES[m]]++; });
        const estDom = Object.entries(estCounts).sort((a,b)=>b[1]-a[1])[0];
        document.getElementById('sazon-stats').innerHTML = `<div style="background:var(--green-mist);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 18px;font-size:13px;line-height:1.8;color:var(--text-mid);">
            <strong style="color:var(--green-deep);font-size:14px;">🔬 Análise de Sazonalidade</strong><br>
            Total de registros: <strong>${totalReg}</strong> · Espécies únicas: <strong>${unicas}</strong><br>
            Mês de maior riqueza: <strong>${mPico ? MESES[parseInt(mPico[0])-1] : '—'}</strong> (${mPico ? mPico[1].size : 0} spp) · Estação dominante: <strong>${estDom[0]}</strong> (${estDom[1]} reg.)<br>
            <span style="color:#e74c3c;font-weight:700;">■</span> Verão: ${estCounts['Verão']} &nbsp;
            <span style="color:#e67e22;font-weight:700;">■</span> Outono: ${estCounts['Outono']} &nbsp;
            <span style="color:#3498db;font-weight:700;">■</span> Inverno: ${estCounts['Inverno']} &nbsp;
            <span style="color:#27ae60;font-weight:700;">■</span> Primavera: ${estCounts['Primavera']}
        </div>`;
    });
});

// ==================== FENOLOGIA ====================
let fenolChart = null;
let _fenolEntries = []; // global so sort can re-render
let _fenolSortMode = 'added'; // 'added'|'alpha'|'first_asc'|'first_desc'|'last_asc'|'last_desc'

function renderFenolChart(entries) {
    if (!entries.length) return;
    // Use real date objects for a proper timeline
    // Each species gets a horizontal bar from first to last detection
    const labels = entries.map(e => {
        const pop = typeof speciesInfo !== 'undefined' && speciesInfo[e.sp] ? speciesInfo[e.sp].nomePopular : '';
        return pop ? `${e.sp} (${pop})` : e.sp;
    });

    // Convert dates to day-of-year for consistent scale
    const dayOfYear = d => {
        const start = new Date(d.getFullYear(), 0, 0);
        const diff = d - start;
        return Math.floor(diff / 86400000);
    };

    // Find global date range
    const allFirsts = entries.map(e => e.first);
    const allLasts  = entries.map(e => e.last);
    const globalMin = new Date(Math.min(...allFirsts));
    const globalMax = new Date(Math.max(...allLasts));
    const globalMinDay = dayOfYear(globalMin);

    const offsets   = entries.map(e => dayOfYear(e.first) - globalMinDay);
    const durations = entries.map(e => Math.max(1, dayOfYear(e.last) - dayOfYear(e.first)));

    // Color by season of first detection
    const SEASON_C = { Verão:'#e74c3c', Outono:'#e67e22', Inverno:'#3498db', Primavera:'#27ae60' };
    const barColors = entries.map(e => {
        const m = e.first.getMonth() + 1;
        return SEASON_C[ESTACOES[m]] || '#2a7d52';
    });

    const ctx = document.getElementById('fenolChart').getContext('2d');
    if (fenolChart) fenolChart.destroy();

    const dynamicH = Math.max(400, entries.length * 28 + 80);
    document.getElementById('fenolChart').style.height = dynamicH + 'px';

    fenolChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [
            { label:'Deslocamento', data: offsets,   backgroundColor:'rgba(0,0,0,0)', borderWidth:0, barPercentage:0.6 },
            { label:'Período ativo', data: durations, backgroundColor: barColors, borderColor: barColors.map(c=>c+'AA'), borderWidth:1, barPercentage:0.6,
              tooltip: { callbacks: { label: (ctx) => {
                const e = entries[ctx.dataIndex];
                return `${e.first.toLocaleDateString('pt-BR')} → ${e.last.toLocaleDateString('pt-BR')} (${ctx.raw} dias · ${e.n} reg.)`;
              }}}
            }
        ]},
        options:{
            indexAxis:'y', responsive:true, maintainAspectRatio:false,
            plugins:{
                legend:{display:false},
                tooltip:{ callbacks:{
                    title:(items) => labels[items[0].dataIndex],
                    label:(item) => {
                        if(item.datasetIndex===0) return '';
                        const e = entries[item.dataIndex];
                        const season = ESTACOES[e.first.getMonth()+1];
                        return [
                            `📅 Início: ${e.first.toLocaleDateString('pt-BR')} (${season})`,
                            `📅 Fim: ${e.last.toLocaleDateString('pt-BR')}`,
                            `📊 ${item.raw} dia(s) de atividade · ${e.n} registro(s)`
                        ];
                    }
                }}
            },
            scales:{
                x:{ stacked:true, title:{display:true, text:'Dias desde o primeiro registro'},
                    ticks:{ callback:(v) => v < 0 ? v+'d ⚠' : v+'d' } },
                y:{ stacked:true, ticks:{ font:{size:10} } }
            }
        }
    });

    // Show the note about negative values if any offset is 0 (stacked bars can show negative area)
    const noteEl = document.getElementById('fenol-chart-note');
    if (noteEl) noteEl.style.display = 'block';
}

function renderFenolTable(entries) {
    const wrap = document.getElementById('fenol-table-wrap');
    const th = (t, sortKey) => `<th style="background:var(--green-mid);color:white;padding:9px 12px;cursor:pointer;white-space:nowrap;" onclick="sortFenol('${sortKey}')">${t} <span style="opacity:0.7;">↕</span></th>`;
    wrap.innerHTML = `
        <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center;">
            <span style="font-size:13px;font-weight:600;color:var(--text-mid);">Ordenar:</span>
            <button onclick="sortFenol('added')"    class="genealogical-view-btn ${_fenolSortMode==='added'?'active':''}">Ordem adicionada</button>
            <button onclick="sortFenol('alpha')"    class="genealogical-view-btn ${_fenolSortMode==='alpha'?'active':''}">A → Z</button>
            <button onclick="sortFenol('first_asc')" class="genealogical-view-btn ${_fenolSortMode==='first_asc'?'active':''}">Início ↑</button>
            <button onclick="sortFenol('first_desc')" class="genealogical-view-btn ${_fenolSortMode==='first_desc'?'active':''}">Início ↓</button>
            <button onclick="sortFenol('last_asc')"  class="genealogical-view-btn ${_fenolSortMode==='last_asc'?'active':''}">Fim ↑</button>
            <button onclick="sortFenol('last_desc')" class="genealogical-view-btn ${_fenolSortMode==='last_desc'?'active':''}">Fim ↓</button>
        </div>
        <div class="table-container" style="max-height:320px;overflow-y:auto;">
        <table style="width:100%;border-collapse:collapse;">
            <thead><tr>
                ${th('Espécie','alpha')}
                ${th('Nome Popular','')}
                ${th('Primeira detecção','first_asc')}
                ${th('Última detecção','last_asc')}
                <th style="background:var(--green-mid);color:white;padding:9px 12px;">Nº reg.</th>
                <th style="background:var(--green-mid);color:white;padding:9px 12px;">Duração</th>
            </tr></thead>
            <tbody>${entries.map(e=>{
                const pop = typeof speciesInfo !== 'undefined' && speciesInfo[e.sp] ? speciesInfo[e.sp].nomePopular : '—';
                const days = Math.max(0, Math.round((e.last - e.first) / 86400000));
                const season = ESTACOES[e.first.getMonth()+1];
                const sc = {Verão:'#e74c3c',Outono:'#e67e22',Inverno:'#3498db',Primavera:'#27ae60'}[season]||'#2a7d52';
                return `<tr>
                    <td style="padding:8px 12px;border-bottom:1px solid var(--border-light);"><em style="font-size:12px;">${e.sp}</em></td>
                    <td style="padding:8px 12px;border-bottom:1px solid var(--border-light);font-size:13px;color:var(--text-muted);">${pop}</td>
                    <td style="padding:8px 12px;border-bottom:1px solid var(--border-light);font-size:13px;white-space:nowrap;">
                        <span style="display:inline-block;width:10px;height:10px;background:${sc};border-radius:50%;margin-right:4px;"></span>
                        ${e.first.toLocaleDateString('pt-BR')}
                    </td>
                    <td style="padding:8px 12px;border-bottom:1px solid var(--border-light);font-size:13px;white-space:nowrap;">${e.last.toLocaleDateString('pt-BR')}</td>
                    <td style="padding:8px 12px;border-bottom:1px solid var(--border-light);text-align:center;font-weight:700;">${e.n}</td>
                    <td style="padding:8px 12px;border-bottom:1px solid var(--border-light);text-align:center;color:var(--text-muted);font-size:12px;">${days}d</td>
                </tr>`;
            }).join('')}</tbody>
        </table></div>`;
}

window.sortFenol = function(mode) {
    _fenolSortMode = mode;
    const orig = [..._fenolEntries]; // preserve original order
    let sorted;
    if (mode === 'alpha')      sorted = [...orig].sort((a,b)=>a.sp.localeCompare(b.sp));
    else if (mode === 'first_asc')  sorted = [...orig].sort((a,b)=>a.first-b.first);
    else if (mode === 'first_desc') sorted = [...orig].sort((a,b)=>b.first-a.first);
    else if (mode === 'last_asc')   sorted = [...orig].sort((a,b)=>a.last-b.last);
    else if (mode === 'last_desc')  sorted = [...orig].sort((a,b)=>b.last-a.last);
    else sorted = orig; // 'added' = original order
    renderFenolChart(sorted);
    renderFenolTable(sorted);
};

function renderFenolAnalysis(entries) {
    const el = document.getElementById('fenol-analysis');
    if (!el || !entries.length) return;
    const durations = entries.map(e => Math.max(0, Math.round((e.last - e.first) / 86400000)));
    const avgDur = (durations.reduce((a,b)=>a+b,0) / durations.length).toFixed(1);
    const maxE = entries.reduce((a,b) => b.last - b.first > a.last - a.first ? b : a);
    const minE = entries.reduce((a,b) => b.last - b.first < a.last - a.first ? b : a);
    const byEst = {};
    entries.forEach(e => { const s = ESTACOES[e.first.getMonth()+1]; byEst[s] = (byEst[s]||0)+1; });
    const estDom = Object.entries(byEst).sort((a,b)=>b[1]-a[1])[0];
    el.innerHTML = `<div style="background:var(--green-mist);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 18px;font-size:13px;line-height:1.8;color:var(--text-mid);">
        <strong style="color:var(--green-deep);font-size:14px;">🔬 Análise Fenológica</strong><br>
        Espécies analisadas: <strong>${entries.length}</strong> · Duração média de atividade: <strong>${avgDur} dias</strong><br>
        Maior período: <strong>${maxE.sp}</strong> (${Math.round((maxE.last-maxE.first)/86400000)}d) · Menor: <strong>${minE.sp}</strong> (${Math.round((minE.last-minE.first)/86400000)}d)<br>
        Estação de início mais frequente: <strong>${estDom[0]}</strong> (${estDom[1]} espécies)
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fenol-run')?.addEventListener('click', () => {
        const raw = document.getElementById('fenol-data').value.trim();
        if (!raw) { alert('Insira registros no formato Espécie, AAAA-MM-DD'); return; }
        const spDates = {};
        raw.split('\n').forEach(line => {
            const p = line.split(','); if(p.length<2) return;
            const sp = p[0].trim(); const dateStr = p[1].trim();
            const d = new Date(dateStr); if(isNaN(d)) return;
            if (!spDates[sp]) spDates[sp] = [];
            spDates[sp].push(d);
        });
        _fenolEntries = Object.entries(spDates).map(([sp, dates]) => {
            const s = dates.sort((a,b)=>a-b);
            return { sp, first: s[0], last: s[s.length-1], n: dates.length };
        });
        if (_fenolEntries.length === 0) { alert('Nenhum dado válido.'); return; }
        _fenolSortMode = 'added';
        renderFenolChart(_fenolEntries);
        renderFenolTable(_fenolEntries);
        renderFenolAnalysis(_fenolEntries);
    });
});

// ==================== TURNOVER TEMPORAL ====================
let turnoverChart = null;
window._turnPeriodCount = 0;
document.addEventListener('DOMContentLoaded', () => {
    function addTurnoverPeriod() {
        window._turnPeriodCount++;
        const c = document.getElementById('turnover-periods-container');
        const div = document.createElement('div');
        div.className = 'turnover-period-item';
        div.dataset.idx = window._turnPeriodCount;
        div.style.cssText = 'flex:1; min-width:220px; background:var(--green-mist); border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; position:relative;';
        div.innerHTML = `<button onclick="this.closest('.turnover-period-item').remove()" style="position:absolute;top:8px;right:8px;background:#c0392b;color:white;border:none;width:22px;height:22px;border-radius:50%;font-size:13px;cursor:pointer;">×</button>
            <h4 style="margin:0 0 8px; font-size:13.5px; color:var(--green-deep);">Período ${window._turnPeriodCount}</h4>
            <input type="text" class="turn-period-name" value="Período ${window._turnPeriodCount}" style="width:100%; margin-bottom:8px;">
            <textarea class="turn-period-data" rows="5" placeholder="Uma espécie por linha..." style="width:100%;"></textarea>`;
        c.appendChild(div);
    }
    addTurnoverPeriod(); addTurnoverPeriod();

    document.getElementById('turnover-add-period')?.addEventListener('click', addTurnoverPeriod);

    document.getElementById('turnover-run')?.addEventListener('click', () => {
        const items = document.querySelectorAll('.turnover-period-item');
        if (items.length < 2) { alert('Adicione pelo menos 2 períodos.'); return; }
        const periods = Array.from(items).map(el => ({
            name: el.querySelector('.turn-period-name').value || 'Período',
            species: new Set(el.querySelector('.turn-period-data').value.split('\n').map(s=>s.trim()).filter(Boolean))
        }));

        const gains = [], losses = [], labels = [];
        for (let i = 1; i < periods.length; i++) {
            const prev = periods[i-1].species, curr = periods[i].species;
            const g = [...curr].filter(s=>!prev.has(s));
            const l = [...prev].filter(s=>!curr.has(s));
            gains.push(g.length); losses.push(-l.length);
            labels.push(`${periods[i-1].name} → ${periods[i].name}`);
        }

        const ctx = document.getElementById('turnoverChart').getContext('2d');
        if (turnoverChart) turnoverChart.destroy();
        turnoverChart = new Chart(ctx, {
            type:'bar', data:{ labels, datasets:[
                { label:'Ganhos (entrada)', data:gains, backgroundColor:'rgba(46,204,113,0.75)', borderColor:'#27ae60', borderWidth:1 },
                { label:'Perdas (saída)', data:losses, backgroundColor:'rgba(231,76,60,0.75)', borderColor:'#c0392b', borderWidth:1 }
            ]},
            options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{position:'top'}, datalabels:{display:false} }, scales:{ y:{title:{display:true,text:'Nº espécies'}} } }
        });

        let html = `<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="background:var(--green-mid);color:white;padding:9px 14px;">Transição</th><th style="background:var(--green-mid);color:white;padding:9px 14px;">Ganhos</th><th style="background:var(--green-mid);color:white;padding:9px 14px;">Perdas</th><th style="background:var(--green-mid);color:white;padding:9px 14px;">Taxa turnover</th></tr></thead><tbody>`;
        const turnRates = [];
        const gainsList = [];
        const lossesList = [];
        for (let i = 1; i < periods.length; i++) {
            const prev = periods[i-1].species, curr = periods[i].species;
            const g = [...curr].filter(s=>!prev.has(s)).length;
            const l = [...prev].filter(s=>!curr.has(s)).length;
            const union = new Set([...prev,...curr]).size;
            const T = union > 0 ? ((g+l)/(2*union)*100) : 0;
            turnRates.push(T); gainsList.push(g); lossesList.push(l);
            html += `<tr><td style="padding:8px 14px;border-bottom:1px solid var(--border-light);">${periods[i-1].name} → ${periods[i].name}</td><td style="padding:8px 14px;border-bottom:1px solid var(--border-light);color:#27ae60;font-weight:700;">+${g}</td><td style="padding:8px 14px;border-bottom:1px solid var(--border-light);color:#c0392b;font-weight:700;">-${l}</td><td style="padding:8px 14px;border-bottom:1px solid var(--border-light);">${T.toFixed(2)}%</td></tr>`;
        }
        html += '</tbody></table>';
        document.getElementById('turnover-results').innerHTML = html;

        // Resumo e análise numa tabela separada abaixo
        const avgG = gainsList.reduce((a,b)=>a+b,0)/gainsList.length;
        const avgL = lossesList.reduce((a,b)=>a+b,0)/lossesList.length;
        const avgT = turnRates.reduce((a,b)=>a+b,0)/turnRates.length;
        const maxT = Math.max(...turnRates);
        const minT = Math.min(...turnRates);
        document.getElementById('turnover-summary').innerHTML = `<div style="background:var(--green-mist);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 18px;">
            <strong style="color:var(--green-deep);font-size:14px;">📊 Resumo das Transições</strong>
            <table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:13px;">
                <tr style="background:rgba(42,125,82,0.12);">
                    <th style="padding:8px;text-align:left;border-bottom:1px solid var(--border);">Métrica</th>
                    <th style="padding:8px;text-align:center;border-bottom:1px solid var(--border);">Média</th>
                    <th style="padding:8px;text-align:center;border-bottom:1px solid var(--border);">Mín.</th>
                    <th style="padding:8px;text-align:center;border-bottom:1px solid var(--border);">Máx.</th>
                </tr>
                <tr><td style="padding:7px 8px;border-bottom:1px solid var(--border-light);">Ganhos (espécies/transição)</td><td style="padding:7px 8px;text-align:center;color:#27ae60;font-weight:700;">${avgG.toFixed(2)}</td><td style="padding:7px 8px;text-align:center;">${Math.min(...gainsList)}</td><td style="padding:7px 8px;text-align:center;">${Math.max(...gainsList)}</td></tr>
                <tr><td style="padding:7px 8px;border-bottom:1px solid var(--border-light);">Perdas (espécies/transição)</td><td style="padding:7px 8px;text-align:center;color:#c0392b;font-weight:700;">${avgL.toFixed(2)}</td><td style="padding:7px 8px;text-align:center;">${Math.min(...lossesList)}</td><td style="padding:7px 8px;text-align:center;">${Math.max(...lossesList)}</td></tr>
                <tr><td style="padding:7px 8px;">Taxa de Turnover (%)</td><td style="padding:7px 8px;text-align:center;font-weight:700;">${avgT.toFixed(2)}%</td><td style="padding:7px 8px;text-align:center;">${minT.toFixed(2)}%</td><td style="padding:7px 8px;text-align:center;">${maxT.toFixed(2)}%</td></tr>
            </table>
            <div style="margin-top:12px;font-size:13px;line-height:1.7;color:var(--text-mid);">
                <strong>🔬 Análise:</strong>
                ${avgT < 15 ? 'Taxa de turnover <strong>baixa</strong> (média < 15%) — comunidade estável, com poucas substituições de espécies entre períodos.' :
                  avgT < 35 ? 'Taxa de turnover <strong>moderada</strong> (média entre 15–35%) — renovação parcial da comunidade; espécies residentes convivem com visitantes sazonais.' :
                  'Taxa de turnover <strong>alta</strong> (média > 35%) — comunidade muito dinâmica, com renovação expressiva de espécies entre períodos.'}
                ${gainsList.reduce((a,b)=>a+b,0) > lossesList.reduce((a,b)=>a+b,0) ? ' Tendência de <strong>acréscimo</strong> de espécies ao longo do período.' : gainsList.reduce((a,b)=>a+b,0) < lossesList.reduce((a,b)=>a+b,0) ? ' Tendência de <strong>declínio</strong> de espécies ao longo do período.' : ' Ganhos e perdas em <strong>equilíbrio</strong>.'}
            </div>
        </div>`;
    });
});

// ==================== ESPÉCIES INDICADORAS ====================
let indicadorasChart = null;
const IUCN_ORDER = {'LC':0,'NT':1,'VU':2,'EN':3,'CR':4,'DD':-1,'NE':-1};

function runIndicadoras() {
    const iucnMin = document.getElementById('indicadoras-iucn-min')?.value || 'VU';
    const minScore = IUCN_ORDER[iucnMin] ?? 0;
    const imported = new Set();
    document.querySelectorAll('#table-body tr').forEach(tr => {
        const spCell = tr.querySelector('td.species-col');
        if (spCell) { const inp = spCell.querySelector('input'); const val = inp ? inp.value.trim() : spCell.textContent.trim(); if (val) imported.add(val); }
    });
    if (imported.size === 0) {
        document.getElementById('indicadoras-results').innerHTML = '<p style="padding:14px; color:var(--text-muted);">Nenhuma espécie importada. Vá até a aba 📥 Importação primeiro.</p>';
        const analEl = document.getElementById('indicadoras-analysis');
        if (analEl) analEl.innerHTML = '';
        return;
    }
    const GUILD_SCORE = {
        'Nectarívoro': 3, 'Piscívoro': 3, 'Malacófago': 3,
        'Insetívoro-aéreo': 2, 'Carnívoro': 2, 'Insetívoro': 2, 'Frugívoro': 2,
        'Herbívoro': 1, 'Granívoro': 1, 'Filtrador': 1, 'Cleptoparasita': 1,
        'Onívoro': 0, 'Detritívoro': 0
    };
    const HABITAT_SCORE = {'Florestal': 3, 'Aquático': 3, 'Costeiro': 2, 'Campestre': 1, 'Aéreo': 1, 'Generalista': 0};
    function calcSensitivity(guilda, habitat) {
        if (!guilda || guilda === '-') return { level: '?', score: -1, label: '?', bg: '#f5f5f5' };
        let gScore = 0;
        Object.entries(GUILD_SCORE).forEach(([key, val]) => { if (guilda.includes(key) && val > gScore) gScore = val; });
        let hScore = 0;
        Object.entries(HABITAT_SCORE).forEach(([key, val]) => { if ((habitat||'').includes(key) && val > hScore) hScore = val; });
        const total = gScore + hScore;
        if (total >= 5) return { level: 'Crítica', score: total, label: `🔴 Crítica (${total}pts)`, bg: '#f8d7d7' };
        if (total >= 3) return { level: 'Alta',    score: total, label: `🟠 Alta (${total}pts)`,    bg: '#fde8c8' };
        if (total >= 2) return { level: 'Média',   score: total, label: `🟡 Média (${total}pts)`,   bg: '#fdf3dc' };
        return               { level: 'Baixa',   score: total, label: `🟢 Baixa (${total}pts)`,  bg: '#eef4e4' };
    }
    const results = [];
    imported.forEach(sp => {
        const guild = typeof GUILDA_DB !== 'undefined' ? GUILDA_DB[sp] : null;
        const cons = typeof conservationData !== 'undefined' ? conservationData.find(c=>c.especie===sp) : null;
        const iucnScore = cons ? (IUCN_ORDER[cons.iucn] ?? -1) : -1;
        const scScore = cons ? (IUCN_ORDER[cons.sc] ?? -1) : -1;
        if (iucnScore >= minScore || scScore >= minScore) {
            const sens = calcSensitivity(guild?.guilda || '-', guild?.habitat || '-');
            results.push({ sp, nomePopular: cons?.nomePopular||'-', iucn: cons?.iucn||'NE', sc: cons?.sc||'NE', guilda: guild?.guilda||'-', habitat: guild?.habitat||'-', sensitivity: sens.level, sensLabel: sens.label, sensBg: sens.bg, sensScore: sens.score });
        }
    });
    results.sort((a,b) => {
        const sOrd = {'Crítica':4,'Alta':3,'Média':2,'Baixa':1,'?':0};
        const sd = (sOrd[b.sensitivity]||0) - (sOrd[a.sensitivity]||0);
        if (sd !== 0) return sd;
        return (IUCN_ORDER[b.iucn]??-1) - (IUCN_ORDER[a.iucn]??-1);
    });
    const COLOR = {'LC':'#1e8449','NT':'#d4860e','VU':'#c0650a','EN':'#c0392b','CR':'#922b21','DD':'#717d7e','NE':'#9eaeb0'};
    let html = `<table style="width:100%;border-collapse:collapse;"><thead><tr>${['Espécie','Nome Popular','IUCN','SC','Guilda','Habitat','Sensibilidade (pontos)'].map(h=>`<th style="background:var(--green-mid);color:white;padding:9px 14px;font-size:12px;">${h}</th>`).join('')}</tr></thead><tbody>`;
    results.forEach(r => {
        html += `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid var(--border-light);"><em style="font-size:13px;">${r.sp}</em></td>
            <td style="padding:8px 12px;border-bottom:1px solid var(--border-light);font-size:13px;">${r.nomePopular}</td>
            <td style="padding:8px 12px;border-bottom:1px solid var(--border-light);font-weight:700;color:${COLOR[r.iucn]||'#333'};">${r.iucn}</td>
            <td style="padding:8px 12px;border-bottom:1px solid var(--border-light);font-weight:700;color:${COLOR[r.sc]||'#333'};">${r.sc}</td>
            <td style="padding:8px 12px;border-bottom:1px solid var(--border-light);font-size:12px;">${r.guilda}</td>
            <td style="padding:8px 12px;border-bottom:1px solid var(--border-light);font-size:12px;">${r.habitat}</td>
            <td style="padding:8px 12px;border-bottom:1px solid var(--border-light);background:${r.sensBg||'#f5f5f5'};font-weight:700;font-size:12px;text-align:center;">${r.sensLabel||r.sensitivity}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    html += `<div style="margin-top:12px;padding:10px 14px;background:var(--green-mist);border-radius:6px;font-size:11.5px;color:var(--text-mid);line-height:1.8;">
        <strong>Pontuação:</strong> Nectarívoro/Piscívoro/Malacófago=3 · Carnívoro/Insetívoro/Frugívoro=2 · Granívoro/Herbívoro=1 · Onívoro/Detritívoro=0
        + Florestal/Aquático=3 · Costeiro=2 · Campestre/Aéreo=1 · Generalista=0
        → 🔴 Crítica(≥5) · 🟠 Alta(3–4) · 🟡 Média(2) · 🟢 Baixa(≤1)
    </div>`;
    document.getElementById('indicadoras-results').innerHTML = results.length ? html : '<p style="padding:14px;color:var(--text-muted);">Nenhuma espécie atende ao limiar selecionado.</p>';
    // Gráfico
    const countBySens = {}; results.forEach(r=>{ countBySens[r.sensitivity]=(countBySens[r.sensitivity]||0)+1; });
    const SENS_COLOR = {'Crítica':'#c0392b','Alta':'#e67e22','Média':'#f1c40f','Baixa':'#27ae60','?':'#95a5a6'};
    const ctx = document.getElementById('indicadorasChart')?.getContext('2d');
    if (ctx) {
        if (indicadorasChart) indicadorasChart.destroy();
        indicadorasChart = new Chart(ctx, { type:'doughnut',
            data:{ labels:Object.keys(countBySens), datasets:[{ data:Object.values(countBySens), backgroundColor:Object.keys(countBySens).map(k=>SENS_COLOR[k]||'#999'), borderWidth:2, borderColor:'#fff' }] },
            options:{ responsive:true, maintainAspectRatio:false,
                plugins:{ legend:{position:'right'}, title:{display:true, text:`${results.length} espécies indicadoras`},
                    datalabels:{ color:'#fff', font:{weight:'700',size:12}, formatter:(v,c)=>{ const t=c.dataset.data.reduce((a,b)=>a+b,0); return t>0&&v>0?v:''; } }
                }
            }
        });
    }
    // Análise separada
    const analEl = document.getElementById('indicadoras-analysis');
    if (analEl) {
        if (results.length === 0) { analEl.innerHTML = ''; return; }
        const nCrit  = results.filter(r=>r.sensitivity==='Crítica').length;
        const nAlta  = results.filter(r=>r.sensitivity==='Alta').length;
        const nMedia = results.filter(r=>r.sensitivity==='Média').length;
        const nBaixa = results.filter(r=>r.sensitivity==='Baixa').length;
        const pctCrit = (nCrit/imported.size*100).toFixed(1);
        const topCrit = results.filter(r=>r.sensitivity==='Crítica').slice(0,3).map(r=>r.nomePopular!=='-'?r.nomePopular:r.sp).join(', ');
        analEl.innerHTML = `<div style="background:var(--green-mist);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 18px;font-size:13px;line-height:1.9;color:var(--text-mid);">
            <strong style="color:var(--green-deep);font-size:14px;">🔬 Análise de Espécies Indicadoras</strong><br>
            Espécies importadas: <strong>${imported.size}</strong> · Enquadradas no limiar ${iucnMin}+: <strong>${results.length}</strong><br>
            🔴 Crítica: <strong>${nCrit}</strong> · 🟠 Alta: <strong>${nAlta}</strong> · 🟡 Média: <strong>${nMedia}</strong> · 🟢 Baixa: <strong>${nBaixa}</strong><br>
            Sensibilidade crítica representa <strong>${pctCrit}%</strong> do total importado.
            ${nCrit > 0 ? `<br>Exemplos críticos: <strong>${topCrit}</strong>` : ''}
            <br>${nCrit >= 3 ? '⚠️ Alta proporção de espécies sensíveis — ecossistema bem preservado e por isso especialmente vulnerável a perturbações.' : nCrit > 0 ? '🔶 Presença de espécies críticas requer atenção ao manejo da área.' : '✅ Nenhuma espécie de sensibilidade crítica no limiar selecionado.'}
        </div>`;
    }
}
window.runIndicadoras = runIndicadoras;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('indicadoras-run')?.addEventListener('click', runIndicadoras);
    document.getElementById('indicadoras-iucn-min')?.addEventListener('change', runIndicadoras);
    // Auto-run when tab becomes active
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === 'indicadoras-section') btn.addEventListener('click', () => setTimeout(runIndicadoras, 120));
    });
    // Auto-update when species table changes
    const tableBody = document.getElementById('table-body');
    if (tableBody) {
        const obs = new MutationObserver(() => {
            if (document.getElementById('indicadoras-section')?.classList.contains('tab-active')) runIndicadoras();
        });
        obs.observe(tableBody, { childList: true, subtree: true });
    }
});
// ==================== CLUSTER HIERÁRQUICO ====================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('cluster-run')?.addEventListener('click', () => {
        // Collect lists from compare section
        const listItems = document.querySelectorAll('#lists-container .list-item');
        const lists = [];
        listItems.forEach((el, i) => {
            const name = el.querySelector('.list-legend')?.value || `Lista ${i+1}`;
            const species = new Set();
            el.querySelectorAll('.list-body tr td').forEach(td => { const t = td.textContent.trim(); if(t) species.add(t); });
            if (species.size > 0) lists.push({ name, species });
        });
        if (lists.length < 2) { document.getElementById('cluster-svg-container').innerHTML = '<p style="color:var(--text-muted);padding:20px;">Processe pelo menos 2 listas na aba 🔀 Comparar primeiro.</p>'; return; }

        const n = lists.length;
        const method = document.getElementById('cluster-method').value;

        // Build Jaccard distance matrix
        const dist = Array.from({length:n},()=>Array(n).fill(0));
        for (let i=0;i<n;i++) for(let j=0;j<n;j++) {
            if(i===j){dist[i][j]=0;continue;}
            const a=lists[i].species, b=lists[j].species;
            const inter=[...a].filter(s=>b.has(s)).length;
            const union=new Set([...a,...b]).size;
            dist[i][j] = union>0 ? 1 - inter/union : 1;
        }

        // Agglomerative clustering
        let clusters = lists.map((l,i)=>({id:i, labels:[l.name], merged:false }));
        let dmat = dist.map(r=>[...r]);
        const merges = [];
        let nextId = n;
        for (let step=0; step<n-1; step++) {
            let minD=Infinity, mi=-1, mj=-1;
            for(let i=0;i<dmat.length;i++) for(let j=i+1;j<dmat.length;j++) { if(dmat[i][j]<minD){minD=dmat[i][j];mi=i;mj=j;} }
            if(mi<0) break;
            merges.push({i:mi,j:mj,d:minD,ci:clusters[mi],cj:clusters[mj]});
            // update distances
            const newRow = dmat.map((_,k)=>{
                if(k===mi||k===mj) return Infinity;
                const di=dmat[mi][k], dj=dmat[mj][k];
                return method==='single'?Math.min(di,dj): method==='complete'?Math.max(di,dj): (di+dj)/2;
            });
            dmat[mi] = newRow; newRow.forEach((_,k)=>{if(k<dmat.length)dmat[k][mi]=newRow[k];});
            dmat[mj] = Array(dmat.length).fill(Infinity);
            dmat.forEach(r=>{r[mj]=Infinity;});
            clusters[mi] = { id:nextId++, labels:[...clusters[mi].labels,...clusters[mj].labels], merged:false };
            clusters[mj].merged = true;
        }

        // Draw simple dendogram as SVG
        const labelPad = 160; // space reserved on right for labels
        const leftPad  = 60;  // space on left for axis
        const W = 700, H = Math.max(260, n * 52 + 80), pad = 40;
        const leafY = lists.map((_,i) => pad + i * (H - 2*pad) / (n-1||1));
        let svgLines = '';
        let tempNodes = [...lists.map((_,i) => ({ ys:[leafY[i]], x: W - labelPad }))];
        merges.forEach(m => {
            const xPos = (W - labelPad) - m.d * (W - labelPad - leftPad);
            const ciYs = tempNodes[m.i].ys, cjYs = tempNodes[m.j].ys;
            const ciMid = ciYs.reduce((a,b)=>a+b)/ciYs.length;
            const cjMid = cjYs.reduce((a,b)=>a+b)/cjYs.length;
            const yMid = (ciMid + cjMid) / 2;
            svgLines += `<line x1="${tempNodes[m.i].x}" y1="${ciMid}" x2="${xPos}" y2="${ciMid}" stroke="#2a7d52" stroke-width="2"/>`;
            svgLines += `<line x1="${tempNodes[m.j].x}" y1="${cjMid}" x2="${xPos}" y2="${cjMid}" stroke="#2a7d52" stroke-width="2"/>`;
            svgLines += `<line x1="${xPos}" y1="${ciMid}" x2="${xPos}" y2="${cjMid}" stroke="#2a7d52" stroke-width="2"/>`;
            svgLines += `<circle cx="${xPos}" cy="${yMid}" r="4" fill="#2a7d52"/>`;
            svgLines += `<text x="${xPos}" y="${yMid - 7}" font-size="10" fill="#555" text-anchor="middle">${m.d.toFixed(2)}</text>`;
            tempNodes[m.i] = { ys: [...ciYs, ...cjYs], x: xPos };
        });
        // Leaf labels on right — full name, truncated if needed
        const leafLabels = lists.map((l, i) => {
            const displayName = l.name.length > 22 ? l.name.slice(0,20)+'…' : l.name;
            return `<line x1="${W - labelPad}" y1="${leafY[i]}" x2="${W - labelPad + 6}" y2="${leafY[i]}" stroke="#2a7d52" stroke-width="1.5"/>
                    <text x="${W - labelPad + 10}" y="${leafY[i] + 4}" font-size="12" fill="var(--text-dark)" font-family="DM Sans,sans-serif" font-weight="500">${escapeHtml ? escapeHtml(displayName) : displayName}</text>`;
        }).join('');
        // Axis ticks
        const axisLabels = [0,0.25,0.5,0.75,1.0].map(v => {
            const x = (W - labelPad) - v * (W - labelPad - leftPad);
            return `<line x1="${x}" y1="${pad-12}" x2="${x}" y2="${H - pad + 8}" stroke="#ccc" stroke-dasharray="3,3" stroke-width="1"/>
                    <text x="${x}" y="${pad-15}" font-size="10" fill="#888" text-anchor="middle">${v.toFixed(2)}</text>`;
        }).join('');
        const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:${H}px;">${axisLabels}${svgLines}${leafLabels}<text x="${(W-labelPad)/2+leftPad/2}" y="${H-6}" font-size="11" fill="#888" text-anchor="middle">Distância de Jaccard (1 − similaridade)</text></svg>`;
        document.getElementById('cluster-svg-container').innerHTML = svg;

        // Show distance matrix
        let mHtml = `<table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr><th style="background:var(--green-mid);color:white;padding:7px 10px;"></th>${lists.map(l=>`<th style="background:var(--green-mid);color:white;padding:7px 10px;">${l.name}</th>`).join('')}</tr></thead><tbody>`;
        dist.forEach((row,i)=>{ mHtml += `<tr><td style="padding:7px 10px;background:var(--green-mist);font-weight:600;font-size:12px;">${lists[i].name}</td>${row.map(v=>`<td style="padding:7px 10px;border:1px solid var(--border-light);text-align:center;background:${v===0?'#eaf4ed':v<0.3?'#d4eade':v<0.6?'#fff8e1':'#fde8d0'};">${v.toFixed(3)}</td>`).join('')}</tr>`; });
        mHtml += '</tbody></table>';
        document.getElementById('cluster-matrix-wrap').innerHTML = mHtml;
    });
});

// ==================== RANK-ABUNDÂNCIA ====================
let rankabundChart = null;
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('rankabund-import')?.addEventListener('click', () => {
        const imported = [];
        document.querySelectorAll('#table-body tr').forEach(tr => {
            const spCell = tr.querySelector('td.species-col');
            if (spCell) { const inp = spCell.querySelector('input'); const val = inp ? inp.value.trim() : spCell.textContent.trim(); if (val) imported.push(val); }
        });
        if (!imported.length) { alert('Nenhuma espécie importada.'); return; }
        document.getElementById('rankabund-data').value = imported.map(s=>`${s},1`).join('\n');
    });

    document.getElementById('rankabund-run')?.addEventListener('click', () => {
        const raw = document.getElementById('rankabund-data').value.trim();
        if (!raw) { alert('Insira dados.'); return; }
        const abund = {};
        raw.split('\n').forEach(line=>{ const p=line.split(','); if(p.length>=2){const sp=p[0].trim(); const n=parseInt(p[1])||1; abund[sp]=(abund[sp]||0)+n;} });
        const sorted = Object.entries(abund).sort((a,b)=>b[1]-a[1]);
        const total = sorted.reduce((s,[,v])=>s+v, 0);
        const ranks = sorted.map((_,i)=>i+1);
        const relAbund = sorted.map(([,v])=>v/total*100);
        const logAbund = relAbund.map(v=>Math.log10(v));

        const ctx = document.getElementById('rankabundChart').getContext('2d');
        if (rankabundChart) rankabundChart.destroy();
        rankabundChart = new Chart(ctx, {
            type:'line', data:{ labels:ranks, datasets:[
                { label:'Abundância relativa (%)', data:relAbund, borderColor:'#2a7d52', backgroundColor:'rgba(42,125,82,0.08)', tension:0.1, pointRadius:4, fill:true, pointBackgroundColor:'#2a7d52' }
            ]},
            options:{
                responsive:true, maintainAspectRatio:false,
                plugins:{
                    legend:{position:'top'},
                    datalabels:{ display: false },
                    tooltip:{ callbacks:{
                        title:(items) => sorted[items[0].dataIndex][0],
                        label:(item)  => `Abundância relativa: ${Number(item.raw).toFixed(2)}% (n=${sorted[item.dataIndex][1]})`
                    }}
                },
                scales:{
                    x:{ title:{display:true, text:'Rank de abundância'}, ticks:{ callback: v => Number(v).toFixed(0) } },
                    y:{
                        title:{display:true, text:'Abundância relativa (%)'},
                        beginAtZero:true,
                        ticks:{ callback: v => Number(v).toFixed(2) + '%' }
                    }
                }
            }
        });

        // Diversity indices
        const H = -sorted.reduce((s,[,v])=>{ const p=v/total; return s+(p>0?p*Math.log(p):0); }, 0);
        const D1 = 1 - sorted.reduce((s,[,v])=>(s+(v/total)**2),0);
        const E = H/Math.log(sorted.length||1);
        const indEl = document.getElementById('rankabund-indices');
        const cards = [{l:'Riqueza (S)',v:sorted.length},{l:"Shannon (H')",v:H.toFixed(3)},{l:"Simpson (1-D)",v:D1.toFixed(3)},{l:"Equitabilidade (J')",v:isNaN(E)?'—':E.toFixed(3)},{l:'Total registros',v:total}];
        indEl.innerHTML = cards.map(c=>`<div style="background:white;border:1px solid var(--border-light);border-radius:var(--radius-md);padding:12px 18px;min-width:130px;box-shadow:var(--shadow-card);flex:1;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--green-base);">${c.v}</div><div style="font-size:12px;color:var(--text-muted);margin-top:3px;">${c.l}</div></div>`).join('');

        // Análise automática — tabela separada abaixo dos índices
        const dom = sorted[0], dom2 = sorted[1];
        const domPct = (dom[1]/total*100).toFixed(2);
        const top5pct = (sorted.slice(0,5).reduce((s,[,v])=>s+v,0)/total*100).toFixed(1);
        const eqDesc = isNaN(E) ? '' : E > 0.8 ? 'alta equitabilidade (comunidade bem distribuída)' : E > 0.5 ? 'equitabilidade moderada' : 'baixa equitabilidade (forte dominância)';
        const analiseEl = document.getElementById('rankabund-analysis');
        if (analiseEl) analiseEl.innerHTML = `<div style="background:var(--green-mist);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 18px;font-size:13px;line-height:1.8;color:var(--text-mid);">
            <strong style="color:var(--green-deep);font-size:14px;">🔬 Análise de Rank-Abundância</strong><br>
            Riqueza total: <strong>${sorted.length} espécies</strong> · <strong>${total}</strong> registros.<br>
            Espécie dominante: <strong>${dom[0]}</strong> com <strong>${domPct}%</strong> da abundância relativa.
            ${dom2 ? ` Co-dominante: <strong>${dom2[0]}</strong> (${(dom2[1]/total*100).toFixed(2)}%).` : ''}
            Top 5 espécies = <strong>${top5pct}%</strong> dos registros.<br>
            Shannon H' = <strong>${H.toFixed(3)}</strong> · Simpson 1−D = <strong>${D1.toFixed(3)}</strong> · J' = <strong>${isNaN(E)?'—':E.toFixed(3)}</strong> → ${eqDesc}.<br>
            ${E < 0.5 ? '⚠️ Curva íngreme: poucas espécies dominam — típico de ambientes perturbados.' : '✅ Curva suave: distribuição mais equitativa entre espécies.'}
        </div>`;
    });
});

// ==================== CO-OCORRÊNCIA ====================
let _coocMatrix = null, _coocAllSp = [], _coocSurveys = [];

function runCooc(minCooc) {
    if (!_coocAllSp.length || !_coocMatrix) {
        alert('Calcule a matriz primeiro clicando em ▶ Calcular Matriz.'); return;
    }
    const allSp = _coocAllSp, matrix = _coocMatrix, surveys = _coocSurveys;

    const spDisplayName = sp => {
        const pop = typeof speciesInfo !== 'undefined' && speciesInfo[sp] ? speciesInfo[sp].nomePopular : null;
        return pop ? `${sp} (${pop})` : sp;
    };

    // Display matrix
    const display = allSp.slice(0,20);
    const maxCooc = Math.max(1, ...display.flatMap(a=>display.map(b=>matrix[a]?.[b]||0)));
    let html = `<p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">${allSp.length} espécies × ${surveys.length} levantamentos${allSp.length>20?' (mostrando top 20)':''}</p>
    <div style="overflow:auto;max-height:400px;">
    <table style="border-collapse:collapse;font-size:11px;min-width:max-content;">
    <thead><tr>
        <th style="background:var(--green-mid);color:white;padding:6px 10px;position:sticky;left:0;z-index:2;min-width:160px;"></th>
        ${display.map(sp=>{
            const fullName = spDisplayName(sp);
            return `<th style="background:var(--green-mid);color:white;padding:4px 6px;writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;max-width:120px;font-size:10px;" title="${fullName}">${fullName.length > 20 ? fullName.slice(0,18)+'…' : fullName}</th>`;
        }).join('')}
    </tr></thead><tbody>`;
    display.forEach(a=>{
        html += `<tr><td style="padding:5px 10px;background:var(--green-mist);font-weight:600;font-size:11px;white-space:nowrap;position:sticky;left:0;z-index:1;border-right:2px solid var(--border);" title="${spDisplayName(a)}">${spDisplayName(a).length>24?spDisplayName(a).slice(0,22)+'…':spDisplayName(a)}</td>`;
        display.forEach(b=>{
            const v = a===b?'—':(matrix[a]?.[b]||0);
            const intensity = (a===b)?0:(matrix[a]?.[b]||0)/maxCooc;
            const bg = a===b?'#e0e0e0':`rgba(42,125,82,${(intensity*0.8).toFixed(2)})`;
            const color = intensity>0.5?'white':'var(--text-dark)';
            html += `<td style="padding:5px 8px;border:1px solid var(--border-light);text-align:center;background:${bg};color:${color};min-width:30px;">${v}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table></div>';
    document.getElementById('cooc-matrix-container').innerHTML = html;

    // Top pairs
    const pairs = [];
    allSp.forEach((a,i)=>allSp.forEach((b,j)=>{ if(j>i && (matrix[a]?.[b]||0)>=minCooc) pairs.push({a,b,n:matrix[a][b]}); }));
    pairs.sort((x,y)=>y.n-x.n);
    const topPairs = pairs.slice(0,20);

    let topHtml = '';
    if (topPairs.length > 0) {
        const canvasId = 'cooc-pairs-bar-chart';
        // Full names in pairs list
        const pairsList = topPairs.map(p => {
            const nameA = spDisplayName(p.a);
            const nameB = spDisplayName(p.b);
            return `<div style="background:var(--green-mist);border:1px solid var(--border);border-radius:var(--radius-sm);padding:7px 12px;font-size:12px;display:flex;align-items:center;gap:8px;">
                <span style="color:var(--green-deep);font-weight:600;">${nameA}</span>
                <span style="color:var(--text-muted);">+</span>
                <span style="color:var(--green-deep);font-weight:600;">${nameB}</span>
                <span style="background:var(--green-base);color:white;border-radius:10px;padding:2px 8px;font-size:11px;margin-left:auto;">${p.n}×</span>
            </div>`;
        }).join('');
        topHtml = `
        <div style="display:flex;align-items:center;gap:12px;margin:18px 0 10px;">
            <h4 style="color:var(--green-deep);margin:0;">📊 Co-ocorrências mais frequentes (top ${topPairs.length})</h4>
            <button onclick="copiarTopPares()" style="background:var(--green-deep);color:white;border:none;border-radius:var(--radius-sm);padding:6px 12px;font-size:12px;cursor:pointer;font-family:inherit;">📋 Copiar lista</button>
        </div>
        <div style="height:${Math.max(200,topPairs.length*30+60)}px;margin-bottom:14px;"><canvas id="${canvasId}"></canvas></div>
        <h4 style="color:var(--green-deep);margin-bottom:10px;">🔗 Pares com ≥${minCooc} co-ocorrências</h4>
        <div style="display:flex;flex-direction:column;gap:6px;">${pairsList}</div>`;
    } else {
        topHtml = `<p style="color:var(--text-muted);padding:12px;">Nenhum par com ≥${minCooc} co-ocorrências.</p>`;
    }
    document.getElementById('cooc-top-pairs').innerHTML = topHtml;

    // Análise da matriz — tabela separada
    const coocAnalEl = document.getElementById('cooc-matrix-analysis');
    if (coocAnalEl && allSp.length) {
        const totalPairs = pairs.length;
        const topPair = topPairs[0];
        const avgCooc = totalPairs > 0 ? (topPairs.reduce((s,p)=>s+p.n,0)/totalPairs).toFixed(1) : '0';
        coocAnalEl.innerHTML = `<div style="background:var(--green-mist);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 18px;font-size:13px;line-height:1.8;color:var(--text-mid);">
            <strong style="color:var(--green-deep);font-size:14px;">🔬 Análise de Co-ocorrência</strong><br>
            Espécies analisadas: <strong>${allSp.length}</strong> · Levantamentos: <strong>${surveys.length}</strong><br>
            Pares com ≥${minCooc} co-ocorrência(s): <strong>${totalPairs}</strong>${topPair ? ` · Par mais frequente: <strong>${spDisplayName(topPair.a)} + ${spDisplayName(topPair.b)}</strong> (${topPair.n}×)` : ''}<br>
            ${totalPairs > 0 ? `Média de co-ocorrências por par: <strong>${avgCooc}</strong>` : 'Nenhum par com co-ocorrência suficiente — tente reduzir o mínimo.'}<br>
            ${allSp.length > 20 ? 'ℹ️ A matriz exibe as 20 espécies mais abundantes. Use a rede de co-ocorrência abaixo para visualizar todas.' : ''}
        </div>`;
    }

    // Store for copy
    window._coocTopPairs = topPairs;
    window._coocSpDisplayName = spDisplayName;

    if (topPairs.length > 0) {
        setTimeout(() => {
            const ctx = document.getElementById('cooc-pairs-bar-chart')?.getContext('2d');
            if (!ctx) return;
            // Full names on chart labels  
            const chartLabels = topPairs.map(p => {
                const a = spDisplayName(p.a); const b = spDisplayName(p.b);
                return `${a} + ${b}`;
            });
            new Chart(ctx, {
                type:'bar',
                data:{ labels:chartLabels, datasets:[{ label:'Co-ocorrências', data:topPairs.map(p=>p.n), backgroundColor:'rgba(42,125,82,0.75)', borderColor:'#1d6140', borderWidth:1, borderRadius:3 }] },
                options:{
                    indexAxis:'y', responsive:true, maintainAspectRatio:false,
                    plugins:{ legend:{display:false}, datalabels:{display:false}, tooltip:{ callbacks:{ title:(items)=>`${topPairs[items[0].dataIndex].a} + ${topPairs[items[0].dataIndex].b}`, label:(item)=>`${item.raw} co-ocorrência(s)` } } },
                    scales:{ x:{beginAtZero:true, title:{display:true,text:'Nº de levantamentos compartilhados'}}, y:{ticks:{font:{size:10}}} }
                }
            });
        }, 50);
    }
}

// ==================== REDE DE CO-OCORRÊNCIA ====================
function buildCoocNetwork(minEdge) {
    const coocMatrix = window._patchCoocMatrix;
    const coocAllSp  = window._patchCoocAllSp;
    if (!coocMatrix || !coocAllSp || !coocAllSp.length) {
        alert('Calcule a matriz de co-ocorrência primeiro (▶ Calcular Matriz).'); return;
    }
    const wrap = document.getElementById('cooc-network-wrap');
    wrap.style.display = '';
    const size = parseInt(document.getElementById('cooc-net-size').value) || 700;
    const container = document.getElementById('cooc-net-container');
    container.style.height = size + 'px';
    const canvas = document.getElementById('cooc-net-canvas');
    const W = container.offsetWidth || 700;
    const H = size;
    canvas.width = W;
    canvas.height = H;

    const spDisplayShort = sp => {
        const pop = typeof speciesInfo !== 'undefined' && speciesInfo[sp] ? speciesInfo[sp].nomePopular : null;
        return pop ? `${sp.split(' ').slice(-1)[0]} (${pop})` : sp.split(' ').slice(-1)[0];
    };
    const GUILD_COLORS = {'Insetívoro':'#2a9d5c','Insetívoro aéreo':'#3490d4','Frugívoro':'#e07820','Granívoro':'#c8a010','Nectarívoro':'#c030a0','Carnívoro':'#d03030','Piscívoro':'#2060d0','Onívoro':'#6040c0','Detritívoro':'#707060','Filtrador':'#20a0a0','Herbívoro':'#50a030','Malacófago':'#a06030','Cleptoparasita':'#a030a0'};
    function getNodeColor(sp) {
        if (typeof GUILDA_DB !== 'undefined' && GUILDA_DB[sp]) {
            const g = GUILDA_DB[sp].guilda||'';
            for (const [key,col] of Object.entries(GUILD_COLORS)) { if (g.includes(key)) return col; }
        }
        return '#2a7d52';
    }
    const nodes = {};
    coocAllSp.forEach(sp => {
        const deg = coocAllSp.reduce((s,b)=>s+(coocMatrix[sp]?.[b]||0),0);
        nodes[sp] = { label:spDisplayShort(sp), fullName:sp, degree:deg, color:getNodeColor(sp), x:0,y:0,vx:0,vy:0, visible:true };
    });
    const edges = [];
    coocAllSp.forEach((a,i)=>coocAllSp.forEach((b,j)=>{
        if(j<=i) return;
        const w = coocMatrix[a]?.[b]||0;
        if(w>=minEdge) edges.push({a,b,w});
    }));
    if (!edges.length) { alert(`Nenhuma aresta com mínimo ${minEdge}. Tente um valor menor.`); return; }

    const spList = Object.keys(nodes);
    const n = spList.length;
    // Spread radius scales with node count for better distribution
    const R = Math.min(W,H) * Math.min(0.45, 0.15 + n * 0.008);
    const jitter = () => (Math.random()-0.5)*R*0.5;
    spList.forEach((sp,i) => {
        const angle = (2*Math.PI*i)/n - Math.PI/2;
        nodes[sp].x = W/2 + R*Math.cos(angle) + jitter();
        nodes[sp].y = H/2 + R*Math.sin(angle) + jitter();
    });
    const maxDeg = Math.max(1,...spList.map(sp=>nodes[sp].degree));
    const nodeR = sp => nodes[sp].visible ? 5 + (nodes[sp].degree/maxDeg)*18 : 0;
    const maxW = Math.max(1,...edges.map(e=>e.w));
    // More iterations and stronger repulsion for large networks
    const iters = Math.min(300, 120 + n * 2);
    for(let iter=0;iter<iters;iter++){
        // Stronger k as n grows to spread nodes further apart
        const k = Math.sqrt((W*H)/(n+1)) * (0.9 + n*0.012);
        const damp = iter < iters*0.5 ? 0.75 : 0.92;
        spList.forEach(a=>spList.forEach(b=>{
            if(a===b) return;
            const dx=nodes[a].x-nodes[b].x, dy=nodes[a].y-nodes[b].y;
            const d=Math.max(1,Math.sqrt(dx*dx+dy*dy));
            // Repulsion stronger for large networks
            const f=(k*k)/d * (0.6 + n*0.003);
            nodes[a].vx+=(dx/d)*f; nodes[a].vy+=(dy/d)*f;
        }));
        edges.forEach(e=>{
            if(!nodes[e.a].visible||!nodes[e.b].visible) return;
            const dx=nodes[e.a].x-nodes[e.b].x, dy=nodes[e.a].y-nodes[e.b].y;
            const d=Math.max(1,Math.sqrt(dx*dx+dy*dy));
            const f=(d*d)/k*0.2;
            nodes[e.a].vx-=(dx/d)*f; nodes[e.a].vy-=(dy/d)*f;
            nodes[e.b].vx+=(dx/d)*f; nodes[e.b].vy+=(dy/d)*f;
        });
        spList.forEach(sp=>{
            nodes[sp].vx+=(W/2-nodes[sp].x)*0.001;
            nodes[sp].vy+=(H/2-nodes[sp].y)*0.001;
        });
        spList.forEach(sp=>{
            const pad=(nodeR(sp)||8)+5;
            nodes[sp].x=Math.max(pad,Math.min(W-pad,nodes[sp].x+nodes[sp].vx));
            nodes[sp].y=Math.max(pad,Math.min(H-pad,nodes[sp].y+nodes[sp].vy));
            nodes[sp].vx*=damp; nodes[sp].vy*=damp;
        });
    }
    const ctx = canvas.getContext('2d');
    let hoveredNode=null, draggingNode=null, dragOffX=0, dragOffY=0;
    let camX=W/2, camY=H/2, camScale=1;
    let isPanning=false, panSX=0, panSY=0, panCX=0, panCY=0;
    function toCanvas(wx,wy){ return [(wx-camX)*camScale+W/2,(wy-camY)*camScale+H/2]; }
    function toWorld(cx,cy){ return [(cx-W/2)/camScale+camX,(cy-H/2)/camScale+camY]; }
    function draw(){
        ctx.clearRect(0,0,W,H);
        ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--green-mist').trim()||'#eaf4ed';
        ctx.fillRect(0,0,W,H);
        edges.forEach(e=>{
            if(!nodes[e.a].visible||!nodes[e.b].visible) return;
            const [ax,ay]=toCanvas(nodes[e.a].x,nodes[e.a].y);
            const [bx,by]=toCanvas(nodes[e.b].x,nodes[e.b].y);
            const isHov=(hoveredNode===e.a||hoveredNode===e.b);
            const alpha=isHov?0.9:0.2+(e.w/maxW)*0.5;
            ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by);
            ctx.strokeStyle=isHov?`rgba(200,120,30,${alpha})`:`rgba(80,140,100,${alpha})`;
            ctx.lineWidth=Math.max(0.5,(1+(e.w/maxW)*5)*camScale);
            ctx.stroke();
            if(e.w>=2&&camScale>0.5){
                ctx.font=`${Math.max(8,9*camScale)}px DM Sans,sans-serif`;
                ctx.fillStyle='rgba(40,80,50,0.8)'; ctx.textAlign='center';
                ctx.fillText(e.w,(ax+bx)/2,(ay+by)/2);
            }
        });
        spList.forEach(sp=>{
            if(!nodes[sp].visible) return;
            const r=nodeR(sp)*camScale;
            const [x,y]=toCanvas(nodes[sp].x,nodes[sp].y);
            const isHov=hoveredNode===sp;
            ctx.shadowColor='rgba(0,0,0,0.2)'; ctx.shadowBlur=isHov?12:4;
            ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
            ctx.fillStyle=nodes[sp].color; ctx.fill();
            ctx.strokeStyle=isHov?'#fff':'rgba(255,255,255,0.8)';
            ctx.lineWidth=isHov?3:1.5; ctx.stroke();
            ctx.shadowBlur=0;
            if(camScale>0.4){
                const lbl=nodes[sp].label;
                ctx.font=`${isHov?'bold ':''} ${Math.max(8,Math.min(12,10*camScale))}px DM Sans,sans-serif`;
                ctx.fillStyle='#1a2e1a'; ctx.textAlign='center';
                ctx.fillText(lbl.length>22?lbl.slice(0,20)+'…':lbl,x,y+r+12*camScale);
            }
        });
        if(hoveredNode){
            const sp=hoveredNode;
            const [x,y]=toCanvas(nodes[sp].x,nodes[sp].y);
            const pop=typeof speciesInfo!=='undefined'&&speciesInfo[sp]?speciesInfo[sp].nomePopular:'';
            const lines=[sp,pop?`(${pop})`:'',`Co-ocorrências: ${nodes[sp].degree}`].filter(Boolean);
            ctx.font='13px DM Sans,sans-serif';
            const tw=Math.max(...lines.map(l=>ctx.measureText(l).width));
            const bx2=Math.min(x+10,W-tw-20), by2=Math.max(y-lines.length*18-10,10);
            ctx.fillStyle='rgba(255,255,255,0.95)'; ctx.strokeStyle='#ccc'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.roundRect(bx2-8,by2-6,tw+16,lines.length*18+12,6); ctx.fill(); ctx.stroke();
            ctx.fillStyle='#1a2e1a'; ctx.textAlign='left';
            lines.forEach((l,i)=>ctx.fillText(l,bx2,by2+14+i*18));
        }
    }
    function getNodeAt(cx,cy){
        const[wx,wy]=toWorld(cx,cy);
        return spList.find(sp=>{const dx=nodes[sp].x-wx,dy=nodes[sp].y-wy;return Math.sqrt(dx*dx+dy*dy)<=nodeR(sp)+3;})||null;
    }
    canvas.onmousedown=e=>{
        const rect=canvas.getBoundingClientRect();
        const cx=e.clientX-rect.left,cy=e.clientY-rect.top;
        const nd=getNodeAt(cx,cy);
        if(nd){draggingNode=nd;const[wx,wy]=toWorld(cx,cy);dragOffX=nodes[nd].x-wx;dragOffY=nodes[nd].y-wy;}
        else{isPanning=true;panSX=cx;panSY=cy;panCX=camX;panCY=camY;}
    };
    canvas.onmousemove=e=>{
        const rect=canvas.getBoundingClientRect();
        const cx=e.clientX-rect.left,cy=e.clientY-rect.top;
        if(draggingNode){const[wx,wy]=toWorld(cx,cy);nodes[draggingNode].x=wx+dragOffX;nodes[draggingNode].y=wy+dragOffY;draw();return;}
        if(isPanning){camX=panCX-(cx-panSX)/camScale;camY=panCY-(cy-panSY)/camScale;draw();return;}
        const prev=hoveredNode; hoveredNode=getNodeAt(cx,cy);
        canvas.style.cursor=hoveredNode?'grab':'default';
        if(prev!==hoveredNode) draw();
    };
    canvas.onmouseup=()=>{draggingNode=null;isPanning=false;};
    canvas.onmouseleave=()=>{draggingNode=null;isPanning=false;hoveredNode=null;draw();};
    canvas.onwheel=e=>{e.preventDefault();camScale=Math.max(0.01,camScale*(e.deltaY<0?1.12:0.89));draw();};
    draw();
    const legendEl=document.getElementById('cooc-net-legend');
    const seen={};
    spList.forEach(sp=>{const c=nodes[sp].color;if(!seen[c])seen[c]=0;seen[c]++;});
    const gN={'#2a9d5c':'Insetívoro','#3490d4':'Insetívoro aéreo','#e07820':'Frugívoro','#c8a010':'Granívoro','#c030a0':'Nectarívoro','#d03030':'Carnívoro','#2060d0':'Piscívoro','#6040c0':'Onívoro','#707060':'Detritívoro','#20a0a0':'Filtrador','#50a030':'Herbívoro','#a06030':'Malacófago','#2a7d52':'Outro'};
    legendEl.innerHTML=Object.keys(seen).map(c=>`<span style="display:inline-flex;align-items:center;gap:4px;background:white;border:1px solid var(--border-light);border-radius:10px;padding:3px 10px;"><span style="width:10px;height:10px;border-radius:50%;background:${c};display:inline-block;"></span><span style="font-size:11px;">${gN[c]||'Outro'}</span></span>`).join('');

    // Taxon visibility table
    const taxonTableWrap = document.getElementById('cooc-net-taxon-table-wrap');
    const taxonTableEl = document.getElementById('cooc-net-taxon-table');
    if (taxonTableWrap && taxonTableEl) {
        taxonTableWrap.style.display = '';
        function buildTaxonTable() {
            const pop = typeof speciesInfo !== 'undefined' ? speciesInfo : {};
            const rows = spList.map(sp => {
                const edgeCount = edges.filter(e=>e.a===sp||e.b===sp).length;
                const popName = pop[sp]?.nomePopular || '';
                return `<tr>
                    <td style="padding:6px 10px;font-size:12px;">${sp}</td>
                    <td style="padding:6px 10px;font-size:12px;color:var(--text-muted);">${popName}</td>
                    <td style="padding:6px 10px;font-size:12px;text-align:center;">${nodes[sp].degree}</td>
                    <td style="padding:6px 10px;font-size:12px;text-align:center;">${edgeCount}</td>
                    <td style="padding:6px 10px;text-align:center;">
                        <button onclick="window._coocToggleNode('${sp.replace(/'/g,"\\'")}',this)" 
                            style="background:${nodes[sp].visible?'var(--green-base)':'#aaa'};color:white;border:none;border-radius:4px;padding:3px 10px;font-size:12px;cursor:pointer;">
                            ${nodes[sp].visible?'👁️ Visível':'🚫 Oculto'}
                        </button>
                    </td>
                </tr>`;
            }).join('');
            taxonTableEl.innerHTML = `<table style="width:100%;border-collapse:collapse;">
                <thead><tr style="background:var(--green-mid);color:white;">
                    <th style="padding:7px 10px;font-size:12px;text-align:left;">Espécie</th>
                    <th style="padding:7px 10px;font-size:12px;text-align:left;">Nome popular</th>
                    <th style="padding:7px 10px;font-size:12px;text-align:center;">Co-oc. total</th>
                    <th style="padding:7px 10px;font-size:12px;text-align:center;">Arestas</th>
                    <th style="padding:7px 10px;font-size:12px;text-align:center;">Visibilidade</th>
                </tr></thead><tbody>${rows}</tbody></table>`;
        }
        buildTaxonTable();
        window._coocToggleNode = function(sp, btn) {
            nodes[sp].visible = !nodes[sp].visible;
            btn.textContent = nodes[sp].visible ? '👁️ Visível' : '🚫 Oculto';
            btn.style.background = nodes[sp].visible ? 'var(--green-base)' : '#aaa';
            draw();
        };
    }

    // Análise da rede
    const analysisEl = document.getElementById('cooc-net-analysis');
    if (analysisEl) {
        const hub = spList.reduce((a,b)=>nodes[a].degree>nodes[b].degree?a:b);
        const avgDeg = (spList.reduce((s,sp)=>s+nodes[sp].degree,0)/spList.length).toFixed(1);
        const density = spList.length > 1 ? (edges.length / (spList.length*(spList.length-1)/2) * 100).toFixed(1) : '0.0';
        const pop = typeof speciesInfo !== 'undefined' && speciesInfo[hub] ? ` (${speciesInfo[hub].nomePopular})` : '';
        analysisEl.innerHTML = `<div style="background:var(--green-mist);border-left:4px solid var(--green-base);border-radius:0 var(--radius-sm) var(--radius-sm) 0;padding:12px 16px;font-size:13px;line-height:1.8;color:var(--text-mid);margin-top:4px;">
            <strong style="color:var(--green-deep);">🔬 Análise da Rede de Co-ocorrência</strong><br>
            Nós: <strong>${spList.length} espécies</strong> · Arestas: <strong>${edges.length}</strong> · Densidade: <strong>${density}%</strong><br>
            Espécie-hub (maior grau): <strong>${hub}${pop}</strong> com <strong>${nodes[hub].degree}</strong> co-ocorrências totais.<br>
            Grau médio por espécie: <strong>${avgDeg}</strong> co-ocorrências.<br>
            ${parseFloat(density) > 30 ? '✅ Rede densa — alta conectividade entre espécies, indicando comunidade coesa.' : parseFloat(density) > 10 ? '🔶 Rede moderadamente conectada — núcleo central de espécies co-ocorrentes com satélites periféricos.' : '⚠️ Rede esparsa — poucas conexões; aumente o esforço amostral ou reduza o mínimo de co-ocorrências para revelar mais padrões.'}
            Use a tabela acima para ocultar taxons e focar em grupos específicos.
        </div>`;
    }

    // Expõe função de separar pontos para o botão externo
    window._coocSpreadNodes = function() {
        // Zoom out e randomiza posições com espaçamento amplo e sem limite de borda
        camScale = Math.max(0.15, Math.min(0.6, 0.8 / Math.pow(spList.length, 0.35)));
        const spread = Math.max(W, H) * (1.5 + spList.length * 0.04);
        spList.forEach(sp => {
            // Posição aleatória num campo grande sem limite
            const angle = Math.random() * Math.PI * 2;
            const dist  = (0.2 + Math.random() * 0.8) * spread * 0.5;
            nodes[sp].x = W/2 + Math.cos(angle) * dist;
            nodes[sp].y = H/2 + Math.sin(angle) * dist;
            nodes[sp].vx = 0;
            nodes[sp].vy = 0;
        });
        // Centraliza câmera
        const cx = spList.reduce((s, sp) => s + nodes[sp].x, 0) / spList.length;
        const cy = spList.reduce((s, sp) => s + nodes[sp].y, 0) / spList.length;
        camX = cx; camY = cy;
        draw();
    };
}

// Interceptar runCooc para expor _coocMatrix e _coocAllSp no escopo window
const _origRunCooc = window.runCooc;
window.runCooc = function(minCooc) {
    if (typeof _origRunCooc === 'function') _origRunCooc(minCooc);
};

// Sobrescrever buildAndRun da co-ocorrência para expor variáveis
function _patchCoocExpose() {
    const btn = document.getElementById('cooc-run');
    const btn2 = document.getElementById('cooc-rerun');
    if (!btn || btn._netPatched) return;
    btn._netPatched = true;
    btn.addEventListener('click', () => {
        setTimeout(() => {
            const raw = document.getElementById('cooc-data')?.value.trim();
            if (!raw) return;
            const surveys = raw.split(/\n\s*\n/).map(block =>
                new Set(block.split('\n').map(s=>s.replace(/^Levantamento[^:]*:/i,'').trim()).filter(Boolean))
            );
            const allSp = [...new Set(surveys.flatMap(s=>[...s]))].sort();
            const matrix = {};
            allSp.forEach(a=>{matrix[a]={};allSp.forEach(b=>{matrix[a][b]=0;});});
            surveys.forEach(survey=>{
                const spArr=[...survey];
                for(let i=0;i<spArr.length;i++) for(let j=i+1;j<spArr.length;j++){
                    matrix[spArr[i]][spArr[j]]++; matrix[spArr[j]][spArr[i]]++;
                }
            });
            window._patchCoocMatrix = matrix;
            window._patchCoocAllSp = allSp;
            const wrap = document.getElementById('cooc-network-wrap');
            if (wrap) wrap.style.display = '';
        }, 400);
    }, true);
    if (btn2) btn2.addEventListener('click', ()=>{
        setTimeout(()=>{ if(!window._patchCoocMatrix) btn.click(); }, 100);
    }, true);
}

document.addEventListener('DOMContentLoaded', () => {
    _patchCoocExpose();
    document.getElementById('cooc-net-run')?.addEventListener('click', () => {
        buildCoocNetwork(parseInt(document.getElementById('cooc-net-min').value)||2);
    });
    document.getElementById('cooc-net-size')?.addEventListener('change', () => {
        if (window._patchCoocMatrix) buildCoocNetwork(parseInt(document.getElementById('cooc-net-min').value)||2);
    });
    document.getElementById('cooc-net-reset')?.addEventListener('click', () => {
        if (window._patchCoocMatrix) buildCoocNetwork(parseInt(document.getElementById('cooc-net-min').value)||2);
    });
    document.getElementById('cooc-net-spread')?.addEventListener('click', () => {
        if (typeof window._coocSpreadNodes === 'function') window._coocSpreadNodes();
        else if (window._patchCoocMatrix) buildCoocNetwork(parseInt(document.getElementById('cooc-net-min').value)||2);
    });
    // Também hookear quando a aba for aberta
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.tab === 'coocorrencia-section') setTimeout(_patchCoocExpose, 200);
        });
    });
});

window.copiarTopPares = function() {
    if (!window._coocTopPairs || !window._coocTopPairs.length) { alert('Nenhum par para copiar.'); return; }
    const dn = window._coocSpDisplayName || (sp=>sp);
    const text = window._coocTopPairs.map((p,i) => `${i+1}. ${dn(p.a)} + ${dn(p.b)}: ${p.n} co-ocorrência(s)`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Lista copiada para área de transferência!');
    }).catch(() => {
        prompt('Copie o texto abaixo:', text);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    function buildAndRun() {
        const raw = document.getElementById('cooc-data').value.trim();
        if (!raw) { alert('Insira levantamentos.'); return; }
        const minCooc = parseInt(document.getElementById('cooc-min').value)||2;
        const surveys = raw.split(/\n\s*\n/).map(block => new Set(block.split('\n').map(s=>s.replace(/^Levantamento[^:]*:/i,'').trim()).filter(Boolean)));
        const allSp = [...new Set(surveys.flatMap(s=>[...s]))].sort();
        if (allSp.length === 0) { alert('Nenhuma espécie detectada.'); return; }
        const matrix = {};
        allSp.forEach(a=>{ matrix[a]={}; allSp.forEach(b=>{ matrix[a][b]=0; }); });
        surveys.forEach(survey => {
            const spArr = [...survey];
            for (let i=0;i<spArr.length;i++) for(let j=i+1;j<spArr.length;j++) { matrix[spArr[i]][spArr[j]]++; matrix[spArr[j]][spArr[i]]++; }
        });
        _coocMatrix = matrix; _coocAllSp = allSp; _coocSurveys = surveys;
        runCooc(minCooc);
    }

    document.getElementById('cooc-run')?.addEventListener('click', buildAndRun);
    document.getElementById('cooc-rerun')?.addEventListener('click', () => {
        const minCooc = parseInt(document.getElementById('cooc-min').value)||2;
        if (!_coocAllSp.length) { buildAndRun(); return; }
        runCooc(minCooc);
    });
    // Also re-run when Enter pressed in min input
    document.getElementById('cooc-min')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); document.getElementById('cooc-rerun')?.click(); }
    });
});

// ==================== MODAL DE CORREÇÃO DE AVISTAMENTOS ====================
let _correcaoPendentes = [];

function showAvistaCorrecaoModal(unrecognizedEntries) {
    _correcaoPendentes = unrecognizedEntries.map(e => ({
        id: e.id, inputName: e.inputName, date: e.date,
        suggestedSci: e.suggestedSci || null, suggestedCommon: e.suggestedCommon || null
    }));
    renderCorrecaoLista();
    document.getElementById('avist-correcao-modal').style.display = 'block';
}

function renderCorrecaoLista() {
    const lista = document.getElementById('avist-correcao-lista');
    if (!lista) return;
    if (_correcaoPendentes.length === 0) {
        lista.innerHTML = '<p style="padding:20px; text-align:center; color:var(--green-base); font-weight:600; font-size:15px;">✅ Todos corrigidos!</p>';
        setTimeout(() => { document.getElementById('avist-correcao-modal').style.display = 'none'; }, 900);
        return;
    }
    // Header row
    lista.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1.1fr 1.4fr auto;gap:8px;padding:6px 4px 8px;border-bottom:2px solid var(--border);">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">Nome inserido</div>
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">Sugestão automática</div>
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">Corrija aqui</div>
        <div></div>
    </div>` +
    _correcaoPendentes.map((p, idx) => {
        const hasSugg = !!p.suggestedSci;
        const sciEsc    = hasSugg ? p.suggestedSci.replace(/\\/g,'\\\\').replace(/'/g,"\\'") : '';
        const commonEsc = hasSugg ? (p.suggestedCommon||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'") : '';
        const suggHtml = hasSugg
            ? `<div style="background:#fffbe6;border:1px solid #f0c040;border-radius:4px;padding:5px 8px;margin-bottom:4px;"><em style="font-size:12px;">${p.suggestedSci}</em>${p.suggestedCommon?`<br><small style="color:var(--text-muted);">${p.suggestedCommon}</small>`:''}</div>
               <button onclick="correcaoUsarSugestao(${idx})" style="background:#f0c040;color:#5a4000;border:none;border-radius:4px;padding:3px 10px;font-size:11px;cursor:pointer;font-weight:600;width:100%;">↖ Usar esta sugestão</button>`
            : `<span style="color:var(--text-muted);font-size:12px;font-style:italic;">Nenhuma sugestão encontrada</span>`;
        return `<div style="display:grid;grid-template-columns:1fr 1.1fr 1.4fr auto;gap:8px;align-items:center;padding:10px 4px;border-bottom:1px solid var(--border-light);">
            <div>
                <span style="color:#c0392b;font-weight:600;font-size:13px;background:#fde8d8;padding:3px 7px;border-radius:4px;display:inline-block;">${p.inputName}</span>
                ${p.date ? `<div style="font-size:10px;color:var(--text-muted);margin-top:3px;">📅 ${displayDateBR(p.date)}</div>` : ''}
            </div>
            <div>${suggHtml}</div>
            <div style="position:relative;">
                <input type="text" id="correcao-input-${idx}"
                    placeholder="Nome popular ou científico..."
                    style="width:100%;padding:8px 10px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13px;font-family:inherit;"
                    oninput="correcaoAutocomplete(this,${idx})" autocomplete="off">
                <div id="correcao-ac-${idx}" style="display:none;position:absolute;background:white;border:1px solid var(--border);border-radius:var(--radius-sm);max-height:160px;overflow-y:auto;z-index:5100;width:100%;box-shadow:var(--shadow-mid);top:100%;left:0;"></div>
            </div>
            <div style="display:flex;gap:5px;">
                <button onclick="correcaoConfirmar(${idx})" title="Confirmar" style="background:#27ae60;color:white;border:none;border-radius:var(--radius-sm);width:36px;height:36px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;">✓</button>
                <button onclick="correcaoRemover(${idx})" title="Remover"    style="background:#c0392b;color:white;border:none;border-radius:var(--radius-sm);width:36px;height:36px;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
            </div>
        </div>`;
    }).join('');
}

window.correcaoUsarSugestao = function(idx) {
    const p = _correcaoPendentes[idx];
    if (!p || !p.suggestedSci) return;
    const input = document.getElementById(`correcao-input-${idx}`);
    if (input) {
        input.value = p.suggestedSci;
        input.dataset.sci = p.suggestedSci;
        input.dataset.common = p.suggestedCommon || '';
        input.style.borderColor = 'var(--green-base)';
        const ac = document.getElementById(`correcao-ac-${idx}`);
        if (ac) ac.style.display = 'none';
    }
};

window.correcaoAutocomplete = function(input, idx) {
    const raw = input.value;
    const trimmed = raw.trim();
    const ac = document.getElementById(`correcao-ac-${idx}`);
    if (!ac) return;
    if (trimmed.length < 2) { ac.style.display = 'none'; return; }

    // Usa o mesmo motor fuzzy da busca principal (normalizeForSearch + fuzzySearchCandidates)
    // ambos expostos globalmente pelo módulo de importação
    let matches = [];
    if (typeof window.fuzzySearchCandidates === 'function' && typeof window.normalizeForSearch === 'function') {
        const norm = window.normalizeForSearch(trimmed);
        matches = window.fuzzySearchCandidates(norm, 12).map(item => item.data || item);
    } else {
        // Fallback robusto caso o motor principal ainda não esteja exposto
        function normFallback(s) {
            return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
        }
        const q = normFallback(trimmed);
        const tokens = q.split(' ').filter(t => t.length > 0);
        const db = typeof BIRD_DATABASE !== 'undefined' ? BIRD_DATABASE : [];
        const scored = [];
        for (const b of db) {
            const ns = normFallback(b.scientificName);
            const nc = normFallback(b.commonName || '');
            let score = 0;
            if (nc.startsWith(q) || ns.startsWith(q)) score = 100;
            else if (nc.includes(q) || ns.includes(q)) score = 80;
            else {
                if (!tokens.every(t => (nc + ' ' + ns).includes(t))) continue;
                score = tokens.filter(t => nc.startsWith(t) || ns.startsWith(t)).length * 10 + 30;
            }
            scored.push({ b, score });
        }
        scored.sort((a, b) => b.score - a.score);
        matches = scored.slice(0, 12).map(s => s.b);
    }

    if (!matches.length) { ac.style.display = 'none'; return; }

    ac.innerHTML = matches.map(b => {
        const sci     = b.scientificName || b.scientific || '';
        const common  = b.commonName     || b.common     || '';
        return `<div onclick="correcaoSelectSuggestion(${idx},'${sci.replace(/'/g,"\\'")}','${common.replace(/'/g,"\\'")}')"
             style="padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--border-light);font-size:13px;line-height:1.4;"
             onmouseover="this.style.background='var(--green-mist)'" onmouseout="this.style.background=''">
            <em style="color:var(--green-deep);">${sci}</em>
            ${common ? `<small style="color:var(--text-muted);margin-left:6px;">${common}</small>` : ''}
        </div>`;
    }).join('');
    ac.style.display = 'block';
};

window.correcaoSelectSuggestion = function(idx, sci, common) {
    const input = document.getElementById(`correcao-input-${idx}`);
    if (input) { input.value = sci; input.dataset.sci = sci; input.dataset.common = common; }
    const ac = document.getElementById(`correcao-ac-${idx}`);
    if (ac) ac.style.display = 'none';
};

window.correcaoConfirmar = function(idx) {
    const input = document.getElementById(`correcao-input-${idx}`);
    const val = input?.value.trim();
    if (!val) { if(input) input.style.borderColor='#c0392b'; return; }
    const sci    = input.dataset.sci    || val;
    const common = input.dataset.common || '';
    const pending = _correcaoPendentes[idx];
    const avEntry = AVISTAMENTOS.find(e => e.id === pending.id);
    if (avEntry) { avEntry.scientificName = sci; avEntry.commonName = common; }
    _correcaoPendentes.splice(idx, 1);
    buildAvistaTable();
    renderCorrecaoLista();
};

window.correcaoRemover = function(idx) {
    const pending = _correcaoPendentes[idx];
    const avIdx = AVISTAMENTOS.findIndex(e => e.id === pending.id);
    if (avIdx >= 0) AVISTAMENTOS.splice(avIdx, 1);
    _correcaoPendentes.splice(idx, 1);
    buildAvistaTable();
    renderCorrecaoLista();
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('avist-correcao-fechar')?.addEventListener('click', () => {
        if (_correcaoPendentes.length > 0) {
            const ok = confirm(`Tem certeza que deseja fechar? ${_correcaoPendentes.length} espécie(s) não corrigida(s) serão removidas dos avistamentos.`);
            if (!ok) return;
            _correcaoPendentes.forEach(p => {
                const i = AVISTAMENTOS.findIndex(e => e.id === p.id);
                if (i >= 0) AVISTAMENTOS.splice(i, 1);
            });
            _correcaoPendentes = [];
            buildAvistaTable();
        }
        document.getElementById('avist-correcao-modal').style.display = 'none';
    });

    document.getElementById('avist-correcao-confirmar-todos')?.addEventListener('click', () => {
        const total = _correcaoPendentes.length;
        for (let i = total - 1; i >= 0; i--) {
            const input = document.getElementById(`correcao-input-${i}`);
            if (input?.value.trim()) correcaoConfirmar(i);
        }
    });

    document.getElementById('avist-correcao-modal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('avist-correcao-modal')) {
            document.getElementById('avist-correcao-fechar')?.click();
        }
    });
});

// ==================== CÁLCULO DE AVISTAMENTOS ====================




/* ============================================================
   LOADING OVERLAY
   ============================================================ */
/* ═══════════════════════════════════════════════════
   LOADING OVERLAY — PAPAGAIO
   showParrot(fn, [label]) — mostra overlay, roda fn()
   via setTimeout para deixar o browser renderizar o
   overlay antes de travar no processamento pesado.
═══════════════════════════════════════════════════ */
(function() {
    const overlay = document.getElementById('parrot-loading-overlay');
    const labelEl = overlay ? overlay.querySelector('.parrot-label') : null;

    window.showParrot = function(fn, label) {
        if (!overlay) { fn(); return; }
        if (labelEl) labelEl.textContent = label || 'Calculando métricas…';
        overlay.classList.add('active');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    try { fn(); } catch(e) { console.error(e); }
                    overlay.classList.remove('active');
                }, 30);
            });
        });
    };

    /* Envolve um botão já existente para mostrar o overlay antes de disparar.
       Chamado APÓS o DOMContentLoaded, quando os listeners originais já existem. */
    function wrapBtn(id, label) {
        const btn = document.getElementById(id);
        if (!btn || btn._parrotWrapped) return;
        btn._parrotWrapped = true;
        btn.addEventListener('click', function(e) {
            if (e._parrotSkip) return;          // evita loop
            e.stopImmediatePropagation();
            e.preventDefault();
            if (labelEl) labelEl.textContent = label || 'Calculando métricas…';
            overlay.classList.add('active');
            requestAnimationFrame(() => requestAnimationFrame(() => {
                setTimeout(() => {
                    /* Dispara um evento marcado para não ser interceptado de novo */
                    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
                    ev._parrotSkip = true;
                    btn.dispatchEvent(ev);
                    // Remove overlay após o próximo frame pintado
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                        overlay.classList.remove('active');
                    }));
                }, 30);
            }));
        }, true); // capture para correr antes dos outros handlers
    }

    /* Hook para botões dinâmicos com classe .process-list-btn */
    document.addEventListener('click', function(e) {
        if (e._parrotSkip) return;
        const btn = e.target.closest('.process-list-btn');
        if (!btn) return;
        e.stopImmediatePropagation();
        e.preventDefault();
        if (labelEl) labelEl.textContent = 'Processando lista…';
        overlay.classList.add('active');
        requestAnimationFrame(() => requestAnimationFrame(() => {
            setTimeout(() => {
                const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
                ev._parrotSkip = true;
                btn.dispatchEvent(ev);
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    overlay.classList.remove('active');
                }));
            }, 30);
        }));
    }, true);

    /* Registra os wraps depois que todos os handlers já foram adicionados */
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const heavyBtns = [
                { id: 'avist-date-add',        label: 'Processando avistamentos…'   },
                { id: 'process-import',         label: 'Processando importação…'     },
                { id: 'curve-add-date',         label: 'Calculando curva…'           },
                { id: 'raref-run',              label: 'Calculando rarefação…'       },
                { id: 'raref-import-avist',     label: 'Importando amostras…'        },
                { id: 'turnover-run',           label: 'Calculando turnover…'        },
                { id: 'turnover-import-avist',  label: 'Importando períodos…'        },
                { id: 'rankabund-run',          label: 'Gerando curva…'              },
                { id: 'rankabund-import-avist', label: 'Importando abundâncias…'     },
                { id: 'cooc-run',               label: 'Calculando matriz…'          },
                { id: 'cooc-net-run',           label: 'Gerando rede…'               },
                { id: 'sazon-run',              label: 'Calculando sazonalidade…'    },
                { id: 'sazon-import-avist',     label: 'Importando registros…'       },
                { id: 'fenol-run',              label: 'Calculando fenologia…'       },
                { id: 'fenol-import-avist',     label: 'Importando datas…'           },
                { id: 'indicadoras-run',        label: 'Analisando indicadoras…'     },
                { id: 'cluster-run',            label: 'Gerando dendrograma…'        },
            ];
            heavyBtns.forEach(({ id, label }) => wrapBtn(id, label));
        }, 500); // espera 500ms para garantir que todos os addEventListener já rodaram
    });

    /* Picos de Horários — ao entrar na aba */
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.tab === 'picos-horarios-section') {
                btn.addEventListener('click', () => {
                    setTimeout(() => {
                        if (typeof buildPicosHorarios === 'function') {
                            window.showParrot(() => buildPicosHorarios(), 'Calculando picos de horários…');
                        }
                    }, 80);
                });
            }
        });
    });
})();


/* ============================================================
   PHOTO BG (HEADER)
   ============================================================ */
(function () {
    'use strict';

    const INDEX_URL = 'https://raw.githubusercontent.com/brennobenk/OrnitologiaSantaCatarina/main/photo_index.json';
    const CACHE_KEY = 'oasc_photo_index_v3';
    const CACHE_TTL = 3600 * 1000; // 1 hora

    let photoPool = [];
    let current   = null;

    /* Tenta carregar imagem percorrendo lista de URLs fallback */
    function tryLoadImage(urls, idx, onSuccess, onAllFail) {
        if (idx >= urls.length) { onAllFail(); return; }
        const img = new Image();
        img.onload  = function () { onSuccess(urls[idx], img); };
        img.onerror = function () { tryLoadImage(urls, idx + 1, onSuccess, onAllFail); };
        img.src = urls[idx];
    }

    function applyPhoto(photo) {
        if (!photo) return;
        current = photo;

        const header  = document.getElementById('main-header');
        const bg      = document.getElementById('hdr-bg');
        const overlay = document.getElementById('hdr-overlay');
        const credit  = document.getElementById('hdr-credit');
        const shuffle = document.getElementById('hdr-shuffle');
        const link    = document.getElementById('hdr-credit-link');
        const bird    = document.getElementById('hdr-cr-bird');
        const author  = document.getElementById('hdr-cr-author');

        bg.classList.remove('hdr-visible');
        overlay.classList.remove('hdr-visible');
        credit.classList.remove('hdr-visible');

        // Lista de fallbacks: usa photo.urls se disponível, senão [photo.url]
        const urls = Array.isArray(photo.urls) && photo.urls.length ? photo.urls : [photo.url];

        tryLoadImage(urls, 0,
            function (urlOk) {
                bg.style.backgroundImage = 'url("' + urlOk + '")';
                requestAnimationFrame(function () {
                    setTimeout(function () {
                        bg.classList.add('hdr-visible');
                        overlay.classList.add('hdr-visible');
                        credit.classList.add('hdr-visible');
                    }, 30);
                });
            },
            function () {
                // Todas as URLs falharam — tenta outra foto do pool
                console.warn('[FotoBG] Todas as URLs falharam para:', photo.especie);
                var next = pickRandom(photo);
                if (next) applyPhoto(next);
            }
        );

        const nomePrincipal = photo.especie || photo.cientifico || '?';
        const nomeExtra     = (photo.cientifico && photo.especie)
                              ? ' (' + photo.cientifico + ')' : '';
        bird.textContent   = nomePrincipal + nomeExtra;
        author.textContent = photo.author;
        link.href          = photo.wikiaves || '#';
        header.classList.add('hdr-has-photo');
        shuffle.classList.add('hdr-visible');
    }

    function pickRandom(excluir) {
        if (!photoPool.length) return null;
        if (photoPool.length === 1) return photoPool[0];
        var c = excluir ? photoPool.filter(function(p){ return p.url !== excluir.url; }) : photoPool;
        if (!c.length) c = photoPool;
        return c[Math.floor(Math.random() * c.length)];
    }

    window.hdrShuffle = function (e) {
        if (e) e.stopPropagation();
        var next = pickRandom(current);
        if (next) applyPhoto(next);
    };

    window.hdrLbClose = function () {
        document.getElementById('hdr-lightbox').classList.remove('lb-open');
    };

    function hdrLbOpen() {
        if (!current) return;
        var lb  = document.getElementById('hdr-lightbox');
        var img = document.getElementById('hdr-lb-img');
        var cap = document.getElementById('hdr-lb-cap');
        // Lightbox usa a URL que carregou com sucesso (bg.style.backgroundImage)
        var bg = document.getElementById('hdr-bg');
        var bgUrl = bg.style.backgroundImage.replace(/url\(["']?|["']?\)$/g, '');
        img.src = bgUrl || current.url;
        img.alt = current.especie || '';
        var nomePrincipal = current.especie || current.cientifico || '?';
        var nomeExtra = (current.cientifico && current.especie)
            ? '<em style="opacity:.72"> &middot; ' + current.cientifico + '</em>' : '';
        cap.innerHTML = '<strong>' + nomePrincipal + '</strong>' + nomeExtra
            + ' &nbsp;&middot;&nbsp; '
            + '<a href="' + (current.wikiaves || '#') + '" target="_blank" rel="noopener">'
            + '&#128247; ' + current.author + '</a>';
        lb.classList.add('lb-open');
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('main-header').addEventListener('click', function (e) {
            if (!current) return;
            if (e.target.closest('button,a,input,select,.tab-btn,.tab-btn-primary,#hdr-shuffle,#hdr-credit')) return;
            hdrLbOpen();
        });
        document.getElementById('hdr-lightbox').addEventListener('click', function (e) {
            if (e.target === this) hdrLbClose();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') hdrLbClose();
        });
    });

    function parseIndex(data) {
        var pool = [];
        Object.keys(data).forEach(function (author) {
            var info    = data[author];
            var wikiaves = info.wikiaves || '#';
            var fotos   = Array.isArray(info.fotos) ? info.fotos : [];
            fotos.forEach(function (foto) {
                if (!foto.url && (!foto.urls || !foto.urls.length)) return;
                pool.push({
                    url       : foto.url || foto.urls[0],
                    urls      : foto.urls || [foto.url],
                    especie   : foto.especie   || '',
                    cientifico: foto.cientifico || '',
                    author    : author,
                    wikiaves  : wikiaves
                });
            });
        });
        return pool;
    }

    function getCache() {
        try {
            var raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var obj = JSON.parse(raw);
            if (Date.now() - obj.ts > CACHE_TTL) return null;
            return obj.pool;
        } catch (e) { return null; }
    }
    function setCache(pool) {
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), pool: pool })); } catch (e) {}
    }

    async function init() {
        // Limpa cache antigo de versões anteriores
        ['oasc_photo_index_v1','oasc_photo_index_v2','oasc_photo_pool_v1'].forEach(function(k){
            try { sessionStorage.removeItem(k); } catch(e) {}
        });

        var cached = getCache();
        if (cached && cached.length) {
            photoPool = cached;
            applyPhoto(pickRandom());
            return;
        }
        try {
            var resp = await fetch(INDEX_URL, { cache: 'no-store' });
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            var data = await resp.json();
            photoPool = parseIndex(data);
            if (!photoPool.length) { console.info('[FotoBG] photo_index.json sem fotos.'); return; }
            setCache(photoPool);
            console.info('[FotoBG] ' + photoPool.length + ' foto(s) carregadas de ' + Object.keys(data).length + ' fotografo(s).');
            applyPhoto(pickRandom());
        } catch (err) {
            console.warn('[FotoBG] Nao foi possivel carregar photo_index.json:', err.message);
        }
    }

    init();
})();




// ==================== DARWIN CORE ====================
(function () {
    'use strict';

    function buildDarwinCore() {
        const data = (typeof collectTableData === 'function') ? collectTableData() : [];
        if (!data || data.length === 0) {
            document.getElementById('darwincore-result').innerHTML =
                '<p style="color:var(--text-muted);padding:14px;">Nenhuma espécie importada. Vá até a aba 📥 Importação primeiro.</p>';
            document.getElementById('darwincore-copy').style.display = 'none';
            document.getElementById('darwincore-csv').style.display = 'none';
            return;
        }

        const db = (typeof BIRD_DATABASE !== 'undefined') ? BIRD_DATABASE : [];

        const rows = data.map(item => {
            const sci = (item.generoEspecie || '').trim();
            const parts = sci.split(' ');
            const genus = parts[0] || '';
            const specificEpithet = parts[1] || '';
            const infraspecificEpithet = parts.slice(2).join(' ') || '';

            // Taxonomia da tabela ou fallback do banco
            let order = (item.ordem || '').trim();
            let family = (item.familia || '').trim();
            let klass = (item.classe || 'Aves').trim() || 'Aves';
            let phylum = (item.filo || 'Chordata').trim() || 'Chordata';

            // Fallback no BIRD_DATABASE
            if ((!order || !family) && genus) {
                const match = db.find(b => b.scientificName && b.scientificName.startsWith(genus));
                if (match) {
                    if (!order) order = match.order || match.ordem || '';
                    if (!family) family = match.family || match.familia || '';
                }
            }

            // Nome popular
            let vernacular = '';
            const dbMatch = db.find(b => b.scientificName && b.scientificName.trim().toLowerCase() === sci.toLowerCase());
            if (dbMatch) {
                vernacular = dbMatch.commonName || dbMatch.nomePopular || '';
            }

            const taxonRank = infraspecificEpithet ? 'subespécie' : 'espécie';

            return {
                kingdom: 'Animalia',
                phylum: phylum || 'Chordata',
                class: klass || 'Aves',
                order: order,
                family: family,
                genus: genus,
                specificEpithet: specificEpithet,
                infraspecificEpithet: infraspecificEpithet,
                identificationQualifier: '',
                scientificName: sci,
                vernacularName: vernacular,
                taxonRank: taxonRank
            };
        });

        const cols = [
            { key: 'kingdom',                label: 'kingdom' },
            { key: 'phylum',                 label: 'phylum' },
            { key: 'class',                  label: 'class' },
            { key: 'order',                  label: 'order' },
            { key: 'family',                 label: 'family' },
            { key: 'genus',                  label: 'genus' },
            { key: 'specificEpithet',        label: 'specificEpithet' },
            { key: 'infraspecificEpithet',   label: 'infraspecificEpithet' },
            { key: 'identificationQualifier',label: 'identificationQualifier' },
            { key: 'scientificName',         label: 'scientificName' },
            { key: 'vernacularName',         label: 'vernacularName' },
            { key: 'taxonRank',              label: 'taxonRank' }
        ];

        const headerHtml = cols.map(c =>
            `<th style="background:var(--green-mid);color:white;padding:8px 12px;white-space:nowrap;font-size:12px;">${c.label}</th>`
        ).join('');

        const bodyHtml = rows.map(r =>
            `<tr>${cols.map(c => `<td style="padding:6px 12px;border-bottom:1px solid var(--border-light);font-size:12.5px;white-space:nowrap;">${r[c.key] || ''}</td>`).join('')}</tr>`
        ).join('');

        const tableHtml = `
            <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">
                ${rows.length} registro${rows.length !== 1 ? 's' : ''} · padrão Darwin Core (Wieczorek et al. 2012)
            </p>
            <div style="overflow-x:auto;max-height:500px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius-sm);">
                <table id="darwincore-table" style="width:100%;border-collapse:collapse;">
                    <thead><tr>${headerHtml}</tr></thead>
                    <tbody>${bodyHtml}</tbody>
                </table>
            </div>`;

        document.getElementById('darwincore-result').innerHTML = tableHtml;
        document.getElementById('darwincore-copy').style.display = '';
        document.getElementById('darwincore-csv').style.display = '';

        // Store rows for export
        window._darwinCoreRows = rows;
        window._darwinCoreCols = cols;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const genBtn = document.getElementById('darwincore-generate');
        const copyBtn = document.getElementById('darwincore-copy');
        const csvBtn = document.getElementById('darwincore-csv');

        if (genBtn) genBtn.addEventListener('click', buildDarwinCore);

        if (copyBtn) copyBtn.addEventListener('click', () => {
            if (!window._darwinCoreRows) return;
            const cols = window._darwinCoreCols;
            const rows = window._darwinCoreRows;
            const header = cols.map(c => c.label).join('\t');
            const body = rows.map(r => cols.map(c => r[c.key] || '').join('\t')).join('\n');
            const text = header + '\n' + body;
            navigator.clipboard.writeText(text).then(() => alert('Tabela Darwin Core copiada!')).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = text; document.body.appendChild(ta); ta.select();
                document.execCommand('copy'); ta.remove(); alert('Tabela Darwin Core copiada!');
            });
        });

        if (csvBtn) csvBtn.addEventListener('click', () => {
            if (!window._darwinCoreRows) return;
            const cols = window._darwinCoreCols;
            const rows = window._darwinCoreRows;
            const header = cols.map(c => c.label).join(',');
            const body = rows.map(r => cols.map(c => `"${(r[c.key] || '').replace(/"/g, '""')}"`).join(',')).join('\n');
            const csv = header + '\n' + body;
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'darwin_core.csv';
            document.body.appendChild(a); a.click();
            document.body.removeChild(a); URL.revokeObjectURL(url);
        });

        // Auto-generate when tab is clicked
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.tab === 'darwincore-section') {
                btn.addEventListener('click', () => setTimeout(buildDarwinCore, 120));
            }
        });
    });
})();
// ==================== FIM DARWIN CORE ====================
