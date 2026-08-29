import orbitalLogo from './assets/Orbital Frameworks (1).png'
import './LegalPage.css'

export default function OAuthAppPage() {
  return (
    <div className="legalPage">
      <header className="legalNav">
        <a href="/" className="legalBrand" aria-label="Orbital Frameworks">
          <img src={orbitalLogo} alt="Orbital Frameworks" />
        </a>
        <nav className="legalNavLinks" aria-label="Navegación de Orbital Leads Gmail">
          <a href="/">Orbital Frameworks</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </header>

      <main className="legalMain">
        <section className="legalHero">
          <div className="legalEyebrow">Aplicación OAuth interna / Orbital Frameworks</div>
          <h1>Orbital Leads Gmail</h1>
          <p>
            Orbital Leads Gmail es la integración OAuth con Gmail de Orbital Leads, una herramienta interna
            de Orbital Frameworks para investigación comercial, gestión de oportunidades y preparación o
            gestión de comunicaciones empresariales.
          </p>
          <div className="legalMeta">
            <span>Operador: Orbital Frameworks</span>
            <span>Uso: interno y autorizado</span>
          </div>
        </section>

        <section className="legalContent" aria-label="Información de Orbital Leads Gmail">
          <article>
            <h2>Qué hace la aplicación</h2>
            <p>
              La aplicación conecta una cuenta autorizada de Orbital Frameworks con Gmail para preparar y
              gestionar borradores, reconciliar conversaciones empresariales, detectar respuestas, rebotes
              y solicitudes de no contacto, y mantener el estado operativo necesario para revisión humana.
            </p>
          </article>

          <article>
            <h2>Cómo se utiliza Gmail</h2>
            <p>
              Orbital Leads Gmail solicita acceso únicamente a las funciones de Gmail necesarias para leer
              conversaciones relevantes y crear o gestionar borradores. Cualquier envío que se habilite se
              realiza mediante un flujo gobernado y requiere autorización expresa del propietario.
            </p>
          </article>

          <article>
            <h2>Control humano</h2>
            <p>
              Orbital Leads no realiza envíos automáticos ni contactos sin aprobación humana. La integración
              se utiliza para apoyar una operación interna de Orbital Frameworks, no como servicio público de correo.
            </p>
          </article>

          <article>
            <h2>Privacidad y condiciones</h2>
            <p>
              El tratamiento de datos y las condiciones aplicables a esta integración se describen en los
              documentos públicos enlazados a continuación.
            </p>
            <p>
              <a href="/privacy">Política de privacidad</a>{' · '}
              <a href="/terms">Términos de uso</a>
            </p>
          </article>

          <article>
            <h2>Contacto</h2>
            <p>
              Para consultas sobre Orbital Leads Gmail o su uso de Google APIs, escribe a{' '}
              <a href="mailto:contact.orbitalframeworks@gmail.com">contact.orbitalframeworks@gmail.com</a>.
            </p>
          </article>
        </section>
      </main>

      <footer className="legalFooter">
        <a href="/">Home</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="mailto:contact.orbitalframeworks@gmail.com">contact.orbitalframeworks@gmail.com</a>
      </footer>
    </div>
  )
}
