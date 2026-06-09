import type { Achievement } from '@/types/achievement'

/**
 * All 51 Coral Island achievements (Steam appid 1158160).
 *
 * `name` matches the official Steam display name exactly. `steamApiName` is Steam's
 * stable internal key (the sync matches on it). Coin achievements carry a `goal` +
 * `metric` so the app can show progress from the imported save (playerLifetimeEarnings).
 * The 17 `collection` achievements point at a `collectionKey` (see src/data/collections).
 *
 * Source: coral.guide + community guides; Steam apinames + save fields verified locally.
 */
export const achievements: Achievement[] = [
  // ─── Coins (progress from save: lifetimeEarnings) ────────
  { id: 'it-aint-much', steamApiName: 'MONEY_1_1', name: 'It Ain’t Much', requirement: 'Earn 20,000 coins', kind: 'simple', metric: 'lifetimeEarnings', goal: 20000 },
  { id: 'honest-work', steamApiName: 'MONEY_1_2', name: 'But It’s Honest Work', requirement: 'Earn 50,000 coins', kind: 'simple', metric: 'lifetimeEarnings', goal: 50000 },
  { id: 'learning-the-trade', steamApiName: 'MONEY_1_3', name: 'Learning the Trade', requirement: 'Earn 100,000 coins', kind: 'simple', metric: 'lifetimeEarnings', goal: 100000 },
  { id: 'capital-gains', steamApiName: 'MONEY_1_4', name: 'Capital Gains', requirement: 'Earn 250,000 coins', kind: 'simple', metric: 'lifetimeEarnings', goal: 250000 },
  { id: 'entrepreneur', steamApiName: 'MONEY_1_5', name: 'Entrepreneur', requirement: 'Earn 500,000 coins', kind: 'simple', metric: 'lifetimeEarnings', goal: 500000 },
  { id: 'island-millionaire', steamApiName: 'MONEY_1_6', name: 'Island Millionaire', requirement: 'Earn 1,000,000 coins', kind: 'simple', metric: 'lifetimeEarnings', goal: 1000000 },
  { id: 'high-roller', steamApiName: 'MONEY_1_7', name: 'High Roller', requirement: 'Earn 10,000,000 coins', kind: 'simple', metric: 'lifetimeEarnings', goal: 10000000 },

  // ─── Collections (museum / journal) ──────────────────────
  { id: 'bug-enjoyer', steamApiName: 'COLLECTION_2_11', name: 'Bug Fancier', requirement: 'Complete the bug collection', kind: 'collection', collectionKey: 'bugs' },
  { id: 'fishing-mania', steamApiName: 'COLLECTION_2_12', name: 'Fishing Mania', requirement: 'Complete the fish collection', kind: 'collection', collectionKey: 'fish' },
  { id: 'marine-observer', steamApiName: 'COLLECTION_2_13', name: 'Marine Observer', requirement: 'Complete the sea critter collection', kind: 'collection', collectionKey: 'sea-critters' },
  { id: 'part-time-curator', steamApiName: 'COLLECTION_2_14', name: 'Part-Time Curator', requirement: 'Complete the Museum', kind: 'collection', collectionKey: 'museum' },
  { id: 'memento-of-the-past', steamApiName: 'COLLECTION_2_8', name: 'Memento of the Past', requirement: 'Complete the artifact collection', kind: 'collection', collectionKey: 'artifacts' },
  { id: 'bejeweled', steamApiName: 'COLLECTION_2_9', name: 'Bejeweled', requirement: 'Complete the gem collection', kind: 'collection', collectionKey: 'gems' },
  { id: 'paleontologist', steamApiName: 'COLLECTION_2_10', name: 'Paleontologist', requirement: 'Complete the dinosaur collection', kind: 'collection', collectionKey: 'dinosaurs' },

  // ─── Mine / temple / world ───────────────────────────────
  { id: 'darkest-cavern', steamApiName: 'CLEAR_3_15', name: 'Darkest Cavern', requirement: 'Clear all the mine gates', kind: 'simple' },
  { id: 'healing-the-ocean', steamApiName: 'CLEAR_3_16', name: 'Healing the Ocean', requirement: 'Heal all the sick coral', kind: 'simple' },
  { id: 'healing-the-world', steamApiName: 'CLEAR_3_17', name: 'Healing the World', requirement: 'Restore the temple', kind: 'simple' },
  { id: 'gullivers-voyage', steamApiName: 'ACCESS_4_18', name: 'Gulliver’s Voyage', requirement: 'Gain access to Giants Village', kind: 'simple' },
  { id: 'undersea-mystery', steamApiName: 'ACCESS_4_19', name: 'Undersea Mystery', requirement: 'Gain access to the Merfolk Kingdom', kind: 'simple' },

  // ─── Relationships ───────────────────────────────────────
  { id: 'lets-be-platonic', steamApiName: 'HEARTS_5_21', name: 'Let’s Be Platonic', requirement: 'Reach heart level 5 with an NPC', kind: 'simple' },
  { id: 'close-friend', steamApiName: 'HEARTS_5_22', name: 'Good Friends', requirement: 'Reach heart level 8 with an NPC', kind: 'simple' },
  { id: 'the-best-of-friends', steamApiName: 'HEARTS_5_23', name: 'The Best of Friends', requirement: 'Reach heart level 10 with an NPC', kind: 'simple' },
  { id: 'popular-newcomer', steamApiName: 'HEARTS_5_24', name: 'Popular Newcomer', requirement: 'Reach heart level 5 with 25 NPCs', kind: 'simple' },
  { id: 'social-butterfly', steamApiName: 'HEARTS_5_25', name: 'Social Butterfly', requirement: 'Reach heart level 8 with 25 NPCs', kind: 'simple' },
  { id: 'sweetheart', steamApiName: 'HEARTS_5_26', name: 'Coral Island’s Sweetheart', requirement: 'Reach heart level 8 with all townies', kind: 'collection', collectionKey: 'townies-hearts' },
  { id: 'charitable-heart', steamApiName: 'RELATIONSHIP_6_27', name: 'Charitable Heart', requirement: 'Give a gift to 25 NPCs', kind: 'simple' },
  { id: 'multi-level-gifting', steamApiName: 'RELATIONSHIP_6_28', name: 'Multi-level Gifting', requirement: 'Give a gift to all townies', kind: 'collection', collectionKey: 'townies-gifts' },
  { id: 'its-a-date', steamApiName: 'RELATIONSHIP_6_29', name: 'It’s A Date!', requirement: 'Start dating an NPC', kind: 'simple' },
  { id: 'a-new-chapter', steamApiName: 'RELATIONSHIP_6_30', name: 'A New Chapter', requirement: 'Get married', kind: 'simple' },
  { id: 'a-full-house', steamApiName: 'RELATIONSHIP_6_31', name: 'A Full House', requirement: 'Have 2 children', kind: 'simple' },

  // ─── Farming ─────────────────────────────────────────────
  { id: 'simple-life', steamApiName: 'FARM_10_42', name: 'Simple Life', requirement: 'Harvest 100 crops', kind: 'simple' },
  { id: 'variety-farmer', steamApiName: 'FARM_10_43', name: 'Variety Farmer', requirement: 'Ship 30 different crops', kind: 'simple' },
  { id: 'you-name-it', steamApiName: 'FARM_10_44', name: 'You Name It We Sell It', requirement: 'Ship all crops', kind: 'collection', collectionKey: 'crops' },
  { id: 'specialty-farmer', steamApiName: 'FARM_10_50', name: 'Specialty Farmer', requirement: 'Ship one crop 1,000 times', kind: 'simple', shipList: 'crops' },

  // ─── Ranching ────────────────────────────────────────────
  { id: 'new-rancher', steamApiName: 'FARM_10_45', name: 'New Rancher on the Block', requirement: 'Ship 2 animal products', kind: 'simple' },
  { id: 'fresh-from-the-farm', steamApiName: 'FARM_10_46', name: 'Fresh from the Farm', requirement: 'Ship 5 animal products', kind: 'simple' },
  { id: 'trophy-rancher', steamApiName: 'FARM_10_47', name: 'Operation Trophy Rancher', requirement: 'Ship all animal products', kind: 'collection', collectionKey: 'animal-products' },
  { id: 'grade-a-only', steamApiName: 'FARM_10_48', name: 'Grade A Only', requirement: 'Ship a golden animal product', kind: 'simple' },
  { id: 'specialty-rancher', steamApiName: 'FARM_10_51', name: 'Specialty Rancher', requirement: 'Ship one animal product 1,000 times', kind: 'simple', metric: 'maxAnimalProductShipped', goal: 1000, shipList: 'animalProducts' },

  // ─── Crafting / cooking ──────────────────────────────────
  { id: 'handy-farmer', steamApiName: 'COOK_7_34', name: 'Handy Farmer', requirement: 'Craft 15 things', kind: 'simple' },
  { id: 'diy-expert', steamApiName: 'COOK_7_35', name: 'DIY Expert', requirement: 'Craft all things', kind: 'collection', collectionKey: 'craftables' },
  { id: 'home-cook', steamApiName: 'COOK_7_32', name: 'Home Cook', requirement: 'Cook 15 recipes', kind: 'simple' },
  { id: 'chef-de-cuisine', steamApiName: 'COOK_7_33', name: 'Chef de Cuisine', requirement: 'Cook all recipes', kind: 'collection', collectionKey: 'recipes' },

  // ─── Clothing ────────────────────────────────────────────
  { id: 'style-maker', steamApiName: 'CLOTHING_8_36', name: 'Stylemaker', requirement: 'Purchase 10 pieces of clothing', kind: 'simple' },
  { id: 'fashionista', steamApiName: 'CLOTHING_8_37', name: 'Fashionista', requirement: 'Purchase 50 pieces of clothing', kind: 'simple' },
  { id: 'fashion-guru', steamApiName: 'CLOTHING_8_38', name: 'Fashion Guru', requirement: 'Purchase all clothing', kind: 'collection', collectionKey: 'clothing' },

  // ─── Combat ──────────────────────────────────────────────
  { id: 'ironclad-slayer', steamApiName: 'COMBAT_9_39', name: 'Ironclad Slayer', requirement: 'Slay 10 enemy types', kind: 'simple' },
  { id: 'untouchable', steamApiName: 'COMBAT_9_40', name: 'Untouchable', requirement: 'Slay 20 enemy types', kind: 'simple' },
  { id: 'boss-finest', steamApiName: 'COMBAT_9_41', name: 'B.O.S. Finest', requirement: 'Slay all enemy types', kind: 'collection', collectionKey: 'enemy-types' },

  // ─── Meta (derived from other collections) ───────────────
  { id: 'legendary-farmer', steamApiName: 'FARM_10_49', name: 'Legendary Farmer', requirement: 'Ship all items in the Produce, Caught, and Found journal categories', kind: 'collection', collectionKey: 'legendary-farmer' },
  { id: 'this-is-coral-island', steamApiName: 'FARM_10_52', name: 'This Is Coral Island', requirement: 'Reach level 10 mastery in everything', kind: 'collection', collectionKey: 'mastery' },
]
