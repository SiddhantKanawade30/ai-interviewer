import { useState } from "react";
import "../styles/globals.css";
import Form from "./components/Form";
import Result from "./components/Result";
import InterviewPage from "./components/Interview";
import { Toaster } from "sonner";

export function App() {
  const [page, setPage] = useState<"form" | "interview" | "result">("form");
  return (
    <div>
      {page == "form" && <Form />}
      {page == "interview" && <InterviewPage />}
      {page == "result" && <Result />}
      <Toaster />
    </div>
  );
}

export default App;
