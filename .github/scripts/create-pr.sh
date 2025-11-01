#!/bin/bash

# Auto Create Pull Request Script
# 사용법: ./create-pr.sh "PR 제목" "PR 본문 파일 경로"

set -e

# 현재 브랜치 가져오기
CURRENT_BRANCH=$(git branch --show-current)

# PR 제목 (인자로 받거나 마지막 커밋 메시지 사용)
TITLE="${1:-$(git log -1 --pretty=format:%s)}"

# PR 본문 파일 경로 (인자로 받거나 기본값 사용)
BODY_FILE="${2:-projects/tower-stacker/PR_DESCRIPTION.md}"

# Base 브랜치
BASE_BRANCH="${3:-main}"

echo "🚀 Creating Pull Request..."
echo "  Branch: $CURRENT_BRANCH -> $BASE_BRANCH"
echo "  Title: $TITLE"
echo "  Body: $BODY_FILE"
echo ""

# GitHub CLI로 PR 생성 시도
if command -v gh &> /dev/null; then
    echo "✓ Using GitHub CLI (gh)"

    if [ -f "$BODY_FILE" ]; then
        gh pr create \
            --title "$TITLE" \
            --body-file "$BODY_FILE" \
            --base "$BASE_BRANCH" \
            --head "$CURRENT_BRANCH"
    else
        gh pr create \
            --title "$TITLE" \
            --body "$(git log -1 --pretty=format:%B)" \
            --base "$BASE_BRANCH" \
            --head "$CURRENT_BRANCH"
    fi

    echo "✅ Pull Request created successfully!"
    exit 0
fi

# GitHub CLI가 없으면 API 사용
echo "⚠️  GitHub CLI not available, using GitHub API..."

# GitHub API를 사용한 PR 생성
REPO_OWNER="jinwoonghong"
REPO_NAME="codelab"

# PR 본문 읽기
if [ -f "$BODY_FILE" ]; then
    BODY=$(cat "$BODY_FILE" | jq -Rs .)
else
    BODY=$(git log -1 --pretty=format:%B | jq -Rs .)
fi

# GitHub Token 확인
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable not set"
    echo ""
    echo "Please set GITHUB_TOKEN:"
    echo "  export GITHUB_TOKEN=your_github_personal_access_token"
    echo ""
    echo "Or use the web interface:"
    echo "  https://github.com/$REPO_OWNER/$REPO_NAME/compare/$BASE_BRANCH...$CURRENT_BRANCH?expand=1"
    exit 1
fi

# API 요청 본문 생성
JSON_PAYLOAD=$(cat <<EOF
{
  "title": "$TITLE",
  "body": $BODY,
  "head": "$CURRENT_BRANCH",
  "base": "$BASE_BRANCH"
}
EOF
)

# GitHub API로 PR 생성
RESPONSE=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -d "$JSON_PAYLOAD" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pulls")

# 결과 확인
PR_URL=$(echo "$RESPONSE" | jq -r '.html_url // empty')

if [ -n "$PR_URL" ]; then
    echo "✅ Pull Request created successfully!"
    echo "   URL: $PR_URL"
else
    echo "❌ Failed to create Pull Request"
    echo "$RESPONSE" | jq .
    exit 1
fi
