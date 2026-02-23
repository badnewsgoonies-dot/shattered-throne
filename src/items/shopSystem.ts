import { ItemData, IDataProvider } from '../shared/types';

// Shop inventories per chapter range
const EARLY_ITEMS = [
  'iron-sword', 'iron-lance', 'iron-axe', 'iron-bow',
  'fire', 'wind', 'thunder', 'heal',
  'vulnerary', 'antidote',
];

const MID_ITEMS = [
  ...EARLY_ITEMS,
  'steel-sword', 'steel-lance', 'steel-axe', 'steel-bow',
  'elfire', 'elwind', 'elthunder', 'mend',
  'iron-shield', 'leather-armor',
  'vulnerary', 'antidote', 'pure-water', 'door-key', 'chest-key',
];

const LATE_ITEMS = [
  ...MID_ITEMS,
  'silver-sword', 'silver-lance', 'silver-axe', 'silver-bow',
  'bolganone', 'tornado', 'thoron', 'nosferatu', 'aura',
  'recover',
  'hero-crest', 'knight-crest', 'guiding-ring', 'orion-bolt', 'elysian-whip',
  'master-seal',
  'elixir',
];

// Map from chapterId to item ID list
const chapterShopMap: Record<string, string[]> = {};

function getChapterNumber(chapterId: string): number {
  const match = chapterId.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

function getItemIdsForChapter(chapterId: string): string[] {
  if (chapterShopMap[chapterId]) return chapterShopMap[chapterId];
  const num = getChapterNumber(chapterId);
  if (num <= 5) return EARLY_ITEMS;
  if (num <= 15) return MID_ITEMS;
  return LATE_ITEMS;
}

export function getShopInventory(
  chapterId: string,
  data: IDataProvider
): ItemData[] {
  const ids = getItemIdsForChapter(chapterId);
  const items: ItemData[] = [];
  for (const id of ids) {
    const item = data.getItem(id);
    if (item) items.push(item);
  }
  return items;
}
