const main = () => {
  document.querySelector('#story-url').addEventListener('click', () => {
    const url = document.querySelector('#url');
    url.style['visibility'] = 'visible';
    url.value = document.URL;
    url.select();
    url.setSelectionRange(0, 99999);
    document.execCommand('copy');
    url.style['visibility'] = 'hidden';
  });
};
window.onload = main;
