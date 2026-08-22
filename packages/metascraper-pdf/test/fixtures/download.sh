cd "$(dirname "$0")" || exit 1
nl -ba urls.txt | xargs -n 2 -P 8 sh -c 'curl -fL --retry 3 --retry-all-errors -o "$0.pdf" "$1"'
