#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

fail() {
  echo "Gizlilik kontrolü başarısız: $1" >&2
  exit 1
}

grep -qx '/design/' .gitignore || fail ".gitignore içinde /design/ satırı yok"

if [ -d design ]; then
  git check-ignore -q design || fail "design klasörü yok sayılmıyor"
fi

[ -z "$(git ls-files design)" ] || fail "design klasöründen izlenen dosyalar var"

if git diff --cached --name-only | grep -q '^design/'; then
  fail "hazırlanan değişikliklerde design dosyası var"
fi

if git rev-list --all | while read -r commit; do git ls-tree -r --name-only "$commit" | grep -q '^design/' && echo "$commit"; done | grep -q .; then
  fail "geçmişteki bir commit design dosyası içeriyor"
fi

if git rev-list --all | xargs -I{} git ls-tree -r --name-only {} | grep -qiE '\.dc\.html$|(^|/)canvas\.json$|(^|/)theme\.css$'; then
  fail "geçmişte tasarım kaynak dosyası bulundu"
fi

echo "Gizlilik kontrolü başarılı: design klasörü depoda yok."
