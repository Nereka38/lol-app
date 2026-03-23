'use client';

import {
  Box,
  Flex,
  Text,
  Image,
  SimpleGrid,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Champion } from '@/app/types/champions';

interface Props {
  champion: Champion;
}

const sections = ['historia', 'habilidades', 'estadisticas', 'aspectos', 'voces'];

export default function ChampionDetailClient({ champion }: Props) {
  const [activeSection, setActiveSection] = useState('aspectos');

  return (
    <Box bg="#08151e" color="#d7e4f1" minH="100vh">

      {/* ───────── NAVBAR ───────── */}
      <Flex
        position="fixed"
        top={0}
        w="100%"
        zIndex={50}
        px={6}
        py={4}
        justify="space-between"
        bg="linear-gradient(to bottom, #111d26, transparent)"
      >
        <Text fontSize="2xl" fontWeight="bold" color="#e5c587">
          LOLPEDIA
        </Text>
      </Flex>

      <Box pt="100px">

        {/* ───────── HEADER (SIEMPRE IGUAL) ───────── */}
        <Box maxW="1200px" mx="auto" px={6} mb={12}>
          <Box borderLeft="4px solid #c8aa6e" pl={6}>
            <Text fontSize="xs" letterSpacing="0.3em" color="#8ecefb" mb={2}>
              {(champion.tags ?? []).join(' / ')}
            </Text>

            <Text
              fontSize={{ base: '48px', md: '80px' }}
              fontWeight="black"
              fontStyle="italic"
            >
              {champion.name}
            </Text>
          </Box>

          {/* Tags */}
          <Flex gap={2} mt={4}>
            {(champion.tags ?? []).map((tag) => (
              <Box
                key={tag}
                px={4}
                py={1}
                border="1px solid rgba(200,170,110,0.2)"
                bg="#1f2b35"
                fontSize="10px"
                letterSpacing="0.1em"
              >
                {tag}
              </Box>
            ))}
          </Flex>
        </Box>

        {/* ───────── TABS (SIEMPRE IGUAL) ───────── */}
        <Flex
          wrap="wrap"
          gap={1}
          px={6}
          maxW="1200px"
          mx="auto"
          mb={12}
          bg="#111d26"
          p={1}
          borderBottom="1px solid rgba(200,170,110,0.2)"
        >
          {sections.map((sec) => (
            <Box
              key={sec}
              px={6}
              py={3}
              cursor="pointer"
              bg={activeSection === sec ? '#c8aa6e' : 'transparent'}
              color={activeSection === sec ? '#08151e' : '#d0c5b5'}
              fontSize="12px"
              letterSpacing="0.15em"
              textTransform="uppercase"
              onClick={() => setActiveSection(sec)}
            >
              {sec}
            </Box>
          ))}
        </Flex>

        {/* ───────── CONTENIDO DINÁMICO ───────── */}
        <Box maxW="1200px" mx="auto" px={6}>

          {/* ───────── HISTORIA ───────── */}
          {activeSection === 'historia' && (
            <Flex direction={{ base: 'column', lg: 'row' }} gap={16}>
              {/* ───────── SIDEBAR ───────── */}
              <VStack spacing={12} flex="1" order={{ base: 2, lg: 1 }} align="stretch">
                <Box p={8} bg="#15212a" borderTop="1px solid #c8aa6e" position="relative">
                  <Box position="absolute" top={0} right={0} w={12} h={12} borderTop="1px solid #e5c587" borderRight="1px solid #e5c587" opacity={0.4} />
                  <Text fontFamily="Newsreader" fontSize="xl" color="#e5c587" mb={6}>
                    Archive Metadata
                  </Text>
                  <VStack spacing={4} align="stretch">
                    <Flex justify="space-between" borderBottom="1px solid #998f81" pb={2}>
                      <Text fontSize="10px" textTransform="uppercase" color="#d0c5b5">Role</Text>
                      <Text fontSize="xs" fontWeight="bold" color="#8ecefb">{champion.tags?.[0] ?? 'Unknown'}</Text>
                    </Flex>
                    <Flex justify="space-between" borderBottom="1px solid #998f81" pb={2}>
                      <Text fontSize="10px" textTransform="uppercase" color="#d0c5b5">Difficulty</Text>
                      <Text fontSize="xs" fontWeight="bold" color="#8ecefb">{champion.info?.difficulty ?? 'Moderate'}</Text>
                    </Flex>
                    <Flex justify="space-between" borderBottom="1px solid #998f81" pb={2}>
                      <Text fontSize="10px" textTransform="uppercase" color="#d0c5b5">Legacy</Text>
                      <Text fontSize="xs" fontWeight="bold" color="#8ecefb">{champion.legacy ?? 'N/A'}</Text>
                    </Flex>
                  </VStack>
                </Box>

                {/* Quote */}
                <Box position="relative" p={1} bgGradient="linear(to-br, #e5c58733, transparent)">
                  <Box bg="#040f18" p={8}>
                    <Text fontFamily="Newsreader" fontSize="xl" color="#e5c587" mb={2} italic>
                      "{champion.quote ?? 'No quote available'}"
                    </Text>
                    <Text fontSize="xs" color="#d0c5b5" letterSpacing="wider">
                      — Archivist Note
                    </Text>
                  </Box>
                </Box>
              </VStack>

              {/* ───────── MAIN LORE ───────── */}
              <VStack spacing={8} flex="2" order={{ base: 1, lg: 2 }} align="stretch">
                {/* Title */}
                <Box position="relative">
                  <Text
                    position="absolute"
                    left={-4}
                    top={0}
                    fontSize="6xl"
                    fontFamily="Newsreader"
                    color="#e5c58733"
                    userSelect="none"
                  >
                    “
                  </Text>
                  <Text fontFamily="Newsreader" fontSize={{ base: '4xl', lg: '5xl' }} color="#d7e4f1" mb={12} italic>
                    {champion.loreTitle ?? 'Historia'}
                  </Text>
                </Box>

                {/* Lore Paragraphs */}
                <VStack spacing={6} color="#bbc8d5" lineHeight="tall" fontFamily="Work Sans" fontSize="lg">
                  {champion.lore?.split('\n').map((paragraph, i) => (
                    <Text key={i}>{paragraph}</Text>
                  ))}
                </VStack>

                {/* Images */}
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} pt={12}>
                  {champion.images?.map((img, i) => (
                    <Image
                      key={i}
                      src={img.src}
                      alt={img.alt}
                      w="100%"
                      h="64"
                      objectFit="cover"
                      filter="grayscale(100%)"
                      _hover={{ filter: 'grayscale(0%)' }}
                      border="1px solid #998f81"
                      transition="all 0.5s"
                    />
                  ))}
                </SimpleGrid>
              </VStack>
            </Flex>
          )}

          {/* ───────── ASPECTOS (ESTILO HTML PRO) ───────── */}
          {activeSection === 'aspectos' && (
            <>
              {/* Header */}
              <Flex justify="space-between" align="center" mb={8}>
                <Text fontSize="2xl" fontStyle="italic" color="#e2c384">
                  Galería de Aspectos
                </Text>
              </Flex>

              {/* Grid tipo bento */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
                {(champion.skins ?? []).map((skin, i) => (
                  <SkinCard
                    key={skin.num}
                    championId={champion.id}
                    skin={skin}
                    index={i}
                  />
                ))}
              </SimpleGrid>
            </>
          )}
        </Box>
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

/* ───────── SKIN CARD ───────── */

function SkinCard({ championId, skin, index }: any) {
  return (
    <Box
      position="relative"
      h="500px"
      overflow="hidden"
      bg="#1f2b35"
      borderTop="2px solid #c8aa6e"
      cursor="pointer"
      transform={index % 2 ? 'translateY(30px)' : 'none'}
      _hover={{ boxShadow: '0 0 20px rgba(1,90,132,0.5)' }}
      transition="all 0.4s"
    >
      <Image
        src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skin.num}.jpg`}
        w="100%"
        h="100%"
        objectFit="cover"
        transition="transform 1s"
        _hover={{ transform: 'scale(1.1)' }}
      />

      <Box
        position="absolute"
        bottom={0}
        w="100%"
        p={4}
        bg="linear-gradient(to top, rgba(4,15,24,0.9), transparent)"
      >
        <Text fontSize="xs" color="#8ecefb">
          {skin.num === 0 ? 'Base' : 'Aspecto'}
        </Text>

        <Text fontSize="lg" fontStyle="italic">
          {skin.name === 'default' ? 'Original' : skin.name}
        </Text>
      </Box>
    </Box>
  );
}