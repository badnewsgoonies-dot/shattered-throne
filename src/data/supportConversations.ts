import {
  DialogueLine,
  SupportConversation,
  SupportRank,
} from '../shared/types';

function lines(entries: Array<[string, string, DialogueLine['emotion']?]>): DialogueLine[] {
  return entries.map(([speaker, text, emotion]) => ({ speaker, text, emotion }));
}

function convo(
  characterA: string,
  characterB: string,
  rank: SupportRank,
  requiredBattlesTogether: number,
  dialogue: DialogueLine[],
): SupportConversation {
  return {
    characterA,
    characterB,
    rank,
    requiredBattlesTogether,
    dialogue,
  };
}

export const SUPPORT_CONVERSATIONS: SupportConversation[] = [
  // Alaric / Elena
  convo(
    'alaric',
    'elena',
    SupportRank.C,
    1,
    lines([
      ['Alaric', 'You have been on your feet all day. Take a break.'],
      ['Elena', 'Not yet. The wounded keep arriving, and I can still help.'],
      ['Alaric', 'Then at least let someone guard your tent tonight.'],
      ['Elena', 'Only if you promise to rest too.'],
    ]),
  ),
  convo(
    'alaric',
    'elena',
    SupportRank.B,
    3,
    lines([
      ['Elena', 'You still carry that burned crest in your pocket.', 'sad'],
      ['Alaric', 'It reminds me what happens if I hesitate.'],
      ['Elena', 'It can also remind you what survives.'],
      ['Alaric', 'Then I will keep it for both reasons.'],
    ]),
  ),
  convo(
    'alaric',
    'elena',
    SupportRank.A,
    6,
    lines([
      ['Alaric', 'When this ends, I want to rebuild the cathedral square first.'],
      ['Elena', 'A place where no one is turned away.'],
      ['Alaric', 'Will you lead it with me?'],
      ['Elena', 'Yes. As long as you remember to sleep sometimes.', 'happy'],
    ]),
  ),

  // Alaric / Marcus
  convo(
    'alaric',
    'marcus',
    SupportRank.C,
    1,
    lines([
      ['Marcus', 'Your stance is drifting. Keep your shoulder square.'],
      ['Alaric', 'Still giving me lessons in the middle of war?'],
      ['Marcus', 'Especially in war. Sloppy form gets people killed.'],
      ['Alaric', 'Then keep correcting me until I get it right.'],
    ]),
  ),
  convo(
    'alaric',
    'marcus',
    SupportRank.B,
    3,
    lines([
      ['Alaric', 'You guarded my father for years. Why follow me now?'],
      ['Marcus', 'Because I watched you choose mercy when vengeance was easier.'],
      ['Alaric', 'Mercy does not always feel strong.'],
      ['Marcus', 'It is the only strength that lasts.'],
    ]),
  ),
  convo(
    'alaric',
    'marcus',
    SupportRank.A,
    6,
    lines([
      ['Marcus', 'When the crown returns, the throne room will need honest voices.'],
      ['Alaric', 'Then stay at my side as marshal.'],
      ['Marcus', 'I will, if you still accept old soldiers who speak bluntly.'],
      ['Alaric', 'Blunt honesty is exactly what I need.'],
    ]),
  ),

  // Alaric / Seraphina
  convo(
    'alaric',
    'seraphina',
    SupportRank.C,
    1,
    lines([
      ['Seraphina', 'Your camps are too quiet. Morale drops in silence.'],
      ['Alaric', 'I thought music would distract from watch duty.'],
      ['Seraphina', 'Not if it keeps them awake and hopeful.'],
      ['Alaric', 'Then tonight you choose the song.'],
    ]),
  ),
  convo(
    'alaric',
    'seraphina',
    SupportRank.B,
    3,
    lines([
      ['Alaric', 'Where did you learn to hide coded orders in lyrics?'],
      ['Seraphina', 'Court banquets. Nobles never hear what servants hear.'],
      ['Alaric', 'You risked everything to carry those messages.'],
      ['Seraphina', 'I was done watching others decide our fate.'],
    ]),
  ),
  convo(
    'alaric',
    'seraphina',
    SupportRank.A,
    6,
    lines([
      ['Seraphina', 'When peace comes, I want a festival in every province.', 'happy'],
      ['Alaric', 'Then we will host the first one in the capital.'],
      ['Seraphina', 'Promise me you will dance at least once.'],
      ['Alaric', 'If you lead, I will not refuse.'],
    ]),
  ),

  // Lira / Kael
  convo(
    'lira',
    'kael',
    SupportRank.C,
    1,
    lines([
      ['Lira', 'Stop palming my arrows when you walk past.'],
      ['Kael', 'I was checking the fletching. You are welcome.'],
      ['Lira', 'Next time ask first.'],
      ['Kael', 'Fine. May I inspect your arrows, captain?'],
    ]),
  ),
  convo(
    'lira',
    'kael',
    SupportRank.B,
    3,
    lines([
      ['Kael', 'I used to sleep under docks. Wind told me when patrols came.'],
      ['Lira', 'In the forest, birds gave the same warning.'],
      ['Kael', 'Different homes, same lesson. Listen and survive.'],
      ['Lira', 'Then we keep listening together.'],
    ]),
  ),
  convo(
    'lira',
    'kael',
    SupportRank.A,
    6,
    lines([
      ['Lira', 'I saved you a ridge perch for tomorrow.'],
      ['Kael', 'A thief on overwatch? That is new.'],
      ['Lira', 'You spot ambushes faster than anyone.'],
      ['Kael', 'Then I will watch your blind side every march.'],
    ]),
  ),

  // Theron / Nia
  convo(
    'theron',
    'nia',
    SupportRank.C,
    1,
    lines([
      ['Theron', 'You annotate your tomes in storm code?'],
      ['Nia', 'It keeps careless readers from setting tents on fire.'],
      ['Theron', 'Practical. I approve.'],
      ['Nia', 'High praise from the academy dropout.'],
    ]),
  ),
  convo(
    'theron',
    'nia',
    SupportRank.B,
    3,
    lines([
      ['Nia', 'I found your name in a sealed research ledger.'],
      ['Theron', 'Then you found why I ran.'],
      ['Nia', 'You exposed the experiment instead of hiding it.'],
      ['Theron', 'And lost everything worth keeping.'],
    ]),
  ),
  convo(
    'theron',
    'nia',
    SupportRank.A,
    6,
    lines([
      ['Theron', 'Help me rebuild the academy after the war.'],
      ['Nia', 'On one condition: no sealed wings, ever.'],
      ['Theron', 'Agreed. Open records and open doors.'],
      ['Nia', 'Then let us teach mages to serve people, not rulers.'],
    ]),
  ),

  // Marcus / Isolde
  convo(
    'marcus',
    'isolde',
    SupportRank.C,
    1,
    lines([
      ['Isolde', 'Your cavalry drills still follow the old handbook.'],
      ['Marcus', 'Because it worked before the court forgot discipline.'],
      ['Isolde', 'Then let us remind them why it worked.'],
      ['Marcus', 'At dawn. Full lance line.'],
    ]),
  ),
  convo(
    'marcus',
    'isolde',
    SupportRank.B,
    3,
    lines([
      ['Marcus', 'I thought you died in the palace purge.'],
      ['Isolde', 'I survived by pretending to train their heirs.'],
      ['Marcus', 'That must have been unbearable.'],
      ['Isolde', 'It was necessary.'],
    ]),
  ),
  convo(
    'marcus',
    'isolde',
    SupportRank.A,
    6,
    lines([
      ['Isolde', 'When this is over, the riders need new commanders.'],
      ['Marcus', 'Take the academy. They will follow you.'],
      ['Isolde', 'Only if you teach the first class beside me.'],
      ['Marcus', 'Then sharpen the practice lances.'],
    ]),
  ),

  // Sylas / Fiora
  convo(
    'sylas',
    'fiora',
    SupportRank.C,
    1,
    lines([
      ['Fiora', 'You loose too early at long range.'],
      ['Sylas', 'Wind changed. I compensated.'],
      ['Fiora', 'Show me that read again.'],
      ['Sylas', 'Only if you show me rooftop footing.'],
    ]),
  ),
  convo(
    'sylas',
    'fiora',
    SupportRank.B,
    3,
    lines([
      ['Sylas', 'My village hunted storms to survive.'],
      ['Fiora', 'I hunted patrol routes in city alleys.'],
      ['Sylas', 'You read streets like I read clouds.'],
      ['Fiora', 'Different horizons, same instinct.'],
    ]),
  ),
  convo(
    'sylas',
    'fiora',
    SupportRank.A,
    6,
    lines([
      ['Fiora', 'After the war, we should map every watchtower.', 'happy'],
      ['Sylas', 'And every updraft between them.'],
      ['Fiora', 'No army would surprise us again.'],
      ['Sylas', 'Then let us start drawing tonight.'],
    ]),
  ),

  // Kael / Petra
  convo(
    'kael',
    'petra',
    SupportRank.C,
    1,
    lines([
      ['Kael', 'You swapped my lockpicks for stage props.'],
      ['Petra', 'And you still opened the chest.'],
      ['Kael', 'After ten extra seconds.'],
      ['Petra', 'Consider it agility training.'],
    ]),
  ),
  convo(
    'kael',
    'petra',
    SupportRank.B,
    3,
    lines([
      ['Petra', 'I grew up where applause decided if we ate.'],
      ['Kael', 'I grew up where silence kept us alive.'],
      ['Petra', 'Then we learned opposite arts for the same reason.'],
      ['Kael', 'Survive first, joke later.'],
    ]),
  ),
  convo(
    'kael',
    'petra',
    SupportRank.A,
    6,
    lines([
      ['Kael', 'Your illusions saved a squad today.'],
      ['Petra', 'Your timing made it work.'],
      ['Kael', 'After this war, open a theater. I will run security.'],
      ['Petra', 'Deal. Front-row seats for every veteran.'],
    ]),
  ),

  // Lysandra / Rhea
  convo(
    'lysandra',
    'rhea',
    SupportRank.C,
    1,
    lines([
      ['Rhea', 'You stack relics beside open flame.'],
      ['Lysandra', 'They are inert without a chant.'],
      ['Rhea', 'I still prefer caution.'],
      ['Lysandra', 'Fair. I will move them to stone shelves.'],
    ]),
  ),
  convo(
    'lysandra',
    'rhea',
    SupportRank.B,
    3,
    lines([
      ['Lysandra', 'The monastery notes mention your mentor.'],
      ['Rhea', 'She hid the relic vault before the coup.'],
      ['Lysandra', 'Her cipher is brilliant.'],
      ['Rhea', 'She hoped brilliance would outlive tyrants.'],
    ]),
  ),
  convo(
    'lysandra',
    'rhea',
    SupportRank.A,
    6,
    lines([
      ['Rhea', 'Help me catalog every relic after the final battle.'],
      ['Lysandra', 'With full public records and no secret annexes.'],
      ['Rhea', 'Agreed. Knowledge protected by community, not locks.'],
      ['Lysandra', 'Then your vault becomes a library.'],
    ]),
  ),

  // Orion / Yvette
  convo(
    'orion',
    'yvette',
    SupportRank.C,
    1,
    lines([
      ['Yvette', 'Your horse is favoring its left foreleg.'],
      ['Orion', 'You noticed during a charge?'],
      ['Yvette', 'I notice everything that might cost us riders.'],
      ['Orion', 'Then I owe you a stable shift.'],
    ]),
  ),
  convo(
    'orion',
    'yvette',
    SupportRank.B,
    3,
    lines([
      ['Orion', 'Courier duty taught me every broken bridge in the west.'],
      ['Yvette', 'Field chaplain duty taught me every makeshift clinic there.'],
      ['Orion', 'Together that is a logistics network.'],
      ['Yvette', 'Exactly what the realm needs next.'],
    ]),
  ),
  convo(
    'orion',
    'yvette',
    SupportRank.A,
    6,
    lines([
      ['Yvette', 'After victory, I want mobile clinics on every border route.'],
      ['Orion', 'I can run supply lines and escorts.'],
      ['Yvette', 'Then wounded travelers finally have a chance.'],
      ['Orion', 'We start planning as soon as camp settles.'],
    ]),
  ),

  // Garrick / Tiber
  convo(
    'garrick',
    'tiber',
    SupportRank.C,
    1,
    lines([
      ['Tiber', 'Your shield wall leaves a gap on the flank.'],
      ['Garrick', 'I expected cavalry support there.'],
      ['Tiber', 'Expect less. Fortify more.'],
      ['Garrick', 'Understood, commander.'],
    ]),
  ),
  convo(
    'garrick',
    'tiber',
    SupportRank.B,
    3,
    lines([
      ['Garrick', 'You held West Bastion for three months.'],
      ['Tiber', 'Because citizens carried water when soldiers could not.'],
      ['Garrick', 'Then we owe them better leadership this time.'],
      ['Tiber', 'That is why I am here.'],
    ]),
  ),
  convo(
    'garrick',
    'tiber',
    SupportRank.A,
    6,
    lines([
      ['Tiber', 'When the war ends, train reserve militias in every province.'],
      ['Garrick', 'Citizen defense corps, locally led.'],
      ['Tiber', 'Exactly. No city abandoned again.'],
      ['Garrick', 'I will draft the doctrine tonight.'],
    ]),
  ),

  // Bram / Fenric
  convo(
    'bram',
    'fenric',
    SupportRank.C,
    1,
    lines([
      ['Bram', 'You disarm traps too cleanly for a "reformed" man.'],
      ['Fenric', 'Old habits can be useful when pointed at the right target.'],
      ['Bram', 'I will trust results for now.'],
      ['Fenric', 'That is more than most give me.'],
    ]),
  ),
  convo(
    'bram',
    'fenric',
    SupportRank.B,
    3,
    lines([
      ['Fenric', 'I used to map escape routes for people I was sent to silence.'],
      ['Bram', 'You sabotaged your own contracts?'],
      ['Fenric', 'Enough to keep my conscience alive.'],
      ['Bram', 'Then maybe there is room for both of us in peacetime.'],
    ]),
  ),
  convo(
    'bram',
    'fenric',
    SupportRank.A,
    6,
    lines([
      ['Bram', 'After this, help me build a civic locksmith guild.'],
      ['Fenric', 'From assassin to inspector?'],
      ['Bram', 'Someone has to teach secure design.'],
      ['Fenric', 'Then I am in. Quietly.'],
    ]),
  ),
];

export function getSupportConversationsForPair(
  characterA: string,
  characterB: string,
): SupportConversation[] {
  return SUPPORT_CONVERSATIONS.filter(
    (conversation) =>
      (conversation.characterA === characterA && conversation.characterB === characterB) ||
      (conversation.characterA === characterB && conversation.characterB === characterA),
  );
}

export function getAllSupportConversations(): SupportConversation[] {
  return [...SUPPORT_CONVERSATIONS];
}
