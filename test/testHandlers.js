const request = require('supertest');
const {app} = require('../src/app');

describe('newStory', () => {
  it('should get editor html', (done) => {
    request(app)
      .get('/newStory')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(/editor/, done);
  });
});

describe('createStory', () => {
  it('should create a story and give back the story id', (done) => {
    request(app)
      .get('/createStory')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(/id/, done);
  });
});

describe('saveStory', () => {
  it('should save a story title, content for given story id', (done) => {
    const block = {
      type: 'paragraph',
      data: {
        text: 'A small paragraph',
      },
    };
    const data = {id: 1, title: 'A new app', blocks: [block]};
    request(app)
      .post('/saveStory')
      .send(data)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({status: 'saved'}, done);
  });
});
