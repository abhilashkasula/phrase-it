const main = () => {
  const copy = document.querySelector('#story-url');
  copy.addEventListener('click', () => {
    const url = document.querySelector('#url');
    url.style['visibility'] = 'visible';
    url.value = document.URL;
    url.select();
    url.setSelectionRange(0, 99999);
    document.execCommand('copy');
    url.style['visibility'] = 'hidden';
    copy.innerText = 'Copied';
    setTimeout(() => {
      copy.innerText = 'Copy link';
    }, 1000);
  });
};
window.onload = main;
