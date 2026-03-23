import { Box, Text, Flex } from '@chakra-ui/react';

const STAT_CONFIG: Record<string, { label: string; icon: string; max: number; color: string }> = {
  hp:                  { label: 'Vida',                    icon: '❤', max: 3000, color: '#e84057' },
  hpperlevel:          { label: 'Vida por nivel',           icon: '❤', max: 200,  color: '#e84057' },
  mp:                  { label: 'Maná',                    icon: '◈',  max: 1500, color: '#4e9af1' },
  mpperlevel:          { label: 'Maná por nivel',           icon: '◈',  max: 200,  color: '#4e9af1' },
  movespeed:           { label: 'Velocidad',                icon: '↑',  max: 500,  color: '#22c55e' },
  armor:               { label: 'Armadura',                 icon: '🛡', max: 150,  color: '#c8aa6e' },
  armorperlevel:       { label: 'Armadura por nivel',       icon: '🛡', max: 10,   color: '#c8aa6e' },
  spellblock:          { label: 'Resistencia Mágica',       icon: '✦',  max: 100,  color: '#a855f7' },
  spellblockperlevel:  { label: 'RM por nivel',             icon: '✦',  max: 5,    color: '#a855f7' },
  attackrange:         { label: 'Rango de Ataque',          icon: '🏹', max: 700,  color: '#06b6d4' },
  hpregen:             { label: 'Regen de Vida',            icon: '✚',  max: 30,   color: '#e84057' },
  hpregenperlevel:     { label: 'Regen Vida por nivel',     icon: '✚',  max: 10,   color: '#e84057' },
  mpregen:             { label: 'Regen de Maná',            icon: '◆',  max: 30,   color: '#4e9af1' },
  mpregenperlevel:     { label: 'Regen Maná por nivel',     icon: '◆',  max: 10,   color: '#4e9af1' },
  crit:                { label: 'Golpe Crítico',            icon: '⚡', max: 100,  color: '#f59e0b' },
  critperlevel:        { label: 'Crítico por nivel',        icon: '⚡', max: 10,   color: '#f59e0b' },
  attackdamage:        { label: 'Daño de Ataque',           icon: '⚔', max: 200,  color: '#e8a030' },
  attackdamageperlevel:{ label: 'AD por nivel',             icon: '⚔', max: 10,   color: '#e8a030' },
  attackspeed:         { label: 'Velocidad de Ataque',      icon: '≫',  max: 2.5,  color: '#22c55e' },
  attackspeedperlevel: { label: 'Vel. Ataque por nivel',    icon: '≫',  max: 5,    color: '#22c55e' },
};

// Orden preferido para mostrar
const STAT_ORDER = [
  'hp', 'mp', 'attackdamage', 'armor', 'spellblock', 'movespeed',
  'attackrange', 'attackspeed', 'hpregen', 'mpregen', 'crit',
  'hpperlevel', 'mpperlevel', 'armorperlevel', 'spellblockperlevel',
  'attackdamageperlevel', 'attackspeedperlevel', 'hpregenperlevel',
  'mpregenperlevel', 'critperlevel',
];

export function ChampionStats({ stats }: { stats: Record<string, number> }) {
  const orderedStats = STAT_ORDER.filter((k) => k in stats && stats[k] > 0);

  // Separar en primarias y secundarias (por nivel)
  const primary   = orderedStats.filter((k) => !k.includes('perlevel'));
  const perLevel  = orderedStats.filter((k) =>  k.includes('perlevel'));

  return (
    <Box>
      <StatGroup title="Base" stats={primary}   allStats={stats} />
      {perLevel.length > 0 && (
        <StatGroup title="Por nivel" stats={perLevel} allStats={stats} mt={6} />
      )}
    </Box>
  );
}

function StatGroup({
  title, stats, allStats, mt = 0,
}: {
  title: string;
  stats: string[];
  allStats: Record<string, number>;
  mt?: number;
}) {
  return (
    <Box mt={mt}>
      {/* Título de grupo */}
      <Flex align="center" gap={3} mb={4}>
        <Box h="1px" flex={1} bg="linear-gradient(90deg, rgba(200,170,110,0.5), transparent)" />
        <Text
          fontFamily="'BeaufortforLOL-Regular', serif"
          fontSize="11px"
          letterSpacing="0.15em"
          textTransform="uppercase"
          color="rgba(200,170,110,0.6)"
        >
          {title}
        </Text>
        <Box h="1px" flex={1} bg="linear-gradient(90deg, transparent, rgba(200,170,110,0.5))" />
      </Flex>

      <Box display="grid" gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={3}>
        {stats.map((key) => {
          const cfg = STAT_CONFIG[key];
          if (!cfg) return null;
          const value = allStats[key];
          const pct = Math.min((value / cfg.max) * 100, 100);

          return (
            <Box
              key={key}
              p={3}
              bg="rgba(10,20,40,0.5)"
              border="1px solid rgba(200,170,110,0.12)"
              position="relative"
              _hover={{ borderColor: 'rgba(200,170,110,0.3)', bg: 'rgba(10,20,40,0.7)' }}
              transition="all 0.15s"
            >
              {/* Cabecera stat */}
              <Flex justify="space-between" align="center" mb={2}>
                <Flex align="center" gap={2}>
                  <Text fontSize="13px" lineHeight={1}>{cfg.icon}</Text>
                  <Text
                    fontFamily="'SpiegelSans', sans-serif"
                    fontSize="11px"
                    letterSpacing="0.06em"
                    color="rgba(160,155,140,0.9)"
                  >
                    {cfg.label}
                  </Text>
                </Flex>
                <Text
                  fontFamily="'BeaufortforLOL-Regular', serif"
                  fontSize="13px"
                  fontWeight="bold"
                  color={cfg.color}
                >
                  {Number.isInteger(value) ? value : value.toFixed(2)}
                </Text>
              </Flex>

              {/* Barra de progreso custom */}
              <Box
                h="3px"
                bg="rgba(255,255,255,0.06)"
                position="relative"
                overflow="hidden"
              >
                <Box
                  h="100%"
                  w={`${pct}%`}
                  bg={`linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`}
                  transition="width 0.6s ease"
                  position="relative"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    w: '4px',
                    bg: cfg.color,
                    boxShadow: `0 0 6px ${cfg.color}`,
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
