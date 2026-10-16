import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Phone,
  Menu,
  X,
  Wifi,
  CarFront,
  Coffee,
  Star,
  Leaf,
  CalendarDays,
  Users,
  MessageCircle,
  ChevronDown,
  Check,
  Plus,
} from "lucide-react";
import { hotel, rooms, services, gallery, photoNotice, type Room } from "../../shared/hotel";
import { useReviews, useReview, useReservation } from "../queries/hotel";

const nav = [
  ["Inicio", "inicio"],
  ["Habitaciones", "habitaciones"],
  ["Precios", "precios"],
  ["Servicios", "servicios"],
  ["Galería", "galeria"],
  ["Reseñas", "resenas"],
  ["Reservar", "reservar"],
  ["Contacto", "contacto"],
];
const money = (n: number) => "DOP " + new Intl.NumberFormat("en-US").format(n);
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const wa = (text: string) => `https://wa.me/${hotel.whatsapp}?text=${encodeURIComponent(text)}`;
function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}
function Stars({ rating = 5 }: { rating?: number }) {
  return (
    <span className="stars" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={15} fill={n <= Math.round(rating) ? "currentColor" : "none"} />
      ))}
    </span>
  );
}
function Dialog({
  children,
  close,
  label,
}: {
  children: ReactNode;
  close: () => void;
  label: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const els = ref.current?.querySelectorAll<HTMLElement>(
          "button, a, input, select, textarea",
        );
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", listener);
      before?.focus();
    };
  }, [close]);
  return (
    <div className="modal-overlay">
      <dialog
        className="modal"
        open
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        ref={ref}
      >
        <button className="modal-close" onClick={close} aria-label="Cerrar">
          <X />
        </button>
        {children}
      </dialog>
    </div>
  );
}
export default function Home() {
  const [menu, setMenu] = useState(false),
    [category, setCategory] = useState("Todas"),
    [photo, setPhoto] = useState<(typeof gallery)[number] | null>(null),
    [detail, setDetail] = useState<Room | null>(null);
  const [arrival, setArrival] = useState(""),
    [departure, setDeparture] = useState(""),
    [guests, setGuests] = useState(2),
    [room, setRoom] = useState("Por confirmar"),
    [checked, setChecked] = useState(false);
  const [name, setName] = useState(""),
    [contact, setContact] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [saved, setSaved] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false),
    [reviewName, setReviewName] = useState(""),
    [rating, setRating] = useState(5),
    [comment, setComment] = useState(""),
    [reviewPhoto, setReviewPhoto] = useState<string | null>(null),
    [reviewError, setReviewError] = useState(""),
    [reviewSent, setReviewSent] = useState(false),
    [website, setWebsite] = useState("");
  const reviewList = useReviews(),
    reviewMutation = useReview(),
    reservation = useReservation();
  const nights =
    arrival && departure ? Math.round((Date.parse(departure) - Date.parse(arrival)) / 86400000) : 0;
  const summary = `Hola, quisiera solicitar una estadía en ${hotel.name}.\nHabitación: ${rooms.find((r) => r.id === room)?.name || "Por confirmar"}\nEntrada: ${arrival}\nSalida: ${departure}\nHuéspedes: ${guests}\nNombre: ${name || "Por indicar"}\nContacto: ${contact || "Por indicar"}${message ? "\nMensaje: " + message : ""}\nPor favor, confirmen precio y disponibilidad.`;
  function validDates() {
    if (!arrival || !departure || arrival < today() || departure <= arrival) {
      setError("Selecciona una entrada válida y una salida posterior.");
      return false;
    }
    const selected = rooms.find((r) => r.id === room);
    if (selected?.capacity && guests > selected.capacity) {
      setError("El número de huéspedes supera la capacidad de esta habitación.");
      return false;
    }
    setError("");
    return true;
  }
  function queryDates(e: FormEvent) {
    e.preventDefault();
    if (validDates()) {
      setChecked(true);
      document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth" });
    }
  }
  async function submitReservation(e: FormEvent) {
    e.preventDefault();
    if (!validDates()) return;
    setSaved(null);
    try {
      const result = await reservation.mutateAsync({
        name,
        contact,
        room,
        arrival,
        departure,
        guests,
        message,
        website,
      });
      setSaved(result.id);
    } catch {
      setError("No se pudo guardar la solicitud. Intenta nuevamente o consulta por WhatsApp.");
    }
  }
  async function submitReview(e: FormEvent) {
    e.preventDefault();
    setReviewError("");
    try {
      await reviewMutation.mutateAsync({
        name: reviewName,
        rating,
        comment,
        photo: reviewPhoto,
        website,
      });
      setReviewSent(true);
    } catch {
      setReviewError("No se pudo enviar la reseña. Intenta nuevamente.");
    }
  }
  async function uploadPhoto(file?: File) {
    if (!file) {
      setReviewPhoto(null);
      return;
    }
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setReviewError("Usa una foto JPG, PNG o WebP de hasta 5 MB.");
      return;
    }
    setReviewError("");
    try {
      const bmp = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      const factor = Math.min(1, 1000 / Math.max(bmp.width, bmp.height));
      canvas.width = bmp.width * factor;
      canvas.height = bmp.height * factor;
      canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      setReviewPhoto(canvas.toDataURL("image/jpeg", 0.75));
      bmp.close();
    } catch {
      setReviewError("No se pudo leer esta foto.");
    }
  }
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="header">
        <a className="brand" href="#inicio">
          <Leaf size={26} strokeWidth={1} />
          <span>
            Costa Verde<small>APPART’HOTEL · SANTO DOMINGO</small>
          </span>
        </a>
        <nav aria-label="Menú principal" className={menu ? "navigation open" : "navigation"}>
          {nav.map(([label, id]) => (
            <a
              key={id}
              className={id === "reservar" ? "nav-reserve" : ""}
              href={"#" + id}
              onClick={() => setMenu(false)}
            >
              {label}
              {id === "reservar" && <ArrowUpRight size={14} />}
            </a>
          ))}
        </nav>
        <button
          className="menu-toggle"
          aria-label={menu ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      <main id="contenido">
        <section className="hero" id="inicio">
          <img
            className="hero-img"
            src="/images/exterior.webp"
            alt="Exterior con vegetación; fotografía de referencia pendiente de validación"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <Eyebrow>SANTO DOMINGO, REPÚBLICA DOMINICANA</Eyebrow>
            <div className="hero-line" />
            <h1>
              Appart’hotel
              <br />
              <em>Costa Verde</em>
            </h1>
            <p>
              Tu espacio cómodo y acogedor para disfrutar
              <br className="desktop-break" /> de tu estadía en Santo Domingo.
            </p>
            <div className="hero-actions">
              <a className="btn cream" href="#habitaciones">
                Ver habitaciones <ArrowUpRight size={17} />
              </a>
              <a className="btn outline-light" href="#precios">
                Consultar disponibilidad <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="hero-links">
              <a href="#reservar">
                Reservar <ArrowRight size={13} />
              </a>
              <span />
              <a href="#contacto">
                Contactar <ArrowRight size={13} />
              </a>
            </div>
          </div>
          <div className="hero-bottom">
            <span>
              <MapPin size={13} /> Un lugar para sentirte a gusto
            </span>
            <a href="#precios">
              DESCUBRE COSTA VERDE <ChevronDown size={15} />
            </a>
            <span className="hero-photo-label">Foto de referencia</span>
          </div>
        </section>
        <section className="booking-strip container" id="precios">
          <form onSubmit={queryDates}>
            <label>
              <span>
                <CalendarDays size={15} /> ENTRADA
              </span>
              <input
                type="date"
                value={arrival}
                min={today()}
                required
                onChange={(e) => {
                  setArrival(e.target.value);
                  setChecked(false);
                  setSaved(null);
                }}
                aria-label="Fecha de entrada"
              />
            </label>
            <label>
              <span>
                <CalendarDays size={15} /> SALIDA
              </span>
              <input
                type="date"
                value={departure}
                min={arrival || today()}
                required
                onChange={(e) => {
                  setDeparture(e.target.value);
                  setChecked(false);
                  setSaved(null);
                }}
                aria-label="Fecha de salida"
              />
            </label>
            <label>
              <span>
                <Users size={15} /> HUÉSPEDES
              </span>
              <select
                value={guests}
                onChange={(e) => {
                  setGuests(Number(e.target.value));
                  setSaved(null);
                }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1} {i === 0 ? "huésped" : "huéspedes"}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn green">
              Consultar estadía <ArrowUpRight size={18} />
            </button>
          </form>
          <div className="booking-caption">
            <span>
              Desde <strong>{money(hotel.referencePrice)}</strong> por noche
            </span>
            <small>Precio de referencia · Sujeto a confirmación</small>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </section>
        <div className="amenity-strip container">
          <span>
            <Wifi /> Wi-Fi gratis
          </span>
          <span>
            <CarFront /> Estacionamiento gratis
          </span>
          <span>
            <Coffee /> Desayuno de pago
          </span>
          <a href="#resenas">
            <Star size={18} /> <strong>4.1 / 5</strong>
            <span className="muted">· 37 reseñas</span>
          </a>
        </div>
        <section className="intro section container">
          <Eyebrow>BIENVENIDO A COSTA VERDE</Eyebrow>
          <h2>
            Un pequeño refugio.
            <br />
            <em>Una estadía a tu medida.</em>
          </h2>
          <p>
            Hay viajes que se disfrutan más cuando encuentras un lugar donde sentirte cómodo.
            Descubre Appart’hotel Costa Verde, tu espacio acogedor en Santo Domingo.
          </p>
          <a className="text-link" href="#habitaciones">
            Encuentra tu próximo descanso <ArrowUpRight size={18} />
          </a>
          <Leaf className="intro-leaf" size={90} strokeWidth={0.6} />
        </section>
        <section className="section container rooms-section" id="habitaciones">
          <div className="section-heading">
            <div>
              <Eyebrow>DESCANSO, A TU MANERA</Eyebrow>
              <h2>Nuestras habitaciones</h2>
            </div>
            <p>
              Un espacio para tu próxima visita.
              <br />
              Consulta la opción ideal para ti.
            </p>
          </div>
          {rooms.length > 0 ? (
            <div className="room-grid">
              {rooms.map((r) => (
                <article className="room-card" key={r.id}>
                  <img src={r.photo || "/images/habitacion-1.webp"} alt={r.name} loading="lazy" />
                  <h3>{r.name}</h3>
                  <p>
                    {r.price === null ? "Precio por confirmar" : money(r.price) + " por noche"} ·{" "}
                    {r.capacity === null ? "Capacidad por confirmar" : `${r.capacity} huéspedes`}
                  </p>
                  <p>{r.availability || "Disponibilidad por confirmar"}</p>
                  <p>{r.features.join(" · ") || "Características por completar"}</p>
                  <p>{r.services.join(" · ") || "Servicios por completar"}</p>
                  <div className="button-row">
                    <button className="text-link" onClick={() => setDetail(r)}>
                      Ver detalles <Plus size={16} />
                    </button>
                    <a href="#reservar" className="text-link" onClick={() => setRoom(r.id)}>
                      Reservar <ArrowUpRight size={16} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="room-feature">
              <div className="room-image">
                <img
                  src="/images/habitacion-1.webp"
                  alt="Interior de referencia, no corresponde a una categoría de habitación confirmada"
                  loading="lazy"
                />
                <span className="image-note">FOTOGRAFÍA DE REFERENCIA</span>
              </div>
              <div className="room-copy">
                <span className="subtle-number">01 / TU PRÓXIMA ESTADÍA</span>
                <h3>
                  El descanso
                  <br />
                  empieza aquí.
                </h3>
                <p>
                  Cuéntanos las fechas de tu viaje y cuántas personas te acompañan. Te ayudaremos a
                  consultar las opciones del alojamiento.
                </p>
                <div className="room-facts">
                  <span>
                    Habitaciones y capacidad <b>Por confirmar</b>
                  </span>
                  <span>
                    Precio y disponibilidad <b>Consultar</b>
                  </span>
                </div>
                <a className="btn green" href="#reservar">
                  Consultar opciones <ArrowUpRight size={18} />
                </a>
                <small>El catálogo de habitaciones está pendiente de completar.</small>
              </div>
            </div>
          )}
        </section>
        <section className="services-section" id="servicios">
          <div className="container section">
            <div className="section-heading">
              <div>
                <Eyebrow>LO ESENCIAL, BIEN PENSADO</Eyebrow>
                <h2>
                  Detalles que hacen
                  <br />
                  <em>más cómoda tu estadía.</em>
                </h2>
              </div>
              <p>
                Servicios para disfrutar
                <br />
                de tu tiempo en Santo Domingo.
              </p>
            </div>
            <div className="services-grid">
              {services.map((s, i) => {
                const Icon = s.icon === "wifi" ? Wifi : s.icon === "parking" ? CarFront : Coffee;
                return (
                  <article key={s.name}>
                    <span className="service-num">0{i + 1}</span>
                    <Icon size={36} strokeWidth={1} />
                    <h3>{s.name}</h3>
                    <p>{s.text}</p>
                  </article>
                );
              })}
            </div>
            <div className="services-foot">
              <span>¿Necesitas algo más para tu visita?</span>
              <a href="#contacto" className="text-link">
                Hablemos de tu estadía <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>
        <section className="section container gallery-section" id="galeria">
          <div className="section-heading">
            <div>
              <Eyebrow>UNA MIRADA A COSTA VERDE</Eyebrow>
              <h2>Conoce nuestros espacios</h2>
            </div>
            <p>
              Imagínate aquí.
              <br />
              El siguiente viaje empieza con una mirada.
            </p>
          </div>
          <fieldset className="gallery-tabs" aria-label="Filtrar galería">
            {["Todas", "Habitaciones", "Exterior", "Cocina", "Áreas comunes"].map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </fieldset>
          <div className="gallery-grid">
            {gallery
              .filter((p) => category === "Todas" || p.category === category)
              .map((p, i) => (
                <button
                  className={"gallery-photo gallery-item-" + i}
                  key={p.src}
                  onClick={() => setPhoto(p)}
                  aria-label={"Ampliar " + p.title}
                >
                  <img src={p.src} alt={p.title + " — foto de referencia"} loading="lazy" />
                  <span>
                    <small>{p.category}</small>
                    {p.title}
                    <ArrowUpRight size={24} />
                  </span>
                </button>
              ))}
          </div>
          {!gallery.some((p) => category === "Todas" || p.category === category) && (
            <div className="empty-state">
              <Coffee size={32} />
              <h3>Próximamente, más miradas.</h3>
              <p>No hay fotografías de esta categoría todavía.</p>
            </div>
          )}
          <p className="photo-disclaimer">{photoNotice}</p>
        </section>
        <section className="reviews-section" id="resenas">
          <div className="container section review-layout">
            <div className="rating-block">
              <Eyebrow>CALIFICACIONES</Eyebrow>
              <div className="rating-number">
                4.1<small>/ 5</small>
              </div>
              <Stars rating={4.1} />
              <p>37 reseñas</p>
              <small>
                Calificación de referencia proporcionada.
                <br />
                No representa las reseñas de este sitio.
              </small>
              <div className="rating-bars" aria-label="Distribución de estrellas no disponible">
                {[5, 4, 3, 2, 1].map((n) => (
                  <div key={n}>
                    <span>
                      {n} <Star size={11} />
                    </span>
                    <i />
                    <small>—</small>
                  </div>
                ))}
              </div>
              <small>El desglose por estrellas no está disponible.</small>
            </div>
            <div className="reviews-copy">
              <Eyebrow>EXPERIENCIAS QUE IMPORTAN</Eyebrow>
              <h2>
                Lo que dicen
                <br />
                <em>nuestros huéspedes.</em>
              </h2>
              {reviewList.isLoading ? (
                <output>Cargando reseñas…</output>
              ) : reviewList.isError ? (
                <p role="alert">
                  No se pudieron cargar las reseñas.{" "}
                  <button className="text-link" onClick={() => reviewList.refetch()}>
                    Reintentar
                  </button>
                </p>
              ) : reviewList.data?.length ? (
                <div className="published-reviews">
                  {reviewList.data.map((r) => (
                    <article key={r.id}>
                      <Stars rating={r.rating} />
                      <blockquote>“{r.comment}”</blockquote>
                      <b>{r.name}</b>
                      {r.photo && (
                        <img src={r.photo} alt={"Foto compartida por " + r.name} loading="lazy" />
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="review-empty">
                  <span className="quote-mark">“</span>
                  <p>
                    Tu experiencia puede ser la primera
                    <br />
                    historia que compartamos aquí.
                  </p>
                  <small>Las reseñas se publican después de ser revisadas.</small>
                </div>
              )}
              <button
                className="btn green"
                onClick={() => {
                  setReviewOpen(true);
                  setReviewSent(false);
                }}
              >
                Escribir una reseña <ArrowUpRight size={17} />
              </button>
            </div>
          </div>
        </section>
        <section className="reservation-section" id="reservar">
          <div className="container section reserve-layout">
            <div className="reserve-copy">
              <Eyebrow>TU PRÓXIMO VIAJE, MÁS CERCA</Eyebrow>
              <h2>
                Reserva
                <br />
                <em>tu estadía.</em>
              </h2>
              <p>
                Cuéntanos cuándo vienes.
                <br />
                Nos encargamos de ayudarte a consultar tu próximo descanso.
              </p>
              <div className="reference-price">
                <small>PRECIO DE REFERENCIA</small>
                <span>Desde {money(hotel.referencePrice)}</span>
                <p>por noche · Precio final por confirmar</p>
              </div>
              <a className="text-link" href={"tel:" + hotel.phoneLink}>
                <Phone size={17} /> {hotel.phone}
              </a>
            </div>
            <form className="reservation-form" onSubmit={submitReservation}>
              <h3>Diseñemos tu próxima visita</h3>
              <p>Solicitud sin compromiso. No se realizan pagos.</p>
              <label>
                Habitación
                <select
                  value={room}
                  onChange={(e) => {
                    setRoom(e.target.value);
                    setSaved(null);
                  }}
                >
                  <option value="Por confirmar">Consultar opciones · Por confirmar</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label>
                  Entrada
                  <input
                        aria-label="Entrada de la solicitud"
                    required
                    type="date"
                    min={today()}
                    value={arrival}
                    onChange={(e) => {
                      setArrival(e.target.value);
                      setSaved(null);
                    }}
                  />
                </label>
                <label>
                  Salida
                  <input
                        aria-label="Salida de la solicitud"
                    required
                    type="date"
                    min={arrival || today()}
                    value={departure}
                    onChange={(e) => {
                      setDeparture(e.target.value);
                      setSaved(null);
                    }}
                  />
                </label>
                <label>
                  Huéspedes
                  <input
                        aria-label="Número de huéspedes"
                    type="number"
                    min="1"
                    max="99"
                    value={guests}
                    required
                    onChange={(e) => {
                      setGuests(Number(e.target.value));
                      setSaved(null);
                    }}
                  />
                </label>
                <label>
                  Tu nombre
                  <input
                        aria-label="Tu nombre"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Nombre y apellido"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              </div>
              <label>
                Teléfono o correo
                <input
                      aria-label="Teléfono o correo"
                  required
                  minLength={6}
                  maxLength={150}
                  autoComplete="email"
                  placeholder="Para responder a tu solicitud"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </label>
              <label>
                Mensaje <span className="optional">(opcional)</span>
                <textarea
                      aria-label="Mensaje opcional"
                  maxLength={2000}
                  rows={2}
                  placeholder="¿Algo que quieras contarnos?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>
              <input
                className="honeypot"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <div className="request-summary">
                <span>
                  {nights > 0
                    ? `${nights} ${nights === 1 ? "noche" : "noches"} · ${guests} ${guests === 1 ? "huésped" : "huéspedes"}`
                    : "Selecciona tus fechas para ver el resumen"}
                </span>
                <small>
                  {rooms.find((r) => r.id === room)?.name || "Habitación por confirmar"} · Precio y
                  disponibilidad por confirmar
                </small>
                {checked && (
                  <small>
                    Fechas seleccionadas. Consulta al establecimiento para confirmar disponibilidad.
                  </small>
                )}
              </div>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              {saved && (
                <output className="success">
                  <Check size={18} /> Solicitud #{saved} guardada. Pendiente de respuesta del
                  establecimiento; no es una reserva confirmada.
                </output>
              )}
              <div className="reserve-buttons">
                <button className="btn cream" disabled={reservation.isPending}>
                  {reservation.isPending ? "Guardando…" : "Enviar solicitud"}
                  <ArrowUpRight size={18} />
                </button>
                <a
                  className="btn outline-light"
                  href={wa(summary)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    if (!validDates()) e.preventDefault();
                  }}
                >
                  <MessageCircle size={17} /> WhatsApp
                </a>
              </div>
              <small className="form-note">
                El alojamiento debe confirmar tu solicitud. Al enviarla, compartes estos datos para
                que pueda responderte.
              </small>
            </form>
          </div>
        </section>
        <section className="section container contact-section" id="contacto">
          <div className="section-heading">
            <div>
              <Eyebrow>NOS ENCANTARÁ RECIBIRTE</Eyebrow>
              <h2>
                Encuéntranos en
                <br />
                <em>Santo Domingo.</em>
              </h2>
            </div>
            <p>
              Tu próxima estadía
              <br />
              tiene un lugar en el mapa.
            </p>
          </div>
          <div className="contact-layout">
            <div className="contact-details">
              <div>
                <MapPin strokeWidth={1} />
                <h3>Ubicación</h3>
                <p>{hotel.address}</p>
                <small>{hotel.plusCode}</small>
              </div>
              <div>
                <Phone strokeWidth={1} />
                <h3>Conversemos</h3>
                <a className="phone-number" href={"tel:" + hotel.phoneLink}>
                  {hotel.phone}
                </a>
                <div className="contact-links">
                  <a href={"tel:" + hotel.phoneLink}>
                    Llamar <ArrowUpRight size={14} />
                  </a>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={wa("Hola, quisiera información sobre Appart’hotel Costa Verde.")}
                  >
                    WhatsApp <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
              <a className="btn green" href={hotel.maps} target="_blank" rel="noreferrer">
                Cómo llegar <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="map-wrap">
              <iframe
                title="Ubicación de Appart’hotel Costa Verde en Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={
                  "https://maps.google.com/maps?q=" +
                  encodeURIComponent("Appart hotel Costa Verde C. Cuarta 8 Santo Domingo") +
                  "&z=16&output=embed"
                }
              />
              <a className="map-link" href={hotel.maps} target="_blank" rel="noreferrer">
                Abrir en Google Maps <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="container footer-top">
          <a className="brand" href="#inicio">
            <Leaf size={24} strokeWidth={1} />
            <span>
              Costa Verde<small>APPART’HOTEL · SANTO DOMINGO</small>
            </span>
          </a>
          <p>
            Tu espacio cómodo y acogedor.
            <br />
            Tu próximo descanso.
          </p>
          <a className="text-link" href="#reservar">
            Hagamos espacio para tu viaje <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Appart’hotel Costa Verde</span>
          <span>Santo Domingo, República Dominicana</span>
          <a href="#inicio">Volver arriba ↑</a>
        </div>
      </footer>
      <a
        className="floating-wa"
        aria-label="Contactar por WhatsApp"
        href={wa("Hola, quisiera consultar una estadía en Appart’hotel Costa Verde.")}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={24} />
      </a>
      {photo && (
        <Dialog close={() => setPhoto(null)} label="Fotografía de la galería">
          <img className="lightbox-img" src={photo.src} alt={photo.title} />
          <div className="lightbox-caption">
            <h3>{photo.title}</h3>
            <p>{photoNotice}</p>
          </div>
        </Dialog>
      )}
      {detail && (
        <Dialog close={() => setDetail(null)} label={detail.name}>
          <div className="lightbox-caption">
            <h2>{detail.name}</h2>
            <p>{detail.description || "Descripción pendiente de completar."}</p>
            <p>
              {detail.price === null ? "Precio por confirmar" : money(detail.price) + " por noche"}
            </p>
            <p>
              {detail.capacity === null
                ? "Capacidad por confirmar"
                : `${detail.capacity} huéspedes`}
            </p>
            <p>{detail.features.join(" · ") || "Características por confirmar"}</p>
            <p>{detail.services.join(" · ") || "Servicios por confirmar"}</p>
            <p>{detail.availability || "Disponibilidad por confirmar"}</p>
            <a
              className="btn green"
              href="#reservar"
              onClick={() => {
                setRoom(detail.id);
                setDetail(null);
              }}
            >
              Solicitar reserva <ArrowUpRight size={18} />
            </a>
          </div>
        </Dialog>
      )}
      {reviewOpen && (
        <Dialog close={() => setReviewOpen(false)} label="Escribir una reseña">
          <div className="review-dialog">
            <Eyebrow>TU EXPERIENCIA CUENTA</Eyebrow>
            <h2>Comparte tu estadía</h2>
            {reviewSent ? (
              <div className="empty-state">
                <Check size={36} />
                <h3>Gracias por compartir.</h3>
                <p>
                  Tu reseña se guardó y está pendiente de moderación. No se publicará hasta que sea
                  aprobada.
                </p>
                <button className="btn green" onClick={() => setReviewOpen(false)}>
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={submitReview}>
                <label>
                  Nombre
                  <input
                        aria-label="Nombre para la reseña"
                    required
                    minLength={2}
                    maxLength={100}
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                  />
                </label>
                <fieldset>
                  <legend>Calificación</legend>
                  <div className="rating-picker">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        aria-label={`${n} estrellas`}
                        aria-pressed={rating === n}
                        onClick={() => setRating(n)}
                      >
                        <Star fill={n <= rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                    <span>{rating} / 5</span>
                  </div>
                </fieldset>
                <label>
                  Comentario
                  <textarea
                        aria-label="Comentario de la reseña"
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Cuéntanos cómo fue tu experiencia"
                  />
                </label>
                <label>
                  Foto (opcional)
                  <input
                        aria-label="Foto opcional de la reseña"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => uploadPhoto(e.target.files?.[0])}
                  />
                  <small>JPG, PNG o WebP · Máximo 5 MB. Se optimiza antes de enviar.</small>
                </label>
                {reviewPhoto && (
                  <img className="photo-preview" src={reviewPhoto} alt="Vista previa de tu foto" />
                )}
                <input
                  className="honeypot"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  aria-hidden="true"
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <p className="muted">
                  Al enviar, autorizas la publicación de tu nombre, comentario y foto una vez
                  aprobados.
                </p>
                {reviewError && (
                  <p className="error" role="alert">
                    {reviewError}
                  </p>
                )}
                <button className="btn green" disabled={reviewMutation.isPending}>
                  {reviewMutation.isPending ? "Enviando…" : "Enviar para revisión"}
                  <ArrowUpRight size={17} />
                </button>
              </form>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
}
