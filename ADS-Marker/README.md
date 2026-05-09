# ADS-Socios

ADS-Socios es una propuesta y arranque tecnico para la web de gamificacion de la asociacion ADS, pensada para crecer sin romper la base. La idea central es usar puntos, medallas y privilegios sin coste economico para convertir la participacion tecnica en progreso visible. Todo parte de CSV locales con los socios, las medallas, el material y los privilegios, sin servicios externos.

## Que incluye esta base

- Sistema de puntos virtuales por asistencia, ayuda, documentacion y retos.
- Niveles con recompensas y privilegios comunitarios.
- Propuesta de arquitectura lista para escalar.
- Recomendacion de HTML + JS con CSV para la parte dinamica.
- Orientacion a GitHub Pages para el frontend estatico.
- Ideas de expansion para QR, Discord, rankings, medallas y carnet digital.

## Sistema propuesto de puntos

- 10 puntos por asistencia verificada a una actividad.
- 20 puntos por completar una practica guiada.
- 30 puntos por ayudar a otra persona o documentar una solucion.
- 50 puntos por liderar una sesion o entregar una mejora util al proyecto.
- Bonos puntuales por retos con QR, hardware, debugging o seguridad.

La clave es que los puntos premien contribucion real, no solo presencia pasiva.

## Niveles y recompensas

- Socio: 0-39 puntos.
- Socio activo: 40-89 puntos.
- Socio referente: 90-149 puntos.
- Socio mentor: 150-239 puntos.
- Socio coordinador: 240+ puntos.

Las recompensas no deben costar dinero. Funcionan mejor si son de acceso, visibilidad y autonomia:

	- Elegir el siguiente reto tecnico.
	- Reservar antes el PC, la RPi o el material de pruebas.
	- Poder proponer una medalla o una mision.
	- Elegir musica o ambientacion de una sesion.
	- Prioridad para presentar proyectos en una demo night.
	- Acceso a canales privados de coordinacion o mentorias.

## Privilegios sin coste economico

La plataforma gana valor cuando recompensa con privilegios sociales y funcionales:

- Aprobacion prioritaria para usar material compartido.
- Turno preferente para sesiones practicas.
- Voto en la hoja de retos del mes.
- Desbloqueo de misiones sorpresa.
- Rol asignado automaticamente por los puntos.
- Mencion destacada en el mural de logros.

## Material de ADS como motor de misiones

El inventario actual permite crear retos muy concretos:

- PC.
- Flipper Zero.
- Tarjeta Wi-Fi para Flipper Zero.
- Tarjetas de desarrollo para Flipper Zero.
- Router, switch y AP.
- RPi4b x2.
- Monitor HDMI.
- Kit de desarrollo electronica para RPi y Arduino.
- 3 nodos Meshtastic.
- 2 antenas extra para Meshtastic.
- Arduino Nanos.
- Webcam.

Ideas de uso:

- Laboratorio de red con router, switch y AP.
- Misiones Meshtastic con medicion de RSSI y SNR.
- Retos de Flipper Zero con tarjetas de desarrollo.
- Practicas con Arduino y RPi para crear misiones cortas y visibles.

## Arquitectura recomendada

La arquitectura ideal es simple al principio y ampliable despues:

1. Frontend en HTML + JS para perfiles, ranking y paneles.
2. CSV local como fuente de verdad para socios, puntos, medallas y roles calculados.
3. Lectura del CSV desde `public/` para que funcione en local y en GitHub Pages.
4. Logica de filtros y calculos en el cliente, sin backend externo.
5. Exportaciones periodicas del CSV para copia de seguridad del historial.

## Tecnologias ideales para GitHub Pages

- HTML + JS.
- Vite.
- CSS moderno con componentes reutilizables.
- GitHub Actions para publicar en Pages.
- CSV local y logica en el cliente.

Esta combinacion encaja porque el frontend puede desplegarse de forma simple y el CSV cubre la parte dinamica sin montar infraestructura extra.

## Expansiones futuras

- QR por actividad o sala para registrar asistencia y medallas.
- Integracion con Discord para anuncios, roles y recordatorios.
- Ranking semanal, mensual y por categorias.
- Sistema de medallas con colecciones tematicas.
- Carnet digital con QR y datos del miembro.
- Prestamo de material con registro automatico de devoluciones.

## Ejemplos de funcionamiento

- Sesion de hardware: se ganan puntos por montar, probar y documentar una configuracion con RPi4, router o switch.
- Reto Meshtastic: suben puntos quienes calibren antenas, comparen RSSI/SNR y dejen una guia reproducible.
- Laboratorio Flipper: misiones con Flipper Zero, tarjetas de desarrollo y tarjetas Wi-Fi para aprender sin coste economico.
- Ayuda entre socios: resolver dudas, revisar codigo o preparar una demo da puntos y desbloquea privilegios.

## Organizacion del proyecto

1. Fundacion: reglas, niveles, login y primera version del ranking.
2. Operacion: QR, logros, carnet digital y panel de administracion.
3. Escala: Discord, exportaciones, analitica y prestamo de material.

## Recomendacion CSV + JS

CSV + JS es la combinacion mas pragmatica para arrancar:

- HTML y JS dejan la web simple y facil de entender.
- El CSV simplifica la gestion y evita dependencias externas.
- Cada socio queda identificado solo por usuario en un formato facil de editar.
- No hay claves, cuentas ni servicios que mantener.
- El historial se puede exportar y revisar manualmente.

## Arranque local

1. Entra en la carpeta del proyecto.
2. Ejecuta `npm install`.
3. Edita `public/members.csv` con los socios, sus puntos y sus medallas.
4. Ejecuta `npm run dev`.

## Formato del CSV

Las columnas esperadas son:

- `usuario`
- `medallas`

El rol no se escribe en el CSV: la app lo calcula a partir de los puntos de medallas o asignandolo automaticamente si tienes una medalla de cargo.

Otros CSV disponibles:

- `public/medals.csv` para las medallas, asistencias a eventos y cargos de junta directiva.
  - Cada medalla tiene un tipo: `normal` (suma puntos), `cargo` (asigna rol automaticamente), o `ex-cargo` (solo historico, sin puntos).
  - Para cargos de junta directiva, hay dos variantes: `P01` (Presidente actual) y `EP01` (Expresidente historico).
  - Ejemplos de cargos: presidente, vicepresidente, tesorero, secretario, vocal.
- `public/material.csv` para el material disponible.
- `public/privileges.csv` para los privilegios que se muestran en la web.

Ejemplo:

```csv
usuario,medallas
ana,"A01;A03;P01"
```

Ejemplo:

```csv
usuario,puntos,info extra,medallas
ana,42,Miembro activo,"A01;A03"
```

## Nota tecnica

El proyecto usa `base: './'` en Vite para que el frontend sea facil de publicar en GitHub Pages desde una ruta de proyecto o una carpeta estatica.