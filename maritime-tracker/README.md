# Maritime Team Tracker 🚢

Aplicación local para ver dónde está cada miembro del equipo.

## Cómo funciona

- El servidor corre en **un solo PC** (el de la oficina, o el tuyo)
- Los compañeros se conectan desde su navegador con la IP que aparece al arrancar
- Cada persona selecciona "Yo soy..." y pulsa a dónde va antes de salir
- Cuando alguien llega a la oficina, abre la app y ve el estado de todos

## Instalación (solo una vez)

1. Instalar Python desde https://www.python.org/downloads/
   - ⚠️ Marcar **"Add Python to PATH"** durante la instalación
2. Doble clic en **INICIAR.bat** — instala Flask automáticamente la primera vez

## Uso diario

1. Doble clic en **INICIAR.bat** en el PC de la oficina
2. La consola mostrará algo como:
   ```
   Este PC   -> http://localhost:5000
   Otros PCs -> http://192.168.1.XX:5000
   ```
3. Los compañeros abren esa URL en su navegador
4. Cada uno selecciona su nombre en "Yo soy..."
5. Para moverse: clic en la ubicación en el panel izquierdo

## Personalización

- **Mi perfil** (botón arriba): cambiar nombre, emoji y color
- **+ Ubicación**: añadir nuevos barcos u otras ubicaciones
- **Arrastrar en el mapa**: reposicionar cualquier ubicación

## Estructura de archivos

```
maritime-tracker/
├── INICIAR.bat       ← doble clic para arrancar
├── server.py         ← servidor Flask
├── static/
│   └── index.html    ← interfaz web
└── data/
    └── state.json    ← estado guardado automáticamente
```

El archivo `data/state.json` guarda todo el estado.
Si quieres resetear, bórralo y reinicia el servidor.
