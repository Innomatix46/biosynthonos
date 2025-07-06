// This file acts as a bridge to the new application structure inside /src.
// It ensures that if the build system resolves to the root App.tsx,
// it will correctly load the main application component from its new location.
import App from './src/App';

export default App;
