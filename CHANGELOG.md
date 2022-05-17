## Wikipedia connector Mediakunst.net

2022-05-16 V1.7.0
- chg: new layout for the stylesheet
- chg: stop flicker of back to article (should update index.surface.html also in calling project)
- add: readme.md adjusted
- fix: margin so scrollbar does not hit the arrows
- fix: test result in errors (test were wrong)
- fix: test result in bitmap in /lib directory
- fix: update wtf scanner

2021-09-26
- listing number per alinea

2021-08-26
- fix: image is not returned

2021-08-12
version 1.2.x
- add: images are download to the server and name {Q id}.{extension}
- chg: logging can be configured by Wiki({logger: [logger object]})

2021-08-11
version 1.1.x
- add: block list can be set in the default.json. Scan title for full title
- add: space in title do not count as difference
- add: capitals do not count as changes
- add: scans for quote and marks them in the paragraph
- add: retrieve images from the wiki page. First is defined as bio image
- add: images with (ë  are now loaded correct
- fix: force reload of stylesheet

2021-07-10
version 1.0.1
- add documentation
- add index.js as connector to the outside world
- add cleaned json code result
- add mergeTemplate en mergeFileName for easy exports
- fix: error is reported if qId does not exists

2021-07-08
version 1.0.0
- initial release
