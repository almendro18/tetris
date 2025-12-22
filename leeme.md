# 🧱 Juego: Bloques y Filas (estilo Tetris)

Este documento define completamente un juego tipo Tetris
basado en **arrastrar y soltar piezas**, diseñado para uso táctil
(tablet) y desarrollo guiado por un agente de IA.

Este README actúa como:
- especificación funcional
- contrato de diseño
- guía de experiencia de usuario
- referencia técnica de alto nivel

Cualquier decisión de implementación
DEBE respetar este documento.


🎯 Objetivo del juego

El objetivo del juego es:

arrastrar piezas desde una zona lateral

soltarlas manualmente en un tablero principal

completar filas horizontales y verticales

eliminar filas completas

mantener el tablero despejado el mayor tiempo posible

No hay límite de tiempo.
No hay caída automática de piezas.
El ritmo lo marca el jugador.

🧠 Enfoque del juego

Este NO es un Tetris clásico.

Diferencias clave:

las piezas no caen solas

el jugador decide dónde y cuándo colocarlas

la interacción principal es drag & drop



El juego prioriza:

planificación

lógica espacial

toma de decisiones

coordinación ojo–mano

👶 Público objetivo


Uso principal: tablet


🧩 Tablero principal
Dimensiones

Tablero rectangular (ej. 15 columnas × 15 filas)

Tamaño de celda grande y táctil

Cuadrícula siempre visible

Estado inicial

Al comenzar una partida:

el tablero ya contiene algunos cuadros rellenos

estos cuadros iniciales:

son fijos

no forman filas ni columnas completas

crean un reto inicial suave

Esto evita empezar siempre desde vacío
y hace cada partida diferente.

🧱 Piezas
Tipos de piezas

Piezas clásicas tipo Tetris:

línea

cuadrado

L

Z

T

Todas visibles claramente

Colores distintos y suaves

Aparición de piezas

Aparecen una o varias piezas disponibles

Las piezas se generan:

de forma aleatoria

sin secuencias imposibles

Siempre debe haber al menos una pieza jugable

🖐 Interacción
Mecánica principal

El jugador toca una pieza disponible

La arrastra sobre el tablero

La suelta en la posición deseada

Reglas de colocación

La pieza:

solo puede colocarse si encaja en la cuadrícula

no puede solaparse con otras piezas

Si se suelta en lugar inválido:

la pieza vuelve a su posición original

sin mensaje de error

No existe rotación compleja obligatoria.


❌ Gestión del error

El error no se muestra explícitamente.

Comportamiento esperado:

colocación inválida → la pieza vuelve suavemente

no hay sonidos negativos

no hay mensajes de “mal”

El sistema corrige sin castigar.

🧹 Eliminación de filas y columnas
Regla básica

Cuando una fila horizontal o columna vertical se completa al 100%:

se elimina automáticamente


Feedback

Al eliminar una fila:

animación exito

sonido positivo

efecto visual claro (pero calmado)

Eliminar varias filas o columnas a la vez:

se permite

genera feedback ligeramente más destacado



🏆 Progresión y puntuación
Puntuación 

números grandes

si se eliminan varias filas/columnas  a la vez, màs puntuacion obtenida

con rankings

Progresión

El reto aumenta de forma suave:

más cuadros iniciales

piezas más variadas

Nunca aumenta la velocidad (no hay tiempo)

🧠 Fin de partida

La partida termina cuando:

no existe ninguna colocación posible

para ninguna de las piezas disponibles

Al finalizar:

mostrar mensaje amable

reforzar el esfuerzo (“¡Buen trabajo!”)

ofrecer:

jugar otra vez

volver al menú

Nunca usar:

“Has perdido”

“Game Over” agresivo

🎨 Diseño visual

Estilo limpio

Cuadrados grandes

Colores diferenciados

Fondo neutro

Animaciones lentas

Evitar:

efectos rápidos

flashes

sobrecarga visual

🔊 Audio

Sonidos suaves al colocar piezas

Sonido positivo al eliminar filas

Música opcional, tranquila

Siempre permitir silenciar.

💾 Estado del juego

Guardado local (opcional)

No es necesario guardar partidas en curso

Puede guardarse:

mejor partida

progreso general

Si el estado falla:
→ empezar partida nueva sin mostrar error.

🧪 Casos límite a contemplar

El jugador arrastra sin soltar

El jugador suelta fuera del tablero

El jugador prueba muchas veces

El jugador abandona a mitad

En todos los casos:
→ experiencia intacta, sin castigo.

🚫 Prohibiciones explícitas

No introducir:

temporizadores

caída automática de piezas

aceleración progresiva

castigos

anuncios

rankings globales

🤖 Instrucciones finales para agentes de IA

Priorizar claridad sobre fidelidad al Tetris clásico

Priorizar control del jugador sobre velocidad

Priorizar calma sobre reto agresivo

Si una decisión genera estrés,
esa decisión es incorrecta.
