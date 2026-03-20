/* ==========================================
   CNXM Global Product Search — Inline Navbar
   Supports: zh, en, ja, ru, pt
   ========================================== */

(function () {
    'use strict';

    let allProducts = [];
    let productsLoaded = false;
    let activeIdx = -1;

    const searchI18n = {
        en: { placeholder: 'Search products...', btn: 'Search', noResult: 'No products found', found: 'results found' },
        zh: { placeholder: '搜索产品...', btn: '搜索', noResult: '未找到相关产品', found: '个结果' },
        ja: { placeholder: '製品を検索...', btn: '検索', noResult: '製品が見つかりません', found: '件の結果' },
        ru: { placeholder: 'Поиск продуктов...', btn: 'Поиск', noResult: 'Продукты не найдены', found: 'результатов' },
        pt: { placeholder: 'Pesquisar produtos...', btn: 'Pesquisar', noResult: 'Nenhum produto encontrado', found: 'resultados' },
    };

    function getLang() {
        return (window.i18n && window.i18n.currentLang()) || localStorage.getItem('preferred_language') || 'en';
    }
    function st(k) { return (searchI18n[getLang()] || searchI18n.en)[k]; }

    async function loadProducts() {
        if (productsLoaded) return;
        try {
            const res = await fetch('data/products.json');
            const data = await res.json();
            allProducts = [];
            Object.entries(data).forEach(([catKey, cat]) => {
                (cat.products || []).forEach(p => {
                    allProducts.push({ catKey, catName: cat.name, name: p.name, file: p.file, index: p.index });
                });
            });
            productsLoaded = true;
        } catch (e) { console.error('Search: load failed', e); }
    }

    function doSearch(query) {
        if (!query || !query.trim()) return [];
        const q = query.trim().toLowerCase();
        return allProducts.filter(p =>
            Object.values(p.name).some(v => v && v.toLowerCase().includes(q))
        ).slice(0, 20);
    }

    function localName(obj) {
        const l = getLang();
        return obj[l] || obj.en || obj.zh || Object.values(obj)[0] || '';
    }

    // ── Dropdown ───────────────────────────────────────────────────
    function showDropdown(results, query) {
        const dropdown = document.getElementById('searchDropdown');
        if (!dropdown) return;
        activeIdx = -1;
        dropdown.innerHTML = '';

        if (results.length === 0) {
            dropdown.innerHTML = `
                <div class="sdd-header">
                    <span class="sdd-header-info">0 ${st('found')}</span>
                    <button class="sdd-close-btn" id="sddCloseBtn"><i class="fas fa-times"></i></button>
                </div>
                <div class="sdd-no-result"><i class="fas fa-search"></i>${st('noResult')}</div>`;
            dropdown.classList.add('open');
            bindCloseBtn();
            return;
        }

        const q = query.trim();
        const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

        const header = document.createElement('div');
        header.className = 'sdd-header';
        header.innerHTML = `
            <span class="sdd-header-info"><strong>${results.length}</strong> ${st('found')}</span>
            <button class="sdd-close-btn" id="sddCloseBtn"><i class="fas fa-times"></i></button>`;
        dropdown.appendChild(header);

        const list = document.createElement('div');
        list.className = 'sdd-list';
        list.id = 'sddList';

        results.forEach((p, i) => {
            const name = localName(p.name);
            const catName = localName(p.catName);
            const img = p.file ? 'images/' + p.file : '';
            const hl = name.replace(re, '<mark>$1</mark>');

            const item = document.createElement('div');
            item.className = 'sdd-item';
            item.dataset.idx = i;
            item.innerHTML = `
                <div class="sdd-img">
                    <img src="${img}" alt="${name}" loading="lazy" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-image\\' style=\\'color:var(--border-color)\\'></i>'">
                </div>
                <div class="sdd-text">
                    <div class="sdd-name">${hl}</div>
                    <div class="sdd-cat"><i class="fas fa-tag"></i>${catName}</div>
                </div>
                <i class="fas fa-chevron-right sdd-arrow"></i>`;

            item.addEventListener('mousedown', (e) => { e.preventDefault(); navigateTo(p); });
            list.appendChild(item);
        });

        dropdown.appendChild(list);
        dropdown.classList.add('open');
        bindCloseBtn();
    }

    function bindCloseBtn() {
        const btn = document.getElementById('sddCloseBtn');
        if (btn) btn.addEventListener('mousedown', (e) => { e.preventDefault(); closeDropdown(); });
    }

    function closeDropdown() {
        const dd = document.getElementById('searchDropdown');
        if (dd) dd.classList.remove('open');
        activeIdx = -1;
    }

    function isOpen() {
        const dd = document.getElementById('searchDropdown');
        return dd && dd.classList.contains('open');
    }

    function navigateTo(p) {
        closeDropdown();
        if (isOnProductsPage()) {
            activateCategoryAndProduct(p.catKey, p.index);
        } else {
            window.location.href = 'products.html?cat=' + encodeURIComponent(p.catKey) + '&product=' + p.index;
        }
    }

    function isOnProductsPage() {
        var path = window.location.pathname;
        return path.endsWith('products.html') || path.endsWith('products');
    }

    // ── Activate category tab & open product (works on products.html) ──
    function activateCategoryAndProduct(catKey, productIndex) {
        var poll = function (attempts) {
            if (attempts > 50) return;
            var tab = document.querySelector('.tab-btn[data-category="' + catKey + '"]');
            if (!tab) {
                setTimeout(function () { poll(attempts + 1); }, 150);
                return;
            }
            tab.click();

            if (productIndex == null) return;
            setTimeout(function () { openProduct(catKey, productIndex, 0); }, 300);
        };
        poll(0);
    }

    function openProduct(catKey, productIndex, attempts) {
        if (attempts > 50) return;
        // Use getElementById which is safe for IDs with hyphens
        var section = document.getElementById(catKey);
        if (!section) {
            setTimeout(function () { openProduct(catKey, productIndex, attempts + 1); }, 150);
            return;
        }
        var items = section.querySelectorAll('.gallery-item');
        var idx = parseInt(productIndex);
        if (!items || !items[idx]) {
            setTimeout(function () { openProduct(catKey, productIndex, attempts + 1); }, 150);
            return;
        }
        items[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () { items[idx].click(); }, 350);
    }

    // ── Keyboard navigation ────────────────────────────────────────
    function handleArrowKeys(e) {
        if (!isOpen()) return;
        var items = document.querySelectorAll('#sddList .sdd-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIdx = Math.min(activeIdx + 1, items.length - 1);
            highlightItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIdx = Math.max(activeIdx - 1, 0);
            highlightItem(items);
        } else if (e.key === 'Enter' && activeIdx >= 0) {
            e.preventDefault();
            items[activeIdx].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        }
    }

    function highlightItem(items) {
        items.forEach(function (el, i) { el.classList.toggle('sdd-active', i === activeIdx); });
        if (items[activeIdx]) items[activeIdx].scrollIntoView({ block: 'nearest' });
    }

    // ── Bind to existing static HTML elements ──────────────────────
    function bindSearchBar() {
        var bar = document.getElementById('searchBarNav');
        var input = document.getElementById('searchInput');
        var clearBtn = document.getElementById('searchClearBtn');
        var submitBtn = document.getElementById('searchSubmitBtn');
        if (!bar || !input || !clearBtn || !submitBtn) return;

        input.placeholder = st('placeholder');
        var btnText = bar.querySelector('.search-btn-text');
        if (btnText) btnText.textContent = st('btn');

        function triggerSearch() {
            var q = input.value.trim();
            if (!q) { closeDropdown(); return; }
            showDropdown(doSearch(q), q);
        }

        var debounceTimer = null;
        input.addEventListener('input', function () {
            clearBtn.classList.toggle('visible', !!input.value);
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                if (!input.value.trim()) { closeDropdown(); return; }
                triggerSearch();
            }, 250);
        });

        clearBtn.addEventListener('mousedown', function (e) {
            e.preventDefault();
            input.value = '';
            clearBtn.classList.remove('visible');
            closeDropdown();
            input.focus();
        });

        submitBtn.addEventListener('click', function () {
            triggerSearch();
            input.focus();
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && activeIdx < 0) triggerSearch();
            if (e.key === 'Escape') { closeDropdown(); input.blur(); }
            handleArrowKeys(e);
        });

        document.addEventListener('click', function (e) {
            if (!bar.contains(e.target)) closeDropdown();
        });

        window.addEventListener('languageChanged', function () {
            input.placeholder = st('placeholder');
            var t = bar.querySelector('.search-btn-text');
            if (t) t.textContent = st('btn');
        });
    }

    // ── Handle URL ?cat=&product= on products page load ────────────
    function handleSearchParams() {
        var params = new URLSearchParams(window.location.search);
        var cat = params.get('cat');
        var productIdx = params.get('product');
        if (!cat) return;
        activateCategoryAndProduct(cat, productIdx);
    }

    function init() {
        bindSearchBar();
        if (isOnProductsPage()) handleSearchParams();
        loadProducts();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
