# Data Structures

## Character

```
{
    characterInfo: {
        name: string        // character name
        playerName: string  // player's name
        species: string     // character species
        experiences: []     // list of experiences
    }
    totalLevel: number      // automated stat computed from level entries
    levels: []              // list of character's class level entries
    attributes: {           // record of character's attribute values
        STR: number
        DEX: number
        CON: number
        INT: mumber
        PER: number
    }
    movementRange: number   // movement speed in feet (TODO - Change to number of tiles)
    equipment: []           // list of equipment items
    consumables: []         // list of consumables items
}
```

## Class

```
{
    name: string            // name of the class
    desc: string            // description of the class
    type: string            // "martial" or "caster"
    hp: number              // amount of HP per level for the class
    features: []            // list of features in the base class
    items: []               // List of equipment unlocked as part of the class
    subclasses: {           // list of Subclass objects
        name: string
        desc: string
        items: []
        features: []
    }[]
}
```

### Class Features

```
{
    name: string            // name of the feature
    level: number           // level at which the feature is unlocked
    desc: string            // feature description
    cost: string            // string detailing what kind of resource costs the feature has, e.g. passive, 1AP, etc.
    damage: string          // OPTIONAL - string containing damage formula, e.g. "1d6 + @Str"
    counter: object         // OPTIONAL - contains a Counter object if the feature requires one
}
```

### Counter

```
{
    name: string            // name of the counter
    min: number             // minimum value
    max: number             // maximum value
    effects: [{             // array of specific bonuses per counter level
        desc:               // description, if any
        
    }] 
}
```


## Items

### Equipment

```
{
    name: string            // name of the item
    desc: string            // description of the item
    type: string            // type of item, e.g. "weapon", "armor"
    active: boolean         // toggle for whether the effects of the item are active or not
    handling: string        // Attribute used for weapon Attack Rolls
    range: number           // range, in tiles
    damage: string          // OPTIONAL - damage of the item, e.g. "5/3/3"
    av: number              // OPTIONAL - amount increase to Armor Value
    hp: number              // OPTIONAL - amount increase to HP
    traits: []              // list of Traits
}
```

### Consumables

```
{
    name: string            // name of the item
    desc: string            // description of the item
    active: boolean         // toggle for whether the effects of the item are active or not
    quantity: number        // number of this consumable character has
    range: number           // range, in tiles
    damage: string          // OPTIONAL - damage of the item, e.g. "5/3/3"
    av: number              // amount increase to Armor Value
    hp: number              // amount increase to HP
    traits: []              // list of Traits
}
```

### Trait

```
{
    name: string            // name of the trait
    desc: string            // description of the trait's effect
    value: number           // OPTIONAL - value of the trait, e.g. "Threatening 1" has a value of 1
}
```