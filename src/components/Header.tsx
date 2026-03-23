'use client';

import {
  Flex, Input, Button, Drawer, DrawerBody, DrawerHeader,
  DrawerOverlay, DrawerContent, DrawerCloseButton,
  useDisclosure, IconButton, Box, Text,
} from '@chakra-ui/react';
import { CloseIcon, SearchIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { roleIcons, roleTranslations } from '@/app/utils/roles';
import { useRef } from 'react';

// ── Props ──────────────────────────────────────────────────────
interface HeaderProps {
  variant?: 'default' | 'detail';
  // Solo necesarios en variant="default"
  search?: string;
  setSearch?: (value: string) => void;
  tagFilter?: string;
  setTagFilter?: (value: string) => void;
  allTags?: string[];
}

const ROLE_COLORS: Record<string, string> = {
  Assassin: '#e84057',
  Fighter:  '#e8a030',
  Tank:     '#558ed5',
  Mage:     '#a855f7',
  Marksman: '#22c55e',
  Support:  '#06b6d4',
};

// ── Wrapper visual compartido ─────────────────────────────────────────────────
// Grid 3 columnas: izquierda | centro (logo) | derecha — centra el logo siempre
function HeaderShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Box h="2px" w="100%" bgGradient="linear(to-r, transparent, #c8aa6e, #f0e6d3, #c8aa6e, transparent)" />
      <Box
        as="header"
        display="grid"
        gridTemplateColumns="1fr auto 1fr"
        alignItems="center"
        px={{ base: 4, md: 8 }}
        minH="64px"
        position="relative"
        bg="linear-gradient(180deg, rgba(1,10,19,0.97) 0%, rgba(10,20,40,0.92) 100%)"
        backdropFilter="blur(16px)"
        borderBottom="1px solid"
        borderColor="rgba(200,170,110,0.35)"
        _after={{
          content: '""',
          position: 'absolute',
          bottom: '-4px',
          left: '5%',
          right: '5%',
          height: '1px',
          bg: 'linear-gradient(90deg, transparent, rgba(200,170,110,0.2), transparent)',
        }}
      >
        {children}
      </Box>
      <Box h="1px" w="100%" bgGradient="linear(to-r, transparent, rgba(200,170,110,0.15), transparent)" />
    </>
  );
}

// ── Componente principal ────────────────────────────────────────
export default function Header({
  variant = 'default',
  search = '',
  setSearch,
  tagFilter = '',
  setTagFilter,
  allTags = [],
}: HeaderProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (typeof window === 'undefined') return;
    if (!audioRef.current) {
      audioRef.current = new Audio('/audios/filterSound.mp3');
      audioRef.current.preload = 'auto';
    }
    audioRef.current.play().catch(() => {});
  };

  const handleOpen        = () => { playSound(); onOpen(); };
  const handleClose       = () => { playSound(); onClose(); };
  const handleFilterSelect = (tag: string) => { playSound(); setTagFilter?.(tag); onClose(); };

  // ── Variante: detalle de campeón ──
  // Col 1: volver | Col 2: logo (auto, centrado por grid) | Col 3: vacío
  if (variant === 'detail') {
    return (
      <HeaderShell>
        {/* Col 1 — Volver */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <motion.div whileHover={{ x: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
            <Flex
              align="center"
              gap={2}
              color="rgba(200,170,110,0.6)"
              fontSize="11px"
              letterSpacing="0.12em"
              textTransform="uppercase"
              fontFamily="'BeaufortforLOL-Regular', serif"
              _hover={{ color: '#c8aa6e' }}
              transition="color 0.2s"
            >
              <Text fontSize="14px" lineHeight={1}>←</Text>
              <Text>Campeones</Text>
            </Flex>
          </motion.div>
        </Link>

        {/* Col 2 — Logo centrado */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <LogoSVG />
          </motion.div>
        </Link>

        {/* Col 3 — Vacío (equilibra el grid) */}
        <Box />
      </HeaderShell>
    );
  }

  // ── Variante: home (default) ──
  return (
    <>
      <HeaderShell>
        {/* Col 1 — Logo izquierda */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <LogoSVG />
          </motion.div>
        </Link>

        {/* Col 2 — Vacío (el grid lo omite si no hay nada centrado) */}
        <Box />

        {/* Col 3 — Buscador + Filtro (alineados a la derecha) */}
        <Flex align="center" gap={3} justify="flex-end">
          <Flex
            align="center"
            px={3}
            h="42px"
            w={{ base: "180px", md: "260px" }}
            bg="rgba(1,10,19,0.8)"
            border="1px solid"
            borderColor="rgba(200,170,110,0.45)"
            transition="all 0.2s"
            _focusWithin={{ borderColor: '#c8aa6e', boxShadow: '0 0 12px rgba(200,170,110,0.25)' }}
            sx={{ clipPath: 'polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px)' }}
          >
            <SearchIcon color="rgba(200,170,110,0.6)" boxSize={3.5} mr={2} flexShrink={0} />
            <Input
              aria-label="Buscar campeón"
              type="text"
              placeholder="Buscar campeón..."
              value={search}
              onChange={(e) => setSearch?.(e.target.value)}
              border="none"
              bg="transparent"
              color="#f0e6d3"
              fontFamily="'SpiegelSans', sans-serif"
              fontSize="13px"
              letterSpacing="0.04em"
              _placeholder={{ color: 'rgba(160,155,140,0.6)', fontFamily: 'inherit' }}
              _focus={{ boxShadow: 'none' }}
              p={0}
              h="auto"
            />
            <AnimatePresence>
              {search && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                >
                  <IconButton
                    aria-label="Limpiar búsqueda"
                    icon={<CloseIcon boxSize={2} />}
                    size="xs"
                    variant="ghost"
                    color="rgba(200,170,110,0.7)"
                    _hover={{ color: '#c8aa6e', bg: 'transparent' }}
                    onClick={() => setSearch?.('')}
                    ml={1}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Flex>

          <Button
            onClick={handleOpen}
            aria-expanded={isOpen}
            h="42px"
            px={5}
            fontFamily="'BeaufortforLOL-Regular', serif"
            fontSize="12px"
            letterSpacing="0.1em"
            textTransform="uppercase"
            fontWeight="bold"
            color={tagFilter ? '#010a13' : '#c8aa6e'}
            bg={tagFilter ? 'linear-gradient(180deg, #c8aa6e 0%, #785a28 100%)' : 'rgba(1,10,19,0.8)'}
            border="1px solid"
            borderColor={tagFilter ? '#c8aa6e' : 'rgba(200,170,110,0.45)'}
            _hover={{
              bg: tagFilter ? 'linear-gradient(180deg, #f0e6d3 0%, #c8aa6e 100%)' : 'rgba(200,170,110,0.1)',
              borderColor: '#c8aa6e',
              boxShadow: '0 0 12px rgba(200,170,110,0.3)',
            }}
            _active={{ transform: 'scale(0.97)' }}
            transition="all 0.2s"
            sx={{ clipPath: 'polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px)' }}
          >
            {tagFilter ? `${roleIcons[tagFilter]} ${roleTranslations[tagFilter]}` : '⚔ Filtrar'}
          </Button>
        </Flex>
      </HeaderShell>

      {/* Drawer */}
      <Drawer placement="right" onClose={handleClose} isOpen={isOpen} size="xs">
        <DrawerOverlay backdropFilter="blur(4px)" bg="rgba(1,10,19,0.7)" />
        <DrawerContent bg="linear-gradient(180deg, #0a1428 0%, #010a13 100%)" borderLeft="1px solid rgba(200,170,110,0.35)">
          <Box h="2px" bgGradient="linear(to-r, transparent, #c8aa6e, transparent)" />
          <DrawerCloseButton color="rgba(200,170,110,0.7)" _hover={{ color: '#c8aa6e', bg: 'rgba(200,170,110,0.1)' }} top={4} right={4} />
          <DrawerHeader
            fontFamily="'BeaufortforLOL-Regular', serif"
            fontSize="18px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="#c8aa6e"
            borderBottom="1px solid rgba(200,170,110,0.25)"
            pb={4}
            pt={5}
          >
            Selecciona un rol
          </DrawerHeader>
          <DrawerBody pt={6}>
            <Flex direction="column" gap={2}>
              <RoleButton label="Todos los campeones" icon="⚜" active={tagFilter === ''} color="#c8aa6e" onClick={() => handleFilterSelect('')} />
              {allTags.map((tag) => (
                <RoleButton
                  key={tag}
                  label={roleTranslations[tag] || tag}
                  icon={roleIcons[tag] || ''}
                  active={tagFilter === tag}
                  color={ROLE_COLORS[tag] || '#c8aa6e'}
                  onClick={() => handleFilterSelect(tag)}
                />
              ))}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

// ── Logo SVG compartido ─────────────────────────────────────────
export function LogoSVG() {
  return (
    <svg width="180" height="48" viewBox="0 0 360 96" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="hdr-gold-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#5c3d11"/>
          <stop offset="30%"  stopColor="#c8aa6e"/>
          <stop offset="50%"  stopColor="#f0e6d3"/>
          <stop offset="70%"  stopColor="#c8aa6e"/>
          <stop offset="100%" stopColor="#5c3d11"/>
        </linearGradient>
        <linearGradient id="hdr-crystal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#a8f0ff"/>
          <stop offset="40%"  stopColor="#0bc4e3"/>
          <stop offset="100%" stopColor="#045f75"/>
        </linearGradient>
      </defs>
      <polygon points="48,4 68,15 68,40 48,51 28,40 28,15" fill="none" stroke="url(#hdr-gold-h)" strokeWidth="1.2" opacity="0.9"/>
      <polygon points="48,1 72,14 72,43 48,56 24,43 24,14" fill="none" stroke="#c8aa6e" strokeWidth="0.5" opacity="0.3"/>
      <polygon points="48,6 66,17 66,39 48,50 30,39 30,17" fill="#041820"/>
      <polygon points="48,10 64,19 64,37 48,46 32,37 32,19" fill="url(#hdr-crystal)"/>
      <polygon points="48,10 32,19 48,28" fill="#7ee8f8" opacity="0.5"/>
      <polygon points="48,10 64,19 48,28" fill="#0bc4e3" opacity="0.3"/>
      <polygon points="32,37 64,37 48,46" fill="#023040" opacity="0.6"/>
      <line x1="48" y1="10" x2="48" y2="46" stroke="#e0faff" strokeWidth="0.7" opacity="0.35"/>
      <line x1="32" y1="19" x2="64" y2="37" stroke="#e0faff" strokeWidth="0.5" opacity="0.2"/>
      <line x1="64" y1="19" x2="32" y2="37" stroke="#e0faff" strokeWidth="0.5" opacity="0.2"/>
      <polygon points="48,11 56,16 48,22 40,16" fill="#e0faff" opacity="0.65"/>
      <circle cx="45" cy="14" r="2" fill="#ffffff" opacity="0.85"/>
      <polygon points="48,10 64,19 64,37 48,46 32,37 32,19" fill="none" stroke="#a8f0ff" strokeWidth="0.8" opacity="0.55"/>
      <polygon points="48,1 50,4 48,7 46,4"    fill="#c8aa6e" opacity="0.9"/>
      <polygon points="48,56 50,59 48,62 46,59" fill="#c8aa6e" opacity="0.9"/>
      <text x="82" y="38" fontFamily="Georgia, 'Times New Roman', serif" fontSize="36" fontWeight="700" fill="url(#hdr-gold-h)" letterSpacing="2">LOLpedia</text>
      <line x1="82" y1="44" x2="340" y2="44" stroke="url(#hdr-gold-h)" strokeWidth="0.7" opacity="0.4"/>
      <text x="82" y="56" fontFamily="Georgia, 'Times New Roman', serif" fontSize="7" fill="#a38d50" letterSpacing="4">ENCICLOPEDIA DE CAMPEONES</text>
    </svg>
  );
}

// ── Botón de rol ────────────────────────────────────────────────
function RoleButton({ label, icon, active, color, onClick }: { label: string; icon: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 16px',
        background: active ? `${color}18` : 'rgba(200,170,110,0.04)',
        border: `1px solid ${active ? color : 'rgba(200,170,110,0.2)'}`,
        color: active ? color : '#a09b8c',
        fontFamily: "'BeaufortforLOL-Regular', serif",
        fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase',
        cursor: 'pointer',
        clipPath: 'polygon(5px 0%, calc(100% - 5px) 0%, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0% calc(100% - 5px), 0% 5px)',
        transition: 'all 0.15s ease',
        boxShadow: active ? `0 0 10px ${color}30` : 'none',
        width: '100%', textAlign: 'left',
      }}
    >
      <span style={{ fontSize: '16px' }}>{icon}</span>
      {label}
      {active && <span style={{ marginLeft: 'auto', color, fontSize: '12px' }}>◆</span>}
    </motion.button>
  );
}