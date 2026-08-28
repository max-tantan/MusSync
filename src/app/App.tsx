import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { ReviewsProvider } from './context/ReviewsContext'
import { LibraryProvider } from './context/LibraryContext'
import Nav from './components/Nav'
import HomePage from './pages/HomePage'
import MusicPage from './pages/MusicPage'
import GenreIndexPage from './pages/GenreIndexPage'
import GenrePage from './pages/GenrePage'
import ArtistPage from './pages/ArtistPage'
import LibraryPage from './pages/LibraryPage'
import AboutPage from './pages/AboutPage'
import './App.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__brand">
          Mus<span>Sync</span>
        </p>
        <p className="footer__note">
          Hanya penilaian & ulasan — volume-nya kamu yang atur di tempat lain.
        </p>
        <Link to="/" className="footer__home">
          Beranda
        </Link>
      </div>
    </footer>
  )
}

function App() {
  return (
    <BrowserRouter>
      <LibraryProvider>
        <ReviewsProvider>
          <Nav />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/music/:id" element={<MusicPage />} />
              <Route path="/genre" element={<GenreIndexPage />} />
              <Route path="/genre/:name" element={<GenrePage />} />
              <Route path="/artist/:name" element={<ArtistPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/tentang" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </ReviewsProvider>
      </LibraryProvider>
    </BrowserRouter>
  )
}

export default App