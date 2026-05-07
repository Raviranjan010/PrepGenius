import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage, SignInPage, SignUpPage, Resources } from "./routes";
import { PublicLayout } from "./layouts/public-layout";
import ProtectedRoute from "./layouts/protected-route";
import MainLayout from "./layouts/main-layout";
import { Generate } from "./views/generate";
import { Dashboard } from "./routes/dashboard";
import { CreateEditPage } from "./routes/create-edit-page";
import { MockLoadPage } from "./routes/mock-load-page";
import { MockInterviewPage } from "./routes/mock-interview-page";
import { Feedback } from "./routes/feedback";
import { CodeInterviewPage } from "./routes/code-interview-page";
import { SystemDesignPage } from "./routes/system-design-page";
import { ReplayPage } from "./routes/replay-page";
import { GamificationPage } from "./routes/gamification-page";


export const App = () => {
  return (
    <Router>
      <Routes>
        {/* public routes */}

        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/resources" element={<Resources />} />
        </Route>

        {/* protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/generate" element={<Generate />}>
            <Route index element={<Dashboard />} />
            {/* create route */}
            <Route path=":interviewId" element={<CreateEditPage />} />
            <Route path="interview/:interviewId" element={<MockLoadPage />} />
            <Route
              path="interview/:interviewId/start"
              element={<MockInterviewPage />}
            />
            <Route
              path="interview/:interviewId/code"
              element={<CodeInterviewPage />}
            />
            <Route
              path="interview/:interviewId/design"
              element={<SystemDesignPage />}
            />
            <Route path="feedback/:interviewId" element={<Feedback />} />
            <Route path="replay/:interviewId" element={<ReplayPage />} />
            <Route path="stats" element={<GamificationPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};
