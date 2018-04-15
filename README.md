# Ocean site content

Tool for extracting search text from various websites for inclusion in Ocean supplemental search

### To run:

* Clone this repository
* ```npm install```
* ```npm run spider```

Data should be output as MD files in subdirectories of  output/

### To run for only certain collections:

At times it may be desirable to run the spider only on certain collections. To do that, you can pass the collection name(s) as an argument to ```npm run spider```. Examples:
* ```npm run spider -- centenary```
* ```npm run spider -- centenary biographies```

Please note that the double dash has spaces before and after it. 

### To debug:
* ```npm run debug```
* ```npm run debug -- [collection]```

### Site collections supported so far:

* _centenary_: https://centenary.bahai.us/news -- 250+ news articles about Abdu'l-Baha's travels in America
* _biographies_: https://bahai-library.com/Biographies -- Biographies of prominent Baha'is

### Todo:

* https://reference.bahai.org/fa/ -- Farsi books collection
* https://reference.bahai.org/ar/ -- Arabic books collection
* https://bahai-library.com/UHJ-documents -- UHJ Books
* https://bahai-library.com/UHJ-letters -- UHJ Letters
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
