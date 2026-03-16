class I18nService {
    constructor(diccionarioPagina) {
        this.diccionario = diccionarioPagina;
    }

    aplicarTraducciones(idIdioma) {
        const textos = this.diccionario[idIdioma];
        if (!textos) return;

        // Busca todos los elementos en el HTML que tengan el atributo data-i18n
        const elementos = document.querySelectorAll('[data-i18n]');
        
        elementos.forEach(elemento => {
            const clave = elemento.getAttribute('data-i18n');
            
            if (textos[clave]) {
                // Si es un input, actualizamos el placeholder
                if (elemento.tagName === 'INPUT' && elemento.hasAttribute('placeholder')) {
                    elemento.placeholder = textos[clave];
                } else {
                    // Si es cualquier otra etiqueta, actualizamos el texto
                    elemento.textContent = textos[clave];
                }
            }
        });
    }
}