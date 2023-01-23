import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Explorer from './components/explorer/Explorer.jsx';
import ExplorerBlock from './components/explorer/Block.jsx';
import ExplorerTx from './components/explorer/Tx.jsx';
import ExplorerWallet from './components/explorer/Wallet.jsx';
import Faucet from './components/Faucet.jsx';

function App() {
	return (
		<Router>
			<Nav />
			<Routes>
				<Route exact path='/' element={<Navigate to='/explorer' />} />
				<Route exact path='/explorer' element={<Explorer />} />
				<Route
					exact
					path='/explorer/block/:hash'
					element={<ExplorerBlock />}
				/>
				<Route
					exact
					path='/explorer/tx/:hash'
					element={<ExplorerTx />}
				/>
				<Route
					exact
					path='/explorer/address/:address'
					element={<ExplorerWallet />}
				/>
				<Route exact path='/faucet' element={<Faucet />} />
			</Routes>
		</Router>
	);
}

export default App;
