'use client';

import { Box, Text, Flex, SimpleGrid, Image } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const MotionBox = motion(Box);

interface Spell {
  id: string;
  name: string;
  description: string;
  image: { full: string };
}

interface Passive {
  name: string;
  description: string;
  image?: { full: string };
}

interface Props {
  passive: Passive;
  spells: Spell[];
}

const SPELL_KEYS = ['Q', 'W', 'E', 'R'];

// Iconos para cada habilidad (usando emojis/iconos Material)
const ABILITY_ICONS = ['token', 'navigation', 'cloud', 'change_history', 'bolt'];

export default function AbilitiesSection({ passive, spells }: Props) {
  // Estado para la habilidad seleccionada (0 = pasiva, 1-4 = Q,W,E,R)
  const [selectedIndex, setSelectedIndex] = useState(1); // Por defecto Q

  // Preparar lista de todas las habilidades
  const allAbilities = [
    { type: 'Pasiva', key: 'Pasiva', name: passive?.name, spell: passive },
    ...(spells ?? []).map((spell, i) => ({
      type: `Habilidad ${SPELL_KEYS[i]}`,
      key: SPELL_KEYS[i],
      name: spell.name,
      spell,
    })),
  ];

  const selectedAbility = allAbilities[selectedIndex];

  return (
    <Box position="relative">
      {/* Grid principal */}
      <SimpleGrid columns={{ base: 1, lg: 12 }} gap={8}>
        {/* Left: Ability Selection */}
        <Box gridColumn={{ base: '1', lg: 'span 5' }}>
          <Text
            fontFamily="Georgia, serif"
            fontSize="28px"
            fontStyle="italic"
            color="#d7e4f1"
            mb={8}
          >
            Artes Marciales de Kinkou
          </Text>

          <Flex direction="column" gap={4}>
            {allAbilities.map((ability, index) => {
              const isSelected = selectedIndex === index;
              const isPassive = index === 0;
              const iconIndex = index;

              return (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  cursor="pointer"
                  onClick={() => setSelectedIndex(index)}
                  bg={isSelected ? 'rgba(31,43,53,0.8)' : 'rgba(21,33,42,0.6)'}
                  backdropFilter="blur(4px)"
                  p={4}
                  display="flex"
                  alignItems="center"
                  gap={6}
                  borderLeft="4px solid"
                  borderColor={isSelected ? '#8ecefb' : 'transparent'}
                  boxShadow={isSelected ? '0 0 10px rgba(142,206,251,0.15)' : 'none'}
                  transition="all 0.2s ease"
                  _hover={{
                    bg: 'rgba(47,58,69,0.8)',
                    borderColor: isSelected ? '#8ecefb' : 'rgba(200,170,110,0.3)',
                  }}
                >
                  {/* Icono */}
                  <Box
                    w="64px"
                    h="64px"
                    flexShrink={0}
                    border="2px solid #c8aa6e"
                    p="2px"
                    bg="#0a1428"
                  >
                    <Box
                      w="100%"
                      h="100%"
                      bg="#040f18"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {isPassive ? (
                        <Text fontSize="28px" color="#c8aa6e">
                          ✦
                        </Text>
                      ) : (
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.7.1/img/spell/${(ability.spell as Spell).image?.full}`}
                          alt={ability.name}
                          w="100%"
                          h="100%"
                          objectFit="cover"
                          fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiMwYTQyMjYiLz48L3N2Zz4="
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Info */}
                  <Box>
                    <Text
                      fontSize="10px"
                      fontFamily="'Work Sans', sans-serif"
                      color="#8ecefb"
                      letterSpacing="0.15em"
                      textTransform="uppercase"
                      mb={1}
                    >
                      {ability.type}
                    </Text>
                    <Text
                      fontFamily="Georgia, serif"
                      fontSize="20px"
                      fontStyle="italic"
                      color="#e5c587"
                    >
                      {ability.name}
                    </Text>
                  </Box>
                </MotionBox>
              );
            })}
          </Flex>
        </Box>

        {/* Right: Ability Detail */}
        <Box gridColumn={{ base: '1', lg: 'span 7' }}>
          <Flex direction="column" gap={8}>
            {/* Video/GIF Placeholder */}
            <Box
              position="relative"
              w="100%"
              aspectRatio="16/9"
              bg="#040f18"
              border="1px solid rgba(200,170,110,0.3)"
              overflow="hidden"
              boxShadow="0 0 30px rgba(1,90,130,0.15)"
            >
              {/* Botón Play */}
              <Box
                position="absolute"
                inset={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex={10}
              >
                <Box
                  w="80px"
                  h="80px"
                  bg="rgba(200,170,110,0.2)"
                  backdropFilter="blur(8px)"
                  border="1px solid #c8aa6e"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  transition="transform 0.3s"
                  _hover={{ transform: 'scale(1.1)' }}
                >
                  <Text fontSize="32px" color="#c8aa6e">
                    ▶
                  </Text>
                </Box>
              </Box>

              {/* Imagen de fondo (usando el icono de habilidad grande) */}
              <Image
                src={
                  selectedIndex === 0
                    ? `https://ddragon.leagueoflegends.com/cdn/14.7.1/img/passive/${passive?.image?.full || 'passive.png'}`
                    : `https://ddragon.leagueoflegends.com/cdn/14.7.1/img/spell/${(selectedAbility?.spell as Spell)?.image?.full}`
                }
                alt={selectedAbility?.name}
                w="100%"
                h="100%"
                objectFit="contain"
                p={8}
                opacity={0.3}
                sx={{
                  filter: 'grayscale(50%)',
                }}
              />

              {/* Decorative Corners */}
              <Box
                position="absolute"
                top={0}
                right={0}
                w="16"
                h="16"
                borderTop="2px solid rgba(200,170,110,0.6)"
                borderRight="2px solid rgba(200,170,110,0.6)"
                m={2}
              />
              <Box
                position="absolute"
                bottom={0}
                left={0}
                w="16"
                h="16"
                borderBottom="2px solid rgba(200,170,110,0.6)"
                borderLeft="2px solid rgba(200,170,110,0.6)"
                m={2}
              />
            </Box>

            {/* Description Section */}
            <Box
              bg="rgba(31,43,53,0.4)"
              backdropFilter="blur(8px)"
              p={8}
              borderTop="4px solid #c8aa6e"
              boxShadow="0 10px 40px rgba(0,0,0,0.3)"
            >
              {/* Header con nombre y consumo */}
              <Flex justify="space-between" align="flex-start" mb={6}>
                <Text
                  fontFamily="Georgia, serif"
                  fontSize="36px"
                  fontStyle="italic"
                  color="#e5c587"
                >
                  {selectedAbility?.name}
                </Text>
                {selectedIndex > 0 && (
                  <Box textAlign="right">
                    <Text
                      fontSize="10px"
                      fontFamily="'Work Sans', sans-serif"
                      color="#8ecefb"
                      letterSpacing="0.15em"
                      textTransform="uppercase"
                    >
                      Consumo
                    </Text>
                    <Text
                      fontSize="16px"
                      fontWeight="bold"
                      color="#d7e4f1"
                    >
                      {selectedIndex === 0 ? 'Ninguno' : `${selectedIndex * 30} Energía`}
                    </Text>
                  </Box>
                )}
              </Flex>

              {/* Descripción */}
              <Text
                fontFamily="Georgia, serif"
                fontSize="18px"
                fontStyle="italic"
                color="#bbc8d5"
                lineHeight="1.7"
                mb={6}
                dangerouslySetInnerHTML={{
                  __html: selectedAbility?.spell?.description || '',
                }}
              />

              {/* Stats Grid (Cooldown y Alcance) */}
              {selectedIndex > 0 && (
                <SimpleGrid columns={2} gap={4} mb={6}>
                  <Box
                    bg="rgba(4,15,24,0.5)"
                    p={4}
                    borderBottom="1px solid rgba(200,170,110,0.2)"
                  >
                    <Text
                      fontSize="10px"
                      color="#c8aa6e"
                      letterSpacing="0.15em"
                      textTransform="uppercase"
                      mb={1}
                    >
                      Enfriamiento
                    </Text>
                    <Text
                      fontSize="14px"
                      fontWeight="bold"
                      color="#d7e4f1"
                    >
                      {selectedIndex === 1 ? '1.5' : selectedIndex === 2 ? '20' : selectedIndex === 3 ? '16' : '120'} seg.
                    </Text>
                  </Box>
                  <Box
                    bg="rgba(4,15,24,0.5)"
                    p={4}
                    borderBottom="1px solid rgba(200,170,110,0.2)"
                  >
                    <Text
                      fontSize="10px"
                      color="#c8aa6e"
                      letterSpacing="0.15em"
                      textTransform="uppercase"
                      mb={1}
                    >
                      Alcance
                    </Text>
                    <Text
                      fontSize="14px"
                      fontWeight="bold"
                      color="#d7e4f1"
                    >
                      {selectedIndex === 1 ? '600' : selectedIndex === 2 ? '250' : selectedIndex === 3 ? '800' : '2500'} Unidades
                    </Text>
                  </Box>
                </SimpleGrid>
              )}

              {/* Botones */}
              <Flex gap={4}>
                <Box
                  as="button"
                  bg="#c8aa6e"
                  color="#402d00"
                  px={8}
                  py={3}
                  fontWeight="bold"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  fontSize="11px"
                  display="flex"
                  alignItems="center"
                  gap={2}
                  transition="all 0.2s"
                  _hover={{ filter: 'brightness(1.1)' }}
                >
                  <Text>✦</Text>
                  <Text>Escalado Detallado</Text>
                </Box>
                <Box
                  as="button"
                  border="1px solid rgba(153,143,129,0.3)"
                  px={8}
                  py={3}
                  fontFamily="'Work Sans', sans-serif"
                  fontSize="11px"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  color="#d0c5b5"
                  transition="all 0.2s"
                  _hover={{ bg: 'rgba(47,58,69,0.8)' }}
                >
                  Ver Combos
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* Stats Section - Champion Attributes */}
      <Box mt={16} pt={8}>
        <Flex align="center" gap={4} mb={12}>
          <Box h="1px" bg="rgba(200,170,110,0.3)" flex={1} />
          <Text
            fontFamily="Georgia, serif"
            fontSize="24px"
            fontStyle="italic"
            color="#c8aa6e"
          >
            ATRIBUTOS DE ASESINA
          </Text>
          <Box h="1px" bg="rgba(200,170,110,0.3)" flex={1} />
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 4 }} gap={6}>
          {[
            { icon: '⚔', label: 'Daño', value: 90, color: '#c8aa6e' },
            { icon: '🛡', label: 'Resistencia', value: 30, color: '#8ecefb' },
            { icon: '✦', label: 'Utilidad', value: 45, color: '#a855f7' },
            { icon: '⚡', label: 'Dificultad', value: 100, color: '#e84057' },
          ].map((attr, index) => (
            <Box
              key={index}
              bg="rgba(31,43,53,0.6)"
              backdropFilter="blur(4px)"
              p={6}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              border={index === 3 ? '2px solid rgba(200,170,110,0.4)' : 'none'}
            >
              <Text fontSize="32px" mb={4}>
                {attr.icon}
              </Text>
              <Text
                fontSize="10px"
                fontFamily="'Work Sans', sans-serif"
                color="#d0c5b5"
                letterSpacing="0.15em"
                textTransform="uppercase"
                mb={3}
              >
                {attr.label}
              </Text>
              <Box w="100%" h="6px" bg="#08151e" overflow="hidden">
                <Box
                  w={`${attr.value}%`}
                  h="100%"
                  bg={attr.color}
                  boxShadow={attr.value === 100 ? '0 0 10px #c8aa6e' : 'none'}
                />
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
