import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"

type Interest = "imovel" | "projeto" | "ready_to_live"
type PropertyType = "casa" | "apartamento"
type Budget = "ate_2mi" | "2_a_5mi" | "5_a_10mi" | "acima_10mi"
type ContactPreference = "whatsapp" | "ligacao" | "email"
type Origin = "hero" | "mercado" | "projetos" | "ready_to_live" | "rodape"
type SurveyStep = "interest" | "property" | "budget" | "contact" | "success"

interface SurveyAnswers {
  interest: Interest | null
  propertyType: PropertyType | null
  budget: Budget | null
}

interface SurveyProps {
  origin: Origin
  initialInterest?: Interest | null
  onClose?: () => void
}

const images = {
  hero: "https://images.unsplash.com/photo-1685545047187-93449c73d59b?auto=format&fit=crop&w=2200&q=88",
  portraitSlot: `${import.meta.env.BASE_URL}images/fotofinalAna.jpeg`,
  house:
    "https://images.unsplash.com/photo-1687938627893-e181901fc7e0?auto=format&fit=crop&w=1200&q=84",
  apartment:
    "https://images.unsplash.com/photo-1725610036468-ee58fab023ef?auto=format&fit=crop&w=1200&q=84",
  soon: "https://images.unsplash.com/photo-1563724680425-560215e83057?auto=format&fit=crop&w=1200&q=84",
  project1:
    "https://images.unsplash.com/photo-1601993957728-1e56ab70c5a8?auto=format&fit=crop&w=1200&q=84",
  project2:
    "https://images.unsplash.com/photo-1651342490186-7d3288f567e5?auto=format&fit=crop&w=1200&q=84",
  project3:
    "https://images.unsplash.com/photo-1716467278688-5b7fc38e3ca7?auto=format&fit=crop&w=1200&q=84",
  project4:
    "https://images.unsplash.com/photo-1656952213963-83a4acc8a7fd?auto=format&fit=crop&w=1200&q=84",
  project5:
    "https://images.unsplash.com/photo-1687379307064-d17b97527fee?auto=format&fit=crop&w=1200&q=84",
  project6:
    "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&w=1200&q=84",
  ready:
    "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&w=2200&q=88",
}

const interestLabels: Record<Interest, string> = {
  imovel: "Imóvel",
  projeto: "Projeto",
  ready_to_live: "Ready to Live",
}

const propertyLabels: Record<PropertyType, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
}

const budgetLabels: Record<Budget, string> = {
  ate_2mi: "Até R$ 2 milhões",
  "2_a_5mi": "De R$ 2 a R$ 5 milhões",
  "5_a_10mi": "De R$ 5 a R$ 10 milhões",
  acima_10mi: "Acima de R$ 10 milhões",
}

function focusByArrow(event: KeyboardEvent<HTMLButtonElement>) {
  if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key))
    return
  const group = event.currentTarget.parentElement
  if (!group) return
  const buttons = Array.from(
    group.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
  )
  const index = buttons.indexOf(event.currentTarget)
  const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1
  event.preventDefault()
  buttons[(index + direction + buttons.length) % buttons.length]?.focus()
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="survey-chip">{children}</span>
}

function Survey({ origin, initialInterest = null, onClose }: SurveyProps) {
  const [step, setStep] = useState<SurveyStep>(
    initialInterest === "imovel"
      ? "property"
      : initialInterest
        ? "contact"
        : "interest",
  )
  const [answers, setAnswers] = useState<SurveyAnswers>({
    interest: initialInterest,
    propertyType: null,
    budget: null,
  })
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    preference: "" as ContactPreference | "",
    consent: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const hasMounted = useRef(false)

  useEffect(() => {
    if (hasMounted.current) headingRef.current?.focus()
    hasMounted.current = true
  }, [step])

  const stepNumber =
    answers.interest === "imovel"
      ? { interest: 1, property: 2, budget: 3, contact: 4, success: 4 }[step]
      : { interest: 1, property: 2, budget: 2, contact: 2, success: 2 }[step]
  const total = answers.interest === "imovel" ? 4 : 2

  const chooseInterest = (interest: Interest) => {
    setAnswers({ interest, propertyType: null, budget: null })
    setStep(interest === "imovel" ? "property" : "contact")
  }

  const goBack = () => {
    if (step === "property") setStep("interest")
    if (step === "budget") setStep("property")
    if (step === "contact")
      setStep(answers.interest === "imovel" ? "budget" : "interest")
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 2) return digits ? `(${digits}` : ""
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = "Informe seu nome."
    if (form.phone.replace(/\D/g, "").length !== 11)
      next.phone = "Informe DDD e 9 dígitos."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Informe um e-mail válido."
    if (!form.preference) next.preference = "Escolha uma forma de contato."
    if (!form.consent) next.consent = "O consentimento é necessário."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!validate() || !answers.interest) return
    setLoading(true)
    const payload = {
      interesse: answers.interest,
      tipo_imovel: answers.propertyType,
      faixa_orcamento: answers.budget,
      nome: form.name.trim(),
      telefone: form.phone,
      email: form.email.trim(),
      preferencia_contato: form.preference,
      consentimento: form.consent,
      origem: origin,
      criado_em: new Date().toISOString(),
    }
    window.setTimeout(() => {
      // Ponto único para substituir pelo POST da API.
      console.info("Lead Ana Lubianca (simulação):", payload)
      setLoading(false)
      setStep("success")
    }, 650)
  }

  const formIsValid =
    Boolean(form.name.trim()) &&
    form.phone.replace(/\D/g, "").length === 11 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    Boolean(form.preference) &&
    form.consent

  const finishSurvey = () => {
    if (onClose) {
      onClose()
      return
    }
    setAnswers({ interest: null, propertyType: null, budget: null })
    setForm({
      name: "",
      phone: "",
      email: "",
      preference: "",
      consent: false,
    })
    setErrors({})
    setStep("interest")
  }

  if (step === "success") {
    return (
      <div className="survey-success" aria-live="polite">
        <p className="eyebrow">Enviado com sucesso</p>
        <h2 ref={headingRef} tabIndex={-1}>
          [texto a definir]
        </h2>
        <p>Obrigada, {form.name.split(" ")[0]}. Estas foram suas escolhas:</p>
        <div className="survey-chips">
          <Chip>{answers.interest && interestLabels[answers.interest]}</Chip>
          {answers.propertyType && (
            <Chip>{propertyLabels[answers.propertyType]}</Chip>
          )}
          {answers.budget && <Chip>{budgetLabels[answers.budget]}</Chip>}
          <Chip>{form.preference}</Chip>
        </div>
        <button className="button button-dark" onClick={finishSurvey}>
          Voltar ao site
        </button>
      </div>
    )
  }

  return (
    <div className="survey">
      <div className="survey-topline">
        <span className="eyebrow">Encontre seu caminho</span>
        <span aria-hidden="true">
          {stepNumber}/{total}
        </span>
      </div>
      <div
        className="survey-progress"
        role="progressbar"
        aria-label="Progresso da enquete"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={stepNumber}
      >
        <span style={{ width: `${(stepNumber / total) * 100}%` }} />
      </div>
      {step !== "interest" && (
        <button className="survey-back" type="button" onClick={goBack}>
          ← Voltar
        </button>
      )}
      <div className="survey-chips" aria-label="Escolhas anteriores">
        {answers.interest && <Chip>{interestLabels[answers.interest]}</Chip>}
        {answers.propertyType && (
          <Chip>{propertyLabels[answers.propertyType]}</Chip>
        )}
        {answers.budget && <Chip>{budgetLabels[answers.budget]}</Chip>}
      </div>
      <div aria-live="polite">
        {step === "interest" && (
          <>
            <h2 ref={headingRef} tabIndex={-1}>
              O que você procura?
            </h2>
            <div className="interest-options" role="radiogroup">
              {([
                ["imovel", "Imóvel", images.house],
                ["projeto", "Projeto", images.project1],
                ["ready_to_live", "Ready to Live", images.ready],
              ] as const).map(([value, label, image]) => (
                <button
                  key={value}
                  className="image-option"
                  type="button"
                  role="radio"
                  aria-checked={false}
                  onClick={() => chooseInterest(value)}
                  onKeyDown={focusByArrow}
                  style={{ backgroundImage: `url(${image})` }}
                >
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === "property" && (
          <>
            <h2 ref={headingRef} tabIndex={-1}>
              Que tipo de imóvel?
            </h2>
            <div className="text-options" role="radiogroup">
              {(Object.entries(propertyLabels) as [PropertyType, string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={answers.propertyType === value}
                    className="text-option"
                    onKeyDown={focusByArrow}
                    onClick={() => {
                      setAnswers((current) => ({
                        ...current,
                        propertyType: value,
                      }))
                      setStep("budget")
                    }}
                  >
                    {label}
                    <span aria-hidden="true">→</span>
                  </button>
                ),
              )}
            </div>
          </>
        )}
        {step === "budget" && (
          <>
            <h2 ref={headingRef} tabIndex={-1}>
              Qual a faixa de orçamento?
            </h2>
            <div className="text-options budget-options" role="radiogroup">
              {(Object.entries(budgetLabels) as [Budget, string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={answers.budget === value}
                    className="text-option"
                    onKeyDown={focusByArrow}
                    onClick={() => {
                      setAnswers((current) => ({
                        ...current,
                        budget: value,
                      }))
                      setStep("contact")
                    }}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </>
        )}
        {step === "contact" && (
          <form onSubmit={submit} noValidate>
            <h2 ref={headingRef} tabIndex={-1}>
              Para quem devemos ligar?
            </h2>
            <div className="field-grid">
              <div className="field">
                <label htmlFor={`name-${origin}`}>Nome *</label>
                <input
                  id={`name-${origin}`}
                  autoComplete="name"
                  value={form.name}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? `name-error-${origin}` : undefined
                  }
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
                {errors.name && (
                  <small id={`name-error-${origin}`}>{errors.name}</small>
                )}
              </div>
              <div className="field">
                <label htmlFor={`phone-${origin}`}>Telefone *</label>
                <input
                  id={`phone-${origin}`}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="(00) 00000-0000"
                  value={form.phone}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={
                    errors.phone ? `phone-error-${origin}` : undefined
                  }
                  onChange={(event) =>
                    setForm({ ...form, phone: formatPhone(event.target.value) })
                  }
                />
                {errors.phone && (
                  <small id={`phone-error-${origin}`}>{errors.phone}</small>
                )}
              </div>
              <div className="field field-wide">
                <label htmlFor={`email-${origin}`}>E-mail *</label>
                <input
                  id={`email-${origin}`}
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? `email-error-${origin}` : undefined
                  }
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
                {errors.email && (
                  <small id={`email-error-${origin}`}>{errors.email}</small>
                )}
              </div>
            </div>
            <fieldset className="contact-preference">
              <legend>Como prefere ser contatado? *</legend>
              <div className="choice-row" role="radiogroup">
                {([
                  ["whatsapp", "WhatsApp"],
                  ["ligacao", "Ligação"],
                  ["email", "E-mail"],
                ] as [ContactPreference, string][]).map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name={`preference-${origin}`}
                      checked={form.preference === value}
                      onChange={() => setForm({ ...form, preference: value })}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.preference && <small>{errors.preference}</small>}
            </fieldset>
            <label className="consent">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(event) =>
                  setForm({ ...form, consent: event.target.checked })
                }
              />
              <span>
                Concordo em ser contatado(a) e com o tratamento dos meus dados
                conforme a <a href="#privacidade">Política de Privacidade</a>.
              </span>
            </label>
            {errors.consent && <small>{errors.consent}</small>}
            <button
              className="button button-dark submit-button"
              disabled={loading || !formIsValid}
            >
              {loading ? "Enviando…" : "Enviar"}
            </button>
          </form>
        )}
      </div>
      <p className="survey-note" aria-live="assertive">
        {Object.values(errors)[0] || ""}
      </p>
    </div>
  )
}

function Modal({
  open,
  onClose,
  label,
  children,
  className = "",
}: {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const node = ref.current
    node?.querySelector<HTMLElement>("button, input, a")?.focus()
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key !== "Tab" || !node) return
      const focusable = Array.from(
        node.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.body.classList.add("no-scroll")
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.classList.remove("no-scroll")
      document.removeEventListener("keydown", onKey)
      previous?.focus()
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      className={`modal-backdrop ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="modal-panel" ref={ref}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Fechar janela"
        >
          Fechar
        </button>
        {children}
      </div>
    </div>
  )
}

const menuItems = [
  ["ana", "Ana Lubianca"],
  ["mercado", "Mercado Imobiliário"],
  ["projetos", "Arquitetura · Design · X"],
  ["ready-to-live", "Ready to Live"],
  ["entre", "ENTRE"],
] as const

function App() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("ana")
  const [surveyModal, setSurveyModal] = useState<{
    origin: Origin
    interest?: Interest
    key: number
  } | null>(null)
  const [entreOpen, setEntreOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    const sections = menuItems
      .map(([id]) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (entry) => entry.isIntersecting && setActiveSection(entry.target.id),
        ),
      { rootMargin: "-35% 0px -55%" },
    )
    sections.forEach((section) => observer.observe(section))
    return () => {
      window.removeEventListener("scroll", onScroll)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const previous = document.activeElement as HTMLElement
    const node = menuRef.current
    node?.querySelector<HTMLElement>("button")?.focus()
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
      if (event.key !== "Tab" || !node) return
      const focusable = Array.from(
        node.querySelectorAll<HTMLElement>("button, a[href]"),
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.body.classList.add("no-scroll")
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.classList.remove("no-scroll")
      document.removeEventListener("keydown", onKey)
      previous?.focus()
    }
  }, [menuOpen])

  const openSurvey = (origin: Origin, interest?: Interest) =>
    setSurveyModal({ origin, interest, key: Date.now() })

  const goToSurvey = () => {
    setMenuOpen(false)
    document.getElementById("enquete")?.scrollIntoView({ behavior: "smooth" })
    window.setTimeout(
      () => document.querySelector<HTMLElement>("#enquete button")?.focus(),
      650,
    )
  }

  const navigateMenu = (id: string) => {
    setMenuOpen(false)
    window.setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
      80,
    )
  }

  return (
    <main>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <a className="wordmark" href="#top" aria-label="Ana Lubianca — início">
          ANA LUBIANCA
        </a>
        <div className="header-actions">
          <button className="menu-button" onClick={() => setMenuOpen(true)}>
            Menu
          </button>
          <button className="header-cta" onClick={goToSurvey}>
            Comece aqui
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          className="menu-overlay"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
        >
          <div className="menu-head">
            <span className="wordmark">ANA LUBIANCA</span>
            <button onClick={() => setMenuOpen(false)}>Fechar</button>
          </div>
          <nav aria-label="Navegação principal">
            {menuItems.map(([id, label], index) => (
              <button
                key={id}
                className={activeSection === id ? "active" : ""}
                onClick={() => navigateMenu(id)}
              >
                <span className="menu-index">0{index + 1}</span>
                <span>{label}</span>
                {id === "entre" && (
                  <span className="menu-new">
                    novo
                    <small>
                      Inteligência de Mercado, Território e Comportamento
                    </small>
                  </span>
                )}
              </button>
            ))}
          </nav>
          <p className="menu-foot">Imóveis · Arquitetura · Implantação</p>
        </div>
      )}

      <section id="top" className="hero">
        <img
          src={images.hero}
          alt="Arcos de um interior contemporâneo iluminado"
        />
        <span className="replaceable image-mark">imagem substituível</span>
        <div className="hero-copy">
          <p className="eyebrow">Imóveis · Arquitetura · Implantação</p>
          <h1>[headline a definir]</h1>
          <p>[subtítulo a definir]</p>
        </div>
        <div className="hero-survey" id="enquete">
          <Survey origin="hero" />
        </div>
        <a className="scroll-indicator" href="#ana">
          <span>Rolar</span>
          <i aria-hidden="true" />
        </a>
      </section>

      <section id="ana" className="section about reveal">
        <div className="about-copy">
          <p className="eyebrow">Ana Lubianca</p>
          <h2>Repertório antes de argumento de venda.</h2>
          <span className="tilde">~</span>
          <p className="manifesto">[texto a definir]</p>
          <p className="about-detail">
            Uma visão que conecta decisão imobiliária, arquitetura e experiência
            sensorial.
          </p>
        </div>
        <figure className="about-image image-wrap">
          <img
            src={images.portraitSlot}
            alt="Retrato de Ana Lubianca"
            loading="lazy"
          />
          <figcaption>
            <span>Ana Lubianca</span>
            Imóveis · Arquitetura · Implantação
          </figcaption>
        </figure>
      </section>

      <section id="mercado" className="section market reveal">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 · Curadoria</p>
            <h2>
              Mercado
              <br />
              Imobiliário
            </h2>
          </div>
          <div className="heading-aside">
            <span className="tilde">~</span>
            <p>[texto a definir]</p>
            <button
              className="text-link"
              onClick={() => openSurvey("mercado", "imovel")}
            >
              Quero ver imóveis <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <div className="property-grid">
          {[
            ["Casa", images.house],
            ["Apartamento", images.apartment],
            ["Em breve", images.soon],
          ].map(([label, image], index) => (
            <figure className="property-card image-wrap" key={label}>
              <img
                src={image}
                alt={`Placeholder substituível de ${label.toLowerCase()}`}
                loading="lazy"
              />
              <figcaption>
                <span>0{index + 1}</span>
                {label}
              </figcaption>
              <span className="replaceable">substituível</span>
            </figure>
          ))}
        </div>
      </section>

      <blockquote className="quote-block reveal">
        <span>“</span>
        <p>
          Escrever com quem visita o imóvel junto com o cliente. Sensível ao que
          se sente no espaço, precisa no que se afirma sobre ele.
        </p>
      </blockquote>

      <section id="projetos" className="section projects reveal">
        <div className="section-heading projects-heading">
          <div>
            <p className="eyebrow">02 · Visão integrada</p>
            <h2>
              Arquitetura
              <br />· Design · X
            </h2>
          </div>
          <div className="heading-aside">
            <span className="tilde">~</span>
            <p>
              Uma única leitura, da decisão ao espaço, da matéria à experiência.
            </p>
          </div>
        </div>
        <div className="project-grid" aria-label="Projetos em destaque">
          {[
            ["Projeto 01", "Arquitetura", images.project1],
            ["Projeto 02", "Interiores", images.project2],
            ["Projeto 03", "Design", images.project3],
            ["Projeto 04", "Arquitetura", images.project4],
            ["Projeto 05", "Interiores", images.project5],
            ["Projeto 06", "Design", images.project6],
          ].map(([name, category, image], index) => (
            <figure className={`project-card project-${index + 1}`} key={name}>
              <div className="image-wrap">
                <img
                  src={image}
                  alt={`Placeholder substituível — ${name}, ${category}`}
                  loading="lazy"
                />
                <span className="replaceable">substituível</span>
              </div>
              <figcaption>
                <span>{name}</span>
                <span>{category}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="center-cta">
          <button
            className="button button-outline"
            onClick={() => openSurvey("projetos", "projeto")}
          >
            Quero um projeto
          </button>
        </div>
      </section>

      <section id="ready-to-live" className="ready reveal">
        <img
          src={images.ready}
          alt="Sala mobiliada em tons naturais, imagem substituível"
          loading="lazy"
        />
        <span className="replaceable image-mark">imagem substituível</span>
        <div className="ready-copy">
          <p className="eyebrow">Ambientes completos</p>
          <h2>
            Ready
            <br />
            to Live
          </h2>
          <span className="tilde">~</span>
          <p>[texto a definir]</p>
          <button
            className="button button-light"
            onClick={() => openSurvey("ready_to_live", "ready_to_live")}
          >
            Quero um Ready to Live
          </button>
        </div>
      </section>

      <section id="entre" className="entre reveal">
        <div className="entre-head">
          <div>
            <span className="new-badge">Novo produto</span>
            <h2>ENTRE</h2>
          </div>
          <p>Inteligência de Mercado, Território e Comportamento</p>
        </div>
        <div className="entre-body">
          <p className="entre-opening">ENTRE é onde as coisas acontecem.</p>
          <div className="entre-lines">
            {[
              "Entre dado e decisão.",
              "Entre território e pessoa.",
              "Entre cultura e consumo.",
              "Entre oportunidade e investimento.",
              "Entre o que o mercado mostra e aquilo que ainda não apareceu nos números.",
            ].map((line, index) => (
              <p
                key={line}
                style={{ "--delay": `${index * 90}ms` } as React.CSSProperties}
              >
                {line}
              </p>
            ))}
          </div>
          <button
            className="button button-light"
            onClick={() => setEntreOpen(true)}
          >
            Conhecer o ENTRE
          </button>
        </div>
      </section>

      <section className="final-call reveal">
        <p className="eyebrow">O primeiro passo é uma escolha</p>
        <h2>[texto a definir]</h2>
        <button className="button button-dark" onClick={goToSurvey}>
          Começar pela enquete
        </button>
      </section>

      <footer id="rodape">
        <div className="footer-main">
          <div>
            <span className="footer-wordmark">ANA LUBIANCA</span>
            <p>Imóveis · Arquitetura · Implantação</p>
          </div>
          <address>
            <a href="tel:">[telefone]</a>
            <a href="mailto:">[e-mail]</a>
            <a href="#instagram">[Instagram]</a>
          </address>
          <div className="footer-links">
            <a id="privacidade" href="#privacidade">
              Política de Privacidade
            </a>
            <a href="#termos">Termos</a>
          </div>
          <div className="credentials">
            <span>Selos / credenciais</span>
            <strong>[a definir]</strong>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Ana Lubianca</span>
          <button className="text-link" onClick={() => openSurvey("rodape")}>
            Comece aqui ↑
          </button>
        </div>
      </footer>

      <Modal
        open={Boolean(surveyModal)}
        onClose={() => setSurveyModal(null)}
        label="Enquete de interesse"
        className="survey-modal"
      >
        {surveyModal && (
          <Survey
            key={surveyModal.key}
            origin={surveyModal.origin}
            initialInterest={surveyModal.interest}
            onClose={() => setSurveyModal(null)}
          />
        )}
      </Modal>

      <Modal
        open={entreOpen}
        onClose={() => setEntreOpen(false)}
        label="Quero conhecer o ENTRE"
        className="entre-modal"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setEntreOpen(false)
          }}
        >
          <p className="eyebrow">ENTRE · Lançamento</p>
          <h2>Quero ser avisada(o) do lançamento</h2>
          <div className="field">
            <label htmlFor="entre-email">E-mail *</label>
            <input
              id="entre-email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <label className="consent">
            <input type="checkbox" required />
            <span>
              Concordo com o tratamento dos meus dados conforme a{" "}
              <a href="#privacidade">Política de Privacidade</a>.
            </span>
          </label>
          <button className="button button-dark">Quero ser avisada(o)</button>
        </form>
      </Modal>
    </main>
  )
}

export default App
