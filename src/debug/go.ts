import * as commands from '../shared/commands';
import * as helpers from '../shared/helpers';

(async function() {
    var stats = await commands.compare('.pfcache/people.json', 'total_count>=10|name_slug=barack-obama;name_slug=donald-trump;name_slug=hillary-clinton;name_slug=harry-reid;name_slug=nancy-pelosi;name_slug=john-kerry;name_slug=michele-bachmann;name_slug=ted-cruz;name_slug=newt-gingrich;name_slug=sarah-palin;name_slug=rick-santorum;name_slug=scott-walker;name_slug=paul-ryan;name_slug=rick-perry;name_slug=john-mccain;name_slug=marco-rubio;name_slug=mitt-romney;name_slug=rand-paul;name_slug=chris-christie;name_slug=joe-biden;name_slug=john-kasich;name_slug=bernie-sanders;name_slug=jeb-bush');
    console.log(helpers.getStatisticsCompareString(stats));
})();