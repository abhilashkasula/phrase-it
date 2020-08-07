const showStory = function (story_id) {
  location.replace(`/story/${story_id}`);
};

const setPublishedTime = () => {
  const times = Array.from(document.querySelectorAll('.story-time'));
  times.forEach(timeElem => {
    const time = timeElem.getAttribute('time');
    timeElem.innerText = moment(time).startOf().fromNow();
  });
};

window.onload = setPublishedTime;
