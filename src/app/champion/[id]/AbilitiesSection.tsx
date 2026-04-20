'use client';

import { Box, Text, Flex, SimpleGrid, Image } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { ChampionSpell, ChampionPassive } from '../../types/champions';

const MotionBox = motion(Box);

interface Props {
  passive?: ChampionPassive;
  spells?: ChampionSpell[];
  championName?: string;
}

// Componente para manejar imágenes de habilidades con fallback
function AbilityImage({ src, alt, abilityKey }: { src: string | null; alt: string; abilityKey: string }) {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    console.error('Error loading ability image:', src);
    setHasError(true);
  }, [src]);

  if (!src || hasError) {
    return (
      <Text fontSize="28px" color="#c8aa6e">
        {abilityKey === 'P' ? '✦' : abilityKey}
      </Text>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      w="100%"
      h="100%"
      objectFit="cover"
      fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiMwYTQyMjYiLz48L3N2Zz4="
      onError={handleError}
    />
  );
}

const SPELL_KEYS = ['Q', 'W', 'E', 'R'];

export default function AbilitiesSection({ passive, spells, championName }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Debug: Mostrar en consola qué datos llegan
  console.log('AbilitiesSection - passive:', passive);
  console.log('AbilitiesSection - spells:', spells);

  const allAbilities: Array<{
    type: string;
    key: string;
    name: string;
    spell: ChampionPassive | ChampionSpell | null;
    isPassive: boolean;
  }> = [
    {
      type: 'Pasiva',
      key: 'P',
      name: passive?.name || 'Pasiva',
      spell: passive || null,
      isPassive: true,
    },
    ...(spells || []).map((spell, i) => ({
      type: `Habilidad ${SPELL_KEYS[i]}`,
      key: SPELL_KEYS[i],
      name: spell.name,
      spell,
      isPassive: false,
    })),
  ];

  const selectedAbility = allAbilities[selectedIndex];
  const selectedSpell = selectedAbility.spell;
  const isPassiveSelected = selectedAbility.isPassive;

  // Obtener URL de imagen - ya viene procesada de la API
  const getAbilityImageUrl = (): string | null => {
    if (!selectedSpell?.image?.full) return null;
    // La URL ya viene completa desde la API
    return selectedSpell.image.full;
  };

  // Obtener datos de hechizo si no es pasiva
  const spellData = !isPassiveSelected ? (selectedSpell as ChampionSpell) : null;

  // Obtener el cooldown
  const getCooldown = (): string | null => {
    if (!spellData?.cooldownBurn) return null;
    return spellData.cooldownBurn;
  };

  // Obtener el costo
  const getCost = (): string => {
    if (!spellData) return 'Sin costo';
    if (spellData.costBurn === '0' || !spellData.costBurn) {
      return 'Sin costo';
    }
    // El campo 'resource' ya tiene el formato correcto (ej: "35 Maná", "Sin costo")
    // Mientras que 'costType' puede tener placeholders como "{{ abilityresourcename }}"
    if (spellData.resource && !spellData.resource.includes('{{')) {
      return spellData.resource;
    }
    // Fallback: usar costType solo si no es un placeholder
    const costType = spellData.costType?.includes('{{')
      ? ''
      : spellData.costType;
    return `${spellData.costBurn} ${costType || ''}`.trim();
  };

  // Obtener el alcance
  const getRange = (): string | null => {
    if (!spellData?.rangeBurn) return null;
    return spellData.rangeBurn;
  };

  // Procesar descripción reemplazando placeholders dinámicos
  const processDescription = (text: string | undefined): string => {
    if (!text || !spellData) return text || '';

    let processed = text;

    // PRIMERO: Reemplazar placeholders especiales conocidos
    processed = processed.replace(/\{\{\s*spellmodifierdescriptionappend\s*\}\}/gi, '\n\n');
    processed = processed.replace(/\{\{\s*abilityresourcename\s*\}\}/gi, spellData.costType?.replace(/\{\{\s*\w+\s*\}\}/, '') || 'maná');

    // SEGUNDO: Reemplazar placeholders de efectos como {{ e2 }}, {{ e3 }}, etc.
    // Los effect vienen como: [null, [valores_nivel_1], [valores_nivel_2], ...]
    // Donde e1 = effect[1], e2 = effect[2], etc.
    const effectMatches = processed.match(/\{\{\s*e(\d+)\s*\}\}/gi);
    if (effectMatches && spellData.effect) {
      effectMatches.forEach((match) => {
        const index = parseInt(match.replace(/\{\{\s*e/i, '').replace(/\s*\}\}/, ''), 10);
        const effectValue = spellData.effect?.[index];
        if (effectValue && effectValue.length > 0) {
          // Mostrar rango si hay múltiples valores (ej: "40/65/90/115/140")
          const values = effectValue.filter((v) => v !== 0);
          if (values.length > 0) {
            const displayValue = values.length > 1
              ? values.join('/')
              : values[0].toString();
            processed = processed.replace(match, displayValue);
          }
        } else {
          processed = processed.replace(match, '?');
        }
      });
    }

    // TERCERO: Reemplazar placeholders de vars y otras variables
    // Capturar cualquier cosa dentro de {{ }}
    const varMatches = processed.match(/\{\{\s*[^}]+\s*\}\}/g);
    if (varMatches) {
      varMatches.forEach((match) => {
        const content = match.replace(/\{\{\s*/, '').replace(/\s*\}\}/, '').toLowerCase().trim();

        // Saltar si ya fue procesado (e#)
        if (/^e\d+$/.test(content)) return;

        // Manejar expresiones matemáticas como "movementspeed*100" o "movementspeedduration"
        const mathMatch = content.match(/^(\w+)\s*([\*\/])\s*(\d+)$/);
        if (mathMatch) {
          const [, varName, operator, multiplier] = mathMatch;
          const foundVar = spellData.vars?.find((v) => v.key.toLowerCase() === varName);
          if (foundVar) {
            const baseValue = Array.isArray(foundVar.coeff) ? foundVar.coeff[0] : foundVar.coeff;
            let result: number;
            if (operator === '*') {
              result = baseValue * parseInt(multiplier, 10);
            } else {
              result = baseValue / parseInt(multiplier, 10);
            }
            processed = processed.replace(match, result.toString());
            return;
          }
        }

        // Buscar en vars
        const foundVar = spellData.vars?.find((v) => v.key.toLowerCase() === content);
        if (foundVar) {
          const coeffs = Array.isArray(foundVar.coeff) ? foundVar.coeff : [foundVar.coeff];
          const displayValue = coeffs.length > 1
            ? coeffs.join('/')
            : coeffs[0].toString();
          processed = processed.replace(match, displayValue);
          return;
        }

        // Placeholders específicos comunes
        const costMatch = content.match(/^cost(nl)?$/);
        if (costMatch) {
          processed = processed.replace(match, spellData.costBurn || '?');
          return;
        }

        if (content.includes('cooldown')) {
          processed = processed.replace(match, spellData.cooldownBurn || '?');
          return;
        }

        // Si no se encontró, reemplazar con ?
        processed = processed.replace(match, '?');
      });
    }

    return processed;
  };

  return (
    <Box position="relative">
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
            Habilidades de {championName || 'Campeón'}
          </Text>

          <Flex direction="column" gap={4}>
            {allAbilities.map((ability, index) => {
              const isSelected = selectedIndex === index;
              const imageUrl = ability.spell?.image?.full || null;

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
                    position="relative"
                  >
                    <Box
                      w="100%"
                      h="100%"
                      bg="#040f18"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      overflow="hidden"
                    >
                      <AbilityImage
                        src={imageUrl}
                        alt={ability.name}
                        abilityKey={ability.key}
                      />
                    </Box>
                    {/* Badge con la tecla */}
                    <Box
                      position="absolute"
                      bottom="-4px"
                      right="-4px"
                      bg="#c8aa6e"
                      color="#111d26"
                      fontSize="10px"
                      fontWeight="bold"
                      px="6px"
                      py="2px"
                      borderRadius="2px"
                    >
                      {ability.key}
                    </Box>
                  </Box>

                  {/* Info */}
                  <Box flex="1" minW={0}>
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
                      fontSize="18px"
                      fontStyle="italic"
                      color="#e5c587"
                      lineHeight="1.3"
                      isTruncated
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
            {/* Description Section */}
            <Box
              bg="rgba(31,43,53,0.4)"
              backdropFilter="blur(8px)"
              p={8}
              borderTop="4px solid #c8aa6e"
              boxShadow="0 10px 40px rgba(0,0,0,0.3)"
            >
              {/* Header con nombre */}
              <Box mb={6}>
                <Text
                  fontSize="10px"
                  fontFamily="'Work Sans', sans-serif"
                  color="#8ecefb"
                  letterSpacing="0.15em"
                  textTransform="uppercase"
                  mb={2}
                >
                  {selectedAbility?.type}
                </Text>
                <Text
                  fontFamily="Georgia, serif"
                  fontSize="32px"
                  fontStyle="italic"
                  color="#e5c587"
                  lineHeight="1.2"
                >
                  {selectedAbility?.name}
                </Text>
              </Box>

              {/* Descripción */}
              {selectedSpell?.description && (
                <Box
                  fontSize="15px"
                  color="#d7e4f1"
                  lineHeight="1.8"
                  mb={6}
                  whiteSpace="pre-line"
                  dangerouslySetInnerHTML={{
                    __html: processDescription(selectedSpell.description),
                  }}
                  sx={{
                    '& font': { color: '#c8aa6e', fontWeight: 'bold' },
                    '& b': { color: '#e5c587' },
                    '& strong': { color: '#e5c587' },
                  }}
                />
              )}

              {/* Tooltip adicional si existe */}
              {!isPassiveSelected && spellData?.tooltip && spellData.tooltip !== selectedSpell?.description && (
                <Box
                  mt={4}
                  p={4}
                  bg="rgba(8,21,30,0.6)"
                  borderLeft="3px solid #8ecefb"
                >
                  <Text fontSize="10px" color="#8ecefb" mb={2} textTransform="uppercase" letterSpacing="0.1em">
                    Detalles
                  </Text>
                  <Text
                    fontSize="13px"
                    color="#d0c5b5"
                    whiteSpace="pre-line"
                    dangerouslySetInnerHTML={{
                      __html: processDescription(spellData.tooltip),
                    }}
                  />
                </Box>
              )}

              {/* Stats Grid - Datos reales de la API */}
              {!isPassiveSelected && spellData && (
                <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4} mt={6}>
                  {/* Enfriamiento */}
                  {getCooldown() && (
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
                        fontSize="16px"
                        fontWeight="bold"
                        color="#d7e4f1"
                      >
                        {getCooldown()} s
                      </Text>
                    </Box>
                  )}

                  {/* Costo */}
                  <Box
                    bg="rgba(4,15,24,0.5)"
                    p={4}
                    borderBottom="1px solid rgba(200,170,110,0.2)"
                  >
                    <Text
                      fontSize="10px"
                      color="#8ecefb"
                      letterSpacing="0.15em"
                      textTransform="uppercase"
                      mb={1}
                    >
                      Costo
                    </Text>
                    <Text
                      fontSize="16px"
                      fontWeight="bold"
                      color="#d7e4f1"
                    >
                      {getCost()}
                    </Text>
                  </Box>

                  {/* Alcance */}
                  {getRange() && (
                    <Box
                      bg="rgba(4,15,24,0.5)"
                      p={4}
                      borderBottom="1px solid rgba(200,170,110,0.2)"
                    >
                      <Text
                        fontSize="10px"
                        color="#a855f7"
                        letterSpacing="0.15em"
                        textTransform="uppercase"
                        mb={1}
                      >
                        Alcance
                      </Text>
                      <Text
                        fontSize="16px"
                        fontWeight="bold"
                        color="#d7e4f1"
                      >
                        {getRange()}
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>
              )}

              {/* Información de niveles */}
              {!isPassiveSelected && spellData?.maxrank && (
                <Box mt={6}>
                  <Text
                    fontSize="10px"
                    color="#d0c5b5"
                    letterSpacing="0.15em"
                    textTransform="uppercase"
                    mb={2}
                  >
                    Niveles de habilidad
                  </Text>
                  <Flex gap={2} flexWrap="wrap">
                    {Array.from({ length: spellData.maxrank }).map((_, i) => (
                      <Box
                        key={i}
                        w="32px"
                        h="32px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg="rgba(200,170,110,0.2)"
                        border="1px solid rgba(200,170,110,0.3)"
                        fontSize="12px"
                        color="#c8aa6e"
                        fontWeight="bold"
                      >
                        {i + 1}
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}
            </Box>
          </Flex>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
