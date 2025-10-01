#!/usr/bin/env bash
set -euo pipefail

# Dual push to GitLab (origin) and GitHub (github)
# Defaults:
#   origin = git@gitlab.com:luciformresearch/lr_xmlparser.git
#   github = https://github.com/LuciformResearch/LR_XMLParser.git
# Usage: ./dual_push.sh [--branch BRANCH] [--message "commit msg"]

GL_URL_DEFAULT="git@gitlab.com:luciformresearch/lr_xmlparser.git"
GH_URL_DEFAULT="https://github.com/LuciformResearch/LR_XMLParser.git"

BRANCH=""
MESSAGE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch) BRANCH="${2:-}"; shift 2;;
    --message) MESSAGE="${2:-}"; shift 2;;
    -h|--help)
      echo "Usage: $0 [--branch BRANCH] [--message \"commit message\"]"; exit 0;;
    *) echo "Unknown arg: $1" >&2; exit 2;;
  esac
done

if [[ -z "$BRANCH" ]]; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
fi
echo "[push] Branch: $BRANCH"

# Ensure remotes
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "[setup] Adding origin -> $GL_URL_DEFAULT"
  git remote add origin "$GL_URL_DEFAULT"
fi
if ! git remote get-url github >/dev/null 2>&1; then
  echo "[setup] Adding github -> $GH_URL_DEFAULT"
  git remote add github "$GH_URL_DEFAULT"
fi

echo "[remotes]" && git remote -v

# Commit if needed
if [[ -n "$(git status --porcelain)" ]]; then
  if [[ -z "$MESSAGE" ]]; then
    echo "❌ ERREUR: changements non committés et aucun message fourni."
    echo "   Utilisez: $0 --message \"votre message\""
    exit 1
  fi
  echo "[commit] $MESSAGE"
  git add -A
  git commit -m "$MESSAGE"
else
  echo "[info] Aucun changement à committer"
fi

echo "[push] GitLab (origin)"
git push -u origin "$BRANCH" --follow-tags

echo "[push] GitHub (github)"
git push github "$BRANCH" --follow-tags

echo "[done] Pushed to both remotes"