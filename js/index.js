'use strict'

const Item = require('./item')

module.exports = function(character) {
  let score = 0
  const items = character.items

  for (let slot in items) {
    if (!items.hasOwnProperty(slot)) { continue }

    if (slot === 'averageItemLevel' || slot === 'averageItemLevelEquipped') {
      continue
    }

    const options = items[slot]

    if (slot === 'mainHand' && !items.offHand) {
      slot = 'twoHand'
    }

    score += new Item(slot, options).score
  }

  return score
}
