import orbitalLogo from './assets/Orbital Frameworks (1).png'
import './LegalPage.css'

type LegalPageKind = 'privacy' | 'terms'

const CONTACT_EMAIL = 'contact.orbitalframeworks@gmail.com'

function LegalHeader() {
  return (
    <header className="legalNav">
      <a href="/" className="legalBrand" aria-label="Volver a Orbital Frameworks">
        <img src={orbitalLogo} alt="Orbital Frameworks" />
      </a>
      <nav aria-label="Navegación legal">
        <a href="/">Home</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
    </header>
  )
}

function LegalFooter() {
  return (
    <footer className="legalFooter">
      <div>
        <strong>Orbital Frameworks</strong>
        <span>Desarrollo de software y soluciones digitales en Perú.</span>
      </div>
      <nav aria-label="Enlaces legales del footer">
        <a href="/">Home</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
      <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    </footer>
  )
}

function PrivacyPolicy() {
  return (
    <>
      <section className="legalHero">
        <div className="legalEyebrow">Orbital Frameworks / Privacy</div>
        <h1>Política de privacidad</h1>
        <p>
          Esta política explica cómo Orbital Frameworks trata la información utilizada por Orbital Leads,
          incluida su integración autorizada con Google y Gmail.
        </p>
        <div className="legalMeta">
          <span>Responsable: Orbital Frameworks</span>
          <span>Última actualización: 28 de agosto de 2026</span>
        </div>
      </section>

      <section className="legalContent" aria-label="Contenido de la política de privacidad">
        <article>
          <h2>1. Qué es Orbital Leads</h2>
          <p>
            Orbital Leads es una herramienta interna de Orbital Frameworks para investigación comercial,
            gestión de oportunidades y preparación o gestión de comunicaciones empresariales. La integración
            OAuth con Gmail se identifica en Google como Orbital Leads Gmail. No es un servicio público de correo
            ni un sistema de envío automático masivo.
          </p>
        </article>

        <article>
          <h2>2. Uso de Google y Gmail</h2>
          <p>
            La integración con Google y Gmail se utiliza únicamente con una cuenta autorizada de Orbital
            Frameworks. El acceso se limita a las funciones necesarias para operar Orbital Leads y se
            solicita con el menor alcance razonablemente necesario para esas funciones.
          </p>
          <p>Según la función utilizada, Orbital Leads puede acceder a:</p>
          <ul>
            <li>metadata de Gmail necesaria para identificar y reconciliar conversaciones;</li>
            <li>mensajes e hilos cuando sea necesario para detectar respuestas, rebotes o solicitudes de no contacto;</li>
            <li>borradores de Gmail vinculados al flujo de preparación y revisión de comunicaciones.</li>
          </ul>
        </article>

        <article>
          <h2>3. Para qué se utilizan esos datos</h2>
          <p>Los datos de Google se utilizan únicamente para funciones operativas de Orbital Leads, como:</p>
          <ul>
            <li>crear, revisar y gestionar borradores;</li>
            <li>reconciliar el estado de conversaciones empresariales;</li>
            <li>evitar contactos o registros duplicados;</li>
            <li>registrar y respetar opt-outs o solicitudes de no contacto;</li>
            <li>procesar respuestas y errores de entrega, incluidos rebotes;</li>
            <li>mantener el estado operativo necesario para seguimiento y revisión humana;</li>
            <li>efectuar envíos únicamente cuando el propietario autorice expresamente esa acción.</li>
          </ul>
          <p>
            Orbital Leads no realiza envíos automáticos ni contactos sin aprobación humana. La operación
            actual prioriza la preparación, revisión y reconciliación antes de cualquier acción externa.
          </p>
        </article>

        <article>
          <h2>4. Venta, publicidad y transferencias</h2>
          <p>
            Orbital Frameworks no vende datos obtenidos mediante Google APIs y no utiliza esos datos para
            publicidad de terceros, perfiles publicitarios o segmentación comercial ajena a la operación
            autorizada de Orbital Leads.
          </p>
          <p>
            Los datos no se transfieren a terceros salvo cuando sea necesario para operar el servicio,
            mantener infraestructura técnica o cumplir obligaciones aplicables, y siempre sujeto a las
            restricciones que correspondan. Los proveedores necesarios no reciben autorización para usar
            los datos de Google con fines propios incompatibles con esta política.
          </p>
        </article>

        <article>
          <h2>5. Minimización y retención</h2>
          <p>
            Orbital Frameworks aplica un criterio de minimización: se accede y conserva únicamente la
            información necesaria para la función operativa correspondiente. Cuando basta con estados,
            identificadores o metadata, no se requiere conservar contenido adicional del mensaje.
          </p>
          <p>
            No se establece aquí un período universal artificial de retención. La información se mantiene
            solo durante el tiempo necesario para operar el flujo, reconciliar conversaciones, conservar
            evidencia de opt-out, resolver incidencias o cumplir obligaciones aplicables. Cuando deja de
            ser necesaria, debe eliminarse o reducirse de acuerdo con el propósito operativo.
          </p>
        </article>

        <article>
          <h2>6. Seguridad y acceso</h2>
          <p>
            El acceso a Google y Gmail se restringe a cuentas y entornos autorizados de Orbital Frameworks.
            Las credenciales y tokens de acceso se tratan como información sensible y no se publican. La
            herramienta mantiene separación entre preparación, aprobación humana y acciones externas para
            reducir el riesgo de contacto no autorizado.
          </p>
        </article>

        <article>
          <h2>7. Google API Services User Data Policy</h2>
          <p>
            El uso y la transferencia a cualquier otra aplicación de información recibida de Google APIs
            por Orbital Frameworks se adhieren a la Google API Services User Data Policy, incluidos los
            requisitos de Limited Use aplicables.
          </p>
          <p>
            Orbital Frameworks limita el uso de datos de Google a las funciones descritas en esta política
            y no los utiliza para finalidades incompatibles con la autorización concedida.
          </p>
        </article>

        <article>
          <h2>8. Solicitudes de acceso o eliminación</h2>
          <p>
            Para solicitar información sobre el tratamiento de datos, pedir eliminación de datos operativos
            bajo control de Orbital Frameworks o formular una consulta de privacidad, escribe a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Las solicitudes se revisarán según la
            información disponible, el alcance técnico y las obligaciones aplicables.
          </p>
        </article>

        <article>
          <h2>9. Cambios a esta política</h2>
          <p>
            Esta política puede actualizarse cuando cambien las funciones de Orbital Leads, los permisos de
            Google utilizados o las obligaciones aplicables. La versión vigente se publica siempre en esta URL.
          </p>
        </article>
      </section>
    </>
  )
}

function TermsOfUse() {
  return (
    <>
      <section className="legalHero">
        <div className="legalEyebrow">Orbital Frameworks / Terms</div>
        <h1>Términos de uso</h1>
        <p>
          Estos términos describen el uso de Orbital Leads como herramienta interna de Orbital Frameworks
          y las condiciones generales aplicables a su operación.
        </p>
        <div className="legalMeta">
          <span>Operador: Orbital Frameworks</span>
          <span>Última actualización: 28 de agosto de 2026</span>
        </div>
      </section>

      <section className="legalContent" aria-label="Contenido de los términos de uso">
        <article>
          <h2>1. Identificación y alcance</h2>
          <p>
            Orbital Frameworks desarrolla y opera Orbital Leads como una herramienta interna para
            investigación comercial, gestión de oportunidades y preparación o gestión de comunicaciones
            empresariales. La integración OAuth con Gmail se identifica en Google como Orbital Leads Gmail.
            Estos términos no convierten Orbital Leads en un servicio público ofrecido a terceros.
          </p>
        </article>

        <article>
          <h2>2. Uso autorizado</h2>
          <p>
            Orbital Leads debe utilizarse únicamente por personas autorizadas por Orbital Frameworks y para
            finalidades legítimas relacionadas con la operación comercial de la organización. El uso debe
            respetar las reglas internas de revisión humana, privacidad, opt-out y aprobación antes de contacto.
          </p>
        </article>

        <article>
          <h2>3. Comunicaciones empresariales</h2>
          <p>
            La herramienta puede preparar borradores y ayudar a gestionar el estado de conversaciones.
            No autoriza por sí sola envíos automáticos, campañas masivas ni contacto sin aprobación humana.
            Cualquier envío que se habilite debe depender de una autorización expresa del propietario o de
            una persona con autoridad suficiente dentro de Orbital Frameworks.
          </p>
        </article>

        <article>
          <h2>4. Integraciones de terceros</h2>
          <p>
            Orbital Leads puede utilizar servicios de terceros necesarios para su operación, como Google y
            Gmail. El uso de esas integraciones también está sujeto a sus términos, políticas y permisos
            aplicables. Orbital Frameworks no controla la disponibilidad o cambios introducidos por esos servicios.
          </p>
        </article>

        <article>
          <h2>5. Propiedad intelectual</h2>
          <p>
            Salvo que se indique lo contrario, el software, diseño, documentación y materiales propios de
            Orbital Leads y Orbital Frameworks pertenecen a Orbital Frameworks o se utilizan bajo las licencias
            correspondientes. Estos términos no conceden derechos de propiedad sobre esos activos.
          </p>
        </article>

        <article>
          <h2>6. Disponibilidad y cambios</h2>
          <p>
            Orbital Leads es una herramienta operativa en evolución. Sus funciones pueden modificarse,
            suspenderse o limitarse cuando sea necesario por seguridad, mantenimiento, cambios de proveedores,
            ajustes de procesos o decisiones internas de Orbital Frameworks.
          </p>
        </article>

        <article>
          <h2>7. Limitaciones</h2>
          <p>
            Orbital Leads ayuda a organizar información y preparar acciones, pero no sustituye la revisión
            humana ni garantiza resultados comerciales, entregabilidad de correo, disponibilidad permanente
            de servicios externos o aceptación de mensajes por parte de terceros.
          </p>
        </article>

        <article>
          <h2>8. Responsabilidad</h2>
          <p>
            Las decisiones de contacto, aprobación y uso de la información siguen siendo responsabilidad de
            las personas autorizadas de Orbital Frameworks. La herramienta debe operar dentro de sus guardrails
            y no debe utilizarse para eludir opt-outs, permisos, restricciones de proveedores o normas aplicables.
          </p>
        </article>

        <article>
          <h2>9. Cambios a estos términos</h2>
          <p>
            Orbital Frameworks puede actualizar estos términos cuando cambie el funcionamiento de Orbital Leads
            o sus obligaciones. La versión vigente se publica siempre en esta URL.
          </p>
        </article>

        <article>
          <h2>10. Contacto</h2>
          <p>
            Para consultas relacionadas con estos términos o con Orbital Leads, escribe a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </article>
      </section>
    </>
  )
}

export default function LegalPage({ kind }: { kind: LegalPageKind }) {
  return (
    <div className="legalPage">
      <LegalHeader />
      <main>{kind === 'privacy' ? <PrivacyPolicy /> : <TermsOfUse />}</main>
      <LegalFooter />
    </div>
  )
}
