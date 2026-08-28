import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ReviewsProvider } from '../contexts/ReviewsContext'
import { LibraryProvider } from '../contexts/LibraryContext'
import { ProfileProvider } from '../contexts/ProfileContext'
import { ArtistFavoritesProvider } from '../contexts/ArtistFavoritesContext'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import HomePage from '../pages/Home/HomePage'
import MusicPage from '../pages/Music/MusicPage'
import GenreIndexPage from '../pages/Genre/GenreIndexPage'
import GenrePage from '../pages/Genre/GenrePage'
import ArtistPage from '../pages/Artist/ArtistPage'
import LibraryPage from '../pages/Library/LibraryPage'
import ProfilePage from '../pages/Profile/ProfilePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <LibraryProvider>
          <ReviewsProvider>
            <ArtistFavoritesProvider>
            <Nav />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/music/:id" element={<MusicPage />} />
                <Route path="/genre" element={<GenreIndexPage />} />
                <Route path="/genre/:name" element={<GenrePage />} />
                <Route path="/artist/:name" element={<ArtistPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </ArtistFavoritesProvider>
          </ReviewsProvider>
        </LibraryProvider>
      </ProfileProvider>
    </BrowserRouter>
  )
}

export default App