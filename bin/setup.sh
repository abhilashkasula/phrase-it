#! /bin/bash
git config --local commit.template ./git_commit.template

cat <<EOF > .git/hooks/pre-commit  
npm run allTests
if [ \$? != 0 ]; then 
    exit 1
fi
EOF

chmod +x .git/hooks/pre-commit

cat <<EOF > .git/hooks/pre-push  
npm run allTests 
if [ \$? != 0 ]; then 
    exit 1
fi
EOF

chmod +x .git/hooks/pre-push
chmod +x bin/resetProductionDB.sh
chmod +x bin/resetTestDB.sh
chmod +x bin/populateTestDB.sh

npm install
