#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "═════════════════════════════════════════════"
echo "  Ventile dossards + maj CSV + commit + push"
echo "═════════════════════════════════════════════"
echo ""

latest_csv=$(ls -t dossards/participants_anonymises_*.csv 2>/dev/null | head -1)

moved=0
for f in dossards/*.png; do
    [ -e "$f" ] || continue
    num=$(basename "$f" .png)
    first=${num:0:1}
    case "$first" in
        0) dest="dossards/course-5km" ;;
        1) dest="dossards/course-10km" ;;
        2) dest="dossards/course-21km" ;;
        3) dest="dossards/marche-5km" ;;
        4) dest="dossards/marche-10km" ;;
        5) dest="dossards/marche-21km" ;;
        *) echo "⚠️  Plage inconnue pour $f, ignoré"; continue ;;
    esac
    mv "$f" "$dest/"
    moved=$((moved+1))
done

echo "→ $moved dossard(s) ventilé(s)"

csv_updated=false
if [ -n "$latest_csv" ]; then
    mv "$latest_csv" "data/participants_anonymises_Challenge_Connecté_2026.csv"
    csv_updated=true
    echo "→ CSV mis à jour"
fi

orphans=$(python3 - <<'PY'
import csv, glob, os
csv_path = "data/participants_anonymises_Challenge_Connecté_2026.csv"
referenced = set()
with open(csv_path, encoding='utf-8') as f:
    reader = csv.reader(f, delimiter=';')
    next(reader)
    for row in reader:
        for cell in row[4:]:
            cell = cell.strip()
            if cell:
                referenced.add(cell)
on_disk = set()
for d in ["course-5km","course-10km","course-21km","marche-5km","marche-10km","marche-21km"]:
    for f in glob.glob(f"dossards/{d}/*.png"):
        on_disk.add(f.replace("dossards/", ""))
orphans = on_disk - referenced
for o in orphans:
    os.remove(f"dossards/{o}")
print(len(orphans))
PY
)

echo "→ $orphans orphelin(s) supprimé(s)"
echo ""

if [ -z "$(git status --porcelain)" ]; then
    echo "Rien à commit, working tree propre."
    read -p "Appuyez sur Entrée pour fermer..."
    exit 0
fi

ventile_word="dossard"; [ "$moved" -ne 1 ] && ventile_word="dossards"
orphan_word="orphelin"; [ "$orphans" -ne 1 ] && orphan_word="orphelins"

msg_body=""
add_part() {
    [ -n "$msg_body" ] && msg_body="$msg_body + "
    msg_body="${msg_body}$1"
}
[ "$moved" -gt 0 ] && add_part "ventile $moved $ventile_word"
[ "$orphans" -gt 0 ] && add_part "supprime $orphans $orphan_word"
[ "$csv_updated" = true ] && add_part "met à jour CSV anonymisé"

msg="feat(dossards): $msg_body"

git add -A
git commit -m "$msg"
git push

echo ""
echo "✅ Pushé sur main"
echo "   $msg"
echo ""
read -p "Appuyez sur Entrée pour fermer..."
