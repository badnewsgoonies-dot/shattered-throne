import { CharacterDefinition, UnitClassName, Stats, GrowthRates, MovementType } from '../shared/types';

function ch(id:string,name:string,backstory:string,className:UnitClassName,baseLevel:number,baseStats:Stats,personalGrowthBonuses:Partial<GrowthRates>,personalSkills:string[],startingEquipment:string[],recruitChapter:string,isLord:boolean,portraitColor:string,supportPartners:string[],recruitCondition?:string):CharacterDefinition{
  return{id,name,backstory,className,baseLevel,baseStats,personalGrowthBonuses,personalSkills,startingEquipment,recruitChapter,recruitCondition,isLord,portraitColor,supportPartners};
}

const s=(hp:number,str:number,mag:number,skl:number,spd:number,lck:number,def:number,res:number,mov:number):Stats=>({hp,strength:str,magic:mag,skill:skl,speed:spd,luck:lck,defense:def,resistance:res,movement:mov});

export const characters: CharacterDefinition[] = [
  // ===== PLAYER CHARACTERS (20+) =====
  ch('alaric','Alaric','The crown prince of Valdris, forced into exile after the kingdom falls. He carries the legendary Rapier and fights to reclaim his homeland.',UnitClassName.Warrior,1,s(22,8,1,6,6,5,7,2,5),{hp:10,strength:10,speed:5,skill:5},[],['rapier'],'ch-1',true,'#3366cc',['elena','marcus','lira','kael','theron']),
  ch('elena','Elena','Alaric\'s childhood friend and devoted healer. She left the convent to follow him into battle.',UnitClassName.Cleric,1,s(18,0,7,5,6,8,2,8,5),{magic:10,luck:5,resistance:5},[],['heal-staff'],'ch-1',false,'#ff99cc',['alaric','marcus','theron']),
  ch('marcus','Marcus','A veteran knight who served Alaric\'s father. His loyalty to the royal family is unwavering.',UnitClassName.Knight,3,s(24,9,0,7,6,4,8,2,7),{defense:10,hp:5},[],['iron-lance','javelin'],'ch-1',false,'#996633',['alaric','elena','lira']),
  ch('lira','Lira','A hunter from the borderlands whose village was destroyed by the invading army. She seeks vengeance.',UnitClassName.Archer,2,s(20,7,0,9,8,5,4,3,5),{skill:10,speed:5,luck:5},[],['iron-bow'],'ch-2',false,'#339933',['alaric','marcus','kael']),
  ch('theron','Theron','A scholar who fled the academy when it was seized. His knowledge of magic is vast.',UnitClassName.Mage,2,s(18,0,9,6,5,4,3,7,5),{magic:10,skill:5},[],['fire'],'ch-3',false,'#9933cc',['alaric','elena','kael']),
  ch('kael','Kael','A roguish thief from the undercity with a heart of gold. He steals from the corrupt.',UnitClassName.Thief,4,s(21,6,0,10,11,9,4,3,6),{speed:10,skill:5,luck:5},[],['iron-sword','chest-key'],'ch-4',false,'#666666',['alaric','lira','theron']),
  ch('seraphina','Seraphina','A traveling dancer who uses her art to inspire allies. She hides a mysterious past.',UnitClassName.Dancer,5,s(20,3,4,6,10,10,3,5,6),{speed:10,luck:10},[],['slim-sword'],'ch-6',false,'#ff66ff',['alaric','elena']),
  ch('gareth','Gareth','A grizzled warrior from the northern mountains. He fights with brutal efficiency.',UnitClassName.Warrior,5,s(26,11,0,7,6,3,9,1,5),{strength:10,hp:10},[],['steel-sword','hand-axe'],'ch-5',false,'#cc6600',['marcus']),
  ch('faye','Faye','A wind mage from the coastal villages. She dreams of seeing the world beyond the shore.',UnitClassName.Mage,4,s(19,0,8,7,7,5,2,6,5),{magic:5,speed:10},[],['wind'],'ch-5',false,'#66ccff',['theron','elena']),
  ch('dorian','Dorian','A disgraced knight seeking redemption. He abandoned his post to protect civilians.',UnitClassName.Knight,6,s(26,10,0,8,5,4,10,3,7),{defense:10,strength:5},[],['steel-lance'],'ch-7',false,'#cc9933',['marcus','alaric']),
  ch('nyx','Nyx','A dark mage from the forbidden tower. She uses dangerous magic for a noble cause.',UnitClassName.Mage,5,s(18,0,10,6,6,3,2,8,5),{magic:15},[],['flux'],'ch-8',false,'#330066',['theron','kael']),
  ch('rowena','Rowena','An archer from the royal guard. She remained loyal when others fled.',UnitClassName.Archer,6,s(22,8,0,10,8,5,5,3,5),{skill:10,speed:5},[],['steel-bow'],'ch-9',false,'#996699',['lira','marcus']),
  ch('cedric','Cedric','A young warrior eager to prove himself. He idolizes Alaric.',UnitClassName.Warrior,3,s(23,8,0,5,7,6,6,2,5),{speed:10,strength:5},[],['iron-sword'],'ch-7',false,'#cc3333',['alaric','gareth']),
  ch('isolde','Isolde','A cleric from the mountain monastery. Her faith is unshakeable.',UnitClassName.Cleric,5,s(20,0,8,5,5,7,3,9,5),{magic:5,resistance:10},[],['mend-staff'],'ch-8',false,'#ffcc66',['elena','faye']),
  ch('felix','Felix','A cavalier with a competitive streak. Always racing to be the best.',UnitClassName.Knight,7,s(27,10,0,8,8,5,8,2,7),{speed:10,strength:5},[],['steel-lance','javelin'],'ch-10',false,'#3399ff',['marcus','dorian']),
  ch('luna','Luna','A mysterious mage who appears during a crisis. Her true allegiance is unknown.',UnitClassName.Mage,8,s(21,0,12,7,7,4,3,9,5),{magic:10,resistance:5},[],['elfire','elwind'],'ch-12',false,'#000066',['theron','nyx']),
  ch('owen','Owen','A reformed bandit who joins the cause after Alaric spares his life.',UnitClassName.Warrior,6,s(28,12,0,6,5,3,8,1,5),{hp:10,strength:10},[],['steel-axe','hand-axe'],'ch-11',false,'#885522',['gareth','kael']),
  ch('elara','Elara','A skilled thief working as a spy for the resistance.',UnitClassName.Thief,7,s(23,7,0,11,12,8,4,3,6),{speed:5,skill:10},[],['steel-sword'],'ch-13',false,'#cc66cc',['kael','seraphina']),
  ch('bram','Bram','A massive warrior who wields axes with devastating force.',UnitClassName.Warrior,9,s(32,14,0,7,4,2,11,1,5),{strength:15,defense:5},[],['steel-axe','iron-axe'],'ch-14',false,'#884400',['gareth','owen']),
  ch('miranda','Miranda','A valkyrie who descends from a long line of holy warriors.',UnitClassName.Cleric,8,s(22,0,10,6,7,8,3,10,5),{magic:10,luck:5,resistance:5},[],['mend-staff','lightning'],'ch-15',false,'#ffaacc',['elena','isolde']),
  // ===== BOSSES (10+) =====
  ch('boss-zarek','Zarek','The dark general who orchestrated the fall of Valdris. A ruthless tactician.',UnitClassName.General,10,s(35,15,0,10,5,4,16,5,4),{strength:10,defense:10},[],['silver-lance','javelin'],'ch-1',false,'#330000',[]),
  ch('boss-morgana','Morgana','A sorceress serving the dark empire. She revels in destruction.',UnitClassName.Sage,8,s(28,0,14,9,8,5,4,12,5),{magic:15},[],['elfire','nosferatu'],'ch-3',false,'#660066',[]),
  ch('boss-varg','Varg','The bandit king of the undercity. Rules through fear and violence.',UnitClassName.Berserker,9,s(34,14,0,7,7,3,8,2,5),{strength:10,hp:10},[],['steel-axe','hand-axe'],'ch-4',false,'#663300',[]),
  ch('boss-drake','Drake','A fallen paladin who betrayed the kingdom for power.',UnitClassName.Paladin,10,s(32,13,0,10,8,4,12,6,7),{defense:10,strength:5},[],['silver-lance','steel-sword'],'ch-5',false,'#333399',[]),
  ch('boss-selene','Selene','A dark priestess conducting forbidden rituals.',UnitClassName.Bishop,9,s(26,0,13,8,6,5,4,14,5),{magic:10,resistance:10},[],['nosferatu','lightning'],'ch-8',false,'#990066',[]),
  ch('boss-fenrir','Fenrir','A berserker warlord from the frozen north.',UnitClassName.Berserker,12,s(40,17,0,8,8,3,10,2,5),{strength:15,hp:10},[],['silver-axe','tomahawk'],'ch-10',false,'#660000',[]),
  ch('boss-ravus','Ravus','The emperor\'s right hand. A master swordsman.',UnitClassName.Assassin,14,s(34,14,0,16,16,6,8,5,6),{speed:10,skill:10},[],['silver-sword','killing-edge'],'ch-15',false,'#222222',[]),
  ch('boss-calista','Calista','A sage general who commands the imperial mage corps.',UnitClassName.Sage,13,s(30,0,16,10,9,5,5,14,5),{magic:15,skill:5},[],['bolganone','aura'],'ch-18',false,'#663399',[]),
  ch('boss-aldric','Aldric','A great knight blocking the path to the capital.',UnitClassName.GreatKnight,15,s(42,16,0,10,6,4,18,6,5),{defense:15,strength:5},[],['silver-lance','silver-axe'],'ch-20',false,'#444444',[]),
  ch('boss-emperor','Emperor Malachar','The tyrant emperor who conquered Valdris. The final boss.',UnitClassName.DarkKnight,20,s(50,18,14,14,12,8,16,12,7),{strength:10,magic:10,defense:5,resistance:5},[],['runesword','bolganone'],'ch-25',false,'#110011',[]),
  // ===== NPC ALLIES (5+) =====
  ch('npc-villager-1','Village Guard','A brave villager defending his home.',UnitClassName.Warrior,2,s(20,6,0,5,5,3,5,1,5),{},[],'iron-sword'.split(','),'ch-2',false,'#88aa88',[]),
  ch('npc-villager-2','Village Archer','A hunter who joins the defense of the village.',UnitClassName.Archer,2,s(18,5,0,7,6,4,3,2,5),{},[],'iron-bow'.split(','),'ch-2',false,'#88aa88',[]),
  ch('npc-knight-1','Royal Guard','A surviving member of the royal guard.',UnitClassName.Knight,5,s(24,8,0,7,6,4,8,2,7),{},[],'steel-lance'.split(','),'ch-5',false,'#3355aa',[]),
  ch('npc-cleric-1','Sister Maria','A nun who aids the army with healing.',UnitClassName.Cleric,4,s(18,0,6,5,5,6,2,7,5),{},[],'heal-staff'.split(','),'ch-7',false,'#eeeecc',[]),
  ch('npc-mage-1','Academy Student','A mage student who escaped the siege.',UnitClassName.Mage,3,s(17,0,7,5,5,4,2,6,5),{},[],'fire'.split(','),'ch-3',false,'#9966cc',[]),
  ch('npc-fighter-1','Resistance Fighter','A member of the underground resistance.',UnitClassName.Warrior,6,s(25,9,0,6,6,4,7,1,5),{},[],'steel-sword'.split(','),'ch-9',false,'#889966',[]),
  // ===== ADDITIONAL CHARACTERS (paralogue recruits) =====
  ch('valen','Valen','A retired arena champion seeking one last worthy challenge.',UnitClassName.Warrior,8,s(30,13,0,9,7,5,9,2,5),{strength:10,skill:5},[],['steel-sword','steel-axe'],'par-arena',false,'#cc9900',['gareth','bram'],'Complete the arena paralogue'),
  ch('sylvia','Sylvia','A mysterious mage hiding in a remote village. Kael knows her from the undercity.',UnitClassName.Mage,7,s(20,0,11,7,7,5,3,8,5),{magic:10,speed:5},[],['elwind','elthunder'],'par-village',false,'#66cc99',['theron','nyx'],'Kael survives chapter 6'),
  ch('roland','Roland','A paladin from a neighboring kingdom who seeks alliance.',UnitClassName.Paladin,10,s(30,12,2,9,8,5,11,5,7),{defense:5,strength:5},[],['silver-lance','steel-sword'],'par-diplomacy',false,'#4444aa',['marcus','dorian'],'Complete diplomacy paralogue'),
  ch('iris','Iris','A sniper who guards a sacred forest. She tests all who enter.',UnitClassName.Sniper,9,s(24,9,0,14,9,6,5,4,5),{skill:15},[],['silver-bow','killer-bow'],'par-forest',false,'#228833',['lira','rowena'],'Complete forest paralogue'),
  ch('dante','Dante','An assassin who defected from the empire after a crisis of conscience.',UnitClassName.Assassin,11,s(28,11,0,13,14,7,6,4,6),{speed:10,skill:5},[],['killing-edge','iron-bow'],'par-defector',false,'#333333',['kael','elara'],'Complete defector paralogue'),
];
