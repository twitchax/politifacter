"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const commands = require('../shared/commands');
const helpers = require('../shared/helpers');
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        var stats = yield commands.compare('.pfcache/people.json', 'total_count>=10|name_slug=barack-obama;name_slug=donald-trump;name_slug=hillary-clinton;name_slug=harry-reid;name_slug=nancy-pelosi;name_slug=john-kerry;name_slug=michele-bachmann;name_slug=ted-cruz;name_slug=newt-gingrich;name_slug=sarah-palin;name_slug=rick-santorum;name_slug=scott-walker;name_slug=paul-ryan;name_slug=rick-perry;name_slug=john-mccain;name_slug=marco-rubio;name_slug=mitt-romney;name_slug=rand-paul;name_slug=chris-christie;name_slug=joe-biden;name_slug=john-kasich;name_slug=bernie-sanders;name_slug=jeb-bush');
        console.log(helpers.getStatisticsCompareString(stats));
    });
})();
//# sourceMappingURL=go.js.map