import { Nav } from "./component/Nav";
import { IonianFileUploader } from "./component/IonianFileUploader";
import { FileList } from "./component/FileList";
import { NodeList } from "./component/NodeList";
import * as Toast from "@radix-ui/react-toast";

function App() {
  return (
    <Toast.Provider>
      <Nav />
      <IonianFileUploader />
      <FileList className="mt-8" />
      <NodeList />
      <Toast.Viewport className="absolute top-10% right-0" />
    </Toast.Provider>
  );
}

export default App;
