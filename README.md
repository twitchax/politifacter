# politifacter

A utility for aggregating politifact statements.

## Information

**politifacter** is a small command line (and, one day, server) utility written in node.js that allows the user to aggregate politifact scorecards based on [politifact's](http://www.politifact.com/) [API](http://static.politifact.com/api/v2apidoc.html) ([example person](examples/examplePerson.json)).

### Build and Install

From NPM:
```bash
npm install politifacter -g
```

From repo:
```bash
npm build
npm install -g
```

### Testing

```bash
npm test
```

### Compatibility

Node v6.7.0+.

### Examples

#### Local
A basic example follows:
```bash
pf analyze last_name=Obama first_name=Barack
```
yields
```
Selectors: [ name_slug=barack-obama ]

Number of people in selection: 1 [ barack-obama ]
Number of statements in selection: 593
Honesty score: 48.06%
Lying score: 25.13%

            True : [====================] 20.57 ± 0% (122)
     Mostly True : [===========================] 27.49 ± 0% (163)
       Half True : [==========================] 26.81 ± 0% (159)
    Mostly False : [===========] 11.64 ± 0% (69)
           False : [===========] 11.97 ± 0% (71)
   Pants On Fire : [=] 1.52 ± 0% (9)
```

You can also aggregate via:

```bash
pf analyze party.party=Democrat
```
yields
```
Selectors: party.party=Democrat

Number of people in selection: 880
Number of statements in selection: 3973
Honesty score: 44.3%
Lying score: 33.58%

            True : [===================] 19.66 ± 2.11% (781)
     Mostly True : [========================] 24.64 ± 2.14% (979)
       Half True : [======================] 22.12 ± 2.19% (879)
    Mostly False : [==============] 14.45 ± 1.96% (574)
           False : [==============] 14.5 ± 2.04% (576)
   Pants On Fire : [====] 4.63 ± 1.44% (184)
```

or

```bash
pf analyze party.party=Republican
```
yields
```
Selectors: party.party=Republican

Number of people in selection: 969
Number of statements in selection: 5417
Honesty score: 31.02%
Lying score: 49.09%

            True : [==============] 14.57 ± 1.73% (789)
     Mostly True : [================] 16.45 ± 1.78% (891)
       Half True : [===================] 19.9 ± 2% (1078)
    Mostly False : [==================] 18.98 ± 2.02% (1028)
           False : [=====================] 21.97 ± 2.22% (1190)
   Pants On Fire : [========] 8.14 ± 1.52% (441)
```

Range selectors are also allowed:
```bash
pf analyze party.party=Democrat "total_count>=50"
```
yields
```
Selectors: [ party.party=Democrat, total_count>=50 ]

Number of people in selection: 5 [ barack-obama, hillary-clinton, charlie-crist, joe-biden, tim-kaine ]
Number of statements in selection: 1059
Honesty score: 47.59%
Lying score: 26.62%

            True : [====================] 20.68 ± 1.66% (219)
     Mostly True : [==========================] 26.91 ± 2.54% (285)
       Half True : [=========================] 25.78 ± 2.68% (273)
    Mostly False : [=============] 13.31 ± 1.98% (141)
           False : [===========] 11.33 ± 2.1% (120)
   Pants On Fire : [=] 1.98 ± 1.53% (21)
```

#### Web service
There is a small web server included in this package that is propped up.  Here are some example calls.

If you need to know what "selectors" are available, you can call the example API:
```bash
curl http://politifacter.ajroney.com/api/example | python -m json.tool
```
yields
```
{
    "barely_true_count": 69,
    "current_job": "President",
    "false_count": 71,
    "first_name": "Barack",
    "half_true_count": 159,
    "home_state": "Illinois",
    "id": 4,
    "last_name": "Obama",
    "mostly_true_count": 163,
    "name_slug": "barack-obama",
    "pants_count": 9,
    "party": {
        "id": 1,
        "party": "Democrat",
        "party_slug": "democrat",
        "resource_uri": "/api/v/2/party/1/"
    },
    "photo": "http://static.politifact.com.s3.amazonaws.com/politifact/mugs/NYT_OBAMA_1.jpg",
    "primary_edition": {
        "edition": "National",
        "edition_slug": "truth-o-meter",
        "id": 1,
        "meter_name": "The Truth-O-Meter<sup>TM</sup>",
        "resource_uri": "/api/v/2/edition/1/"
    },
    "promise_meter_cutout": null,
    "resource_uri": "/api/v/2/person/4/",
    "total_count": 625,
    "true_count": 122,
    "website": "http://www.whitehouse.gov/"
}
```

Then, you can make an analyze call:
```bash
curl http://politifacter.ajroney.com/api/analyze/home_state=Illinois,party.party=Democrat,total_count%3E=5/text
```
yields
```
Selectors: [ home_state=Illinois, party.party=Democrat, total_count>=5 ]

Number of people in selection: 6 [ barack-obama, michelle-obama, rahm-emanuel, richard-durbin, arne-duncan, luis-gutierrez ]
Number of statements in selection: 626
Honesty score: 48.25%
Lying score: 25.40%

            True : [====================] 20.45 ± 10.47% (128)
     Mostly True : [===========================] 27.8 ± 14.22% (174)
       Half True : [==========================] 26.36 ± 7.81% (165)
    Mostly False : [===========] 11.34 ± 6.15% (71)
           False : [============] 12.46 ± 9.4% (78)
   Pants On Fire : [=] 1.6 ± 4.9% (10)
```

## License

```
The MIT License (MIT)

Copyright (c) 2016 Aaron Roney

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```