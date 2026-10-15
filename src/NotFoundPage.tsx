import orbitalLogo from './assets/Orbital Frameworks (1).png'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <main className="notFoundShell">
      <div className="notFoundGlow" aria-hidden="true" />
      <header className="notFoundHeader">
        <a href="/" aria-label="Volver a Orbital Frameworks">
          <img className="logoImg" src={orbitalLogo} alt="Orbital Frameworks" width={200} height={20} />
        </a>
      </header>
      <div className="notFoundContent">
        <p className="notFoundCode">404</p>
        <h1 className="notFoundTitle">Página no encontrada</h1>
        <p className="notFoundLead">El recurso solicitado no existe o fue movido.</p>
        <div className="notFoundLinks">
          <a className="btn btnPrimary" href="/">Volver al inicio</a>
          <a className="btn btnGhost" href="/evidencia/">Ver evidencia</a>
          <a className="btn btnGhost" href="/llms.txt">llms.txt</a>
        </div>
      </div>
    </main>
  )
}
