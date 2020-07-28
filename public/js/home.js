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
  const totalContent = JSON.parse(story.content);
  const contentLength = totalContent.length;
  const content = contentLength ? totalContent[0].data.text.slice(0, 70) : '';
  const storyDetail = `
  <h1 class="title">${story.title}</h1>
  <div class="story-content">${content} ...</div>
  <div class="story-author-container">
    <div>
      <div class="story-author-name">${story.author}</div>
      <div class="story-time">${story.published_at}</div>
    </div>
  </div>
  `;
  storyBox.innerHTML = storyDetail;
};

const createDiscoverStory = (story) => {
  return `
  <h1 class="title">${story.title}</h1>
  <div class="story-author-container">
    <div>
      <div class="story-author-name">${story.author}</div>
      <div class="story-time">${story.published_at}</div>
    </div>
  </div>`;
};

const getPublishedStories = () => {
  sendGetRequest('/discoverStories', (stories) => {
    const discover = document.querySelector('#discover');
    stories.forEach((story) => {
      const discoverStory = document.createElement('div');
      discoverStory.className = 'discover-story-box';
      discoverStory.setAttribute('onclick', `showStory(${story.id})`);
      discoverStory.innerHTML = createDiscoverStory(story);
      discover.appendChild(discoverStory);
    });
  });
  sendGetRequest('/dashboardStories', (stories) => {
    const dashBoard = document.querySelector('#following');
    stories.forEach((story) => {
      const storyBox = document.createElement('div');
      storyBox.className = 'story-box';
      storyBox.setAttribute('onclick', `showStory(${story.id})`);
      addStoryDetail(story, storyBox);
      dashBoard.appendChild(storyBox);
    });
    const messageBox = document.querySelector('.message-box');
    messageBox.style.display = stories.length ? 'none' : 'block';
  });
};

window.onload = getPublishedStories;
