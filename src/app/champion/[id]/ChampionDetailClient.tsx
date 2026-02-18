'use client';

import { Box, Button, Flex, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, SimpleGrid, Text, useDisclosure } from '@chakra-ui/react';
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChampionStats } from './ChampionStats';
import { Champion } from '@/app/types/champions';

interface Spell {
    id: string;
    name: string;
    description: string;
    image: { full: string };
}

interface Skin {
    num: number;
    name: string;
}

interface Quote {
    text: string;
    audio: string;
}

interface ChampionDetailClientProps {
    champion: Champion;
    quotes: Quote[];
}

export default function ChampionDetailClient({ champion, quotes }: ChampionDetailClientProps) {
    const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleSkinClick = (skin: Skin) => {
        setSelectedSkin(skin);
        onOpen();
    };

    const [skinIndex, setSkinIndex] = useState(0);

    const nextSkin = () => {
        if (!champion.skins || champion.skins.length === 0) return; // protección
        setSkinIndex((prev) => (prev + 1) % champion.skins.length);
    };

    const prevSkin = () => {
        if (!champion.skins || champion.skins.length === 0) return;
        setSkinIndex((prev) => (prev - 1 + champion.skins.length) % champion.skins.length);
    };

    // Función para extraer el nombre del archivo antes de la extensión .ogg
    const getFileName = (url: string) => {
        const regex = /([^/]+)(?=\.ogg)/;
        const match = url.match(regex);
        return match ? match[0] : '';
    };


    const MotionBox = motion(Box);

    const itemsPerPage = 20;
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = Math.ceil(quotes.length / itemsPerPage);

    const currentQuotes = quotes.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

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
                    <MotionBox
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
                    </MotionBox>
                    <Text
                        fontSize="sm"
                        color="gray.300"
                        textAlign="center"
                        mt={1}
                        display={{ base: 'none', md: 'block' }}
                    >
                        Enciclopedia de Campeones
                    </Text>
                </Flex>
            </Flex>

            {/* Contenido principal */}
            <Box maxW="900px" mx="auto" p={6}>
                <Text as="h1" fontSize="4xl" fontWeight="bold" textAlign="center" color="#C89B3C" textShadow="3px 3px 6px rgba(0, 0, 0, 0.8)" mb={2} fontFamily="BeaufortforLOL-Regular">
                    {champion.name}
                </Text>
                <Text textAlign="center" fontStyle="italic" mb={6} fontSize="xl" color="gray.300">
                    {champion.title.charAt(0).toUpperCase() + champion.title.slice(1)}
                </Text>

                {/* Imagen principal */}
                <Box position="relative"
                    width="300px"
                    height="400px"
                    mx="auto"
                    mb={6}>
                    <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`}
                        alt={champion.name}
                        position="absolute"
                        objectFit="cover"
                        top="6%"
                        left="11%"
                        width="78%"
                        height="87%"
                        borderRadius="58px"
                    />
                    <Image
                        src="/img/card-border.png"
                        alt="Borde"
                        position="absolute"
                        top={0}
                        left={0}
                        width="100%"
                        height="100%"
                        pointerEvents="none"
                        zIndex={2}
                    />
                </Box>

                {/* Acordeón de voces, historia, stats, pasiva, habilidades, skins */}
                <Accordion allowMultiple defaultIndex={[0]} mb={4}>
                    {/* Voces */}
                    <AccordionItem>
                        <AccordionButton>
                            <Text flex="1" textAlign="left" fontSize="xl" fontWeight="semibold" color="#C89B3C" textShadow="3px 3px 6px rgba(0, 0, 0, 0.8)">
                                Voces
                            </Text>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                                {currentQuotes.map((quote, index) => (
                                    <Box key={index} bg="#22344a" p={4} borderRadius="lg" boxShadow="md">
                                        <a href={quote.audio} target="_blank" rel="noopener noreferrer" style={{ color: "#C89B3C" }}>
                                            ▶️ {getFileName(quote.audio)}
                                        </a>
                                    </Box>
                                ))}
                            </SimpleGrid>

                            <Flex justify="center" mt={4} gap={2}>
                                <Button
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                                    isDisabled={currentPage === 0}
                                >
                                    Anterior
                                </Button>
                                <Text>{currentPage + 1} / {totalPages}</Text>
                                <Button
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
                                    isDisabled={currentPage === totalPages - 1}
                                >
                                    Siguiente
                                </Button>
                            </Flex>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* Historia */}
                    <AccordionItem>
                        <AccordionButton>
                            <Text flex="1" textAlign="left" fontSize="xl" fontWeight="semibold" color="#C89B3C" textShadow="3px 3px 6px rgba(0, 0, 0, 0.8)">
                                Historia
                            </Text>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                            <Text color="gray.300" fontFamily="SpiegelSans-5Regular_TRIAL">{champion.lore}</Text>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* Estadísticas */}
                    <AccordionItem>
                        <AccordionButton>
                            <Text flex="1" textAlign="left" fontSize="xl" fontWeight="semibold" color="#C89B3C" textShadow="3px 3px 6px rgba(0, 0, 0, 0.8)">
                                Estadísticas
                            </Text>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                            <ChampionStats stats={champion.stats} />
                        </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionButton>
                            <Text
                                flex="1"
                                textAlign="left"
                                fontSize="xl"
                                fontWeight="semibold"
                                color="#C89B3C"
                                textShadow="3px 3px 6px rgba(0, 0, 0, 0.8)"
                            >
                                Habilidades
                            </Text>
                            <AccordionIcon />
                        </AccordionButton>

                        <AccordionPanel>
                            {/* Pasiva */}
                            <Box bg="#1c2a39" p={4} borderRadius="lg" mb={6} boxShadow="lg">
                                <Flex align="center" gap={4}>
                                    <Image
                                        src={`https://ddragon.leagueoflegends.com/cdn/14.7.1/img/passive/${champion.passive.image.full}`}
                                        alt={champion.passive.name}
                                        boxSize="64px"
                                        borderRadius="md"
                                    />
                                    <Box>
                                        <Text fontWeight="bold" fontSize="lg" color="yellow.400" fontFamily="SpiegelSans-5Regular_TRIAL">
                                            Pasiva – {champion.passive.name}
                                        </Text>
                                        <Text fontSize="sm" color="gray.300" fontFamily="SpiegelSans-5Regular_TRIAL">
                                            {champion.passive.description}
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>

                            {/* Habilidades activas */}
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                {champion.spells.map((spell: Spell, index: number) => {
                                    const spellKeys = ['Q', 'W', 'E', 'R'];
                                    return (
                                        <Box key={spell.id} bg="#22344a" p={4} borderRadius="lg" boxShadow="md">
                                            <Flex align="center" gap={4} mb={2}>
                                                <Image
                                                    src={`https://ddragon.leagueoflegends.com/cdn/14.7.1/img/spell/${spell.image.full}`}
                                                    alt={spell.name}
                                                    boxSize="48px"
                                                    borderRadius="md"
                                                />
                                                <Box>
                                                    <Text fontWeight="bold" fontSize="md" color="yellow.400" fontFamily="SpiegelSans-5Regular_TRIAL">
                                                        {spellKeys[index]} – {spell.name}
                                                    </Text>
                                                </Box>
                                            </Flex>
                                            <Text fontSize="sm" color="gray.300" fontFamily="SpiegelSans-5Regular_TRIAL">
                                                {spell.description}
                                            </Text>
                                        </Box>
                                    );
                                })}
                            </SimpleGrid>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* Skins */}
                    <AccordionItem>
                        <AccordionButton>
                            <Text flex="1" textAlign="left" fontSize="xl" fontWeight="semibold" color="#C89B3C">
                                Aspectos
                            </Text>
                            <AccordionIcon />
                        </AccordionButton>

                        <AccordionPanel>
                            <Flex align="center" justify="center" position="relative" py={4}>
                                {/* Flecha Izquierda */}
                                <Button
                                    onClick={prevSkin}
                                    position="absolute"
                                    left={0}
                                    bg="transparent"
                                    _hover={{ bg: "rgba(200, 155, 60, 0.2)" }}
                                    _active={{ bg: "rgba(200, 155, 60, 0.4)" }}
                                    color="#C89B3C"
                                    fontSize="2xl"
                                >
                                    ◀
                                </Button>

                                {/* Skin actual */}
                                <Box>
                                    <Image
                                        src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${champion.skins[skinIndex].num}.jpg`}
                                        alt={champion.skins[skinIndex].name}
                                        borderRadius="xl"
                                        boxShadow="xl"
                                        maxW="600px"
                                        maxH="340px"
                                        objectFit="cover"
                                        cursor="pointer"
                                        onClick={() => handleSkinClick(champion.skins[skinIndex])}
                                    />
                                    <Text textAlign="center" mt={2} fontSize="md" color="white" fontFamily="SpiegelSans-5Regular_TRIAL">
                                        {champion.skins[skinIndex].name === 'default' ? champion.name : champion.skins[skinIndex].name}
                                    </Text>
                                </Box>

                                {/* Flecha Derecha */}
                                <Button
                                    onClick={nextSkin}
                                    position="absolute"
                                    right={0}
                                    bg="transparent"
                                    _hover={{ bg: "rgba(200, 155, 60, 0.2)" }}
                                    _active={{ bg: "rgba(200, 155, 60, 0.4)" }}
                                    color="#C89B3C"
                                    fontSize="2xl"
                                >
                                    ▶
                                </Button>
                            </Flex>

                            {/* Modal aquí si lo usas para mostrar el skin en grande */}
                        </AccordionPanel>
                        <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
                            <ModalOverlay />
                            <ModalContent bg="#0a0e12" border="2px solid #C89B3C">
                                <ModalCloseButton color="white" />
                                <ModalBody p={0}>
                                    {champion.skins?.[skinIndex] && (
                                        <Image
                                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${champion.skins[skinIndex].num}.jpg`}
                                            alt={champion.skins[skinIndex].name}
                                        />
                                    )}
                                </ModalBody>
                            </ModalContent>
                        </Modal>
                    </AccordionItem>
                </Accordion>
            </Box>
        </Box>
    );
}
