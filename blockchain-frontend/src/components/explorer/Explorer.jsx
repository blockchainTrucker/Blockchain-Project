import { Fragment, useEffect, useState } from 'react';
import { Form, Row, Col, Table, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Main = () => {
	const [recentBlocks, setRecentBlocks] = useState([]);
	const [searchError, setSearchError] = useState();
	const navigate = useNavigate();
	const search = async (event) => {
		event.preventDefault();
		const input = document.getElementById('chainSearch').value;
		if (/^[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(input)) {
			navigate(`/explorer/address/${input}`);
		} else if (/^[0-9a-fA-F]{64}$/.test(input)) {
			let res = await axios.post('http://localhost:5555/hash-search', {
				hash: input,
			});
			if (res.data[0] === true) {
				if (res.data[1] === 'block') {
					navigate(`/explorer/block/${input}`);
				} else if (res.data[1] === 'tx') {
					navigate(`/explorer/tx/${input}`);
				}
			} else {
				setSearchError('The entered hash was not found');
			}
		} else {
			setSearchError(
				'Please enter a valid SHA-256 hash or wallet address'
			);
		}
	};

	const nodeCall = async () => {
		let res = await axios.get('http://localhost:5555/recent-blocks');
		setRecentBlocks(res.data.reverse());
	};

	useEffect(() => {
		nodeCall();
	}, []);

	const btt = (transactions) => {
		let total = 0;
		for (let i = 0; i < transactions.length; i++) {
			total += parseInt(transactions[i].value);
		}
		return total;
	};

	const fullChain = async () => {
		let res = await axios.get('http://localhost:5555/chain');
		setRecentBlocks(res.data.reverse());
	};

	return (
		<Fragment>
			<Row className='text-center text-danger mt-5'>
				<p>{searchError}</p>
			</Row>
			<Row className='justify-content-center'>
				<Col lg={6}>
					<Form onSubmit={search}>
						<Form.Group>
							<Form.Control
								id='chainSearch'
								className='text-center card'
								type='search'
								placeholder=' Search Transaction/Block Hash or Wallet Address'
							/>
						</Form.Group>
					</Form>
				</Col>
			</Row>
			<Row className='justify-content-center my-5'>
				<Col lg={10}>
					<Card className='card'>
						<h3 className='text-center my-3'>Recent Blocks</h3>
						<Table responsive className='text-center mb-3'>
							<thead>
								<tr>
									<th>Index</th>
									<th>Hash</th>
									<th>Transactions</th>
									<th>Value</th>
									<th>Miner</th>
									<th>Time</th>
								</tr>
							</thead>
							<tbody>
								{recentBlocks.map((item, index) => {
									return (
										<tr key={index}>
											<td>{item.index}</td>
											<td>
												<Link
													to={`/explorer/block/${item.hash}`}>
													{item.hash}
												</Link>
											</td>
											<td>{item.transactions.length}</td>
											<td>{btt(item.transactions)}</td>
											<td>
												<Link
													to={`/explorer/address/${item.miner}`}>
													{item.miner}
												</Link>
											</td>
											<td className='text-nowrap'>
												{new Date(
													item.timestamp
												).toString()}
											</td>
										</tr>
									);
								})}
							</tbody>
						</Table>
						<Row className='justify-content-center'>
							<Col md={3}>
								<Button
									onClick={fullChain}
									type='button'
									className='btn btn-success my-3 mx-auto d-grid gap-2'>
									Show Full Chain
								</Button>
							</Col>
						</Row>
					</Card>
				</Col>
			</Row>
		</Fragment>
	);
};
export default Main;
