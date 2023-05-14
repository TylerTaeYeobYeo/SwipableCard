import { FC } from "react"
import Swipable from "./components/swipable"


export const App: FC = () => {

  return (
    <main>
      <h1>Swipable Cards</h1>
      <Swipable backgroundColors={["red", "orange", "green", "blue"]}/>
      <Swipable backgroundColors={["purple", "indigo"]}/>
    </main>
  )
}

export default App
