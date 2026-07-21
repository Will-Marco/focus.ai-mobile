// Til almashtirgich — tanlov localStorage'da saqlanadi, sahifalar orasida qoladi.
(function () {
  var KEY = 'focusai-lang';

  function apply(lang) {
    document.querySelectorAll('[data-lang]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-lang') === lang);
    });
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-set') === lang));
    });
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {
      // private rejimda localStorage yopiq bo'lishi mumkin — muhim emas
    }
  }

  var saved;
  try {
    saved = localStorage.getItem(KEY);
  } catch (e) {
    saved = null;
  }
  // Saqlangan tanlov bo'lmasa, brauzer tiliga qaraymiz (uz — default).
  var browser = (navigator.language || '').slice(0, 2);
  apply(saved || (browser === 'en' ? 'en' : 'uz'));

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      apply(btn.getAttribute('data-set'));
    });
  });
})();
