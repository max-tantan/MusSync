import './AboutPage.css'

export default function AboutPage() {
  return (
    <div className="container about">
      <p className="eyebrow">tentang mus sync</p>
      <h1 className="about__title">Papan skor untuk musik.</h1>

      <div className="about__body">
        <p>
          MusSync bukan tempat mendengarkan. Tidak ada tombol play, tidak ada
          streaming, tidak ada volume yang kamu naikkan. Justru itu tujuannya:
          memisahkan rasa dari keramaian.
        </p>
        <p>
          Di sini musik hanya punya satu tugas — layak dinilai. Kamu lihat
          formnya, baca ulasan orang lain, lalu beri skormu dalam skala 1–5.
          Suara tetap kamu dengar di platform lain; di sini kamu menimbangnya.
        </p>

        <div className="rule">
          <span className="rule__num">01</span>
          <span className="rule__text">
            Satu orang satu suara per album. Tidak ada multi-akun curang.
          </span>
        </div>

        <div className="about__scale">
          <span className="about__scale-label">skala penilaian 1–5</span>
          <div className="rule">
            <span className="rule__num">5</span>
            <span className="rule__text">
              Terbaik — wajib didengar sampai habis.
            </span>
          </div>
          <div className="rule">
            <span className="rule__num">4</span>
            <span className="rule__text">
              Sangat bagus, setengah dari albumnya melekat.
            </span>
          </div>
          <div className="rule">
            <span className="rule__num">3</span>
            <span className="rule__text">
              Lumayan, ada momen tapi ada juga isian.
            </span>
          </div>
          <div className="rule">
            <span className="rule__num">2</span>
            <span className="rule__text">
              Lemah — beberapa lagu layak dilewati.
            </span>
          </div>
          <div className="rule">
            <span className="rule__num">1</span>
            <span className="rule__text">
              Hampir tidak layak disebut musik.
            </span>
          </div>
        </div>

        <p>
          Skor sebuah album adalah rata-rata semua ulasan. Kamu bisa membuka
          detail album untuk melihat sebaran bintangnya sebelum memutuskan buat
          nyetel di tempat lain.
        </p>
      </div>
    </div>
  )
}