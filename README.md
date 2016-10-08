# politifacter

A utility for aggregating politifact statements.

## Information

**politifacter** is a small command line (and, one day, server) utility written in node.js that allows the user to aggregate politifact scorecards based on [politifact's](http://www.politifact.com/) [API](http://static.politifact.com/api/v2apidoc.html) ([example person](example/examplePerson.json)).

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

None.

One day there will be a:
```bash
npm test
```

### Compatibility

Node v6.0.0+.

### Examples
A basic example follows:
```bash
pf analyze last_name=Obama first_name=Barack
```
yields
```
Selectors: last_name=Obama,first_name=Barack

Number of people in selection: 1
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