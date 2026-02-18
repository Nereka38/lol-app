'use client';

import { useState, useEffect } from 'react';
import { Champion } from '@/app/types/champions';
import { getAllChampions } from './lib/api';
import './styles/fonts.css';
import './styles/loader.css';
import { Box, Flex, Input, Text, Image, Select } from '@chakra-ui/react';
import FlipCard from '@/components/FlipCard';
import { motion } from 'framer-motion';
import { CloseIcon } from '@chakra-ui/icons';

export default function Home() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function fetchChampions() {
      setLoading(true);
      const fetchedChampions = await getAllChampions();
      setChampions(fetchedChampions);
      setLoading(false);
    }
    fetchChampions();
  }, []);

  useEffect(() => {
    setMounted(true);
    function handleResize() {
      setIsDesktop(window.innerWidth > 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const roleTranslations: Record<string, string> = {
    Assassin: "Asesino",
    Fighter: "Luchador",
    Tank: "Tanque",
    Mage: "Mago",
    Marksman: "Tirador",
    Support: "Soporte",
  };

  const filteredChampions = champions.filter((champ) =>
    champ.name.toLowerCase().includes(search.toLowerCase()) &&
    (tagFilter === '' || champ.tags.includes(tagFilter))
  );

  const allTags = Array.from(new Set(champions.flatMap(champ => champ.tags)));

  if (!mounted) return null;

  return (
    <Box
      minH="100vh"
      color="white"
      fontFamily="BeaufortforLOL-Regular"
      style={{
        backgroundImage: "url('/img/background.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundBlendMode: "darken",
      }}
    >
      {/* Header */}
      <Flex
        as="header"
        bg="rgba(24, 38, 31, 0.6)"
        backdropFilter="blur(10px)"
        width="100%"
        py={4}
        align="center"
        justify="space-between"
        mb={8}
        px={4}
        boxShadow="md"
      >
        {/* Logo + Subtítulo */}
        <Flex direction="column" align="center" maxW="180px">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{ width: '100%' }}
          >
            <Image
              src="/img/logo-header.png"
              objectFit="contain"
              alt="LOLpedia logo"
              width="100%"
              height="auto"
            />
          </motion.div>
          <Text
            fontSize="sm"
            color="gray.300"
            textAlign="center"
            mt={1}
            display={{ base: 'none', md: 'block' }} // Oculta en pantallas pequeñas
          >
            Enciclopedia de Campeones
          </Text>
        </Flex>

        {/* Buscador + Reset */}
        <Flex gap={4} align="center">
          <Input
            aria-label="Buscar campeón"
            type="text"
            placeholder="Buscar campeón..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            borderRadius="xl"
            bg="#1e1e1e"
            color="white"
            _placeholder={{ color: 'gray.500' }}
            border="1px solid #C8AA6E"
            _focus={{
              borderColor: '#C8AA6E',
              boxShadow: '0 0 0 1px #C8AA6E',
            }}
            width="200px"
            height="44px"
          />

          {/* Reset Filtros */}
          {(search || tagFilter) && (
            <Box
              as="button"
              onClick={() => {
                setSearch('');
                setTagFilter('');
              }}
              aria-label="Limpiar filtros"
              bg="#C8AA6E"
              borderRadius="full"
              p={2}
              transition="all 0.2s"
              _hover={{ bg: '#A2874D' }}
            >
              <CloseIcon color="black" boxSize={3} />
            </Box>
          )}
        </Flex>
      </Flex>

      {/* Filtro */}
      <Box width="100%" maxWidth="200px" mx="auto" mb={[6, 0]}>
        <Select
          aria-label="Filtrar por rol"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          borderRadius="xl"
          bg="#1e1e1e"
          color="white"
          border="1px solid #C8AA6E"
          _focus={{
            borderColor: '#C8AA6E',
            boxShadow: '0 0 0 1px #C8AA6E',
          }}
          _hover={{
            borderColor: '#C8AA6E',
          }}
          sx={{
            option: {
              backgroundColor: '#1e1e1e',
              color: 'white',
            },
          }}
        >
          <option value="" disabled hidden style={{ backgroundColor: '#1e1e1e', color: 'gray' }}>
            Filtrar por rol
          </option>
          {allTags.map((tag) => (
            <option
              key={tag}
              value={tag}
              style={{
                backgroundColor: '#1e1e1e',
                color: 'white',
              }}
            >
              {roleTranslations[tag] || tag}
            </option>
          ))}
        </Select>
      </Box>

      {/* Loader */}
      {loading ? (
        <Flex justify="center" align="center" minH="60vh">
          <Box className="spinner" aria-label="Loading" />
        </Flex>
      ) : filteredChampions.length === 0 ? (
        <Text textAlign="center" mt={8} fontSize="lg" color="gray.400">
          No se encontraron campeones con esos filtros.
        </Text>
      ) : (
        <Flex wrap="wrap" justify="center" gap={6} p={4}>
          {filteredChampions.map((champ) => (
            <FlipCard key={champ.id} champ={champ} />
          ))}
        </Flex>
      )}
    </Box>
  );
}
