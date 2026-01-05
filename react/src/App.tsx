import reactLogo from './assets/react.svg'
import viteLogo from '../public/vite.svg'
import './App'
import type {FileWithPath} from "react-dropzone";
import {fileListenerUploadFileUploadPost} from "./apis/client";
import {DropzoneElement} from "./components/dropzone/dropzone.tsx";

async function handleFileUpload(selectedFile: File) {
    try {
        const response = await fileListenerUploadFileUploadPost({
            body: {
                // Replace 'file' with the actual field name required by your API schema
                file: selectedFile,
                // Any other fields required by FileListenerUploadFileUploadPostData
                // description: "User profile picture",
            },
            // Optional: set to true if you want it to throw on HTTP errors (e.g., 400, 500)
            throwOnError: true
        });

        console.log('Upload successful:', response.data);
    } catch (error) {
        console.error('Upload failed:', error);
    }
}

function App() {
    const handleOnDrop = async (acceptedFiles: FileWithPath[]) => {
        const promises: any[] = []
        acceptedFiles.forEach((f) => {
            promises.push(handleFileUpload(f))
        })

        try {
            const [user, posts] = await Promise.all(promises)
            console.log(user, posts);
        } catch (error) {
            // Executes if ANY promise fails
            console.error("One or more requests failed", error);
        }

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
