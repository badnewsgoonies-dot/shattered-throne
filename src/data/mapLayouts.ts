import { GridMap, GridType, TerrainType, MovementType, Tile, TerrainData, Position } from '../shared/types';

const T: Record<string, TerrainData> = {
  '.': { type: TerrainType.Plains, movementCost: { [MovementType.Foot]: 1, [MovementType.Mounted]: 1, [MovementType.Armored]: 1, [MovementType.Flying]: 1 }, defenseBonus: 0, evasionBonus: 0, heightLevel: 0, passable: { [MovementType.Foot]: true, [MovementType.Mounted]: true, [MovementType.Armored]: true, [MovementType.Flying]: true } },
  'F': { type: TerrainType.Forest, movementCost: { [MovementType.Foot]: 2, [MovementType.Mounted]: 3, [MovementType.Armored]: 2, [MovementType.Flying]: 1 }, defenseBonus: 1, evasionBonus: 20, heightLevel: 0, passable: { [MovementType.Foot]: true, [MovementType.Mounted]: true, [MovementType.Armored]: true, [MovementType.Flying]: true } },
  'M': { type: TerrainType.Mountain, movementCost: { [MovementType.Foot]: 4, [MovementType.Mounted]: 99, [MovementType.Armored]: 99, [MovementType.Flying]: 1 }, defenseBonus: 3, evasionBonus: 30, heightLevel: 2, passable: { [MovementType.Foot]: true, [MovementType.Mounted]: false, [MovementType.Armored]: false, [MovementType.Flying]: true } },
  'W': { type: TerrainType.Water, movementCost: { [MovementType.Foot]: 99, [MovementType.Mounted]: 99, [MovementType.Armored]: 99, [MovementType.Flying]: 1 }, defenseBonus: 0, evasionBonus: 0, heightLevel: -1, passable: { [MovementType.Foot]: false, [MovementType.Mounted]: false, [MovementType.Armored]: false, [MovementType.Flying]: true } },
  'X': { type: TerrainType.Fortress, movementCost: { [MovementType.Foot]: 1, [MovementType.Mounted]: 1, [MovementType.Armored]: 1, [MovementType.Flying]: 1 }, defenseBonus: 3, evasionBonus: 20, heightLevel: 1, passable: { [MovementType.Foot]: true, [MovementType.Mounted]: true, [MovementType.Armored]: true, [MovementType.Flying]: true } },
  'B': { type: TerrainType.Bridge, movementCost: { [MovementType.Foot]: 1, [MovementType.Mounted]: 1, [MovementType.Armored]: 1, [MovementType.Flying]: 1 }, defenseBonus: 0, evasionBonus: 0, heightLevel: 0, passable: { [MovementType.Foot]: true, [MovementType.Mounted]: true, [MovementType.Armored]: true, [MovementType.Flying]: true } },
  'S': { type: TerrainType.Swamp, movementCost: { [MovementType.Foot]: 3, [MovementType.Mounted]: 4, [MovementType.Armored]: 3, [MovementType.Flying]: 1 }, defenseBonus: 0, evasionBonus: 10, heightLevel: -1, passable: { [MovementType.Foot]: true, [MovementType.Mounted]: true, [MovementType.Armored]: true, [MovementType.Flying]: true } },
  'D': { type: TerrainType.Sand, movementCost: { [MovementType.Foot]: 2, [MovementType.Mounted]: 3, [MovementType.Armored]: 3, [MovementType.Flying]: 1 }, defenseBonus: 0, evasionBonus: 5, heightLevel: 0, passable: { [MovementType.Foot]: true, [MovementType.Mounted]: true, [MovementType.Armored]: true, [MovementType.Flying]: true } },
  'N': { type: TerrainType.Snow, movementCost: { [MovementType.Foot]: 2, [MovementType.Mounted]: 2, [MovementType.Armored]: 2, [MovementType.Flying]: 1 }, defenseBonus: 0, evasionBonus: 5, heightLevel: 0, passable: { [MovementType.Foot]: true, [MovementType.Mounted]: true, [MovementType.Armored]: true, [MovementType.Flying]: true } },
  'L': { type: TerrainType.Lava, movementCost: { [MovementType.Foot]: 99, [MovementType.Mounted]: 99, [MovementType.Armored]: 99, [MovementType.Flying]: 1 }, defenseBonus: 0, evasionBonus: 0, heightLevel: 0, passable: { [MovementType.Foot]: false, [MovementType.Mounted]: false, [MovementType.Armored]: false, [MovementType.Flying]: true } },
  'V': { type: TerrainType.Void, movementCost: { [MovementType.Foot]: 99, [MovementType.Mounted]: 99, [MovementType.Armored]: 99, [MovementType.Flying]: 99 }, defenseBonus: 0, evasionBonus: 0, heightLevel: 0, passable: { [MovementType.Foot]: false, [MovementType.Mounted]: false, [MovementType.Armored]: false, [MovementType.Flying]: false } },
};

function buildGrid(w: number, h: number, layout: string[], dz: Position[]): { tiles: Tile[][]; deploymentZones: Position[] } {
  const dzSet = new Set(dz.map(p => `${p.x},${p.y}`));
  const tiles: Tile[][] = [];
  for (let y = 0; y < h; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < w; x++) {
      const ch = layout[y]?.[x] ?? '.';
      row.push({
        position: { x, y },
        terrain: T[ch] || T['.'],
        occupantId: null, itemId: null,
        isChest: false, isDoor: false,
        isDeploymentZone: dzSet.has(`${x},${y}`),
        fogRevealed: true,
      });
    }
    tiles.push(row);
  }
  return { tiles, deploymentZones: dz };
}

function m(id: string, name: string, w: number, h: number, layout: string[], dz: Position[]): GridMap {
  const { tiles, deploymentZones } = buildGrid(w, h, layout, dz);
  return { id, name, width: w, height: h, gridType: GridType.Square, tiles, deploymentZones };
}

export const mapLayouts: GridMap[] = [
  m('map-ch1', 'Castle Courtyard', 8, 8, ['XX....XX','X......X','........','..FF....','....FF..','........','........','........'], [{x:0,y:6},{x:1,y:6},{x:2,y:6},{x:0,y:7},{x:1,y:7},{x:2,y:7}]),
  m('map-ch2', 'Forest Path', 10, 10, ['FFFFFFFFFF','FF..FFFFFF','F....FFFFF','F.....FFFF','......FFF.','..........', '.F........','FF........','FFF.......','FFFF......'], [{x:0,y:8},{x:1,y:8},{x:0,y:9},{x:1,y:9},{x:2,y:9},{x:3,y:9}]),
  m('map-ch3', 'Academy Grounds', 12, 12, ['XXXX....XXXX','XX........XX','X..........X','............','....XX......','....XX......','............','..FF....FF..','..FF....FF..','............','............','............'], [{x:4,y:10},{x:5,y:10},{x:6,y:10},{x:7,y:10},{x:4,y:11},{x:5,y:11},{x:6,y:11},{x:7,y:11}]),
  m('map-ch4', 'Undercity', 10, 10, ['VV......VV','V........V','..VVVV....','..V..V....','..V..V....','..........','....VV....','....VV....','..........','..........'], [{x:0,y:8},{x:1,y:8},{x:0,y:9},{x:1,y:9},{x:2,y:9}]),
  m('map-ch5', 'Bridge of Sorrows', 8, 16, ['WWWBBWWW','WWWBBWWW','WWWBBWWW','..WBBW..','..WBBW..','...BB...','...BB...','...BB...','...BB...','...BB...','..WBBW..','..WBBW..','WWWBBWWW','WWWBBWWW','...BB...','........'], [{x:3,y:14},{x:4,y:14},{x:3,y:15},{x:4,y:15},{x:2,y:15},{x:5,y:15}]),
  m('map-ch6', 'Open Plains', 12, 12, ['............','.FF....FF...','.FF....FF...','............','....MM......','....MM......','............','......FF....','......FF....','............','............','............'], [{x:0,y:10},{x:1,y:10},{x:2,y:10},{x:0,y:11},{x:1,y:11},{x:2,y:11},{x:3,y:11},{x:4,y:11}]),
  m('map-ch7', 'Mountain Pass', 10, 14, ['MMMM..MMMM','MMM....MMM','MM......MM','MM......MM','M........M','M........M','..........','M........M','M........M','MM......MM','MM......MM','MMM....MMM','MMM....MMM','MMMM..MMMM'], [{x:4,y:12},{x:5,y:12},{x:4,y:13},{x:5,y:13},{x:3,y:13},{x:6,y:13}]),
  m('map-ch8', 'Haunted Graveyard', 10, 10, ['..FF..FF..','..........','..XX..XX..','..........','....XX....','....XX....','..........','..XX..XX..','..........','..........'], [{x:3,y:8},{x:4,y:8},{x:5,y:8},{x:6,y:8},{x:3,y:9},{x:4,y:9},{x:5,y:9},{x:6,y:9}]),
  m('map-ch9', 'Port City', 14, 14, ['WWWWWWW.......','WWWWWW........','WWWWW.........','WWWW..........','WWW...........','WW............','W.............','..............','..............','......XX......','......XX......','..............','..............','..............'], [{x:10,y:12},{x:11,y:12},{x:12,y:12},{x:10,y:13},{x:11,y:13},{x:12,y:13},{x:13,y:13},{x:13,y:12}]),
  m('map-ch10', "Warlord's Fortress", 12, 12, ['XXXXXXXXXXXX','X..........X','X..XXXX....X','X..X..X....X','X..X..X....X','X..XXXX....X','X..........X','X..........X','X..........X','X..........X','X..........X','XXXX....XXXX'], [{x:4,y:10},{x:5,y:10},{x:6,y:10},{x:7,y:10},{x:4,y:11},{x:5,y:11},{x:6,y:11},{x:7,y:11}]),
  m('map-ch11', 'Frozen Tundra', 14, 10, ['NNNNNNNNNNNNNN','NNN..NNNN..NNN','NN....NN....NN','N..........N..','..............','..............','N..........N..','NN....NN....NN','NNN..NNNN..NNN','NNNNNNNNNNNNNN'], [{x:1,y:4},{x:2,y:4},{x:1,y:5},{x:2,y:5},{x:3,y:5},{x:3,y:4}]),
  m('map-ch12', 'Desert Oasis', 12, 12, ['DDDDDDDDDDDD','DDD...DDDDDD','DD.....DDDDD','DD..WW..DDDD','D...WW...DDD','D....FF...DD','DD...FF....D','DDD.........','DDDD........','DDDDD.......','DDDDD.......','DDDDDD......'], [{x:8,y:10},{x:9,y:10},{x:10,y:10},{x:8,y:11},{x:9,y:11},{x:10,y:11},{x:11,y:11}]),
  m('map-ch13', 'Murky Swamp', 10, 12, ['SSSS..SSSS','SSS....SSS','SS......SS','S...FF...S','....FF....','..........','..........','S...FF...S','SS..FF..SS','SSS....SSS','SSSS..SSSS','SSSSSSSSSS'], [{x:4,y:10},{x:5,y:10},{x:4,y:11},{x:5,y:11},{x:3,y:10},{x:6,y:10}]),
  m('map-ch14', 'Abandoned Mines', 10, 10, ['VV....VVVV','V......VVV','........VV','..VV......','..VV......','......VV..','......VV..','VV........','VVV......V','VVVV..VVVV'], [{x:4,y:8},{x:5,y:8},{x:4,y:9},{x:5,y:9}]),
  m('map-ch15', 'Dark Forest', 16, 16, ['FFFFFFFFFFFFFFFF','FFF..FFFFFFFFFFF','FF....FFFFFFFFFF','FF.....FFFFFFFFF','F.......FFFFFFFF','F........FFFFFFF','..........FFFFFF','...........FFFFF','F...........FFFF','FF...........FFF','FFF...........FF','FFFF...........F','FFFFF...........',  'FFFFFF..........','FFFFFFF.........','FFFFFFFF........'], [{x:12,y:14},{x:13,y:14},{x:14,y:14},{x:12,y:15},{x:13,y:15},{x:14,y:15},{x:15,y:15},{x:15,y:14}]),
  m('map-ch16', 'Volcanic Fields', 12, 12, ['..LL....LL..','...LL..LL...','....LLLL....','............','LL........LL','LL........LL','............','....LLLL....','...LL..LL...','..LL....LL..','............','............'], [{x:4,y:10},{x:5,y:10},{x:6,y:10},{x:7,y:10},{x:4,y:11},{x:5,y:11},{x:6,y:11},{x:7,y:11}]),
  m('map-ch17', 'Imperial Throne Room', 16, 10, ['XXXXXXXXXXXXXXXX','X..............X','X..XX......XX..X','X..XX......XX..X','X..............X','X..............X','X..XX......XX..X','X..XX......XX..X','X..............X','XXXX........XXXX'], [{x:6,y:8},{x:7,y:8},{x:8,y:8},{x:9,y:8},{x:6,y:9},{x:7,y:9},{x:8,y:9},{x:9,y:9}]),
  m('map-ch18', 'Mountain Summit', 10, 10, ['MMMMMMMMMM','MMM....MMM','MM......MM','M........M','..........','..........','M........M','MM......MM','MMM....MMM','MMMMMMMMMM'], [{x:4,y:4},{x:5,y:4},{x:4,y:5},{x:5,y:5},{x:3,y:4},{x:6,y:5}]),
  m('map-ch19', 'River Valley', 14, 10, ['..WWW.........','...WWW........','....WWW.......','.....BBB......','......BBB.....', '.......WWW....','........WWW...', '.........WWW..','..........WWW.','...........WW.'], [{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:0,y:2},{x:1,y:2}]),
  m('map-ch20', 'Imperial Capital', 20, 20, ['XXXXXXXXXXXXXXXXXXXX','X..................X','X..XX........XX..X.','X..XX........XX..X.','X..................X','X..................X','X......XXXX......X.','X......X..X......X.','X......X..X......X.','X......XXXX......X.','X..................X','X..................X','X..FF........FF..X.','X..FF........FF..X.','X..................X','X..................X','X..................X','X..................X','X..................X','XXXX..........XXXXX'], [{x:8,y:18},{x:9,y:18},{x:10,y:18},{x:11,y:18},{x:7,y:19},{x:8,y:19},{x:9,y:19},{x:10,y:19}]),
  m('map-arena', 'Arena', 8, 8, ['XXXXXXXX','X......X','X......X','X......X','X......X','X......X','X......X','XXXXXXXX'], [{x:1,y:5},{x:2,y:5},{x:3,y:5},{x:1,y:6},{x:2,y:6},{x:3,y:6}]),
  m('map-hidden-village', 'Hidden Village', 10, 10, ['FFFFFFFFFF','FFF....FFF','FF......FF','F...XX...F','....XX....','F.........','FF........','FFF.......','FFFF......','FFFFF.....'], [{x:6,y:8},{x:7,y:8},{x:8,y:8},{x:6,y:9},{x:7,y:9},{x:8,y:9}]),
];
