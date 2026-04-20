'use client';

import {
  Box, Flex, Text, Image, SimpleGrid,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay,
  useDisclosure, VStack,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { StatsSection } from './StatsSection';
import AbilitiesSection from './AbilitiesSection';
import { Champion } from '@/app/types/champions';
import Link from 'next/link';
import Header from '@/components/Header';

const MotionBox = motion(Box);

interface Quote {
  text: string;
  audio: string;
}
interface Props {
  champion: Champion;
}

const SECTIONS   = ['historia', 'habilidades', 'estadisticas', 'aspectos', 'voces'];

export default function ChampionDetailClient({ champion }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeSection, setActiveSection] = useState('historia');
  const [currentPage, setCurrentPage]     = useState(0);
  const [selectedSkinIndex, setSelectedSkinIndex] = useState(0);
  const [playingIndex, setPlayingIndex]           = useState<number | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cargar audios desde la API interna
  useEffect(() => {
    async function loadQuotes() {
      try {
        const encodedName = encodeURIComponent(champion.name);
        const response = await fetch(`/api/audio/${encodedName}`);
        if (response.ok) {
          const data = await response.json();
          setQuotes(data.quotes || []);
        }
      } catch (error) {
        console.error('Error loading quotes:', error);
      } finally {
        setIsLoadingQuotes(false);
      }
    }
    loadQuotes();
  }, [champion.name]);

  const ITEMS_PER_PAGE  = 20;
  const totalPages      = Math.ceil(quotes.length / ITEMS_PER_PAGE);
  const currentQuotes   = quotes.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  const getFileName = (url: string) => {
    const match = url.match(/([^/]+)(?=\.ogg)/);
    return match ? match[0].replace(/_/g, ' ') : '';
  };

  return (
    <Box bg="#08151e" color="#d7e4f1" minH="100vh" fontFamily="'Work Sans', sans-serif" position="relative">

      {/* ── Splash art de fondo ── */}
      <Box position="fixed" inset={0} zIndex={0} opacity={0.18} pointerEvents="none">
        <Box
          as="img"
          src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`}
          alt=""
          w="100%" h="100%"
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
        />
        <Box position="absolute" inset={0}
          bgGradient="linear(to-t, #08151e 0%, rgba(8,21,30,0.6) 50%, transparent 100%)" />
      </Box>

      {/* ── Header compartido ── */}
      <Box position="relative" zIndex={10}>
        <Header variant="detail" />
      </Box>

      <Box position="relative" zIndex={1} pt={6}>

        {/* ══════════════ HERO HEADER ══════════════ */}
        <Box maxW="1200px" mx="auto" px={6} mb={12}>
          <Box borderLeft="4px solid #c8aa6e" pl={6}>
            <Text
              fontSize="11px" letterSpacing="0.3em" textTransform="uppercase"
              color="#8ecefb" mb={2} fontFamily="'Work Sans', sans-serif" fontWeight="bold"
            >
              {champion.title
                ? champion.title.charAt(0).toUpperCase() + champion.title.slice(1)
                : (champion.tags ?? []).join(' / ')}
            </Text>
            <Text
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize={{ base: '52px', md: '88px' }}
              fontWeight="900"
              fontStyle="italic"
              color="#d7e4f1"
              lineHeight={0.9}
              letterSpacing="-0.02em"
              textTransform="uppercase"
            >
              {champion.name}
            </Text>
          </Box>

          {/* Tags */}
          <Flex gap={2} mt={5} pl={7}>
            {(champion.tags ?? []).map((tag) => (
              <Box
                key={tag}
                px={4} py={1}
                bg="#1f2b35"
                border="1px solid rgba(200,170,110,0.2)"
                fontSize="10px"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color="#8ecefb"
                fontWeight="bold"
              >
                {tag}
              </Box>
            ))}
          </Flex>
        </Box>

        {/* ══════════════ TABS ══════════════ */}
        <Box maxW="1200px" mx="auto" px={6} mb={0}>
          <Flex
            flexWrap="wrap" gap={0}
            bg="#111d26" p={1}
            borderBottom="1px solid rgba(200,170,110,0.2)"
          >
            {SECTIONS.map((sec) => (
              <Box
                key={sec}
                as="button"
                px={6} py={3}
                cursor="pointer"
                fontSize="11px"
                letterSpacing="0.15em"
                textTransform="uppercase"
                fontWeight="bold"
                fontFamily="'Work Sans', sans-serif"
                onClick={() => setActiveSection(sec)}
                color={activeSection === sec ? '#08151e' : '#d0c5b5'}
                bg={activeSection === sec ? '#c8aa6e' : 'transparent'}
                borderBottom={activeSection === sec ? '4px solid #e5c587' : '4px solid transparent'}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': { color: activeSection === sec ? '#08151e' : '#e5c587' },
                }}
              >
                {sec.charAt(0).toUpperCase() + sec.slice(1)}
              </Box>
            ))}
          </Flex>
        </Box>

        {/* ══════════════ CONTENIDO DINÁMICO ══════════════ */}
        <Box maxW="1200px" mx="auto" px={6} py={10}>
          <AnimatePresence mode="wait">
            <MotionBox
              key={activeSection}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >

              {/* ─────────────── HISTORIA ─────────────── */}
              {activeSection === 'historia' && (
                <Flex direction={{ base: 'column', lg: 'row' }} gap={12}>

                  {/* Sidebar */}
                  <VStack spacing={8} w={{ base: '100%', lg: '300px' }} flexShrink={0} align="stretch">
                    {/* Metadata panel */}
                    <Box p={8} bg="#15212a" borderTop="2px solid #c8aa6e" position="relative">
                      <Box position="absolute" top={0} right={0} w={10} h={10}
                        borderTop="1px solid rgba(229,197,135,0.4)"
                        borderRight="1px solid rgba(229,197,135,0.4)" />
                      <Text fontFamily="Georgia, serif" fontSize="16px" color="#e5c587" mb={6} fontStyle="italic">
                        Archive Metadata
                      </Text>
                      <VStack spacing={4} align="stretch">
                        {[
                          { label: 'Rol',         value: champion.tags?.[0] ?? '—' },
                          { label: 'Dificultad',  value: champion.info?.difficulty ?? '—' },
                          { label: 'Tags',        value: (champion.tags ?? []).join(', ') || '—' },
                        ].map(({ label, value }) => (
                          <Flex key={label} justify="space-between"
                            borderBottom="1px solid rgba(153,143,129,0.3)" pb={2}>
                            <Text fontSize="10px" textTransform="uppercase"
                              letterSpacing="0.1em" color="#d0c5b5">{label}</Text>
                            <Text fontSize="11px" fontWeight="bold" color="#8ecefb">{value}</Text>
                          </Flex>
                        ))}
                      </VStack>
                    </Box>
                  </VStack>

                  <Box flex={1}>
                    <Box position="relative" mb={8}>
                      <Text
                        position="absolute" left={-4} top={-4}
                        fontSize="80px" fontFamily="Georgia, serif"
                        color="rgba(229,197,135,0.1)" userSelect="none" lineHeight={1}
                      >
                        "
                      </Text>
                      <Text fontFamily="Georgia, serif"
                        fontSize={{ base: '28px', lg: '40px' }}
                        color="#d7e4f1" fontStyle="italic" lineHeight={1.2}>
                        Historia
                      </Text>
                    </Box>
                    <Text
                      fontFamily="'Work Sans', sans-serif"
                      fontSize="16px" lineHeight={1.9}
                      color="#bbc8d5"
                    >
                      {champion.lore}
                    </Text>
                  </Box>
                </Flex>
              )}

              {/* ─────────────── HABILIDADES ─────────────── */}
              {activeSection === 'habilidades' && (
                <AbilitiesSection
                  passive={champion.passive}
                  spells={champion.spells}
                  championName={champion.name}
                />
              )}

              {/* ─────────────── ESTADÍSTICAS ─────────────── */}
              {activeSection === 'estadisticas' && (
                <StatsSection stats={champion.stats} />
              )}

              {/* ─────────────── ASPECTOS ─────────────── */}
              {activeSection === 'aspectos' && (
                <Box>
                  <Flex justify="space-between" align="center" mb={8}>
                    <Text fontFamily="Georgia, serif" fontSize="28px"
                      fontStyle="italic" color="#e2c384">
                      Galería de Aspectos
                    </Text>
                  </Flex>

                  {/* ── Preview principal ── */}
                  {(champion.skins ?? []).length > 0 && (() => {
                    const skin = champion.skins![selectedSkinIndex];
                    const splashSrc = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg`;
                    return (
                      <Box position="relative" w="100%" mb={6} overflow="hidden"
                        sx={{ aspectRatio: '16/9', maxHeight: '700px' }}>

                        {/* Fondo blur de la skin seleccionada */}
                        <Box position="absolute" inset={0} zIndex={0}>
                          <Box
                            as="img" src={splashSrc} alt=""
                            w="100%" h="100%"
                            style={{ objectFit: 'cover', filter: 'blur(40px) brightness(0.5)', opacity: 0.3, transform: 'scale(1.1)' }}
                          />
                          <Box position="absolute" inset={0} bg="rgba(8,21,30,0.6)" />
                        </Box>

                        {/* Imagen principal centrada */}
                        <Box position="relative" zIndex={1} w="100%" h="100%"
                          display="flex" alignItems="center" justifyContent="center" p={8}>
                          <Box
                            position="relative" w="100%" h="100%"
                            bg="rgba(17,29,38,0.4)" backdropFilter="blur(4px)"
                            display="flex" alignItems="center" justifyContent="center"
                            boxShadow="0 25px 50px rgba(0,0,0,0.5)"
                          >
                            <Box
                              as="img" src={splashSrc}
                              alt={skin.name === 'default' ? champion.name : skin.name}
                              w="100%" h="100%"
                              style={{ transition: 'opacity 0.5s ease' }}
                            />

                            {/* Metadata overlay inferior izquierda */}
                            <Box position="absolute" bottom={12} left={12} zIndex={2} pointerEvents="none">
                              <Box
                                display="inline-block"
                                bg="#8ecefb" color="#00344d"
                                px={3} py={1}
                                fontSize="10px" fontWeight="900"
                                letterSpacing="0.2em" textTransform="uppercase" mb={2}
                              >
                                {skin.num === 0 ? 'Base' : 'Aspecto'}
                              </Box>
                              <Text
                                fontFamily="Georgia, serif"
                                fontSize={{ base: '32px', md: '56px' }}
                                fontStyle="italic" color="#d7e4f1"
                                fontWeight="900" lineHeight={1}
                                sx={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
                              >
                                {skin.name === 'default' ? champion.name : skin.name}
                              </Text>
                            </Box>

                            {/* Esquinas decorativas */}
                            <Box position="absolute" top={0} left={0} w="100%" h="100%" pointerEvents="none">
                              <Box position="absolute" top={4} right={4} w={10} h={10}
                                borderTop="2px solid rgba(200,170,110,0.5)"
                                borderRight="2px solid rgba(200,170,110,0.5)" />
                              <Box position="absolute" bottom={4} left={4} w={10} h={10}
                                borderBottom="2px solid rgba(200,170,110,0.2)"
                                borderLeft="2px solid rgba(200,170,110,0.2)" />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })()}

                  {/* ── Carrusel de thumbnails ── */}
                  <Box
                    overflowX="auto"
                    pb={4}
                    mb={16}
                    sx={{
                      display: 'flex',
                      gap: '16px',
                      scrollSnapType: 'x mandatory',
                      '&::-webkit-scrollbar': { height: '4px' },
                      '&::-webkit-scrollbar-track': { bg: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { bg: 'rgba(200,170,110,0.3)', borderRadius: '2px' },
                    }}
                  >
                    {(champion.skins ?? []).map((skin, i) => {
                      const isActive = i === selectedSkinIndex;
                      return (
                        <Box
                          key={skin.num}
                          as="button"
                          flexShrink={0}
                          w="192px"
                          position="relative"
                          overflow="hidden"
                          bg="#1f2b35"
                          border="2px solid"
                          borderColor={isActive ? '#c8aa6e' : 'rgba(200,170,110,0.15)'}
                          opacity={isActive ? 1 : 0.55}
                          onClick={() => setSelectedSkinIndex(i)}
                          cursor="pointer"
                          sx={{
                            aspectRatio: '16/9',
                            scrollSnapAlign: 'start',
                            transition: 'all 0.3s ease',
                            '&:hover': { opacity: 1, borderColor: 'rgba(200,170,110,0.6)' },
                            '&:hover img': { transform: 'scale(1.08)' },
                          }}
                        >
                          <Box
                            as="img"
                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg`}
                            alt={skin.name}
                            w="100%" h="100%"
                            style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                          />
                          <Box
                            position="absolute" inset={0}
                            bg={isActive ? 'rgba(200,170,110,0.15)' : 'rgba(0,0,0,0.4)'}
                            display="flex" alignItems="flex-end" p={3}
                          >
                            <Text fontSize="10px" fontWeight="bold"
                              textTransform="uppercase" letterSpacing="0.15em"
                              color={isActive ? '#c8aa6e' : '#d0c5b5'}
                              noOfLines={1}>
                              {skin.name === 'default' ? 'Original' : skin.name}
                            </Text>
                          </Box>
                          {isActive && (
                            <Box position="absolute" top={0} right={0} w="32px" h="32px"
                              borderTop="3px solid #c8aa6e" borderRight="3px solid #c8aa6e" />
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* ── Sección expandida ── */}
                  <Flex direction={{ base: 'column', md: 'row' }} gap={12} align="center" mt={8}>
                    {/* Texto + lista */}
                    <Box flex={1}>
                      <Text fontFamily="Georgia, serif" fontSize="36px"
                        fontStyle="italic" color="#e5c587" mb={4}>
                        Mística de los Aspectos
                      </Text>
                      <Text color="#d0c5b5" lineHeight={1.9} fontSize="15px" mb={8}>
                        Cada aspecto no es solo un cambio de vestuario — es una reinvención del campeón
                        en diferentes rincones del multiverso de League of Legends. Desde disciplinas
                        ancestrales hasta escenarios vibrantes de la música pop global.
                      </Text>
                      <Box
                        p={8} position="relative" overflow="hidden"
                        bg="rgba(31,43,53,0.6)" backdropFilter="blur(12px)"
                        borderLeft="2px solid #c8aa6e"
                      >
                        <Text fontSize="10px" fontWeight="bold" color="#8ecefb"
                          textTransform="uppercase" letterSpacing="0.2em" mb={4}>
                          Efectos Especiales
                        </Text>
                        <VStack spacing={4} align="stretch">
                          {[
                            'Nuevas animaciones de Rellamada (Recall)',
                            'Efectos visuales temáticos para habilidades',
                            'Líneas de voz únicas para aspectos Legendarios',
                          ].map((item) => (
                            <Flex key={item} align="center" gap={3}>
                              <Box w="6px" h="6px" flexShrink={0} bg="#c8aa6e" />
                              <Text fontSize="13px" fontWeight="500" color="#d7e4f1">{item}</Text>
                            </Flex>
                          ))}
                        </VStack>
                      </Box>
                    </Box>

                    {/* Preview con marco */}
                    <Box flex={1} position="relative">
                      {/* Esquinas del marco */}
                      <Box position="absolute" top={-4} left={-4} w={8} h={8}
                        borderTop="2px solid #c8aa6e" borderLeft="2px solid #c8aa6e" zIndex={2} />
                      <Box position="absolute" bottom={-4} right={-4} w={8} h={8}
                        borderBottom="2px solid #c8aa6e" borderRight="2px solid #c8aa6e" zIndex={2} />
                      <Box p="1px" bgGradient="linear(to-br, rgba(200,170,110,0.4), transparent)">
                        <Box position="relative" overflow="hidden"
                          sx={{ aspectRatio: '16/9' }}>
                          <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${champion.skins?.[selectedSkinIndex]?.num ?? 0}.jpg`}
                            alt={champion.name}
                            w="100%" h="100%"
                            objectFit="cover"
                            objectPosition="center top"
                            filter="grayscale(80%)"
                            sx={{ transition: 'all 0.7s ease', '&:hover': { filter: 'grayscale(0%)' } }}
                          />
                          <Box position="absolute" inset={0}
                            bgGradient="linear(to-t, rgba(8,21,30,0.5), transparent)" />
                          {/* Botón play decorativo */}
                          <Flex
                            position="absolute" inset={0}
                            align="center" justify="center"
                          >
                            <Box
                              w="80px" h="80px"
                              bg="rgba(200,170,110,0.15)" backdropFilter="blur(8px)"
                              border="1px solid #c8aa6e"
                              display="flex" alignItems="center" justifyContent="center"
                              color="#c8aa6e" fontSize="32px"
                              sx={{ transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.1)' } }}
                            >
                              ▶
                            </Box>
                          </Flex>
                        </Box>
                      </Box>
                    </Box>
                  </Flex>
                </Box>
              )}

              {/* ─────────────── VOCES ─────────────── */}
              {activeSection === 'voces' && (
                <SimpleGrid columns={{ base: 1, lg: 12 }} gap={12} alignItems="start">

                  {/* ── Col izquierda: lista de voces ── */}
                  <Box gridColumn={{ base: '1', lg: 'span 8' }}>

                    {/* Agrupamos las voces en páginas con categoría */}
                    {isLoadingQuotes ? (
                      <Text color="rgba(208,197,181,0.5)" fontSize="14px">
                        Cargando voces...
                      </Text>
                    ) : quotes.length === 0 ? (
                      <Text color="rgba(208,197,181,0.5)" fontSize="14px">
                        No hay voces disponibles para este campeón.
                      </Text>
                    ) : (
                      <>
                        {/* Grupo principal */}
                        {[
                          { label: 'Interacciones: Movimiento', quotes: currentQuotes.slice(0, Math.ceil(currentQuotes.length / 3)) },
                          { label: 'Interacciones: Ataque',     quotes: currentQuotes.slice(Math.ceil(currentQuotes.length / 3), Math.ceil(currentQuotes.length * 2 / 3)) },
                          { label: 'Personalidad',              quotes: currentQuotes.slice(Math.ceil(currentQuotes.length * 2 / 3)) },
                        ].filter(g => g.quotes.length > 0).map((group) => (
                          <Box key={group.label} mb={12}>
                            {/* Divisor con título */}
                            <Flex align="center" gap={4} mb={6}>
                              <Box flex={1} h="1px"
                                bgGradient="linear(to-r, transparent, rgba(200,170,110,0.4))" />
                              <Text fontFamily="Georgia, serif" fontSize="20px" fontStyle="italic"
                                color="#8ecefb" whiteSpace="nowrap">
                                {group.label}
                              </Text>
                              <Box w="48px" h="1px" bg="rgba(200,170,110,0.4)" flexShrink={0} />
                            </Flex>

                            {/* Cards de voz */}
                            <Box>
                              {group.quotes.map((quote, i) => {
                                const globalIdx = currentPage * 20 + currentQuotes.indexOf(quote);
                                const isPlaying = playingIndex === globalIdx;
                                return (
                                  <VoiceCard
                                    key={globalIdx}
                                    quote={quote}
                                    label={`${champion.name} — ${group.label}`}
                                    isPlaying={isPlaying}
                                    isHighlighted={i % 5 === 1}
                                    onPlay={() => {
                                      if (audioRef.current) {
                                        audioRef.current.pause();
                                        audioRef.current = null;
                                      }
                                      if (isPlaying) {
                                        setPlayingIndex(null);
                                        return;
                                      }
                                      console.log('Playing audio:', quote.audio);
                                      const audio = new Audio(quote.audio);
                                      audioRef.current = audio;
                                      audio.play().catch((err) => {
                                        console.error('Error playing audio:', err);
                                        setPlayingIndex(null);
                                      });
                                      setPlayingIndex(globalIdx);
                                      audio.onended = () => setPlayingIndex(null);
                                      audio.onerror = () => {
                                        console.error('Audio loading error for:', quote.audio);
                                        setPlayingIndex(null);
                                      };
                                    }}
                                    getFileName={getFileName}
                                  />
                                );
                              })}
                            </Box>
                          </Box>
                        ))}

                        {/* Paginación */}
                        {totalPages > 1 && (
                          <Flex align="center" gap={3} mt={4}>
                            <LolButton onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))} disabled={currentPage === 0}>
                              ← Anterior
                            </LolButton>
                            <Text fontFamily="'Work Sans', sans-serif" fontSize="12px"
                              color="rgba(200,170,110,0.7)" letterSpacing="0.08em">
                              {currentPage + 1} / {totalPages}
                            </Text>
                            <LolButton onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))} disabled={currentPage === totalPages - 1}>
                              Siguiente →
                            </LolButton>
                          </Flex>
                        )}
                      </>
                    )}
                  </Box>

                  {/* ── Col derecha: sidebar player ── */}
                  <Box
                    gridColumn={{ base: '1', lg: 'span 4' }}
                    position={{ lg: 'sticky' }}
                    top="128px"
                  >
                    <VStack spacing={6} align="stretch">

                      {/* Reproductor Hextech */}
                      <Box bg="#1f2b35" position="relative" overflow="hidden">
                        {/* Rombo decorativo fondo */}
                        <Box
                          position="absolute" top={0} right={0}
                          w="128px" h="128px" bg="rgba(200,170,110,0.04)"
                          transform="rotate(45deg) translate(40%, -40%)"
                        />
                        <Box p={8} position="relative" zIndex={1}>
                          <Flex justify="space-between" align="center" mb={8}>
                            <Text fontSize="10px" fontWeight="bold" letterSpacing="0.2em"
                              textTransform="uppercase" color="#ffdfa0">
                              Reproductor Hextech
                            </Text>
                            {/* Barras de ecualizador animadas */}
                            <Flex gap="3px" align="flex-end" h="20px">
                              {[12, 20, 8, 16, 10].map((h, i) => (
                                <Box
                                  key={i}
                                  w="3px"
                                  bg="#8ecefb"
                                  sx={{
                                    height: playingIndex !== null ? `${h}px` : '4px',
                                    transition: 'height 0.3s ease',
                                    animation: playingIndex !== null ? `pulse ${0.8 + i * 0.2}s infinite alternate` : 'none',
                                  }}
                                />
                              ))}
                            </Flex>
                          </Flex>

                          {/* Gema central hextech */}
                          <Flex justify="center" py={6}>
                            <Box
                              w="96px" h="96px"
                              bg="#2a3640"
                              transform="rotate(45deg)"
                              border="2px solid rgba(200,170,110,0.4)"
                              display="flex" alignItems="center" justifyContent="center"
                              position="relative"
                            >
                              <Box
                                w="64px" h="64px"
                                bg={playingIndex !== null ? '#015a82' : '#1f2b35'}
                                transform="rotate(0deg)"
                                display="flex" alignItems="center" justifyContent="center"
                                sx={{
                                  transition: 'background 0.3s',
                                  boxShadow: playingIndex !== null ? '0 0 20px rgba(142,206,251,0.5)' : 'none',
                                }}
                              >
                                <Box
                                  w="48px" h="48px"
                                  border="2px solid rgba(255,255,255,0.15)"
                                />
                              </Box>
                            </Box>
                          </Flex>

                          {/* Nombre de la voz activa */}
                          <Box textAlign="center" mb={8}>
                            <Text fontFamily="Georgia, serif" fontSize="16px"
                              fontStyle="italic" color="#d7e4f1" mb={1}>
                              {playingIndex !== null && quotes[playingIndex % quotes.length]
                                ? `"${getFileName(quotes[playingIndex % quotes.length].audio)}"`
                                : '"Selecciona una voz..."'}
                            </Text>
                            <Text fontSize="10px" color="#d0c5b5"
                              textTransform="uppercase" letterSpacing="0.2em">
                              {champion.name} Base VO (ESP)
                            </Text>
                          </Box>

                          {/* Controles */}
                          <Flex align="center" justify="space-between" px={4} mb={6}>
                            <Box as="button" cursor="pointer" color="#d0c5b5" fontSize="20px"
                              sx={{ '&:hover': { color: '#c8aa6e' } }}>⏮</Box>
                            <Box
                              as="button"
                              w="56px" h="56px"
                              bg="#c8aa6e" display="flex" alignItems="center" justifyContent="center"
                              cursor="pointer" fontSize="24px" color="#402d00"
                              sx={{ transition: 'bg 0.2s', '&:hover': { bg: '#f0e6d3' } }}
                              onClick={() => {
                                if (playingIndex !== null && audioRef.current) {
                                  audioRef.current.pause();
                                  audioRef.current = null;
                                  setPlayingIndex(null);
                                }
                              }}
                            >
                              {playingIndex !== null ? '⏸' : '▶'}
                            </Box>
                            <Box as="button" cursor="pointer" color="#d0c5b5" fontSize="20px"
                              sx={{ '&:hover': { color: '#c8aa6e' } }}>⏭</Box>
                          </Flex>

                          {/* Barra de progreso */}
                          <Box>
                            <Box h="3px" w="100%" bg="#15212a" mb={2}>
                              <Box
                                h="100%" bg="#8ecefb"
                                w={playingIndex !== null ? '45%' : '0%'}
                                sx={{
                                  transition: 'width 0.3s ease',
                                  boxShadow: '0 0 8px #8ecefb',
                                }}
                              />
                            </Box>
                            <Flex justify="space-between">
                              <Text fontSize="9px" color="#d0c5b5" letterSpacing="0.2em">0:00</Text>
                              <Text fontSize="9px" color="#d0c5b5" letterSpacing="0.2em">0:12</Text>
                            </Flex>
                          </Box>
                        </Box>
                      </Box>

                      {/* Créditos de voz */}
                      <Box border="1px solid rgba(77,70,58,0.6)" p={6}>
                        <Text fontSize="11px" fontWeight="bold" color="#c8aa6e"
                          textTransform="uppercase" letterSpacing="0.2em"
                          borderBottom="1px solid rgba(200,170,110,0.15)" pb={2} mb={4}>
                          Créditos de Voz
                        </Text>
                        <VStack spacing={3} align="stretch">
                          {[
                            { label: 'Actriz (LATAM)', value: 'Carla Castañeda' },
                            { label: 'Actriz (ESP)',   value: 'Blanca Rada' },
                            { label: 'Lanzamiento',   value: 'Parche 8.15' },
                          ].map(({ label, value }) => (
                            <Flex key={label} justify="space-between">
                              <Text fontSize="11px" color="#d0c5b5">{label}</Text>
                              <Text fontSize="11px" fontWeight="500" color="#d7e4f1">{value}</Text>
                            </Flex>
                          ))}
                        </VStack>
                      </Box>

                      {/* Teaser skin */}
                      <Flex
                        bg="#111d26" p={6} gap={4} align="center"
                        border="1px solid rgba(200,170,110,0.1)"
                      >
                        <Box w="64px" h="64px" flexShrink={0}
                          bg="#1f2b35" border="1px solid rgba(200,170,110,0.2)" overflow="hidden">
                          <Box
                            as="img"
                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_1.jpg`}
                            alt=""
                            w="100%" h="100%"
                            style={{ objectFit: 'cover', objectPosition: 'center top', filter: 'grayscale(1)' }}
                          />
                        </Box>
                        <Box>
                          <Text fontSize="10px" color="#c8aa6e"
                            textTransform="uppercase" letterSpacing="0.2em" mb={1}>
                            Disponible ahora
                          </Text>
                          <Text fontFamily="Georgia, serif" fontStyle="italic"
                            color="#d7e4f1" fontSize="15px">
                            Voces alternativas
                          </Text>
                        </Box>
                      </Flex>

                    </VStack>
                  </Box>

                </SimpleGrid>
              )}

            </MotionBox>
          </AnimatePresence>
        </Box>
      </Box>

      {/* ══ FOOTER ══ */}
      <Box as="footer" w="100%" bg="#040f18" borderTop="1px solid rgba(200,170,110,0.15)"
        py={12} px={8} position="relative" zIndex={1} mt={12}>
        <Flex direction="column" align="center" gap={4} textAlign="center">
          <Text fontFamily="Georgia, serif" fontSize="16px" fontWeight="bold"
            letterSpacing="-0.02em" color="#e5c587" mb={2}>LOLPEDIA</Text>
          <Flex gap={8} flexWrap="wrap" justify="center">
            {['Legal', 'Privacy', 'Contact'].map((l) => (
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
            letterSpacing="0.1em" textTransform="uppercase"
            color="rgba(208,197,181,0.4)" maxW="700px" mt={2}>
            © 2024 LOLpedia. Not endorsed by Riot Games.
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════
// SUB-COMPONENTES
// ═══════════════════════════════════════════

/* ── Skin Card (bento staggered) ── */
function SkinCard({ championId, skin, index, onOpen }: {
  championId: string;
  skin: { num: number; name: string };
  index: number;
  onOpen?: () => void;
}) {
  return (
    <Box
      position="relative"
      h="500px"
      overflow="hidden"
      bg="#1f2b35"
      borderTop="2px solid"
      borderColor={index === 0 ? '#c8aa6e' : 'rgba(200,170,110,0.2)'}
      cursor="pointer"
      transform={index % 2 === 1 ? 'translateY(30px)' : 'none'}
      onClick={onOpen}
      sx={{
        transition: 'all 0.5s ease',
        '&:hover': { boxShadow: '0 0 20px rgba(1,90,132,0.4)' },
        '&:hover img': { transform: 'scale(1.1)' },
        '&:hover .corner-skin': { opacity: 1 },
      }}
    >
      <Box
        as="img"
        src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skin.num}.jpg`}
        alt={skin.name}
        position="absolute" inset={0}
        w="100%" h="100%"
        style={{ objectFit: 'cover', objectPosition: 'center top', transition: 'transform 1s ease' }}
      />
      <Box
        position="absolute" inset={0}
        bgGradient="linear(to-t, rgba(4,15,24,0.9) 0%, transparent 60%)"
      />

      {/* Esquina decorativa */}
      <Box
        className="corner-skin"
        position="absolute" top={0} right={0}
        w="48px" h="48px"
        borderTop="4px solid #c8aa6e"
        borderRight="4px solid #c8aa6e"
        opacity={0}
        sx={{ transition: 'opacity 0.4s ease' }}
      />

      {/* Info */}
      <Box position="absolute" bottom={0} left={0} w="100%" p={6} zIndex={1}>
        <Text fontSize="10px" color={index === 0 ? '#8ecefb' : '#d0c5b5'}
          fontWeight="bold" letterSpacing="0.2em" textTransform="uppercase" mb={1}>
          {skin.num === 0 ? 'Base' : 'Aspecto'}
        </Text>
        <Text fontFamily="Georgia, serif" fontSize="20px" fontStyle="italic" color="#d7e4f1"
          sx={{ transition: 'color 0.3s', '&:hover': { color: '#e5c587' } }}>
          {skin.name === 'default' ? 'Original' : skin.name}
        </Text>
      </Box>
    </Box>
  );
}

/* ── Audio Card ── */
function AudioCard({ quote, getFileName }: { quote: { audio: string }; getFileName: (u: string) => string }) {
  const [playing, setPlaying] = useState(false);
  const handlePlay = () => {
    const audio = new Audio(quote.audio);
    setPlaying(true);
    audio.play().catch(() => {});
    audio.onended = () => setPlaying(false);
  };
  return (
    <Box as="button" onClick={handlePlay} p={3}
      bg={playing ? 'rgba(200,170,110,0.1)' : 'rgba(21,33,42,0.6)'}
      border="1px solid" borderColor={playing ? '#c8aa6e' : 'rgba(200,170,110,0.15)'}
      textAlign="left" cursor="pointer" w="100%"
      display="flex" alignItems="center" gap={2}
      sx={{ transition: 'all 0.15s', '&:hover': { borderColor: 'rgba(200,170,110,0.4)', bg: 'rgba(200,170,110,0.06)' } }}
    >
      <Text fontSize="14px" flexShrink={0}>{playing ? '🔊' : '▶'}</Text>
      <Text fontFamily="'Work Sans', sans-serif" fontSize="11px"
        color="rgba(200,170,110,0.8)" letterSpacing="0.04em"
        noOfLines={2}>{getFileName(quote.audio)}</Text>
    </Box>
  );
}


/* ── Voice Card (nuevo diseño con categorías) ── */
function VoiceCard({ quote, label, isPlaying, isHighlighted, onPlay, getFileName }: {
  quote: { audio: string };
  label: string;
  isPlaying: boolean;
  isHighlighted: boolean;
  onPlay: () => void;
  getFileName: (u: string) => string;
}) {
  const text = getFileName(quote.audio);

  if (isHighlighted) {
    return (
      <Flex
        as="button" onClick={onPlay} w="100%"
        p={6} mb={3}
        bg={isPlaying ? '#1a2d3d' : '#1f2b35'}
        borderLeft="4px solid #8ecefb"
        align="center" justify="space-between"
        cursor="pointer" textAlign="left"
        sx={{
          transition: 'all 0.2s',
          boxShadow: isPlaying ? '0 0 15px rgba(1,90,132,0.4)' : 'none',
          '&:hover': { bg: '#243342' },
        }}
      >
        <Box flex={1} pr={4}>
          <Text fontFamily="Georgia, serif" fontSize="17px" fontStyle="italic"
            color="#d7e4f1" lineHeight={1.5} mb={1} noOfLines={2}>
            "{text}"
          </Text>
          <Text fontSize="9px" color="#d0c5b5" textTransform="uppercase" letterSpacing="0.2em">
            {label}
          </Text>
        </Box>
        <Box flexShrink={0}>
          <Flex w="40px" h="40px" bg={isPlaying ? "#015a82" : "#2a3640"}
            align="center" justify="center">
            <Text fontSize="16px" color="#8ecefb">{isPlaying ? "⏸" : "▶"}</Text>
          </Flex>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex
      as="button" onClick={onPlay} w="100%"
      p={6} mb={2}
      bg={isPlaying ? "rgba(200,170,110,0.08)" : "#111d26"}
      align="center" justify="space-between"
      cursor="pointer" textAlign="left"
      sx={{
        transition: "all 0.2s",
        '&:hover': { bg: '#15212a' },
      }}
    >
      <Box flex={1} pr={4}>
        <Text fontFamily="Georgia, serif" fontSize="17px" fontStyle="italic"
          color="#d7e4f1" lineHeight={1.5} mb={1} noOfLines={2}>
          "{text}"
        </Text>
        <Text fontSize="9px" color="#d0c5b5" textTransform="uppercase" letterSpacing="0.2em">
          {label}
        </Text>
      </Box>
      <Text fontSize="22px" flexShrink={0}
        color={isPlaying ? "#c8aa6e" : "rgba(200,170,110,0.5)"}
        sx={{ transition: "all 0.2s", '&:hover': { color: '#c8aa6e' } }}>
        {isPlaying ? "⏸" : "▶"}
      </Text>
    </Flex>
  );
}

/* ── LolButton ── */
function LolButton({ children, onClick, disabled }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean;
}) {
  return (
    <Box as="button" onClick={onClick} disabled={disabled}
      px={5} py="8px"
      fontFamily="'Work Sans', sans-serif" fontSize="12px"
      letterSpacing="0.1em" textTransform="uppercase"
      color={disabled ? 'rgba(200,170,110,0.3)' : '#c8aa6e'}
      border="1px solid" borderColor={disabled ? 'rgba(200,170,110,0.15)' : 'rgba(200,170,110,0.4)'}
      bg="rgba(8,21,30,0.7)" cursor={disabled ? 'not-allowed' : 'pointer'}
      sx={{ transition: 'all 0.2s', '&:hover': !disabled ? { bg: 'rgba(200,170,110,0.08)', borderColor: '#c8aa6e' } : {} }}
    >
      {children}
    </Box>
  );
}

/* ── Logo SVG (para uso interno si se necesita) ── */
export function LogoSVG() {
  return (
    <svg width="140" height="38" viewBox="0 0 360 96" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="det-gold-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#5c3d11"/>
          <stop offset="30%"  stopColor="#c8aa6e"/>
          <stop offset="50%"  stopColor="#f0e6d3"/>
          <stop offset="70%"  stopColor="#c8aa6e"/>
          <stop offset="100%" stopColor="#5c3d11"/>
        </linearGradient>
        <linearGradient id="det-crystal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#a8f0ff"/>
          <stop offset="40%"  stopColor="#0bc4e3"/>
          <stop offset="100%" stopColor="#045f75"/>
        </linearGradient>
      </defs>
      <polygon points="48,4 68,15 68,40 48,51 28,40 28,15" fill="none" stroke="url(#det-gold-h)" strokeWidth="1.2" opacity="0.9"/>
      <polygon points="48,1 72,14 72,43 48,56 24,43 24,14" fill="none" stroke="#c8aa6e" strokeWidth="0.5" opacity="0.3"/>
      <polygon points="48,6 66,17 66,39 48,50 30,39 30,17" fill="#041820"/>
      <polygon points="48,10 64,19 64,37 48,46 32,37 32,19" fill="url(#det-crystal)"/>
      <polygon points="48,10 32,19 48,28" fill="#7ee8f8" opacity="0.5"/>
      <polygon points="48,10 64,19 48,28" fill="#0bc4e3" opacity="0.3"/>
      <polygon points="32,37 64,37 48,46" fill="#023040" opacity="0.6"/>
      <line x1="48" y1="10" x2="48" y2="46" stroke="#e0faff" strokeWidth="0.7" opacity="0.35"/>
      <polygon points="48,11 56,16 48,22 40,16" fill="#e0faff" opacity="0.65"/>
      <circle cx="45" cy="14" r="2" fill="#ffffff" opacity="0.85"/>
      <polygon points="48,1 50,4 48,7 46,4" fill="#c8aa6e" opacity="0.9"/>
      <polygon points="48,56 50,59 48,62 46,59" fill="#c8aa6e" opacity="0.9"/>
      <text x="82" y="38" fontFamily="Georgia, 'Times New Roman', serif" fontSize="36" fontWeight="700" fill="url(#det-gold-h)" letterSpacing="2">LOLpedia</text>
      <line x1="82" y1="44" x2="340" y2="44" stroke="url(#det-gold-h)" strokeWidth="0.7" opacity="0.4"/>
      <text x="82" y="56" fontFamily="Georgia, 'Times New Roman', serif" fontSize="7" fill="#a38d50" letterSpacing="4">ENCICLOPEDIA DE CAMPEONES</text>
    </svg>
  );
}