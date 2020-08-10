const setTime = (stories, text) => {
  stories.forEach((story) => {
    const timeHolder = story.querySelector('.story-time');
    const time = timeHolder.getAttribute('published_at');
    timeHolder.innerText = `${text} ${moment(time).startOf('min').fromNow()}`;
  });
};

const main = () => {
  attachTabListeners();
  const stories = document.querySelectorAll('.story-card');
  setTime(stories, 'Published');
};

window.onload = main;
