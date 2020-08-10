const copyUrl = (copy) => {
  const url = document.querySelector('#url');
  url.style['visibility'] = 'visible';
  url.value = document.URL;
  url.select();
  url.setSelectionRange(0, 99999);
  document.execCommand('copy');
  url.style['visibility'] = 'hidden';
  copy.src = '/images/after-copy.png';
  setTimeout(() => {
    copy.src = '/images/before-copy.png';
  }, 1000);
};

const changeOptionToUnFollow = ({status}) => {
  if (status) {
    document.querySelector('#follow').classList.add('hide-btn');
    document.querySelector('#unfollow').classList.remove('hide-btn');
  }
};

const changeOptionToFollow = ({status}) => {
  if (status) {
    document.querySelector('#unfollow').classList.add('hide-btn');
    document.querySelector('#follow').classList.remove('hide-btn');
  }
};

const setImage = () => {
  const width = document.querySelector('.coverImage').width;
  const container = document.querySelector('.coverImage-container');
  if (width < 680) {
    container.classList.add('coverImage-center');
  }
};

const unFollow = (authorId) => {
  sendPostReq('/user/unFollow', {authorId}, changeOptionToFollow);
};

const follow = (authorId) => {
  sendPostReq('/user/follow', {authorId}, changeOptionToUnFollow);
};

const updateClapsCount = (isClapped, clapCount) => {
  const text = clapCount === 1 ? 'Clap' : 'Claps';
  const clapCountContainer = document.querySelector('#clap-count');
  clapCountContainer.innerText = `${clapCount} ${text}`;
  const imgSrc = isClapped ? '/clap.png' : '/un-clap.png';
  document.querySelector('#clap-icon').src = `/images/${imgSrc}`;
};

const clap = (storyId) => {
  const callback = ({isClapped, clapsCount, error}) =>
    !error && updateClapsCount(isClapped, clapsCount);
  sendPostReq('/user/clap', {id: storyId}, callback);
};

const main = () => {
  const copy = document.querySelector('#story-url');
  const time = document.querySelector('#story-time');
  const value = time.getAttribute('published_at');
  time.innerText = `Published ${moment(value).startOf('min').fromNow()}`;
  copy.addEventListener('click', () => copyUrl(copy));
  setImage();
};

window.onload = main;
