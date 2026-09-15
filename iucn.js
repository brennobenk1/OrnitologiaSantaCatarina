/* ============================================================
   IUCN.JS — APLICA O STATUS GLOBAL DA IUCN RED LIST
   ------------------------------------------------------------
   As categorias ficam em IUCN_TABELA.js, já auditado e commitado
   no repositório. Este arquivo só as injeta na base em memória:
   não faz requisição de rede, não desenha nada na tela e não
   pede nada ao usuário.

   A atualização, quando sair uma versão nova da Red List, é feita
   pelo console do navegador — ver o bloco no fim deste arquivo.

   CARREGAR nesta ordem:
       <script src="cbro.js"></script>
       <script src="main.js"></script>
       <script src="sinonimos.js"></script>
       <script src="IUCN_TABELA.js"></script>
       <script src="iucn.js"></script>
   ============================================================ */
(function () {
    'use strict';

    // 'NE' não é categoria: é ausência de avaliação. Gravar NE apagaria
    // um status já conhecido, então nunca entra.
    const VALIDAS = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'DD'];
    const ENDPOINT = 'https://api.gbif.org/v1';

    function indexar() {
        const cd = window.CBRO_DATA;
        if (!cd || cd._idxEsp) return cd;
        cd._idxEsp = {}; cd._idxCons = {};
        cd.especies.forEach(function (e) { cd._idxEsp[e.especie] = e; });
        cd.conservationData.forEach(function (c) { cd._idxCons[c.especie] = c; });
        return cd;
    }

    function aplicar(nome, codigo) {
        if (VALIDAS.indexOf(codigo) === -1) return false;
        const cd = window.CBRO_DATA;
        let tocou = false;
        const info = window.speciesInfo && window.speciesInfo[nome];
        if (info) { info.iucn = codigo; tocou = true; }
        if (cd) {
            if (cd._idxEsp[nome])  { cd._idxEsp[nome].iucn  = codigo; tocou = true; }
            if (cd._idxCons[nome]) { cd._idxCons[nome].iucn = codigo; tocou = true; }
        }
        return tocou;
    }

    // Faxina de versoes antigas: o iucn.js anterior desenhava um painel na tela
    // e guardava um cache no navegador. Se sobrou algum, some com ele.
    (function limpezaVersaoAntiga() {
        try {
            const velho = document.getElementById('iucn-panel');
            if (velho) velho.remove();
            localStorage.removeItem('iucn_cache_v1');
            localStorage.removeItem('iucn_cache_v2');
        } catch (e) { /* sem DOM ou sem storage: nada a limpar */ }
    })();

    function instalar() {
        if (!window.CBRO_DATA || !window.speciesInfo) return false;
        try {
            const velho = document.getElementById('iucn-panel');
            if (velho) velho.remove();
        } catch (e) {}
        indexar();
        const tab = window.IUCN_TABELA || {};
        let n = 0;
        Object.keys(tab).forEach(function (nome) { if (aplicar(nome, tab[nome])) n++; });

        const esp = window.CBRO_DATA.especies;
        const com = esp.filter(function (e) { return VALIDAS.indexOf(e.iucn) >= 0; }).length;
        window.IUCN_COBERTURA = { com: com, total: esp.length, aplicados: n };
        console.log('[iucn.js] ' + com + '/' + esp.length + ' especies com status global da IUCN.');
        return true;
    }

    if (!instalar()) {
        let tentativas = 0;
        const t = setInterval(function () {
            if (instalar() || ++tentativas > 60) clearInterval(t);
        }, 100);
    }

    /* ------------------------------------------------------------
       ATUALIZACAO DA TABELA — uso pelo console, nao pela interface

       Quando sair uma versao nova da Red List:

           await IUCN.varrer()      busca no GBIF so as especies que
                                    ainda nao tem categoria
           IUCN.exportar()          baixa o IUCN_TABELA.js atualizado

       Confira o diff antes de commitar: divergencias costumam ser
       nomes que o CBRO separou e o BirdLife ainda agrupa.
       ------------------------------------------------------------ */

    // Nomes alternativos: a Red List conhece Aburria jacutinga como
    // Pipile jacutinga, e Ardea ibis como Bubulcus ibis.
    function alternativas(nome) {
        const out = [];
        const S = window.SinonimosAves;
        if (S && S.grupos) {
            S.grupos.forEach(function (g) {
                if (g.aceito === nome) out.push.apply(out, g.sin);
                else if (g.sin && g.sin.indexOf(nome) >= 0) out.push(g.aceito);
            });
        }
        const info = window.speciesInfo && window.speciesInfo[nome];
        if (info && info.nomeCBRO) out.push(info.nomeCBRO);
        return out.filter(function (v, i, a) { return v && a.indexOf(v) === i; });
    }

    async function consultar(nome) {
        const m = await fetch(ENDPOINT + '/species/match?kingdom=Animalia&class=Aves&name=' +
                              encodeURIComponent(nome));
        if (!m.ok) throw new Error('match ' + m.status);
        const mj = await m.json();
        if (!mj.usageKey) return null;
        const r = await fetch(ENDPOINT + '/species/' + mj.usageKey + '/iucnRedListCategory');
        if (r.status === 404) return null;
        if (!r.ok) throw new Error('iucn ' + r.status);
        const cod = ((await r.json()).code || '').toUpperCase();
        return VALIDAS.indexOf(cod) >= 0 ? cod : null;
    }

    async function varrer() {
        indexar();
        const tab = window.IUCN_TABELA = window.IUCN_TABELA || {};
        const fila = window.CBRO_DATA.especies
            .filter(function (e) { return VALIDAS.indexOf(e.iucn) === -1 && !tab[e.especie]; })
            .map(function (e) { return e.especie; });

        const total = fila.length, semStatus = [], viaSinonimo = [];
        let feitos = 0, ok = 0;
        console.log('[iucn.js] consultando ' + total + ' especies no GBIF...');

        async function worker() {
            while (fila.length) {
                const nome = fila.shift();
                try {
                    let cod = await consultar(nome), via = '';
                    if (!cod) {
                        const alts = alternativas(nome);
                        for (let i = 0; i < alts.length && !cod; i++) {
                            try { cod = await consultar(alts[i]); if (cod) via = alts[i]; }
                            catch (e) { /* tenta a proxima */ }
                        }
                    }
                    if (cod) {
                        tab[nome] = cod; aplicar(nome, cod); ok++;
                        if (via) viaSinonimo.push(nome + ' via ' + via);
                    } else {
                        semStatus.push(nome);
                    }
                } catch (err) {
                    semStatus.push(nome + ' (erro: ' + (err.message || err) + ')');
                    await new Promise(function (r) { setTimeout(r, 400); });
                }
                if (++feitos % 50 === 0) console.log('  ' + feitos + '/' + total);
            }
        }
        const ws = []; for (let i = 0; i < 6; i++) ws.push(worker());
        await Promise.all(ws);

        console.log('[iucn.js] ' + ok + ' resolvidas (' + viaSinonimo.length +
                    ' via nome antigo), ' + semStatus.length + ' sem avaliacao global.');
        return { ok: ok, semStatus: semStatus, viaSinonimo: viaSinonimo };
    }

    function exportar() {
        const tab = window.IUCN_TABELA || {};
        const nomes = Object.keys(tab).filter(function (n) {
            return VALIDAS.indexOf(tab[n]) >= 0;
        }).sort();
        let txt = '/* IUCN_TABELA.js — status global da IUCN Red List\n' +
                  '   ' + nomes.length + ' especies · gerado em ' +
                  new Date().toISOString().slice(0, 10) + '\n' +
                  '   Fonte: API publica do GBIF, que espelha a Red List oficial.\n' +
                  '   Carregar ANTES de iucn.js. */\n' +
                  'window.IUCN_TABELA = {\n';
        nomes.forEach(function (n) { txt += '    "' + n + '": "' + tab[n] + '",\n'; });
        txt += '};\n';
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([txt], { type: 'text/javascript;charset=utf-8' }));
        a.download = 'IUCN_TABELA.js';
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
        console.log('[iucn.js] ' + nomes.length + ' especies exportadas.');
    }

    window.IUCN = {
        varrer: varrer,
        exportar: exportar,
        cobertura: function () { return window.IUCN_COBERTURA; },
        aplicar: aplicar
    };
})();
