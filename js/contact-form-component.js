/**
 * Contact Form Component - Reutilizable en todas las páginas
 * Para usar: Agrega <div id="contact-form-container"></div> donde quieras el formulario
 */

function renderContactForm() {
    const container = document.getElementById('contact-form-container');

    if (!container) return;

    const formHTML = `
        <section class="py-20 bg-gradient-to-br from-gray-50 to-white">
            <div class="container mx-auto px-4 lg:px-8">
                <div class="max-w-4xl mx-auto">
                    <!-- Header -->
                    <div class="text-center mb-12">
                        <h2 class="font-heading font-bold text-3xl md:text-4xl text-ocampo-black mb-4">
                            Solicita tu <span class="text-ocampo-red">Cotización</span>
                        </h2>
                        <p class="text-gray-600 text-lg">
                            Completa el formulario y te contactaremos en menos de 24 horas
                        </p>
                    </div>

                    <!-- Contact Grid -->
                    <div class="grid lg:grid-cols-3 gap-8 mb-12">
                        <!-- Contact Info Cards -->
                        <div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div class="bg-ocampo-red/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <svg class="w-6 h-6 text-ocampo-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                            </div>
                            <div class="text-gray-400 text-sm mb-1">Teléfono</div>
                            <a href="tel:+56928553089" class="text-ocampo-black font-semibold hover:text-ocampo-red transition-colors">
                                +56 9 2855 3089
                            </a>
                        </div>

                        <div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div class="bg-ocampo-red/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <svg class="w-6 h-6 text-ocampo-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <div class="text-gray-400 text-sm mb-1">Email</div>
                            <a href="mailto:contacto@ocampo.cl" class="text-ocampo-black font-semibold hover:text-ocampo-red transition-colors">
                                contacto@ocampo.cl
                            </a>
                        </div>

                        <div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div class="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </div>
                            <div class="text-gray-400 text-sm mb-1">WhatsApp</div>
                            <a href="https://wa.me/56928553089" target="_blank" class="text-ocampo-black font-semibold hover:text-green-600 transition-colors">
                                Chatear ahora
                            </a>
                        </div>
                    </div>

                    <!-- Contact Form -->
                    <div class="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                        <form id="contact-form" class="space-y-6">
                            <div class="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label for="nombre" class="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                                    <input type="text" id="nombre" name="nombre" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocampo-red focus:border-transparent transition-all"
                                        placeholder="Tu nombre">
                                </div>
                                <div>
                                    <label for="empresa" class="block text-sm font-semibold text-gray-700 mb-2">Empresa</label>
                                    <input type="text" id="empresa" name="empresa"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocampo-red focus:border-transparent transition-all"
                                        placeholder="Nombre de tu empresa">
                                </div>
                            </div>

                            <div class="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                    <input type="email" id="email" name="email" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocampo-red focus:border-transparent transition-all"
                                        placeholder="tu@email.com">
                                </div>
                                <div>
                                    <label for="telefono" class="block text-sm font-semibold text-gray-700 mb-2">Teléfono *</label>
                                    <input type="tel" id="telefono" name="telefono" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocampo-red focus:border-transparent transition-all"
                                        placeholder="+56 9 1234 5678">
                                </div>
                            </div>

                            <div>
                                <label for="servicio" class="block text-sm font-semibold text-gray-700 mb-2">Servicio de Interés *</label>
                                <select id="servicio" name="servicio" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocampo-red focus:border-transparent transition-all">
                                    <option value="">Selecciona un servicio</option>
                                    <option value="Demoliciones">Demoliciones de Pequeña y Gran Envergadura</option>
                                    <option value="Estructuras Metálicas">Demolición de Estructuras Metálicas</option>
                                    <option value="Movimiento de Tierra">Movimientos de Tierra y Excavación</option>
                                    <option value="Corte Diamantado">Cortes con Hilo y Disco Diamantado</option>
                                    <option value="Retiro de Asbesto">Gestión y Retiro de Asbesto</option>
                                    <option value="Cierres Perimetrales">Cierres Perimetrales</option>
                                    <option value="Otro">Otro servicio</option>
                                </select>
                            </div>

                            <div>
                                <label for="mensaje" class="block text-sm font-semibold text-gray-700 mb-2">Descripción del Proyecto *</label>
                                <textarea id="mensaje" name="mensaje" rows="5" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocampo-red focus:border-transparent transition-all resize-none"
                                    placeholder="Cuéntanos sobre tu proyecto: ubicación, tamaño, plazos estimados, etc."></textarea>
                            </div>

                            <button type="submit"
                                class="w-full bg-ocampo-red hover:bg-ocampo-red-dark text-white font-heading font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
                                Enviar Solicitud de Cotización
                            </button>

                            <p class="text-sm text-gray-500 text-center">
                                Al enviar este formulario, aceptas que nos contactemos contigo para entregarte una cotización personalizada.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    `;

    container.innerHTML = formHTML;
}

// Auto-render cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderContactForm);
} else {
    renderContactForm();
}
