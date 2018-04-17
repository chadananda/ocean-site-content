# Ocean site content

Tool for extracting search text from various websites for inclusion in Ocean supplemental search

### To run:

* Clone this repository
* ```npm install```
* ```npm run spider```

Data should be output as MD files in subdirectories of the ```output/``` folder

### To run for only certain collections:

At times it may be desirable to run the spider only on certain collections. To do that, you can pass the collection name(s) as an argument to ```npm run spider -- ```. Please note that the double dash has spaces before and after it. Examples:

* ```npm run spider -- centenary```
* ```npm run spider -- centenary biographies```

There should be a VS Code launch profile for debugging any implemented collections.

### To scrape a single file:

You can scrape a single file, as long as that file is within the output folder. To do so, simply pass the full path to the file as the argument to ```npm run spider -- ```. Again, note the spaces around the double dash.

* ```npm run spider -- /path/to/file.json```

There is also a VS Code launch profile ("Scrape current file") that will scrape whatever file is open in the editor.

### To debug:

* ```npm run debug```
* ```npm run debug -- [collection]```

### Site collections supported so far:

* _centenary_: https://centenary.bahai.us/news -- 250+ news articles about Abdu'l-Baha's travels in America
* _biographies_: https://bahai-library.com/Biographies -- Biographies of prominent Baha'is
* _uhj-documents_: https://bahai-library.com/UHJ-documents -- UHJ Books
* _uhj-letters_: https://bahai-library.com/UHJ-letters -- UHJ Letters

### Todo:

* https://reference.bahai.org/fa/ -- Farsi books collection
* https://reference.bahai.org/ar/ -- Arabic books collection
* https://bahai-library.com/Guardian -- Unpublished Letters of Shoghi Effendi
* https://bahai-library.com/Pilgrims -- Pilgrim Notes
* https://bahai-library.com/Translations -- Provisional Translations
* https://bahai-library.com/Articles -- Published Articles
* https://bahai-library.com/Articles-unpublished -- Unpublished articles
* https://bahai-library.com/Encyclopedia -- Encylopedia articles
* https://bahai-library.com/Newspapers -- Newspaper articles
* https://bahai-library.com/Letters -- Personal letters from historical figures
* https://bahai-library.com/Theses -- Theses papers by Baha'i academics
* https://bahai-library.com/Talks -- Transcriptions of Talks

* http://www.bahai-library.net/spanish/ -- Spanish library of books
