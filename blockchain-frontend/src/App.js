import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Main from './components/Main.jsx';
import Nav from './components/Nav.jsx';

function App() {
	return (
		<Router>
			<Nav />
			<Routes>
				<Route exact path='/' element={<Main />} />
			</Routes>
		</Router>
	);
}

export default App;
