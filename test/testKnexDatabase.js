const knex = require('knex');
const {assert} = require('chai');
const Database = require('../src/knexDatabase');
const knexConfig = require('../knexfile');
const {resetKnexDB} = require('./knexDBScripts');

const knexInstance = knex(knexConfig.test);
const db = new Database(knexInstance);

describe('knexDatabase', () => {
  describe('addUser', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should add a new user with given data', (done) => {
      const userData = {id: 12345678, name: 'some name', avatar_url: 'url'};
      db.addUser(userData)
        .then((res) => {
          assert.deepStrictEqual(res, {status: 'Added user'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('getDraft', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should give draft if the draftId is proper', (done) => {
      const expected = {
        id: 2,
        title: '8 Ways to Build Virality into your Product',
        created_by: 58025056,
        content:
          '[{"type":"paragraph","data":{"text":"Computer science student."}}]',
        is_published: 0,
        last_modified: '2020-08-10 14:50:18',
      };

      db.getDraft(2, 58025056)
        .then((res) => {
          assert.deepStrictEqual(res, expected);
          done();
        })
        .catch((err) => done(err));
    });

    it('should give error if draftId is wrong', (done) => {
      db.getDraft(10, 58025056)
        .catch((err) => {
          assert.deepStrictEqual(err, {error: 'No draft found'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('getDrafts', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should give a list of drafts for the given user', (done) => {
      const expected = [
        {
          id: 2,
          title: '8 Ways to Build Virality into your Product',
          created_by: 58025056,
          content:
            '[{"type":"paragraph","data":{"text":"Computer science student."}}]',
          is_published: 0,
          last_modified: '2020-08-10 14:50:18',
        },
      ];

      db.getDrafts(58025056)
        .then((drafts) => {
          assert.deepStrictEqual(drafts, expected);
          done();
        })
        .catch((err) => done(err));
    });

    it('should give an empty list of drafts if user have no draft', (done) => {
      db.getDrafts(56071561)
        .then((drafts) => {
          assert.deepStrictEqual(drafts, []);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('createStory', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should create a new story and return the story id', (done) => {
      db.createStory(12345678, 'some title', '[]')
        .then((id) => {
          assert.strictEqual(id, 6);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('deleteDraft', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should delete the draft if draft is present', (done) => {
      db.deleteDraft(2, 58025056)
        .then((res) => {
          assert.deepStrictEqual(res, {status: 'Deleted'});
          done();
        })
        .catch((err) => done(err));
    });

    it('should reject if the draft is not present', (done) => {
      db.deleteDraft(10, 58025056)
        .catch((err) => {
          assert.deepStrictEqual(err, {error: 'No draft found'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('updateStory', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should update the draft if draft is present', (done) => {
      db.updateStory(2, 'some title', 58025056, '[]')
        .then((res) => {
          assert.deepStrictEqual(res, {status: 'Updated'});
          done();
        })
        .catch((err) => done(err));
    });

    it('should reject if the draft is not present', (done) => {
      db.updateStory(1, 'some title', 58025056, '[]')
        .catch((err) => {
          assert.deepStrictEqual(err, {error: 'No draft found'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('getUserPublishedStories', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should give published stories of given user', (done) => {
      const expected = [
        {
          id: 1,
          content:
            '[{"type":"paragraph","data":{"text":"I am a computer science student."}}]',
          title: '9 Ways to Build Virality into your Product',
          published_at: '2020-08-10 14:50:18',
        },
      ];
      db.getUserPublishedStories(58025056)
        .then((res) => {
          assert.deepStrictEqual(res, expected);
          done();
        })
        .catch((err) => done(err));
    });

    it('should give empty list for no published stories', (done) => {
      db.getUserPublishedStories(58025419)
        .then((res) => {
          assert.deepStrictEqual(res, []);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('addResponses', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should add response if the given story is published', (done) => {
      db.addResponse(1, 58025056, 'nice')
        .then((res) => {
          assert.deepStrictEqual(res, {status: 'Added response'});
          done();
        })
        .catch((err) => done(err));
    });

    it('should not add response if the given story is not published', (done) => {
      db.addResponse(2, 58025056, 'nice')
        .catch((err) => {
          assert.deepStrictEqual(err, {error: 'No story found'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('getResponses', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should give list of responses for given story id', (done) => {
      const expected = [
        {
          id: 1,
          responded_on: 1,
          responded_by: 58025419,
          responded_at: '2020-08-10 14:50:18',
          response: 'Nice story',
        },
        {
          id: 2,
          responded_on: 1,
          responded_by: 58025056,
          responded_at: '2020-08-10 14:50:18',
          response: 'Thanks Naagu',
        },
      ];
      db.getResponses(1)
        .then((res) => {
          assert.deepStrictEqual(res, expected);
          done();
        })
        .catch((err) => done(err));
    });

    it('should not add response if the given story is not published', (done) => {
      db.getResponses(2)
        .catch((err) => {
          assert.deepStrictEqual(err, {error: 'No story found'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('clap', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should add clap if the user is not already clapped', (done) => {
      db.clap(1, 58026402)
        .then((res) => {
          assert.deepStrictEqual(res, {isClapped: true, clapsCount: 4});
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('should remove clap if the user already clapped', (done) => {
      db.clap(1, 58025419)
        .then((res) => {
          assert.deepStrictEqual(res, {
            isClapped: false,
            clapsCount: 2,
          });
          done();
        })
        .catch((err) => done(err));
    });

    it('should reject if story written and user clap are same', (done) => {
      db.clap(1, 58025056)
        .catch((res) => {
          assert.deepStrictEqual(res, {
            error: 'You cannot clap or unclap on your own story',
          });
          done();
        })
        .catch((err) => done(err));
    });

    it('should reject if the given story id is unknown', (done) => {
      db.clap(100, 58025419)
        .catch((err) => {
          assert.deepStrictEqual(err, {error: 'No story found'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('followAuthor', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should resolve with status for following an author', (done) => {
      db.followAuthor(58025419, 58026249)
        .then((res) => {
          assert.deepStrictEqual(res, {status: 'Following'});
          done();
        })
        .catch((err) => done(err));
    });

    it('should reject if the user is already following the author', (done) => {
      db.followAuthor(58025419, 58025056)
        .catch((err) => {
          assert.deepStrictEqual(err, {error: 'Already following'});
          done();
        })
        .catch((err) => done(err));
    });

    it('should reject for following yourself', (done) => {
      db.followAuthor(58025419, 58025419)
        .catch((err) => {
          assert.deepStrictEqual(err, {error: 'You cannot follow yourself'});
          done();
        })
        .catch((err) => done(err));
    });

    it('should reject for following an author not present', (done) => {
      db.followAuthor(58025419, 1)
        .catch((err) => {
          assert.deepStrictEqual(err, {error: 'No author found'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('unFollowAuthor', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should resolve status unfollowed if already following', (done) => {
      db.unFollowAuthor(58025419, 58025056)
        .then((res) => {
          assert.deepStrictEqual(res, {status: 'Unfollowed'});
          done();
        })
        .catch((err) => done(err));
    });

    it('should reject error if not already following', (done) => {
      db.unFollowAuthor(58025056, 56071561)
        .catch((err) => {
          assert.deepStrictEqual(err, {
            error: 'You are not a follower of this user',
          });
          done();
        })
        .catch((err) => done(err));
    });

    it('should reject for unfollowing yourself', (done) => {
      db.unFollowAuthor(58025419, 58025419)
        .catch((err) => {
          assert.deepStrictEqual(err, {
            error: 'You cannot unfollow yourself',
          });
          done();
        })
        .catch((err) => done(err));
    });

    it('should reject for unfollowing an author not present', (done) => {
      db.unFollowAuthor(58025419, 1)
        .catch((err) => {
          assert.deepStrictEqual(err, {error: 'No author found'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('isFollower', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should give one if given user is following the other', (done) => {
      db.isFollower(58025419, 58025056)
        .then((res) => {
          assert.isTrue(res);
          done();
        })
        .catch((err) => done(err));
    });

    it('should give one if given user is following the other', (done) => {
      db.isFollower(58025056, 56071561)
        .then((res) => {
          assert.isFalse(res);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('updateViews', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));
    it('should resolve with updated views for other user story', (done) => {
      db.updateViews(58025419, 1, 58025056)
        .then((views) => {
          assert.deepStrictEqual(views, 1);
          done();
        })
        .catch((err) => done(err));
    });

    it('should resolve without updating views for author', (done) => {
      db.updateViews(58025056, 1, 58025056)
        .then((views) => {
          assert.deepStrictEqual(views, 0);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('addTags', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should add given tags to the given story', (done) => {
      db.addTags(1, ['tag1'])
        .then((res) => {
          assert.deepStrictEqual(res, {status: 'Added tags'});
          done();
        })
        .catch((err) => done(err));
    });

    it('should resolve for no tags specified', (done) => {
      db.addTags(1, [])
        .then((res) => {
          assert.deepStrictEqual(res, {status: 'Empty tags'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('getTags', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should given list of tags for given story', (done) => {
      db.getTags(3)
        .then((res) => {
          assert.deepStrictEqual(res, ['comic', 'drama']);
          done();
        })
        .catch((err) => done(err));
    });

    it('should give empty list if there no tags for give story', (done) => {
      db.getTags(5)
        .then((res) => {
          assert.deepStrictEqual(res, []);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('getUserDetails', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should give userDetails if user is present', (done) => {
      const expected = {
        avatar_url: 'https://avatars0.githubusercontent.com/u/58025419?v=4',
        followers: [
          {
            avatar_url: 'https://avatars0.githubusercontent.com/u/58025419?v=4',
            id: 58025419,
            username: 'myultimatevision',
          },
        ],
        following: [
          {
            avatar_url: 'https://avatars0.githubusercontent.com/u/58025056?v=4',
            id: 58025056,
            username: 'abhilashkasula',
          },
          {
            avatar_url: 'https://avatars2.githubusercontent.com/u/56071561?v=4',
            id: 56071561,
            username: 'anil-muraleedharan',
          },
        ],
        id: 58025419,
        stories: [],
        username: 'myultimatevision',
      };
      db.getUserDetails(58025419)
        .then((details) => {
          assert.deepStrictEqual(details, expected);
          done();
        })
        .catch((err) => done(err));
    });

    it('should give error if the user is not present', (done) => {
      db.getUserDetails(11111111)
        .catch(({error}) => {
          assert.strictEqual(error, 'No user found');
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('search', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should give matching stories based on the keyword', (done) => {
      const expected = {
        authorBased: [
          {
            author: 'anil-muraleedharan',
            author_id: 56071561,
            content:
              '[{"type":"paragraph","data":{"text":"I am a computer science student."}}]',
            id: 3,
            published_at: '2020-08-10 14:50:18',
            title: '9 Ways to Build Virality into your Product',
          },
        ],
        contentBased: [
          {
            author: 'anil-muraleedharan',
            author_id: 56071561,
            content:
              '[{"type":"paragraph","data":{"text":"I am a computer science student."}}]',
            id: 3,
            published_at: '2020-08-10 14:50:18',
            title: '9 Ways to Build Virality into your Product',
          },
          {
            author: 'abhilashkasula',
            author_id: 58025056,
            content:
              '[{"type":"paragraph","data":{"text":"I am a computer science student."}}]',
            id: 1,
            published_at: '2020-08-10 14:50:18',
            title: '9 Ways to Build Virality into your Product',
          },
        ],
        tagBased: [
          {
            author: 'anil-muraleedharan',
            author_id: 56071561,
            content:
              '[{"type":"paragraph","data":{"text":"I am a computer science student."}}]',
            id: 3,
            published_at: '2020-08-10 14:50:18',
            title: '9 Ways to Build Virality into your Product',
          },
        ],
      };

      db.search('d')
        .then((result) => {
          assert.deepStrictEqual(result, expected);
          done();
        })
        .catch((err) => done(err));
    });
  });

  after(async () => await knexInstance.destroy());
});
