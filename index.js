var modifiers = require('./modifiers')

// Convenience method for retrieving quality
var quality = function(ilvl, quality) {
  if (ilvl > 120 || quality > 3) {
    return modifiers.qualities[quality]
  } else {
    return modifiers.qualitiesLow[quality]
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
      , qualityMod = quality(item.itemLevel, item.quality)
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
