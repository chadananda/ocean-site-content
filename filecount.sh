#!/bin/bash
echo "Collection	Short	Scraped	Crawled" > ./output/filecount.tsv
for d in output/*/ ; do
	echo "${d:7}	$(find $d -type f -name '.*.md' | wc -l)	$(ls -l $d | wc -l)	$([[ -f $d/.index.txt ]] && cat $d/.index.txt | wc -l)" >> ./output/filecount.tsv;
done