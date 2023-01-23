import { Fragment, useEffect, useState } from 'react';
import { Row, Col, Table, Card } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const Wallet = () => {
	const { address } = useParams();
	const [activity, setActivity] = useState([]);
	const [balance, setBalance] = useState((0).toFixed(8));
	const nodeCall = async () => {
		let balance = await axios.post('http://localhost:5555/wallet-balance', {
			address: address,
		});
		setBalance((balance.data / 10 ** 8).toFixed(8));

		let walletActivity = await axios.post(
			'http://localhost:5555/wallet-activity',
			{ address: address }
		);
		setActivity(walletActivity.data);
	};

	useEffect(() => {
		nodeCall();
	}, []);

	return (
		<Fragment>
			<Row className='justify-content-center mt-5'>
				<Col lg={4} className='mx-3'>
					<Card>
						<Card.Header className='fs-5 text-center'>
							Wallet Information
						</Card.Header>
						<Card.Body>
							<Table className=''>
								<tbody className=''>
									<tr>
										<td>Address:</td>
										<td>{address}</td>
									</tr>
									<tr>
										<td>Balance:</td>
										<td>{balance}</td>
									</tr>
								</tbody>
							</Table>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<Row className='justify-content-center mt-5'>
				<Col lg={10} className='mx-3'>
					<Card>
						<Card.Header className='fs-5 text-center'>
							Activity
						</Card.Header>
						<Card.Body>
							<Table responsive className='text-center'>
								<thead>
									<tr>
										<td>Tx Hash</td>
										<td>To</td>
										<td>From</td>
										<td>Value</td>
										<td>Time</td>
									</tr>
								</thead>
								<tbody>
									{activity.map((item, index) => {
										return (
											<tr key={index}>
												<td>
													<Link
														to={`/explorer/tx/${item.hash}`}>
														{item.hash}
													</Link>
												</td>
												<td>{item.toAddress}</td>
												<td className='text-nowrap'>
													{item.fromAddress ||
														'Miner Reward'}
												</td>
												<td>
													{(
														item.value /
														10 ** 8
													).toFixed(8)}
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
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Fragment>
	);
};
export default Wallet;
