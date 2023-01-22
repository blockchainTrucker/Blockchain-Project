import { Fragment, useEffect, useState } from 'react';
import { Form, Row, Col, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Main = () => {
	const [recentBlocks, setRecentBlocks] = useState([]);
	const search = (event) => {
		event.preventDefault();
		const input = document.getElementById('chainSearch').value;
		console.log(input);
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
				<Col lg={5}>
					<Form onSubmit={search}>
						<Form.Group>
							<Form.Control
								id='chainSearch'
								className='text-center'
								type='search'
								placeholder=' Search Transaction/Block Hash or Wallet Address'
							/>
						</Form.Group>
					</Form>
				</Col>
			</Row>
			<Row className='justify-content-center mt-5'>
				<h3 className='text-center'>Recent Blocks</h3>
			</Row>
			<Row>
				<Col lg={12}>
					<Table responsive className='text-center'>
						<thead>
							<tr>
								<th>Index</th>
								<th>Hash</th>
								<th>Total Transactions</th>
								<th>Block Value in MC</th>
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
												to={`/explorer/hash/${item.hash}`}>
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
									</tr>
								);
							})}
						</tbody>
					</Table>
				</Col>
			</Row>
		</Fragment>
	);
};
export default Main;
