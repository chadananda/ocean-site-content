#!/bin/bash
echo "Collection	Short	Scraped	Crawled" > ./output/filecount.tsv
for d in output/*/ ; do
	echo "${d:7}	$(find $d -type f -name '.*.md' | wc -l | xargs)	$(ls -l $d | wc -l | xargs)	$([[ -f $d/.index.txt ]] && cat $d/.index.txt | wc -l | xargs)" >> ./output/filecount.tsv;
done