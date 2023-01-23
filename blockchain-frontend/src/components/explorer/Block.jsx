import { Fragment, useEffect, useState } from 'react';
import { Form, Row, Col, Table, Card, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Block = () => {
	const { hash } = useParams();
	const [block, setBlock] = useState();

	const nodeCall = async (hash) => {
		let res = await axios.post('http://localhost:5555/hash-search', {
			hash: hash,
		});
		setBlock(res.data[2]);
	};

	useEffect(() => {
		nodeCall(hash);
	}, []);

	return (
		<Fragment>
			<h2>{block.miner}</h2>
		</Fragment>
	);
};
export default Block;
