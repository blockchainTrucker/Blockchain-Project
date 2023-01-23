import { Fragment, useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';

const Faucet = () => {
	const [searchError, setSearchError] = useState();
	const [success, setSuccess] = useState();

	const search = async (event) => {
		event.preventDefault();
		document.getElementById('button').disabled = true;
		const input = document.getElementById('walletInput').value;
		if (/^[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(input)) {
			const res = await axios.post('http://localhost:5555/faucet', {
				address: input,
			});
			if (res.data[0] === true) {
				setSearchError('');
				setSuccess(
					`You have successfully added 1 coin to wallet address ${input}`
				);
			} else {
				if (res.data[1] === 'time limit') {
					setSearchError('Only one request for each wallet an hour');
				} else {
					document.getElementById('button').disabled = false;
					setSearchError('Please enter a valid wallet address');
				}
			}
		} else {
			document.getElementById('button').disabled = false;
			setSearchError('Please enter a valid wallet address');
		}
	};

	return (
		<Fragment>
			<Row className='justify-content-center  mt-5'>
				<Col lg={5}>
					<Form onSubmit={search}>
						<Form.Group className='text-center'>
							<Form.Label className='fs-5'>
								Please enter a valid wallet address. In order to
								protect the blockchain, addresses may only
								request 1 coin per hour.
							</Form.Label>
							<Form.Control
								id='walletInput'
								className='text-center card mt-2'
								type='search'
								placeholder=' Enter Wallet Address'></Form.Control>
							<Row className='text-center text-danger mt-2'>
								<p>{searchError}</p>
							</Row>
							<Button
								id='button'
								type='submit'
								className='btn btn-success'>
								Submit
							</Button>
							<Row className='text-center my-3'>
								<p>{success}</p>
							</Row>
						</Form.Group>
					</Form>
				</Col>
			</Row>
		</Fragment>
	);
};
export default Faucet;
