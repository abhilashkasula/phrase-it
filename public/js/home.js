const sendGetRequest = (url, callback) => {
  const options = {
    method: 'GET',
  };
  fetch(url, options)
    .then((res) => res.json())
    .then((res) => callback(res));
};

const showStory = function(story_id) {
  location.replace(`/story/${story_id}`);
};

const addStoryDetail = function(story, storyBox) {
  const storyDetail = `
  <h1 class="title">${story.title}</h1>
  <div class="story-author-container">
   <div>
     <div id="story-author-name">${story.author}</div>
     <div id="story-time">${story.published_at}</div>
   </div>
 </div>
 <div class="story-content">
 ${JSON.parse(story.content)[0].data.text.slice(0, 40)} ...
 </div>`;
  storyBox.innerHTML = storyDetail;
};

const getPublishedStories = () => {
  sendGetRequest('/publishedStories', (stories) => {
    stories.reverse().forEach((story) => {
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
