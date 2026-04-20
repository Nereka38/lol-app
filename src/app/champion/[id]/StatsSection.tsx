'use client';

import { Box, Text, Flex, SimpleGrid, VStack, HStack, Tooltip } from '@chakra-ui/react';
import { useState } from 'react';
import { ChampionStats } from '../../types/champions';
import { calculateStatAtLevel } from '../../lib/api';

interface Props {
  stats: ChampionStats;
}

// Configuración de estadísticas base con iconos y colores
const STAT_CONFIGS = {
  // Vida y Regeneración
  hp: {
    label: 'Health',
    icon: '❤️',
    color: '#ff6b6b',
    description: 'Vida base del campeón',
  },
  hpperlevel: {
    label: 'Health per Level',
    icon: '💗',
    color: '#ff6b6b',
    description: 'Vida ganada por nivel',
  },
  hpregen: {
    label: 'Health Regen',
    icon: '💚',
    color: '#4ade80',
    description: 'Regeneración de vida cada 5 segundos',
  },
  hpregenperlevel: {
    label: 'HP Regen per Level',
    icon: '🌱',
    color: '#4ade80',
    description: 'Regeneración de vida ganada por nivel',
  },

  // Mana/Energía
  mp: {
    label: 'Mana/Energy',
    icon: '💙',
    color: '#60a5fa',
    description: 'Mana o Energía base',
  },
  mpperlevel: {
    label: 'Mana per Level',
    icon: '💧',
    color: '#60a5fa',
    description: 'Mana ganado por nivel',
  },
  mpregen: {
    label: 'Mana Regen',
    icon: '💎',
    color: '#3b82f6',
    description: 'Regeneración de mana cada 5 segundos',
  },
  mpregenperlevel: {
    label: 'MP Regen per Level',
    icon: '✨',
    color: '#3b82f6',
    description: 'Regeneración de mana ganada por nivel',
  },

  // Armadura y Resistencia
  armor: {
    label: 'Armor',
    icon: '🛡️',
    color: '#a3a3a3',
    description: 'Reducción de daño físico',
  },
  armorperlevel: {
    label: 'Armor per Level',
    icon: '🛡️',
    color: '#a3a3a3',
    description: 'Armadura ganada por nivel',
  },
  spellblock: {
    label: 'Magic Resist',
    icon: '🔮',
    color: '#c084fc',
    description: 'Reducción de daño mágico',
  },
  spellblockperlevel: {
    label: 'MR per Level',
    icon: '🧿',
    color: '#c084fc',
    description: 'Resistencia mágica ganada por nivel',
  },

  // Daño y Ataque
  attackdamage: {
    label: 'Attack Damage',
    icon: '⚔️',
    color: '#fbbf24',
    description: 'Daño de ataque base',
  },
  attackdamageperlevel: {
    label: 'AD per Level',
    icon: '🗡️',
    color: '#fbbf24',
    description: 'Daño de ataque ganado por nivel',
  },
  attackspeed: {
    label: 'Attack Speed',
    icon: '⚡',
    color: '#f59e0b',
    description: 'Ataques por segundo',
  },
  attackspeedperlevel: {
    label: 'AS per Level',
    icon: '🌪️',
    color: '#f59e0b',
    description: 'Porcentaje de velocidad de ataque ganado por nivel',
  },

  // Otros
  movespeed: {
    label: 'Move Speed',
    icon: '👢',
    color: '#2dd4bf',
    description: 'Velocidad de movimiento base',
  },
  attackrange: {
    label: 'Attack Range',
    icon: '🏹',
    color: '#fb7185',
    description: 'Rango de ataque básico',
  },
  crit: {
    label: 'Crit Chance',
    icon: '💥',
    color: '#ef4444',
    description: 'Probabilidad de golpe crítico base',
  },
  critperlevel: {
    label: 'Crit per Level',
    icon: '🎯',
    color: '#ef4444',
    description: 'Crítico ganado por nivel',
  },
};

type StatCategory = 'vitality' | 'offense' | 'defense' | 'utility';

interface StatGroupConfig {
  key: StatCategory;
  label: string;
  color: string;
  stats: (keyof ChampionStats)[];
}

const STAT_GROUPS: StatGroupConfig[] = [
  {
    key: 'vitality',
    label: 'Vitalidad',
    color: '#ff6b6b',
    stats: ['hp', 'hpperlevel', 'hpregen', 'hpregenperlevel', 'mp', 'mpperlevel', 'mpregen', 'mpregenperlevel'],
  },
  {
    key: 'offense',
    label: 'Ofensiva',
    color: '#fbbf24',
    stats: ['attackdamage', 'attackdamageperlevel', 'attackspeed', 'attackspeedperlevel', 'attackrange', 'crit', 'critperlevel'],
  },
  {
    key: 'defense',
    label: 'Defensiva',
    color: '#60a5fa',
    stats: ['armor', 'armorperlevel', 'spellblock', 'spellblockperlevel'],
  },
  {
    key: 'utility',
    label: 'Utilidad',
    color: '#2dd4bf',
    stats: ['movespeed'],
  },
];

function formatStatValue(key: keyof ChampionStats, value: number): string {
  if (key === 'attackspeed') {
    return value.toFixed(3);
  }
  if (key.includes('perlevel')) {
    return `+${value}`;
  }
  if (key === 'attackrange' || key === 'movespeed') {
    return Math.round(value).toString();
  }
  if (key === 'crit' || key === 'critperlevel') {
    return `${value}%`;
  }
  return Math.round(value).toString();
}

function StatCard({
  statKey,
  value,
  isPerLevel = false,
}: {
  statKey: keyof ChampionStats;
  value: number;
  isPerLevel?: boolean;
}) {
  const config = STAT_CONFIGS[statKey];
  if (!config || value === undefined || value === null) return null;

  const formattedValue = formatStatValue(statKey, value);
  const isZero = value === 0;

  return (
    <Tooltip label={config.description} placement="top" hasArrow>
      <Box
        bg="#111d26"
        p={4}
        borderRadius="8px"
        border="1px solid rgba(77, 70, 58, 0.3)"
        transition="all 0.2s"
        _hover={{
          borderColor: config.color,
          boxShadow: `0 0 15px ${config.color}20`,
        }}
        opacity={isZero ? 0.5 : 1}
      >
        <Flex align="center" gap={3} mb={2}>
          <Text fontSize="20px">{config.icon}</Text>
          <Text
            fontSize="11px"
            fontFamily="'Work Sans', sans-serif"
            color="#d0c5b5"
            letterSpacing="0.1em"
            textTransform="uppercase"
          >
            {config.label}
          </Text>
        </Flex>
        <Flex align="baseline" gap={1}>
          <Text
            fontSize="24px"
            fontWeight="bold"
            color={isPerLevel ? config.color : '#d7e4f1'}
            letterSpacing="tight"
          >
            {formattedValue}
          </Text>
          {isPerLevel && (
            <Text fontSize="11px" color="#d0c5b550">
              /lvl
            </Text>
          )}
        </Flex>
      </Box>
    </Tooltip>
  );
}

function StatProgressBar({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <Box width="100%">
      <Flex justify="space-between" mb={1}>
        <Text
          fontSize="10px"
          fontFamily="'Work Sans', sans-serif"
          color="#d0c5b5"
          letterSpacing="0.15em"
          textTransform="uppercase"
        >
          {label}
        </Text>
        <Text fontSize="11px" color="#d7e4f1" fontWeight="medium">
          {value.toFixed(1)}
        </Text>
      </Flex>
      <Box height="8px" bg="#15212a" borderRadius="4px" overflow="hidden">
        <Box
          height="100%"
          width={`${percentage}%`}
          bg={color}
          transition="width 0.5s ease-out"
        />
      </Box>
    </Box>
  );
}

export function StatsSection({ stats }: Props) {
  const [selectedLevel, setSelectedLevel] = useState(1);

  if (!stats) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="#d0c5b5">No hay estadísticas disponibles para este campeón.</Text>
      </Box>
    );
  }

  // Calcular estadísticas al nivel seleccionado
  const getStatAtLevel = (baseKey: keyof ChampionStats, perLevelKey: keyof ChampionStats) => {
    const baseValue = stats[baseKey] || 0;
    const perLevelValue = stats[perLevelKey] || 0;
    return calculateStatAtLevel(baseValue, perLevelValue, selectedLevel);
  };

  // Métricas derivadas para el performance matrix
  const healthAtLevel = getStatAtLevel('hp', 'hpperlevel');
  const damageAtLevel = getStatAtLevel('attackdamage', 'attackdamageperlevel');
  const armorAtLevel = getStatAtLevel('armor', 'armorperlevel');
  const mrAtLevel = getStatAtLevel('spellblock', 'spellblockperlevel');

  // Normalizar valores para el performance matrix (0-100)
  const performanceMetrics = {
    damage: Math.min((damageAtLevel / 150) * 100, 100),
    toughness: Math.min(((armorAtLevel + mrAtLevel) / 150) * 100, 100),
    mobility: Math.min(((stats.movespeed - 300) / 150) * 100, 100),
    health: Math.min((healthAtLevel / 2500) * 100, 100),
  };

  return (
    <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }}>
      {/* Selector de Nivel */}
      <Box
        bg="rgba(17, 29, 38, 0.8)"
        p={6}
        mb={8}
        borderLeft="4px solid #c8aa6e"
      >
        <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
          <Flex align="center" gap={3}>
            <Text fontSize="24px">📊</Text>
            <Text
              fontFamily="Georgia, serif"
              fontSize="20px"
              fontStyle="italic"
              color="#d7e4f1"
            >
              Estadísticas por Nivel
            </Text>
          </Flex>
          <HStack gap={2}>
            <Text fontSize="12px" color="#d0c5b5">Nivel:</Text>
            {[1, 6, 11, 16, 18].map((level) => (
              <Box
                key={level}
                as="button"
                px={3}
                py={1}
                bg={selectedLevel === level ? '#c8aa6e' : '#1f2b35'}
                color={selectedLevel === level ? '#111d26' : '#d0c5b5'}
                fontSize="13px"
                fontWeight={selectedLevel === level ? 'bold' : 'normal'}
                borderRadius="4px"
                onClick={() => setSelectedLevel(level)}
                _hover={{ bg: selectedLevel === level ? '#c8aa6e' : '#2a3a4a' }}
                transition="all 0.2s"
              >
                {level}
              </Box>
            ))}
          </HStack>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 12 }} gap={8}>
        {/* Performance Matrix */}
        <Box
          gridColumn={{ base: '1', lg: 'span 4' }}
          bg="#111d26"
          p={6}
          borderLeft="4px solid #8ecefb"
          boxShadow="0 10px 40px rgba(0,0,0,0.5)"
        >
          <Text
            fontFamily="Georgia, serif"
            fontSize="20px"
            fontStyle="italic"
            color="#d7e4f1"
            mb={6}
          >
            Performance Matrix
          </Text>

          <VStack gap={5} align="stretch">
            <StatProgressBar
              label="Daño"
              value={performanceMetrics.damage}
              maxValue={100}
              color="#fbbf24"
            />
            <StatProgressBar
              label="Resistencia"
              value={performanceMetrics.toughness}
              maxValue={100}
              color="#60a5fa"
            />
            <StatProgressBar
              label="Movilidad"
              value={performanceMetrics.mobility}
              maxValue={100}
              color="#2dd4bf"
            />
            <StatProgressBar
              label="Vida"
              value={performanceMetrics.health}
              maxValue={100}
              color="#ff6b6b"
            />
          </VStack>

          {/* Valores calculados */}
          <Box mt={6} pt={6} borderTop="1px solid rgba(77, 70, 58, 0.3)">
            <Text
              fontSize="11px"
              color="#d0c5b580"
              letterSpacing="0.1em"
              textTransform="uppercase"
              mb={3}
            >
              Estadísticas al Nivel {selectedLevel}
            </Text>
            <SimpleGrid columns={2} gap={3}>
              <Box bg="#15212a" p={3} borderRadius="4px">
                <Text fontSize="10px" color="#d0c5b5">HP</Text>
                <Text fontSize="16px" color="#ff6b6b" fontWeight="bold">
                  {Math.round(healthAtLevel)}
                </Text>
              </Box>
              <Box bg="#15212a" p={3} borderRadius="4px">
                <Text fontSize="10px" color="#d0c5b5">AD</Text>
                <Text fontSize="16px" color="#fbbf24" fontWeight="bold">
                  {Math.round(damageAtLevel)}
                </Text>
              </Box>
              <Box bg="#15212a" p={3} borderRadius="4px">
                <Text fontSize="10px" color="#d0c5b5">Armor</Text>
                <Text fontSize="16px" color="#60a5fa" fontWeight="bold">
                  {Math.round(armorAtLevel)}
                </Text>
              </Box>
              <Box bg="#15212a" p={3} borderRadius="4px">
                <Text fontSize="10px" color="#d0c5b5">MR</Text>
                <Text fontSize="16px" color="#c084fc" fontWeight="bold">
                  {Math.round(mrAtLevel)}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        </Box>

        {/* Estadísticas Detalladas */}
        <Box
          gridColumn={{ base: '1', lg: 'span 8' }}
          bg="rgba(31, 43, 53, 0.4)"
          backdropFilter="blur(20px)"
          p={6}
          border="1px solid rgba(77, 70, 58, 0.2)"
        >
          <Text
            fontFamily="Georgia, serif"
            fontSize="20px"
            fontStyle="italic"
            color="#d7e4f1"
            mb={6}
          >
            Estadísticas Base
          </Text>

          <VStack gap={8} align="stretch">
            {STAT_GROUPS.map((group) => {
              const groupStats = group.stats.filter((key) => stats[key] !== undefined && stats[key] !== 0);

              if (groupStats.length === 0) return null;

              return (
                <Box key={group.key}>
                  <Flex align="center" gap={2} mb={4}>
                    <Box width="3px" height="20px" bg={group.color} borderRadius="2px" />
                    <Text
                      fontSize="12px"
                      fontFamily="'Work Sans', sans-serif"
                      color={group.color}
                      letterSpacing="0.15em"
                      textTransform="uppercase"
                      fontWeight="bold"
                    >
                      {group.label}
                    </Text>
                  </Flex>

                  <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={4}>
                    {groupStats.map((statKey) => {
                      const isPerLevel = statKey.toString().includes('perlevel');
                      return (
                        <StatCard
                          key={statKey}
                          statKey={statKey}
                          value={stats[statKey]}
                          isPerLevel={isPerLevel}
                        />
                      );
                    })}
                  </SimpleGrid>
                </Box>
              );
            })}
          </VStack>

          {/* Nota informativa */}
          <Flex
            mt={8}
            align="flex-start"
            gap={4}
            p={4}
            bg="rgba(229, 197, 135, 0.05)"
            borderLeft="3px solid #c8aa6e"
          >
            <Text fontSize="16px">ℹ️</Text>
            <Box>
              <Text
                fontSize="11px"
                color="#d0c5b5"
                lineHeight="1.7"
              >
                Los valores mostrados son las estadísticas base del campeón. Los valores &quot;+X/lvl&quot;
                indican cuánto crece esa estadística por cada nivel. La energía no escala con niveles
                y su regeneración es fija.
              </Text>
            </Box>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* Comparación de niveles */}
      <Box
        mt={8}
        bg="#111d26"
        p={6}
        border="1px solid rgba(77, 70, 58, 0.3)"
      >
        <Text
          fontFamily="Georgia, serif"
          fontSize="18px"
          fontStyle="italic"
          color="#d7e4f1"
          mb={4}
        >
          Comparación de Crecimiento
        </Text>

        <SimpleGrid columns={{ base: 2, md: 4 }} gap={6}>
          {[
            { label: 'Vida', baseKey: 'hp' as const, perLevelKey: 'hpperlevel' as const, color: '#ff6b6b' },
            { label: 'Daño', baseKey: 'attackdamage' as const, perLevelKey: 'attackdamageperlevel' as const, color: '#fbbf24' },
            { label: 'Armadura', baseKey: 'armor' as const, perLevelKey: 'armorperlevel' as const, color: '#60a5fa' },
            { label: 'Res. Mágica', baseKey: 'spellblock' as const, perLevelKey: 'spellblockperlevel' as const, color: '#c084fc' },
          ].map((stat) => {
            const baseValue = stats[stat.baseKey] || 0;
            const perLevelValue = stats[stat.perLevelKey] || 0;
            const level18Value = baseValue + perLevelValue * 17;

            return (
              <Box key={stat.label}>
                <Text fontSize="12px" color="#d0c5b5" mb={2}>{stat.label}</Text>
                <Flex align="baseline" gap={2}>
                  <Text fontSize="20px" fontWeight="bold" color={stat.color}>
                    {Math.round(baseValue)}
                  </Text>
                  <Text fontSize="12px" color="#d0c5b560">→</Text>
                  <Text fontSize="20px" fontWeight="bold" color={stat.color}>
                    {Math.round(level18Value)}
                  </Text>
                </Flex>
                <Text fontSize="10px" color="#d0c5b580">
                  (+{perLevelValue}/nivel)
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
