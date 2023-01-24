import { Fragment, useEffect, useState } from 'react';
import { Row, Col, Table, Card } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const Tx = () => {
	const { hash } = useParams();
	const [transaction, setTransaction] = useState({});
	const [status, setStatus] = useState();

	const nodeCall = async () => {
		let res = await axios.post('http://localhost:5555/hash-search', {
			hash: hash,
		});
		if (res.data[0] === true) {
			setTransaction(res.data[2]);
			setStatus(res.data[3]);
		}
	};

	useEffect(() => {
		nodeCall();
	}, []);

	return (
		<Fragment>
			<Row className='justify-content-center mt-5'>
				<Col lg={6} className='mx-3'>
					<Card>
						<Card.Header className='fs-5 text-center'>
							Transaction Information
						</Card.Header>
						<Card.Body>
							<Table className=''>
								<tbody className=''>
									<tr>
										<td>Hash:</td>
										<td>{transaction.hash}</td>
									</tr>
									<tr>
										<td>Time:</td>
										<td>
											{new Date(
												transaction.timestamp
											).toString()}
										</td>
									</tr>
									<tr>
										<td>To:</td>
										<td>
											<Link
												className='p-0'
												to={`/explorer/address/${transaction.toAddress}`}>
												{transaction.toAddress}
											</Link>
										</td>
									</tr>
									<tr>
										<td>From:</td>
										<td>
											<Link
												className='p-0'
												to={`/explorer/address/${transaction.fromAddress}`}>
												{transaction.fromAddress}
											</Link>
										</td>
									</tr>
									<tr>
										<td>Value:</td>
										<td>
											{(
												transaction.value /
												10 ** 8
											).toFixed(8)}
										</td>
									</tr>
									<tr>
										<td>Fees:</td>
										<td>
											{(
												transaction.fee /
												10 ** 8
											).toFixed(8)}
										</td>
									</tr>
									<tr>
										<td>Status:</td>
										<td>{status}</td>
									</tr>
								</tbody>
							</Table>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Fragment>
	);
};
export default Tx;
