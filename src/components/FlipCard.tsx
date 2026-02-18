'use client';

import { Box, Text, Image, VStack } from '@chakra-ui/react';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Champion } from '@/app/types/champions';
import Link from 'next/link';

const MotionBox = motion(Box);

export default function FlipCard({ champ }: { champ: Champion }) {
    console.log(champ)
    const [hovered, setHovered] = useState(false);

    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    const roleIcons = {
        Assassin: "🗡️",
        Fighter: "⚔️",
        Tank: "🛡️",
        Mage: "✨",
        Marksman: "🏹",
        Support: "👐",
    };

    const renderRoles = (roles) => (
        <>
            {roles.map((role) => (
                <Text key={role} fontSize="sm" color="gray.400">
                    {roleIcons[role] || ""} {role || ""}
                </Text>
            ))}
        </>
    );

    console.log('Rendering FlipCard for:', champ.name);

    return (
        <Link href={`/champion/${champ.id}`} passHref>
            <Box
                maxWidth="308px"
                cursor="pointer"
                width="308px"
                height="560px"
                perspective="1000px"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <MotionBox
                    animate={{
                        opacity: isInView ? 1 : 0,
                        y: isInView ? 0 : 50,
                        rotateY: hovered ? 180 : 0,
                    }}
                    transition={{ duration: 0.6 }}
                    initial={{ opacity: 0, y: 50 }}
                    style={{
                        width: '100%',
                        height: '100%',
                        transformStyle: 'preserve-3d',
                        position: 'relative',
                    }}
                    ref={ref}
                >
                    {/* Front */}
                    <Box
                        position="absolute"
                        width="100%"
                        height="100%"
                        top={0}
                        left={0}
                        boxSizing="border-box"
                        borderRadius="md"
                        overflow="hidden"
                        sx={{ backfaceVisibility: 'hidden' }}
                        zIndex={2}
                    >
                        {/* Imagen del campeón más pequeña y centrada */}
                        <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`}
                            alt={champ.name}
                            objectFit="cover"
                            position="absolute"
                            top="5%"
                            left="11%"
                            width="78%"
                            height="88%"
                            zIndex={1}
                            borderRadius="56px"
                        />
                        {/* Overlay del borde PNG, ocupa todo el contenedor */}
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
                        <Box
                            position="absolute"
                            bottom="60px"
                            left="16px"
                            right="16px"
                            p={2}
                            textAlign="center"
                            zIndex={3}
                        >
                            <Text
                                as="h1"
                                fontSize="xl"
                                fontWeight="bold"
                                color="yellow.400"
                                textShadow="3px 3px 6px rgba(0, 0, 0, 0.8)"
                            >
                                {champ.name}
                            </Text>
                        </Box>
                    </Box>
                    {/* Back */}
                    <Box
                        position="absolute"
                        width="100%"
                        height="100%"
                        top={0}
                        left={0}
                        boxSizing="border-box"
                        borderRadius="md"
                        overflow="hidden"
                        sx={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                        zIndex={1}
                    >
                        {/* Imagen del campeón más pequeña y centrada */}
                        <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`}
                            alt={champ.name}
                            objectFit="cover"
                            position="absolute"
                            top="5%"
                            left="11%"
                            width="78%"
                            height="88%"
                            zIndex={1}
                            borderRadius="56px"
                            filter="brightness(0.4)"
                        />
                        {/* Overlay del borde PNG, ocupa todo el contenedor */}
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
                        {/* Contenido */}
                        <Box
                            position="absolute"
                            bottom="200px"
                            left="16px"
                            right="16px"
                            p={9}
                            textAlign="center"
                            zIndex={3}
                        >
                            <Text fontSize="2xl" fontWeight="bold" color="yellow.400" mb={2}>
                                {champ.name}
                            </Text>
                            <Text fontSize="md" color="gray.300" fontStyle="italic" mb={2}>
                                {champ.title.charAt(0).toUpperCase() + champ.title.slice(1)}
                            </Text>
                            {renderRoles(champ.tags)}
                        </Box>
                    </Box>
                </MotionBox >
            </Box >
        </Link>
    );
}