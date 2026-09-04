(() => {
  const storageKey = "lang";
  const supported = ["zh", "en"];
  const queryLang = new URLSearchParams(location.search).get("lang");
  let lang = supported.includes(queryLang) ? queryLang : localStorage.getItem(storageKey);
  if (!supported.includes(lang)) lang = navigator.language.toLowerCase().startsWith("en") ? "en" : "zh";

  window.translations = window.translations || { zh: {}, en: {} };
  window.portfolioLanguage = () => lang;
  window.t = (key) => window.translations[lang]?.[key] || window.translations.zh?.[key] || key;

  function updateLinks() {
    document.querySelectorAll('a[href]').forEach((link) => {
      const raw = link.getAttribute('href');
      if (!raw || raw.startsWith('#') || /^(https?:|mailto:|tel:)/.test(raw)) return;
      const url = new URL(raw, location.href);
      if (url.origin !== location.origin) return;
      url.searchParams.set('lang', lang);
      link.href = url.pathname + url.search + url.hash;
    });
  }

  function applyLanguage(next = lang) {
    lang = supported.includes(next) ? next : "zh";
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = window.t(node.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => { node.setAttribute('aria-label', window.t(node.dataset.i18nAriaLabel)); });
    const toggle = document.querySelector('#language-toggle');
    if (toggle) toggle.textContent = lang === 'zh' ? 'EN' : '中文';
    updateLinks();
    window.dispatchEvent(new CustomEvent('portfolio-language-changed', { detail: lang }));
  }

  window.applyLanguage = applyLanguage;
  window.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('[data-language-nav], .site-header nav');
    if (nav && !document.querySelector('#language-toggle')) {
      const button = document.createElement('button');
      button.id = 'language-toggle';
      button.className = 'language-switch';
      button.type = 'button';
      button.addEventListener('click', () => {
        lang = lang === 'zh' ? 'en' : 'zh';
        localStorage.setItem(storageKey, lang);
        const url = new URL(location.href);
        url.searchParams.set('lang', lang);
        history.replaceState(null, '', url);
        applyLanguage(lang);
      });
      nav.append(button);
    }
    applyLanguage(lang);
  });
})();
