import { Nav, Image } from 'react-bootstrap';
import logo from '../logo-nobackground-200.png';
import logoRev from '../logo-nobackground-200-rev.png';

export default function Navigation() {
	return (
		<Nav className='mt-2 fs-3 justify-content-center '>
			<Nav.Item>{<Image src={logo} />}</Nav.Item>
			<Nav.Link className='mt-2 text-dark' href='/'>
				Explorer
			</Nav.Link>
			<Nav.Link className='mt-2 text-dark' href='/faucet'>
				Faucet
			</Nav.Link>
			<Nav.Link className='mt-2 text-dark' href='/wallet'>
				Wallet
			</Nav.Link>
			<Nav.Item>{<Image src={logoRev} />}</Nav.Item>
		</Nav>
	);
}
