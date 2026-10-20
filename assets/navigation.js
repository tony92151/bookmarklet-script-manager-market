const toggle = document.querySelector('.nav-toggle');
const navigation = document.getElementById('site-navigation');

if (toggle && navigation) {
  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    navigation.classList.add('is-collapsed');
  };
  toggle.hidden = false;
  close();
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    navigation.classList.toggle('is-collapsed', !expanded);
  });
  navigation.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
      toggle.focus();
    }
  });
}
