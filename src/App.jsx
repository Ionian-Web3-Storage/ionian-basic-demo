import { Nav } from "./component/Nav";
import { IonianFileUploader } from "./component/IonianFileUploader";
import { FileList } from "./component/FileList";

function App() {
  return (
    <>
      <Nav />
      <IonianFileUploader />
      <FileList className="mt-8" />
    </>
  );
}

export default App;
