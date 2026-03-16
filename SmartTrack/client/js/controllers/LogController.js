document.addEventListener("DOMContentLoaded", () => {
    // 1. Instanciamos el servicio de traducción pasándole SOLO el diccionario de login
    const i18n = new I18nService(Diccionarios.login);
    
    // 2. Obtenemos el idioma del CacheService y lo aplicamos al cargar
    const idiomaActual = CacheService.obtenerIdioma();
    i18n.aplicarTraducciones(idiomaActual);

    // 3. Configuramos el selector de idiomas de la vista
    const langSwitch = document.getElementById("lang-switch");
    if (langSwitch) {
        langSwitch.value = idiomaActual; // Sincroniza el selector con la caché
        
        langSwitch.addEventListener("change", (evento) => {
            const nuevoIdioma = evento.target.value;
            CacheService.guardarIdioma(nuevoIdioma);
            i18n.aplicarTraducciones(nuevoIdioma);
        });
    }
});