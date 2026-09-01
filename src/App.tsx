import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PlayerProvider } from './context/PlayerContext';
import { Home } from './pages/Home';
import { Files } from './pages/Files';
import { Stocks } from './pages/Stocks';
import { Music } from './pages/Music';
import { YouTube } from './pages/YouTube';
import { Repos } from './pages/Repos';
import { Notes } from './pages/Notes';
import { Tasks } from './pages/Tasks';
import { Bookmarks } from './pages/Bookmarks';
import { Weather } from './pages/Weather';
import { Tools } from './pages/Tools';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/files" element={<Files />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/music" element={<Music />} />
            <Route path="/youtube" element={<YouTube />} />
            <Route path="/repos" element={<Repos />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </PlayerProvider>
    </BrowserRouter>
  );
}
