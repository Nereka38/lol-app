'use client';

import { useState, useEffect } from 'react';
import { Champion } from '@/app/types/champions';
import { getAllChampions, type Locale } from './lib/api';
import './styles/fonts.css';
import './styles/loader.css';
import { Box, Flex, Text, SimpleGrid, Input } from '@chakra-ui/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { roleTranslations } from '@/app/utils/roles';
import { useLanguage } from '@/app/hooks/useLanguage';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const NAV_LINKS = ['Champions', 'Items', 'Lore', 'Maps'];
const PAGE_SIZE = 20;

// ── Iconos de habilidades por tecla ──────────────────────────────
const SPELL_ICONS: Record<string, string> = {
  P: '◈', Q: '◆', W: '◇', E: '⬡', R: '★',
};

// ── Tarjeta con flip ─────────────────────────────────────────────
function ChampionCard({ champ, index }: { champ: Champion; index: number }) {
  const [hovered, setHovered] = useState(false);
  const primaryTag = champ.tags?.[0] ?? '';

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.6), ease: [0.23, 1, 0.32, 1] }}
      h="480px"
      style={{ perspective: '1200px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Contenedor flip */}
      <motion.div
        animate={{ rotateY: hovered ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >

        {/* ══ FRENTE ══ */}
        <Box
          position="absolute"
          inset={0}
          overflow="hidden"
          bg="#111d26"
          cursor="pointer"
          sx={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)',
            border: '1px solid rgba(200,170,110,0.1)',
            transition: 'border-color 0.5s ease',
          }}
        >
          {/* Imagen */}
          <Box
            as="img"
            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`}
            alt={champ.name}
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition="center top"
            opacity={0.8}
            sx={{ transition: 'transform 0.7s ease, opacity 0.5s ease' }}
          />
          {/* Gradiente inferior */}
          <Box
            position="absolute"
            inset={0}
            bgGradient="linear(to-t, #111d26 0%, rgba(17,29,38,0.3) 50%, transparent 100%)"
          />
          {/* Esquina decorativa */}
          <Box
            position="absolute" top={4} right={4} w="48px" h="48px"
            borderTop="2px solid" borderRight="2px solid"
            borderColor="rgba(200,170,110,0.4)"
          />
          {/* Texto inferior */}
          <Box position="absolute" bottom={0} left={0} w="100%" p={8}>
            <Text
              fontSize="10px" fontWeight="bold" letterSpacing="0.2em"
              textTransform="uppercase" color="#8ecefb" mb={1}
              fontFamily="'SpiegelSans', sans-serif"
            >
              {roleTranslations[primaryTag] || primaryTag}
            </Text>
            <Text
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="28px" fontWeight="800" color="#e5c587" lineHeight={1.1}
            >
              {champ.name}
            </Text>
          </Box>
        </Box>

        {/* ══ REVERSO ══ */}
        <Box
          position="absolute"
          inset={0}
          overflow="hidden"
          bg="#111d26"
          sx={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)',
            border: '1px solid rgba(200,170,110,0.3)',
          }}
        >
          {/* Glow de fondo */}
          <Box
            position="absolute" inset={0}
            bg="rgba(142,206,251,0.06)"
            filter="blur(60px)"
            pointerEvents="none"
          />

          {/* Patrón runic de fondo */}
          <Box
            position="absolute" inset={0} opacity={0.5} pointerEvents="none"
            sx={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(200,170,110,0.07) 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Imagen de fondo oscurecida */}
          <Box
            as="img"
            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`}
            alt=""
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition="center top"
            opacity={0.07}
          />

          {/* Esquinas decorativas */}
          <Box position="absolute" top={4} right={4} w="48px" h="48px"
            borderTop="2px solid #c8aa6e" borderRight="2px solid #c8aa6e" />
          <Box position="absolute" bottom={4} left={4} w="48px" h="48px"
            borderBottom="2px solid rgba(200,170,110,0.2)" borderLeft="2px solid rgba(200,170,110,0.2)" />

          {/* Contenido del reverso */}
          <Flex
            direction="column"
            align="center"
            justify="space-between"
            h="100%"
            p={8}
            position="relative"
            zIndex={1}
          >
            <Box w="100%" textAlign="center">
              {/* Nombre */}
              <Text
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="32px" fontWeight="800"
                color="#e5c587" textTransform="uppercase"
                letterSpacing="0.1em" mb={1}
              >
                {champ.name}
              </Text>

              {/* Título */}
              <Text
                fontFamily="'SpiegelSans', sans-serif"
                fontSize="11px" fontWeight="bold"
                letterSpacing="0.2em" textTransform="uppercase"
                color="#8ecefb" mb={6}
              >
                {champ.title
                  ? champ.title.charAt(0).toUpperCase() + champ.title.slice(1)
                  : roleTranslations[primaryTag] || primaryTag}
              </Text>

              {/* Divisor */}
              <Box
                h="1px" w="60%" mx="auto" mb={6}
                bgGradient="linear(to-r, transparent, #c8aa6e, transparent)"
              />

              {/* Iconos de habilidades P Q W E R */}
              <Flex justify="center" gap={2} mb={6}>
                {['P', 'Q', 'W', 'E', 'R'].map((key) => (
                  <Flex
                    key={key}
                    w="36px" h="36px"
                    align="center" justify="center"
                    border="1px solid rgba(200,170,110,0.3)"
                    bg="#1f2b35"
                    direction="column"
                    cursor="default"
                    sx={{
                      transition: 'border-color 0.2s',
                      '&:hover': { borderColor: '#c8aa6e' },
                    }}
                  >
                    <Text fontSize="14px" color="#8ecefb" lineHeight={1}>
                      {SPELL_ICONS[key]}
                    </Text>
                    <Text fontSize="8px" color="rgba(200,170,110,0.5)" letterSpacing="0.05em" lineHeight={1} mt="2px">
                      {key}
                    </Text>
                  </Flex>
                ))}
              </Flex>

              {/* Lore snippet */}
              {champ.blurb && (
                <Text
                  fontFamily="'SpiegelSans', sans-serif"
                  fontSize="11px"
                  color="rgba(208,197,181,0.65)"
                  lineHeight={1.7}
                  fontStyle="italic"
                  px={2}
                  noOfLines={4}
                >
                  "{champ.blurb}"
                </Text>
              )}
            </Box>

            {/* Botón VIEW DETAILS */}
            <Link href={`/champion/${champ.id}`} style={{ textDecoration: 'none', width: '100%' }}>
              <Box
                as="button"
                w="100%"
                py={4}
                border="1px solid #c8aa6e"
                color="#c8aa6e"
                bg="transparent"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="11px"
                fontWeight="bold"
                letterSpacing="0.3em"
                textTransform="uppercase"
                cursor="pointer"
                sx={{
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 15px rgba(200,170,110,0.15)',
                  '&:hover': {
                    bg: '#c8aa6e',
                    color: '#402d00',
                  },
                }}
              >
                VER DETALLE
              </Box>
            </Link>
          </Flex>
        </Box>
      </motion.div>
    </MotionBox>
  );
}

// ── Página principal ─────────────────────────────────────────────
export default function Home() {
  const { language, setLanguage } = useLanguage();
  const [champions, setChampions] = useState<Champion[]>([]);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filterOpen, setFilterOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    getAllChampions(language).then((data) => { setChampions(data); setLoading(false); });
  }, [language]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, tagFilter]);

  const allTags = Array.from(new Set(champions.flatMap((c) => c.tags ?? [])));
  const filtered = champions.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) &&
      (tagFilter === '' || c.tags?.includes(tagFilter))
  );
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <Box
      minH="100vh"
      bg="#08151e"
      color="#d7e4f1"
      fontFamily="'Work Sans', sans-serif"
      position="relative"
      overflow="hidden"
    >
      {/* Fondo runic */}
      <Box
        position="fixed" inset={0} pointerEvents="none" zIndex={0}
        sx={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(200,170,110,0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glows ambientales */}
      <Box position="fixed" top="-200px" right="-200px" w="800px" h="800px"
        bg="rgba(142,206,251,0.04)" borderRadius="full" filter="blur(120px)" zIndex={0} pointerEvents="none" />
      <Box position="fixed" bottom="-200px" left="-200px" w="600px" h="600px"
        bg="rgba(200,170,110,0.04)" borderRadius="full" filter="blur(100px)" zIndex={0} pointerEvents="none" />

      {/* ══ NAVBAR ══ */}
      <Box
        as="nav" position="fixed" top={0} w="100%" zIndex={50}
        h="80px" bg="rgba(8,21,30,0.9)" backdropFilter="blur(12px)"
        borderBottom="2px solid rgba(200,170,110,0.3)"
        boxShadow="0 4px 32px rgba(0,0,0,0.5)" px={6}
      >
        <Flex h="100%" align="center" justify="space-between">
          {/* Logo + Nav */}
          <Flex align="center" gap={12}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Text
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="22px" fontWeight="bold" letterSpacing="-0.02em"
                color="#e5c587" textTransform="uppercase"
                sx={{ textShadow: '0 0 8px rgba(229,197,135,0.4)' }}
              >
                LOLPEDIA
              </Text>
            </Link>
            <Flex display={{ base: 'none', md: 'flex' }} gap={8} align="center" h="80px">
              {NAV_LINKS.map((link, i) => (
                <Box
                  key={link} as="a" href="#"
                  fontFamily="Georgia, 'Times New Roman', serif"
                  fontSize="13px" fontWeight="bold"
                  letterSpacing="0.2em" textTransform="uppercase"
                  color={i === 0 ? '#e5c587' : '#d0c5b5'}
                  borderBottom={i === 0 ? '2px solid #e5c587' : '2px solid transparent'}
                  pb="2px"
                  sx={{ transition: 'all 0.3s ease', '&:hover': { color: '#e5c587' } }}
                  style={{ textDecoration: 'none' }}
                >
                  {link.toUpperCase()}
                </Box>
              ))}
            </Flex>
          </Flex>

          {/* Buscador + Filtro + Iconos */}
          <Flex align="center" gap={4}>
            <Box position="relative" display={{ base: 'none', lg: 'block' }}>
              <Input
                placeholder="BUSCAR CAMPEÓN"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg="#040f18" border="none"
                borderBottom="1px solid rgba(153,143,129,0.3)"
                borderRadius={0} color="#d7e4f1"
                fontSize="12px" letterSpacing="0.2em"
                fontFamily="'Work Sans', sans-serif"
                py={2} px={4} w="256px"
                _placeholder={{ color: 'rgba(208,197,181,0.4)' }}
                _focus={{ boxShadow: 'none', borderBottomColor: '#8ecefb' }}
                pr="36px"
              />
              <Box position="absolute" right={2} top="50%" transform="translateY(-50%)"
                color="rgba(229,197,135,0.5)" fontSize="16px" pointerEvents="none">
                🔍
              </Box>
            </Box>

            {/* Botón FILTER */}
            <Box position="relative">
              <Box
                as="button" onClick={() => setFilterOpen(!filterOpen)}
                px={6} py={2} bg="#c8aa6e" color="#533e0c"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="12px" fontWeight="bold"
                letterSpacing="0.2em" textTransform="uppercase"
                border="1px solid rgba(200,170,110,0.2)" cursor="pointer"
                sx={{ transition: 'all 0.3s ease', '&:hover': { filter: 'brightness(1.1)' }, '&:active': { transform: 'scale(0.95)' } }}
              >
                FILTER
              </Box>
              <AnimatePresence>
                {filterOpen && (
                  <MotionBox
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                    position="absolute" top="calc(100% + 8px)" right={0}
                    bg="#111d26" border="1px solid rgba(200,170,110,0.25)"
                    minW="180px" zIndex={100} py={2}
                  >
                    <FilterOption label="Todos" active={tagFilter === ''} onClick={() => { setTagFilter(''); setFilterOpen(false); }} />
                    {allTags.map((tag) => (
                      <FilterOption
                        key={tag}
                        label={roleTranslations[tag] || tag}
                        active={tagFilter === tag}
                        onClick={() => { setTagFilter(tag); setFilterOpen(false); }}
                      />
                    ))}
                  </MotionBox>
                )}
              </AnimatePresence>
            </Box>

            <Flex gap={1}>
              <Box position="relative">
                <NavIcon onClick={() => setSettingsOpen(!settingsOpen)}>⚙</NavIcon>
                <AnimatePresence>
                  {settingsOpen && (
                    <MotionBox
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      position="absolute"
                      top="calc(100% + 8px)"
                      right={0}
                      bg="#111d26"
                      border="1px solid rgba(200,170,110,0.25)"
                      minW="140px"
                      zIndex={100}
                      py={2}
                    >
                      <Box
                        as="button"
                        onClick={() => { setLanguage('es'); setSettingsOpen(false); }}
                        w="100%"
                        textAlign="left"
                        px={4}
                        py="10px"
                        fontFamily="Georgia, 'Times New Roman', serif"
                        fontSize="12px"
                        letterSpacing="0.1em"
                        textTransform="uppercase"
                        color={language === 'es' ? '#e5c587' : 'rgba(208,197,181,0.7)'}
                        bg={language === 'es' ? 'rgba(200,170,110,0.1)' : 'transparent'}
                        cursor="pointer"
                        sx={{
                          transition: 'all 0.15s ease',
                          '&:hover': { bg: 'rgba(200,170,110,0.06)', color: '#e5c587' },
                        }}
                      >
                        {language === 'es' && <Box as="span" mr={2} color="#e5c587">◆</Box>}
                        Español
                      </Box>
                      <Box
                        as="button"
                        onClick={() => { setLanguage('en'); setSettingsOpen(false); }}
                        w="100%"
                        textAlign="left"
                        px={4}
                        py="10px"
                        fontFamily="Georgia, 'Times New Roman', serif"
                        fontSize="12px"
                        letterSpacing="0.1em"
                        textTransform="uppercase"
                        color={language === 'en' ? '#e5c587' : 'rgba(208,197,181,0.7)'}
                        bg={language === 'en' ? 'rgba(200,170,110,0.1)' : 'transparent'}
                        cursor="pointer"
                        sx={{
                          transition: 'all 0.15s ease',
                          '&:hover': { bg: 'rgba(200,170,110,0.06)', color: '#e5c587' },
                        }}
                      >
                        {language === 'en' && <Box as="span" mr={2} color="#e5c587">◆</Box>}
                        English
                      </Box>
                    </MotionBox>
                  )}
                </AnimatePresence>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      {/* ══ CONTENIDO PRINCIPAL ══ */}
      <Box as="main" pt="104px" pb={20} position="relative" zIndex={1}>

        {/* Loader */}
        {loading && (
          <Flex
            justify="center"
            align="center"
            direction="column"
            gap={8}
            minH="100vh"
            w="100%"
            bg="#040f18"
            position="relative"
          >
            {/* Hextech Loader */}
            <Box position="relative" w="80" h="80" display="flex" alignItems="center" justifyContent="center">

              {/* Outer Ring */}
              <Box
                position="absolute"
                inset={0}
                border="3px solid rgba(229,197,135,0.2)"
                borderRadius="full"
                animation="spin 12s linear infinite"
              >
                <Box
                  position="absolute"
                  top="-4px"
                  left="50%"
                  transform="translateX(-50%) rotate(45deg)"
                  w="4"
                  h="4"
                  bg="#e5c587"
                  border="1px solid #c8aa6e"
                  boxShadow="0 0 15px #c8aa6e"
                />
                <Box
                  position="absolute"
                  bottom="-4px"
                  left="50%"
                  transform="translateX(-50%) rotate(45deg)"
                  w="4"
                  h="4"
                  bg="#e5c587"
                  border="1px solid #c8aa6e"
                  boxShadow="0 0 15px #c8aa6e"
                />
              </Box>

              {/* Inner Dashed Gear */}
              <Box
                position="absolute"
                inset="6px"
                border="2px dashed rgba(142,206,251,0.4)"
                borderRadius="full"
                animation="spinReverse 8s linear infinite"
              />

              {/* Central Crystal */}
              <Box
                w="24"
                h="24"
                bgGradient="linear(to-br, #8ecefb, #015a82, #8ecefb)"
                transform="rotate(45deg)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 0 40px rgba(142,206,251,0.3)"
                borderRadius="md"
                animation="pulse 3s ease-in-out infinite"
              >
                <Box w="16" h="16" bg="#040f18aa" display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="4xl" color="#8ecefb">⚡</Text>
                </Box>
              </Box>
            </Box>

            {/* Loading Text */}
            <Text
              fontFamily="Georgia, serif"
              fontSize="11px"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color="rgba(200,170,110,0.5)"
            >
              Cargando campeones...
            </Text>
          </Flex>
        )}

        {/* Hero */}
        <MotionFlex
          direction="column" align="center" textAlign="center"
          px={6} pt={12} pb={12}
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Text
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="13px" letterSpacing="0.3em"
            textTransform="uppercase" color="#e2c384" mb={4}
          >
            ELIGE TU LEYENDA
          </Text>
          <Text
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize={{ base: '56px', md: '96px' }}
            fontWeight="800" color="#d7e4f1"
            letterSpacing="-0.02em" lineHeight={1} mb={8}
            sx={{ textShadow: '0 4px 32px rgba(0,0,0,0.5)' }}
          >
            CHAMPIONS
          </Text>
          <Flex
            align="center" gap={4} py={2} px={8}
            bg="#111d26" border="1px solid rgba(77,70,58,0.2)"
            backdropFilter="blur(4px)"
          >
            <Text fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="24px" fontWeight="bold" color="#8ecefb">
              {loading ? '—' : filtered.length}
            </Text>
            <Text fontFamily="'Work Sans', sans-serif" fontSize="13px"
              fontWeight="600" letterSpacing="0.2em" textTransform="uppercase"
              color="rgba(208,197,181,0.7)">
              CAMPEONES DISPONIBLES
            </Text>
          </Flex>
        </MotionFlex>


        {/* Sin resultados */}
        {!loading && filtered.length === 0 && (
          <Flex justify="center" align="center" direction="column" gap={3} minH="30vh">
            <Text fontSize="36px">⚔</Text>
            <Text fontFamily="Georgia, serif" fontSize="18px" letterSpacing="0.1em"
              textTransform="uppercase" color="#c8aa6e">
              Ningún campeón encontrado
            </Text>
          </Flex>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <Box maxW="1400px" mx="auto" px={6}>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap={8}>
              <AnimatePresence mode="popLayout">
                {visible.map((champ, i) => (
                  <ChampionCard key={champ.id} champ={champ} index={i} />
                ))}
              </AnimatePresence>
            </SimpleGrid>

            {hasMore && (
              <Flex justify="center" mt={20}>
                <MotionBox whileHover={{ boxShadow: '0 0 20px rgba(229,197,135,0.2)' }} whileTap={{ scale: 0.97 }}>
                  <Box
                    as="button"
                    onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                    px={12} py={4}
                    border="2px solid rgba(200,170,110,0.3)"
                    color="#e5c587" bg="rgba(42,54,64,0.3)"
                    fontFamily="Georgia, 'Times New Roman', serif"
                    fontSize="13px" fontWeight="800"
                    letterSpacing="0.5em" textTransform="uppercase"
                    cursor="pointer" backdropFilter="blur(4px)"
                    sx={{ transition: 'all 0.5s ease', '&:hover': { borderColor: '#c8aa6e' } }}
                  >
                    VER MÁS
                  </Box>
                </MotionBox>
              </Flex>
            )}
          </Box>
        )}
      </Box>

      {/* ══ FOOTER ══ */}
      <Box as="footer" w="100%" bg="#040f18"
        borderTop="1px solid rgba(200,170,110,0.1)" py={12} px={8} position="relative" zIndex={1}>
        <Flex direction="column" align="center" gap={4} textAlign="center">
          <Flex gap={8} mb={4} flexWrap="wrap" justify="center">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Support'].map((l) => (
              <Box key={l} as="a" href="#"
                fontFamily="'Work Sans', sans-serif" fontSize="10px"
                letterSpacing="0.2em" textTransform="uppercase"
                color="rgba(208,197,181,0.6)"
                sx={{ transition: 'color 0.3s', '&:hover': { color: '#e5c587' } }}
                style={{ textDecoration: 'none' }}>
                {l}
              </Box>
            ))}
          </Flex>
          <Text fontFamily="'Work Sans', sans-serif" fontSize="10px"
            letterSpacing="0.15em" textTransform="uppercase"
            color="rgba(208,197,181,0.6)" maxW="800px">
            © 2024 RIOT GAMES, INC. RIOT GAMES, LEAGUE OF LEGENDS AND ANY ASSOCIATED LOGOS ARE TRADEMARKS,
            SERVICE MARKS AND/OR REGISTERED TRADEMARKS OF RIOT GAMES, INC.
          </Text>
          <Flex gap={6} mt={4}>
            {['🏆', '🌐', '🎮'].map((icon, i) => (
              <Text key={i} fontSize="22px" opacity={0.3}>{icon}</Text>
            ))}
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}

// ── Helpers ──────────────────────────────────────────────────────
function FilterOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Box as="button" onClick={onClick} w="100%" textAlign="left"
      px={4} py="10px"
      fontFamily="Georgia, 'Times New Roman', serif"
      fontSize="12px" letterSpacing="0.1em" textTransform="uppercase"
      color={active ? '#e5c587' : 'rgba(208,197,181,0.7)'}
      bg={active ? 'rgba(200,170,110,0.1)' : 'transparent'}
      cursor="pointer"
      sx={{ transition: 'all 0.15s ease', '&:hover': { bg: 'rgba(200,170,110,0.06)', color: '#e5c587' } }}
    >
      {active && <Box as="span" mr={2} color="#e5c587">◆</Box>}
      {label}
    </Box>
  );
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <Box as="button" p={2} color="rgba(208,197,181,0.6)" cursor="pointer"
      sx={{ transition: 'all 0.3s ease', '&:hover': { bg: 'rgba(31,43,53,0.5)', color: '#8ecefb' } }}>
      {children}
    </Box>
  );
}