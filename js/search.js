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

    // ── Dropdown rendering ─────────────────────────────────────────
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

        // header
        const header = document.createElement('div');
        header.className = 'sdd-header';
        header.innerHTML = `
            <span class="sdd-header-info"><strong>${results.length}</strong> ${st('found')}</span>
            <button class="sdd-close-btn" id="sddCloseBtn"><i class="fas fa-times"></i></button>`;
        dropdown.appendChild(header);

        // scrollable list
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

            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                navigateTo(p);
            });

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
        window.location.href = `products.html?cat=${p.catKey}&product=${p.index}`;
    }

    // ── Keyboard nav ───────────────────────────────────────────────
    function handleArrowKeys(e) {
        if (!isOpen()) return;
        const items = document.querySelectorAll('#sddList .sdd-item');
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
        items.forEach((el, i) => el.classList.toggle('sdd-active', i === activeIdx));
        if (items[activeIdx]) items[activeIdx].scrollIntoView({ block: 'nearest' });
    }

    // ── Build & inject search bar ──────────────────────────────────
    function createSearchBar() {
        const navWrapper = document.querySelector('.nav-wrapper');
        if (!navWrapper) return;

        const bar = document.createElement('div');
        bar.className = 'search-bar-nav';
        bar.id = 'searchBarNav';
        bar.innerHTML = `
            <div class="search-bar-inner">
                <span class="search-icon-prefix"><i class="fas fa-search"></i></span>
                <input type="text" id="searchInput" class="search-input-nav"
                    placeholder="${st('placeholder')}" autocomplete="off" spellcheck="false">
                <button class="search-clear-btn" id="searchClearBtn"><i class="fas fa-times"></i></button>
                <button class="search-submit-btn" id="searchSubmitBtn" type="button">
                    <i class="fas fa-search"></i>
                    <span class="search-btn-text">${st('btn')}</span>
                </button>
            </div>
            <div class="search-dropdown" id="searchDropdown"></div>`;

        const langSelector = document.getElementById('languageSelector');
        const mobileToggle = navWrapper.querySelector('.mobile-toggle');
        navWrapper.insertBefore(bar, langSelector || mobileToggle);

        const input = document.getElementById('searchInput');
        const clearBtn = document.getElementById('searchClearBtn');
        const submitBtn = document.getElementById('searchSubmitBtn');

        function triggerSearch() {
            const q = input.value.trim();
            if (!q) { closeDropdown(); return; }
            showDropdown(doSearch(q), q);
        }

        // Real-time search as user types (debounced)
        let debounceTimer = null;
        input.addEventListener('input', () => {
            // Show/hide clear button
            clearBtn.classList.toggle('visible', !!input.value);
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const q = input.value.trim();
                if (!q) { closeDropdown(); return; }
                triggerSearch();
            }, 250);
        });

        // Clear button
        clearBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            input.value = '';
            clearBtn.classList.remove('visible');
            closeDropdown();
            input.focus();
        });

        // Submit button
        submitBtn.addEventListener('click', () => {
            triggerSearch();
            input.focus();
        });

        // Keyboard
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && activeIdx < 0) triggerSearch();
            if (e.key === 'Escape') { closeDropdown(); input.blur(); }
            handleArrowKeys(e);
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!bar.contains(e.target)) closeDropdown();
        });

        // i18n update
        window.addEventListener('languageChanged', () => {
            input.placeholder = st('placeholder');
            const t = document.querySelector('.search-btn-text');
            if (t) t.textContent = st('btn');
        });
    }

    // ── Handle URL ?cat=&product= on products page ─────────────────
    function handleSearchParams() {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('cat');
        const productIdx = params.get('product');
        if (!cat) return;

        const tryActivate = (a = 0) => {
            if (a > 40) return;
            const tab = document.querySelector(`.tab-btn[data-category="${cat}"]`);
            if (!tab) { setTimeout(() => tryActivate(a + 1), 200); return; }
            tab.click();
            if (productIdx !== null) {
                const tryOpen = (a2 = 0) => {
                    if (a2 > 40) return;
                    const cards = document.querySelectorAll(`#${cat} .gallery-item`);
                    const card = cards[parseInt(productIdx)];
                    if (!card) { setTimeout(() => tryOpen(a2 + 1), 200); return; }
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => card.click(), 300);
                };
                setTimeout(() => tryOpen(), 400);
            }
        };
        setTimeout(tryActivate, 500);
    }

    function init() {
        createSearchBar();
        if (window.location.href.includes('products.html')) handleSearchParams();
        loadProducts();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
