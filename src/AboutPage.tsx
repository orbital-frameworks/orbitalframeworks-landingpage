import orbitalLogo from './assets/Orbital Frameworks (1).png'
import './AboutPage.css'

const people = [
  {
    name: 'Angel Reaño',
    role: 'Producto, operaciones y dirección de proyectos',
    description: 'Coordina la definición de problemas, el alcance de las soluciones y la ejecución de los proyectos de Orbital Frameworks.',
    linkedin: 'https://www.linkedin.com/in/angelreañovasquez/',
  },
  {
    name: 'Mathias Javier Murillo',
    role: 'Desarrollo de software y producto',
    description: 'Desarrollador vinculado a Checkio y Localisa, con trabajo en productos digitales y construcción de software.',
    linkedin: 'https://www.linkedin.com/in/mathias-javier-murillo-744508350/',
  },
]

const projects = [
  {
    name: 'Checkio',
    category: 'Gestión de personal',
    state: 'Producto publicado',
    href: '/casos/checkio/',
  },
  {
    name: 'VetERP',
    category: 'Gestión veterinaria',
    state: 'Producto en pruebas',
    href: '/casos/veterp/',
  },
  {
    name: 'Localisa',
    category: 'Información territorial',
    state: 'Plataforma publicada',
    href: 'https://www.localisa.pe/',
    external: true,
  },
  {
    name: 'PeruLog Pallets',
    category: 'Presencia comercial B2B',
    state: 'Sitio publicado',
    href: 'https://perulogpallets.com.pe/',
    external: true,
  },
]

const capabilities = [
  'Desarrollo de software y productos digitales',
  'Sistemas web y herramientas internas',
  'Landing pages y presencia digital',
  'Automatización de procesos',
  'Mejora y evolución de sistemas existentes',
]

export default function AboutPage() {
  return (
    <div className="aboutPage">
      <header className="aboutNav">
        <a href="/" className="aboutBrand" aria-label="Volver a Orbital Frameworks">
          <img src={orbitalLogo} alt="Orbital Frameworks" />
        </a>
        <nav className="aboutNavActions" aria-label="Navegación institucional">
          <a href="/#proyectos">Proyectos</a>
          <a href="/#como-trabajamos">Método</a>
          <a href="/#contacto">Contacto</a>
        </nav>
      </header>

      <main>
        <section className="aboutHero">
          <div className="aboutHeroGrid" aria-hidden="true" />
          <div className="aboutHeroCopy">
            <div className="aboutEyebrow">Orbital Frameworks / Perú</div>
            <h1>Qué es Orbital Frameworks.</h1>
            <p className="aboutDefinition">
              <strong>Orbital Frameworks es una empresa peruana de desarrollo de software y soluciones digitales.</strong> Construye productos, sistemas web, herramientas internas y experiencias digitales para organizaciones que necesitan resolver problemas concretos de operación, producto o presencia digital.
            </p>
          </div>
          <aside className="aboutIdentityPanel">
            <span>Identidad</span>
            <dl>
              <div>
                <dt>Nombre</dt>
                <dd>Orbital Frameworks</dd>
              </div>
              <div>
                <dt>Base</dt>
                <dd>Perú</dd>
              </div>
              <div>
                <dt>Actividad</dt>
                <dd>Desarrollo de software y soluciones digitales</dd>
              </div>
              <div>
                <dt>Canal oficial</dt>
                <dd><a href="https://www.linkedin.com/company/orbitalframeworks/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className="aboutSection aboutCapabilities">
          <header>
            <div className="aboutSectionLabel">Qué hacemos</div>
            <h2>Capacidades que aparecen en proyectos reales.</h2>
            <p>La oferta pública se limita a trabajos que Orbital puede mostrar o explicar con evidencia verificable.</p>
          </header>
          <div className="aboutCapabilityList">
            {capabilities.map((capability, index) => (
              <div key={capability} className="aboutCapability">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{capability}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="aboutSection aboutProjects">
          <header>
            <div className="aboutSectionLabel">Proyectos públicos</div>
            <h2>Productos y sistemas vinculados a Orbital Frameworks.</h2>
            <p>Estos proyectos permiten revisar trabajo publicado o estados verificables sin recurrir a métricas, testimonios o claims inventados.</p>
          </header>
          <div className="aboutProjectList">
            {projects.map((project, index) => (
              <a
                key={project.name}
                href={project.href}
                target={project.external ? '_blank' : undefined}
                rel={project.external ? 'noopener noreferrer' : undefined}
                className="aboutProject"
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.category}</p>
                </div>
                <strong>{project.state}</strong>
                <span className="aboutProjectArrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>

        <section className="aboutSection aboutMethod">
          <header>
            <div className="aboutSectionLabel">Cómo trabajamos</div>
            <h2>Primero se entiende el problema. Después se decide qué construir.</h2>
          </header>
          <div className="aboutMethodGrid">
            <article>
              <span>01</span>
              <h3>Entender</h3>
              <p>Revisar la situación actual, el flujo que genera fricción y el resultado que tendría valor.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Acotar</h3>
              <p>Definir qué conviene cambiar, qué debe mantenerse y cómo se evaluará el trabajo.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Construir evidencia</h3>
              <p>Diseñar y desarrollar una solución verificable antes de ampliar alcance o complejidad.</p>
            </article>
          </div>
        </section>

        <section className="aboutSection aboutTeam">
          <header>
            <div className="aboutSectionLabel">Equipo</div>
            <h2>Participación directa en producto, desarrollo y operación.</h2>
          </header>
          <div className="aboutTeamGrid">
            {people.map((person, index) => (
              <article key={person.name} className="aboutPerson">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{person.name}</h3>
                <strong>{person.role}</strong>
                <p>{person.description}</p>
                <a href={person.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              </article>
            ))}
          </div>
        </section>

        <section className="aboutCta">
          <div>
            <span>Orbital Frameworks</span>
            <h2>¿Quieres revisar un problema concreto?</h2>
            <p>Describe la situación actual y el resultado que tendría valor. Orbital revisará el contexto antes de recomendar una solución.</p>
          </div>
          <div className="aboutCtaActions">
            <a className="btn btnPrimary" href="mailto:contact.orbitalframeworks@gmail.com?subject=Revisar%20una%20situaci%C3%B3n%20-%20Orbital%20Frameworks">Contactar</a>
            <a className="btn btnGhost" href="/">Volver a la landing</a>
          </div>
        </section>
      </main>
    </div>
  )
}
