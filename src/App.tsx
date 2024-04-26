import Container from "@/components/Container";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {

  return (
    <ThemeProvider>
      <ModeToggle />
      <Container />
    </ThemeProvider>
  )
}
