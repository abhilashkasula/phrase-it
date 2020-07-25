const sendGetRequest = (url, callback) => {
  const options = {
    method: 'GET',
  };
  fetch(url, options)
    .then((res) => res.json())
    .then((res) => callback(res));
};

const showStory = function (story_id) {
  location.replace(`/story/${story_id}`);
};

const addStoryDetail = function (story, storyBox) {
  const title = document.createElement('h1');
  title.innerText = story.title;
  const author = document.createElement('p');
  author.innerText = story.created_by;
  const time = document.createElement('span');
  time.innerText = story.published_at;
  storyBox.appendChild(title);
  storyBox.appendChild(author);
  storyBox.appendChild(time);
};

const getPublishedStories = () => {
  sendGetRequest('/publishedStories', (stories) => {
    stories.forEach((story) => {
      const storyBox = document.createElement('div');
      storyBox.id = story.id;
      storyBox.className = 'story-box';
      storyBox.setAttribute('onclick', `showStory(${story.id})`);
      addStoryDetail(story, storyBox);
      const dashBoard = document.querySelector('.dashBoard');
      dashBoard.appendChild(storyBox);
    });
  });
};

window.onload = getPublishedStories;
