# Scraping Araucana - 2026-05-11

Fuente principal: https://www.araucana.com.ar/Index.html

## Hallazgos para la demo

- El sitio publica salidas concretas solo para `Servicio Publico 7 Lagos`.
- Los horarios estan en paginas secundarias enlazadas desde `Servicio_Publico_7_Lagos.html`: `Horarios_SMA_TRAFUL.html` y `Horarios_VLA_TRAFUL.html`.
- Las tarifas no estan publicadas: figuran como "Consultar tarifas".
- Los horarios publicados tienen vigencia 2018, asi que sirven para cargar una demo, pero no para operacion real sin validacion telefonica.

## Rutas con salidas

| Ruta | Dias | Sale | Llega | Duracion | Vigencia publicada |
| --- | --- | --- | --- | --- | --- |
| San Martin de los Andes -> Villa Traful | Sabados | 10:00 | 12:15 | 2h 15m | 01/04/2018 al 31/12/2018 |
| Villa Traful -> San Martin de los Andes | Sabados | 15:45 | 18:00 | 2h 15m | 01/04/2018 al 31/12/2018 |
| Villa La Angostura -> Villa Traful | Lunes a viernes | 11:00 | 12:30 | 1h 30m | 05/03/2018 al 31/12/2018 |
| Villa Traful -> Villa La Angostura | Lunes a viernes | 19:05 | 20:35 | 1h 30m | 05/03/2018 al 31/12/2018 |

## Otros servicios cargables

- Traslado San Martin de los Andes -> Aeropuerto Chapelco: salidas regulares, puerta a puerta, horarios sujetos a vuelos, costo a consultar.
- Traslado San Martin de los Andes -> Aeropuerto Bariloche: salidas previamente programadas, puerta a puerta, horarios sujetos a vuelos, costo a consultar.
- Excursiones: Cerro Chapelco, Villa La Angostura y 7 Lagos, Bariloche por 7 Lagos, Pucon Chile, Lanin/Huechulafquen/Paimun, Balcones del Lacar, Villa Quila Quina.
- Flota: minibuses de 14, 15, 19, 22/24 pasajeros y omnibus de 46 pasajeros.

## Archivo estructurado

La data normalizada para cargar esta en:

`docs/araucana-scrape-2026-05-11.json`
