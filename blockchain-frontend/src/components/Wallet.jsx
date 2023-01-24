import { Fragment, useState } from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Wallet = () => {
	const [mnemonic, setMnemonic] = useState([]);
	const [address, setAddress] = useState([]);
	const [privateKey, setPrivateKey] = useState([]);
	const [recoverAddress, setRecoverAddress] = useState([]);
	const [recoverKey, setRecoverKey] = useState([]);
	const [sendResponse, setSendResponse] = useState();
	const [sendError, setSendError] = useState();
	const [sendHash, setSendHash] = useState();

	const createWallet = async () => {
		await axios
			.get('http://localhost:5555/create-wallet')
			.then((wallet) => {
				// document.getElementById('button').disabled = true;
				setMnemonic(['Mnemonic Phrase', wallet.data[0]]);
				setPrivateKey(['Private Key', wallet.data[1]]);
				setAddress(['Address', wallet.data[2]]);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const recoverWallet = async (event) => {
		event.preventDefault();
		const input = document.getElementById('input').value;

		await axios
			.post('http://localhost:5555/recover-wallet', {
				mnemonic: input,
			})
			.then((wallet) => {
				// document.getElementById('button').disabled = true;
				setRecoverKey(['Private Key', wallet.data[0]]);
				setRecoverAddress(['Address', wallet.data[1]]);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const sendCoins = async (event) => {
		event.preventDefault();
		// document.getElementById('button').disabled = true;

		let toAddress = document.getElementById('toAddress').value;
		let fromAddress = document.getElementById('fromAddress').value;
		let privateKey = document.getElementById('privateKey').value;
		let value =
			parseFloat(document.getElementById('value').value) * 10 ** 8;

		await axios
			.post('http://localhost:5555/add-transaction', {
				toAddress: toAddress,
				fromAddress: fromAddress,
				privateKey: privateKey,
				value: value,
			})
			.then((res) => {
				console.log(res.data);

				if (res.data[0] === true) {
					setSendResponse(
						`You have successfully sent ${
							value / 10 ** 8
						} coins to ${toAddress}. Your transaction hash is `
					);
					setSendHash(res.data[1]);
				} else {
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<Fragment>
			<Row className='justify-content-center mt-5'>
				<Col lg={6} className='mx-3'>
					<Card>
						<Card.Header className='fs-5 text-center'>
							Create New Wallet
						</Card.Header>
						<Card.Body className='justify-content-center'>
							<p>
								To create a new wallet, click the button below.
								Please write down in the exact order or print
								your mnemonic phrase and put it somewhere nobody
								else can get to. It is the only way to recover
								your wallet if you lose the private key because
								contains all wallet information. Only click the
								button below if you are currently in a private
								setting.
							</p>
							<Button
								id='button'
								onClick={createWallet}
								className='btn btn-success mx-auto d-grid gap-2'>
								Create Wallet
							</Button>
							<div className=' mt-3 text-center'>
								<p className='m-0 fw-bold'>{mnemonic[0]}</p>
								<p>{mnemonic[1]}</p>
							</div>
							<div className=' mt-3 text-center'>
								<p className='m-0 fw-bold'>{privateKey[0]}</p>
								<p>{privateKey[1]}</p>
							</div>{' '}
							<div className=' mt-3 text-center'>
								<p className='m-0 fw-bold'>{address[0]}</p>
								<p>{address[1]}</p>
							</div>
						</Card.Body>
					</Card>
					<Card className='my-5'>
						<Card.Header className='fs-5 text-center'>
							Recover Your Wallet
						</Card.Header>
						<Card.Body className='justify-content-center'>
							<Form onSubmit={recoverWallet}>
								<Form.Group>
									<p>
										To recover your wallet from the mnemonic
										phrase, enter it below and click the
										button. Please ensure you have privacy
										before continuing.
									</p>
									<Form.Control
										id='input'
										className='card mb-3 text-center'
										type='search'></Form.Control>
								</Form.Group>
								<Button
									id='button'
									type='submit'
									className='btn btn-success mx-auto d-grid gap-2'>
									Recover Wallet
								</Button>
							</Form>
							<div className=' mt-3 text-center'>
								<p className='m-0 fw-bold'>{recoverKey[0]}</p>
								<p>{recoverKey[1]}</p>
							</div>
							<div className=' mt-3 text-center'>
								<p className='m-0 fw-bold'>
									{recoverAddress[0]}
								</p>
								<p>{recoverAddress[1]}</p>
							</div>
						</Card.Body>
					</Card>
				</Col>
				<Col lg={5} className='mx-3'>
					<Card>
						<Card.Header className='fs-5 text-center'>
							Send Coins
						</Card.Header>
						<Card.Body className='justify-content-center'>
							<Form onSubmit={sendCoins}>
								<p>
									Enter the required information to send
									coins. All transactions submitted to the
									blockchain are final.
								</p>
								<Form.Group className='text-center mb-3'>
									<Form.Label>To Address</Form.Label>
									<Form.Control
										id='toAddress'
										className='card'
										defaultValue=''
										type='input'></Form.Control>
									<Form.Text>
										Enter the address you are sending coins
										to.
									</Form.Text>
								</Form.Group>
								<Form.Group className='text-center mb-3'>
									<Form.Label>From Address</Form.Label>
									<Form.Control
										id='fromAddress'
										className='card'
										defaultValue=''
										type='input'></Form.Control>
									<Form.Text>
										Enter the address you are sending coins
										from.
									</Form.Text>
								</Form.Group>
								<Form.Group className='text-center mb-3'>
									<Form.Label>Private Key</Form.Label>
									<Form.Control
										id='privateKey'
										className='card'
										defaultValue=''
										type='input'></Form.Control>
									<Form.Text>
										Enter the private key for the address
										you are sending coins from.
									</Form.Text>
								</Form.Group>
								<Form.Group className='text-center mb-3'>
									<Form.Label>Value</Form.Label>
									<Form.Control
										id='value'
										className='card'
										defaultValue=''
										type='input'></Form.Control>
									<Form.Text>
										Enter the amount of coins you would like
										to send.
									</Form.Text>
								</Form.Group>
								<Button
									id='button2'
									type='submit'
									className='btn btn-success mx-auto d-grid gap-2'>
									Send Coins
								</Button>
							</Form>
							<div className=' mt-3 text-break text-center'>
								<p>
									{sendResponse}
									<Link to={`/explorer/tx/${sendHash}`}>
										{sendHash}
									</Link>
								</p>
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Fragment>
	);
};

export default Wallet;
