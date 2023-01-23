import { Nav, Image } from 'react-bootstrap';
import logo from '../logo-nobackground-200.png';
import logoRev from '../logo-nobackground-200-rev.png';
import { Link } from 'react-router-dom';

export default function Navigation() {
	return (
		<Nav className='mt-2 fs-3 justify-content-center '>
			<Nav.Item>{<Image src={logo} />}</Nav.Item>
			<Nav.Link as={Link} className='mt-2 text-dark' to='/'>
				Explorer
			</Nav.Link>
			<Nav.Link as={Link} className='mt-2 text-dark' to='/faucet'>
				Faucet
			</Nav.Link>
			<Nav.Link as={Link} className='mt-2 text-dark' to='/wallet'>
				Wallet
			</Nav.Link>
			<Nav.Item>{<Image src={logoRev} />}</Nav.Item>
		</Nav>
	);
}
