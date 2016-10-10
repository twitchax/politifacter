# politifacter

A utility for aggregating politifact statements.

## Information

**politifacter** is a small command line (and, one day, server) utility written in node.js that allows the user to aggregate politifact scorecards based on [politifact's](http://www.politifact.com/) [API](http://static.politifact.com/api/v2apidoc.html).

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
pf analyze last_name=Obama,first_name=Barack
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
pf analyze "party.party=Democrat,total_count>=50"
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

Also, there is a compare feature:
```bash
pf compare "party.party=Democrat,total_count>=50|name_slug=hillary-clinton;name_slug=barack-obama"
```
yields
```
[ name_slug == barack-obama, party.party == Democrat, total_count >= 50 ]
   [<<<<<<<<<<<<<<<<<<<<<---------------------------===========================~~~~~~~~~~~~------------>]

[ name_slug == hillary-clinton, party.party == Democrat, total_count >= 50 ]
   [<<<<<<<<<<<<<<<<<<<<<<<----------------------------======================~~~~~~~~~~~~~~~---------->>]
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

Finally, you can also get the statistics objec that is aggregated on the server:
```bash
curl http://politifacter.ajroney.com/api/analyze/party.party=Democrat,total_count%3E=50/statistics | python -m json.tool
```
yields
```
{
    "falseArray": [
        71,
        27,
        9,
        10,
        3
    ],
    "halfTrueArray": [
        159,
        58,
        20,
        21,
        15
    ],
    "mostlyFalseArray": [
        69,
        39,
        15,
        11,
        7
    ],
    "mostlyTrueArray": [
        163,
        73,
        19,
        16,
        14
    ],
    "name": "",
    "pantsOnFireArray": [
        9,
        6,
        2,
        4,
        0
    ],
    "people": [
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
        },
        {
            "barely_true_count": 39,
            "current_job": "Presidential candidate",
            "false_count": 27,
            "first_name": "Hillary",
            "half_true_count": 58,
            "home_state": "New York",
            "id": 1,
            "last_name": "Clinton",
            "mostly_true_count": 73,
            "name_slug": "hillary-clinton",
            "pants_count": 6,
            "party": {
                "id": 1,
                "party": "Democrat",
                "party_slug": "democrat",
                "resource_uri": "/api/v/2/party/1/"
            },
            "photo": "http://static.politifact.com.s3.amazonaws.com/politifact/mugs/GYI_659046701_585968470.jpg",
            "primary_edition": {
                "edition": "National",
                "edition_slug": "truth-o-meter",
                "id": 1,
                "meter_name": "The Truth-O-Meter<sup>TM</sup>",
                "resource_uri": "/api/v/2/edition/1/"
            },
            "promise_meter_cutout": null,
            "resource_uri": "/api/v/2/person/1/",
            "total_count": 270,
            "true_count": 60,
            "website": "http://www.hillaryclinton.com/"
        },
        {
            "barely_true_count": 15,
            "current_job": "",
            "false_count": 9,
            "first_name": "Charlie",
            "half_true_count": 20,
            "home_state": "Florida",
            "id": 257,
            "last_name": "Crist",
            "mostly_true_count": 19,
            "name_slug": "charlie-crist",
            "pants_count": 2,
            "party": {
                "id": 1,
                "party": "Democrat",
                "party_slug": "democrat",
                "resource_uri": "/api/v/2/party/1/"
            },
            "photo": "http://static.politifact.com.s3.amazonaws.com/politifact/mugs/crist.JPG",
            "primary_edition": {
                "edition": "Florida",
                "edition_slug": "florida",
                "id": 4,
                "meter_name": "The Florida Truth-O-Meter",
                "resource_uri": "/api/v/2/edition/4/"
            },
            "promise_meter_cutout": null,
            "resource_uri": "/api/v/2/person/257/",
            "total_count": 90,
            "true_count": 15,
            "website": ""
        },
        {
            "barely_true_count": 11,
            "current_job": "U.S. senator",
            "false_count": 10,
            "first_name": "Joe",
            "half_true_count": 21,
            "home_state": "Delaware",
            "id": 11,
            "last_name": "Biden",
            "mostly_true_count": 16,
            "name_slug": "joe-biden",
            "pants_count": 4,
            "party": {
                "id": 1,
                "party": "Democrat",
                "party_slug": "democrat",
                "resource_uri": "/api/v/2/party/1/"
            },
            "photo": "http://static.politifact.com.s3.amazonaws.com/mugs/mug-joebiden.jpg",
            "primary_edition": {
                "edition": "National",
                "edition_slug": "truth-o-meter",
                "id": 1,
                "meter_name": "The Truth-O-Meter<sup>TM</sup>",
                "resource_uri": "/api/v/2/edition/1/"
            },
            "promise_meter_cutout": null,
            "resource_uri": "/api/v/2/person/11/",
            "total_count": 78,
            "true_count": 13,
            "website": "http://www.joebiden.com/"
        },
        {
            "barely_true_count": 7,
            "current_job": "U.S. Senator",
            "false_count": 3,
            "first_name": "Tim",
            "half_true_count": 15,
            "home_state": "Virginia",
            "id": 424,
            "last_name": "Kaine",
            "mostly_true_count": 14,
            "name_slug": "tim-kaine",
            "pants_count": 0,
            "party": {
                "id": 1,
                "party": "Democrat",
                "party_slug": "democrat",
                "resource_uri": "/api/v/2/party/1/"
            },
            "photo": "http://static.politifact.com.s3.amazonaws.com/politifact/mugs/AP_NCCB111_CAMPAIGN_2016_KA.JPG",
            "primary_edition": {
                "edition": "Virginia",
                "edition_slug": "virginia",
                "id": 10,
                "meter_name": "The Virginia Truth-O-Meter",
                "resource_uri": "/api/v/2/edition/10/"
            },
            "promise_meter_cutout": null,
            "resource_uri": "/api/v/2/person/424/",
            "total_count": 52,
            "true_count": 9,
            "website": "http://www.kaine.senate.gov/"
        }
    ],
    "selectors": [
        "party.party=Democrat",
        "total_count>=50"
    ],
    "totalArray": [
        593,
        263,
        80,
        75,
        48
    ],
    "trueArray": [
        122,
        60,
        15,
        13,
        9
    ]
}
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