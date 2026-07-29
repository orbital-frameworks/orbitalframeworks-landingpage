import './index.css'
import './App.css'

function enhanceNavigation() {
  const toggle = document.querySelector<HTMLButtonElement>('.navToggle')
  const links = document.querySelector<HTMLElement>('.navLinks')

  if (!toggle || !links) return

  const setOpen = (open: boolean) => {
    links.classList.toggle('isOpen', open)
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú')
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true')
  })

  links.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false))
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 860) setOpen(false)
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false)
  })
}

if (import.meta.env.DEV) {
  void import('./client-dev.tsx')
} else {
  enhanceNavigation()
}
