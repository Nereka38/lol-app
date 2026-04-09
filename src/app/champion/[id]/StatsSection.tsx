import { Box, Text, Flex, SimpleGrid } from '@chakra-ui/react';

interface Props {
  stats: Record<string, number>;
}

// Configuración para la Performance Matrix
const PERFORMANCE_STATS = [
  { label: 'Damage', key: 'attackdamage', value: 3, max: 3 },
  { label: 'Toughness', key: 'defense', value: 1, max: 3 },
  { label: 'Control', key: 'control', value: 1, max: 3 },
  { label: 'Mobility', key: 'mobility', value: 3, max: 3 },
  { label: 'Utility', key: 'utility', value: 1, max: 3 },
];

// Mapeo de stats reales
const BASE_STATS_CONFIG = [
  {
    label: 'Health',
    icon: '❤',
    key: 'hp',
    perLevelKey: 'hpperlevel',
    format: (v: number) => Math.round(v),
  },
  {
    label: 'Energy / Mana',
    icon: '◈',
    key: 'mp',
    perLevelKey: 'mpperlevel',
    format: (v: number) => Math.round(v),
  },
  {
    label: 'Armor',
    icon: '🛡',
    key: 'armor',
    perLevelKey: 'armorperlevel',
    format: (v: number) => Math.round(v),
  },
  {
    label: 'Magic Res.',
    icon: '✦',
    key: 'spellblock',
    perLevelKey: 'spellblockperlevel',
    format: (v: number) => Math.round(v),
  },
  {
    label: 'Attack Dmg',
    icon: '⚔',
    key: 'attackdamage',
    perLevelKey: 'attackdamageperlevel',
    format: (v: number) => Math.round(v),
  },
  {
    label: 'Move Speed',
    icon: '↑',
    key: 'movespeed',
    format: (v: number) => Math.round(v),
  },
  {
    label: 'Range',
    icon: '🏹',
    key: 'attackrange',
    format: (v: number) => Math.round(v),
  },
  {
    label: 'HP Regen',
    icon: '✚',
    key: 'hpregen',
    perLevelKey: 'hpregenperlevel',
    format: (v: number) => v.toFixed(1),
  },
];

export function ChampionStats({ stats }: Props) {
  // Calcular valores reales basados en los stats del campeón
  const getStatValue = (key: string) => {
    return stats?.[key] ?? 0;
  };

  // Determinar valores de performance basados en stats reales
  const damage = Math.min(Math.floor((getStatValue('attackdamage') / 70) * 3), 3) || 2;
  const toughness = Math.min(Math.floor(((getStatValue('armor') + getStatValue('spellblock')) / 60) * 3), 3) || 1;
  const mobility = Math.min(Math.floor((getStatValue('movespeed') / 350) * 3), 3) || 2;

  const perfStats = [
    { label: 'Damage', value: damage, max: 3, color: '#e5c587' },
    { label: 'Toughness', value: toughness, max: 3, color: '#8ecefb' },
    { label: 'Control', value: 1, max: 3, color: '#8ecefb' },
    { label: 'Mobility', value: mobility, max: 3, color: '#e5c587' },
    { label: 'Utility', value: 1, max: 3, color: '#8ecefb' },
  ];

  return (
    <Box
      maxW="1200px"
      mx="auto"
      px={6}
    >
      <SimpleGrid columns={{ base: 1, lg: 12 }} gap={8}>
        {/* Performance Matrix */}
        <Box
          gridColumn={{ base: '1', lg: 'span 5' }}
          bg="#111d26"
          p={8}
          position="relative"
          borderLeft="4px solid #8ecefb"
          boxShadow="0 10px 40px rgba(0,0,0,0.5)"
        >
          <Flex align="center" gap={3} mb={8}>
            <Text fontSize="24px" color="#8ecefb">
              📊
            </Text>
            <Text
              fontFamily="Georgia, serif"
              fontSize="24px"
              fontStyle="italic"
              color="#d7e4f1"
            >
              Performance Matrix
            </Text>
          </Flex>

          <Flex direction="column" gap={6}>
            {perfStats.map((stat) => (
              <Box key={stat.label}>
                <Flex justify="space-between" mb={2}>
                  <Text
                    fontSize="11px"
                    fontFamily="'Work Sans', sans-serif"
                    color="#d0c5b5"
                    letterSpacing="0.15em"
                    textTransform="uppercase"
                  >
                    {stat.label}
                  </Text>
                  <Text
                    fontSize="12px"
                    fontWeight="bold"
                    color={stat.value === stat.max ? stat.color : '#d7e4f1'}
                  >
                    {stat.value} / {stat.max}
                  </Text>
                </Flex>
                <Flex h="12px" gap={1}>
                  {Array.from({ length: stat.max }).map((_, i) => (
                    <Box
                      key={i}
                      flex={1}
                      h="100%"
                      bg={i < stat.value ? stat.color : '#15212a'}
                      boxShadow={i < stat.value ? `0 0 10px ${stat.color}40` : 'none'}
                    />
                  ))}
                </Flex>
              </Box>
            ))}
          </Flex>

          {/* Decorative corner */}
          <Box
            position="absolute"
            bottom="0"
            right="0"
            w="16"
            h="16"
            pointerEvents="none"
            opacity={0.2}
          >
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: '#c8aa6e' }}>
              <path d="M100 0 L100 100 L0 100 Z" />
            </svg>
          </Box>
        </Box>

        {/* Detailed Base Stats */}
        <Box
          gridColumn={{ base: '1', lg: 'span 7' }}
          bg="rgba(31,43,53,0.4)"
          backdropFilter="blur(20px)"
          p={8}
          border="1px solid rgba(77,70,58,0.2)"
          position="relative"
          overflow="hidden"
        >
          <Flex align="center" gap={3} mb={8}>
            <Text fontSize="24px" color="#c8aa6e">
              📈
            </Text>
            <Text
              fontFamily="Georgia, serif"
              fontSize="24px"
              fontStyle="italic"
              color="#d7e4f1"
            >
              Base Vitality & Combat
            </Text>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2 }} gapX={12} gapY={6}>
            {BASE_STATS_CONFIG.map((cfg) => {
              const value = getStatValue(cfg.key);
              const perLevel = cfg.perLevelKey ? getStatValue(cfg.perLevelKey) : 0;
              const hasValue = value > 0;

              return (
                <Box
                  key={cfg.key}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  borderBottom="1px solid rgba(77,70,58,0.3)"
                  pb={2}
                >
                  <Flex align="center" gap={3}>
                    <Text fontSize="18px" color="#c8aa6e">
                      {cfg.icon}
                    </Text>
                    <Text
                      fontSize="10px"
                      fontFamily="'Work Sans', sans-serif"
                      color="#d0c5b5"
                      letterSpacing="0.15em"
                      textTransform="uppercase"
                    >
                      {cfg.label}
                    </Text>
                  </Flex>
                  <Text
                    fontSize="14px"
                    fontWeight="bold"
                    color="#d7e4f1"
                    letterSpacing="tight"
                  >
                    {hasValue ? cfg.format(value) : '—'}
                    {perLevel > 0 && (
                      <Text as="span" fontSize="10px" color="#c8aa6e50" ml={1}>
                        +{cfg.format(perLevel)}
                      </Text>
                    )}
                  </Text>
                </Box>
              );
            })}
          </SimpleGrid>

          {/* Info box */}
          <Flex
            mt={8}
            align="flex-start"
            gap={4}
            p={4}
            bg="rgba(229,197,135,0.05)"
            borderLeft="1px solid rgba(229,197,135,0.3)"
          >
            <Text fontSize="16px" color="#d0c5b5">
              ℹ️
            </Text>
            <Text
              fontSize="11px"
              color="#d0c5b5"
              fontStyle="italic"
              lineHeight="1.7"
            >
              Stat values shown are base level (1) followed by growth per level. Actual in-game stats scale non-linearly. Energy regeneration is fixed at 10/s and does not scale with levels.
            </Text>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* Strategy Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} mt={12} mb={24}>
        {[
          {
            title: 'Early Game Strategy',
            desc: 'Relies on high base movement speed to kite enemies. Early health is low, making vulnerable to poke before level 6.',
            color: '#c8aa6e',
          },
          {
            title: 'Mid Game Spike',
            desc: 'Scaling Armor and MR per level allows diving backlines more safely once completing the first core item.',
            color: '#8ecefb',
          },
          {
            title: 'Late Game Scaling',
            desc: 'While toughness stays low compared to bruisers, high mobility stats provide effective durability needed to escape.',
            color: '#c8aa6e',
          },
        ].map((card, index) => (
          <Box
            key={index}
            bg="#1f2b35"
            p={6}
            borderTop="2px solid"
            borderColor={card.color}
          >
            <Text
              fontFamily="Georgia, serif"
              fontSize="18px"
              fontStyle="italic"
              color={card.color}
              mb={4}
            >
              {card.title}
            </Text>
            <Text
              fontSize="13px"
              color="#d0c5b5"
              lineHeight="1.7"
            >
              {card.desc}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
