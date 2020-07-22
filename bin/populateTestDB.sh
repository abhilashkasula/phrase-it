sqlite3 test/database/test.db << 'END_SQL'

.mode csv
.import test/data/users.csv users
.import test/data/stories.csv stories
.import test/data/published_stories.csv published_stories
.import test/data/claps.csv claps
.import test/data/responses.csv responses
.import test/data/tags.csv tags
.import test/data/followers.csv followers


END_SQL