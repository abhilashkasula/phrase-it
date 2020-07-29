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
  document.querySelector('#follow').classList.add('hide-btn');
  document.querySelector('#unfollow').classList.remove('hide-btn');
};

const changeOptionToFollow = () => {
  document.querySelector('#unfollow').classList.add('hide-btn');
  document.querySelector('#follow').classList.remove('hide-btn');
};

const unFollow = (authorId) => {
  fetch('/unFollow', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({authorId}),
  })
    .then((res) => res.json())
    .then(({status}) => status && changeOptionToFollow());
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

const updateClapsCount = (status, clapCount) => {
  const text = clapCount === 1 ? 'Clap' : 'Claps';
  const clapCountContainer = document.querySelector('#clap-count');
  clapCountContainer.innerText = `${clapCount} ${text}`;
  const imgSrc = status === 'added' ? '/clap.png' : '/un-clap.png';
  document.querySelector('#clap-icon').src = `/images/${imgSrc}`;
};

const clap = (storyId) => {
  const options = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({id: storyId}),
  };
  fetch('/clap', options)
    .then((res) => res.json())
    .then(({status, clapCount}) => {
      status && updateClapsCount(status, clapCount);
    });
};

const main = () => {
  const copy = document.querySelector('#story-url');
  const time = document.querySelector('#story-time');
  const value = time.getAttribute('published_at');
  time.innerText = `Published ${moment(value).startOf('min').fromNow()}`;
  copy.addEventListener('click', copyUrl);
};

window.onload = main;
