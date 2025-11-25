/**
 * Combat Stats Section Component
 * HP, MP, Movement, and combat-related statistics
 */

import { Button, Card, Flex, Grid, Input, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { useCharacterStore } from '@/stores/character.store';

export const CombatStatsSection = () => {
  const {
    character,
    updateHP,
    updateMP,
    updateMovementRange,
    updateAbilityBonus,
    updateAttackPower,
    updateSpellPower,
    updateRange,
  } = useCharacterStore();

  const handleNumberInput = (
    value: string,
    updater: (val: number) => void,
    min?: number
  ) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && (min === undefined || numValue >= min)) {
      updater(numValue);
    }
  };

  return (
    <Card.Root>
      <Card.Header>
        <Flex align="center" gap={2}>
          <Text fontSize="lg" fontWeight="semibold">⚔️ Combat Stats</Text>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Grid gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
          {/* HP */}
          <Flex direction="column" gap={2}>
            <Tooltip content={<Text fontSize="sm">Hit Points - Character's health</Text>}>
              <Button variant="outline" disabled width="full" h={8} fontSize="sm" fontWeight="medium">
                ❤️ HP
              </Button>
            </Tooltip>
            <Input
              id="hp"
              type="number"
              value={character.hp}
              onChange={(e) => handleNumberInput(e.target.value, updateHP)}
              h={12}
              textAlign="center"
              fontSize="xl"
              fontWeight="semibold"
            />
          </Flex>

          {/* MP */}
          <Flex direction="column" gap={2}>
            <Tooltip content={<Text fontSize="sm">Mana Points - Resource for spells and abilities</Text>}>
              <Button variant="outline" disabled width="full" h={8} fontSize="sm" fontWeight="medium">
                ✨ MP
              </Button>
            </Tooltip>
            <Input
              id="mp"
              type="number"
              min={0}
              value={character.mp}
              onChange={(e) => handleNumberInput(e.target.value, updateMP, 0)}
              h={12}
              textAlign="center"
              fontSize="xl"
              fontWeight="semibold"
            />
          </Flex>

          {/* Movement Range */}
          <Flex direction="column" gap={2}>
            <Tooltip content={<Text fontSize="sm">Movement range per turn</Text>}>
              <Button variant="outline" disabled width="full" h={8} fontSize="sm" fontWeight="medium">
                🏃 Move
              </Button>
            </Tooltip>
            <Input
              id="movement"
              type="number"
              min={0.1}
              step={0.5}
              value={character.movementRange}
              onChange={(e) => handleNumberInput(e.target.value, updateMovementRange, 0.1)}
              h={12}
              textAlign="center"
              fontSize="xl"
              fontWeight="semibold"
            />
          </Flex>

          {/* Ability Bonus */}
          <Flex direction="column" gap={2}>
            <Tooltip content={<Text fontSize="sm">Bonus to ability checks and saves</Text>}>
              <Button variant="outline" disabled width="full" h={8} fontSize="sm" fontWeight="medium">
                🎯 Ability
              </Button>
            </Tooltip>
            <Input
              id="ability-bonus"
              type="number"
              value={character.abilityBonus}
              onChange={(e) => handleNumberInput(e.target.value, updateAbilityBonus)}
              h={12}
              textAlign="center"
              fontSize="xl"
              fontWeight="semibold"
            />
          </Flex>

          {/* Attack Power */}
          <Flex direction="column" gap={2}>
            <Tooltip content={<Text fontSize="sm">Physical attack damage bonus</Text>}>
              <Button variant="outline" disabled width="full" h={8} fontSize="sm" fontWeight="medium">
                ⚡ Attack
              </Button>
            </Tooltip>
            <Input
              id="attack-power"
              type="number"
              value={character.attackPower}
              onChange={(e) => handleNumberInput(e.target.value, updateAttackPower)}
              h={12}
              textAlign="center"
              fontSize="xl"
              fontWeight="semibold"
            />
          </Flex>

          {/* Spell Power */}
          <Flex direction="column" gap={2}>
            <Tooltip content={<Text fontSize="sm">Spell damage and healing bonus</Text>}>
              <Button variant="outline" disabled width="full" h={8} fontSize="sm" fontWeight="medium">
                🔮 Spell
              </Button>
            </Tooltip>
            <Input
              id="spell-power"
              type="number"
              value={character.spellPower}
              onChange={(e) => handleNumberInput(e.target.value, updateSpellPower)}
              h={12}
              textAlign="center"
              fontSize="xl"
              fontWeight="semibold"
            />
          </Flex>

          {/* Range */}
          <Flex direction="column" gap={2}>
            <Tooltip content={<Text fontSize="sm">Attack and spell range distance</Text>}>
              <Button variant="outline" disabled width="full" h={8} fontSize="sm" fontWeight="medium">
                🎯 Range
              </Button>
            </Tooltip>
            <Input
              id="range"
              type="number"
              min={1}
              value={character.range}
              onChange={(e) => handleNumberInput(e.target.value, updateRange, 1)}
              h={12}
              textAlign="center"
              fontSize="xl"
              fontWeight="semibold"
            />
          </Flex>
        </Grid>
      </Card.Body>
    </Card.Root>
  );
};
