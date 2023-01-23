import { Fragment, useEffect, useState } from 'react';
import { Form, Row, Col, Table, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Main = () => {
	const [recentBlocks, setRecentBlocks] = useState([]);
	const [searchError, setSearchError] = useState();

	const search = (event) => {
		event.preventDefault();
		const input = document.getElementById('chainSearch').value;
		console.log(input);
		if (/^[1-9A-HJ-NP-Za-km-z]{27,35}$/.test(input)) {
			//address
			console.log(true);
		} else if (/^[0-9a-fA-F]{64}$/.test(input)) {
			//tx or block
			console.log(true);
		} else {
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
			total += transactions[i].value;
		}
		return total;
	};

	return (
		<Fragment>
			<Row className='justify-content-center mt-5'>
				<p>{searchError}</p>
			</Row>
			<Row className='justify-content-center'>
				<Col lg={5}>
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
					<Card classname='card'>
						<h3 className='text-center my-3'>Recent Blocks</h3>
						<Table responsive className='text-center'>
							<thead>
								<tr>
									<th>Index</th>
									<th>Hash</th>
									<th>Transactions</th>
									<th>Value</th>
									<th>Time</th>
									<th>Miner</th>
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
											<td className='text-nowrap'>
												{new Date(
													item.timestamp
												).toString()}
											</td>
											<td>
												<Link
													to={`/explorer/address/${item.miner}`}>
													{item.miner}
												</Link>
											</td>
										</tr>
									);
								})}
							</tbody>
						</Table>
					</Card>
				</Col>
			</Row>
		</Fragment>
	);
};
export default Main;
