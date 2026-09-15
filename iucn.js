/* ============================================================
   IUCN.JS — STATUS GLOBAL DE CONSERVAÇÃO (IUCN RED LIST)
   ------------------------------------------------------------
   A Portaria MMA nº 1.704/2026 é norma brasileira e não contém
   nenhum dado da IUCN: as duas listas usam os mesmos critérios,
   mas avaliam escalas diferentes (nacional x global) e divergem
   com frequência. Penelope superciliaris, por exemplo, é LC no
   ICMBio e NT na IUCN.

   Este módulo busca a categoria global espécie a espécie na API
   pública do GBIF, que espelha a Red List oficial e é atualizada
   a cada nova versão. Não precisa de chave de acesso.

       1. /v1/species/match          -> resolve o nome no backbone
       2. /v1/species/{key}/iucnRedListCategory -> categoria

   O resultado fica em cache no navegador. Quando a varredura
   termina, o botão "Exportar" gera um arquivo IUCN_TABELA.js que
   pode ser commitado no repositório — a partir daí o site carrega
   os status na hora, sem depender da rede.

   INSTALAÇÃO: carregar por último
       <script src="cbro.js"></script>
       <script src="main.js"></script>
       <script src="sinonimos.js"></script>
       <script src="iucn.js"></script>

   Se existir um IUCN_TABELA.js commitado, carregue-o antes deste
   arquivo; os valores dele têm prioridade sobre o cache local.
   ============================================================ */
(function () {
    'use strict';

    const CACHE_KEY   = 'iucn_cache_v2';
    const ENDPOINT    = 'https://api.gbif.org/v1';
    const CONCORRENCIA = 6;
    const VALIDAS = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'DD', 'NE'];

    let cache = {};
    let rodando = false;
    let abortar = false;

    /* ---------------------------------------------- cache local */
    function lerCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (raw) cache = JSON.parse(raw) || {};
        } catch (e) { cache = {}; }
        // Uma tabela commitada no repositório sempre vence o cache
        if (window.IUCN_TABELA) Object.assign(cache, window.IUCN_TABELA);
    }
    function gravarCache() {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) {}
    }

    /* ------------------------------------- aplicar em toda a base */
    function aplicar(nome, codigo) {
        if (!codigo || VALIDAS.indexOf(codigo) === -1) return false;
        let mudou = false;
        const info = window.speciesInfo && window.speciesInfo[nome];
        if (info) { info.iucn = codigo; mudou = true; }
        const cd = window.CBRO_DATA;
        if (cd) {
            const e = cd._idxEsp && cd._idxEsp[nome];
            if (e) e.iucn = codigo;
            const c = cd._idxCons && cd._idxCons[nome];
            if (c) c.iucn = codigo;
        }
        return mudou;
    }

    function indexar() {
        const cd = window.CBRO_DATA;
        if (!cd || cd._idxEsp) return;
        cd._idxEsp = {}; cd._idxCons = {};
        cd.especies.forEach(function (e) { cd._idxEsp[e.especie] = e; });
        cd.conservationData.forEach(function (c) { cd._idxCons[c.especie] = c; });
    }

    function aplicarCacheInteiro() {
        indexar();
        let n = 0;
        Object.keys(cache).forEach(function (nome) {
            if (aplicar(nome, cache[nome])) n++;
        });
        return n;
    }

    /* -------------------------------------------- consulta GBIF */
    async function buscarUm(nome) {
        const m = await fetch(ENDPOINT + '/species/match?kingdom=Animalia&class=Aves&name=' +
                              encodeURIComponent(nome));
        if (!m.ok) throw new Error('match ' + m.status);
        const mj = await m.json();
        if (!mj.usageKey) return { nome: nome, codigo: null, motivo: 'sem correspondência no GBIF' };

        const r = await fetch(ENDPOINT + '/species/' + mj.usageKey + '/iucnRedListCategory');
        if (r.status === 404) return { nome: nome, codigo: null, motivo: 'sem avaliação IUCN' };
        if (!r.ok) throw new Error('iucn ' + r.status);
        const rj = await r.json();
        const cod = (rj.code || '').toUpperCase();
        return {
            nome: nome,
            codigo: VALIDAS.indexOf(cod) >= 0 ? cod : null,
            motivo: cod ? '' : 'categoria não reconhecida',
            nomeGbif: mj.scientificName || '',
            divergeNome: mj.canonicalName && mj.canonicalName !== nome ? mj.canonicalName : ''
        };
    }

    /* ------------------------------------------ varredura completa */
    async function varrer(aoProgredir) {
        if (rodando) return;
        rodando = true; abortar = false;
        indexar();

        const pendentes = window.CBRO_DATA.especies
            .filter(function (e) { return !cache[e.especie]; })
            .map(function (e) { return e.especie; });

        const total = pendentes.length;
        let feitos = 0, ok = 0, falhas = [];
        const fila = pendentes.slice();

        async function worker() {
            while (fila.length && !abortar) {
                const nome = fila.shift();
                try {
                    const r = await buscarUm(nome);
                    if (r.codigo) {
                        cache[nome] = r.codigo;
                        aplicar(nome, r.codigo);
                        ok++;
                    } else {
                        falhas.push({ nome: nome, motivo: r.motivo });
                    }
                } catch (err) {
                    falhas.push({ nome: nome, motivo: String(err.message || err) });
                    await new Promise(function (r) { setTimeout(r, 400); });
                }
                feitos++;
                if (feitos % 15 === 0) gravarCache();
                if (aoProgredir) aoProgredir(feitos, total, ok, falhas.length);
            }
        }

        const workers = [];
        for (let i = 0; i < CONCORRENCIA; i++) workers.push(worker());
        await Promise.all(workers);

        gravarCache();
        rodando = false;
        return { total: total, ok: ok, falhas: falhas };
    }

    /* --------------------------------------------- exportar tabela */
    function exportar() {
        const nomes = Object.keys(cache).sort();
        let txt = '/* IUCN_TABELA.js — status global da IUCN Red List\n' +
                  '   Gerado em ' + new Date().toISOString().slice(0, 10) +
                  ' a partir da API do GBIF, que espelha a Red List oficial.\n' +
                  '   ' + nomes.length + ' espécies.\n' +
                  '   Carregar ANTES de iucn.js para dispensar a consulta em rede. */\n' +
                  'window.IUCN_TABELA = {\n';
        nomes.forEach(function (n) {
            txt += '    "' + n.replace(/"/g, '\\"') + '": "' + cache[n] + '",\n';
        });
        txt += '};\n';

        const blob = new Blob([txt], { type: 'text/javascript;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'IUCN_TABELA.js';
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }

    function cobertura() {
        const esp = (window.CBRO_DATA && window.CBRO_DATA.especies) || [];
        const com = esp.filter(function (e) { return e.iucn && e.iucn !== 'NE'; }).length;
        return { com: com, total: esp.length };
    }

    /* ------------------------------------------------------ painel */
    function montarPainel() {
        const box = document.createElement('div');
        box.id = 'iucn-panel';
        box.innerHTML =
            '<div class="iucn-head">🌎 Status IUCN <button class="iucn-x" title="Fechar">✕</button></div>' +
            '<div class="iucn-body">' +
            '  <p class="iucn-cov"></p>' +
            '  <div class="iucn-bar"><i></i></div>' +
            '  <p class="iucn-log">Busca na API pública do GBIF, que espelha a Red List. Pode levar alguns minutos; o resultado fica salvo neste navegador.</p>' +
            '  <div class="iucn-btns">' +
            '    <button class="iucn-go">Completar status IUCN</button>' +
            '    <button class="iucn-stop" disabled>Parar</button>' +
            '    <button class="iucn-exp">Exportar tabela</button>' +
            '  </div>' +
            '</div>';
        document.body.appendChild(box);

        const cov  = box.querySelector('.iucn-cov');
        const bar  = box.querySelector('.iucn-bar i');
        const log  = box.querySelector('.iucn-log');
        const go   = box.querySelector('.iucn-go');
        const stop = box.querySelector('.iucn-stop');

        function atualizarCobertura() {
            const c = cobertura();
            cov.innerHTML = '<strong>' + c.com.toLocaleString('pt-BR') + '</strong> de ' +
                            c.total.toLocaleString('pt-BR') + ' espécies com status global (' +
                            Math.round(c.com / c.total * 100) + '%)';
            bar.style.width = (c.com / c.total * 100) + '%';
        }
        atualizarCobertura();

        box.querySelector('.iucn-x').onclick = function () { box.classList.add('iucn-min'); };
        box.querySelector('.iucn-head').onclick = function (e) {
            if (e.target.className !== 'iucn-x') box.classList.remove('iucn-min');
        };

        go.onclick = async function () {
            go.disabled = true; stop.disabled = false;
            const r = await varrer(function (feitos, total, ok, falhas) {
                log.textContent = feitos + ' de ' + total + ' consultadas · ' +
                                  ok + ' resolvidas · ' + falhas + ' sem status';
                atualizarCobertura();
            });
            go.disabled = false; stop.disabled = true;
            atualizarCobertura();
            if (r) {
                log.textContent = 'Concluído: ' + r.ok + ' status obtidos, ' +
                                  r.falhas.length + ' sem avaliação na Red List. ' +
                                  'Use "Exportar tabela" e commite o arquivo no repositório.';
                window.IUCN_FALHAS = r.falhas;
                if (typeof renderConservationTableFromInput === 'function') {
                    try { renderConservationTableFromInput(); } catch (e) {}
                }
            }
        };
        stop.onclick = function () { abortar = true; log.textContent = 'Interrompido.'; };
        box.querySelector('.iucn-exp').onclick = exportar;
    }

    function estilo() {
        const css = document.createElement('style');
        css.textContent = [
            '#iucn-panel{position:fixed;left:18px;bottom:18px;z-index:4000;width:320px;',
            'background:#fff;border:1px solid #d7e0d7;border-radius:12px;',
            'box-shadow:0 8px 28px rgba(0,0,0,.16);font-family:inherit;font-size:13px;overflow:hidden}',
            '#iucn-panel .iucn-head{background:#2d5a3d;color:#fff;padding:9px 12px;font-weight:700;cursor:pointer;display:flex;justify-content:space-between;align-items:center}',
            '#iucn-panel .iucn-x{background:transparent;border:0;color:#cfe3d5;font-size:13px;cursor:pointer;padding:0 2px}',
            '#iucn-panel .iucn-body{padding:12px}',
            '#iucn-panel.iucn-min .iucn-body{display:none}',
            '#iucn-panel .iucn-cov{margin:0 0 8px;color:#2c3e50}',
            '#iucn-panel .iucn-bar{height:7px;background:#e8efe8;border-radius:4px;overflow:hidden;margin-bottom:9px}',
            '#iucn-panel .iucn-bar i{display:block;height:100%;background:#27ae60;width:0;transition:width .3s}',
            '#iucn-panel .iucn-log{margin:0 0 10px;font-size:11.5px;color:#7a8a7a;line-height:1.45}',
            '#iucn-panel .iucn-btns{display:flex;gap:6px;flex-wrap:wrap}',
            '#iucn-panel button{border:1px solid #bcd0bc;background:#f3f8f3;border-radius:7px;',
            'padding:5px 10px;font-size:12px;cursor:pointer;color:#2d5a3d;font-weight:600}',
            '#iucn-panel button:disabled{opacity:.45;cursor:default}',
            '#iucn-panel .iucn-go{background:#2d5a3d;color:#fff;border-color:#2d5a3d}',
            '@media(max-width:640px){#iucn-panel{left:10px;right:10px;width:auto}}'
        ].join('');
        document.head.appendChild(css);
    }

    /* -------------------------------------------------------- init */
    function iniciar() {
        lerCache();
        const n = aplicarCacheInteiro();
        estilo();
        montarPainel();
        if (n) console.log('[iucn.js] ' + n + ' status aplicados do cache/tabela local.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(iniciar, 600); });
    } else {
        setTimeout(iniciar, 600);
    }

    window.IUCN = {
        varrer: varrer, exportar: exportar, cobertura: cobertura,
        cache: function () { return cache; },
        limpar: function () { cache = {}; gravarCache(); }
    };
})();
