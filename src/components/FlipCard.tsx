'use client';

import { Box, Text } from '@chakra-ui/react';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Champion } from '@/app/types/champions';
import Link from 'next/link';
import Image from 'next/image';

const MotionBox = motion(Box);

const ROLE_COLORS: Record<string, string> = {
  Assassin: '#e84057',
  Fighter:  '#e8a030',
  Tank:     '#558ed5',
  Mage:     '#a855f7',
  Marksman: '#22c55e',
  Support:  '#06b6d4',
};

const ROLE_LABELS: Record<string, string> = {
  Assassin: 'Asesino',
  Fighter:  'Luchador',
  Tank:     'Tanque',
  Mage:     'Mago',
  Marksman: 'Tirador',
  Support:  'Soporte',
};

const ROLE_ICONS: Record<string, string> = {
  Assassin: '🗡',
  Fighter:  '⚔',
  Tank:     '🛡',
  Mage:     '✦',
  Marksman: '🏹',
  Support:  '✚',
};

export default function FlipCard({ champ }: { champ: Champion }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, margin: '0px 0px -60px 0px' });

  const primaryTag = champ.tags?.[0] ?? '';
  const accentColor = ROLE_COLORS[primaryTag] ?? '#c8aa6e';

  return (
    <Link href={`/champion/${champ.id}`} style={{ textDecoration: 'none' }}>
      <MotionBox
        ref={ref}
        width="220px"
        height="340px"
        position="relative"
        style={{ perspective: '1000px' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 40 }}
        initial={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        cursor="pointer"
      >
        {/* ── Glow ambiental de rol ── */}
        <Box
          position="absolute"
          inset="-2px"
          borderRadius="2px"
          opacity={hovered ? 0.6 : 0}
          transition="opacity 0.3s ease"
          boxShadow={`0 0 30px ${accentColor}, 0 0 60px ${accentColor}50`}
          pointerEvents="none"
          zIndex={0}
        />

        {/* ── Contenedor flip ── */}
        <MotionBox
          animate={{ rotateY: hovered ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            position: 'relative',
          }}
        >
          {/* ══════════════ FRENTE ══════════════ */}
          <Box
            position="absolute"
            inset={0}
            sx={{ backfaceVisibility: 'hidden' }}
            overflow="hidden"
            bg="#010a13"
            border="1px solid"
            borderColor="rgba(200,170,110,0.4)"
            _after={{
              content: '""',
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(180deg, transparent 45%, ${accentColor}15 80%, ${accentColor}35 100%)`,
              pointerEvents: 'none',
              zIndex: 2,
              transition: 'opacity 0.3s',
              opacity: hovered ? 1 : 0.6,
            }}
          >
            {/* Imagen del campeón */}
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`}
              alt={champ.name}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
              sizes="220px"
            />

            {/* Esquinas ornamentales */}
            <CornerAccents color={accentColor} visible={hovered} />

            {/* Nombre en la parte inferior */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              p={3}
              zIndex={3}
              bgGradient="linear(to-t, rgba(1,10,19,0.95), transparent)"
            >
              <Text
                fontFamily="'BeaufortforLOL-Regular', serif"
                fontSize="16px"
                fontWeight="bold"
                color="#f0e6d3"
                letterSpacing="0.06em"
                textTransform="uppercase"
                textShadow="0 2px 8px rgba(0,0,0,0.9)"
                lineHeight={1.2}
                noOfLines={1}
              >
                {champ.name}
              </Text>
              <Text
                fontFamily="'SpiegelSans', sans-serif"
                fontSize="10px"
                color={accentColor}
                letterSpacing="0.1em"
                textTransform="uppercase"
                opacity={0.9}
                mt="2px"
              >
                {ROLE_LABELS[primaryTag] || primaryTag}
              </Text>
            </Box>
          </Box>

          {/* ══════════════ REVERSO ══════════════ */}
          <Box
            position="absolute"
            inset={0}
            sx={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            bg="linear-gradient(160deg, #0a1428 0%, #010a13 100%)"
            border="1px solid"
            borderColor={accentColor}
            overflow="hidden"
          >
            {/* Imagen oscurecida de fondo */}
            <Box position="absolute" inset={0} opacity={0.12}>
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`}
                alt=""
                fill
                style={{ objectFit: 'cover', objectPosition: 'center top', filter: 'blur(2px)' }}
                sizes="220px"
                aria-hidden
              />
            </Box>

            {/* Patrón hextech de fondo */}
            <Box
              position="absolute"
              inset={0}
              opacity={0.04}
              backgroundImage={`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 2L38 11v18L20 38 2 29V11z' fill='none' stroke='%23c8aa6e' stroke-width='1'/%3E%3C/svg%3E")`}
              backgroundSize="40px 40px"
            />

            <CornerAccents color={accentColor} visible />

            {/* Contenido del reverso */}
            <Box
              position="relative"
              zIndex={2}
              p={4}
              h="100%"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              textAlign="center"
            >
              {/* Icono de rol */}
              <Box
                w="48px"
                h="48px"
                borderRadius="50%"
                border="2px solid"
                borderColor={accentColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="22px"
                mb={3}
                boxShadow={`0 0 16px ${accentColor}50`}
                bg="rgba(1,10,19,0.8)"
              >
                {ROLE_ICONS[primaryTag] || '⚜'}
              </Box>

              <Text
                fontFamily="'BeaufortforLOL-Regular', serif"
                fontSize="18px"
                fontWeight="bold"
                color="#f0e6d3"
                letterSpacing="0.06em"
                textTransform="uppercase"
                mb={1}
              >
                {champ.name}
              </Text>

              <Text
                fontFamily="'SpiegelSans', sans-serif"
                fontSize="11px"
                fontStyle="italic"
                color="rgba(160,155,140,0.9)"
                mb={4}
                px={2}
              >
                {champ.title.charAt(0).toUpperCase() + champ.title.slice(1)}
              </Text>

              {/* Divisor */}
              <Box w="60%" h="1px" bg={`linear-gradient(90deg, transparent, ${accentColor}, transparent)`} mb={4} />

              {/* Tags */}
              <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
                {(champ.tags ?? []).map((tag) => (
                  <Box
                    key={tag}
                    px={3}
                    py={1}
                    fontSize="10px"
                    fontFamily="'BeaufortforLOL-Regular', serif"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color={ROLE_COLORS[tag] ?? '#c8aa6e'}
                    border="1px solid"
                    borderColor={`${ROLE_COLORS[tag] ?? '#c8aa6e'}60`}
                    bg={`${ROLE_COLORS[tag] ?? '#c8aa6e'}10`}
                    sx={{
                      clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)',
                    }}
                  >
                    {ROLE_ICONS[tag]} {ROLE_LABELS[tag] || tag}
                  </Box>
                ))}
              </Box>

              {/* CTA */}
              <Box
                mt={4}
                px={4}
                py="6px"
                fontSize="10px"
                fontFamily="'BeaufortforLOL-Regular', serif"
                letterSpacing="0.15em"
                textTransform="uppercase"
                color={accentColor}
                border="1px solid"
                borderColor={`${accentColor}60`}
                sx={{
                  clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)',
                }}
              >
                Ver detalle →
              </Box>
            </Box>
          </Box>
        </MotionBox>
      </MotionBox>
    </Link>
  );
}

/* ── Esquinas ornamentales ── */
function CornerAccents({ color, visible }: { color: string; visible: boolean }) {
  const size = '10px';
  const width = '2px';
  const base: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    borderColor: color,
    borderStyle: 'solid',
    opacity: visible ? 1 : 0.4,
    transition: 'opacity 0.3s',
    zIndex: 10,
  };
  return (
    <>
      <Box style={{ ...base, top: 4, left: 4, borderWidth: `${width} 0 0 ${width}` } as any} />
      <Box style={{ ...base, top: 4, right: 4, borderWidth: `${width} ${width} 0 0` } as any} />
      <Box style={{ ...base, bottom: 4, left: 4, borderWidth: `0 0 ${width} ${width}` } as any} />
      <Box style={{ ...base, bottom: 4, right: 4, borderWidth: `0 ${width} ${width} 0` } as any} />
    </>
  );
}
