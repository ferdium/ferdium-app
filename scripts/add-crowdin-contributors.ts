import fs from 'fs-extra';
import path from 'path';
import allContributors from 'all-contributors-cli';

/**
 * Add CrowdIn Contributors to AllContributors list
 *
 * This script will add CrowdIn Contributors to the list of all contributors.
 * As the CrowdIn API doesn't give good access to the data needed, this script
 * requires you to manually execute a script on the members page of CrowdIn
 * and paste its output into this script.
 *
 * Usage:
 * 1. Open https://crowdin.com/project/ferdium/settings#members
 * 2. Open the console and execute the script below:

const members = [];
// All elements containing members
const membersEl = [...document.querySelectorAll('.ps-members-name')];
membersEl.forEach((el) => {
  const text = el.innerText;
  if (text === 'Name') return;
  let picture = el.querySelector('img').getAttribute('src');
  picture = picture.replace(/\?.+/, '');

  // Check if the text includes a separate username
  if (text.includes('(')) {
    const login = /(?<=\()\w.*(?=\))/.exec(text)[0];
    const name = /^.*(?= \()/.exec(text)[0];

    if (login) {
      members.push({
        name: name,
        login: login,
        avatar_url: picture,
      });
      return;
    }
  }
  members.push({
    name: text,
    login: text,
    avatar_url: picture,
  });
});

// Output data to console
console.clear();
console.log(JSON.stringify(members));

 * 3. Paste the output of the script (JSON Array) below to set 'list' to that value
 * 4. Execute this script using 'pnpm add-crowdin-contributors'
 * 5. Regenerate the README table using the CLI ('all-contributors generate')
 * Please check if the generated data is ok and no data is lost.
*/
const list: any[] = [
  {
    name: 'vantezzen_',
    login: 'vantezzen_',
    avatar_url:
      'https://www.gravatar.com/avatar/378102e0ed444ba441ebc2748bba97cc',
  },
  {
    name: 'Makazzz',
    login: 'Makazzz',
    avatar_url:
      'https://www.gravatar.com/avatar/c41a64846c4ffb3516a721c533d91edb',
  },
  {
    name: 'kytwb',
    login: 'kytwb',
    avatar_url:
      'https://www.gravatar.com/avatar/acfa8cdc7dc7408f88d72e9c8e33bfe8',
  },
  {
    name: 'Nikita Bibanaev',
    login: 'nicky18013',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13468928/small/2b31e7ac19645d950a79b33ffd5721b8.png',
  },
  {
    name: 'Tatjana1998',
    login: 'Tatjana1998',
    avatar_url:
      'https://www.gravatar.com/avatar/ade202a04fcbb2c177e4f1d9936af29e',
  },
  {
    name: 'Ali M. Shiple',
    login: 'Ali_Shiple',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/12895436/small/00917d09ca1b4b6d8e0ef36af07ecf6b.jpg',
  },
  {
    name: 'Koen',
    login: 'keunes',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13018172/small/829115c606347b10218f34c637a2100c.png',
  },
  {
    name: 'tinect',
    login: 'tinect',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/12521988/small/56c2041645746af9e51dd28782b828c3.jpeg',
  },
  {
    name: 'elviseras',
    login: 'elviseras',
    avatar_url:
      'https://www.gravatar.com/avatar/25c2cf0d8cb4a4141e71c3b8a2e9324f',
  },
  {
    name: 'Leandro Gehlen',
    login: 'leandrogehlen',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14099621/small/1d9503523839c310dbce0af3c226e894.jpeg',
  },
  {
    name: 'Matthieu42',
    login: 'Matthieu42',
    avatar_url:
      'https://www.gravatar.com/avatar/735217ccccf11ba97573deee517ddb19',
  },
  {
    name: 'zutt',
    login: 'zutt',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13320003/small/50fdf9f8c7e54a446925bd79696ea625.JPG',
  },
  {
    name: 'Wonsup Yoon',
    login: 'Pusnow',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13514833/small/65f0b45587cc7e34f2827830cd324b16.jpeg',
  },
  {
    name: 'J370',
    login: 'J370',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14141203/small/7b12b5db419d8796450221c2eaaf6003.png',
  },
  {
    name: 'n0emis',
    login: 'n0emis',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14150321/small/941bf09bd6c413d91d780f948f4359a9.png',
  },
  {
    name: 'ChTBoner',
    login: 'ChTBoner',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13273153/small/a810886febf5199cfa1c98644444dea7.jpeg',
  },
  {
    name: '127oo1',
    login: '127oo1',
    avatar_url:
      'https://www.gravatar.com/avatar/060c722be11da16ae31902e9c98326b2',
  },
  {
    name: 'Johan Engstrand',
    login: 'johanengstrand',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14152801/small/fd395f120efca971ca9b34c57fd02cca.png',
  },
  {
    name: 'peq42_',
    login: 'peq42',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14155811/small/b62a94dde7ec29948ec6a6af9fd24b1d.png',
  },
  {
    name: 'mazzo98',
    login: 'mazzo98',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/12864917/small/69799b5fd7be2f67282715d5cdfd4ae1.png',
  },
  {
    name: 'Pumbinha',
    login: 'karlinhos',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14161139/small/96450eb44c22b3141ab4401e547109b8.png',
  },
  {
    name: 'AndiLeni',
    login: 'AndiLeni',
    avatar_url:
      'https://www.gravatar.com/avatar/4bd0da860de38afa735425ce2d4e10b5',
  },
  {
    name: 'SMile61',
    login: 'SMile61',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14177585/small/1bb4f6ba39bff3df8f579e61460ce016.png',
  },
  {
    name: 'Edilson Alzemand Sigmaringa Junior',
    login: 'Alzemand',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14184269/small/f5e68247f01988ae7951a282f0fd4d06.jpeg',
  },
  {
    name: 'Bruno Almada',
    login: 'brunofalmada',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14200540/small/f6f1addceeeabc02488f9b08520a902f.jpeg',
  },
  {
    name: 'MAT-OUT',
    login: 'MAT-OUT',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14201550/small/68dd2402bf2879bc3ca312d627710400.png',
  },
  {
    name: 'tristanplouz',
    login: 'tristanplouz',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13811893/small/e2a4758c57fddfdf85d23ec59d0c28a7.png',
  },
  {
    name: 'Catarino Gonçalo',
    login: 'Catarino',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14208802/small/07287eb2de671257ca3d6bb4ba1cca67.jpeg',
  },
  {
    name: 'paprika-naught-tiffin-flyspeck',
    login: 'paprika-naught-tiffin-flyspeck',
    avatar_url:
      'https://www.gravatar.com/avatar/8671ebe7a7164dfa7624fbdbff69ed96',
  },
  {
    name: 'Abderrahim Tantaoui',
    login: 'abdoutanta',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14213908/small/5b2fc8166f8a0a2b7313fbf49ee5b6b6.jpeg',
  },
  {
    name: 'xrup',
    login: 'xrup',
    avatar_url:
      'https://www.gravatar.com/avatar/9e65aa6d4db623146ec4c571db081a6d',
  },
  {
    name: 'Serhiy Dmytryshyn',
    login: 'dies',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/1/small/e84bcdf6c084ffd52527931f988fb410.png',
  },
  {
    name: 'Patrick Valle',
    login: 'patrickvalle',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14217484/small/8b73f313ee79fe33625e819cdac86551.jpg',
  },
  {
    name: '2bdelghafour',
    login: '2bdelghafour',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14219410/small/31ff20f60d352fb46e314f3c180a77b0.jpeg',
  },
  {
    name: 'daedgoco',
    login: 'daedgoco',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14233276/small/8823401d22f9ae6865925e4f20eb15e1.png',
  },
  {
    name: 'Adrià Solé',
    login: 'adria.soce',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14234338/small/6dc05d89e672bd624e9e37253f852b77.jpeg',
  },
  {
    name: 'Enderson Menezes',
    login: 'endersonmenezes',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14234572/small/384477b34fae0a3f98f386cc658b9494.jpeg',
  },
  {
    name: 'ali',
    login: 'Ali-Alqazwini',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14236770/small/328f8ae5f996f60bb2c174a9f8f808ec.jpeg',
  },
  {
    name: 'Marton Nagy',
    login: 'martonnagy',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14243516/small/54af6111fd1260698f1b6d187245e074.jpeg',
  },
  {
    name: 'Edson Manuel Carballo Vera',
    login: 'edsonmanuelcarballovera',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14244460/small/28a9b867da8e2b92904d79348cb39a55.jpeg',
  },
  {
    name: 'alby.grassi',
    login: 'xelio_91_',
    avatar_url:
      'https://www.gravatar.com/avatar/47a0291b35c0031ad0fee6b7cf717728',
  },
  {
    name: 'Vasilis Moschopoulos',
    login: 'mos.vasilis',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14266920/small/47c551cf2f468d43a4449a74d8134cc0.jpg',
  },
  {
    name: 'crystyanalencar',
    login: 'crystyanalencar',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14289028/small/288f15e47856de74b8fdda14ed8d9b69.png',
  },
  {
    name: 'larsmagnusherland',
    login: 'larsmagnusherland',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13219280/small/424b39a9b0f10a08f63eb1aaea1ba180.png',
  },
  {
    name: 'GPMartins',
    login: 'GPMartins',
    avatar_url:
      'https://www.gravatar.com/avatar/b0d3d14cd9dddfbde33ebbb8ec93b997',
  },
  {
    name: 'Michelangelo Amoruso Manzari',
    login: 'MosciolaroMike',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14312004/small/06d41030406626131151993d08164756.jpeg',
  },
  {
    name: 'Nicoló Castellini',
    login: 'nicolo.castellini',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14315116/small/e28f5f575b7cac2e62ad38dbeefa287d.jpeg',
  },
  {
    name: 'Valentin',
    login: 'ValleBL',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14316376/small/10e3598076d2bc111c4377633cf5a77c.jpeg',
  },
  {
    name: 'Joshua',
    login: 'Jashnok',
    avatar_url:
      'https://www.gravatar.com/avatar/f9d8eedb517530409b8dd9415b29ae74',
  },
  {
    name: 'Muletto Honor',
    login: 'mulettohonor',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14320218/small/31446d0a50fe681a174dcfce6ccb863b.jpg',
  },
  {
    name: 'Xavier Cho',
    login: 'mysticfall',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14325066/small/ea4c81f6e5a2320d077679986808e618.jpeg',
  },
  {
    name: 'borntzal',
    login: 'borntzal',
    avatar_url:
      'https://www.gravatar.com/avatar/b9fe7367a9c911e427a22f5214732e4d',
  },
  {
    name: 'Norbert Kőhegyi',
    login: 'mahoganypinewood',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14342206/small/3de2d02f113a1950869a38970ce550db.jpg',
  },
  {
    name: 'Edgars',
    login: 'eandersons',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13356613/small/d25f02bc7a75913ce9a11d3c61be6477.png',
  },
  {
    name: 'César Noguerol',
    login: 'cnoguerol',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14371498/small/77c91c1552d0303285eee49a7233bb2a.jpeg',
  },
  {
    name: 'JinSang Park',
    login: 'pjs21s',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14377502/small/f64299e436a34afa05cab3827a0c8b11.jpeg',
  },
  {
    name: 'Tiago Carreira',
    login: 'tcarreira',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14378030/small/e3cf7bb00b6a1711dab58c59ea04cee3.jpeg',
  },
  {
    name: 'Huan Tran',
    login: 'huantrg',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14394210/small/ac7208150dfb9196ce6a494390bdfa51.jpeg',
  },
  {
    name: 'maximax',
    login: 'maximax',
    avatar_url:
      'https://www.gravatar.com/avatar/a537523faffbbf55a0f39471143c3264',
  },
  {
    name: 'João Inácio (birobirobiro)',
    login: 'birobirobiro) (birobirobiro',
    avatar_url:
      'https://www.gravatar.com/avatar/2ea06a80ecd7e4a34acfa43cfa01fa25',
  },
  {
    name: 'Mads Marquart',
    login: 'madsmtm',
    avatar_url:
      'https://www.gravatar.com/avatar/6530353d838d771ace9f240d0085a197',
  },
  {
    name: 'Jan Hohner',
    login: 'janhohner',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13631076/small/9d576fac4ca3c354e809db5f831af1b8.jpeg',
  },
  {
    name: 'Peter L.',
    login: 'pludi',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14038315/small/22f4df26f65181a7d3a9de773d11315d.png',
  },
  {
    name: 'Alberto González',
    login: 'algonrey',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14446576/small/e2423064f8b64e4d91eb1d26d1c9e3ed.png',
  },
  {
    name: 'mganovelli',
    login: 'mganovelli',
    avatar_url:
      'https://www.gravatar.com/avatar/73572bf6ada06e0a31902a679231d339',
  },
  {
    name: 'Dvir M',
    login: 'dvirmalka',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14451536/small/e724aa43f781c935e408be99e679fe5e.jpg',
  },
  {
    name: 'Daniel Brandobur',
    login: 'Emilio_D',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14452294/small/13b5c161612a2f366078b563e9f5e08b.png',
  },
  {
    name: 'totoderek',
    login: 'totoyeah',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14465378/small/234131e24d58cb37ca87aea532d3d347.png',
  },
  {
    name: 'Kevin Cabrera',
    login: 'kev.cabrerar',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14471950/small/383c6a879a45001c36228e17e2d81090.png',
  },
  {
    name: 'Hugo Santos',
    login: 'hugosantosmobile',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14477058/small/e8a048695e4de818fdf1e3e1326d14c4.png',
  },
  {
    name: 'Søren Berg Glasius',
    login: 'sbglasius',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14480260/small/9643f9f295172a5a9959209eee3999bd.png',
  },
  {
    name: 'mustbedreaming',
    login: 'mustbedreaming',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14482836/small/32bf7ac73042f53cb9b7c82c57023ddb.png',
  },
  {
    name: 'Germain Carré',
    login: 'Carsso',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/12353537/small/d9567780a35d1e674cf47a69c301b0c4.png',
  },
  {
    name: 'Dominik Bullo',
    login: 'dominikbullo',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14494704/small/1debb3d67c6ad7d7f45f0b7a38eb21a7.jpeg',
  },
  {
    name: 'Gonzalo Pérez',
    login: 'gonperezramirez',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14504898/small/4f20dd9bbc823c78568eb6f1cfb2aeb9.jpeg',
  },
  {
    name: 'Carlescampins',
    login: 'Carlescampins',
    avatar_url:
      'https://www.gravatar.com/avatar/b84ccc92d132102110b7aec628f47b6a',
  },
  {
    name: 'Cristiano Verondini',
    login: 'cverond',
    avatar_url:
      'https://www.gravatar.com/avatar/70e4384a871e45743f26bdcc21303c56',
  },
  {
    name: 'אליה הלל',
    login: 'eliyahillel',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14367648/small/834d1cf668a6ca97b2c66093019b5991.jpeg',
  },
  {
    name: 'Samuel Francois Köhler',
    login: 'sfkmk',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14541090/small/f0a810349778c46b7572301340b471e8.jpeg',
  },
  {
    name: 'Bartel',
    login: 'Letrab',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14544608/small/91c226dbb12aa1067e294cd5c4332ae1.png',
  },
  {
    name: 'Alexandre Martins',
    login: 'alexmartins',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14544796/small/e3c922101c1ceb7c7a6b7bd165a15d98.jpeg',
  },
  {
    name: 'Jari Myrskykari',
    login: 'jartsa',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14080739/small/6dadf0a40522a0e918f746f2b32e6c27.jpg',
  },
  {
    name: 'Uğurcan Sayan',
    login: 'ugurcansayan',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13023570/small/96cfec0b4d18e4b26b59dfeeaa369cf6.jpg',
  },
  {
    name: 'Alex',
    login: 'nasmi3',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14563170/small/072d3aadc3866c16ed1a5b5082e81f26.png',
  },
  {
    name: 'Nikola Mitić',
    login: 'n-mitic',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14588102/small/5f8b6b73c8d583e6b424607470c09cb7.jpeg',
  },
  {
    name: 'fawkulce',
    login: 'fawkulce',
    avatar_url:
      'https://www.gravatar.com/avatar/9004e98cd5e707875b3dd9268214a664',
  },
  {
    name: 'Glenac',
    login: 'Glenac',
    avatar_url:
      'https://www.gravatar.com/avatar/080652c67697630c9885a1157ad8a360',
  },
  {
    name: 'Victorious',
    login: 'victoriousnathan55',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14319626/small/120632761f7821f4cbfdac046086b6e7.jpeg',
  },
  {
    name: 'Raoul Molai',
    login: 'raoul-m',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13238611/small/2906ff4c9e8704be8cb86d1b1cb124b1.jpg',
  },
  {
    name: 'Nathanaël',
    login: 'nathanaelhoun',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14628456/small/7c0f5919fba56edfddf08bf715039f75.jpeg',
  },
  {
    name: 'Laurentiu Radu',
    login: 'radulaurentiu',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14631958/small/c3a0112e9eb596f0a54cdebf5d99b82a.jpg',
  },
  {
    name: 'GiacomoGuaresi',
    login: 'GiacomoGuaresi',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14659702/small/12e79e3fc332762058ee525a95b72447.jpeg',
  },
  {
    name: 'Hung Nguyen',
    login: 'cohedz',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14664150/small/18ae8a7eaa36ba6202fa43eedd84b8d2.jpg',
  },
  {
    name: 'Facundo Saravia',
    login: 'facundo_ingenia',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14672204/small/eaf2caaff3d2851fabb3d74f76d0542e.png',
  },
  {
    name: 'Lefebvre Saboya',
    login: 'llsaboya',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14682462/small/ee313d9b222ea3d1f10bd337d6cb6fce.jpeg',
  },
  {
    name: 'beez276',
    login: 'beez276',
    avatar_url:
      'https://www.gravatar.com/avatar/4a5e7e0b13e365d0783e480ddff338fc',
  },
  {
    name: 'namu',
    login: 'namu',
    avatar_url:
      'https://www.gravatar.com/avatar/ddf44bc1e0a05ca46fa9b81f1f916f15',
  },
  {
    name: 'Kaue Lima',
    login: 'kauelima',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13054953/small/3319b5f15e0452b664f94e632d51276e.jpeg',
  },
  {
    name: 'AlexDep',
    login: 'AlexDep',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14705362/small/ba978b0356a94767dc79441c70aee964.png',
  },
  {
    name: 'Nguyễn Tấn Lợi',
    login: 'tanloibdp',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14736534/small/42b4da2ca619a6517adbb38bc60c7e5c.jpeg',
  },
  {
    name: 'Alex Widén',
    login: 'vovven',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14748884/small/9829dddc625adca8d20e9687f40f009e.jpeg',
  },
  {
    name: 'amin_tado',
    login: 'amin_tado',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/12875002/small/fea4dcbf0c1e15743c467d0e152e43d9.jpg',
  },
  {
    name: 'Rintan',
    login: 'Rintan',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/12710633/small/bd1081c95585021cb9862a5f9d1756ec.png',
  },
  {
    name: 'Nesswit',
    login: 'rishubil',
    avatar_url:
      'https://www.gravatar.com/avatar/4943e03e0f0cf28d12fbc98064b3f244',
  },
  {
    name: 'Elia De Togni',
    login: 'AmazingClaymore',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14812758/small/a9f623f45c833c7ba7f04cf2962f3793.png',
  },
  {
    name: 'zkm3f',
    login: 'zkm3f',
    avatar_url:
      'https://www.gravatar.com/avatar/2c79623d62d2bb36b31883abd5b08a12',
  },
  {
    name: 'Sebastian Jasiński',
    login: 'PrinceNorris',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13962625/small/552e23414407b34f8f67db5ea49a5604.png',
  },
  {
    name: 'MoaufmKlo',
    login: 'MoaufmKlo',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13720247/small/e01249ad9a091fda233cfaec0774c1fc.png',
  },
  {
    name: 'Marcos Orso',
    login: 'marcosorso',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14830692/small/0550fa339b76765dd8b200afabd43b0a.jpeg',
  },
  {
    name: 'Nice Brown',
    login: 'popdisk',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14844316/small/5a12669ef15f26b6c53a5d5afe38a6b3.jpeg',
  },
  {
    name: 'Loremed',
    login: 'Loremed',
    avatar_url:
      'https://www.gravatar.com/avatar/76d86c860fa5bdc1694ff9c7dc9778fb',
  },
  {
    name: 'yarinShapira',
    login: 'yarinShapira',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14845706/small/abf9ec9309f40dfcb01eae2c8fca02fb.png',
  },
  {
    name: 'Christopher Coss',
    login: 'Kissadere',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/12721969/small/8feaec1d16dd268e5ec29204a6e1d080.jpg',
  },
  {
    name: 'Buğra Çağlar',
    login: 'portakalimsi',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13990869/small/a4e0b16904126d8e0d014d952f4bc1b6.jpeg',
  },
  {
    name: 'sobeitnow0',
    login: 'sobeitnow0',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14738292/small/727b33d7bd2ca021cf85b788c6cee9d1.jpeg',
  },
  {
    name: 'Muhammad Zahiruddin',
    login: 'dinzahir99',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/12732934/small/cae45ad9864def2074b1e3c35efce683.png',
  },
  {
    name: 'Aninus Partikler',
    login: 'aninuscsalas',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14358620/small/7f3849dd7ea25ac874fac1986810e329.png',
  },
  {
    name: 'Wellington Melo',
    login: 'wellingtonsmelo.android',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14888906/small/8d128e54285cac52c0e50e53d4691c82.jpeg',
  },
  {
    name: 'miangou',
    login: 'miangou',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14891930/small/78e766643ac488bebc490ecf4677c0c9.jpeg',
  },
  {
    name: 'Store',
    login: 'HelaBasa',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13976107/small/ab4177e8d90665d4603e548488d15c68.jpg',
  },
  {
    name: 'technowhizz',
    login: 'technowhizz',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14897978/small/2d2a416e423758dd52a3dd0f657fdf0c.jpeg',
  },
  {
    name: 'Trần Lê Quốc Huy',
    login: 'LucasMasrider',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14613056/small/090933fb64948358fa226ad830de2b21.jpg',
  },
  {
    name: 'Maciej Błędkowski',
    login: 'mble',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14273256/small/7df80579990a9d9e3cf672d04b372297.jpeg',
  },
  {
    name: 'd3ward',
    login: 'd3ward',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13781643/small/bf617deeeba0d2efafef223ddb1c3c03.png',
  },
  {
    name: 'Vijay Raghavan Aravamudhan',
    login: 'vraravam',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14890780/small/8a0a5ed688ff21711a832f39ac0481b6.jpeg',
  },
  {
    name: 'Markus Hatvan',
    login: 'mhatvan',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14921973/small/98e0bce9af5f4d851630831d866262d2.jpeg',
  },
  {
    name: 'amyaan',
    login: 'amyaan',
    avatar_url:
      'https://www.gravatar.com/avatar/eac6ef8c854035fa9af245f866da0a42',
  },
  {
    name: 'Fred William Torno Junior',
    login: 'fredwilliamtjr',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14932371/small/e694cada2c8fd7924162e1badcc6af3f.png',
  },
  {
    name: 'José Luis Bandala Pérez',
    login: 'luis449bp',
    avatar_url:
      'https://www.gravatar.com/avatar/e7dbf284ff40c3c32845e1b95d257c61',
  },
  {
    name: 'gurbii',
    login: 'gurbii',
    avatar_url:
      'https://www.gravatar.com/avatar/bedbdd12dbf6df0abed084a7f6efe772',
  },
  {
    name: 'Luiz Henrique',
    login: '13luizhenrique',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13926183/small/d20b071be813e20efa3a121bc2658989.png',
  },
  {
    name: 'Clément Biron',
    login: 'clementbiron',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14951127/small/a95b2d3ff6d1b64bf0d75d561e025ec6.png',
  },
  {
    name: 'ttxsyqz',
    login: 'ttxsyqz',
    avatar_url:
      'https://www.gravatar.com/avatar/8913ba1176abfc32fa2021a8ec683511',
  },
  {
    name: 'Janne Salmi',
    login: 'BluePantherFIN',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14958709/small/f32c96756fb16350385ea3dee38626f7.jpeg',
  },
  {
    name: 'TheRedLadybug62',
    login: 'TheRedLadybug62',
    avatar_url:
      'https://www.gravatar.com/avatar/4b1fdb0a13f1bdf2bbfda46e9d78f2d0',
  },
  {
    name: '曹恩逢',
    login: 'SiderealArt',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/12960382/small/efd52e2c41be32bfd52569ac15d228b7.jpg',
  },
  {
    name: 'Martin Jakobsson',
    login: 'jakobsson0',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14965633/small/6195809f0df9712fd7d4248d33cc846c.png',
  },
  {
    name: 'Guus',
    login: 'Guus',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/12495264/small/eb334ff402b0b9bf49493bfce968399d.png',
  },
  {
    name: 'peterpacket',
    login: 'peterpacket',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14970427/small/da8ab2c6b80d2c06a3b9094e53b94db9.jpeg',
  },
  {
    name: 'ogghi',
    login: 'ogghi',
    avatar_url:
      'https://www.gravatar.com/avatar/59e381507a01e1c8cf58d2521260c0e1',
  },
  {
    name: 'Vladimir Studinsky',
    login: 'studinsky',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13280232/small/4dd03819450e266c9b42a7eff880f9dc.jpg',
  },
  {
    name: 'János Benjamin Antal',
    login: 'antaljanosbenjamin',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14982759/small/174144d1761e4b9f8e50353b4dbca8d1.jpeg',
  },
  {
    name: 'Oğuzhan K',
    login: 'oguzhankara34',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14989979/small/a404ab91595a7c5cf02854477ac4c559.jpeg',
  },
  {
    name: 'Ben Naylor',
    login: 'b_n',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14999083/small/00ae25b0d879d7578ca2d3c8c9a0c038.jpeg',
  },
  {
    name: 'Martin Bernát',
    login: 'martinbernat',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/15000137/small/d6b368ed785d157f6e2105c64a7fe37b.png',
  },
  {
    name: 'Ignacio Castro',
    login: 'ignaciocastro',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14239666/small/ac376ab1a3f35722ab4a153b26ee881a.jpeg',
  },
  {
    name: 'Niklas Lagström',
    login: 'lagstrom',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/15030387/small/329d60a44b8deba42c825e2dc1a9e7a0.jpeg',
  },
  {
    name: 'Greivin Cordoncillo Romero',
    login: 'jatatox',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/15031761/small/6482c4317b9aa45d3e61ef82eb77b48a.jpeg',
  },
  {
    name: 'Ovidiu Gherman',
    login: 'gherman.ovidiu.ionut',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/15031877/small/2ccf7f461f67f226b58260e459802848.jpeg',
  },
  {
    name: 'Eryk Lewandowski',
    login: 'erykosky',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/15041515/small/43f0bd10f84bf785654f3412f2215df9.png',
  },
  {
    name: '방현수',
    login: 'natas999',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14401308/small/e0d6f0cdc5114be795273e5b690f0896.jpeg',
  },
  {
    name: 'MyUncleSam',
    login: 'MyUncleSam',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/15046019/small/d48a41a2a7e2d205dbe3316cd834dfb6.jpeg',
  },
  {
    name: 'Vladyslav Samotoi',
    login: 'mcwladkoe',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/12996072/small/be802e915089a812d93e676674c9454f.png',
  },
  {
    name: 'Vyacheslav Malashin',
    login: 'vyacheslav_malashin',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/15062315/small/397445945985e829703b1fe3e4f4ccf4.JPG',
  },
  {
    name: 'Chatos Kuntakinte',
    login: 'chatoskuntakinte',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/15062523/small/acb7763df860ca67fe30dbafcf9e31e0.png',
  },
  {
    name: 'Juha Köpman',
    login: 'e0f',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14443460/small/fda983d878c8cd64f9224d2c27a2a56c.jpg',
  },
  {
    name: 'AiOO',
    login: 'AiOO',
    avatar_url:
      'https://www.gravatar.com/avatar/f39fe4e7e61f4aea84e369b5f9d9c2f6',
  },
  {
    name: 'Ibra AF',
    login: 'musyawaroh123',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13583172/small/f3e47a6f884ad97a5a8d354f0fe5a853.jpg',
  },
  {
    name: 'Rebecca Wendhausen',
    login: 'bekwendhausen',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/15085045/small/3afbce411d873055baca51f69d3bfd8c.png',
  },
  {
    name: 'David Astillero Pérez',
    login: 'dastillero',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14935695/small/abf96cf0a2ccb90f0ffbd7ffad4bf6f0.jpeg',
  },
  {
    name: 'mscythe',
    login: 'mscythe',
    avatar_url:
      'https://www.gravatar.com/avatar/f5c7d39046e60be1692b03d09624a49e',
  },
  {
    name: 'Jean-Pierre MÉRESSE',
    login: 'Jipem',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/15101883/small/56a810446c7f1b7bfd566825bdf38f97.png',
  },
  {
    name: '咸粽子',
    login: 'XianZongzi',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/13898579/small/a62e017825193da284eb84b7a318f6b7_default.png',
  },
  {
    name: 'Barkın Arga',
    login: 'barkinarga',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/12813629/small/44d528df52ccd5972d167835ace78078.jpg',
  },
  {
    name: 'Santiago',
    login: 'Droidnius',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/14790068/small/2d824af4ac6a1f41f82b24020409ae44.jpg',
  },
  {
    name: 'Kentai Radiquum',
    login: 'Radiquum',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/15166222/small/bb762aa8ef3fcac773487ef3ef8708ce.jpeg',
  },
  {
    name: 'Mehmet Can',
    login: 'bymcs',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/15166456/small/c4d6a35eb95112121b167386c044967d.png',
  },
  {
    name: 'banhetom',
    login: 'banhetom',
    avatar_url:
      'https://crowdin-static.downloads.crowdin.com/avatar/15203804/small/b8dbe2bfd68c749f7965f39ede727882.png',
  },
];

const infoPath = path.join(__dirname, '..', '.all-contributorsrc');
const info = fs.readJSONSync(infoPath);
for (const user of list) {
  if (user.login) {
    info.contributors = allContributors.addContributorWithDetails({
      ...user,
      contributions: ['translation'],
      profile: `https://crowdin.com/profile/${user.login}`,
      options: {
        contributors: info.contributors,
      },
    });
  }
}

fs.writeJSONSync(infoPath, info, {
  spaces: 2,
});
