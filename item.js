'use strict'

const assert = require('assert').ok
const modifiers = require('./modifiers')

function Item(slot, options) {
  this.slot = slot
  this.level = options.itemLevel
  this.quality = options.quality

  if (options.quality === 7) {
    this.level = 187
    this.quality = 3
  }
}

function getter(name, fn) {
  Object.defineProperty(Item.prototype, name, { get: fn })
}

getter('score', function() {
  const score = Math.floor(
    ((this.level - this._qualityMod[0]) / this._qualityMod[1]) *
    this._slotMod *
    1.8291
  )

  assert(!Number.isNaN(score), 'item score should not be NaN')
  return Math.max(score, 0)
})

getter('_qualityMod', function() {
  if (this.level > 277) {
    return [91.45, 0.65]
  } else if (this.level > 120) {
    return modifiers.qualities[this.quality]
  } else {
    return modifiers.qualitiesVanilla[this.quality]
  }
})

getter('_slotMod', function() {
  return modifiers.slot[this.slot]
})

module.exports = Item
