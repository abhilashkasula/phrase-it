const copyUrl = () => {
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
};

const changeOptionToUnFollow = () => {
  document.querySelector('#follow').innerText = 'Unfollow';
};

const follow = (authorId) => {
  fetch('/follow', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({authorId}),
  })
    .then((res) => res.json())
    .then(({status}) => status && changeOptionToUnFollow());
};

const main = () => {
  const copy = document.querySelector('#story-url');
  const followButton = document.querySelector('#follow');
  const userId = followButton.getAttribute('userId');
  copy.addEventListener('click', copyUrl);
  followButton.addEventListener('click', () => follow(userId));
};
window.onload = main;
