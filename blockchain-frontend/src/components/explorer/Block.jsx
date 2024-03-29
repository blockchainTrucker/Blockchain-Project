import { Fragment, useEffect, useState } from 'react';
import { Row, Col, Table, Card } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const Block = () => {
	const { hash } = useParams();
	const [block, setBlock] = useState({ transactions: [] });
	const [blockValue, setBlockValue] = useState();
	const [blockFee, setBlockFee] = useState();

	const nodeCall = async () => {
		let res = await axios.post('http://localhost:5555/hash-search', {
			hash: hash,
		});
		if (res.data[0] === true) {
			setBlock(res.data[2]);
			value(res.data[2].transactions);
			fee(res.data[2].transactions);
		}
	};

	useEffect(() => {
		nodeCall();
	}, []);

	const value = (transactions) => {
		let total = 0;
		for (let i = 0; i < transactions.length; i++) {
			total = total + parseInt(transactions[i].value);
		}
		total = (total / 10 ** 8).toFixed(8);
		setBlockValue(total);
	};

	const fee = (transactions) => {
		let total = 0;
		for (let i = 0; i < transactions.length; i++) {
			total += parseInt(transactions[i].fee);
		}
		total = (total / 10 ** 8).toFixed(8);
		setBlockFee(total);
	};

	return (
		<Fragment>
			<Row className='justify-content-center mt-5'>
				<Col lg={6} className='mx-3'>
					<Card>
						<Card.Header className='fs-5 text-center'>
							Block Information
						</Card.Header>
						<Card.Body>
							<Table>
								<tbody>
									<tr className='mt-3'>
										<td>Hash:</td>
										<td>{block.hash}</td>
									</tr>
									<tr>
										<td>Time:</td>
										<td>
											{new Date(
												block.timestamp
											).toString()}
										</td>
									</tr>
									<tr>
										<td>Value:</td>
										<td>{blockValue}</td>
									</tr>
									<tr>
										<td>Fees:</td>
										<td>{blockFee}</td>
									</tr>
									<tr>
										<td>Miner:</td>
										<td>
											<Link
												className='p-0'
												to={`/explorer/address/${block.miner}`}>
												{block.miner}
											</Link>
										</td>
									</tr>
									<tr>
										<td>Index:</td>
										<td>{block.index}</td>
									</tr>
								</tbody>
							</Table>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<Row className='justify-content-center'>
				<Col lg={6} className='mx-3 mt-5'>
					<Card className='text-center'>
						<Card.Header className='fs-5'>Transactions</Card.Header>
						<Table className='mt-3'>
							<tbody>
								{block.transactions.map((item, index) => {
									return (
										<tr key={index}>
											<td>
												<Link
													to={`/explorer/tx/${item.hash}`}>
													{item.hash}
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
export default Block;
