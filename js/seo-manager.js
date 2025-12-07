/* ==========================================
   SEO & Meta Tags Manager
   Dynamic SEO optimization for all pages
   ========================================== */

const seoConfig = {
    'index.html': {
        title: 'XMCN - Xuanmeng Electronics | Professional Connector & Wire Harness Solutions',
        description: 'Zhejiang Xuanmeng Electronics Co., Ltd. - Leading connector and wire harness manufacturer since 2006. ISO certified, 1000+ products, serving global markets with premium quality connectors.',
        keywords: 'connector manufacturer, wire harness, VH series connectors, XH series connectors, power connectors, industrial connectors, XMCN, Xuanmeng Electronics',
        ogImage: '/images/og-home.jpg',
        schema: {
            '@type': 'Organization',
            name: 'Zhejiang Xuanmeng Electronics Co., Ltd.',
            alternateName: 'XMCN'
        }
    },
    'about.html': {
        title: 'About XMCN | Xuanmeng Electronics - 18 Years of Excellence',
        description: 'Learn about Xuanmeng Electronics - National High-tech Enterprise since 2006. ISO certified manufacturer with 5 subsidiaries, 500M RMB annual output, and 1000+ product varieties.',
        keywords: 'about Xuanmeng, connector company, manufacturing excellence, ISO certified, IATF 16949, connector industry leader',
        ogImage: '/images/og-about.jpg'
    },
    'products.html': {
        title: 'Products | XMCN Connectors - VH, XH Series & Wire Harnesses',
        description: 'Explore our premium connector solutions: VH Series, XH Series, Wire Harness Assemblies, and Power Connectors. High-quality products for industrial applications worldwide.',
        keywords: 'VH connectors, XH connectors, wire harness assemblies, power connectors, XT60, industrial connectors, connector products',
        ogImage: '/images/og-products.jpg'
    },
    'rd.html': {
        title: 'R&D Capability | XMCN - Innovation & Smart Manufacturing',
        description: 'Advanced R&D capabilities with smart manufacturing systems (ERP, PLM, MES), rigorous quality control, and comprehensive testing facilities. UL, CQC, RoHS, REACH certified.',
        keywords: 'R&D capability, smart manufacturing, quality control, testing equipment, connector innovation, manufacturing technology',
        ogImage: '/images/og-rd.jpg'
    },
    'contact.html': {
        title: 'Contact Us | XMCN - Get Your Custom Connector Solutions',
        description: 'Contact Xuanmeng Electronics for customized connector and wire harness solutions. Global service, fast delivery, and expert technical support.',
        keywords: 'contact Xuanmeng, connector inquiry, custom solutions, connector supplier, global service',
        ogImage: '/images/og-contact.jpg'
    }
};

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    return page;
}

function updateSEO() {
    const currentPage = getCurrentPage();
    const config = seoConfig[currentPage];
    
    if (!config) {
        console.warn('No SEO config found for', currentPage);
        return;
    }
    
    // Update title
    document.title = config.title;
    
    // Update or create meta tags
    updateMetaTag('name', 'description', config.description);
    updateMetaTag('name', 'keywords', config.keywords);
    updateMetaTag('name', 'author', 'Zhejiang Xuanmeng Electronics Co., Ltd.');
    
    // Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        canonical.href = window.location.href;
    } else {
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = window.location.href;
        document.head.appendChild(link);
    }
    
    // Open Graph tags
    updateMetaTag('property', 'og:type', 'website');
    updateMetaTag('property', 'og:url', window.location.href);
    updateMetaTag('property', 'og:title', config.title);
    updateMetaTag('property', 'og:description', config.description);
    updateMetaTag('property', 'og:image', window.location.origin + config.ogImage);
    updateMetaTag('property', 'og:site_name', 'Xuanmeng Electronics');
    
    // Twitter Card tags
    updateMetaTag('property', 'twitter:card', 'summary_large_image');
    updateMetaTag('property', 'twitter:url', window.location.href);
    updateMetaTag('property', 'twitter:title', config.title);
    updateMetaTag('property', 'twitter:description', config.description);
    updateMetaTag('property', 'twitter:image', window.location.origin + config.ogImage);
}

function updateMetaTag(attribute, name, content) {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateSEO);
} else {
    updateSEO();
}

console.log('✓ SEO Manager loaded - Meta tags optimized');