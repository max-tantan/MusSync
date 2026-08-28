import './Hero.css'

interface HeroProps {
  albums: number
  reviews: number
  genres: number
}

export default function Hero({ albums, reviews, genres }: HeroProps) {
  return (
    <section className="hero">
      <p className="hero__eyebrow">rating & ulasan · tanpa play</p>
      <h1 className="hero__title">
        Nilai <span className="hero__accent">suaranya.</span>
        <br />
        Lewati keramaiannya.
      </h1>
      <p className="hero__sub">
        MusSync adalah papan skor untuk musik. Lihat, nilai, dan baca ulasan —
        tanpa tombol play. Dengarkan di tempat lain, beri skormu di sini, biar
        orang lain tahu mana yang layak didengar.
      </p>
      <div className="hero__stats">
        <span>
          <strong>{albums}</strong> album
        </span>
        <span>
          <strong>{reviews}</strong> ulasan
        </span>
        <span>
          <strong>{genres}</strong> genre
        </span>
      </div>
    </section>
  )
}