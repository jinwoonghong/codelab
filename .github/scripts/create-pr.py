#!/usr/bin/env python3
import os
import sys
import json
import subprocess

def create_pr():
    # 현재 브랜치 가져오기
    branch = subprocess.check_output(['git', 'branch', '--show-current']).decode().strip()

    # 커밋 메시지 가져오기 (제목용)
    title = subprocess.check_output(['git', 'log', '-1', '--pretty=format:%s']).decode().strip()

    # PR 본문 파일 읽기
    body_file = 'projects/tower-stacker/PR_DESCRIPTION.md'
    if os.path.exists(body_file):
        with open(body_file, 'r', encoding='utf-8') as f:
            body = f.read()
    else:
        body = subprocess.check_output(['git', 'log', '-1', '--pretty=format:%B']).decode().strip()

    # gh CLI 사용 시도
    try:
        result = subprocess.run([
            'gh', 'pr', 'create',
            '--title', title,
            '--body', body,
            '--base', 'main',
            '--head', branch
        ], capture_output=True, text=True, check=True)

        print("✅ PR created successfully!")
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ gh CLI failed: {e.stderr}")
        return False
    except FileNotFoundError:
        print("❌ gh CLI not found")
        return False

if __name__ == '__main__':
    if create_pr():
        sys.exit(0)
    else:
        print("\n⚠️ Automatic PR creation failed.")
        print("Please create PR manually:")
        branch = subprocess.check_output(['git', 'branch', '--show-current']).decode().strip()
        print(f"https://github.com/jinwoonghong/codelab/compare/main...{branch}?expand=1")
        sys.exit(1)
