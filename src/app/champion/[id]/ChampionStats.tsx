import { Box, Text, Flex, Progress, Divider, VStack } from '@chakra-ui/react';

const statLabels: Record<string, string> = {
  hp: 'Health',
  hpperlevel: 'Health per level',
  mp: 'Mana',
  mpperlevel: 'Mana per level',
  movespeed: 'Movement Speed',
  armor: 'Armor',
  armorperlevel: 'Armor per level',
  spellblock: 'Magic Resist',
  spellblockperlevel: 'Magic Resist per level',
  attackrange: 'Attack Range',
  hpregen: 'Health Regeneration',
  hpregenperlevel: 'Health Regen per level',
  mpregen: 'Mana Regeneration',
  mpregenperlevel: 'Mana Regen per level',
  crit: 'Critical Strike',
  critperlevel: 'Critical per level',
  attackdamage: 'Attack Damage',
  attackdamageperlevel: 'Attack Damage per level',
  attackspeed: 'Attack Speed',
  attackspeedperlevel: 'Attack Speed per level',
};

const statIcons: Record<string, string> = {
  hp: '❤️',
  mp: '🔵',
  armor: '🛡️',
  attackdamage: '⚔️',
  spellblock: '✨',
  movespeed: '🏃‍♂️',
  attackspeed: '💨',
  attackrange: '🏹',
  hpregen: '💉',
  mpregen: '🧪',
  crit: '🎯',
};

const maxValues: Record<string, number> = {
  hp: 3000,
  hpperlevel: 200,
  mp: 1500,
  mpperlevel: 200,
  movespeed: 500,
  armor: 150,
  armorperlevel: 10,
  spellblock: 100,
  spellblockperlevel: 5,
  attackrange: 700,
  hpregen: 30,
  hpregenperlevel: 10,
  mpregen: 30,
  mpregenperlevel: 10,
  crit: 100,
  critperlevel: 10,
  attackdamage: 200,
  attackdamageperlevel: 10,
  attackspeed: 2.5,
  attackspeedperlevel: 5,
};

export function ChampionStats({ stats }: { stats: Record<string, number> }) {
  return (
    <VStack align="stretch" spacing={4} p={4} bg="#1a2733" borderRadius="md">
      {Object.entries(stats).map(([key, value]) => {
        const label = statLabels[key] || key;
        const icon = statIcons[key] || '📊';
        const max = maxValues[key] || 100;
        const percentage = Math.min((value / max) * 100, 100);

        return (
          <Box key={key}>
            <Flex justify="space-between" mb={1}>
              <Text fontWeight="bold" color="yellow.400" fontSize="sm" fontFamily="SpiegelSans-5Regular_TRIAL">
                {icon} {label}
              </Text>
              <Text fontSize="sm" color="gray.400">
                {value}
              </Text>
            </Flex>
            <Progress value={percentage} size="sm" colorScheme="yellow" borderRadius="md" />
          </Box>
        );
      })}
      <Divider borderColor="gray.600" />
    </VStack>
  );
}
