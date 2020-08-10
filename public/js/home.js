const showStory = function (story_id) {
  location.replace(`/story/${story_id}`);
};

window.onload = () => setTime('.story-time', '');
