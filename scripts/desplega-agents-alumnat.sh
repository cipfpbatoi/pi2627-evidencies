#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"

org="${GITHUB_CLASSROOM_ORG:-batoi-dwes-2026}"
prefix="microreptes-"
branch="main"
source_root="${GITHUB_STUDENT_TEMPLATE_LOCAL:-$root_dir/../dwes-microreptes-alumnes}"
apply=false

usage() {
  printf '%s\n' \
    "Ús: $0 [--apply] [--org ORG] [--prefix PREFIX] [--branch BRANCA] [--source DIRECTORI]" \
    "" \
    "Sense --apply, clona els repositoris i mostra els canvis sense publicar-los." \
    "Amb --apply, commiteja exclusivament els AGENTS.md, CLAUDE.md i GEMINI.md i fa push."
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)
      apply=true
      shift
      ;;
    --org|--prefix|--branch|--source)
      [[ $# -ge 2 ]] || { echo "Falta el valor de $1" >&2; exit 2; }
      case "$1" in
        --org) org="$2" ;;
        --prefix) prefix="$2" ;;
        --branch) branch="$2" ;;
        --source) source_root="$2" ;;
      esac
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Argument desconegut: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

source_root="$(cd "$source_root" && pwd)"
for required in \
  "$source_root/AGENTS.md" \
  "$source_root/CLAUDE.md" \
  "$source_root/GEMINI.md" \
  "$source_root/src/AGENTS.md" \
  "$source_root/src/CLAUDE.md" \
  "$source_root/src/GEMINI.md"; do
  [[ -f "$required" ]] || { echo "Falta el fitxer font: $required" >&2; exit 1; }
done

command -v gh >/dev/null || { echo "Falta GitHub CLI (gh)." >&2; exit 1; }
gh auth status >/dev/null

work_root="$(mktemp -d /tmp/desplega-agents-alumnat.XXXXXX)"
cleanup() {
  if [[ "$work_root" == /tmp/desplega-agents-alumnat.* ]]; then
    rm -rf "$work_root"
  fi
}
trap cleanup EXIT

repos="$(gh api --paginate -H 'Accept: application/vnd.github+json' \
  "orgs/$org/repos?per_page=100&type=all" \
  --jq ".[] | select(.name | startswith(\"$prefix\")) | .name")"

[[ -n "$repos" ]] || { echo "No s'han trobat repositoris $prefix* en $org." >&2; exit 1; }

updated=0
unchanged=0
failed=0

while IFS= read -r repo; do
  [[ -n "$repo" ]] || continue
  repo_dir="$work_root/$repo"
  echo "[$repo] clonant $branch"

  if ! gh repo clone "$org/$repo" "$repo_dir" -- --depth=1 --branch "$branch"; then
    echo "[$repo] ERROR: no s'ha pogut clonar" >&2
    failed=$((failed + 1))
    continue
  fi

  mkdir -p "$repo_dir/src"
  cp "$source_root/AGENTS.md" "$repo_dir/AGENTS.md"
  cp "$source_root/CLAUDE.md" "$repo_dir/CLAUDE.md"
  cp "$source_root/GEMINI.md" "$repo_dir/GEMINI.md"
  cp "$source_root/src/AGENTS.md" "$repo_dir/src/AGENTS.md"
  cp "$source_root/src/CLAUDE.md" "$repo_dir/src/CLAUDE.md"
  cp "$source_root/src/GEMINI.md" "$repo_dir/src/GEMINI.md"
  git -C "$repo_dir" add -f \
    AGENTS.md CLAUDE.md GEMINI.md src/AGENTS.md src/CLAUDE.md src/GEMINI.md

  staged="$(git -C "$repo_dir" diff --cached --name-only)"
  if [[ -z "$staged" ]]; then
    echo "[$repo] sense canvis"
    unchanged=$((unchanged + 1))
    continue
  fi

  invalid="$(printf '%s\n' "$staged" | sed \
    -e '/^AGENTS\.md$/d' \
    -e '/^CLAUDE\.md$/d' \
    -e '/^GEMINI\.md$/d' \
    -e '/^src\/AGENTS\.md$/d' \
    -e '/^src\/CLAUDE\.md$/d' \
    -e '/^src\/GEMINI\.md$/d' \
    -e '/^$/d')"
  if [[ -n "$invalid" ]]; then
    echo "[$repo] ERROR: staging inesperat:" >&2
    echo "$staged" >&2
    failed=$((failed + 1))
    continue
  fi

  if [[ "$apply" != true ]]; then
    echo "[$repo] simulació:"
    git -C "$repo_dir" diff --cached --stat
    updated=$((updated + 1))
    continue
  fi

  git -C "$repo_dir" config user.name "DWES Teacher Automation"
  git -C "$repo_dir" config user.email "41898282+github-actions[bot]@users.noreply.github.com"
  git -C "$repo_dir" commit -m "Actualitza les regles d'ús dels agents d'IA"

  if git -C "$repo_dir" push origin "HEAD:$branch"; then
    echo "[$repo] actualitzat"
    updated=$((updated + 1))
  else
    echo "[$repo] ERROR: no s'ha pogut publicar" >&2
    failed=$((failed + 1))
  fi
done <<< "$repos"

mode="dry-run"
[[ "$apply" == true ]] && mode="apply"
echo "RESULTAT mode=$mode changed=$updated unchanged=$unchanged failed=$failed"
[[ "$failed" -eq 0 ]]
