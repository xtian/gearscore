var modifiers = {

    // Slot modifiers
    slot: {
        head: 1,
        neck: 0.5625,
        shoulder: 0.75,
        shirt: 0,
        chest: 1,
        waist: 0.75,
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

    // Rarity modifiers
    rarities: [
        [73, 1, 0.005],
        [73, 1, 0.005],
        [73, 1, 1],
        [81.375, 0.8125, 1],
        [91.45, 0.65, 1],
        [91.45, 0.65, 1.3],
        null,
        [81.375, 0.8125, 1]
    ],

    // Rarity modifiers for ilvls below 120
    raritiesLow: [
        [8, 2, 0.005],
        [8, 2, 0.005],
        [8, 2, 1],
        [0.75, 1.8, 1]
    ],

    // Convenience method for retrieving rarity
    rarity: function(ilvl, rarity) {
        return ilvl > 120 || rarity > 3 ?
            this.rarities[rarity] : this.raritiesLow[rarity];
    }
};


module.exports = function(character, fullItems) {

    return character.items.reduce(function(prev, curr, index) {

        var ilvl = fullItems[index].itemLevel,
            rarityMod = modifiers.rarity(ilvl, curr.quality),
            slotMod = modifiers.slot[curr.slot];


        if (curr.slot === 'mainHand' &&
            character.items[index + 1].slot === 'offHand') {

            slotMod = 1;
        }

        var score = Math.floor(
            ((ilvl - rarityMod[0]) / rarityMod[1]) *
            1.8618 *
            slotMod *
            rarityMod[2]
        );

        // Hunter check
        if (character.class === 3 && curr.slot in modifiers.slotHunter) {
            score = Math.floor(score * modifiers.slotHunter[curr.slot]);
        }

        return prev + Math.max(score, 0);
    }, 0);
};
