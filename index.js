var modifiers = {

  // Slot modifiers
  slot:
  { head: 1
  , neck: 0.5625
  , shoulder: 0.75
  , shirt: 0
  , chest: 1
  , waist: 0.75
  , legs: 1
  , feet: 0.75
  , wrist: 0.5625
  , hands: 0.75
  , finger1: 0.5625
  , finger2: 0.5625
  , trinket1: 0.5625
  , trinket2: 0.5625
  , back: 0.5625
  , mainHand: 2
  , offHand: 1
  , ranged: 0.3164
  , tabard: 0
  }

  // Hunter weapon slot modifiers
, slotHunter:
  { mainHand: 0.3164
  , offHand: 0.3164
  , ranged: 5.3224
  }

  // Quality modifiers
, qualities:
  [ [73, 1, 0.005]
  , [73, 1, 0.005]
  , [73, 1, 1]
  , [81.375, 0.8125, 1]
  , [91.45, 0.65, 1]
  , [91.45, 0.65, 1.3]
  , null
  , [81.375, 0.8125, 1]
  ]

  // Quality modifiers for ilvls below 120
, qualitiesLow:
  [ [8, 2, 0.005]
  , [8, 2, 0.005]
  , [8, 2, 1]
  , [0.75, 1.8, 1]
  ]

  // Convenience method for retrieving quality
, quality: function(ilvl, quality) {
    return ilvl > 120 || quality > 3 ?
      this.qualities[quality] : this.qualitiesLow[quality]
  }
}


module.exports = function(character) {
  var score = 0
    , items = character.items

  delete items.averageItemLevel
  delete items.averageItemLevelEquipped

  for (var slot in items) {
    if (!items.hasOwnProperty(slot)) { continue }

    var item = items[slot]
      , qualityMod = modifiers.quality(item.itemLevel, item.quality)
      , slotMod = modifiers.slot[slot]

    if (slot === 'mainHand' && items.offHand !== undefined) {
      slotMod = 1
    }

    var itemScore = Math.floor(
      ((item.itemLevel - qualityMod[0]) / qualityMod[1]) *
      1.8618 *
      slotMod *
      qualityMod[2]
    )

    if (character.class === 3 && slot in modifiers.slotHunter) {
      itemScore = Math.floor(itemScore * modifiers.slotHunter[slot])
    }

    score += Math.max(itemScore, 0)
  }

  return score
}
