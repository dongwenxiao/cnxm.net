/* ==========================================
   Products Page - Data-driven rendering
   Loads /data/products.json and builds tabs + galleries
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    const tabsContainer = document.getElementById('categoryTabs');
    const categoriesWrapper = document.getElementById('categoriesWrapper');
    const loadingEl = document.getElementById('productsLoading');
    const errorEl = document.getElementById('productsError');

    const descriptions = {
        'high-voltage-connectors': 'Heavy-duty connectors for high power applications',
        'low-voltage-connectors': 'Precision connectors for signal and low power circuits',
        'wire-harnesses': 'Custom wire harness assemblies for various applications',
        'blue-base-low-voltage-connectors': 'Specialized blue base connectors for low voltage applications',
        'rocker-ac-switches': 'Power switches and AC control components',
    };

    const icons = {
        'high-voltage-connectors': 'fas fa-bolt',
        'low-voltage-connectors': 'fas fa-microchip',
        'wire-harnesses': 'fas fa-network-wired',
        'blue-base-low-voltage-connectors': 'fas fa-square',
        'rocker-ac-switches': 'fas fa-toggle-on',
    };

    const categoryI18nKeys = {
        'high-voltage-connectors': { title: 'cat_high_voltage', desc: 'cat_high_voltage_desc' },
        'low-voltage-connectors': { title: 'cat_low_voltage', desc: 'cat_low_voltage_desc' },
        'wire-harnesses': { title: 'cat_wire_harness', desc: 'cat_wire_harness_desc' },
        'blue-base-low-voltage-connectors': { title: 'cat_blue_base', desc: 'cat_blue_base_desc' },
        'rocker-ac-switches': { title: 'cat_rocker_ac', desc: 'cat_rocker_ac_desc' },
    };

    const preferredOrder = [
        'high-voltage-connectors',
        'low-voltage-connectors',
        'wire-harnesses',
        'blue-base-low-voltage-connectors',
        'rocker-ac-switches',
    ];

    let tabButtons = [];
    let productsData = null;
    let currentCategoryId = null;
    let hashListenerAttached = false;

    function getCurrentLang() {
        if (window.i18n && typeof window.i18n.currentLang === 'function') {
            return window.i18n.currentLang() || 'en';
        }
        const stored = localStorage.getItem('preferred_language');
        return stored || 'en';
    }

    function getLocalizedString(value) {
        const lang = getCurrentLang();
        if (value && typeof value === 'object') {
            return value[lang] || value.en || Object.values(value)[0] || '';
        }
        return value || '';
    }

    function getCategoryText(slug, type, fallback) {
        const lang = getCurrentLang();
        const keys = categoryI18nKeys[slug];
        if (keys && window.translations && window.translations[lang]) {
            const key = keys[type];
            if (key && window.translations[lang][key]) {
                return window.translations[lang][key];
            }
        }
        return getLocalizedString(fallback);
    }

    function getProductDisplayName(prod) {
        return getLocalizedString(prod && prod.name);
    }

    function setActiveCategory(categoryId) {
        currentCategoryId = categoryId;
        tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.category === categoryId));
        const categories = categoriesWrapper.querySelectorAll('.category-content');
        categories.forEach(cat => cat.classList.toggle('active', cat.id === categoryId));

        const selectedContent = document.getElementById(categoryId);
        if (selectedContent) {
            setTimeout(() => {
                const categoryTitle = selectedContent.querySelector('.category-title');
                if (categoryTitle) {
                    const yOffset = -100;
                    const y = categoryTitle.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        }
    }

    function buildProductItem(prod) {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        const displayName = getProductDisplayName(prod);

        const img = document.createElement('img');
        img.src = `images/${prod.file}`;
        img.alt = displayName;
        item.appendChild(img);

        const name = document.createElement('p');
        name.className = 'product-name';
        name.textContent = displayName;
        item.appendChild(name);

        return item;
    }

    function buildCategory(slug, info, isActive) {
        const section = document.createElement('div');
        section.className = 'category-content';
        if (isActive) section.classList.add('active');
        section.id = slug;

        const title = document.createElement('h2');
        title.className = 'category-title';
        const icon = icons[slug] || 'fas fa-box';
        const titleText = getCategoryText(slug, 'title', info.name);
        title.innerHTML = `<i class="${icon}"></i> ${titleText}`;
        section.appendChild(title);

        const desc = document.createElement('p');
        desc.className = 'category-desc';
        desc.textContent = getCategoryText(slug, 'desc', descriptions[slug] || '');
        section.appendChild(desc);

        const gallery = document.createElement('div');
        gallery.className = 'product-gallery';
        if (info.products && info.products.length) {
            info.products.forEach(prod => gallery.appendChild(buildProductItem(prod)));
        } else {
            const empty = document.createElement('p');
            empty.className = 'product-empty';
            empty.textContent = 'No products yet.';
            gallery.appendChild(empty);
        }
        section.appendChild(gallery);

        return section;
    }

    function buildTab(slug, label, isActive) {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        if (isActive) btn.classList.add('active');
        btn.dataset.category = slug;
        const icon = icons[slug] || 'fas fa-box';
        btn.innerHTML = `<i class="${icon}"></i> ${label}`;
        btn.addEventListener('click', () => {
            setActiveCategory(slug);
            history.pushState(null, '', `#${slug}`);
        });
        return btn;
    }

    function renderProducts(data, keepCategoryId) {
        const entries = Object.entries(data).sort((a, b) => {
            const aRank = preferredOrder.indexOf(a[0]) !== -1 ? preferredOrder.indexOf(a[0]) : a[1].index;
            const bRank = preferredOrder.indexOf(b[0]) !== -1 ? preferredOrder.indexOf(b[0]) : b[1].index;
            return aRank - bRank;
        });

        tabsContainer.innerHTML = '';
        categoriesWrapper.innerHTML = '';
        tabButtons = [];

        entries.forEach(([slug, info], idx) => {
            const isActive = idx === 0;
            const tab = buildTab(slug, getCategoryText(slug, 'title', info.name), isActive);
            tabsContainer.appendChild(tab);
            tabButtons.push(tab);

            const categorySection = buildCategory(slug, info, isActive);
            categoriesWrapper.appendChild(categorySection);
        });

        const hash = window.location.hash.substring(1);
        const initial = (keepCategoryId && document.getElementById(keepCategoryId)) ? keepCategoryId : (hash && document.getElementById(hash)) ? hash : entries[0]?.[0];
        if (initial) setActiveCategory(initial);

        if (!hashListenerAttached) {
            window.addEventListener('hashchange', () => {
                const newHash = window.location.hash.substring(1);
                if (newHash && document.getElementById(newHash)) {
                    setActiveCategory(newHash);
                }
            });
            hashListenerAttached = true;
        }

        const footerLinks = document.querySelectorAll('.footer-column a[href^="#"]');
        footerLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                if (document.getElementById(target)) {
                    setActiveCategory(target);
                    history.pushState(null, '', `#${target}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    fetch('data/products.json')
        .then(res => {
            if (!res.ok) throw new Error('网络错误');
            return res.json();
        })
        .then(data => {
            loadingEl.style.display = 'none';
            productsData = data;
            renderProducts(productsData);
        })
        .catch(err => {
            console.error('加载产品数据失败', err);
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';
        });

    // Re-render on language change to update product names and category labels
    window.addEventListener('languageChanged', () => {
        if (productsData) {
            renderProducts(productsData, currentCategoryId);
        }
    });
});

console.log('✓ Products page - data driven rendering active');
