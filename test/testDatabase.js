const assert = require('assert');
const Database = require('../src/database');

describe('Unit Test', () => {
  describe('Database', () => {
    describe('get', () => {
      it('should reject when there is an error', async () => {
        const db = {get: (query, cb) => cb({err: 'error'})};
        const database = new Database(db);
        await assert.rejects(() => database.get('query'));
      });

      it('should resolve the row if there is no error', (done) => {
        const db = {get: (query, cb) => cb(null, {id: 1})};
        const database = new Database(db);
        database
          .get('query')
          .then((row) => {
            assert.deepStrictEqual(row, {id: 1});
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('exec', () => {
      it('should reject when there is an error', async () => {
        const db = {exec: (query, cb) => cb({err: 'error'})};
        const database = new Database(db);
        await assert.rejects(() => database.exec('query'));
      });
      it('should resolve if there is no error', async () => {
        const db = {exec: (query, cb) => cb(null)};
        const database = new Database(db);
        await assert.doesNotReject(() => database.exec('query'));
      });
    });

    describe('all', () => {
      it('should reject when there is an error', (done) => {
        const db = {all: (query, cb) => cb({error: 'error'})};
        const database = new Database(db);
        database
          .all('query')
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'error'});
            done();
          })
          .catch((err) => done(err));
      });
      it('should resolve with rows when there is no error', (done) => {
        const db = {all: (query, cb) => cb(null, [{id: 1}])};
        const database = new Database(db);
        database
          .all('query')
          .then((err) => {
            assert.deepStrictEqual(err, [{id: 1}]);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('createStory', () => {
      it('should insert story and resolve story id for first story', (done) => {
        const db = {
          get: (query, cb) => cb(null, undefined),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .createStory('John')
          .then((id) => {
            assert.strictEqual(id, 1);
            done();
          })
          .catch((err) => done(err));
      });

      it('should insert story and resolve id if story is present', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 1}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .createStory('John')
          .then((id) => {
            assert.strictEqual(id, 2);
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject when there is an error in getting id', async () => {
        const db = {
          get: (query, cb) => cb({err: 'error'}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        await assert.rejects(() => database.createStory('John'));
      });

      it('should reject when there is error in inserting a story', async () => {
        const db = {
          get: (query, cb) => cb(null, {id: 1}),
          exec: (query, cb) => cb({err: 'error'}),
        };
        const database = new Database(db);
        await assert.rejects(() => database.createStory('John'));
      });
    });

    describe('updateStory', () => {
      it('should update the story with given title and content', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 1}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .updateStory(1, 'Title', 'John', 'Content')
          .then((result) => {
            assert.deepStrictEqual(result, {status: 'Story updated'});
            done();
          })
          .catch((err) => done(err));
      });
      it('should not update story and give error if id not found', (done) => {
        const db = {
          get: (query, cb) => cb(null, undefined),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .updateStory(1, 'Title', 'John', 'Content')
          .catch((result) => {
            assert.deepStrictEqual(result, {error: 'No draft found'});
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('getDrafts', () => {
      it('should resolve all the drafts', (done) => {
        const db = {all: (query, cb) => cb(null, [{id: 1}])};
        const database = new Database(db);
        database
          .getDrafts()
          .then((rows) => {
            assert.deepStrictEqual(rows, [{id: 1}]);
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject when there is an error', async () => {
        const db = {all: (query, cb) => cb({err: 'error'})};
        const database = new Database(db);
        await assert.rejects(() => database.getDrafts());
      });
    });

    describe('addUser', () => {
      it('should not reject when adding a user', (done) => {
        const db = {exec: (query, cb) => cb()};
        const database = new Database(db);
        database.addUser('query').then(() => {
          done();
        });
      });

      it('should reject when adding a user already present', (done) => {
        const db = {exec: (query, cb) => cb('Err')};
        const database = new Database(db);
        database.addUser('query').catch((err) => {
          assert.strictEqual(err, 'Err');
          done();
        });
      });
    });

    describe('getUserDetails', () => {
      it('should resolve userDetails if user is present', (done) => {
        const userDetails = {username: 'some one', avatar_url: 'avatar'};
        const db = {
          get: (query, cb) => cb(null, userDetails),
          all: (query, cb) => {
            if (query.includes('followers')) {
              return cb(null, [{id: 1, username: 'some one'}]);
            }
            cb(null, [{title: 'title', content: 'content'}]);
          },
        };
        const database = new Database(db);
        database.getUserDetails(1).then((details) => {
          const expected = {
            username: 'some one',
            avatar_url: 'avatar',
            followers: [{id: 1, username: 'some one'}],
            following: [{id: 1, username: 'some one'}],
            stories: [{title: 'title', content: 'content'}],
          };
          assert.deepStrictEqual(details, expected);
          done();
        });
      });

      it('should resolve userDetails if user is present', (done) => {
        const db = {get: (query, cb) => cb()};
        const database = new Database(db);
        database.getUserDetails(1).catch(({error}) => {
          assert.strictEqual(error, 'No user found');
          done();
        });
      });
    });

    describe('addTags', () => {
      it('should resolve with status for tags found', (done) => {
        const db = {exec: (query, cb) => cb(null)};
        const database = new Database(db);
        database
          .addTags(1, ['tag1'])
          .then((res) => {
            assert.deepStrictEqual(res, {status: 'Added tags'});
            done();
          })
          .catch((err) => done(err));
      });

      it('should resolve with error for no tags specified', (done) => {
        const db = {exec: (query, cb) => cb(null)};
        const database = new Database(db);
        database
          .addTags(1, [])
          .then((res) => {
            assert.deepStrictEqual(res, {error: 'No tags to add'});
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('publish', () => {
      const content = '[{type: "paragraph"}]';
      it('should resolve with status published for story found', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 5, title: 'Title', content}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .publish(1, 1)
          .then((result) => {
            assert.deepStrictEqual(result, {status: 'Published'});
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject if the story already published', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 5, title: 'Title', content}),
          exec: (query, cb) => cb({err: 'not published'}),
        };
        const database = new Database(db);
        database
          .publish(1, 1)
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'Already published'});
            done();
          })
          .catch((err) => done(err));
      });
      it('should reject if the draft not found to publish', (done) => {
        const db = {get: (query, cb) => cb(null, undefined)};
        const database = new Database(db);
        database
          .publish(1, 1)
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'No draft found'});
            done();
          })
          .catch((err) => done(err));
      });
      it('should reject if the title and content is empty', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 5, title: '', content: '[]'}),
        };
        const database = new Database(db);
        database
          .publish(1, 1)
          .catch((err) => {
            assert.deepStrictEqual(err, {
              error: 'Cannot publish a story with empty title and content',
            });
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('getResponses', () => {
      const response = {
        id: 1,
        responded_on: 1,
        responded_by: 1,
        responded_at: 'some time',
        response: 'response',
      };
      it('should give list of responses for existing story id', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 1}),
          all: (query, cb) => cb(null, [response]),
        };
        const database = new Database(db);
        database
          .getResponses(1)
          .then((res) => {
            assert.deepStrictEqual(res, [response]);
            done();
          })
          .catch((err) => done(err));
      });
      it('should reject for unknown id', async () => {
        const db = {get: (query, cb) => cb({err: 'unknown id'})};
        const database = new Database(db);
        await assert.rejects(() => database.getResponses(100));
      });
    });

    describe('getDraft', () => {
      it('should resolve with draft for given draft id', (done) => {
        const draft = {id: 5, title: 'Title', content: '[]'};
        const db = {get: (query, cb) => cb(null, draft)};
        const database = new Database(db);
        database
          .getDraft(1, 1)
          .then((res) => {
            assert.deepStrictEqual(res, draft);
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject with no draft found for unknown id', (done) => {
        const db = {get: (query, cb) => cb(null, undefined)};
        const database = new Database(db);
        database
          .getDraft(1, 1)
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'No draft found'});
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('followAuthor', () => {
      it('should resolve with status for following an author', (done) => {
        const db = {
          get: (query, cb) => {
            if (query.includes(58025419)) {
              return cb(null, undefined);
            }
            cb(null, {id: 58025419});
          },
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .followAuthor(58025419, 58025056)
          .then((res) => {
            assert.deepStrictEqual(res, {status: 'Following'});
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject for following yourself', (done) => {
        const db = {};
        const database = new Database(db);
        database
          .followAuthor(58025419, 58025419)
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'You cannot follow yourself'});
            done();
          })
          .catch((err) => done(err));
      });
      it('should reject for following an author not present', (done) => {
        const db = {get: (query, cb) => cb(null, undefined)};
        const database = new Database(db);
        database
          .followAuthor(58025419, 1)
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'No author found'});
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject for following an author not present', (done) => {
        const db = {
          get: (query, cb) => {
            if (query.includes(58025419)) {
              return cb(null, {id: 58025419});
            }
            cb(null, {id: 1});
          },
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .followAuthor(58025419, 1)
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'Already following'});
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('addResponse', () => {
      it('should add response if the story is published', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 2}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .addResponse(2, 58025419, 'some response')
          .then((res) => {
            assert.deepStrictEqual(res, {status: 'added'});
            done();
          })
          .catch((err) => done(err));
      });
      it('should reject if the given story id is unknown', (done) => {
        const db = {
          get: (query, cb) => cb(null, undefined),
        };
        const database = new Database(db);
        database
          .addResponse(100, 58025419, 'response')
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'unknown id'});
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('clap', () => {
      it('should add clap if the user is not already clapped', (done) => {
        const db = {
          get: (query, cb) =>
            query.includes('clapped_by')
              ? cb(null, {isClapped: 0})
              : cb(null, {clapsCount: 2}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .clap(2, 58025419)
          .then((res) => {
            assert.deepStrictEqual(res, {isClapped: true, clapsCount: 3});
            done();
          })
          .catch((err) => done(err));
      });

      it('should remove clap if the user already clapped', (done) => {
        const db = {
          get: (query, cb) =>
            query.includes('clapped_by')
              ? cb(null, {isClapped: 1})
              : cb(null, {clapsCount: 2}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .clap(2, 58025419)
          .then((res) => {
            assert.deepStrictEqual(res, {
              isClapped: false,
              clapsCount: 1,
            });
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject if story written and user clap are same', (done) => {
        const db = {get: (query, cb) => cb(null, {id: 1, created_by: 111})};
        const database = new Database(db);
        database
          .clap(1, 111)
          .catch((res) => {
            assert.deepStrictEqual(res, {
              error: 'You cannot clap or unclap on your own story',
            });
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject if the given story id is unknown', (done) => {
        const db = {
          get: (query, cb) => cb(null, undefined),
        };
        const database = new Database(db);
        database
          .clap(100, 58025419)
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'No story found'});
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('getFollowingStories', () => {
      it('should resolve with following and my stories', (done) => {
        const stories = [
          {
            id: 1,
            title: 'Title',
            content: '[]',
            author: 'Author',
            authorId: 1111,
          },
        ];
        const db = {all: (query, cb) => cb(null, stories)};
        const database = new Database(db);
        database.getFollowingStories(1111).then((res) => {
          assert.deepStrictEqual(res, stories);
          done();
        });
      });
    });

    describe('unFollowAuthor', () => {
      it('should resolve status unfollowed if already following', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 111}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .unFollowAuthor(111, 222)
          .then((res) => {
            assert.deepStrictEqual(res, {status: 'Unfollowed'});
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject error if not already following', (done) => {
        const db = {
          get: (query, cb) => cb(null, undefined),
        };
        const database = new Database(db);
        database
          .unFollowAuthor(111, 222)
          .catch((err) => {
            assert.deepStrictEqual(err, {
              error: 'You are not a follower of this author',
            });
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('getUserPublishedStories', () => {
      it('should get published stories of a user', (done) => {
        const db = {all: (query, cb) => cb(null, [{id: 1, title: 'Title'}])};
        const database = new Database(db);
        database
          .getUserPublishedStories(1)
          .then((res) => {
            assert.deepStrictEqual(res, [{id: 1, title: 'Title'}]);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('getPublishedStoryDetails', () => {
      it('should reject unknown id for invalid story id', (done) => {
        const db = {get: (query, cb) => cb(null, undefined)};
        const database = new Database(db);
        database
          .getPublishedStoryDetails(1000, 10)
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'No story found'});
            done();
          })
          .catch((err) => done(err));
      });

      it('should give all the details of a published story', (done) => {
        const resForGet = {
          responsesCount: 4,
          clapsCount: 3,
          isClapped: 1,
          id: 1,
          title: 'Title',
          Content: '[]',
          authorId: 111,
        };
        const resForAll = [{tag: 'tech'}, {tag: 'popular'}];
        const db = {
          get: (query, cb) => cb(null, resForGet),
          all: (query, cb) => cb(null, resForAll),
          exec: (query, cb) => cb(null),
        };
        const expected = Object.assign(resForGet, {tags: resForAll});
        const database = new Database(db);
        database
          .getPublishedStoryDetails(1, 123)
          .then((result) => {
            assert.deepStrictEqual(result, expected);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('search', () => {
      it('should give matching stories based on the keyword', (done) => {
        const db = {
          all: (query, cb) => {
            if (query.includes('LIKE')) {
              return cb(null, [{id: 1, title: 'title'}]);
            }
            return cb(null, [{tag: 'tag1'}, {tag: 'tag2'}]);
          },
        };
        const database = new Database(db);
        const expected = {
          authorBased: [{id: 1, title: 'title', tags: ['tag1', 'tag2']}],
          tagBased: [{id: 1, title: 'title', tags: ['tag1', 'tag2']}],
          contentBased: [{id: 1, title: 'title', tags: ['tag1', 'tag2']}],
        };
        database
          .search('title')
          .then((result) => {
            assert.deepStrictEqual(result, expected);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('updateViews', () => {
      it('should resolve with updated views for other user story', (done) => {
        const db = {
          get: (query, cb) => cb(null, {views: 1}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .updateViews(111, 1)
          .then((res) => {
            assert.deepStrictEqual(res.views, 1);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('deleteDraft', () => {
      it('should resolve with status deleted if draft is present ', (done) => {
        const draft = {id: 1, title: 'abc', content: '[]'};
        const db = {
          get: (query, cb) => cb(null, {draft}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .deleteDraft(1, 111)
          .then((status) => {
            assert.deepStrictEqual(status, {status: 'deleted'});
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject with error for no draft to delete', (done) => {
        const db = {
          get: (query, cb) => cb(null, undefined),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .deleteDraft(1, 111)
          .catch((error) => {
            assert.deepStrictEqual(error, {error: 'No draft found'});
            done();
          })
          .catch((err) => done(err));
      });
    });
  });
});
