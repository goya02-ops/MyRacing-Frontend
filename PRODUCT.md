# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Corredores de simuladores (usuarios comunes) que se inscriben a carreras y consultan su historial. Los administradores gestionan carreras, usuarios y membresías, pero no son la audiencia primaria. Existen tres roles: común, premium (acceso a carreras y torneos exclusivos) y admin.

## Product Purpose

Centralizar la inscripción a carreras de simuladores y la membresía premium en un solo lugar. Existe para que los corredores se anoten y los admins operen sin depender del desarrollador. Éxito = la herramienta anda sin romperse ni generar soporte.

## Positioning

Sin diferencial competitivo: es una herramienta interna, similar al sitio web de Low Fuel Motorsport. No compite por diseño ni por funcionalidad única.

## Operating Context

Uso mixto sin contexto fijo: inscripción desde PC en casa o desde el celular en cualquier lugar (ej: volviendo a casa). Flujos centrales: registro/login, inscripción a carreras (comunes y premium), pago de membresía con Mercado Pago, consulta de historial y perfil, administración de entidades (carreras, combinaciones, categorías, circuitos, simuladores, usuarios, membresías).

## Capabilities and Constraints

Funcionalidad confirmada: autenticación con JWT + refresh, inscripción a carreras con control de cupo, membresía premium con cobro vía Mercado Pago (sandbox TEST en CI), paneles admin CRUD por entidad, historial de carreras por usuario. UI en español (estado actual, no restricción declarada). Sin requisitos de accesibilidad establecidos. Sin decisiones pendientes registradas.

## Brand Commitments

Solo el nombre MyRacing es identidad intocable. Colores, modo oscuro, tipografías y tono de textos son libres de rediseñar.

## Evidence on Hand

Sin testimonios, analítica, benchmarks ni assets de marca. Ausencias que el trabajo futuro no debe fabricar: no inventar usuarios, métricas, precios ni integraciones no existentes.

## Product Principles

1. Confiabilidad antes que novedad: lo que anda no se rompe por estética.
2. El corredor completa su inscripción sin fricción, en PC o en móvil.
3. Los flujos que mueven plata (membresía, cobro) funcionan siempre.
4. El admin opera solo: nada que requiera tocar código para el día a día.
