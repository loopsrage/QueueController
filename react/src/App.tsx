import reactLogo from './assets/react.svg'
import viteLogo from '../public/vite.svg'
import './App.css'
import {DropzoneElement} from "./components/dropzone/dropzone.tsx";
import type {FileWithPath} from "react-dropzone";

function App() {
    const handleOnDrop = (event: FileWithPath[]) => {
        console.log(event)
    }
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <DropzoneElement onDrop={handleOnDrop}/>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
