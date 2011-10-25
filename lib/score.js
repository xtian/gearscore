

// 0: any, 1: tank, 2: physical dps, 5: caster dps, 6: caster, 20: pvp
var specRoles = [
    null,

    // Warrior
    { 'Arms': 2, 'Fury': 2, 'Protection': 1, none: 2 },

    // Paladin
    { 'Holy': 6, 'Protection': 1, 'Retribution': 2, none: 0 },

    // Hunter
    { 'Beast Mastery': 2, 'Marksmanship': 2, 'Survival': 2, none: 2 },

    // Rogue
    { 'Assassination': 2, 'Combat': 2, 'Subtlety': 2, none: 2 },

    // Priest
    { 'Discipline': 6, 'Holy': 6, 'Shadow': 5, none: 6 },

    // Death Knight
    { 'Blood': 1, 'Frost': 2, 'Unholy': 2, none: 2 },

    // Shaman
    { 'Elemental': 5, 'Enhancement': 2, 'Restoration': 6, none: 0 },

    // Mage
    { 'Arcane': 5, 'Fire': 5, 'Frost': 5, none: 5 },

    // Warlock
    { 'Affliction': 5, 'Demonology': 5, 'Destruction': 5, none: 5 },

    null,

    // Druid
    { 'Balance': 5, 'Feral': 1, 'Restoration': 6, none: 0 }
];


var modifiers = {
    
    // Slot modifiers
    slot: {
        head: 1,
        neck: 0.5625,
        shoulder: 0.75,
        shirt: 0,
        chest: 1,
        waist: 0.5625,
        legs: 1,
        feet: 0.75,
        wrist: 0.5625,
        hands: 0.75,
        finger1: 0.5625,
        finger2: 0.5625,
        trinket1: 0.5625,
        trinket2: 0.5625,
        back: 0.5625,
        mainHand: 2,
        offHand: 1,
        ranged: 0.3164,
        tabard: 0
    },
    
    // Hunter weapon slot modifiers
    slotHunter: {
        mainHand: 0.3164,
        offHand: 0.3164,
        ranged: 5.3224
    },


    role: function(fullItem, role) {
        if (!role) {
            return 1;
        }
        
        var stats = fullItem.bonusStats.reduce(function(obj, curr) {
            obj[curr.stat] = curr.amount;
            return obj;
        }, {});
        
        // Resillience
        if (stats[35]) {
            fullItem = 20;
        
        // Agility or Strength
        } else if (stats[3] || stats[4]) {
            
            // Dodge or Parry
            fullItem = stats[13] || stats[14] ? 1 : 2;
        
        // Intellect or Spirit
        } else if (stats[5] || stats[6]) {
            
            // Hit Rating
            fullItem = stats[31] ? 5 : 6;
            
        } else {
            fullItem = 0;
        }


        var diff = role - fullItem;

        if (!fullItem || !diff || diff === -1) {
            return 1;
            
        } else if (diff === 1 || Math.abs(diff) > 6) {
            return 0.75;
            
        } else if (Math.abs(diff) >= 2 && Math.abs(diff) <= 6) {
            return 0.5;
            
        } else {
            return 0;
        }
    },
    
    
    // Determines if a weapon is a two-hander
    weapon: function(slot, subClass) {
        
        if (slot !== 'mainHand' && slot !== 'offHand') {
            return 0;
        }
        
        switch (subClass) {
            case 1:
            case 5:
            case 6:
            case 8:
            case 10:
            case 20:
                return 2;
            default:
                return 1;
        }      
    },
    

    vanilla: [
        [8, 2],
        [8, 2],
        [0.75, 1.8],
        [26, 1.2],
        [26, 0.923],
        [26, 0.923],
        [81.375, 0.8125]
    ],

    bcwrath: [
        [73, 1],
        [73, 1],
        [81.375, 0.8125],
        [91.45, 0.65],
        [91.45, 0.5],
        [91.45, 0.5],
        [81.375, 0.8125]
    ],

    cataclysm: [91.45, 0.65],
    
    rarity: function(ilvl, rarity) {
        if (ilvl > 277) {
            return this.cataclysm;
            
        } else if (ilvl > 120) {
            return this.bcwrath[rarity];
            
        } else {
            return this.vanilla[rarity];
        }
    },
    
    
    enchant: function(item, subClass) {
            var isEnchanted = !!item.tooltipParams.enchant;
            
            if (item.slot === 'waist') {
                
            }
            
            return isEnchanted ? 1.03 : 1
        }
    }
};



exports.gearscore = function(character) {

    var items = character.items,

        gearscore = 0,
        weaponScore = 0,
        weaponValue = 0,

        spec = character.spec || character.talents.reduce(function(prev, curr) {
            return curr.selected ? curr.name : prev;
        }, 'none'),

        role = specRoles[character['class']][spec];

    // Remove tabard & shirt
    delete items.tabard;
    delete items.shirt;

    var itemScore = function(key, item) {

        // Heirlooms count as Wrath blues
        if (item.rarity === 7) {
            item.rarity = 3;
            item.ilvl = 187;
        }

        var rarityMod = modifier.rarity(item.ilvl, item.rarity),
            roleMod = modifier.role(item, role),
            weaponMod = modifier.weapon(key),
            slotMod = modifier.slot(key);

        item = Math.max(Math.floor(
            ((item.ilvl - rarityMod[0]) / rarityMod[1]) *
            roleMod *
            slotMod *
            1.8291
        ), 0);

        // Hunter weapon modifiers
        if (character['class'] === 3) {
            if (key === 'mainHand' || key === 'offHand') {
                item = Math.floor(item * 0.3164);
            } else if (key === 'ranged') {
                item = Math.floor(item * 5.3224);
            }
        }

        // Enchant bonus
        if (enchantable(key) && item.enchant) {
            item *= 1.03;
        }

        // Missing gems penalty & belt buckle bonus
        var emptySockets = 0;

        for (var gem in item.gems) {
            if (item.gems.hasOwnProperty(gem)) {
                if (key === 'waist' &&
                    gem.indexOf('-14') !== -1 &&
                    items.gems[gem]) {

                    item *= 1.03;
                    
                } else {
                    emptySockets += item.gems[gem] ? 0 : 1;
                }
            }
        }

        item = Math.floor(item * (1 - (0.02 * emptySockets)));

        if (weaponMod) {
            weaponValue += weaponMod;
            weaponScore += item;
        }

        return item;
    };

    for (var key in items) {
        if (items.hasOwnProperty(key)) {
            gearscore += itemScore(key, items[key]);
        }
    }

    if (weaponValue > 2) {
        gearscore -= Math.floor(weaponScore - (2 * weaponScore / weaponValue));
    }

    return gearscore;
};
