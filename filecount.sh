#!/bin/bash
# TODO: refactor as node script
echo "| Folder                         | Scraped | Indexed |" > ./filecount.md
echo "| ------------------------------ | ------- | ------- |" >> ./filecount.md
for d in output/*/ ; do
	folder=$(printf %-30s "$(echo "$d" | sed -E 's:^output/(.+)/$:\1:')")
	short=$(printf %5s "$(find $d -type f -name '.*.md' | wc -l | xargs)")
	scraped=$(printf %7s "$(ls -l $d | wc -l | xargs)")
	indexed=$(printf %7s "$([[ -f $d/.index.txt ]] && cat $d/.index.txt | wc -l | xargs)")
	echo "| $folder | $scraped | $indexed |" >> ./filecount.md
done
echo >> ./filecount.md
echo -n $(date) >> ./filecount.md