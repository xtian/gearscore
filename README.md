# Gearscore.js

    var armory = require('armory')
      , gs = require('gearscore')

    var opts =
    { region: 'us'
    , realm: 'shadowmoon'
    , id: 'dargonaut'
    , fields: 'items'
    }

    armory.character(opts, function(err, character) {
      var score = gs(character)
    })
