import { Nav } from "./component/Nav";
import { IonianFileUploader } from "./component/IonianFileUploader";
import { FileList } from "./component/FileList";
import { NodeList } from "./component/NodeList";

function App() {
  return (
    <>
      <Nav />
      <IonianFileUploader />
      <FileList className="mt-8" />
      <NodeList />
    </>
  );
}

export default App;
