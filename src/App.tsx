/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import WelcomeBanner from './components/sections/WelcomeBanner';
import Hero from './components/sections/Hero';
import DynamicHomeSections from './components/sections/DynamicHomeSections';
import History from './components/sections/History';
import Philanthropy from './components/sections/Philanthropy';
import PastMasters from './components/sections/PastMasters';
import Gallery from './components/sections/Gallery';
import QuestCTA from './components/sections/QuestCTA';
import Library from './components/sections/Library';
import FamilySection from './components/sections/FamilySection';
import Contact from './components/sections/Contact';
import Footer from './components/layout/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import QuestPage from './pages/QuestPage';
import PastMastersPage from './pages/PastMastersPage';
import MasterDetailPage from './pages/MasterDetailPage';
import LibraryPage from './pages/LibraryPage';
import EventsPage from './pages/EventsPage';
import MemberLoginPage from './pages/MemberLoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import CuriositiesPage from './pages/CuriositiesPage';
import InstructionsPage from './pages/InstructionsPage';
import MemberDashboard from './pages/MemberDashboard';
import InstitutionDetailPage from './pages/InstitutionDetailPage';
import SocialActionsPage from './pages/SocialActionsPage';
import { ContentProvider, useContent } from './context/ContentContext';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

function PresenceTracker() {
  useEffect(() => {
    let unsubscribe: () => void;

    const trackPresence = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        
        // Update presence on login/mount
        const updatePresence = async (isOnline: boolean) => {
          try {
            await updateDoc(userRef, {
              isOnline,
              lastSeen: serverTimestamp()
            });
          } catch (e) {
            console.error("Error updating presence:", e);
          }
        };

        updatePresence(true);

        // Update last seen periodically
        const interval = setInterval(() => updatePresence(true), 60000); // every minute

        // Setup visibility change tracking
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            updatePresence(true);
          } else {
            updatePresence(false);
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        unsubscribe = () => {
          clearInterval(interval);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          updatePresence(false);
        };
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
      trackPresence();
    };
  }, []);

  return null;
}

function LandingPage() {
  const { content } = useContent();
  
  return (
    <div className="min-h-screen bg-masonic-dark selection:bg-gold-500/30 selection:text-gold-100">
      <Navbar />
      <main>
        <WelcomeBanner />
        <Hero />
        <DynamicHomeSections />
        <History />
        <Philanthropy />
        <PastMasters />
        <Gallery />
        <QuestCTA />
        <FamilySection />
        <Library />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function MemberRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to="/login-membro" />;

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const masterEmails = ['lojaarcadaalianca34@gmail.com', 'sophiabohn@gmail.com'];
        const isMasterEmail = masterEmails.includes(u.email?.toLowerCase() || '');
        
        let hasDbAdmin = false;
        try {
          const [adminDoc, userDoc] = await Promise.all([
            getDoc(doc(db, 'admins', u.uid)),
            getDoc(doc(db, 'users', u.uid))
          ]);
          
          hasDbAdmin = adminDoc.exists() || 
                       (userDoc.exists() && (userDoc.data()?.role === 'admin' || userDoc.data()?.isAdmin === true));
        } catch (e) {
          console.error("Admin check failed:", e);
        }

        setIsAdmin(isMasterEmail || hasDbAdmin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (!user) return <AdminLogin />;
  if (!isAdmin) return <AdminLogin />; // Show login with error will be handled by the component

  return <>{children}</>;
}

export default function App() {
  return (
    <ContentProvider>
      <BrowserRouter>
        <ScrollToTop />
        <PresenceTracker />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/quero-participar" element={<QuestPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/curiosidades" element={<CuriositiesPage />} />
          <Route path="/instrucoes" element={<InstructionsPage />} />
          <Route path="/galeria-honra" element={<PastMastersPage />} />
          <Route path="/veneravel/:id" element={<MasterDetailPage />} />
          <Route path="/biblioteca" element={<LibraryPage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/login-membro" element={<MemberLoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/area-restrita" element={
            <MemberRoute>
              <MemberDashboard />
            </MemberRoute>
          } />
          <Route path="/biblioteca-restrita" element={<Navigate to="/area-restrita" />} />
          <Route path="/instituicao/:id" element={<InstitutionDetailPage />} />
          <Route path="/acoes-sociais" element={<SocialActionsPage />} />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  );
}

