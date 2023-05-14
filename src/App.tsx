import { FC } from "react"
import "./App.css"
import Swipable from "./components/swipable"


export const App: FC = () => {

  return (
    <main className="app">
      <h1>Swipable Cards</h1>
      <Swipable backgroundColors={["red", "orange", "green", "blue"]}/>
      <Swipable backgroundColors={["purple", "indigo"]}/>
    </main>
  )
}

export default App
