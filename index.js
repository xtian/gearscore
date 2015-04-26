var Item = require('./item')

module.exports = function(character) {
  var score = 0
    , items = character.items

  for (var slot in items) {
    if (!items.hasOwnProperty(slot)) { continue }

    if (slot === 'averageItemLevel' || slot === 'averageItemLevelEquipped') {
      continue
    }

    var options = items[slot]

    if (slot === 'mainHand' && !items.offHand) {
      slot = 'twoHand'
    }

    score += new Item(slot, options).score
  }

  return score
}
