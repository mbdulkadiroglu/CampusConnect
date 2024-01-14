import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import Register from "./pages/Register";
import VerificationPage from "./pages/Verify";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AuthNavBar from "./components/AuthNavBar";
import Sale from "./pages/Sale";
import LostAndFound from "./pages/LostAndFound";
import Donation from "./pages/Donation";
import Borrow from "./pages/Borrow";
import FlatDormMate from "./pages/FlatDormMate";
import Messages from "./pages/Messages";
import ProductPage from "./pages/ProductPage";
import ForgotPassword from "./pages/ForgotPassword";
import FeedbackPage from "./pages/Feedback";
import AdminNavBar from "./admin/AdminNavBar";
import AdminSeePosts from "./admin/AdminSeePosts";
import AdminSeeUsers from "./admin/AdminSeeUsers";
import AdminViewFeedbacks from "./admin/AdminViewFeedbacks";
import { useAuthContext } from "./hooks/useAuthContext";
import ProfilePage from './pages/Profile';
import Settings from './pages/Settings';
import Publish from "./pages/Pubish";

function App() {
  const { user } = useAuthContext();
  return (
    <Router>
      <ConditionalNavBar />
      <Routes>
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/sale" />}
        />

        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/sale" />}
        />

        {/* Default Home Page eklenecek */}
        <Route path="/" element={!user ? <Login /> : <Navigate to="/sale" />} />
        <Route path="/verify/:token" Component={VerificationPage} />

        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />

        <Route
          path="/sale"
          element={user ? <Sale /> : <Navigate to="/login" />}
        />

        <Route
          path="/donation"
          element={user ? <Donation /> : <Navigate to="/login" />}
        />

        <Route
          path="/lostandfound"
          element={user ? <LostAndFound /> : <Navigate to="/login" />}
        />

        <Route
          path="/flatdormmate"
          element={user ? <FlatDormMate /> : <Navigate to="/login" />}
        />

        <Route
          path="/borrow"
          element={user ? <Borrow /> : <Navigate to="/login" />}
        />

        <Route
          path="/messages"
          element={user ? <Messages /> : <Navigate to="/login" />}
        />

        <Route
          path="/forgotpassword"
          element={!user ? <ForgotPassword /> : <Navigate to="/login" />}
        />

        <Route
          path="/product/:productId"
          element={user ? <ProductPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/publish"
          element={user ? <Publish /> : <Navigate to="/login" />}
        />

        <Route
          path="/profile/feedback"
          element={user ? <FeedbackPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin/seeusers"
          element={user ? <AdminSeeUsers /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin"
          element={user ? <AdminSeeUsers /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/seeposts"
          element={user ? <AdminSeePosts /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/viewfeedbacks"
          element={user ? <AdminViewFeedbacks /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={user ? <Settings /> : <Navigate to="/profile" />}
        />
      </Routes>
    </Router>
  );
}

function ConditionalNavBar() {
  const location = useLocation();
  if (
    location.pathname === "/register" ||
    location.pathname === "/login" ||
    location.pathname === "/" ||
    location.pathname === "/forgotpassword" ||
    location.pathname.split("/").includes("verify")
  ) {
    return <NavBar />;
  } else if (location.pathname.startsWith("/admin")) {
    return <AdminNavBar />;
  }
  return <AuthNavBar />;
}

export default App;
